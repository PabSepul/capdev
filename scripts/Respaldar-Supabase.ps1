[CmdletBinding()]
param([switch]$KeepDump)

$ErrorActionPreference = "Stop"
$configPath = Join-Path (Join-Path $env:LOCALAPPDATA "CapsulasDev") "backup-secrets.json"
if (-not (Test-Path -LiteralPath $configPath)) {
  throw "Falta la configuracion. Ejecuta primero scripts\Configurar-Respaldo.ps1."
}
$config = Get-Content -Raw -LiteralPath $configPath | ConvertFrom-Json
$outputDirectory = [IO.Path]::GetFullPath([string]$config.outputDirectory)
New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
$workDirectory = [IO.Path]::GetFullPath((Join-Path (Join-Path $env:LOCALAPPDATA "CapsulasDev") "backup-work"))
New-Item -ItemType Directory -Path $workDirectory -Force | Out-Null

function Find-Executable([string[]]$Candidates, [string]$Name) {
  foreach ($candidate in $Candidates) {
    if ($candidate -and (Test-Path -LiteralPath $candidate)) { return $candidate }
  }
  $command = Get-Command $Name -ErrorAction SilentlyContinue
  if ($command) { return $command.Source }
  throw "No encontre $Name. Instala PostgreSQL Select Components y 7-Zip antes de programar el respaldo."
}
function ConvertTo-TemporaryText([string]$Encrypted) {
  $secure = ConvertTo-SecureString $Encrypted
  $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try { [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer) }
  finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer) }
}

$pgDump = Find-Executable @(
  "C:\Program Files\PostgreSQL\18\bin\pg_dump.exe",
  "C:\Program Files\PostgreSQL\17\bin\pg_dump.exe"
) "pg_dump"
$pgRestore = Join-Path (Split-Path -Parent $pgDump) "pg_restore.exe"
if (-not (Test-Path -LiteralPath $pgRestore)) { throw "No encontre pg_restore junto a pg_dump." }
$sevenZip = Find-Executable @("C:\Program Files\7-Zip\7z.exe") "7z"

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$dumpPath = Join-Path $workDirectory "capsulasdev-$stamp.dump"
$archivePath = Join-Path $outputDirectory "capsulasdev-$stamp.7z"
$logPath = Join-Path $outputDirectory "backup-history.log"
$databasePassword = ConvertTo-TemporaryText ([string]$config.databasePassword)
try {
  $env:PGPASSWORD = $databasePassword
  & $pgDump "--host=$($config.host)" "--port=$($config.port)" "--username=$($config.user)" "--dbname=$($config.database)" --format=custom --schema=public --schema=auth "--file=$dumpPath"
  $dumpExitCode = $LASTEXITCODE
} finally {
  Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
  $databasePassword = $null
}
if ($dumpExitCode -ne 0) {
  $partialDump = [IO.Path]::GetFullPath($dumpPath)
  if ($partialDump.StartsWith($workDirectory + [IO.Path]::DirectorySeparatorChar,[StringComparison]::OrdinalIgnoreCase) -and (Test-Path -LiteralPath $partialDump)) {
    Remove-Item -LiteralPath $partialDump -Force
  }
  throw "pg_dump termino con codigo $dumpExitCode. Comprueba la contrasena de la base en Configurar-Respaldo.ps1."
}
if (-not (Test-Path -LiteralPath $dumpPath) -or (Get-Item -LiteralPath $dumpPath).Length -le 0) {
  throw "El archivo de respaldo esta vacio o no fue creado."
}

$contents = & $pgRestore --list $dumpPath
if ($LASTEXITCODE -ne 0) { throw "pg_restore no pudo leer el respaldo." }
foreach ($required in @("TABLE DATA auth users", "TABLE DATA auth identities", "TABLE DATA public learning_profiles", "TABLE DATA public learning_routes", "TABLE DATA public learning_operations", "TABLE DATA public learning_drafts")) {
  if (-not ($contents -match [regex]::Escape($required))) { throw "El respaldo no contiene la entrada requerida: $required" }
}

$archivePassword = ConvertTo-TemporaryText ([string]$config.archivePassword)
try {
  & $sevenZip a -t7z -m0=lzma2 -mhe=on "-p$archivePassword" $archivePath $dumpPath | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "7-Zip no pudo cifrar el respaldo." }
  & $sevenZip t "-p$archivePassword" $archivePath | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "7-Zip no pudo verificar el archivo cifrado." }
} finally {
  $archivePassword = $null
}

if (-not $KeepDump) {
  $resolvedDump = [IO.Path]::GetFullPath($dumpPath)
  if (-not $resolvedDump.StartsWith($workDirectory + [IO.Path]::DirectorySeparatorChar,[StringComparison]::OrdinalIgnoreCase)) {
    throw "La ruta temporal salio de la carpeta de trabajo; no se eliminara."
  }
  Remove-Item -LiteralPath $resolvedDump -Force
}

$cutoff = (Get-Date).AddDays(-[int]$config.retentionDays)
Get-ChildItem -LiteralPath $outputDirectory -File -Filter "capsulasdev-*.7z" |
  Where-Object { $_.CreationTime -lt $cutoff } |
  ForEach-Object { Remove-Item -LiteralPath $_.FullName -Force }

$size = (Get-Item -LiteralPath $archivePath).Length
"$(Get-Date -Format o)`tOK`t$archivePath`t$size bytes" | Add-Content -LiteralPath $logPath -Encoding utf8
Write-Output "Respaldo cifrado y verificado: $archivePath"
Write-Output "Tamano: $size bytes. Retencion aplicada: $($config.retentionDays) dias."
