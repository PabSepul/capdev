import assert from "node:assert/strict";
import { solveRoute, checkExams, checkSafety, read } from "./starter-harness.mjs";

/*
  Ruta JSON. Además de resolver los doce módulos por el camino real de la página,
  se contrasta el analizador propio con JSON.parse: para cada documento, los dos
  tienen que coincidir en si lo aceptan y, cuando lo aceptan, en el valor que
  producen. Un analizador escrito a mano solo sirve si es exactamente igual de
  estricto que el del navegador.
*/

const FILES = ["starter-exams.js", "json-lab.js", "json-course.js", "starter-course.js"];

const SOLUTIONS = [
  '{\n  "nombre": "Ana",\n  "edad": 28\n}',
  '{\n  "curso": "Python",\n  "horas": 12,\n  "activo": true,\n  "profesor": null\n}',
  '{\n  "curso": "Python",\n  "temas": ["variables", "ciclos", "funciones"],\n  "autor": {\n    "nombre": "Ana",\n    "correo": "ana@ejemplo.cl"\n  }\n}',
  '{\n  "nombre": "SQL",\n  "horas": 5,\n  "activo": false\n}',
  '[\n  { "id": 1, "nombre": "Python", "horas": 12 },\n  { "id": 2, "nombre": "SQL", "horas": 5 },\n  { "id": 3, "nombre": "Git", "horas": 4 }\n]',
  '[\n  { "nombre": "Ana", "telefono": "+56911111111" },\n  { "nombre": "Beto", "telefono": null },\n  { "nombre": "Carla" }\n]',
  '{\n  "codigo": "0074",\n  "precio": 45000,\n  "descuento": 0.15,\n  "unidades": 3\n}',
  '{\n  "id": 1001,\n  "cliente": {\n    "nombre": "Ana",\n    "correo": "ana@ejemplo.cl"\n  },\n  "items": [\n    { "curso": "Python", "precio": 45000 },\n    { "curso": "SQL", "precio": 30000 }\n  ],\n  "total": 75000\n}',
  '{\n  "type": "object",\n  "required": ["nombre"]\n}',
  '{\n  "type": "object",\n  "required": ["nombre", "horas"],\n  "properties": {\n    "nombre": { "type": "string" },\n    "horas": { "type": "number" },\n    "activo": { "type": "boolean" }\n  }\n}',
  '{\n  "type": "object",\n  "required": ["nivel", "etiquetas"],\n  "properties": {\n    "nivel": { "type": "string", "enum": ["inicial", "avanzado"] },\n    "etiquetas": {\n      "type": "array",\n      "minItems": 1,\n      "items": { "type": "string" }\n    }\n  }\n}',
  '{\n  "type": "object",\n  "required": ["id", "cliente", "total", "estado", "items"],\n  "additionalProperties": false,\n  "properties": {\n    "id": { "type": "integer" },\n    "cliente": { "type": "string", "minLength": 1 },\n    "total": { "type": "number", "minimum": 0 },\n    "estado": { "type": "string", "enum": ["pendiente", "pagado", "anulado"] },\n    "items": {\n      "type": "array",\n      "minItems": 1,\n      "items": { "type": "string" }\n    }\n  }\n}'
];

const { context, comprobaciones } = solveRoute({
  id: "json",
  files: FILES,
  solutions: SOLUTIONS,
  globalName: "JsonCourse"
});

const preguntas = checkExams(context, "json");
checkSafety(["json-lab.js", "json-course.js"]);

const pagina = read("json.html");
assert.match(pagina, /El analizador es propio/, "la página declara que el analizador no es JSON.parse");
assert.ok(pagina.indexOf('src="json-lab.js') < pagina.indexOf('src="json-course.js'),
  "el laboratorio se carga antes que el curso");

/* Un esquema que acepta todo no es un contrato: los módulos de esquema tienen
   que traer ejemplos válidos y también inválidos. */
const escenarios = context.runJson("globalThis.JsonCourse.lessons.map((m) => m.scenario || null)");
for (const [indice, escenario] of escenarios.entries()) {
  if (indice < 8) continue;
  assert.equal(escenario.modo, "esquema", "módulo " + (indice + 1) + ": debía pedir un esquema");
  assert.ok(escenario.validos.length >= 2, "módulo " + (indice + 1) + ": hacen falta ejemplos que se acepten");
  assert.ok(escenario.invalidos.length >= 2, "módulo " + (indice + 1) + ": hacen falta ejemplos que se rechacen");
}

/* Un esquema vacío acepta cualquier cosa: ningún módulo puede aprobarse con él. */
for (let indice = 8; indice < 12; indice += 1) {
  const salida = context.runJson("globalThis.JsonLab.run('{}', "
    + JSON.stringify(escenarios[indice]) + ")");
  assert.ok(salida.resultados.some((caso) => !caso.correcto),
    "módulo " + (indice + 1) + ": un esquema vacío no puede pasar");
}

/* ---------------- contraste con JSON.parse ---------------- */

const VALIDOS = [
  "{}", "[]", '{"a":1}', "[1,2,3]", '"texto"', "42", "-3.5", "true", "false", "null",
  '{"a":{"b":{"c":[1,2,{"d":null}]}}}',
  '{ "a" : 1 , "b" : [ true , false ] }',
  '{"texto":"con \\"comillas\\" y \\\\ barra"}',
  '{"salto":"a\\nb","tab":"a\\tb"}',
  '{"unicode":"\\u00f1andu"}',
  '{"cero":0,"negativo":-0.5,"exp":1e3,"expneg":2.5E-2}',
  '  {"espacios": 1}  ',
  "[[[[1]]]]",
  '{"vacio":"","lista":[],"obj":{}}',
  '{"acentos":"ñandú áéíóú"}',
  "[1.0, 2.00, 3e0]",
  '"\\u0041\\u0042"',
  "[null,null]",
  '{"a":1,"a":2}'
];

const INVALIDOS = [
  "", "   ", "{", "}", "[", "]", '{"a":}', '{"a" 1}', "{a:1}", "{'a':1}",
  '{"a":1,}', "[1,2,]", '{"a":1}{"b":2}', "[1 2]", "undefined", "NaN", "None", "True",
  '{"a":01}', '{"a":.5}', '{"a":1.}', '{"a":-}', '{"a":1e}', '{"a":"sin cierre}',
  '{"a":"salto\nadentro"}', "{\"a\":'texto'}", '// comentario\n{"a":1}',
  '{"a":1 // comentario\n}', '{"a":"\\q"}', '{"a":"\\u12"}', "[1,[2,[3]]",
  "+1", "0x10", "'texto'", '{"a"::1}', "{,}", "[,]",
  '{"a":1}extra', "tru", '{"a"}', "[}", "{]"
];

const analizarConLab = (documento) =>
  context.runJson("(() => { try { return { ok: true, valor: globalThis.JsonLab.analizar("
    + JSON.stringify(documento) + ") }; } catch (e) { return { ok: false, mensaje: e.message }; } })()");

for (const documento of VALIDOS) {
  const nativo = JSON.parse(documento);
  const propio = analizarConLab(documento);
  assert.equal(propio.ok, true, "JSON.parse acepta y el laboratorio rechaza:\n" + documento
    + "\n-> " + propio.mensaje);
  assert.equal(JSON.stringify(propio.valor), JSON.stringify(nativo),
    "el valor obtenido no coincide con JSON.parse:\n" + documento);
}

for (const documento of INVALIDOS) {
  let nativoAcepta = true;
  try { JSON.parse(documento); } catch { nativoAcepta = false; }
  assert.equal(nativoAcepta, false, "este caso ya no lo rechaza JSON.parse: " + JSON.stringify(documento));
  const propio = analizarConLab(documento);
  assert.equal(propio.ok, false, "JSON.parse rechaza y el laboratorio acepta: " + JSON.stringify(documento));
  assert.match(propio.mensaje, /[a-záéíóúñ]/i, "el error debe explicarse en palabras: " + propio.mensaje);
}

/* Documentos generados al azar: la parte que más se equivoca de un analizador
   escrito a mano son las combinaciones que nadie escribiría a propósito. */
let semilla = 20260907;
const aleatorio = () => {
  semilla = (semilla * 1103515245 + 12345) % 2147483648;
  return semilla / 2147483648;
};
const PIEZAS = ['{', '}', '[', ']', ',', ':', '"a"', '"b"', "1", "0", "01", "-", "1.5", "1e", "true",
  "false", "null", " ", "\n", "'", "//", "\\", "e5", '"', "NaN"];
let sorteados = 0;
for (let intento = 0; intento < 600; intento += 1) {
  let documento = "";
  const largo = 1 + Math.floor(aleatorio() * 8);
  for (let n = 0; n < largo; n += 1) documento += PIEZAS[Math.floor(aleatorio() * PIEZAS.length)];
  let nativoOk = true;
  let nativoValor;
  try { nativoValor = JSON.parse(documento); } catch { nativoOk = false; }
  const propio = analizarConLab(documento);
  assert.equal(propio.ok, nativoOk, "veredicto distinto al de JSON.parse con: " + JSON.stringify(documento)
    + (propio.ok ? "" : "\n-> " + propio.mensaje));
  if (nativoOk) {
    assert.equal(JSON.stringify(propio.valor), JSON.stringify(nativoValor),
      "valor distinto al de JSON.parse con: " + JSON.stringify(documento));
  }
  sorteados += 1;
}

const total = VALIDOS.length + INVALIDOS.length + sorteados;
console.log(`JSON: 12 módulos resueltos, ${comprobaciones} validaciones, 3 exámenes y ${preguntas} preguntas`
  + ` (${total} documentos con el mismo veredicto que JSON.parse)`);
