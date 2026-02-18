#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./new-note.sh
#   ./new-note.sh "my optional slug"

if [[ $# -gt 1 ]]; then
  echo "Usage: $0 [optional-slug]"
  exit 1
fi

# Timestamp parts
date_part="$(date +%Y-%m-%d)"
time_part="$(date +%H%M%S)"

# Optional slug
slug="${1:-}"
slug="${slug%.md}"

# Slugify (basic, safe, predictable)
if [[ -n "$slug" ]]; then
  slug="$(echo "$slug" \
    | tr '[:upper:]' '[:lower:]' \
    | sed -E 's/[^a-z0-9]+/-/g' \
    | sed -E 's/^-+|-+$//g')"
fi

# Base filename
if [[ -n "$slug" ]]; then
  base="${date_part}-${time_part}-${slug}"
else
  base="${date_part}-${time_part}"
fi

# Target path (flat file structure under content/notes)
dir="content/notes"
file="${dir}/${base}.md"

mkdir -p "$dir"

# Collision handling
counter=2
while [[ -f "$file" ]]; do
  if [[ -n "$slug" ]]; then
    file="${dir}/${date_part}-${time_part}-${counter}-${slug}.md"
  else
    file="${dir}/${date_part}-${time_part}-${counter}.md"
  fi
  ((counter++))
done

# Create note via Hugo (relative to content/)
relative_path="${file#content/}"

hugo new --kind note "$relative_path"

# Keep /archive/YYYY/, /archive/YYYY/MM/, /archive/YYYY/MM/DD/ archives in sync.
"$(dirname "$0")/generate-date-archives.sh" >/dev/null

echo "Created $relative_path"
