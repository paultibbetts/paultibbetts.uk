#!/usr/bin/env bash
set -euo pipefail

# Generates CSV metadata for content adapters at:
#   assets/data/published-content.csv
# using Hugo's built-in published content list.

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "${script_dir}/.." && pwd)"
output_path="${1:-assets/data/published-content.csv}"

cd "${repo_root}"

output_dir="$(dirname "$output_path")"
mkdir -p "${output_dir}"

tmp_csv="$(mktemp)"
trap 'rm -f "$tmp_csv"' EXIT

hugo list published > "$tmp_csv"

if [[ ! -s "$tmp_csv" ]]; then
  echo "Error: hugo list published returned no output." >&2
  exit 1
fi

# Ensure the CSV has the expected header row.
if ! head -n 1 "$tmp_csv" | grep -q "^path,slug,title,date,expiryDate,publishDate,draft,permalink,kind,section$"; then
  echo "Error: unexpected hugo list published CSV header." >&2
  exit 1
fi

mv "$tmp_csv" "$output_path"
echo "Published content CSV generated: ${output_path}"
