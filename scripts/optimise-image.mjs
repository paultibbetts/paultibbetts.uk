#!/usr/bin/env node

import fs from "node:fs/promises"
import path from "node:path"
import { pathToFileURL } from "node:url"
import sharp from "sharp"

export const DEFAULT_TARGET_WIDTH = 1200

function printUsage() {
  console.log(`
Usage:
  node scripts/optimise-image.mjs <input-file> [width]

Examples:
  node scripts/optimise-image.mjs ./photo.jpg
  node scripts/optimise-image.mjs ./photo.jpg 1600
`)
}

function getEncoder(extension) {
  const ext = extension.toLowerCase()

  if (ext === ".jpg" || ext === ".jpeg") {
    return (pipeline) =>
      pipeline.jpeg({
        quality: 82,
        mozjpeg: true,
        progressive: true
      })
  }

  if (ext === ".png") {
    return (pipeline) =>
      pipeline.png({
        compressionLevel: 9,
        progressive: true
      })
  }

  if (ext === ".webp") {
    return (pipeline) =>
      pipeline.webp({
        quality: 80
      })
  }

  return null
}

function formatBytes(bytes) {
  const kb = (value) => `${(value / 1024).toFixed(1)} KB`
  const mb = (value) => `${(value / 1024 / 1024).toFixed(2)} MB`
  return bytes >= 1024 * 1024 ? mb(bytes) : kb(bytes)
}

export async function optimiseImage(input, targetWidth = DEFAULT_TARGET_WIDTH) {
  const inputPath = path.resolve(input)
  const parsed = path.parse(inputPath)
  const outputDir = parsed.dir
  const encode = getEncoder(parsed.ext)

  try {
    await fs.access(inputPath)
  } catch {
    throw new Error(`Input file not found: ${inputPath}`)
  }

  if (!encode) {
    throw new Error(`Unsupported image format: ${parsed.ext || "(none)"}`)
  }

  const image = sharp(inputPath, {
    failOn: "warning",
    autoOrient: true
  })

  const metadata = await image.metadata()

  if (!metadata.width || !metadata.height) {
    throw new Error("Could not read image dimensions.")
  }

  const finalWidth = Math.min(targetWidth, metadata.width)

  const basePipeline = sharp(inputPath, {
    failOn: "warning",
    autoOrient: true
  }).resize({
    width: finalWidth,
    withoutEnlargement: true,
    fit: "inside"
  })

  const tempPath = path.join(
    outputDir,
    `${parsed.name}.${process.pid}.${Date.now()}.tmp${parsed.ext}`
  )
  const origStat = await fs.stat(inputPath)

  await encode(basePipeline.clone()).toFile(tempPath)
  await fs.rename(tempPath, inputPath)

  const finalStat = await fs.stat(inputPath)

  return {
    afterBytes: finalStat.size,
    beforeBytes: origStat.size,
    finalWidth,
    formatBytes,
    inputPath,
    originalHeight: metadata.height,
    originalWidth: metadata.width,
    savedBytes: origStat.size - finalStat.size
  }
}

function printResult(result) {
  console.log(`Input:  ${result.inputPath}`)
  console.log(
    `Size:   ${result.originalWidth}x${result.originalHeight} -> ${result.finalWidth}px wide max`
  )
  console.log(`Before: ${result.formatBytes(result.beforeBytes)}`)
  console.log(`After:  ${result.formatBytes(result.afterBytes)}`)
  console.log(
    `Saved:  ${
      result.savedBytes >= 0
        ? result.formatBytes(result.savedBytes)
        : `-${result.formatBytes(Math.abs(result.savedBytes))}`
    }`
  )
}

async function main() {
  const input = process.argv[2]
  const widthArg = process.argv[3]

  if (!input) {
    printUsage()
    process.exit(1)
  }

  const targetWidth = widthArg ? Number(widthArg) : DEFAULT_TARGET_WIDTH

  if (!Number.isFinite(targetWidth) || targetWidth <= 0) {
    console.error("Width must be a positive number.")
    process.exit(1)
  }

  const result = await optimiseImage(input, targetWidth)
  printResult(result)
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : ""

if (import.meta.url === invokedPath) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
