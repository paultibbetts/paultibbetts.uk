import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")

function parseEnvLine(line) {
  const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)

  if (!match) {
    return null
  }

  const [, key, rawValue] = match
  let value = rawValue.trim()

  if (!value) {
    return { key, value: "" }
  }

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1)
    value = value.replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\\\/g, "\\")
    return { key, value }
  }

  value = value.replace(/\s+#.*$/, "").trimEnd()
  return { key, value }
}

async function loadEnvFile(filePath) {
  let content

  try {
    content = await fs.readFile(filePath, "utf8")
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return
    }

    throw error
  }

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith("#")) {
      continue
    }

    const entry = parseEnvLine(line)

    if (!entry) {
      continue
    }

    process.env[entry.key] = entry.value
  }
}

export async function loadDefaultEnv() {
  await loadEnvFile(path.join(projectRoot, ".env"))
}
