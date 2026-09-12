/* Laboratorio de React.

   Tres piezas:

   1. Una transformación de JSX a llamadas createElement, hecha sobre el texto
      del programa. Es lo mismo que hace Babel antes de que el navegador vea el
      código: JSX no es JavaScript y ningún motor lo entiende directamente.
   2. Un React mínimo —createElement, componentes de función, props, children,
      key y useState— sobre el que se ejecutan de verdad los componentes que
      escribe la persona, con el intérprete de starter-runtime.js.
   3. Un renderizado a HTML y un ciclo de eventos: cada interacción del módulo
      dispara el manejador real, cambia el estado y vuelve a renderizar.

   No es React de verdad: no hay DOM virtual con reconciliación, ni efectos, ni
   contexto, ni renderizado concurrente. Lo que sí es real es el flujo que
   enseña la ruta: props hacia abajo, estado que provoca un nuevo render, y una
   lista con key. Las plantillas se contrastan con React real en las pruebas. */
(() => {
  "use strict";

  const MAX_LARGO = 8000;
  const MAX_RENDER = 400;
  const MAX_NODOS = 500;

  const VACIOS = new Set(["br", "hr", "img", "input", "meta", "link", "source", "area", "col"]);

  /* React escribe en el HTML el nombre real del atributo, no el que se usa en
     JSX. Los nombres de aquí son los que aparecen en los módulos de la ruta. */
  const ATRIBUTOS = {
    className: "class",
    htmlFor: "for",
    tabIndex: "tabindex",
    readOnly: "readonly",
    maxLength: "maxlength",
    minLength: "minlength",
    autoComplete: "autocomplete",
    autoFocus: "autofocus",
    colSpan: "colspan",
    rowSpan: "rowspan",
    srcSet: "srcset",
    contentEditable: "contenteditable",
    spellCheck: "spellcheck",
    crossOrigin: "crossorigin",
    dateTime: "datetime"
  };

  function fallar(mensaje) {
    const error = new Error(mensaje);
    error.friendly = true;
    error.reactLab = true;
    throw error;
  }

  /* ==================== JSX a createElement ==================== */

  const esNombre = (c) => /[A-Za-z0-9_$.-]/.test(c);

  /* Un “<” abre JSX solo si lo anterior deja espacio para una expresión. */
  function abreJsx(texto, posicion) {
    for (let i = posicion - 1; i >= 0; i -= 1) {
      const c = texto[i];
      if (c === " " || c === "\t" || c === "\n" || c === "\r") continue;
      if ("(,=:[{;&|?}".includes(c)) return true;
      if (c === ">" && texto[i - 1] === "=") return true;
      const palabra = texto.slice(Math.max(0, i - 9), i + 1);
      return /\breturn$/.test(palabra) || /\btypeof$/.test(palabra);
    }
    return true;
  }

  function transformarJsx(fuente) {
    let salida = "";
    let i = 0;
    while (i < fuente.length) {
      const c = fuente[i];
      if (c === "/" && fuente[i + 1] === "/") {
        const fin = fuente.indexOf("\n", i);
        const corte = fin === -1 ? fuente.length : fin;
        salida += fuente.slice(i, corte);
        i = corte;
        continue;
      }
      if (c === "/" && fuente[i + 1] === "*") {
        const fin = fuente.indexOf("*/", i + 2);
        const corte = fin === -1 ? fuente.length : fin + 2;
        salida += fuente.slice(i, corte);
        i = corte;
        continue;
      }
      if (c === '"' || c === "'" || c === "`") {
        const { texto, siguiente } = leerCadena(fuente, i);
        salida += texto;
        i = siguiente;
        continue;
      }
      if (c === "<" && esNombre(fuente[i + 1] || "") && abreJsx(fuente, i)) {
        const { codigo, siguiente } = leerElemento(fuente, i);
        salida += codigo;
        i = siguiente;
        continue;
      }
      salida += c;
      i += 1;
    }
    return salida;
  }

  function leerCadena(fuente, inicio) {
    const comilla = fuente[inicio];
    let i = inicio + 1;
    while (i < fuente.length) {
      if (fuente[i] === "\\") { i += 2; continue; }
      if (fuente[i] === comilla) { i += 1; break; }
      /* Una plantilla puede llevar ${ ... } con JSX dentro. */
      if (comilla === "`" && fuente[i] === "$" && fuente[i + 1] === "{") {
        let profundidad = 1;
        let j = i + 2;
        while (j < fuente.length && profundidad > 0) {
          if (fuente[j] === "{") profundidad += 1;
          else if (fuente[j] === "}") profundidad -= 1;
          j += 1;
        }
        const dentro = fuente.slice(i + 2, j - 1);
        return {
          texto: fuente.slice(inicio, i) + "${" + transformarJsx(dentro) + "}"
            + leerCadena("`" + fuente.slice(j), 0).texto.slice(1),
          siguiente: j + buscarCierrePlantilla(fuente, j)
        };
      }
      i += 1;
    }
    return { texto: fuente.slice(inicio, i), siguiente: i };
  }

  function buscarCierrePlantilla(fuente, desde) {
    let i = desde;
    while (i < fuente.length) {
      if (fuente[i] === "\\") { i += 2; continue; }
      if (fuente[i] === "`") return i - desde + 1;
      i += 1;
    }
    return fuente.length - desde;
  }

  function leerElemento(fuente, inicio) {
    let i = inicio + 1;
    let nombre = "";
    while (i < fuente.length && esNombre(fuente[i])) { nombre += fuente[i]; i += 1; }
    if (!nombre) fallar("Una etiqueta JSX necesita un nombre después de <.");

    const atributos = [];
    for (;;) {
      while (i < fuente.length && /\s/.test(fuente[i])) i += 1;
      if (i >= fuente.length) fallar("Falta cerrar la etiqueta <" + nombre + ">.");
      if (fuente[i] === "/" && fuente[i + 1] === ">") {
        return { codigo: crearLlamada(nombre, atributos, []), siguiente: i + 2 };
      }
      if (fuente[i] === ">") { i += 1; break; }

      let atributo = "";
      while (i < fuente.length && esNombre(fuente[i])) { atributo += fuente[i]; i += 1; }
      if (!atributo) fallar("No entiendo un atributo dentro de <" + nombre + ">.");
      while (i < fuente.length && /\s/.test(fuente[i])) i += 1;
      if (fuente[i] !== "=") {
        atributos.push({ nombre: atributo, valor: "true" });
        continue;
      }
      i += 1;
      while (i < fuente.length && /\s/.test(fuente[i])) i += 1;
      if (fuente[i] === "{") {
        const { expresion, siguiente } = leerLlaves(fuente, i);
        atributos.push({ nombre: atributo, valor: transformarJsx(expresion) });
        i = siguiente;
        continue;
      }
      if (fuente[i] === '"' || fuente[i] === "'") {
        const { texto, siguiente } = leerCadena(fuente, i);
        atributos.push({ nombre: atributo, valor: JSON.stringify(texto.slice(1, -1)) });
        i = siguiente;
        continue;
      }
      fallar("El valor del atributo " + atributo + " debe ir entre comillas o entre llaves.");
    }

    const hijos = [];
    let texto = "";
    const soltarTexto = () => {
      const limpio = limpiarTextoJsx(texto);
      if (limpio !== null) hijos.push(JSON.stringify(limpio));
      texto = "";
    };

    for (;;) {
      if (i >= fuente.length) fallar("Falta cerrar la etiqueta </" + nombre + ">.");
      if (fuente[i] === "<" && fuente[i + 1] === "/") {
        soltarTexto();
        let cierre = "";
        let j = i + 2;
        while (j < fuente.length && esNombre(fuente[j])) { cierre += fuente[j]; j += 1; }
        while (j < fuente.length && /\s/.test(fuente[j])) j += 1;
        if (fuente[j] !== ">") fallar("Falta el > al cerrar </" + cierre + ">.");
        if (cierre !== nombre) fallar("Abriste <" + nombre + "> y cerraste </" + cierre + ">.");
        return { codigo: crearLlamada(nombre, atributos, hijos), siguiente: j + 1 };
      }
      if (fuente[i] === "<" && esNombre(fuente[i + 1] || "")) {
        soltarTexto();
        const { codigo, siguiente } = leerElemento(fuente, i);
        hijos.push(codigo);
        i = siguiente;
        continue;
      }
      if (fuente[i] === "{") {
        soltarTexto();
        const { expresion, siguiente } = leerLlaves(fuente, i);
        /* {/* así se comenta dentro del JSX *​/} y no dibuja nada. */
        const soloComentario = /^\s*\/\*[\s\S]*\*\/\s*$/.test(expresion) || /^\s*\/\/[^\n]*\s*$/.test(expresion);
        if (expresion.trim() !== "" && !soloComentario) hijos.push(transformarJsx(expresion));
        i = siguiente;
        continue;
      }
      texto += fuente[i];
      i += 1;
    }
  }

  function leerLlaves(fuente, inicio) {
    let profundidad = 0;
    let i = inicio;
    while (i < fuente.length) {
      const c = fuente[i];
      if (c === '"' || c === "'" || c === "`") {
        const { siguiente } = leerCadena(fuente, i);
        i = siguiente;
        continue;
      }
      if (c === "{") profundidad += 1;
      if (c === "}") {
        profundidad -= 1;
        if (profundidad === 0) return { expresion: fuente.slice(inicio + 1, i), siguiente: i + 1 };
      }
      i += 1;
    }
    fallar("Falta cerrar una llave } dentro del JSX.");
    return null;
  }

  /* Regla de JSX, la misma que aplica Babel: solo se recorta el espacio que toca
     un salto de línea. Un espacio dentro de una misma línea se conserva, y por eso
     <p>{a} de {b}</p> mantiene los espacios alrededor de “de”. */
  function limpiarTextoJsx(texto) {
    if (texto === "") return null;
    const lineas = texto.split("\n");
    let resultado = "";
    for (let i = 0; i < lineas.length; i += 1) {
      let linea = lineas[i].replace(/\t/g, " ");
      if (i !== 0) linea = linea.replace(/^ +/, "");
      if (i !== lineas.length - 1) linea = linea.replace(/ +$/, "");
      if (linea === "") continue;
      if (resultado !== "") resultado += " ";
      resultado += linea;
    }
    return resultado === "" ? null : resultado;
  }

  function crearLlamada(nombre, atributos, hijos) {
    const tipo = /^[a-z]/.test(nombre) ? JSON.stringify(nombre) : nombre;
    const props = atributos.length
      ? "{ " + atributos.map((a) => JSON.stringify(a.nombre) + ": " + a.valor).join(", ") + " }"
      : "null";
    const partes = [tipo, props].concat(hijos);
    return "React.createElement(" + partes.join(", ") + ")";
  }

  /* ======================= React mínimo ======================= */

  function crearReact(estado, api) {
    return {
      createElement(tipo, props, ...hijos) {
        estado.nodos += 1;
        if (estado.nodos > MAX_NODOS) fallar("La interfaz creó demasiados elementos. Revisa si una lista crece sin freno.");
        const planos = [];
        const aplanar = (valor) => {
          if (valor === null || valor === undefined || valor === false || valor === true) return;
          if (Array.isArray(valor)) { valor.forEach(aplanar); return; }
          planos.push(valor);
        };
        hijos.forEach(aplanar);
        return { __elemento: true, tipo, props: props || {}, hijos: planos };
      },
      useState(inicial) {
        if (!estado.renderizando) {
          fallar("useState solo puede llamarse dentro de un componente, mientras React lo está dibujando.");
        }
        const indice = estado.hookIndex;
        estado.hookIndex += 1;
        const slots = estado.hooks;
        if (indice >= slots.length) slots.push(inicial);
        const poner = (valor) => {
          const anterior = slots[indice];
          const nuevo = api.isCallable(valor) ? api.call(valor, [anterior]) : valor;
          slots[indice] = nuevo;
          estado.cambios.push({ indice, anterior, nuevo });
          return null;
        };
        return [slots[indice], poner];
      }
    };
  }

  /* ==================== Render a HTML ==================== */

  function escapar(texto) {
    return String(texto)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderizar(nodo, estado, api, profundidad, manejadores) {
    if (nodo === null || nodo === undefined || nodo === false || nodo === true) return "";
    if (profundidad > 30) fallar("Los componentes se anidan demasiado. Revisa si uno se dibuja a sí mismo.");
    if (Array.isArray(nodo)) {
      return nodo.map((hijo) => renderizar(hijo, estado, api, profundidad, manejadores)).join("");
    }
    if (!nodo || nodo.__elemento !== true) return escapar(api.format(nodo));

    if (api.isCallable(nodo.tipo)) {
      const props = { ...nodo.props };
      /* La key de un componente también cuenta: es donde React la exige cuando
         el elemento se creó dentro de un map. */
      if (props.key !== undefined && props.key !== null) {
        estado.claves.push({ tipo: "componente", clave: api.format(props.key) });
        delete props.key;
      }
      if (nodo.hijos.length) props.children = nodo.hijos.length === 1 ? nodo.hijos[0] : nodo.hijos;
      const resultado = api.call(nodo.tipo, [props]);
      return renderizar(resultado, estado, api, profundidad + 1, manejadores);
    }
    if (typeof nodo.tipo !== "string") {
      fallar("Un elemento tiene que empezar con una etiqueta html en minúscula o con un componente que exista.");
    }

    const atributos = [];
    let claveLista = null;
    for (const nombre of Object.keys(nodo.props)) {
      const valor = nodo.props[nombre];
      if (nombre === "children") continue;
      if (nombre === "key") { claveLista = valor; continue; }
      if (/^on[A-Z]/.test(nombre)) {
        if (!api.isCallable(valor)) fallar("El atributo " + nombre + " necesita una función.");
        const id = manejadores.length;
        manejadores.push({ evento: nombre, funcion: valor, etiqueta: textoDe(nodo, api) });
        atributos.push('data-manejador="' + id + '"');
        continue;
      }
      if (valor === false || valor === null || valor === undefined) continue;
      /* React serializa un atributo booleano como nombre="", no como nombre suelto. */
      if (valor === true) { atributos.push(escapar(ATRIBUTOS[nombre] || nombre) + '=""'); continue; }
      atributos.push(escapar(ATRIBUTOS[nombre] || nombre) + '="' + escapar(api.format(valor)) + '"');
    }
    if (claveLista !== null) estado.claves.push({ tipo: nodo.tipo, clave: api.format(claveLista) });

    const dentroDeEtiqueta = atributos.length ? " " + atributos.join(" ") : "";
    if (VACIOS.has(nodo.tipo)) return "<" + nodo.tipo + dentroDeEtiqueta + "/>";
    const abre = "<" + nodo.tipo + dentroDeEtiqueta + ">";
    const dentro = nodo.hijos.map((hijo) => renderizar(hijo, estado, api, profundidad + 1, manejadores)).join("");
    return abre + dentro + "</" + nodo.tipo + ">";
  }

  function textoDe(nodo, api) {
    if (nodo === null || nodo === undefined || typeof nodo === "boolean") return "";
    if (Array.isArray(nodo)) return nodo.map((hijo) => textoDe(hijo, api)).join("");
    if (!nodo || nodo.__elemento !== true) return api.format(nodo);
    return nodo.hijos.map((hijo) => textoDe(hijo, api)).join("");
  }

  /* Quita los data-manejador antes de mostrar el HTML: son andamiaje interno. */
  const limpiarHtml = (html) => html.replace(/ data-manejador="\d+"/g, "");

  /* ========================== run ========================== */

  function run(code, scenario) {
    if (typeof code !== "string") code = "";
    if (code.length > MAX_LARGO) {
      return terminar(null, "El programa es demasiado largo para el laboratorio.");
    }

    let javascript;
    try {
      javascript = transformarJsx(code);
    } catch (error) {
      return terminar(null, error.friendly ? error.message : "No pude leer el JSX. Revisa que cada etiqueta esté cerrada.");
    }

    const base = scenario || {};
    const estado = {
      hooks: [],
      hookIndex: 0,
      renderizando: false,
      nodos: 0,
      claves: [],
      cambios: [],
      salida: [],
      renders: 0
    };

    let api = null;
    let raiz = null;

    const resultado = globalThis.StarterRuntime.runJavaScript(javascript, {
      globals: (herramientas) => {
        api = herramientas;
        const react = crearReact(estado, herramientas);
        return {
          React: react,
          useState: react.useState,
          console: {
            log: (...valores) => estado.salida.push(valores.map((v) => herramientas.format(v)).join(" ")),
            error: (...valores) => estado.salida.push(valores.map((v) => herramientas.format(v)).join(" "))
          },
          render: (componente, props) => {
            if (!herramientas.isCallable(componente)) {
              herramientas.fail("render() necesita un componente: una función que devuelva JSX.");
            }
            raiz = { componente, props: props || {} };
            return null;
          }
        };
      }
    });

    if (resultado.error) {
      const mensaje = resultado.error.message || String(resultado.error);
      return terminar(estado, mensaje, javascript);
    }
    if (!raiz) {
      return terminar(estado, "Falta dibujar el componente: termina el archivo con render(NombreDelComponente).", javascript);
    }

    const pantallas = [];
    const dibujar = (titulo) => {
      estado.hookIndex = 0;
      estado.nodos = 0;
      estado.claves = [];
      estado.renderizando = true;
      estado.renders += 1;
      if (estado.renders > MAX_RENDER) fallar("La interfaz se volvió a dibujar demasiadas veces.");
      const manejadores = [];
      const elemento = api.call(raiz.componente, [raiz.props]);
      const html = renderizar(elemento, estado, api, 0, manejadores);
      estado.renderizando = false;
      pantallas.push({ titulo, html, manejadores, claves: estado.claves.slice() });
      return pantallas[pantallas.length - 1];
    };

    try {
      let pantalla = dibujar("Primer render");
      for (const accion of base.acciones || []) {
        const objetivo = pantalla.manejadores.find((m) =>
          m.evento === (accion.evento || "onClick")
          && (accion.texto === undefined || m.etiqueta.trim() === accion.texto));
        if (!objetivo) {
          fallar("La práctica intentó " + (accion.evento || "onClick") + " sobre “" + (accion.texto ?? "el primer control")
            + "” y no encontró ese control en la interfaz.");
        }
        estado.cambios = [];
        api.call(objetivo.funcion, [{ target: { value: accion.valor ?? "" } }]);
        pantalla = dibujar("Después de " + (accion.evento || "onClick") + " en “" + (accion.texto ?? "el control") + "”");
      }
    } catch (error) {
      return terminar(estado, error.friendly ? error.message : String(error && error.message), javascript, pantallas);
    }

    return terminar(estado, null, javascript, pantallas);
  }

  function terminar(estado, error, javascript, pantallas) {
    const listas = pantallas || [];
    const bloques = [];
    if (estado && estado.salida.length) bloques.push(estado.salida.join("\n"));
    for (const pantalla of listas) {
      bloques.push(pantalla.titulo + ":\n" + limpiarHtml(pantalla.html));
    }
    if (error) bloques.push("⚠ " + error);
    else if (bloques.length === 0) bloques.push("Nada que mostrar todavía.");

    const ultima = listas.length ? listas[listas.length - 1] : null;
    return {
      text: bloques.join("\n\n"),
      html: ultima ? limpiarHtml(ultima.html) : "",
      pantallas: listas.map((p) => ({ titulo: p.titulo, html: limpiarHtml(p.html), claves: p.claves })),
      claves: ultima ? ultima.claves : [],
      output: estado ? estado.salida.slice() : [],
      error,
      javascript: javascript || ""
    };
  }

  globalThis.ReactLab = { run, transformarJsx };
})();
