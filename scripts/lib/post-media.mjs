import fs from "node:fs/promises"
import path from "node:path"
import { DEFAULT_TARGET_WIDTH } from "../optimise-image.mjs"

export const DEFAULT_MEDIA_REMOTE_ROOT = "/srv/www/paultibbetts.uk/shared/media"
export const DEFAULT_MEDIA_PUBLIC_ROOT = "https://paultibbetts.uk/media"

const FRONT_MATTER_RE = /^(?<delimiter>\+\+\+|---)\n([\s\S]*?)\n\k<delimiter>\n?/

export function getAttr(rawAttrs, name) {
  const match = rawAttrs.match(new RegExp(`${name}\\s*=\\s*("([^"]+)"|'([^']+)')`, "i"))
  return match ? match[2] || match[3] : ""
}

export function setAttr(rawAttrs, name, value) {
  const pattern = new RegExp(`(${name}\\s*=\\s*)("([^"]*)"|'([^']*)')`, "i")

  if (pattern.test(rawAttrs)) {
    return rawAttrs.replace(pattern, `$1"${value}"`)
  }

  const trimmed = rawAttrs.trim()
  return trimmed ? `${trimmed} ${name}="${value}"` : `${name}="${value}"`
}

export function isExternalSource(src) {
  return /^(https?:)?\/\//i.test(src) || src.startsWith("/")
}

function normalisePathPart(value) {
  return value.replace(/^\/+|\/+$/g, "")
}

export function joinUrlPath(...parts) {
  const filtered = parts.map(normalisePathPart).filter(Boolean)
  return `/${filtered.join("/")}`
}

function parseFrontMatter(content) {
  const match = content.match(FRONT_MATTER_RE)
  return match ? match[2] : ""
}

function extractDateValue(content) {
  const frontMatter = parseFrontMatter(content)

  if (!frontMatter) {
    return ""
  }

  const tomlMatch = frontMatter.match(/^\s*date\s*=\s*["']([^"']+)["']/m)

  if (tomlMatch) {
    return tomlMatch[1]
  }

  const yamlMatch = frontMatter.match(/^\s*date\s*:\s*["']?([^"'\n]+)["']?/m)
  return yamlMatch ? yamlMatch[1].trim() : ""
}

function extractDateFromPath(postPath) {
  const dirname = path.basename(path.dirname(postPath))
  const basename = path.basename(postPath, path.extname(postPath))
  const source = basename === "index" || basename === "_index" ? dirname : basename
  const match = source.match(/^(\d{4})-(\d{2})-(\d{2})/)

  return match ? `${match[1]}-${match[2]}-${match[3]}` : ""
}

function deriveDateParts(postPath, content) {
  const rawDate = extractDateValue(content) || extractDateFromPath(postPath)

  if (!rawDate) {
    throw new Error(`Could not determine post date for ${postPath}`)
  }

  const match = rawDate.match(/^(\d{4})-(\d{2})-(\d{2})/)

  if (match) {
    return {
      day: match[3],
      month: match[2],
      year: match[1]
    }
  }

  const parsed = new Date(rawDate)

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Could not parse post date "${rawDate}"`)
  }

  return {
    day: String(parsed.getUTCDate()).padStart(2, "0"),
    month: String(parsed.getUTCMonth() + 1).padStart(2, "0"),
    year: String(parsed.getUTCFullYear())
  }
}

function deriveSlug(postPath) {
  const dirname = path.basename(path.dirname(postPath))
  const basename = path.basename(postPath, path.extname(postPath))
  const source = basename === "index" || basename === "_index" ? dirname : basename
  return source.replace(/^\d{4}-\d{2}-\d{2}-/, "")
}

export function deriveMediaSubpath(postPath, content) {
  const dateParts = deriveDateParts(postPath, content)
  const slug = deriveSlug(postPath)

  if (!slug) {
    throw new Error(`Could not determine post slug for ${postPath}`)
  }

  return `${dateParts.year}/${dateParts.month}/${dateParts.day}/${slug}`
}

export function parseImageShortcodes(content) {
  const pattern = /\{\{<\s*img\b([\s\S]*?)>\}\}/g
  const usages = []

  for (const match of content.matchAll(pattern)) {
    const rawAttrs = match[1]
    const src = getAttr(rawAttrs, "src")

    if (!src) {
      continue
    }

    const widthRaw = getAttr(rawAttrs, "width")
    const width = widthRaw ? Number(widthRaw) : DEFAULT_TARGET_WIDTH

    usages.push({
      rawAttrs,
      src,
      width: Number.isFinite(width) && width > 0 ? width : DEFAULT_TARGET_WIDTH
    })
  }

  return usages
}

export async function resolvePostPath(input) {
  const resolved = path.resolve(input)
  const stat = await fs.stat(resolved)

  if (stat.isFile()) {
    return resolved
  }

  if (!stat.isDirectory()) {
    throw new Error(`Unsupported post path: ${resolved}`)
  }

  for (const candidate of ["index.md", "_index.md"]) {
    const candidatePath = path.join(resolved, candidate)

    try {
      await fs.access(candidatePath)
      return candidatePath
    } catch {
      // Continue checking candidates.
    }
  }

  throw new Error(`Could not find index.md or _index.md in ${resolved}`)
}

export async function loadPost(input) {
  const postPath = await resolvePostPath(input)
  const content = await fs.readFile(postPath, "utf8")

  return {
    content,
    postDir: path.dirname(postPath),
    postPath
  }
}

export function collectLocalPostImages(postDir, usages, publicBase = "") {
  const images = new Map()

  for (const usage of usages) {
    if (isExternalSource(usage.src)) {
      continue
    }

    const localPath = path.resolve(postDir, usage.src)
    const existing = images.get(localPath)

    if (!existing) {
      images.set(localPath, {
        localPath,
        originalSrc: usage.src,
        publicSrc: publicBase ? joinUrlPath(publicBase, path.basename(usage.src)) : "",
        targetWidth: usage.width
      })
      continue
    }

    if (usage.width > existing.targetWidth) {
      existing.targetWidth = usage.width
    }
  }

  return Array.from(images.values())
}

export async function buildPostImageManifest(
  input,
  {
    mediaPublicRoot = DEFAULT_MEDIA_PUBLIC_ROOT,
    mediaRemoteRoot = DEFAULT_MEDIA_REMOTE_ROOT,
    mediaSubpath
  } = {}
) {
  const { content, postDir, postPath } = await loadPost(input)
  const usages = parseImageShortcodes(content)
  const resolvedMediaSubpath = mediaSubpath || deriveMediaSubpath(postPath, content)
  const publicBase = joinUrlPath(mediaPublicRoot, resolvedMediaSubpath)
  const remoteDir = path.posix.join(
    mediaRemoteRoot,
    ...resolvedMediaSubpath.split("/").filter(Boolean)
  )
  const images = collectLocalPostImages(postDir, usages, publicBase)

  return {
    content,
    images,
    mediaSubpath: resolvedMediaSubpath,
    postDir,
    postPath,
    publicBase,
    remoteDir,
    usages
  }
}

export function createReplacementMap(images) {
  return new Map(images.map((image) => [image.localPath, image]))
}

export function rewriteImageShortcodes(content, postDir, replacements) {
  const pattern = /\{\{<\s*img\b([\s\S]*?)>\}\}/g

  return content.replace(pattern, (fullMatch, rawAttrs) => {
    const src = getAttr(rawAttrs, "src")

    if (!src || isExternalSource(src)) {
      return fullMatch
    }

    const imagePath = path.resolve(postDir, src)
    const replacement = replacements.get(imagePath)

    if (!replacement) {
      return fullMatch
    }

    let updatedAttrs = rawAttrs.trim()
    updatedAttrs = setAttr(updatedAttrs, "src", replacement.publicSrc)
    updatedAttrs = setAttr(updatedAttrs, "width", String(replacement.width))
    updatedAttrs = setAttr(updatedAttrs, "height", String(replacement.height))

    return `{{< img ${updatedAttrs} >}}`
  })
}
