#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "${script_dir}/.." && pwd)"

cd "${repo_root}"

# Generate published-content CSV for content adapters before building.
if ! "${script_dir}/generate-date-archives.sh"; then
  echo "Error: published-content CSV generation failed." >&2
  exit 1
fi

# Accept CI-provided values for base URL and cache location.
hugo_base_url="${HUGO_BASEURL:-}"
hugo_cache_dir="${HUGO_CACHEDIR:-${repo_root}/.hugo_cache}"

hugo_args=(--gc --minify --enableGitInfo)

if [[ -n "${hugo_base_url}" ]]; then
  hugo_args+=(--baseURL "${hugo_base_url}")
fi

if [[ -n "${hugo_cache_dir}" ]]; then
  mkdir -p "${hugo_cache_dir}"
  hugo_args+=(--cacheDir "${hugo_cache_dir}")
fi

hugo "${hugo_args[@]}" "$@"
