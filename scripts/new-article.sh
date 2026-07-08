#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Error: No title provided."
  echo "Usage: $0 \"Your Article Title\""
  exit 1
fi

title="$1"
slug="$(echo "$title" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd '[:alnum:]-')"
date_part="$(date +%Y-%m-%d)"

file="content/articles/${date_part}-${slug}.md"

hugo new --kind article "$file"

"$(dirname "$0")/generate-date-archives.sh" >/dev/null
