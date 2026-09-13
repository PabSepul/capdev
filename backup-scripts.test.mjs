import assert from "node:assert/strict";
import fs from "node:fs";
import { spawnSync } from "node:child_process";

const files = [
  "scripts/Configurar-Respaldo.ps1",
  "scripts/Respaldar-Supabase.ps1",
  "scripts/Programar-Respaldo.ps1",
  "scripts/Verificar-Respaldo.ps1"
];
for (const file of files) {
  const result = spawnSync("pwsh", ["-NoProfile", "-Command",
    `$errors=$null;[System.Management.Automation.Language.Parser]::ParseFile('${file.replaceAll("'", "''")}',[ref]$null,[ref]$errors)|Out-Null;if($errors.Count){$errors|ForEach-Object{Write-Error $_};exit 1}`],
    { encoding: "utf8" });
  assert.equal(result.status, 0, `${file}: ${result.stderr || result.stdout}`);
}

const configure = fs.readFileSync(files[0], "utf8");
const backup = fs.readFileSync(files[1], "utf8");
assert.match(configure, /Read-Host[^\n]+-AsSecureString/);
assert.match(configure, /ConvertFrom-SecureString/);
assert.doesNotMatch(configure + backup, /pablosepulvedadzd@gmail\.com/i, "el correo privado no entra en scripts ni configuración");
assert.match(backup, /--schema=public/);
assert.match(backup, /--schema=auth/);
assert.match(backup, /pgRestore --list/);
assert.match(backup, /-mhe=on/);
assert.match(backup, /\$sevenZip t/);
assert.match(backup, /Remove-Item Env:PGPASSWORD/);
assert.match(backup, /retentionDays/);
assert.match(backup, /backup-work/);
assert.match(backup, /\$dumpPath = Join-Path \$workDirectory/);
assert.match(backup, /StartsWith\(\$workDirectory/);
assert.match(backup, /\$dumpExitCode -ne 0[\s\S]+Remove-Item -LiteralPath \$partialDump/);

console.log("Respaldos: 4 scripts válidos, secretos DPAPI, dump local, verificación, cifrado y retención: OK");
