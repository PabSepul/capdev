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
  const orientation = window.document.querySelector("#route-orientation");
  assert.match(orientation.textContent, /PASO 1 DE 5/);
  assert.match(orientation.textContent, /Después continúa con SQL/);
  assert.match(orientation.querySelector("img").src, /capi-guide\.svg$/);
  assert.equal(window.document.querySelectorAll(".capi-hint-character").length, 1, "Capi acompaña las pistas sin duplicarse");
  window.LearningExperience.setModule("python", 0, { title: "Tu primer mensaje" });
  const feedback = window.document.querySelector("#exercise-feedback");
  assert.equal(feedback.hidden, true, "la pregunta aparece después de interactuar con el ejercicio");
  window.LearningExperience.showFeedback({ passed: false, error: true });
  assert.equal(feedback.hidden, false);
  assert.match(feedback.querySelector(".capi-feedback-character").src, /capi-thinking\.svg$/);
  assert.match(feedback.querySelector(".capi-coach-message").textContent, /error con calma/);
  window.LearningExperience.showFeedback({ passed: true, error: false });
  assert.match(feedback.querySelector(".capi-feedback-character").src, /capi-celebrate\.svg$/);
  assert.match(feedback.querySelector(".capi-coach-message").textContent, /Buen avance/);
  feedback.querySelector('[data-feedback-value="mejorar"]').click();
  assert.equal(feedback.querySelector(".exercise-feedback-areas").hidden, false);
  feedback.querySelector('[data-feedback-area="mision"]').click();
  assert.deepEqual(JSON.parse(JSON.stringify(window.LearningState.feedback("python", 0))).valor, "mejorar");
  assert.equal(window.LearningState.feedback("python", 0).area, "mision");
  assert.match(feedback.querySelector(".exercise-feedback-status").textContent, /dispositivo/);
  assert.equal(feedback.querySelector('[data-feedback-area="mision"]').getAttribute("aria-pressed"), "true");
  window.close();
}

console.log("Experiencia: 3 itinerarios, Capi en momentos de ayuda, orientación y feedback estructurado: OK");
