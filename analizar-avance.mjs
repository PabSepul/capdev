/* Lee los respaldos que manden las personas del piloto y dice dónde se traban.

   Uso:  node analizar-avance.mjs <carpeta>
         node analizar-avance.mjs respaldo1.json respaldo2.json

   No se publica en el sitio ni forma parte de él: es una herramienta para mirar
   los archivos que llegan. No hay servidor, así que los respaldos llegan por
   donde la persona quiera mandarlos y se leen aquí, en local.

   Una advertencia que el informe repite: con cinco personas esto no es
   estadística. Sirve para encontrar dónde mirar, no para concluir. */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));

/* ==================== Títulos de cada módulo ==================== */

class NodoFalso {
  constructor() {
    this.children = []; this.dataset = {}; this.style = {}; this.listeners = {};
    this.textContent = ""; this.value = ""; this.hidden = false; this.disabled = false;
    this.classList = { add() {}, remove() {}, toggle() {}, contains: () => false };
  }
  addEventListener() {} append() {} replaceChildren() {} setAttribute() {}
  getAttribute() { return null; } removeAttribute() {} remove() {}
  querySelector() { return new NodoFalso(); } querySelectorAll() { return []; }
  focus() {} scrollIntoView() {} click() {} closest() { return null; }
  set innerHTML(_) {} get innerHTML() { return ""; }
}

/* Los cursos viven en el navegador; aquí se cargan en un contexto aislado con un
   DOM de mentira, solo para leer los títulos. No se ejecuta nada del sitio. */
function cargarTitulos() {
  const contexto = {
    globalThis: null, console, JSON, setTimeout,
    document: {
      body: new NodoFalso(), documentElement: new NodoFalso(), head: new NodoFalso(),
      createElement: () => new NodoFalso(), querySelector: () => new NodoFalso(),
      querySelectorAll: () => [], getElementById: () => new NodoFalso(), addEventListener() {}
    },
    localStorage: { getItem: () => null, setItem() {} },
    window: { addEventListener() {}, matchMedia: () => ({ matches: false }), location: { hostname: "localhost", search: "" } },
    navigator: { clipboard: { writeText() {} } },
    requestAnimationFrame: (fn) => fn()
  };
  contexto.globalThis = contexto;
  vm.createContext(contexto);

  const leer = (nombre) => fs.readFileSync(path.join(AQUI, nombre), "utf8");
  const correr = (nombre, extra = "") => {
    try { vm.runInContext(leer(nombre) + extra, contexto, { filename: nombre }); return true; }
    catch { return false; }
  };

  for (const archivo of [
    "starter-runtime.js", "python-runtime.js", "course-kit.js", "starter-exams.js",
    "terminal-lab.js", "git-lab.js", "api-lab.js", "regex-lab.js", "ia-lab.js",
    "node-lab.js", "ts-lab.js", "react-lab.js", "json-lab.js", "markdown-lab.js",
    "accessibility-lab.js", "testing-lab.js", "new-tech-labs.js",
    "base-courses.js", "sql-course.js", "git-course.js", "apis-course.js",
    "terminal-course.js", "regex-course.js", "ia-course.js", "datos-python-course.js",
    "nodejs-course.js", "typescript-course.js", "react-course.js", "json-course.js",
    "markdown-course.js", "accessibility-course.js", "testing-course.js", "new-tech-courses.js",
    "course-expansion.js"
  ]) correr(archivo);

  const titulos = {};
  const globales = {
    "html-css": "HtmlCssCourse", javascript: "JavaScriptCourse", sql: "SQLCourse",
    git: "GitCourse", apis: "ApisCourse", terminal: "TerminalCourse", regex: "RegexCourse",
    ia: "IaCourse", "datos-python": "DatosPythonCourse", nodejs: "NodeCourse",
    typescript: "TypeScriptCourse", react: "ReactCourse", json: "JsonCourse",
    markdown: "MarkdownCourse", accesibilidad: "AccessibilityCourse", testing: "TestingCourse",
    docker: "DockerCourse", mongodb: "MongoCourse"
  };
  contexto.CourseExpansion?.apply?.(Object.fromEntries(
    Object.entries(globales).map(([id, nombre]) => [id, contexto[nombre]]).filter(([, curso]) => curso)
  ));
  for (const [id, nombre] of Object.entries(globales)) {
    const curso = contexto[nombre];
    if (!curso) continue;
    const modulos = curso.levels
      ? curso.levels.flatMap((nivel) => nivel.modules)
      : (curso.lessons || []);
    titulos[id] = modulos.map((modulo) => modulo.title || modulo.shortTitle || "");
  }

  /* Python tiene su propio controlador y guarda los proyectos en COURSE_LEVELS. */
  vm.runInContext(leer("learning-state.js"), contexto);
  if (correr("python.js", "\nglobalThis.__nivelesPython = COURSE_LEVELS;")) {
    const niveles = contexto.__nivelesPython || [];
    titulos.python = niveles.flatMap((nivel) => nivel.projects || nivel.modules || [])
      .map((proyecto) => proyecto.title || proyecto.name || "");
  }
  return titulos;
}

/* ==================== Lectura de los respaldos ==================== */

function archivosDe(entradas) {
  const archivos = [];
  for (const entrada of entradas) {
    const ruta = path.resolve(entrada);
    if (!fs.existsSync(ruta)) { console.error("No encuentro: " + entrada); continue; }
    if (fs.statSync(ruta).isDirectory()) {
      for (const nombre of fs.readdirSync(ruta).sort()) {
        if (/\.(json|txt)$/i.test(nombre)) archivos.push(path.join(ruta, nombre));
      }
    } else archivos.push(ruta);
  }
  return archivos;
}

function leerRespaldos(archivos) {
  const porInstalacion = new Map();
  const problemas = [];
  for (const archivo of archivos) {
    let documento;
    try { documento = JSON.parse(fs.readFileSync(archivo, "utf8")); }
    catch (error) { problemas.push(path.basename(archivo) + ": no es JSON válido"); continue; }
    if (!documento || documento.formato !== "codigo-cero/avance" || !documento.perfil?.rutas) {
      problemas.push(path.basename(archivo) + ": no es un respaldo de Código Cero");
      continue;
    }
    const clave = documento.perfil.instalacion || path.basename(archivo);
    const previo = porInstalacion.get(clave);
    /* La misma persona puede mandar el respaldo dos veces: manda el más reciente. */
    if (!previo || String(documento.exportado || "") > String(previo.documento.exportado || "")) {
      porInstalacion.set(clave, { archivo: path.basename(archivo), documento });
    }
  }
  return { respaldos: [...porInstalacion.values()], problemas };
}

/* ==================== Agregación ==================== */

const RUTAS = {
  python: { nombre: "Python", modulos: 20, offset: 1, unidad: "proyecto" },
  "html-css": { nombre: "HTML y CSS", modulos: 16 }, javascript: { nombre: "JavaScript", modulos: 16 },
  sql: { nombre: "SQL", modulos: 16 }, git: { nombre: "Git y GitHub", modulos: 16 },
  apis: { nombre: "APIs", modulos: 16 }, terminal: { nombre: "Terminal", modulos: 12 },
  regex: { nombre: "Expresiones regulares", modulos: 12 }, ia: { nombre: "Inteligencia artificial", modulos: 12 },
  "datos-python": { nombre: "Datos con Python", modulos: 12 }, nodejs: { nombre: "Node.js", modulos: 12 },
  typescript: { nombre: "TypeScript", modulos: 12 }, react: { nombre: "React", modulos: 12 },
  json: { nombre: "JSON", modulos: 12 }, markdown: { nombre: "Markdown y documentación", modulos: 12 },
  accesibilidad: { nombre: "Accesibilidad web", modulos: 12 }, testing: { nombre: "Pruebas automatizadas", modulos: 12 },
  docker: { nombre: "Docker", modulos: 12 }, mongodb: { nombre: "MongoDB", modulos: 12 }
};

function analizar(respaldos) {
  const modulos = new Map();      // "ruta:indice" -> datos
  const rutas = new Map();        // ruta -> { personas, masLejos: [] }

  const deModulo = (ruta, indice) => {
    const clave = ruta + ":" + indice;
    if (!modulos.has(clave)) {
      modulos.set(clave, { ruta, indice, intentos: 0, personas: new Set(), superaron: new Set(),
        fallosPorValidacion: [], totalValidaciones: 0, erroresMotor: 0, tiempos: [] });
    }
    return modulos.get(clave);
  };

  for (const { documento } of respaldos) {
    const persona = documento.perfil.instalacion;
    for (const [ruta, estado] of Object.entries(documento.perfil.rutas)) {
      const info = RUTAS[ruta];
      if (!info) continue;
      const offset = info.offset || 0;
      const completados = (estado.completados || []).map((n) => n - offset);
      const intentados = Object.keys(estado.intentos || {}).map(Number);
      if (completados.length === 0 && intentados.length === 0) continue;

      if (!rutas.has(ruta)) rutas.set(ruta, { personas: new Set(), masLejos: [], terminaron: 0 });
      const acumulado = rutas.get(ruta);
      acumulado.personas.add(persona);
      const lejos = Math.max(-1, ...completados, ...intentados);
      acumulado.masLejos.push(lejos);
      if (completados.length === info.modulos) acumulado.terminaron += 1;

      for (const [clave, veces] of Object.entries(estado.intentos || {})) {
        const dato = deModulo(ruta, Number(clave));
        dato.intentos += veces;
        dato.personas.add(persona);
      }
      for (const indice of completados) deModulo(ruta, indice).superaron.add(persona);
    }

    for (const evento of documento.intentos?.eventos || []) {
      if (!RUTAS[evento.r]) continue;
      const dato = deModulo(evento.r, evento.m);
      if (evento.e) dato.erroresMotor += 1;
      if (evento.ok && Number.isFinite(evento.ms) && evento.ms > 0) dato.tiempos.push(evento.ms);
      /* El largo de la cadena dice cuántas comprobaciones tiene el módulo.
         Sin esto, una que nunca falló desaparecía del desglose. */
      if (typeof evento.v === "string") dato.totalValidaciones = Math.max(dato.totalValidaciones, evento.v.length);
      if (typeof evento.v === "string" && !evento.ok) {
        [...evento.v].forEach((estado, posicion) => {
          if (estado === "0") dato.fallosPorValidacion[posicion] = (dato.fallosPorValidacion[posicion] || 0) + 1;
        });
      }
    }
  }
  return { modulos, rutas };
}

/* ==================== Informe ==================== */

const mediana = (lista) => {
  if (lista.length === 0) return null;
  const orden = [...lista].sort((a, b) => a - b);
  const medio = Math.floor(orden.length / 2);
  return orden.length % 2 ? orden[medio] : Math.round((orden[medio - 1] + orden[medio]) / 2);
};

const plural = (cantidad, singular, muchos) => cantidad + " " + (cantidad === 1 ? singular : muchos);

const duracion = (ms) => (ms === null ? "—" : ms < 60000 ? Math.round(ms / 1000) + " s" : Math.round(ms / 60000) + " min");

function informar(respaldos, problemas, titulos) {
  const lineas = [];
  const di = (texto = "") => lineas.push(texto);

  di("=".repeat(74));
  di("AVANCE DEL PILOTO · " + respaldos.length + (respaldos.length === 1 ? " respaldo" : " respaldos"));
  di("=".repeat(74));

  if (problemas.length) {
    di("");
    di("Archivos que no se pudieron leer:");
    for (const problema of problemas) di("  ✗ " + problema);
  }

  di("");
  di("QUIÉNES");
  di("-".repeat(74));
  for (const { archivo, documento } of respaldos) {
    const rutasTocadas = Object.entries(documento.perfil.rutas)
      .filter(([, e]) => (e.completados || []).length || Object.keys(e.intentos || {}).length).length;
    const modulos = Object.values(documento.perfil.rutas).reduce((n, e) => n + (e.completados || []).length, 0);
    const examenes = Object.values(documento.perfil.rutas).reduce((n, e) => n + (e.examenes || []).length, 0);
    const eventos = documento.intentos?.eventos?.length || 0;
    di("  " + documento.perfil.instalacion + "  " + archivo);
    di("     " + plural(rutasTocadas, "ruta", "rutas") + " · " + plural(modulos, "ejercicio", "ejercicios")
      + " · " + plural(examenes, "examen", "exámenes")
      + " · " + plural(eventos, "intento registrado", "intentos registrados"));
  }

  const { modulos, rutas } = analizar(respaldos);

  di("");
  di("HASTA DÓNDE LLEGARON");
  di("-".repeat(74));
  if (rutas.size === 0) di("  Nadie tocó ninguna ruta todavía.");
  const ordenRutas = [...rutas.entries()].sort((a, b) => b[1].personas.size - a[1].personas.size);
  for (const [ruta, dato] of ordenRutas) {
    const info = RUTAS[ruta];
    const unidad = info.unidad || "módulo";
    const lejos = dato.masLejos.map((n) => n + 1).sort((a, b) => a - b);
    di("  " + info.nombre);
    di("     " + dato.personas.size + (dato.personas.size === 1 ? " persona" : " personas")
      + (lejos.length === 1 ? " · llegó hasta el " : " · llegaron hasta el ")
      + unidad + " " + lejos.join(", ") + " de " + info.modulos
      + (dato.terminaron ? " · " + dato.terminaron + " la terminó" : ""));
  }

  const dificiles = [...modulos.values()]
    .filter((dato) => dato.intentos >= 3)
    .sort((a, b) => (b.intentos / b.personas.size) - (a.intentos / a.personas.size))
    .slice(0, 12);

  di("");
  di("DÓNDE MÁS CUESTA");
  di("-".repeat(74));
  if (dificiles.length === 0) {
    di("  Ningún módulo llegó a tres intentos. Con pocos respaldos esto es esperable.");
  }
  for (const dato of dificiles) {
    const info = RUTAS[dato.ruta];
    const titulo = titulos[dato.ruta]?.[dato.indice] || "";
    const promedio = (dato.intentos / dato.personas.size).toFixed(1);
    const abandonaron = dato.personas.size - dato.superaron.size;
    di("  " + info.nombre + " · " + (info.unidad || "módulo") + " " + (dato.indice + 1)
      + (titulo ? ": " + titulo : ""));
    di("     " + promedio + " intentos por persona (" + dato.intentos + " en total, "
      + plural(dato.personas.size, "persona", "personas") + ")"
      + (abandonaron > 0
        ? " · " + abandonaron + (abandonaron === 1 ? " no lo superó" : " no lo superaron")
        : " · todas lo superaron"));
    if (dato.erroresMotor > 0) {
      di("     " + dato.erroresMotor + " de " + dato.intentos + " intentos fallaron por un error de ejecución,"
        + " no por la validación");
    }
    /* El arreglo llega con huecos: una comprobación que nunca falló no deja
       entrada. Sin rellenarlos, map se los salta y Math.max devuelve NaN. */
    const cuantas = Math.max(dato.totalValidaciones, dato.fallosPorValidacion.length);
    const fallos = Array.from({ length: cuantas }, (_, i) => dato.fallosPorValidacion[i] || 0);
    if (fallos.some((n) => n > 0)) {
      di("     " + fallos.map((n, i) => "comprobación " + (i + 1) + ": " + n).join(" · "));
      const peor = fallos.indexOf(Math.max(...fallos));
      di("     ↳ la que más falla es la " + (peor + 1) + ": ahí está el concepto que no llega");
    }
    const espera = mediana(dato.tiempos);
    if (espera !== null) di("     tiempo hasta resolverlo: " + duracion(espera) + " (mediana)");
  }

  di("");
  di("TIEMPO POR RUTA");
  di("-".repeat(74));
  for (const [ruta] of ordenRutas) {
    const tiempos = [...modulos.values()].filter((d) => d.ruta === ruta).flatMap((d) => d.tiempos);
    if (tiempos.length === 0) continue;
    di("  " + RUTAS[ruta].nombre.padEnd(26) + duracion(mediana(tiempos)) + " por ejercicio resuelto (mediana de "
      + tiempos.length + ")");
  }

  di("");
  di("-".repeat(74));
  di("Con pocos respaldos esto no es estadística: sirve para saber dónde mirar,");
  di("no para concluir. Un módulo con muchos intentos puede ser difícil, estar mal");
  di("explicado o tener una comprobación demasiado estricta: hay que abrirlo y ver.");
  di("Los respaldos no contienen nombre ni correo; el sitio no los pide.");

  return lineas.join("\n");
}

/* ==================== Entrada ==================== */

export { analizar, leerRespaldos, informar, cargarTitulos, archivosDe };

/* Solo se ejecuta al llamarlo directamente: así su prueba puede importarlo. */
const esPrincipal = process.argv[1]
  && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (esPrincipal) {
  const entradas = process.argv.slice(2);
  if (entradas.length === 0) {
    console.error("Uso: node analizar-avance.mjs <carpeta con respaldos>");
    console.error("     node analizar-avance.mjs respaldo1.json respaldo2.json");
    process.exit(1);
  }

  const archivos = archivosDe(entradas);
  if (archivos.length === 0) {
    console.error("No encontré ningún archivo .json o .txt en lo que me diste.");
    process.exit(1);
  }

  const { respaldos, problemas } = leerRespaldos(archivos);
  if (respaldos.length === 0) {
    console.error("Ninguno de los " + archivos.length + " archivos es un respaldo de Código Cero.");
    for (const problema of problemas) console.error("  ✗ " + problema);
    process.exit(1);
  }

  console.log(informar(respaldos, problemas, cargarTitulos()));
}
