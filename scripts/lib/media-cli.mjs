import { DEFAULT_MEDIA_PUBLIC_ROOT, DEFAULT_MEDIA_REMOTE_ROOT } from "./post-media.mjs"

export function hasHelpFlag(args) {
  return args.includes("--help") || args.includes("-h")
}

export function parseCliArgs(argv, { booleanFlags = [], defaults = {}, valueOptions = [] } = {}) {
  const options = { ...defaults }
  const positional = []
  const booleanFlagSet = new Set(booleanFlags)
  const valueOptionMap = new Map(valueOptions.map((option) => [option.flag, option.key]))

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (booleanFlagSet.has(arg)) {
      options[flagToKey(arg)] = true
      continue
    }

    const valueKey = valueOptionMap.get(arg)

    if (valueKey) {
      const next = argv[index + 1]

      if (!next) {
        throw new Error(`Missing value for ${arg}`)
      }

      index += 1
      options[valueKey] = next
      continue
    }

    if (arg.startsWith("--")) {
      throw new Error(`Unknown option: ${arg}`)
    }

    positional.push(arg)
  }

  return {
    input: positional[0],
    options
  }
}

export function mediaPathOptionDefaults() {
  return {
    mediaPublicRoot: process.env.MEDIA_PUBLIC_ROOT || DEFAULT_MEDIA_PUBLIC_ROOT,
    mediaRemoteRoot: process.env.MEDIA_REMOTE_ROOT || DEFAULT_MEDIA_REMOTE_ROOT
  }
}

export function deployOptionDefaults() {
  return {
    host: process.env.DEPLOY_HOST || "",
    port: process.env.DEPLOY_PORT || "22",
    sshKeyPath: process.env.SSH_KEY_PATH || "",
    sshKnownHostsPath: process.env.SSH_KNOWN_HOSTS_PATH || "",
    user: process.env.DEPLOY_USER || ""
  }
}

export const MEDIA_PATH_VALUE_OPTIONS = [
  { flag: "--media-subpath", key: "mediaSubpath" },
  { flag: "--media-remote-root", key: "mediaRemoteRoot" },
  { flag: "--media-public-root", key: "mediaPublicRoot" }
]

export const DEPLOY_VALUE_OPTIONS = [
  { flag: "--host", key: "host" },
  { flag: "--user", key: "user" },
  { flag: "--port", key: "port" },
  { flag: "--ssh-key", key: "sshKeyPath" },
  { flag: "--known-hosts", key: "sshKnownHostsPath" }
]

function flagToKey(flag) {
  return flag.replace(/^--/, "").replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}
