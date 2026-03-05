#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./new-note.sh
#   ./new-note.sh "My Optional Title"

if [[ $# -gt 1 ]]; then
  echo "Usage: $0 [optional-title]"
  exit 1
fi

# Timestamp parts
date_part="$(date +%Y-%m-%d)"
time_part="$(date +%H%M%S)"

# Optional title
title="${1:-}"
title="${title%.md}"

# Optional slug, derived from title
slug="$title"

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

toml_escape() {
  printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g'
}

set_toml_string() {
  local target_file="$1"
  local key="$2"
  local value="$3"
  local escaped_value=""
  local tmp_file=""

  escaped_value="$(toml_escape "$value")"
  tmp_file="$(mktemp)"

  awk -v key="$key" -v value="$escaped_value" '
    $0 ~ "^" key " = " {
      print key " = \"" value "\""
      next
    }
    { print }
  ' "$target_file" >"$tmp_file"

  mv "$tmp_file" "$target_file"
}

if [[ -n "$title" ]]; then
  set_toml_string "$file" "title" "$title"
fi

# Keep generated root date views (/YYYY/, /YYYY/MM/, /YYYY/MM/DD/) in sync.
"$(dirname "$0")/generate-date-archives.sh" >/dev/null

echo "Created $relative_path"
