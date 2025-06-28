#!/bin/bash

if [ -z "$1" ]; then
  echo "Error: No title provided."
  echo "Usage: $0 \"Your Article Title\""
  exit 1
fi

TITLE="$1"
SLUG=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd '[:alnum:]-')
DATE=$(date +%Y-%m-%d)

FILE="content/articles/${DATE}-${SLUG}.md"

hugo new --kind article "$FILE"

