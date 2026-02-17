#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "${script_dir}/.." && pwd)"

cd "${repo_root}"

# Keep date archive indexes in sync before building.
"${script_dir}/generate-date-archives.sh"

hugo "$@"
