$ErrorActionPreference = 'Stop'
$sourceRoot = Split-Path -Parent $PSScriptRoot
$outputDirectory = Join-Path $sourceRoot 'dist'

if (Test-Path -LiteralPath $outputDirectory) {
  Remove-Item -LiteralPath $outputDirectory -Recurse -Force
}
New-Item -ItemType Directory -Path $outputDirectory | Out-Null

$excludedDirectories = @('.git', '.openai', 'dist', 'docs', 'scripts', 'tests', 'tools', 'node_modules')
$items = Get-ChildItem -LiteralPath $sourceRoot -Force
foreach ($item in $items) {
  if ($item.Name -in $excludedDirectories) { continue }
  Copy-Item -LiteralPath $item.FullName -Destination $outputDirectory -Recurse -Force
}

$requiredFiles = @('index.html', 'skin-analysis.html', 'profile.html', 'src/js/app/bootstrap.js', 'src/data/products.js')
foreach ($requiredFile in $requiredFiles) {
  if (-not (Test-Path -LiteralPath (Join-Path $outputDirectory $requiredFile))) {
    throw "Missing publish file: $requiredFile"
  }
}
