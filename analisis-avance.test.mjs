import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { analizar, leerRespaldos, informar, cargarTitulos, archivosDe } from "./analizar-avance.mjs";

/*
  La herramienta que lee los respaldos del piloto. Se prueba con respaldos
  fabricados aquí, porque el objetivo es que el informe diga la verdad sobre
  datos conocidos: si tres personas se traban en el mismo módulo y una lo
  abandona, eso tiene que salir en el informe.
*/

const CLAVE_FORMATO = "codigo-cero/avance";

function respaldo(instalacion, rutas, eventos = [], exportado = "2026-09-07T10:00:00.000Z") {
  return {
    formato: CLAVE_FORMATO,
    esquema: 1,
    exportado,
    perfil: { esquema: 1, instalacion, creado: exportado, actualizado: exportado, rutas },
    intentos: { esquema: 1, eventos }
  };
}

const evento = (r, m, v, ok, extra = {}) => ({ r, m, v, ok, e: false, ms: 5000, t: 1757000000000, ...extra });

/* Tres personas en la ruta JSON. Todas pelean con el módulo 4 (índice 3):
   dos lo superan tras varios intentos y una lo abandona ahí. */
const PERSONAS = [
  respaldo("aaaaaaaa", {
    json: { completados: [0, 1, 2, 3], examenes: [1], activo: 4, borradores: {}, intentos: { "0": 1, "1": 2, "2": 1, "3": 5 }, actualizado: 1757000000000 }
  }, [
    evento("json", 3, "100", false), evento("json", 3, "100", false),
    evento("json", 3, "110", false), evento("json", 3, "110", false),
    evento("json", 3, "111", true, { ms: 40000 })
  ]),
  respaldo("bbbbbbbb", {
    json: { completados: [0, 1, 2, 3], examenes: [], activo: 4, borradores: {}, intentos: { "0": 1, "3": 4 }, actualizado: 1757000000000 }
  }, [
    evento("json", 3, "100", false), evento("json", 3, "100", false, { e: true }),
    evento("json", 3, "100", false), evento("json", 3, "111", true, { ms: 60000 })
  ]),
  respaldo("cccccccc", {
    json: { completados: [0, 1, 2], examenes: [], activo: 3, borradores: {}, intentos: { "3": 6 }, actualizado: 1757000000000 },
    python: { completados: [1, 2], examenes: [], activo: 3, borradores: {}, intentos: { "0": 1, "1": 1 }, actualizado: 1757000000000 }
  }, [
    evento("json", 3, "100", false), evento("json", 3, "100", false), evento("json", 3, "100", false),
    evento("json", 3, "010", false), evento("json", 3, "100", false), evento("json", 3, "100", false)
  ])
];

const carpeta = fs.mkdtempSync(path.join(os.tmpdir(), "codigo-cero-piloto-"));
PERSONAS.forEach((datos, i) => fs.writeFileSync(path.join(carpeta, "persona" + (i + 1) + ".json"), JSON.stringify(datos), "utf8"));
/* Ruido: un archivo que no es un respaldo y otro que no es JSON. */
fs.writeFileSync(path.join(carpeta, "otra-cosa.json"), JSON.stringify({ hola: 1 }), "utf8");
fs.writeFileSync(path.join(carpeta, "roto.json"), "{ esto no es json", "utf8");
fs.writeFileSync(path.join(carpeta, "ignorame.md"), "no me leas", "utf8");

/* ---------- lectura ---------- */
const archivos = archivosDe([carpeta]);
assert.equal(archivos.length, 5, "toma los .json y .txt, no el resto");
const { respaldos, problemas } = leerRespaldos(archivos);
assert.equal(respaldos.length, 3, "tres respaldos válidos");
assert.equal(problemas.length, 2, "y dice cuáles no pudo leer");
assert.ok(problemas.some((p) => /roto\.json/.test(p) && /JSON/.test(p)));
assert.ok(problemas.some((p) => /otra-cosa\.json/.test(p) && /Código Cero/.test(p)));

/* La misma persona que manda dos veces cuenta una: gana el más reciente. */
const duplicado = path.join(carpeta, "persona1-otra-vez.json");
fs.writeFileSync(duplicado, JSON.stringify(respaldo("aaaaaaaa", {
  json: { completados: [0, 1, 2, 3, 4, 5], examenes: [1], activo: 6, borradores: {}, intentos: {}, actualizado: 1757000000000 }
}, [], "2026-09-08T10:00:00.000Z")), "utf8");
const conDuplicado = leerRespaldos(archivosDe([carpeta]));
assert.equal(conDuplicado.respaldos.length, 3, "un respaldo repetido no cuenta como otra persona");
const nueva = conDuplicado.respaldos.find((r) => r.documento.perfil.instalacion === "aaaaaaaa");
assert.equal(nueva.documento.perfil.rutas.json.completados.length, 6, "manda el respaldo más reciente");
fs.unlinkSync(duplicado);

/* ---------- agregación ---------- */
const { modulos, rutas } = analizar(respaldos);

const jsonRuta = rutas.get("json");
assert.equal(jsonRuta.personas.size, 3);
assert.equal(jsonRuta.terminaron, 0, "nadie terminó los doce módulos");
assert.deepEqual([...jsonRuta.masLejos].sort((a, b) => a - b), [3, 3, 3], "las tres llegaron al índice 3");

const dificil = modulos.get("json:3");
assert.equal(dificil.intentos, 15, "5 + 4 + 6 intentos");
assert.equal(dificil.personas.size, 3);
assert.equal(dificil.superaron.size, 2, "una no lo superó");
assert.equal(dificil.erroresMotor, 1, "un intento falló por error de ejecución");
assert.equal(dificil.fallosPorValidacion[0], 1, "la primera comprobación falló una vez");
assert.equal(dificil.fallosPorValidacion[1], 10, "la segunda falla 2 + 3 + 5 veces");
assert.equal(dificil.fallosPorValidacion[2], 13, "la tercera es la que más falla: 4 + 3 + 6");
assert.equal(dificil.tiempos.length, 2, "solo se mide el tiempo de los intentos que aprobaron");

/* Una ruta que nadie tocó no aparece. */
assert.equal(rutas.has("terminal"), false);
/* Python sí, y con su desplazamiento de proyectos 1–50 resuelto. */
assert.equal(rutas.get("python").personas.size, 1);
assert.deepEqual(rutas.get("python").masLejos, [1], "proyectos 1 y 2 completados = índice 1");

/* ---------- títulos ---------- */
const titulos = cargarTitulos();
assert.equal(Object.keys(titulos).length, 19, "las diecinueve rutas aportan títulos");
assert.equal(titulos.json.length, 50);
assert.equal(titulos.python.length, 50, "Python incluye sus cincuenta proyectos");
assert.equal(titulos["html-css"].length, 50, "HTML y CSS incluye sus cincuenta módulos");
assert.equal(titulos.javascript.length, 50, "JavaScript incluye sus cincuenta módulos");
assert.equal(titulos.sql.length, 50, "SQL incluye sus cincuenta módulos");
assert.equal(titulos.git.length, 50, "Git y GitHub incluye sus cincuenta módulos");
assert.equal(titulos.apis.length, 50, "APIs incluye sus cincuenta módulos");
for (const id of ["terminal", "regex", "ia", "datos-python", "nodejs", "typescript", "react", "json", "markdown", "accesibilidad", "testing", "docker", "mongodb"])
  assert.equal(titulos[id].length, 50, id + " incluye sus cincuenta módulos");
for (const [ruta, lista] of Object.entries(titulos)) {
  assert.ok(lista.every((titulo) => typeof titulo === "string" && titulo.length > 0),
    ruta + ": todos los módulos tienen título");
}

/* ---------- informe ---------- */
const texto = informar(respaldos, problemas, titulos);

assert.match(texto, /3 respaldos/);
assert.match(texto, /aaaaaaaa/, "identifica a cada instalación");
assert.match(texto, /roto\.json/, "avisa de los archivos que no pudo leer");
assert.match(texto, /JSON\n\s+3 personas/, "cuántas personas tocaron la ruta");
assert.match(texto, /5\.0 intentos por persona/, "el promedio del módulo difícil");
assert.match(texto, /1 no lo superó/, "y cuántas lo abandonaron");
assert.match(texto, /error de ejecución/, "separa fallar por error de fallar la validación");
assert.match(texto, /comprobación 1: 1 · comprobación 2: 10 · comprobación 3: 13/, "desglosa cada comprobación");
assert.match(texto, /la que más falla es la 3/, "señala cuál falla más, sin saltarse las que nunca fallaron");
assert.match(texto, /no es estadística/, "el informe declara su propio límite");
assert.equal(/nombre|correo electr/.test(texto.split("Los respaldos no contienen")[0]), false,
  "el informe no inventa datos personales que el sitio no pide");

/* El título del módulo difícil sale en el informe, no solo su número. */
const tituloEsperado = titulos.json[3];
assert.ok(texto.includes(tituloEsperado), "el informe nombra el módulo: " + tituloEsperado);

/* Sin respaldos con avance el informe no revienta. */
const vacio = informar([{ archivo: "vacio.json", documento: respaldo("dddddddd", {}) }], [], titulos);
assert.match(vacio, /Nadie tocó ninguna ruta/);
assert.match(vacio, /Ningún módulo llegó a tres intentos/);

fs.rmSync(carpeta, { recursive: true, force: true });

console.log(`Análisis del piloto: ${respaldos.length} respaldos leídos, ${problemas.length} descartados con motivo,`
  + ` agregación por ruta y por módulo, títulos de las 19 rutas e informe: OK`);
