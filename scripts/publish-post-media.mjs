#!/usr/bin/env node

import fs from "node:fs/promises"
import path from "node:path"
import { pathToFileURL } from "node:url"
import { optimiseImage } from "./optimise-image.mjs"
import {
  DEPLOY_VALUE_OPTIONS,
  deployOptionDefaults,
  hasHelpFlag,
  MEDIA_PATH_VALUE_OPTIONS,
  mediaPathOptionDefaults,
  parseCliArgs
} from "./lib/media-cli.mjs"
import { populateImageMetadata } from "./lib/image-metadata.mjs"
import { loadDefaultEnv } from "./lib/load-env.mjs"
import {
  buildPostImageManifest,
  createReplacementMap,
  DEFAULT_MEDIA_PUBLIC_ROOT,
  DEFAULT_MEDIA_REMOTE_ROOT,
  rewriteImageShortcodes
} from "./lib/post-media.mjs"
import { createSshOptions, uploadFiles } from "./lib/remote-media.mjs"

function printUsage() {
  console.log(`
Usage:
  node scripts/publish-post-media.mjs <post-path> [options]

Options:
  --dry-run                  Preview actions without changing files or uploading
  --remove-local             Delete local bundle images after upload and rewrite
  --media-subpath <path>     Override the derived yyyy/mm/dd/slug subpath
  --media-remote-root <dir>  Override remote media root
  --media-public-root <url>  Override public media root
  --host <host>              Override DEPLOY_HOST for this run
  --user <user>              Override DEPLOY_USER for this run
  --port <port>              Override DEPLOY_PORT for this run
  --ssh-key <path>           Override SSH_KEY_PATH for this run
  --known-hosts <path>       Override SSH_KNOWN_HOSTS_PATH for this run

Environment:
  DEPLOY_HOST / DEPLOY_USER / DEPLOY_PORT
  SSH_KEY_PATH / SSH_KNOWN_HOSTS_PATH
  MEDIA_REMOTE_ROOT          Defaults to ${DEFAULT_MEDIA_REMOTE_ROOT}
  MEDIA_PUBLIC_ROOT          Defaults to ${DEFAULT_MEDIA_PUBLIC_ROOT}

Examples:
  node scripts/publish-post-media.mjs content/articles/example-bundle --dry-run
  node scripts/publish-post-media.mjs content/articles/example-bundle --remove-local
`)
}

async function maybeRemoveLocalImages(imagePaths, { dryRun, removeLocal }) {
  if (!removeLocal) {
    return
  }

  for (const imagePath of imagePaths) {
    if (dryRun) {
      console.log(`Would remove local file: ${imagePath}`)
      continue
    }

    await fs.unlink(imagePath)
    console.log(`Removed local file: ${imagePath}`)
  }
}

async function main() {
  const args = process.argv.slice(2)

  if (hasHelpFlag(args)) {
    printUsage()
    return
  }

  await loadDefaultEnv()
  const { input, options } = parseCliArgs(args, {
    booleanFlags: ["--dry-run", "--remove-local"],
    defaults: {
      dryRun: false,
      removeLocal: false,
      ...mediaPathOptionDefaults(),
      ...deployOptionDefaults()
    },
    valueOptions: [...MEDIA_PATH_VALUE_OPTIONS, ...DEPLOY_VALUE_OPTIONS]
  })

  if (!input) {
    printUsage()
    process.exit(1)
  }

  const { content, images, mediaSubpath, postDir, postPath, publicBase, remoteDir, usages } =
    await buildPostImageManifest(input, options)

  if (usages.length === 0) {
    console.log(`No img shortcodes found in ${postPath}`)
    return
  }

  if (images.length === 0) {
    console.log(`No local bundle images found in ${postPath}`)
    return
  }

  if (!options.dryRun && (!options.host || !options.user)) {
    throw new Error("DEPLOY_HOST and DEPLOY_USER are required unless --dry-run is used")
  }

  console.log(`Post:        ${postPath}`)
  console.log(`Media path:  ${mediaSubpath}`)
  console.log(`Remote dir:  ${remoteDir}`)
  console.log(`Public root: ${publicBase}`)
  console.log(`Images:      ${images.length}`)

  for (const image of images) {
    await fs.access(image.localPath)

    if (options.dryRun) {
      console.log(`Would optimise: ${image.localPath} (${image.targetWidth}px max)`)
      continue
    }

    console.log(`Optimising:  ${image.localPath} (${image.targetWidth}px max)`)
    await optimiseImage(image.localPath, image.targetWidth)
  }

  await populateImageMetadata(images)

  for (const image of images) {
    if (!options.dryRun) {
      console.log(`Prepared:    ${image.publicSrc} (${image.width}x${image.height})`)
    }
  }

  if (!options.host || !options.user) {
    console.log("Upload skipped in dry-run because DEPLOY_HOST and DEPLOY_USER were not provided.")
  } else {
    const sshOptions = createSshOptions(options)
    await uploadFiles({
      dryRun: options.dryRun,
      files: images.map((image) => image.localPath),
      host: options.host,
      remoteDir,
      sshOptions,
      user: options.user
    })
  }

  const updatedContent = rewriteImageShortcodes(content, postDir, createReplacementMap(images))

  if (updatedContent === content) {
    console.log(`No shortcode updates needed in ${postPath}`)
    return
  }

  if (options.dryRun) {
    console.log(`Would rewrite post: ${postPath}`)
  } else {
    await fs.writeFile(postPath, updatedContent)
    console.log(`Rewrote post: ${postPath}`)
  }

  await maybeRemoveLocalImages(
    images.map((image) => image.localPath),
    options
  )
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : ""

if (import.meta.url === invokedPath) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
