#!/usr/bin/env bash
# Combine Markdown files into one PDF, each file starting on a new page.
#
#   bash pdf-submission.sh [-o out.pdf] file1.md file2.md ...
#
# Needs pandoc (https://pandoc.org/installing.html) and Google Chrome,
# Chromium, or Microsoft Edge. Set CHROME to a browser path to pick one.
# Mermaid diagrams are rendered as images; that step downloads Mermaid,
# so it needs a network connection.

set -euo pipefail

MERMAID_URL="https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.min.js"

usage() {
  echo "usage: bash pdf-submission.sh [-o out.pdf] file1.md [file2.md ...]" >&2
  exit 2
}

die() {
  echo "pdf-submission: $*" >&2
  exit 1
}

out=""
while getopts ":o:h" opt; do
  case "$opt" in
    o) out="$OPTARG" ;;
    *) usage ;;
  esac
done
shift $((OPTIND - 1))
[ $# -ge 1 ] || usage

for f in "$@"; do
  [ -f "$f" ] || die "no such file: $f"
  case "$f" in
    *.md | *.markdown) ;;
    *) die "not a Markdown file: $f" ;;
  esac
done

if [ -z "$out" ]; then
  first="$(basename "$1")"
  out="${first%.*}.pdf"
fi
case "$out" in
  /*) ;;
  *) out="$PWD/$out" ;;
esac

command -v pandoc >/dev/null 2>&1 || die "pandoc not found. Install it: brew install pandoc (macOS), sudo apt install pandoc (Linux), or https://pandoc.org/installing.html"

find_chrome() {
  if [ -n "${CHROME:-}" ]; then
    echo "$CHROME"
    return
  fi
  local name app
  for name in google-chrome google-chrome-stable chromium chromium-browser microsoft-edge microsoft-edge-stable; do
    if command -v "$name" >/dev/null 2>&1; then
      command -v "$name"
      return
    fi
  done
  for app in \
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
    "/Applications/Chromium.app/Contents/MacOS/Chromium" \
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"; do
    if [ -x "$app" ]; then
      echo "$app"
      return
    fi
  done
}
chrome="$(find_chrome)"
[ -n "$chrome" ] || die "no Chrome, Chromium, or Edge found. Install one, or set CHROME to its path."

tmp="$(mktemp -d "${TMPDIR:-/tmp}/pdf-submission.XXXXXX")"
trap 'rm -rf "$tmp"' EXIT

cat >"$tmp/style.html" <<'EOF'
<style>
@page { size: Letter; margin: 2cm; }
body { font: 11pt/1.5 -apple-system, "Segoe UI", Helvetica, Arial, sans-serif; color: #1f2328; max-width: none; margin: 0; }
h1, h2, h3, h4 { line-height: 1.25; break-after: avoid; }
h1, h2 { border-bottom: 1px solid #d1d9e0; padding-bottom: .3em; }
img, svg { max-width: 100%; }
table { border-collapse: collapse; margin: 1em 0; }
th, td { border: 1px solid #d1d9e0; padding: .3em .7em; vertical-align: top; }
tr, img, pre, .mermaid { break-inside: avoid; }
pre { background: #f6f8fa; padding: .8em; border-radius: 4px; white-space: pre-wrap; }
code { font: .9em ui-monospace, Menlo, Consolas, monospace; }
pre.mermaid { background: none; text-align: center; }
blockquote { margin-left: 0; padding-left: 1em; border-left: .25em solid #d1d9e0; color: #59636e; }
.page-break { break-before: page; }
</style>
EOF

# Pandoc puts a fenced mermaid block in <pre class="mermaid"><code>; Mermaid
# wants the diagram source directly in the <pre>, so unwrap it, then render.
cat >"$tmp/mermaid.html" <<EOF
<script src="$MERMAID_URL"></script>
<script>
document.addEventListener("DOMContentLoaded", async () => {
  for (const pre of document.querySelectorAll("pre.mermaid")) pre.textContent = pre.textContent;
  mermaid.initialize({ startOnLoad: false, theme: "neutral" });
  await mermaid.run({ querySelector: "pre.mermaid" });
});
</script>
EOF

echo '<div class="page-break"></div>' >"$tmp/break.md"

# Interleave a page break between the files. rebase_relative_paths resolves
# each image against its own file's folder, so files can live anywhere.
inputs=()
for f in "$@"; do
  [ ${#inputs[@]} -eq 0 ] || inputs+=("$tmp/break.md")
  inputs+=("$f")
done

headers=(--include-in-header "$tmp/style.html")
if grep -qE '^[[:space:]]*(```|~~~)[[:space:]]*\{?\.?mermaid' "$@"; then
  headers+=(--include-in-header "$tmp/mermaid.html")
fi

title="$(basename "${out%.*}")"
pandoc -f gfm+rebase_relative_paths -t html5 --standalone --embed-resources \
  --metadata pagetitle="$title" "${headers[@]}" \
  -o "$tmp/submission.html" "${inputs[@]}" ||
  die "pandoc could not convert the Markdown"

rm -f "$out"
"$chrome" --headless --disable-gpu --no-first-run --no-default-browser-check \
  --user-data-dir="$tmp/profile" --no-pdf-header-footer \
  --run-all-compositor-stages-before-draw --virtual-time-budget=15000 \
  --print-to-pdf="$out" "file://$tmp/submission.html" >"$tmp/chrome.log" 2>&1 || true

if [ ! -s "$out" ]; then
  cat "$tmp/chrome.log" >&2
  die "the browser did not write $out"
fi
echo "Wrote $out"
