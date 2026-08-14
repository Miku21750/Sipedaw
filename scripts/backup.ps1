param([string]$OutputDirectory = ".\backups")
$ErrorActionPreference = "Stop"
if (-not $env:DATABASE_URL) { throw "DATABASE_URL belum tersedia di environment." }
$resolvedOutput = [System.IO.Path]::GetFullPath((Join-Path (Get-Location) $OutputDirectory))
New-Item -ItemType Directory -Path $resolvedOutput -Force | Out-Null
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$target = Join-Path $resolvedOutput "sipedaw-$stamp.dump"
pg_dump --format=custom --no-owner --file=$target $env:DATABASE_URL
if ($LASTEXITCODE -ne 0) { throw "pg_dump gagal dengan exit code $LASTEXITCODE" }
Write-Output "Backup selesai: $target"
