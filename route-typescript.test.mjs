import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { solveRoute, checkExams, checkSafety, read } from "./starter-harness.mjs";

/*
  Ruta TypeScript. El verificador de ts-lab.js es propio, así que la prueba que
  de verdad importa es la comparación con TypeScript real: para cada programa,
  tsc y el laboratorio tienen que coincidir en si hay error o no. Se comprueban
  las doce soluciones de la ruta y una batería de programas correctos y
  equivocados, porque el riesgo de un verificador escrito a mano son los falsos
  errores sobre código que sí es válido.
*/

const FILES = ["starter-exams.js", "starter-runtime.js", "ts-lab.js", "typescript-course.js", "starter-course.js"];

const SOLUTIONS = [
  `let nombre: string = "Ana";
let edad: number = 28;
let activa: boolean = true;

console.log(nombre, edad, activa);`,

  `function sumar(a: number, b: number): number {
  return a + b;
}

console.log(sumar(12, 5));`,

  `const horas: number[] = [12, 5, 4];
const cursos: string[] = ["Python", "SQL", "Git"];

let total = 0;
for (const hora of horas) {
  total = total + hora;
}

console.log(cursos.length, total);`,

  `const nivel = "inicial";
let contador = 0;
contador = contador + 1;

const etiqueta: string = nivel;
console.log(etiqueta, contador);`,

  `type Curso = {
  nombre: string;
  horas: number;
};

const python: Curso = { nombre: "Python", horas: 12 };

console.log(python.nombre, python.horas);`,

  `interface Alumno {
  nombre: string;
  correo?: string;
}

const ana: Alumno = { nombre: "Ana", correo: "ana@ejemplo.cl" };
const beto: Alumno = { nombre: "Beto" };

console.log(ana.nombre, beto.nombre);`,

  `type Nivel = "inicial" | "intermedio" | "avanzado";

const actual: Nivel = "intermedio";

function precio(nivel: Nivel): number {
  if (nivel === "inicial") {
    return 20000;
  }
  if (nivel === "intermedio") {
    return 35000;
  }
  return 50000;
}

console.log(actual, precio(actual));`,

  `function describir(valor: string | number): string {
  if (typeof valor === "number") {
    return "Número: " + valor.toFixed(2);
  }
  return "Texto: " + valor.toUpperCase();
}

console.log(describir(3.14159));
console.log(describir("hola"));`,

  `type Curso = {
  nombre: string;
  horas: number;
};

function resumir(curso: Curso): string {
  return curso.nombre + " dura " + curso.horas + " horas";
}

console.log(resumir({ nombre: "SQL", horas: 5 }));`,

  `type Curso = {
  nombre: string;
  horas: number;
  activo: boolean;
};

const cursos: Curso[] = [
  { nombre: "Python", horas: 12, activo: true },
  { nombre: "SQL", horas: 5, activo: true },
  { nombre: "Git", horas: 4, activo: false }
];

const activos: Curso[] = cursos.filter((curso: Curso) => curso.activo);
const nombres: string[] = activos.map((curso: Curso) => curso.nombre);

console.log(nombres.join(", "));`,

  `function primero<T>(lista: T[]): T {
  return lista[0];
}

const texto: string = primero(["a", "b"]);
const numero: number = primero([10, 20]);

console.log(texto, numero);`,

  `type Nivel = "inicial" | "avanzado";

interface Curso {
  nombre: string;
  horas: number;
  nivel: Nivel;
  profesor?: string;
}

const catalogo: Curso[] = [
  { nombre: "Python", horas: 12, nivel: "inicial", profesor: "Ana" },
  { nombre: "SQL", horas: 5, nivel: "inicial" },
  { nombre: "Arquitectura", horas: 20, nivel: "avanzado", profesor: "Beto" }
];

function ficha(curso: Curso): string {
  const quien: string = curso.profesor === undefined ? "sin profesor" : curso.profesor;
  return curso.nombre + " (" + curso.nivel + ", " + curso.horas + " h) · " + quien;
}

const iniciales: Curso[] = catalogo.filter((curso: Curso) => curso.nivel === "inicial");
for (const curso of iniciales) {
  console.log(ficha(curso));
}`
];

const { context, comprobaciones } = solveRoute({
  id: "typescript",
  files: FILES,
  solutions: SOLUTIONS,
  globalName: "TypeScriptCourse"
});

const preguntas = checkExams(context, "typescript");
checkSafety(["ts-lab.js", "typescript-course.js"]);

const pagina = read("typescript.html");
assert.match(pagina, /El verificador no es tsc/, "la página declara que el verificador es propio");
assert.ok(pagina.indexOf('src="starter-runtime.js') < pagina.indexOf('src="ts-lab.js'),
  "el intérprete se carga antes que el laboratorio");

/* Programas correctos que una persona escribiría al practicar: ninguno debe
   producir un error inventado. */
const CORRECTOS = [
  `let contador = 0;\ncontador = 5;\nlet etiqueta = "hola";\netiqueta = "chao";\nconsole.log(contador, etiqueta);`,
  `const nombres = ["a", "b"];\nnombres.push("c");\nconsole.log(nombres.join("-"));`,
  `const numeros: number[] = [];\nnumeros.push(1);\nconsole.log(numeros.length);`,
  "const nombre: string = \"Ana\";\nconst edad: number = 30;\nconsole.log(`${nombre} tiene ${edad} años`);",
  `const texto: string = "  Hola Mundo  ";\nconsole.log(texto.trim().toLowerCase().split(" ").length);`,
  `const precio: number = 1999.456;\nconst bonito: string = precio.toFixed(2);\nconsole.log(bonito);`,
  `type Direccion = { calle: string; numero: number };\ntype Persona = { nombre: string; direccion: Direccion };\nconst ana: Persona = { nombre: "Ana", direccion: { calle: "Sur", numero: 12 } };\nconsole.log(ana.direccion.calle);`,
  `function saludar(nombre: string): void {\n  console.log("Hola " + nombre);\n}\nsaludar("Ana");`,
  `function saludar(nombre: string, titulo?: string): string {\n  if (titulo === undefined) {\n    return "Hola " + nombre;\n  }\n  return "Hola " + titulo + " " + nombre;\n}\nconsole.log(saludar("Ana"));\nconsole.log(saludar("Ana", "Dra."));`,
  `function largo(texto: string | null): number {\n  if (texto === null) {\n    return 0;\n  }\n  return texto.length;\n}\nconsole.log(largo("hola"), largo(null));`,
  `type Curso = { id: number; nombre: string };\nconst cursos: Curso[] = [{ id: 1, nombre: "Python" }];\nconst hallado = cursos.find((curso: Curso) => curso.id === 1);\nif (hallado === undefined) {\n  console.log("no está");\n} else {\n  console.log(hallado.nombre);\n}`,
  `const numeros: number[] = [1, 2, 3];\nconst dobles: number[] = numeros.map((n) => n * 2);\nconsole.log(dobles.join(","));`,
  `const numeros: number[] = [1, 2, 3, 4];\nconst pares: number[] = numeros.filter((n) => n % 2 === 0);\nconsole.log(pares.length);`,
  `const activo: boolean = true;\nif (!activo) {\n  console.log("apagado");\n} else {\n  console.log("encendido");\n}`,
  `console.log(Math.round(4.6), Math.max(1, 9), Math.abs(-3));`,
  `function ultimo<T>(lista: T[]): T {\n  return lista[lista.length - 1];\n}\nconsole.log(ultimo(["a", "b"]), ultimo([1, 2]));`,
  `interface Punto {\n  x: number;\n  y: number;\n}\nfunction distancia(a: Punto, b: Punto): number {\n  const dx = a.x - b.x;\n  const dy = a.y - b.y;\n  return Math.round(dx * dx + dy * dy);\n}\nconsole.log(distancia({ x: 0, y: 0 }, { x: 3, y: 4 }));`,
  `type Curso = { nombre: string; horas: number };\nconst base = { nombre: "Python", horas: 12, extra: true };\nconst curso: Curso = base;\nconsole.log(curso.nombre);`,
  `let i = 0;\nwhile (i < 3) {\n  console.log(i);\n  i = i + 1;\n}`,
  `const edad: number = 20;\nconst etiqueta: string = edad >= 18 ? "adulto" : "menor";\nconsole.log(etiqueta);`,
  `type Puntaje = 1 | 2 | 3;\nconst p: Puntaje = 2;\nconsole.log(p);`,
  `type Nivel = "a" | "b";\nconst niveles: Nivel[] = ["a", "b", "a"];\nconsole.log(niveles.length);`,
  `type Curso = { nombre: string; horas: number };\nfunction crear(nombre: string, horas: number): Curso {\n  return { nombre: nombre, horas: horas };\n}\nconsole.log(crear("SQL", 5).nombre);`,
  `function nivel(puntos: number): string {\n  if (puntos > 90) {\n    return "alto";\n  } else if (puntos > 50) {\n    return "medio";\n  } else {\n    return "bajo";\n  }\n}\nconsole.log(nivel(70));`
];

/* Programas equivocados: uno por concepto de la ruta. */
const EQUIVOCADOS = [
  `let nombre: string = 42;\nconsole.log(nombre);`,
  `function sumar(a: number, b: number): number {\n  return a + b;\n}\nconsole.log(sumar(12, "cinco"));`,
  `function sumar(a: number, b: number): number {\n  return a + " " + b;\n}\nconsole.log(sumar(1, 2));`,
  `const horas: number[] = [12, "cinco", 4];\nconsole.log(horas.length);`,
  `const nivel = "inicial";\nnivel = "avanzado";\nconsole.log(nivel);`,
  `type Curso = {\n  nombre: string;\n  horas: number;\n};\nconst python: Curso = { nombre: "Python" };\nconsole.log(python.nombre);`,
  `type Curso = {\n  nombre: string;\n  horas: number;\n};\nconst python: Curso = { nombre: "Python", horas: 12, color: "azul" };\nconsole.log(python.nombre);`,
  `interface Alumno {\n  nombre: string;\n  correo?: string;\n}\nconst ana: Alumno = { nombre: "Ana" };\nconsole.log(ana.telefono);`,
  `type Nivel = "inicial" | "intermedio" | "avanzado";\nconst actual: Nivel = "experto";\nconsole.log(actual);`,
  `function describir(valor: string | number): string {\n  return valor.toUpperCase();\n}\nconsole.log(describir(1));`,
  `type Curso = { nombre: string; horas: number };\nconst cursos: Curso[] = [{ nombre: "Python", horas: 12 }];\nconst nombres: number[] = cursos.map((curso: Curso) => curso.nombre);\nconsole.log(nombres.length);`,
  `function primero<T>(lista: T[]): T {\n  return lista[0];\n}\nconst numero: number = primero(["a", "b"]);\nconsole.log(numero);`,
  `function resumir(nombre: string, horas: number): string {\n  return nombre + horas;\n}\nconsole.log(resumir("SQL"));`,
  `let n: number = true;\nconsole.log(n);`,
  `type Direccion = { calle: string };\ntype Persona = { nombre: string; direccion: Direccion };\nconst ana: Persona = { nombre: "Ana", direccion: { calle: "Sur" } };\nconsole.log(ana.direccion.numero);`,
  `function saludar(nombre: string): void {\n  console.log(nombre);\n}\nconst x: string = saludar("Ana");\nconsole.log(x);`,
  `function saludar(nombre: string, titulo?: string): string {\n  return titulo.toUpperCase();\n}\nconsole.log(saludar("Ana"));`,
  `function largo(texto: string | null): number {\n  return texto.length;\n}\nconsole.log(largo(null));`,
  `type Curso = { id: number; nombre: string };\nconst cursos: Curso[] = [{ id: 1, nombre: "Python" }];\nconst hallado = cursos.find((curso: Curso) => curso.id === 1);\nconsole.log(hallado.nombre);`,
  `const numeros: number[] = [1, 2, 3];\nconst textos: number[] = numeros.map((n) => "n" + n);\nconsole.log(textos.length);`,
  `const n: number = 5;\nfor (const x of n) {\n  console.log(x);\n}`,
  `const n: number = 5;\nconsole.log(n.toUpperCase());`,
  `type Puntaje = 1 | 2 | 3;\nconst p: Puntaje = 7;\nconsole.log(p);`,
  `type Nivel = "a" | "b";\nconst niveles: Nivel[] = ["a", "c"];\nconsole.log(niveles.length);`,
  `console.log(totalGeneral);`,
  `const x: Curso = { nombre: "a" };\nconsole.log(x);`,
  `const a: string = "3";\nconst b: string = "4";\nconsole.log(a - b);`
];

const laboratorioFalla = (programa) => {
  const salida = context.runJson("globalThis.TsLab.run(" + JSON.stringify(programa) + ")");
  return { falla: salida.errores.length > 0 || Boolean(salida.error && !salida.javascript), salida };
};

/* Sin TypeScript real, al menos se exige el veredicto esperado de cada programa. */
for (const programa of CORRECTOS.concat(SOLUTIONS)) {
  const { falla, salida } = laboratorioFalla(programa);
  assert.equal(falla, false, "este programa es válido y el laboratorio lo rechazó:\n" + programa
    + "\n-> " + (salida.errores.map((e) => "L" + e.linea + " " + e.mensaje).join(" | ") || salida.error));
}
for (const programa of EQUIVOCADOS) {
  const { falla, salida } = laboratorioFalla(programa);
  assert.equal(falla, true, "este programa tiene un error de tipos y el laboratorio lo aceptó:\n" + programa
    + "\n-> salida " + JSON.stringify(salida.output));
}

/* ------------------- contraste con TypeScript real ------------------- */

let contrastados = 0;
try {
  const modules = process.env.CONTENT_QA_MODULES || path.join(os.tmpdir(), "capsulasdev-content-qa", "node_modules");
  const requireQa = createRequire(path.join(modules, "../package.json"));
  const ts = requireQa("typescript");
  const opciones = {
    strict: true,
    noEmit: true,
    target: ts.ScriptTarget.ES2020,
    lib: ["lib.es2020.d.ts", "lib.dom.d.ts"],
    types: [],
    moduleDetection: ts.ModuleDetectionKind.Force
  };
  const nombre = "programa.ts";
  const erroresDeTsc = (fuente) => {
    const archivo = ts.createSourceFile(nombre, fuente, ts.ScriptTarget.ES2020, true);
    const host = ts.createCompilerHost(opciones);
    const original = host.getSourceFile.bind(host);
    host.getSourceFile = (n, ...resto) => (n === nombre ? archivo : original(n, ...resto));
    host.writeFile = () => {};
    const programa = ts.createProgram([nombre], opciones, host);
    return ts.getPreEmitDiagnostics(programa).filter((d) => d.file && d.file.fileName === nombre);
  };

  for (const programa of SOLUTIONS.concat(CORRECTOS, EQUIVOCADOS)) {
    const reales = erroresDeTsc(programa);
    const { falla, salida } = laboratorioFalla(programa);
    assert.equal(falla, reales.length > 0,
      "TypeScript " + ts.version + " y el laboratorio no coinciden en:\n" + programa
      + "\n  tsc: " + (reales.length
        ? reales.map((d) => "TS" + d.code + " " + ts.flattenDiagnosticMessageText(d.messageText, " ")).join(" | ")
        : "sin errores")
      + "\n  laboratorio: " + (falla
        ? (salida.errores.map((e) => "L" + e.linea + " " + e.mensaje).join(" | ") || salida.error)
        : "sin errores"));
    contrastados += 1;
  }
  assert.ok(contrastados >= 60, "se esperaban al menos 60 programas contrastados");
} catch (error) {
  if (error instanceof assert.AssertionError) throw error;
  if (process.env.CONTENT_QA_SKIP !== "1") {
    console.error("No se pudo contrastar con TypeScript real: " + error.message
      + "\nInstala typescript@5.9.3 y apunta CONTENT_QA_MODULES a su node_modules,"
      + " o declara CONTENT_QA_SKIP=1 para omitir esa comparación a sabiendas.");
    process.exit(1);
  }
  contrastados = -1;
}

const detalle = contrastados >= 0
  ? contrastados + " programas contrastados con TypeScript real"
  : "comparación con TypeScript omitida a petición";
console.log(`TypeScript: 12 módulos resueltos, ${comprobaciones} validaciones, 3 exámenes y ${preguntas} preguntas (${detalle})`);
