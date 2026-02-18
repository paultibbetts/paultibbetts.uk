#!/usr/bin/env bash
set -euo pipefail

if [[ $# -gt 1 ]]; then
  echo "Usage: $0 [note-name]"
  echo "Example: $0"
  echo "Example: $0 2026-02-15-1030"
  exit 1
fi

note_name="${1:-$(date +%Y-%m-%d-%H%M%S)}"
note_name="${note_name%.md}"

hugo new --kind note "notes/${note_name}.md"
