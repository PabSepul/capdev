[CmdletBinding()]
param([ValidatePattern('^([01]\d|2[0-3]):[0-5]\d$')][string]$At = "03:00")

$ErrorActionPreference = "Stop"
$backupScript = Join-Path $PSScriptRoot "Respaldar-Supabase.ps1"
if (-not (Test-Path -LiteralPath $backupScript)) { throw "No encontre Respaldar-Supabase.ps1." }
$configPath = Join-Path (Join-Path $env:LOCALAPPDATA "CapsulasDev") "backup-secrets.json"
if (-not (Test-Path -LiteralPath $configPath)) { throw "Ejecuta primero Configurar-Respaldo.ps1." }
$parts = $At.Split(":")
$start = (Get-Date).Date.AddHours([int]$parts[0]).AddMinutes([int]$parts[1])
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$backupScript`""
$trigger = New-ScheduledTaskTrigger -Daily -At $start
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -MultipleInstances IgnoreNew
Register-ScheduledTask -TaskName "CapsulasDev - Respaldo diario" -Description "Respaldo cifrado diario de Supabase en OneDrive" -Action $action -Trigger $trigger -Settings $settings -Force | Out-Null
Write-Output "Tarea programada todos los dias a las $At."
Write-Output "Prueba ahora con: Start-ScheduledTask -TaskName 'CapsulasDev - Respaldo diario'"

