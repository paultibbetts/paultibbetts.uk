#!/usr/bin/env node

import fs from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"

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

async function main() {
  const input = process.argv[2]
  const widthArg = process.argv[3]

  if (!input) {
    printUsage()
    process.exit(1)
  }

  const targetWidth = widthArg ? Number(widthArg) : 1200

  if (!Number.isFinite(targetWidth) || targetWidth <= 0) {
    console.error("Width must be a positive number.")
    process.exit(1)
  }

  const inputPath = path.resolve(input)
  const parsed = path.parse(inputPath)
  const outputDir = parsed.dir
  const encode = getEncoder(parsed.ext)

  try {
    await fs.access(inputPath)
  } catch {
    console.error(`Input file not found: ${inputPath}`)
    process.exit(1)
  }

  if (!encode) {
    console.error(`Unsupported image format: ${parsed.ext || "(none)"}`)
    process.exit(1)
  }

  const image = sharp(inputPath, {
    failOn: "warning",
    autoOrient: true
  })

  const metadata = await image.metadata()

  if (!metadata.width || !metadata.height) {
    console.error("Could not read image dimensions.")
    process.exit(1)
  }

  // Do not upscale.
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

  const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`
  const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`
  const fmt = (bytes) => (bytes >= 1024 * 1024 ? mb(bytes) : kb(bytes))
  const savedBytes = origStat.size - finalStat.size

  console.log(`Input:  ${inputPath}`)
  console.log(
    `Size:   ${metadata.width}x${metadata.height} -> ${finalWidth}px wide max`
  )
  console.log(`Before: ${fmt(origStat.size)}`)
  console.log(`After:  ${fmt(finalStat.size)}`)
  console.log(
    `Saved:  ${savedBytes >= 0 ? fmt(savedBytes) : `-${fmt(Math.abs(savedBytes))}`}`
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
