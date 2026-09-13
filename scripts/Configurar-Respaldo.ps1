[CmdletBinding()]
param(
  [string]$HostName = "aws-0-sa-east-1.pooler.supabase.com",
  [int]$Port = 5432,
  [string]$Database = "postgres",
  [string]$DatabaseUser = "postgres.neofezxmcrmrijzxuqjo",
  [string]$OutputDirectory = "",
  [ValidateRange(1,365)][int]$RetentionDays = 30
)

$ErrorActionPreference = "Stop"
$secretDirectory = Join-Path $env:LOCALAPPDATA "CapsulasDev"
$configPath = Join-Path $secretDirectory "backup-secrets.json"
if (-not $OutputDirectory) {
  $oneDrive = $env:OneDriveConsumer
  if (-not $oneDrive) { $oneDrive = $env:OneDrive }
  if (-not $oneDrive) { throw "No encontre OneDrive. Indica -OutputDirectory con una carpeta sincronizada." }
  $OutputDirectory = Join-Path $oneDrive "CapsulasDev-Respaldos"
}

$databasePassword = Read-Host "Contrasena actual de la base Supabase" -AsSecureString
$archivePassword = Read-Host "Contrasena para cifrar los respaldos" -AsSecureString
$archiveConfirmation = Read-Host "Repite la contrasena de cifrado" -AsSecureString
function ConvertTo-TemporaryText([Security.SecureString]$Value) {
  $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Value)
  try { [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer) }
  finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer) }
}
$first = ConvertTo-TemporaryText $archivePassword
$second = ConvertTo-TemporaryText $archiveConfirmation
try {
  if ($first -cne $second) { throw "Las contrasenas de cifrado no coinciden." }
  if ($first.Length -lt 14) { throw "Usa una contrasena de cifrado de al menos 14 caracteres." }
} finally {
  $first = $null
  $second = $null
}

New-Item -ItemType Directory -Path $secretDirectory -Force | Out-Null
New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null
$configuration = [ordered]@{
  host = $HostName
  port = $Port
  database = $Database
  user = $DatabaseUser
  outputDirectory = [IO.Path]::GetFullPath($OutputDirectory)
  retentionDays = $RetentionDays
  databasePassword = ConvertFrom-SecureString $databasePassword
  archivePassword = ConvertFrom-SecureString $archivePassword
}
$configuration | ConvertTo-Json | Set-Content -LiteralPath $configPath -Encoding utf8
Write-Output "Configuracion protegida para este usuario de Windows: $configPath"
Write-Output "Los archivos cifrados se guardaran en: $($configuration.outputDirectory)"
Write-Output "La contrasena queda protegida con DPAPI y no se guarda en el repositorio."

