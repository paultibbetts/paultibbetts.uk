#!/usr/bin/env node

import fs from "node:fs/promises"
import path from "node:path"
import { pathToFileURL } from "node:url"
import {
  DEPLOY_VALUE_OPTIONS,
  deployOptionDefaults,
  hasHelpFlag,
  MEDIA_PATH_VALUE_OPTIONS,
  mediaPathOptionDefaults,
  parseCliArgs
} from "./lib/media-cli.mjs"
import { loadDefaultEnv } from "./lib/load-env.mjs"
import {
  buildPostImageManifest,
  DEFAULT_MEDIA_PUBLIC_ROOT,
  DEFAULT_MEDIA_REMOTE_ROOT
} from "./lib/post-media.mjs"
import { createSshOptions, uploadFiles } from "./lib/remote-media.mjs"

function printUsage() {
  console.log(`
Usage:
  node scripts/upload-post-media.mjs <post-path> [options]

Options:
  --dry-run                  Preview upload commands without changing anything
  --media-subpath <path>     Override the derived yyyy/mm/dd/slug subpath
  --media-remote-root <dir>  Override remote media root
  --media-public-root <url>  Override public media root
  --host <host>              Override DEPLOY_HOST for this run
  --user <user>              Override DEPLOY_USER for this run
  --port <port>              Override DEPLOY_PORT for this run
  --ssh-key <path>           Override SSH_KEY_PATH for this run
  --known-hosts <path>       Override SSH_KNOWN_HOSTS_PATH for this run

Examples:
  node scripts/upload-post-media.mjs content/articles/example-bundle --dry-run
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
      ...mediaPathOptionDefaults(),
      ...deployOptionDefaults()
    },
    valueOptions: [...MEDIA_PATH_VALUE_OPTIONS, ...DEPLOY_VALUE_OPTIONS]
  })

  if (!input) {
    printUsage()
    process.exit(1)
  }

  const { images, mediaSubpath, postPath, publicBase, remoteDir, usages } =
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

  for (const image of images) {
    await fs.access(image.localPath)
  }

  console.log(`Post:        ${postPath}`)
  console.log(`Media path:  ${mediaSubpath}`)
  console.log(`Remote dir:  ${remoteDir}`)
  console.log(`Public root: ${publicBase}`)
  console.log(`Images:      ${images.length}`)

  if (!options.host || !options.user) {
    console.log("Upload skipped in dry-run because DEPLOY_HOST and DEPLOY_USER were not provided.")
    return
  }

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

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : ""

if (import.meta.url === invokedPath) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
