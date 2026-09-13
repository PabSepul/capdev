[CmdletBinding()]
param(
  [string]$OutputDirectory = "",
  [string]$DataFile = ""
)

$ErrorActionPreference = "Stop"
$templatePath = Join-Path (Split-Path -Parent $PSScriptRoot) "tools\feedback-panel-template.html"
if (-not (Test-Path -LiteralPath $templatePath)) { throw "No encontre la plantilla del panel." }
if (-not $OutputDirectory) { $OutputDirectory = Join-Path (Join-Path $env:LOCALAPPDATA "CapsulasDev") "reports" }
$OutputDirectory = [IO.Path]::GetFullPath($OutputDirectory)
New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null

if ($DataFile) {
  $json = Get-Content -Raw -LiteralPath $DataFile
} else {
  $configPath = Join-Path (Join-Path $env:LOCALAPPDATA "CapsulasDev") "backup-secrets.json"
  if (-not (Test-Path -LiteralPath $configPath)) { throw "Ejecuta primero Configurar-Respaldo.ps1." }
  $config = Get-Content -Raw -LiteralPath $configPath | ConvertFrom-Json
  $psql = @("C:\Program Files\PostgreSQL\18\bin\psql.exe","C:\Program Files\PostgreSQL\17\bin\psql.exe") | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
  if (-not $psql) { throw "No encontre psql 17 o 18." }
  $query = @"
with responses as (
  select lr.route, item.key::integer as module,
    item.value->>'valor' as value, nullif(item.value->>'area','') as area
  from public.learning_routes lr
  cross join lateral jsonb_each(coalesce(lr.state->'feedback','{}'::jsonb)) item
  where item.value->>'valor' in ('claro','mejorar')
), grouped as (
  select route,module,value,area,count(*)::integer as count
  from responses group by route,module,value,area
)
select jsonb_build_object(
  'generatedAt',to_char(clock_timestamp(),'YYYY-MM-DD"T"HH24:MI:SSOF'),
  'groups',coalesce(jsonb_agg(jsonb_build_object('route',route,'module',module,'value',value,'area',area,'count',count) order by route,module,value,area),'[]'::jsonb)
)::text from grouped;
"@
  $secure = ConvertTo-SecureString ([string]$config.databasePassword)
  $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try {
    $password = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
    $env:PGPASSWORD = $password
    $output = & $psql "--host=$($config.host)" "--port=$($config.port)" "--username=$($config.user)" "--dbname=$($config.database)" "--set=ON_ERROR_STOP=1" --no-psqlrc --no-align --tuples-only --command=$query
    if ($LASTEXITCODE -ne 0) { throw "No pude consultar el feedback." }
    $json = ($output -join "`n").Trim()
  } finally {
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
    $password = $null
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
  }
}

$data = $json | ConvertFrom-Json
if (-not $data.generatedAt -or $null -eq $data.groups) { throw "Los datos no tienen el formato esperado." }
$safeJson = ($data | ConvertTo-Json -Depth 8 -Compress).Replace("</","<\/")
$template = [IO.File]::ReadAllText($templatePath)
if (-not $template.Contains("__CAPSULASDEV_FEEDBACK_DATA__")) { throw "La plantilla no contiene el marcador de datos." }
$reportPath = Join-Path $OutputDirectory ("feedback-" + (Get-Date -Format "yyyyMMdd-HHmmss") + ".html")
$html = $template.Replace("__CAPSULASDEV_FEEDBACK_DATA__",$safeJson)
[IO.File]::WriteAllText($reportPath,$html,[Text.UTF8Encoding]::new($false))
Write-Output "Panel local generado: $reportPath"
