import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const modules = process.env.CONTENT_QA_MODULES || path.join(os.tmpdir(), "capsulasdev-content-qa", "node_modules");
const { JSDOM } = require(path.join(modules, "jsdom"));
const read = file => fs.readFileSync(new URL(file, import.meta.url), "utf8");
for (const pose of ["welcome", "thinking", "guide", "celebrate"]) {
  assert.ok(fs.existsSync(new URL(`./assets/capi-${pose}.svg`, import.meta.url)), `falta la pose ${pose} de Capi`);
}
const thinkingCapi = read("assets/capi-thinking.svg");
const guideCapi = read("assets/capi-guide.svg");
assert.match(thinkingCapi, /id="capi-arms"/, "Capi pensando conserva sus dos brazos visibles");
assert.match(guideCapi, /id="capi-arms"/, "Capi orientando conserva sus dos brazos visibles");
assert.match(thinkingCapi, /id="capi-question"[\s\S]*stroke="#f9faf6" stroke-width="10"/, "la interrogación tiene un contorno claro para el modo oscuro");
const thinkingArms = thinkingCapi.match(/<g id="capi-arms">([\s\S]*?)<\/g>/)?.[1] || "";
const guideArms = guideCapi.match(/<g id="capi-arms">([\s\S]*?)<\/g>/)?.[1] || "";
assert.doesNotMatch(thinkingArms, /stroke="#f9faf6"/, "el contorno claro se limita a la interrogación");
assert.doesNotMatch(guideArms, /stroke="#f9faf6"/, "los brazos de orientación no tienen contorno claro");

{
  const window = new JSDOM(read("index.html"), { url: "https://capsulasdev.com/?revision=septiembre-2026", runScripts: "outside-only" }).window;
  window.document.documentElement.dataset.review = "septiembre-2026";
  window.eval(read("learning-state.js"));
  window.eval(read("learning-experience.js"));
  assert.equal(window.document.querySelectorAll(".home-capi-intro").length, 1, "Capi se presenta una sola vez");
  const cards = window.document.querySelectorAll("[data-itinerary]");
  assert.equal(cards.length, 3);
  assert.equal(window.LearningState.itinerario(), null);
  cards[1].querySelector("[data-choose-itinerary]").click();
  assert.equal(window.LearningState.itinerario(), "python-datos");
  assert.equal(cards[1].classList.contains("is-selected"), true);
  assert.equal(cards[1].querySelector("[data-choose-itinerary]").getAttribute("aria-pressed"), "true");
  assert.match(window.document.querySelector("#itinerary-status").textContent, /Python y datos/);
  assert.match(cards[1].querySelector("[data-itinerary-resume]").href, /python\.html\?revision=septiembre-2026/);
  window.close();
}

{
  const window = new JSDOM(read("python.html"), { url: "https://capsulasdev.com/python.html?revision=septiembre-2026", runScripts: "outside-only" }).window;
  window.eval(read("learning-state.js"));
  window.LearningState.seleccionarItinerario("python-datos");
  window.eval(read("learning-experience.js"));
  assert.equal(Object.keys(window.LearningExperience.routeTips).length, 19, "cada ruta tiene orientación propia de Capi");
  const orientation = window.document.querySelector("#route-orientation");
  assert.match(orientation.textContent, /PASO 1 DE 5/);
  assert.match(orientation.textContent, /Después continúa con SQL/);
  assert.match(orientation.textContent, /instrucción pequeña puede convertirse/);
  assert.match(orientation.querySelector("img").src, /capi-guide\.svg\?v=20260914-capi3$/);
  assert.equal(window.document.querySelectorAll(".capi-hint-character").length, 1, "Capi acompaña las pistas sin duplicarse");
  assert.equal(window.document.querySelectorAll(".capi-checkpoint-note").length, 1, "Capi aparece en el punto de control");
  assert.equal(window.document.querySelectorAll(".capi-exam-guide").length, 1, "Capi acompaña el mini examen");
  assert.equal(window.document.querySelectorAll(".capi-finish-character").length, 1, "Capi celebra el cierre de ruta");
  window.LearningExperience.showExamResult({ passed: true, correct: 5, total: 5 });
  assert.match(window.document.querySelector(".capi-exam-guide img").src, /capi-celebrate\.svg\?v=20260914-capi3$/);
  assert.match(window.document.querySelector(".capi-exam-guide span").textContent, /5 de 5/);
  window.LearningExperience.showExamResult({ passed: false, correct: 2, total: 5 });
  assert.match(window.document.querySelector(".capi-exam-guide img").src, /capi-thinking\.svg\?v=20260914-capi3$/);
  assert.match(window.document.querySelector(".capi-exam-guide span").textContent, /vuelve a probar/);
  window.LearningExperience.setModule("python", 0, { title: "Tu primer mensaje" });
  const feedback = window.document.querySelector("#exercise-feedback");
  assert.equal(feedback.hidden, true, "la pregunta aparece después de interactuar con el ejercicio");
  window.LearningExperience.showFeedback({ passed: false, error: true });
  assert.equal(feedback.hidden, false);
  assert.match(feedback.querySelector(".capi-feedback-character").src, /capi-thinking\.svg\?v=20260914-capi3$/);
  assert.match(feedback.querySelector(".capi-coach-message").textContent, /error con calma/);
  window.LearningExperience.showFeedback({ passed: true, error: false });
  assert.match(feedback.querySelector(".capi-feedback-character").src, /capi-celebrate\.svg\?v=20260914-capi3$/);
  assert.match(feedback.querySelector(".capi-coach-message").textContent, /Buen avance/);
  const adaptiveHelp = feedback.querySelector(".capi-adaptive-help");
  const adaptiveButton = adaptiveHelp.querySelector("[data-adaptive-hint]");
  const hintButton = window.document.querySelector("#show-hint");
  let requestedHints = 0;
  hintButton.addEventListener("click", () => { requestedHints += 1; });
  window.LearningState.registrarIntento("python", 0, { aprobado: false, error: false });
  window.LearningExperience.showFeedback({ passed: false, error: false });
  assert.equal(adaptiveHelp.hidden, true, "el primer intento conserva la orientación general");
  window.LearningState.registrarIntento("python", 0, { aprobado: false, error: false });
  window.LearningExperience.showFeedback({ passed: false, error: false });
  assert.equal(adaptiveHelp.hidden, false, "Capi ofrece ayuda adaptativa desde el segundo intento");
  assert.match(adaptiveHelp.textContent, /PRIMER APOYO/);
  assert.match(feedback.querySelector(".capi-coach-message").textContent, /dos intentos/);
  adaptiveButton.click();
  assert.equal(requestedHints, 1, "la ayuda adaptativa revela una sola pista por decisión de la persona");
  window.LearningState.registrarIntento("python", 0, { aprobado: false, error: false });
  window.LearningExperience.showFeedback({ passed: false, error: false });
  assert.match(adaptiveHelp.textContent, /SEGUNDO APOYO/);
  assert.match(adaptiveHelp.textContent, /concepto/);
  window.LearningState.registrarIntento("python", 0, { aprobado: false, error: true });
  window.LearningExperience.showFeedback({ passed: false, error: true });
  assert.match(adaptiveHelp.textContent, /AYUDA CONCRETA/);
  assert.match(feedback.querySelector(".capi-coach-message").textContent, /ayuda más concreta/);
  window.LearningExperience.showFeedback({ passed: true, error: false });
  assert.equal(adaptiveHelp.hidden, true, "la ayuda deja de ocupar espacio al superar la misión");
  feedback.querySelector('[data-feedback-value="mejorar"]').click();
  assert.equal(feedback.querySelector(".exercise-feedback-areas").hidden, false);
  feedback.querySelector('[data-feedback-area="mision"]').click();
  assert.deepEqual(JSON.parse(JSON.stringify(window.LearningState.feedback("python", 0))).valor, "mejorar");
  assert.equal(window.LearningState.feedback("python", 0).area, "mision");
  assert.match(feedback.querySelector(".exercise-feedback-status").textContent, /dispositivo/);
  assert.equal(feedback.querySelector('[data-feedback-area="mision"]').getAttribute("aria-pressed"), "true");
  window.close();
}

{
  const window = new JSDOM(read("html-css.html"), { url: "https://capsulasdev.com/html-css.html?revision=septiembre-2026", runScripts: "outside-only" }).window;
  window.eval(read("learning-state.js"));
  window.eval(read("learning-experience.js"));
  window.LearningExperience.setModule("html-css", 0, { title: "Título y párrafo" });
  window.LearningExperience.showFeedback({ passed: false, error: false });
  window.LearningExperience.showFeedback({ passed: false, error: false });
  const feedback = window.document.querySelector("#exercise-feedback");
  assert.equal(feedback.querySelector(".capi-adaptive-help").hidden, false, "la ayuda también cuenta intentos temporales de visitantes");
  const starterHint = window.document.querySelector("#starter-show-hint");
  let requestedHints = 0;
  starterHint.addEventListener("click", () => { requestedHints += 1; });
  feedback.querySelector("[data-adaptive-hint]").click();
  assert.equal(requestedHints, 1, "la misma ayuda adaptativa funciona en las otras 18 rutas");
  window.close();
}

console.log("Experiencia: 3 itinerarios, Capi, orientación, feedback y pistas adaptadas a los intentos: OK");
