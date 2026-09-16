import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const modules = process.env.CONTENT_QA_MODULES || path.join(os.tmpdir(), "capsulasdev-content-qa", "node_modules");
const { JSDOM } = require(path.join(modules, "jsdom"));
const read = file => fs.readFileSync(new URL(file, import.meta.url), "utf8");

function prepare(url = "https://capsulasdev.com/") {
  const window = new JSDOM(read("index.html"), { url, runScripts: "outside-only" }).window;
  window.eval(read("learning-state.js"));
  window.eval(read("learning-experience.js"));
  window.eval(read("onboarding.js"));
  return window;
}

{
  const window = prepare();
  const document = window.document;
  document.querySelector("[data-onboarding-open]").click();
  const dialog = document.querySelector("#onboarding-dialog");
  assert.equal(dialog.hasAttribute("open"), true, "Empezar desde cero abre la orientación");
  assert.match(document.querySelector("#onboarding-title").textContent, /qué te gustaría lograr/i);
  assert.equal(document.querySelector(".onboarding-progress").getAttribute("aria-valuenow"), "1");

  for (const value of ["web", "project", "none", "steady"]) {
    document.querySelector(`[data-onboarding-choice="${value}"]`).click();
  }
  assert.match(document.querySelector("#onboarding-title").textContent, /Desarrollo web/);
  assert.match(document.querySelector(".onboarding-result-summary").textContent, /2–3 horas por semana/);
  assert.deepEqual([...document.querySelectorAll(".onboarding-curve strong")].map(node => node.textContent), [
    "HTML y CSS", "JavaScript, Git y APIs", "TypeScript y React"
  ]);
  assert.match(document.querySelector("#onboarding-capi-image").src, /capi-celebrate\.svg\?v=20260914-capi3$/);
  assert.equal(window.LearningState.itinerario(), null, "la recomendación no se guarda antes de elegirla");
  const accept = document.querySelector("[data-onboarding-accept]");
  accept.addEventListener("click", event => event.preventDefault(), { capture: true });
  accept.click();
  assert.equal(window.LearningState.itinerario(), "web");
  window.close();
}

{
  const window = prepare("https://capsulasdev.com/?onboarding=1&revision=septiembre-2026");
  assert.equal(window.document.querySelector("#onboarding-dialog").hasAttribute("open"), true, "Mi cuenta puede abrir la orientación mediante la URL");
  const result = window.LearningOnboarding.recommendation({ aspiration: "workflow", motivation: "work", experience: "basics", time: "focused" });
  assert.equal(result.id, "herramientas");
  assert.equal(result.href, "terminal.html");
  assert.match(result.experienceCopy, /repaso/);
  window.close();
}

{
  const account = new JSDOM(read("cuenta.html"), { url: "https://capsulasdev.com/cuenta.html", runScripts: "outside-only" }).window;
  const changeLink = account.document.querySelector(".account-onboarding-link");
  assert.ok(changeLink, "Mi cuenta ofrece repetir la orientación");
  assert.match(changeLink.href, /index\.html\?onboarding=1$/);
  account.close();
}

console.log("Onboarding: 4 preguntas, recomendación, ritmo, curva, selección explícita y acceso desde Mi cuenta: OK");
