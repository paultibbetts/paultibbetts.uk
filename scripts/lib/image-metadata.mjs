import sharp from "sharp"

export async function readImageMetadata(imagePath) {
  const metadata = await sharp(imagePath, {
    failOn: "warning",
    autoOrient: true
  }).metadata()

  if (!metadata.width || !metadata.height) {
    throw new Error(`Could not read dimensions for ${imagePath}`)
  }

  return {
    height: metadata.height,
    width: metadata.width
  }
}

export async function populateImageMetadata(images) {
  for (const image of images) {
    const metadata = await readImageMetadata(image.localPath)
    image.height = metadata.height
    image.width = metadata.width
  }

  return images
}
