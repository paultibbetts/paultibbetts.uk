#!/usr/bin/env node

import path from "node:path"
import { pathToFileURL } from "node:url"
import {
  buildPostImageManifest,
  DEFAULT_MEDIA_PUBLIC_ROOT,
  DEFAULT_MEDIA_REMOTE_ROOT
} from "./lib/post-media.mjs"
import {
  hasHelpFlag,
  MEDIA_PATH_VALUE_OPTIONS,
  mediaPathOptionDefaults,
  parseCliArgs
} from "./lib/media-cli.mjs"
import { loadDefaultEnv } from "./lib/load-env.mjs"

function printUsage() {
  console.log(`
Usage:
  node scripts/post-media-manifest.mjs <post-path> [options]

Options:
  --format <json|paths|tsv>   Output format (default: json)
  --media-subpath <path>      Override the derived yyyy/mm/dd/slug subpath
  --media-remote-root <dir>   Override remote media root
  --media-public-root <url>   Override public media root

Examples:
  node scripts/post-media-manifest.mjs content/articles/example-bundle
  node scripts/post-media-manifest.mjs content/articles/example-bundle --format paths
`)
}

function printPaths(images) {
  for (const image of images) {
    console.log(image.localPath)
  }
}

function printTsv(images) {
  for (const image of images) {
    console.log([image.localPath, image.originalSrc, image.targetWidth, image.publicSrc].join("\t"))
  }
}

function printJson(manifest) {
  console.log(
    JSON.stringify(
      {
        images: manifest.images,
        mediaSubpath: manifest.mediaSubpath,
        postPath: manifest.postPath,
        publicBase: manifest.publicBase,
        remoteDir: manifest.remoteDir
      },
      null,
      2
    )
  )
}

async function main() {
  const args = process.argv.slice(2)

  if (hasHelpFlag(args)) {
    printUsage()
    return
  }

  await loadDefaultEnv()
  const { input, options } = parseCliArgs(args, {
    defaults: {
      format: "json",
      ...mediaPathOptionDefaults()
    },
    valueOptions: [{ flag: "--format", key: "format" }, ...MEDIA_PATH_VALUE_OPTIONS]
  })

  if (!input) {
    printUsage()
    process.exit(1)
  }

  if (!["json", "paths", "tsv"].includes(options.format)) {
    throw new Error(`Unsupported format: ${options.format}`)
  }

  const manifest = await buildPostImageManifest(input, options)

  if (options.format === "paths") {
    printPaths(manifest.images)
    return
  }

  if (options.format === "tsv") {
    printTsv(manifest.images)
    return
  }

  printJson(manifest)
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : ""

if (import.meta.url === invokedPath) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
