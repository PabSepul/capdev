[CmdletBinding()]
param([Parameter(Mandatory)][string]$ArchivePath)

$ErrorActionPreference = "Stop"
$fullPath = [IO.Path]::GetFullPath($ArchivePath)
if (-not (Test-Path -LiteralPath $fullPath)) { throw "No existe el archivo indicado." }
$configPath = Join-Path (Join-Path $env:LOCALAPPDATA "CapsulasDev") "backup-secrets.json"
$config = Get-Content -Raw -LiteralPath $configPath | ConvertFrom-Json
$sevenZip = "C:\Program Files\7-Zip\7z.exe"
if (-not (Test-Path -LiteralPath $sevenZip)) { throw "No encontre 7-Zip." }
$secure = ConvertTo-SecureString ([string]$config.archivePassword)
$pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
try {
  $password = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
  & $sevenZip t "-p$password" $fullPath
  if ($LASTEXITCODE -ne 0) { throw "El archivo no paso la verificacion." }
} finally {
  $password = $null
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
}
Write-Output "Archivo cifrado integro: $fullPath"
