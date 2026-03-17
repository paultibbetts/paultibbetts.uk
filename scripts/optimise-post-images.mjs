#!/usr/bin/env node

import fs from "node:fs/promises"
import path from "node:path"
import { pathToFileURL } from "node:url"
import { hasHelpFlag } from "./lib/media-cli.mjs"
import { optimiseImage } from "./optimise-image.mjs"
import { buildPostImageManifest } from "./lib/post-media.mjs"

function printUsage() {
  console.log(`
Usage:
  node scripts/optimise-post-images.mjs <post-path> [--dry-run]

Examples:
  node scripts/optimise-post-images.mjs content/articles/example-post.md
  node scripts/optimise-post-images.mjs content/articles/example-bundle --dry-run
`)
}

async function main() {
  const args = process.argv.slice(2)

  if (hasHelpFlag(args)) {
    printUsage()
    return
  }

  const dryRun = args.includes("--dry-run")
  const positional = args.filter((arg) => arg !== "--dry-run")
  const input = positional[0]

  if (!input) {
    printUsage()
    process.exit(1)
  }

  const { images, postPath, usages } = await buildPostImageManifest(input)

  if (usages.length === 0) {
    console.log(`No img shortcodes found in ${postPath}`)
    return
  }

  if (images.length === 0) {
    console.log(`No local bundle images found in ${postPath}`)
    return
  }

  console.log(`Post:   ${postPath}`)
  console.log(`Found:  ${usages.length} shortcode use(s), ${images.length} unique image(s)`)

  for (const image of images) {
    try {
      await fs.access(image.localPath)
    } catch {
      console.error(`Missing image: ${image.originalSrc} (${image.localPath})`)
      process.exitCode = 1
      continue
    }

    if (dryRun) {
      console.log(`Would optimise: ${image.localPath} (${image.targetWidth}px max)`)
      continue
    }

    console.log(`Optimising: ${image.localPath} (${image.targetWidth}px max)`)
    const result = await optimiseImage(image.localPath, image.targetWidth)
    console.log(
      `Saved: ${
        result.savedBytes >= 0 ? result.formatBytes(result.savedBytes) : "0.0 KB"
      } from ${image.originalSrc}`
    )
  }
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : ""

if (import.meta.url === invokedPath) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
