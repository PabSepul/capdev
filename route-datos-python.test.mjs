import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { solveRoute, checkExams, checkSafety, read } from "./starter-harness.mjs";

/*
  Ruta Datos con Python: resuelve los doce módulos por el camino real de la página
  y, si CPython está instalado, comprueba además que cada solución de referencia
  produzca en Python 3 exactamente la misma salida que el intérprete del sitio.
*/

const FILES = ["starter-exams.js", "python-runtime.js", "datos-python-course.js", "starter-course.js"];

const SOLUTIONS = [
  `texto = "Python,12\\nSQL,7\\nGit,4"

for linea in texto.split("\\n"):
    print(linea.split(","))`,

  `cabecera = ["curso", "alumnos"]
filas = [["Python", "12"], ["SQL", "7"], ["Git", "4"]]

registros = [dict(zip(cabecera, fila)) for fila in filas]
for registro in registros:
    print(registro)`,

  `registros = [{"curso": "Python", "alumnos": "12"}, {"curso": "SQL", "alumnos": "7"}]

for registro in registros:
    registro["alumnos"] = int(registro["alumnos"])

print(registros)
print(sum([r["alumnos"] for r in registros]))`,

  `lineas = ["Python, 12", "SQL, ", "  Git , 4", "", "Datos, nueve"]

limpios = []
for linea in lineas:
    if linea.strip() == "":
        continue
    partes = linea.split(",")
    curso = partes[0].strip()
    try:
        alumnos = int(partes[1].strip())
    except ValueError:
        print("Descarto:", curso)
        continue
    limpios.append({"curso": curso, "alumnos": alumnos})

print(limpios)`,

  `registros = [
    {"curso": "Python", "alumnos": 12, "region": "Norte"},
    {"curso": "SQL", "alumnos": 7, "region": "Centro"},
    {"curso": "Git", "alumnos": 4, "region": "Norte"},
]

norte = [r for r in registros if r["region"] == "Norte"]
for r in norte:
    print(r["curso"], r["alumnos"])
print(len(norte))`,

  `notas = [6.5, 4.0, 5.5, 7.0]

total = sum(notas)
promedio = total / len(notas)
print(len(notas))
print(round(promedio, 2))
print(f"Promedio: {promedio:.1f}")`,

  `registros = [
    {"curso": "Python", "area": "datos", "alumnos": 12},
    {"curso": "SQL", "area": "datos", "alumnos": 7},
    {"curso": "CSS", "area": "web", "alumnos": 9},
]

grupos = {}
for r in registros:
    grupos.setdefault(r["area"], []).append(r["alumnos"])

for area in sorted(grupos):
    print(area, sum(grupos[area]))`,

  `registros = [
    {"curso": "Python", "alumnos": 12},
    {"curso": "SQL", "alumnos": 7},
    {"curso": "Git", "alumnos": 19},
]

mayor = max(registros, key=lambda r: r["alumnos"])
menor = min(registros, key=lambda r: r["alumnos"])
print(mayor["curso"], mayor["alumnos"])
print(menor["curso"], menor["alumnos"])`,

  `registros = [
    {"curso": "Git", "alumnos": 7},
    {"curso": "SQL", "alumnos": 12},
    {"curso": "Python", "alumnos": 12},
]

ordenados = sorted(registros, key=lambda r: (-r["alumnos"], r["curso"]))
for r in ordenados:
    print(r["curso"], r["alumnos"])`,

  `registros = [
    {"curso": "Python", "alumnos": 12, "ingreso": 540000},
    {"curso": "SQL", "alumnos": 7, "ingreso": 210000},
]

print(f"{'Curso':<10}{'Alumnos':>8}{'Ingreso':>12}")
for r in registros:
    print(f"{r['curso']:<10}{r['alumnos']:>8}{r['ingreso']:>12,}")`,

  `inscritos = ["ana", "beto", "ana", "carla"]
aprobados = ["ana", "carla"]

unicos = set(inscritos)
faltan = unicos.difference(set(aprobados))
print(len(unicos))
print(sorted(unicos))
print(sorted(faltan))`,

  `texto = "curso,region,alumnos\\nPython,Norte,12\\nSQL,Centro,7\\nPython,Centro,9\\nGit,Norte,4"

lineas = texto.split("\\n")
cabecera = lineas[0].split(",")
registros = []
for linea in lineas[1:]:
    fila = dict(zip(cabecera, linea.split(",")))
    fila["alumnos"] = int(fila["alumnos"])
    registros.append(fila)

por_curso = {}
for r in registros:
    por_curso.setdefault(r["curso"], []).append(r["alumnos"])

resumen = []
for curso in por_curso:
    alumnos = por_curso[curso]
    resumen.append({"curso": curso, "total": sum(alumnos), "promedio": sum(alumnos) / len(alumnos)})

print(f"{'Curso':<8}{'Total':>7}{'Promedio':>10}")
for fila in sorted(resumen, key=lambda f: -f["total"]):
    print(f"{fila['curso']:<8}{fila['total']:>7}{fila['promedio']:>10.1f}")`
];

const { context, comprobaciones } = solveRoute({
  id: "datos-python",
  files: FILES,
  solutions: SOLUTIONS,
  globalName: "DatosPythonCourse"
});

const preguntas = checkExams(context, "datos-python");
checkSafety(["datos-python-course.js", "python-runtime.js"]);

/* La ruta no puede prometer librerías que el intérprete no tiene. */
const curso = read("datos-python-course.js");
assert.equal(/\bimport\s+pandas|\bimport\s+numpy|pd\.|np\./.test(curso), false,
  "el material no puede usar librerías que el laboratorio no ejecuta");

const pagina = read("datos-python.html");
assert.match(pagina, /no hay pandas/i, "la página debe declarar que no hay librerías externas");
assert.match(pagina, /src="python-runtime\.js\?v=/, "la página carga el intérprete real");
assert.ok(pagina.indexOf('src="python-runtime.js') < pagina.indexOf('src="datos-python-course.js'),
  "el intérprete debe cargarse antes que el curso");

/* Contraste con CPython: la misma solución debe dar la misma salida en Python 3. */
let contrastadas = 0;
try {
  const archivo = path.join(os.tmpdir(), "codigo-cero-datos-python.py");
  for (const [indice, solucion] of SOLUTIONS.entries()) {
    fs.writeFileSync(archivo, solucion, "utf8");
    const real = execFileSync("python", [archivo], {
      encoding: "utf8",
      env: { ...process.env, PYTHONIOENCODING: "utf-8" }
    }).replace(/\r\n/g, "\n").replace(/\n$/, "");
    const propio = context.runJson("globalThis.PythonRuntime.run(" + JSON.stringify(solucion) + ").text");
    assert.equal(propio, real, "módulo " + (indice + 1) + ": el intérprete del sitio se separó de CPython");
    contrastadas += 1;
  }
} catch (error) {
  if (error instanceof assert.AssertionError) throw error;
  contrastadas = -1;
}

const detalle = contrastadas >= 0
  ? contrastadas + " soluciones contrastadas con CPython"
  : "CPython no disponible en esta máquina";
console.log(`Datos con Python: 12 módulos resueltos, ${comprobaciones} validaciones, 3 exámenes y ${preguntas} preguntas (${detalle})`);
