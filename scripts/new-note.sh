#!/usr/bin/env bash
set -euo pipefail

if [[ $# -gt 1 ]]; then
  echo "Usage: $0 [optional-title]"
  exit 1
fi

date_part="$(date +%Y-%m-%d)"
time_part="$(date +%H%M%S)"

title="${1:-}"
title="${title%.md}"
slug="$title"

if [[ -n "$slug" ]]; then
  slug="$(echo "$slug" \
    | tr '[:upper:]' '[:lower:]' \
    | sed -E 's/[^a-z0-9]+/-/g' \
    | sed -E 's/^-+|-+$//g')"
fi

if [[ -n "$slug" ]]; then
  base="${date_part}-${time_part}-${slug}"
  permalink_slug="$slug"
else
  base="${date_part}-${time_part}"
  permalink_slug="$time_part"
fi

dir="content/notes"
file="${dir}/${base}.md"

mkdir -p "$dir"

counter=2
while [[ -f "$file" ]]; do
  if [[ -n "$slug" ]]; then
    file="${dir}/${date_part}-${time_part}-${counter}-${slug}.md"
    permalink_slug="${slug}-${counter}"
  else
    file="${dir}/${date_part}-${time_part}-${counter}.md"
    permalink_slug="${time_part}-${counter}"
  fi
  ((counter++))
done

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
    NR == 1 { delimiter = $0 }
    $0 ~ "^" key " = " {
      print key " = \"" value "\""
      found = 1
      next
    }
    $0 == delimiter && NR > 1 && !found {
      print key " = \"" value "\""
      found = 1
    }
    { print }
  ' "$target_file" >"$tmp_file"

  mv "$tmp_file" "$target_file"
}

if [[ -n "$title" ]]; then
  set_toml_string "$file" "title" "$title"
fi

set_toml_string "$file" "slug" "$permalink_slug"

"$(dirname "$0")/generate-date-archives.sh" >/dev/null

echo "Created $relative_path"
