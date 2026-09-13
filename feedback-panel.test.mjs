import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";

const require=createRequire(import.meta.url);
const {JSDOM}=require(path.join(process.env.CONTENT_QA_MODULES || path.join(os.tmpdir(),"capsulasdev-content-qa","node_modules"),"jsdom"));
const template=fs.readFileSync(new URL("tools/feedback-panel-template.html",import.meta.url),"utf8");
const fixture={generatedAt:"2026-09-13T18:00:00-03:00",groups:[
  {route:"python",module:0,value:"claro",area:null,count:3},
  {route:"python",module:0,value:"mejorar",area:"explicacion",count:2},
  {route:"javascript",module:1,value:"mejorar",area:"pistas",count:1}
]};
const html=template.replace("__CAPSULASDEV_FEEDBACK_DATA__",JSON.stringify(fixture));
const dom=new JSDOM(html,{runScripts:"dangerously"});
assert.equal(dom.window.document.querySelector("#metric-total").textContent,"6");
assert.equal(dom.window.document.querySelector("#metric-clear").textContent,"50%");
assert.equal(dom.window.document.querySelector("#metric-modules").textContent,"2");
assert.equal(dom.window.document.querySelector("#metric-priority").textContent,"Explicación");
assert.equal(dom.window.document.querySelectorAll("#module-rows tr").length,2);
const filter=dom.window.document.querySelector("#route-filter");
filter.value="javascript"; filter.dispatchEvent(new dom.window.Event("change"));
assert.equal(dom.window.document.querySelectorAll("#module-rows tr").length,1);
assert.match(dom.window.document.querySelector("#module-rows").textContent,/Cápsula 2/);
dom.window.close();

const script="scripts/Generar-Panel-Feedback.ps1";
const scriptSource=fs.readFileSync(new URL(script,import.meta.url),"utf8");
assert.doesNotMatch(scriptSource,/select[^;]*user_id|jsonb_build_object\([^)]*user_id/is,"la consulta no exporta identificadores");
const parse=spawnSync("pwsh",["-NoProfile","-Command",`$errors=$null;[System.Management.Automation.Language.Parser]::ParseFile('${script}',[ref]$null,[ref]$errors)|Out-Null;if($errors.Count){$errors|ForEach-Object{Write-Error $_};exit 1}`],{encoding:"utf8"});
assert.equal(parse.status,0,parse.stderr||parse.stdout);
const temp=fs.mkdtempSync(path.join(os.tmpdir(),"capsulasdev-feedback-")),dataPath=path.join(temp,"fixture.json");
fs.writeFileSync(dataPath,JSON.stringify(fixture));
const generated=spawnSync("pwsh",["-NoProfile","-File",script,"-DataFile",dataPath,"-OutputDirectory",temp],{encoding:"utf8"});
assert.equal(generated.status,0,generated.stderr||generated.stdout);
const report=fs.readdirSync(temp).find(name=>name.endsWith(".html"));
assert.ok(report,"el script genera el informe HTML");
assert.doesNotMatch(fs.readFileSync(path.join(temp,report),"utf8"),/__CAPSULASDEV_FEEDBACK_DATA__/);
fs.rmSync(temp,{recursive:true,force:true});

console.log("Panel de feedback: agregación, prioridad, filtro y generación local sin datos personales: OK");
