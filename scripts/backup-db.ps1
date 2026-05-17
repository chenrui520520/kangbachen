# Backup PostgreSQL (docker-compose.prod postgres service or local DATABASE_URL)
param(
  [string]$OutDir = "backups",
  [string]$ComposeFile = "docker-compose.prod.yml"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

if (-not (Test-Path $OutDir)) {
  New-Item -ItemType Directory -Path $OutDir | Out-Null
}

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$outFile = Join-Path $OutDir "KENBA-$stamp.sql.gz"

$container = (docker compose -f $ComposeFile ps -q postgres 2>$null)
if ($container) {
  Write-Host "Backing up from docker postgres -> $outFile"
  docker compose -f $ComposeFile exec -T postgres pg_dump -U postgres KENBA | gzip > $outFile
} else {
  Write-Host "Docker postgres not running. Set DATABASE_URL in .env and use pg_dump locally."
  if (-not $env:DATABASE_URL) {
    Get-Content .env | ForEach-Object {
      if ($_ -match '^DATABASE_URL=(.+)$') { $env:DATABASE_URL = $matches[1].Trim('"') }
    }
  }
  if (-not $env:DATABASE_URL) { throw "DATABASE_URL not found" }
  pg_dump $env:DATABASE_URL | gzip > $outFile
}

Write-Host "Done: $outFile"
