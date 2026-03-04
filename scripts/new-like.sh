#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./new-like.sh "https://example.com"
#   ./new-like.sh "https://example.com" "Optional Title Override"
#   ./new-like.sh "Optional Title" "https://example.com"

if [[ $# -lt 1 || $# -gt 2 ]]; then
  echo "Usage:"
  echo "  $0 \"Liked URL\""
  echo "  $0 \"Liked URL\" \"Optional Title Override\""
  echo "  $0 \"Optional Title\" \"Liked URL\""
  exit 1
fi

is_url() {
  [[ "$1" =~ ^https?:// ]]
}

fetch_title_from_url() {
  local url="$1"
  local html=""
  local title=""

  html="$(curl -fsSL --max-time 20 "$url" 2>/dev/null || true)"
  if [[ -z "$html" ]]; then
    return 1
  fi

  title="$(
    printf '%s' "$html" \
      | perl -0777 -ne '
          my $t;
          if (/<head\b.*?<title[^>]*>\s*(.*?)\s*<\/title>/is) {
            $t = $1;
          } elsif (/<title[^>]*>\s*(.*?)\s*<\/title>/is) {
            $t = $1;
          }
          if (defined $t) {
            $t =~ s/<[^>]+>//g;
            $t =~ s/\s+/ /g;
            $t =~ s/^\s+|\s+$//g;
            print $t;
          }
        '
  )"

  [[ -n "$title" ]] || return 1
  printf '%s' "$title"
}

title=""
liked_url=""

if [[ $# -eq 1 ]]; then
  if ! is_url "$1"; then
    echo "Error: single argument must be a URL."
    exit 1
  fi
  liked_url="$1"
else
  if is_url "$1" && ! is_url "$2"; then
    liked_url="$1"
    title="$2"
  elif ! is_url "$1" && is_url "$2"; then
    title="$1"
    liked_url="$2"
  elif is_url "$1" && is_url "$2"; then
    echo "Error: provide one URL and one optional title, not two URLs."
    exit 1
  else
    echo "Error: one argument must be a URL."
    exit 1
  fi
fi

if [[ -z "$title" ]]; then
  if ! title="$(fetch_title_from_url "$liked_url")"; then
    echo "Error: Could not fetch <title> from $liked_url."
    echo "Pass a title manually: $0 \"Your Title\" \"$liked_url\""
    exit 1
  fi
fi

slug="$(echo "$title" \
  | tr '[:upper:]' '[:lower:]' \
  | sed -E 's/[^a-z0-9]+/-/g' \
  | sed -E 's/^-+|-+$//g')"

if [[ -z "$slug" ]]; then
  echo "Error: title produced an empty slug."
  exit 1
fi

date_part="$(date +%Y-%m-%d)"
dir="content/likes"
file="${dir}/${date_part}-${slug}.md"

mkdir -p "$dir"

counter=2
while [[ -f "$file" ]]; do
  file="${dir}/${date_part}-${slug}-${counter}.md"
  ((counter++))
done

relative_path="${file#content/}"
hugo new --kind like "$relative_path"

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

set_toml_string "$file" "title" "$title"
set_toml_string "$file" "like_of" "$liked_url"

# Keep generated root date views (/YYYY/, /YYYY/MM/, /YYYY/MM/DD/) in sync.
"$(dirname "$0")/generate-date-archives.sh" >/dev/null

echo "Created $relative_path"
