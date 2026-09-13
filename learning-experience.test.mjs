import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const modules = process.env.CONTENT_QA_MODULES || path.join(os.tmpdir(), "capsulasdev-content-qa", "node_modules");
const { JSDOM } = require(path.join(modules, "jsdom"));
const read = file => fs.readFileSync(new URL(file, import.meta.url), "utf8");

{
  const window = new JSDOM(read("index.html"), { url: "https://capsulasdev.com/?revision=septiembre-2026", runScripts: "outside-only" }).window;
  window.document.documentElement.dataset.review = "septiembre-2026";
  window.eval(read("learning-state.js"));
  window.eval(read("learning-experience.js"));
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
  window.LearningExperience.setModule("python", 0, { title: "Tu primer mensaje" });
  const feedback = window.document.querySelector("#exercise-feedback");
  assert.equal(feedback.hidden, true, "la pregunta aparece después de interactuar con el ejercicio");
  window.LearningExperience.showFeedback();
  assert.equal(feedback.hidden, false);
  feedback.querySelector('[data-feedback-value="mejorar"]').click();
  assert.equal(feedback.querySelector(".exercise-feedback-areas").hidden, false);
  feedback.querySelector('[data-feedback-area="mision"]').click();
  assert.deepEqual(JSON.parse(JSON.stringify(window.LearningState.feedback("python", 0))).valor, "mejorar");
  assert.equal(window.LearningState.feedback("python", 0).area, "mision");
  assert.match(feedback.querySelector(".exercise-feedback-status").textContent, /dispositivo/);
  assert.equal(feedback.querySelector('[data-feedback-area="mision"]').getAttribute("aria-pressed"), "true");
  window.close();
}

console.log("Experiencia: 3 itinerarios, selección persistente, orientación por ruta y feedback estructurado: OK");
