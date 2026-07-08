#!/usr/bin/env node

import path from "node:path"
import { pathToFileURL } from "node:url"
import { parse } from "node-html-parser"

const DEFAULT_HEADERS = {
  accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.1",
  "user-agent": "paultibbetts.uk-webmention-discover/1.0"
}

export async function discoverWebmentionEndpoint(targetUrl, { fetchImpl = globalThis.fetch } = {}) {
  if (!fetchImpl) {
    throw new Error("fetch is not available in this Node.js runtime")
  }

  const canonicalTargetUrl = toAbsoluteUrl(targetUrl)
  let response

  try {
    response = await fetchImpl(canonicalTargetUrl, {
      headers: DEFAULT_HEADERS,
      redirect: "follow"
    })
  } catch (error) {
    throw new Error(`Failed to fetch ${canonicalTargetUrl}: ${formatFetchError(error)}`)
  }

  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${canonicalTargetUrl}: ${response.status} ${response.statusText}`
    )
  }

  const responseUrl = toAbsoluteUrl(response.url || canonicalTargetUrl)
  const linkHeader = response.headers.get("link")
  const endpointFromHeader = extractEndpointFromLinkHeader(linkHeader, responseUrl)

  if (endpointFromHeader) {
    return endpointFromHeader
  }

  const html = await response.text()
  const endpointFromHtml = extractEndpointFromHtml(html, responseUrl)

  if (endpointFromHtml) {
    return endpointFromHtml
  }

  return null
}

function printUsage() {
  console.log(`
Usage:
  node scripts/webmention-discover.mjs <target-url>

Example:
  node scripts/webmention-discover.mjs https://example.com/post
`)
}

export async function main(argv = process.argv.slice(2), { stdout = console.log } = {}) {
  const [targetUrl] = argv

  if (!targetUrl || targetUrl === "--help" || targetUrl === "-h") {
    printUsage()
    process.exitCode = targetUrl ? 0 : 1
    return
  }

  if (argv.length > 1) {
    throw new Error("Expected exactly one target URL")
  }

  const endpoint = await discoverWebmentionEndpoint(targetUrl)

  if (!endpoint) {
    throw new Error(`No webmention endpoint found for ${targetUrl}`)
  }

  stdout(endpoint)
}

function extractEndpointFromHtml(html, baseUrl) {
  const root = parse(html)
  const candidates = [...root.querySelectorAll("link"), ...root.querySelectorAll("a")]

  for (const candidate of candidates) {
    const rel = candidate.getAttribute("rel")
    const href = candidate.getAttribute("href")

    if (!hasWebmentionRel(rel) || !href) {
      continue
    }

    return resolveUrl(href, baseUrl)
  }

  return null
}

function extractEndpointFromLinkHeader(headerValue, baseUrl) {
  if (!headerValue) {
    return null
  }

  for (const item of splitHeaderValues(headerValue)) {
    const parsed = parseLinkHeaderValue(item)

    if (!parsed || !hasWebmentionRel(parsed.params.rel)) {
      continue
    }

    return resolveUrl(parsed.url, baseUrl)
  }

  return null
}

function splitHeaderValues(value) {
  const entries = []
  let current = ""
  let inAngle = false
  let inQuotes = false

  for (const char of value) {
    if (char === '"' && !inAngle) {
      inQuotes = !inQuotes
    }

    if (char === "<" && !inQuotes) {
      inAngle = true
    } else if (char === ">" && !inQuotes) {
      inAngle = false
    }

    if (char === "," && !inAngle && !inQuotes) {
      pushTrimmed(entries, current)
      current = ""
      continue
    }

    current += char
  }

  pushTrimmed(entries, current)
  return entries
}

function parseLinkHeaderValue(value) {
  const trimmed = value.trim()
  const urlMatch = trimmed.match(/^<([^>]+)>(.*)$/)

  if (!urlMatch) {
    return null
  }

  const [, url, paramString] = urlMatch
  const params = {}

  for (const param of paramString.split(";")) {
    const trimmedParam = param.trim()

    if (!trimmedParam) {
      continue
    }

    const [key, ...valueParts] = trimmedParam.split("=")
    const rawValue = valueParts.join("=")

    if (!key || !rawValue) {
      continue
    }

    params[key.toLowerCase()] = stripQuotes(rawValue.trim())
  }

  return { params, url }
}

function hasWebmentionRel(rel) {
  if (!rel) {
    return false
  }

  return rel
    .split(/\s+/)
    .map((token) => token.trim().toLowerCase())
    .includes("webmention")
}

function resolveUrl(value, baseUrl) {
  return new URL(value, baseUrl).href
}

function toAbsoluteUrl(value) {
  return new URL(value).href
}

function stripQuotes(value) {
  return value.replace(/^"|"$/g, "")
}

function pushTrimmed(values, value) {
  const trimmed = value.trim()

  if (trimmed) {
    values.push(trimmed)
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
