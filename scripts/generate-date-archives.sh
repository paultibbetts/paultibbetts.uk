#!/usr/bin/env bash
set -euo pipefail

# Generates date archive index pages at:
#   /archive/YYYY/
#   /archive/YYYY/MM/
#   /archive/YYYY/MM/DD/
# based on dates found in content for selected post sections.

roots=()
for section in articles notes bookmarks; do
  if [[ -d "content/${section}" ]]; then
    roots+=("content/${section}")
  fi
done

if [[ ${#roots[@]} -eq 0 ]]; then
  echo "No source sections found (articles/notes/bookmarks)."
  exit 0
fi

tmp_dates="$(mktemp)"

find "${roots[@]}" -type f -name '*.md' | while read -r file; do
  # Expect TOML front matter date lines like:
  # date = '2026-02-17T12:29:51Z'
  date_str="$(sed -n '1,40p' "$file" | rg -o "^date\\s*=\\s*['\"]([0-9]{4})-([0-9]{2})-([0-9]{2})" -r '$1-$2-$3' | head -1 || true)"
  if [[ -n "$date_str" ]]; then
    echo "$date_str"
  fi
done | sort -u > "$tmp_dates"

while IFS='-' read -r year month day; do
  [[ -z "$year" ]] && continue

  year_dir="content/archive/${year}"
  month_dir="${year_dir}/${month}"
  day_dir="${month_dir}/${day}"

  mkdir -p "$day_dir"

  if [[ ! -f "${year_dir}/_index.md" ]]; then
    cat > "${year_dir}/_index.md" <<YEOF
+++
title = '${year}'
date_scope = 'year'
archive_year = '${year}'
+++
YEOF
  fi

  if [[ ! -f "${month_dir}/_index.md" ]]; then
    cat > "${month_dir}/_index.md" <<MEOF
+++
title = '${year}-${month}'
date_scope = 'month'
archive_year = '${year}'
archive_month = '${month}'
+++
MEOF
  fi

  if [[ ! -f "${day_dir}/_index.md" ]]; then
    cat > "${day_dir}/_index.md" <<DEOF
+++
title = '${year}-${month}-${day}'
date_scope = 'day'
archive_year = '${year}'
archive_month = '${month}'
archive_day = '${day}'
+++
DEOF
  fi
done < "$tmp_dates"

rm -f "$tmp_dates"

echo "Date archive index pages generated."
