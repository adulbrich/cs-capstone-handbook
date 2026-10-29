# Combine Markdown files into one PDF, each file starting on a new page.
#
#   powershell -ExecutionPolicy Bypass -File pdf-submission.ps1 [-o out.pdf] file1.md file2.md ...
#
# Needs pandoc (winget install JohnMacFarlane.Pandoc) and Google Chrome,
# Chromium, or Microsoft Edge. Set CHROME to a browser path to pick one.
# Mermaid diagrams are rendered as images; that step downloads Mermaid,
# so it needs a network connection.

# Without PositionalBinding off, a lone file name would bind to -Output.
[CmdletBinding(PositionalBinding = $false)]
param(
  [Alias('o')] [string] $Output,
  [Parameter(ValueFromRemainingArguments = $true)] [string[]] $Files
)

$ErrorActionPreference = 'Stop'
$MermaidUrl = 'https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.min.js'

function Fail([string] $message) {
  [Console]::Error.WriteLine("pdf-submission: $message")
  exit 1
}

if (-not $Files -or $Files.Count -eq 0) {
  [Console]::Error.WriteLine('usage: pdf-submission.ps1 [-o out.pdf] file1.md [file2.md ...]')
  exit 2
}

$inputFiles = @()
foreach ($f in $Files) {
  if (-not (Test-Path -LiteralPath $f -PathType Leaf)) { Fail "no such file: $f" }
  if ($f -notmatch '\.(md|markdown)$') { Fail "not a Markdown file: $f" }
  $inputFiles += (Resolve-Path -LiteralPath $f).ProviderPath
}

if (-not $Output) {
  $Output = [IO.Path]::GetFileNameWithoutExtension($inputFiles[0]) + '.pdf'
}
# Chrome runs with its own working directory, so hand it an absolute path.
$Output = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($Output)

if (-not (Get-Command pandoc -ErrorAction SilentlyContinue)) {
  Fail 'pandoc not found. Install it: winget install JohnMacFarlane.Pandoc (Windows), brew install pandoc (macOS), or https://pandoc.org/installing.html'
}

function Find-Chrome {
  if ($env:CHROME) { return $env:CHROME }
  foreach ($exe in 'chrome.exe', 'msedge.exe') {
    foreach ($hive in 'HKCU:', 'HKLM:') {
      $key = "$hive\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\$exe"
      if (Test-Path $key) {
        $path = (Get-ItemProperty $key).'(default)'
        if ($path -and (Test-Path -LiteralPath $path)) { return $path }
      }
    }
  }
  foreach ($name in 'chrome', 'msedge', 'google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser', 'microsoft-edge') {
    $cmd = Get-Command $name -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($cmd) { return $cmd.Source }
  }
  foreach ($path in @(
      "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
      "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
      "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe",
      "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge')) {
    if (Test-Path -LiteralPath $path) { return $path }
  }
}
$chrome = Find-Chrome
if (-not $chrome) { Fail 'no Chrome, Chromium, or Edge found. Install one, or set CHROME to its path.' }

$tmp = Join-Path ([IO.Path]::GetTempPath()) ('pdf-submission.' + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $tmp | Out-Null

try {
  $style = @'
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
'@
  # Pandoc puts a fenced mermaid block in <pre class="mermaid"><code>; Mermaid
  # wants the diagram source directly in the <pre>, so unwrap it, then render.
  $mermaid = @"
<script src="$MermaidUrl"></script>
<script>
document.addEventListener("DOMContentLoaded", async () => {
  for (const pre of document.querySelectorAll("pre.mermaid")) pre.textContent = pre.textContent;
  mermaid.initialize({ startOnLoad: false, theme: "neutral" });
  await mermaid.run({ querySelector: "pre.mermaid" });
});
</script>
"@
  # WriteAllText writes UTF-8 without a byte-order mark on every PowerShell.
  [IO.File]::WriteAllText((Join-Path $tmp 'style.html'), $style)
  [IO.File]::WriteAllText((Join-Path $tmp 'mermaid.html'), $mermaid)
  $break = Join-Path $tmp 'break.md'
  [IO.File]::WriteAllText($break, "<div class=`"page-break`"></div>`n")

  # Interleave a page break between the files. rebase_relative_paths resolves
  # each image against its own file's folder, so files can live anywhere.
  $inputs = @()
  foreach ($f in $inputFiles) {
    if ($inputs.Count -gt 0) { $inputs += $break }
    $inputs += $f
  }

  $headers = @('--include-in-header', (Join-Path $tmp 'style.html'))
  if (Select-String -LiteralPath $inputFiles -Pattern '^\s*(```|~~~)\s*\{?\.?mermaid' -Quiet) {
    $headers += @('--include-in-header', (Join-Path $tmp 'mermaid.html'))
  }

  $html = Join-Path $tmp 'submission.html'
  $title = [IO.Path]::GetFileNameWithoutExtension($Output)
  & pandoc -f gfm+rebase_relative_paths -t html5 --standalone --embed-resources `
    --metadata "pagetitle=$title" @headers -o $html @inputs
  if ($LASTEXITCODE -ne 0) { Fail 'pandoc could not convert the Markdown' }

  if (Test-Path -LiteralPath $Output) { Remove-Item -LiteralPath $Output }
  $chromeArgs = @(
    '--headless', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    "--user-data-dir=$(Join-Path $tmp 'profile')", '--no-pdf-header-footer',
    '--run-all-compositor-stages-before-draw', '--virtual-time-budget=15000',
    "--print-to-pdf=$Output", [Uri]::new($html, [UriKind]::Absolute).AbsoluteUri
  )
  # Chrome logs to stderr even on success; under 'Stop', Windows PowerShell
  # would turn that into an error, so collect it and report it only on failure.
  $ErrorActionPreference = 'Continue'
  $log = & $chrome @chromeArgs 2>&1 | Out-String
  $ErrorActionPreference = 'Stop'

  if (-not (Test-Path -LiteralPath $Output) -or (Get-Item -LiteralPath $Output).Length -eq 0) {
    [Console]::Error.WriteLine($log)
    Fail "the browser did not write $Output"
  }
  Write-Output "Wrote $Output"
}
finally {
  Remove-Item -LiteralPath $tmp -Recurse -Force -ErrorAction SilentlyContinue
}
