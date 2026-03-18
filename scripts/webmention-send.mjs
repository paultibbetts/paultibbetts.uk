#!/usr/bin/env node

import path from "node:path"
import { pathToFileURL } from "node:url"
import { discoverWebmentionEndpoint } from "./webmention-discover.mjs"

const DEFAULT_HEADERS = {
  accept: "application/json,text/plain;q=0.9,*/*;q=0.1",
  "content-type": "application/x-www-form-urlencoded",
  "user-agent": "paultibbetts.uk-webmention-send/1.0"
}

export async function sendWebmention(
  sourceUrl,
  targetUrl,
  { discoverEndpoint = discoverWebmentionEndpoint, fetchImpl = globalThis.fetch } = {}
) {
  if (!fetchImpl) {
    throw new Error("fetch is not available in this Node.js runtime")
  }

  const source = toAbsoluteUrl(sourceUrl)
  const target = toAbsoluteUrl(targetUrl)
  const endpoint = await discoverEndpoint(target)

  if (!endpoint) {
    throw new Error(`No webmention endpoint found for ${target}`)
  }

  const body = new URLSearchParams({ source, target }).toString()
  let response

  try {
    response = await fetchImpl(endpoint, {
      body,
      headers: DEFAULT_HEADERS,
      method: "POST",
      redirect: "follow"
    })
  } catch (error) {
    throw new Error(`Failed to send webmention to ${endpoint}: ${formatFetchError(error)}`)
  }

  if (!response.ok) {
    const responseText = await safeReadResponseText(response)
    const responseSuffix = responseText ? `\n${responseText}` : ""

    throw new Error(
      `Webmention endpoint rejected ${source} -> ${target}: ${response.status} ${response.statusText}${responseSuffix}`
    )
  }

  return {
    endpoint,
    source,
    status: response.status,
    statusText: response.statusText,
    target
  }
}

function printUsage() {
  console.log(`
Usage:
  node scripts/webmention-send.mjs <source-url> <target-url>

Example:
  node scripts/webmention-send.mjs https://paultibbetts.uk/posts/my-post https://example.com/post
`)
}

export async function main(argv = process.argv.slice(2), { stdout = console.log } = {}) {
  const [sourceUrl, targetUrl] = argv

  if (!sourceUrl || sourceUrl === "--help" || sourceUrl === "-h") {
    printUsage()
    process.exitCode = sourceUrl ? 0 : 1
    return
  }

  if (!targetUrl) {
    printUsage()
    process.exitCode = 1
    return
  }

  if (argv.length > 2) {
    throw new Error("Expected exactly two arguments: <source-url> <target-url>")
  }

  const result = await sendWebmention(sourceUrl, targetUrl)
  stdout(`Sent webmention via ${result.endpoint}`)
}

function toAbsoluteUrl(value) {
  return new URL(value).href
}

async function safeReadResponseText(response) {
  try {
    const text = await response.text()
    return text.trim()
  } catch {
    return ""
  }
}

function formatFetchError(error) {
  if (!error) {
    return "unknown error"
  }

  if (error.cause?.code && error.cause?.message) {
    return `${error.cause.code} ${error.cause.message}`
  }

  if (error.cause?.message) {
    return error.cause.message
  }

  return error.message || String(error)
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : ""

if (import.meta.url === invokedPath) {
  main().catch((err) => {
    console.error(err.message)
    process.exit(1)
  })
}
