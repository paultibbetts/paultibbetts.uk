#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage:"
  echo "  $0"
  echo "  $0 \"2026-03-17T14:14:56Z\""
}

if [[ $# -gt 1 ]]; then
  usage
  exit 1
fi

datetime="${1:-}"

if [[ -n "$datetime" ]]; then
  if [[ ! "$datetime" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}T ]]; then
    echo "Error: datetime must begin with an ISO-8601 date and time."
    usage
    exit 1
  fi
  date_part="${datetime:0:10}"
else
  date_part="$(date +%Y-%m-%d)"
fi

file="content/changelog/${date_part}.md"

if [[ -e "$file" ]]; then
  echo "Error: A changelog entry already exists for $date_part."
  usage
  exit 1
fi

relative_path="${file#content/}"
hugo new --kind changelog "$relative_path"

if [[ -n "$datetime" ]]; then
  tmp_file="$(mktemp)"
  awk -v datetime="$datetime" '
    $0 ~ "^date = " {
      print "date = \"" datetime "\""
      next
    }
    { print }
  ' "$file" >"$tmp_file"
  mv "$tmp_file" "$file"
fi

echo "Created $relative_path"
