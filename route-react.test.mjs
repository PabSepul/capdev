import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import { solveRoute, checkExams, checkSafety, read } from "./starter-harness.mjs";

/*
  Ruta React. Además de resolver los doce módulos por el camino real de la
  página, el primer render de cada solución se contrasta con React 19 real: el
  mismo archivo se transpila con el compilador de TypeScript y se dibuja con
  renderToStaticMarkup. Si la transformación de JSX o el renderizado del
  laboratorio se separan de React, la prueba falla.
*/

const FILES = ["starter-exams.js", "starter-runtime.js", "react-lab.js", "react-course.js", "starter-course.js"];

const SOLUTIONS = [
  `function Saludo() {
  return <h1>Hola, React</h1>;
}

render(Saludo);`,

  `function Curso(props) {
  return <p>{props.nombre} dura {props.horas} horas</p>;
}

render(Curso, { nombre: "Python", horas: 12 });`,

  `function Ficha(props) {
  return (
    <article className="ficha">
      <h2>{props.nombre}</h2>
      <p>Nivel: {props.nivel}</p>
    </article>
  );
}

render(Ficha, { nombre: "SQL", nivel: "inicial" });`,

  `function Etiqueta(props) {
  return <span className="etiqueta">{props.texto}</span>;
}

function Ficha(props) {
  return (
    <div>
      <h2>{props.nombre}</h2>
      <Etiqueta texto={props.nivel} />
    </div>
  );
}

render(Ficha, { nombre: "Git", nivel: "inicial" });`,

  `function Lista(props) {
  return (
    <ul>
      {props.cursos.map(function (curso) {
        return <li key={curso.id}>{curso.nombre}</li>;
      })}
    </ul>
  );
}

render(Lista, { cursos: [{ id: 1, nombre: "Python" }, { id: 2, nombre: "SQL" }] });`,

  `function Lista(props) {
  const activos = props.cursos.filter(function (curso) {
    return curso.activo;
  });
  return (
    <ul>
      {activos.map(function (curso) {
        return <li key={curso.id}>{curso.nombre}</li>;
      })}
    </ul>
  );
}

render(Lista, { cursos: [{ id: 1, nombre: "Python", horas: 12, activo: true }, { id: 2, nombre: "SQL", horas: 5, activo: false }] });`,

  `function Aviso(props) {
  if (props.cantidad === 0) {
    return <p className="vacio">No hay cursos todavía.</p>;
  }
  return <p>Hay {props.cantidad} cursos.</p>;
}

render(Aviso, { cantidad: 0 });`,

  `function Contador() {
  const [valor, poner] = useState(0);
  return (
    <div>
      <p>Llevas {valor} clics</p>
      <button onClick={function () { poner(valor + 1); }}>Sumar</button>
    </div>
  );
}

render(Contador);`,

  `function Ajuste() {
  const [valor, poner] = useState(10);
  return (
    <div>
      <p>Valor: {valor}</p>
      <button onClick={function () { poner(valor + 1); }}>Más</button>
      <button onClick={function () { poner(valor - 1); }}>Menos</button>
    </div>
  );
}

render(Ajuste);`,

  `function Tareas() {
  const [tareas, poner] = useState(["Estudiar"]);
  return (
    <div>
      <ul>
        {tareas.map(function (tarea, indice) {
          return <li key={indice}>{tarea}</li>;
        })}
      </ul>
      <button onClick={function () { poner(tareas.concat(["Nueva"])); }}>Agregar</button>
    </div>
  );
}

render(Tareas);`,

  `function Panel() {
  const [visible, poner] = useState(true);
  return (
    <div>
      {visible ? <p>Contenido visible</p> : null}
      <button onClick={function () { poner(!visible); }}>{visible ? "Ocultar" : "Mostrar"}</button>
    </div>
  );
}

render(Panel);`,

  `function Curso(props) {
  return (
    <li className="curso">
      <strong>{props.curso.nombre}</strong> · {props.curso.horas} h
    </li>
  );
}

function Catalogo(props) {
  const [soloActivos, poner] = useState(false);
  const visibles = props.cursos.filter(function (curso) {
    return soloActivos === false || curso.activo;
  });
  return (
    <section>
      <h2>Catálogo ({visibles.length})</h2>
      <ul>
        {visibles.map(function (curso) {
          return <Curso key={curso.id} curso={curso} />;
        })}
      </ul>
      <button onClick={function () { poner(!soloActivos); }}>
        {soloActivos ? "Ver todos" : "Solo activos"}
      </button>
    </section>
  );
}

render(Catalogo, { cursos: [
  { id: 1, nombre: "Python", horas: 12, activo: true },
  { id: 2, nombre: "SQL", horas: 5, activo: false }
] });`
];

const { context, comprobaciones } = solveRoute({
  id: "react",
  files: FILES,
  solutions: SOLUTIONS,
  globalName: "ReactCourse"
});

const preguntas = checkExams(context, "react");
checkSafety(["react-lab.js", "react-course.js"]);

const pagina = read("react.html");
assert.match(pagina, /No es React completo/, "la página declara el alcance del laboratorio");
assert.match(pagina, /id="starter-preview"[^>]*sandbox=""/, "la vista previa sigue sin permitir scripts");
assert.ok(pagina.indexOf('src="react-lab.js') < pagina.indexOf('src="react-course.js'),
  "el laboratorio se carga antes que el curso");

/* Lo que el laboratorio no hace tiene que decirlo. */
const ERRORES = [
  ["function A() { return <p>hola</p>; }", /termina el archivo con render/],
  ["function A() { return <p>hola; }\nrender(A);", /cerrar/i],
  ["function A() { const [v] = useState(0); return <p>{v}</p>; }\nrender(A);\nuseState(1);", /useState solo puede llamarse dentro de un componente/],
  ["render(3);", /render\(\) necesita un componente/]
];
for (const [programa, esperado] of ERRORES) {
  const salida = context.runJson("globalThis.ReactLab.run(" + JSON.stringify(programa) + ", {})");
  assert.ok(salida.error, "este programa debía fallar:\n" + programa);
  assert.match(salida.error, esperado, "el aviso no explica el problema: " + salida.error);
}

/* Cada módulo con interacción tiene que declarar qué se presiona. */
const escenarios = context.runJson("globalThis.ReactCourse.lessons.map((m) => m.scenario || null)");
for (const [indice, escenario] of escenarios.entries()) {
  if (indice < 7) continue;
  assert.ok(escenario && Array.isArray(escenario.acciones) && escenario.acciones.length > 0,
    "módulo " + (indice + 1) + ": un módulo de estado necesita interacciones que probar");
}

/* ------------------- contraste con React real ------------------- */

let contrastados = 0;
try {
  const modules = process.env.CONTENT_QA_MODULES || path.join(os.tmpdir(), "capsulasdev-content-qa", "node_modules");
  const requireQa = createRequire(path.join(modules, "../package.json"));
  const ts = requireQa("typescript");
  const React = requireQa("react");
  const { renderToStaticMarkup } = requireQa("react-dom/server");

  for (const [indice, solucion] of SOLUTIONS.entries()) {
    const transpilado = ts.transpileModule(solucion, {
      compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.None }
    }).outputText;
    const sandbox = {
      React,
      useState: React.useState,
      console: { log() {}, error() {} },
      render(componente, props) { sandbox.__raiz = React.createElement(componente, props || {}); }
    };
    vm.createContext(sandbox);
    vm.runInContext(transpilado, sandbox);
    /* React 19 antepone <link rel="preload"> a las imágenes: es una optimización
       de su renderizador de servidor, no parte de lo que produce el componente. */
    const real = renderToStaticMarkup(sandbox.__raiz).replace(/<link rel="preload"[^>]*\/>/g, "");
    const propio = context.runJson("globalThis.ReactLab.run(" + JSON.stringify(solucion) + ", {})");
    assert.equal(propio.pantallas[0].html, real,
      "módulo " + (indice + 1) + ": el primer render se separó de React " + React.version);
    contrastados += 1;
  }
  assert.equal(contrastados, SOLUTIONS.length);
} catch (error) {
  if (error instanceof assert.AssertionError) throw error;
  if (process.env.CONTENT_QA_SKIP !== "1") {
    console.error("No se pudo contrastar con React real: " + error.message
      + "\nInstala react, react-dom y typescript@5.9.3 y apunta CONTENT_QA_MODULES a su node_modules,"
      + " o declara CONTENT_QA_SKIP=1 para omitir esa comparación a sabiendas.");
    process.exit(1);
  }
  contrastados = -1;
}

const detalle = contrastados >= 0
  ? contrastados + " primeros renders contrastados con React real"
  : "comparación con React omitida a petición";
console.log(`React: 12 módulos resueltos, ${comprobaciones} validaciones, 3 exámenes y ${preguntas} preguntas (${detalle})`);
