import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
const {JSDOM} = require(path.join(process.env.CONTENT_QA_MODULES || path.join(os.tmpdir(), 'capsulasdev-content-qa', 'node_modules'), 'jsdom'));
const read = file => fs.readFileSync(new URL(file, import.meta.url), 'utf8');
const w = new JSDOM(read('index.html'), {url: 'http://localhost/', runScripts: 'outside-only'}).window;
const doc = w.document;
const visible = () => [...doc.querySelectorAll('[data-learning-route]')].filter(card => !card.hidden);
const ids = () => visible().map(card => card.dataset.learningRoute);
// Sin el filtro JS todas las rutas siguen disponibles como enlaces normales.
assert.equal(visible().length, 19);
for (const file of ['learning-state.js', 'learning-experience.js', 'catalog.js', 'home.js', 'learning-plan.js']) w.eval(read(file));
assert.equal(visible().length, 6);
assert.equal(doc.querySelector('.catalog-controls').hidden, false);
assert.equal(doc.querySelector('#continue-learning').hidden, true);
assert.ok([...doc.querySelectorAll('.route-progress')].every(el => el.hidden));
const search = value => {
  doc.querySelector('#route-search').value = value;
  doc.querySelector('#route-search').dispatchEvent(new w.Event('input'));
};
search('PÝTHON');
assert.deepEqual(ids(), ['python', 'datos-python']);
search('datos python');
assert.deepEqual(ids(), ['python', 'datos-python']);
search('web');
assert.ok(ids().includes('html-css'));
assert.ok(ids().includes('react'));
search('');
doc.querySelector('[data-filter="datos"]').click();
assert.deepEqual(ids(), ['python', 'sql', 'ia', 'datos-python', 'json', 'mongodb']);
search('JSON');
assert.deepEqual(ids(), ['json']);
doc.querySelector('[data-filter="inicio"]').click();
assert.equal(visible().length, 0);
assert.equal(doc.querySelector('#catalog-empty').hidden, false);
doc.querySelector('#catalog-reset').click();
assert.equal(visible().length, 19);
assert.equal(doc.activeElement, doc.querySelector('#route-search'));
assert.equal(doc.querySelector('#catalog-empty').hidden, true);
assert.equal(doc.querySelector('[data-filter="all"]').getAttribute('aria-pressed'), 'true');
w.close();

// Expandir con teclado conserva un destino útil para el foco.
const second = new JSDOM(read('index.html'), {url:'http://localhost/', runScripts:'outside-only'}).window;
for (const file of ['learning-state.js', 'learning-experience.js', 'catalog.js', 'home.js', 'learning-plan.js']) second.eval(read(file));
second.document.querySelector('#catalog-more').click();
assert.equal(second.document.querySelectorAll('[data-learning-route]:not([hidden])').length, 19);
assert.equal(second.document.activeElement.dataset.learningRoute, 'terminal');
// La portada mantiene el enlace de revisión para continuar una ruta.
second.document.documentElement.dataset.review = 'septiembre-2026';
second.dispatchEvent(new second.Event('pageshow'));
assert.ok(second.document.querySelector('[data-learning-route="python"]').href.includes('revision=septiembre-2026'));
// El avance real de LearningState sigue activando Continuar y el indicador de ruta.
second.LearningState.usarCuenta('11111111-1111-4111-8111-111111111111');
second.LearningState.completar('python', 1);
second.dispatchEvent(new second.Event('pageshow'));
assert.equal(second.document.querySelector('#continue-learning').hidden, false);
assert.match(second.document.querySelector('#continue-title').textContent, /Python/);
assert.match(second.document.querySelector('#continue-description').textContent, /proyecto 2 de 20/);
assert.equal(second.document.querySelector('[data-learning-route="python"] .route-progress').hidden, false);
assert.match(second.document.querySelector('[data-learning-route="python"] [data-route-progress]').textContent, /1\/20/);
second.close();

// Si hay varios niveles completos, recomienda el primer examen pendiente, no el último.
const third = new JSDOM(read('index.html'), {url:'http://localhost/', runScripts:'outside-only'}).window;
for (const file of ['learning-state.js', 'learning-experience.js', 'learning-plan.js']) third.eval(read(file));
third.LearningState.seleccionarItinerario('python-datos');
for (let project = 1; project <= 8; project += 1) third.LearningState.completar('python', project);
third.LearningPlan.render();
assert.match(third.document.querySelector('#continue-title').textContent, /nivel 1 de Python/);
third.close();
console.log('Portada: 19 rutas accesibles, búsqueda con acentos, categorías combinadas, resultados vacíos, expansión y foco: OK');
