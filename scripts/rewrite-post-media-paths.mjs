#!/usr/bin/env node

import fs from "node:fs/promises"
import path from "node:path"
import { pathToFileURL } from "node:url"
import {
  hasHelpFlag,
  MEDIA_PATH_VALUE_OPTIONS,
  mediaPathOptionDefaults,
  parseCliArgs
} from "./lib/media-cli.mjs"
import { loadDefaultEnv } from "./lib/load-env.mjs"
import {
  buildPostImageManifest,
  createReplacementMap,
  DEFAULT_MEDIA_PUBLIC_ROOT,
  DEFAULT_MEDIA_REMOTE_ROOT,
  rewriteImageShortcodes
} from "./lib/post-media.mjs"
import { populateImageMetadata } from "./lib/image-metadata.mjs"

function printUsage() {
  console.log(`
Usage:
  node scripts/rewrite-post-media-paths.mjs <post-path> [options]

Options:
  --dry-run                  Preview the rewrite without changing files
  --media-subpath <path>     Override the derived yyyy/mm/dd/slug subpath
  --media-remote-root <dir>  Override remote media root
  --media-public-root <url>  Override public media root

Examples:
  node scripts/rewrite-post-media-paths.mjs content/articles/example-bundle --dry-run
`)
}

async function main() {
  const args = process.argv.slice(2)

  if (hasHelpFlag(args)) {
    printUsage()
    return
  }

  await loadDefaultEnv()
  const { input, options } = parseCliArgs(args, {
    booleanFlags: ["--dry-run"],
    defaults: {
      dryRun: false,
      mediaPublicRoot: process.env.MEDIA_PUBLIC_ROOT || DEFAULT_MEDIA_PUBLIC_ROOT,
      mediaRemoteRoot: process.env.MEDIA_REMOTE_ROOT || DEFAULT_MEDIA_REMOTE_ROOT
    },
    valueOptions: MEDIA_PATH_VALUE_OPTIONS
  })

  if (!input) {
    printUsage()
    process.exit(1)
  }

  const { content, images, postDir, postPath, usages } = await buildPostImageManifest(
    input,
    options
  )

  if (usages.length === 0) {
    console.log(`No img shortcodes found in ${postPath}`)
    return
  }

  if (images.length === 0) {
    console.log(`No local bundle images found in ${postPath}`)
    return
  }

  await populateImageMetadata(images)

  const updatedContent = rewriteImageShortcodes(content, postDir, createReplacementMap(images))

  if (updatedContent === content) {
    console.log(`No shortcode updates needed in ${postPath}`)
    return
  }

  if (options.dryRun) {
    console.log(`Would rewrite post: ${postPath}`)
    return
  }

  await fs.writeFile(postPath, updatedContent)
  console.log(`Rewrote post: ${postPath}`)
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : ""

if (import.meta.url === invokedPath) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
