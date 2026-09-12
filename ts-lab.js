/* Laboratorio de TypeScript.

   Hace dos cosas distintas y en este orden:

   1. Revisa los tipos de un subconjunto declarado del lenguaje. No es tsc: es un
      verificador propio, escrito a mano, que cubre anotaciones de variables,
      firmas de funciones, type, interface, arreglos, objetos, uniones,
      propiedades opcionales, estrechamiento por comparación y genéricos de un
      solo parámetro. Cuando no puede determinar un tipo lo trata como
      desconocido y no informa nada: prefiere callar antes que inventar un error.

   2. Si no hay errores de tipo, borra las anotaciones y ejecuta el JavaScript
      resultante con el intérprete de starter-runtime.js, que es el mismo de la
      ruta de JavaScript. Eso es exactamente lo que hace TypeScript: comprueba y
      luego se quita del medio.

   Las doce soluciones de la ruta se contrastan contra TypeScript 5.9.3 real en
   route-typescript.test.mjs: si tsc y este verificador no coinciden en si un
   programa tiene error, la prueba falla. */
(() => {
  "use strict";

  const MAX_LARGO = 6000;

  /* ======================== Tokenizador ======================== */

  const PALABRAS = new Set([
    "let", "const", "function", "return", "if", "else", "for", "of", "while",
    "true", "false", "null", "undefined", "type", "interface", "typeof"
  ]);

  const SIMBOLOS = [
    "===", "!==", "=>", "<=", ">=", "&&", "||",
    "{", "}", "(", ")", "[", "]", ";", ",", ":", "?", ".", "|", "<", ">",
    "=", "+", "-", "*", "/", "%", "!"
  ];

  function fallar(mensaje, linea) {
    const error = new Error(linea ? "Línea " + linea + " · " + mensaje : mensaje);
    error.friendly = true;
    error.tsLab = true;
    throw error;
  }

  function tokenizar(fuente) {
    const tokens = [];
    let i = 0;
    let linea = 1;
    while (i < fuente.length) {
      const c = fuente[i];
      if (c === "\n") { linea += 1; i += 1; continue; }
      if (c === " " || c === "\t" || c === "\r") { i += 1; continue; }
      if (c === "/" && fuente[i + 1] === "/") {
        while (i < fuente.length && fuente[i] !== "\n") i += 1;
        continue;
      }
      if (c === "/" && fuente[i + 1] === "*") {
        i += 2;
        while (i < fuente.length && !(fuente[i] === "*" && fuente[i + 1] === "/")) {
          if (fuente[i] === "\n") linea += 1;
          i += 1;
        }
        i += 2;
        continue;
      }
      if (c === '"' || c === "'") {
        const comilla = c;
        let valor = "";
        i += 1;
        while (i < fuente.length && fuente[i] !== comilla) {
          if (fuente[i] === "\\") { valor += leerEscape(fuente[i + 1]); i += 2; continue; }
          if (fuente[i] === "\n") fallar("Falta cerrar un texto con " + comilla + ".", linea);
          valor += fuente[i];
          i += 1;
        }
        if (i >= fuente.length) fallar("Falta cerrar un texto con " + comilla + ".", linea);
        i += 1;
        tokens.push({ tipo: "texto", valor, linea });
        continue;
      }
      if (c === "`") {
        const partes = [];
        let actual = "";
        i += 1;
        while (i < fuente.length && fuente[i] !== "`") {
          if (fuente[i] === "\\") { actual += leerEscape(fuente[i + 1]); i += 2; continue; }
          if (fuente[i] === "$" && fuente[i + 1] === "{") {
            partes.push({ tipo: "texto", valor: actual });
            actual = "";
            i += 2;
            let profundidad = 1;
            let dentro = "";
            while (i < fuente.length && profundidad > 0) {
              if (fuente[i] === "{") profundidad += 1;
              if (fuente[i] === "}") { profundidad -= 1; if (profundidad === 0) break; }
              if (fuente[i] === "\n") linea += 1;
              dentro += fuente[i];
              i += 1;
            }
            i += 1;
            partes.push({ tipo: "expresion", fuente: dentro, linea });
            continue;
          }
          if (fuente[i] === "\n") linea += 1;
          actual += fuente[i];
          i += 1;
        }
        if (i >= fuente.length) fallar("Falta cerrar una plantilla con `.", linea);
        i += 1;
        partes.push({ tipo: "texto", valor: actual });
        tokens.push({ tipo: "plantilla", partes, linea });
        continue;
      }
      if (/[0-9]/.test(c)) {
        let valor = "";
        while (i < fuente.length && /[0-9._]/.test(fuente[i])) { valor += fuente[i]; i += 1; }
        tokens.push({ tipo: "numero", valor: Number(valor.replace(/_/g, "")), linea });
        continue;
      }
      if (/[A-Za-z_$]/.test(c)) {
        let valor = "";
        while (i < fuente.length && /[A-Za-z0-9_$]/.test(fuente[i])) { valor += fuente[i]; i += 1; }
        tokens.push({ tipo: PALABRAS.has(valor) ? "palabra" : "nombre", valor, linea });
        continue;
      }
      const simbolo = SIMBOLOS.find((s) => fuente.startsWith(s, i));
      if (!simbolo) fallar("No entiendo el símbolo “" + c + "”.", linea);
      i += simbolo.length;
      tokens.push({ tipo: "simbolo", valor: simbolo, linea });
    }
    tokens.push({ tipo: "fin", valor: "", linea });
    return tokens;
  }

  function leerEscape(caracter) {
    if (caracter === "n") return "\n";
    if (caracter === "t") return "\t";
    if (caracter === "r") return "\r";
    if (caracter === "\\") return "\\";
    if (caracter === "0") return "\0";
    return caracter === undefined ? "" : caracter;
  }

  /* =========================== Tipos =========================== */

  const DESCONOCIDO = { clase: "desconocido" };
  const primitivo = (nombre) => ({ clase: "primitivo", nombre });
  const NUMBER = primitivo("number");
  const STRING = primitivo("string");
  const BOOLEAN = primitivo("boolean");
  const VOID = primitivo("void");
  const NULO = primitivo("null");
  const INDEFINIDO = primitivo("undefined");

  const arregloDe = (elemento) => ({ clase: "arreglo", elemento });
  const literal = (valor, base) => ({ clase: "literal", valor, base });

  function unir(miembros) {
    const planos = [];
    for (const miembro of miembros) {
      if (miembro.clase === "union") planos.push(...miembro.miembros);
      else planos.push(miembro);
    }
    if (planos.some((t) => t.clase === "desconocido")) return DESCONOCIDO;
    const unicos = [];
    for (const tipo of planos) {
      if (!unicos.some((otro) => nombreTipo(otro) === nombreTipo(tipo))) unicos.push(tipo);
    }
    if (unicos.length === 0) return DESCONOCIDO;
    if (unicos.length === 1) return unicos[0];
    return { clase: "union", miembros: unicos };
  }

  function nombreTipo(tipo) {
    if (!tipo) return "desconocido";
    switch (tipo.clase) {
      case "primitivo": return tipo.nombre;
      case "literal": return tipo.base === "string" ? '"' + tipo.valor + '"' : String(tipo.valor);
      case "arreglo": {
        const dentro = nombreTipo(tipo.elemento);
        return /[|]/.test(dentro) ? "(" + dentro + ")[]" : dentro + "[]";
      }
      case "objeto":
        if (tipo.nombre) return tipo.nombre;
        return "{ " + tipo.props.map((p) => p.nombre + (p.opcional ? "?" : "") + ": " + nombreTipo(p.tipo)).join("; ") + " }";
      case "union": return tipo.miembros.map(nombreTipo).join(" | ");
      case "funcion": return "(" + tipo.params.map((p) => p.nombre + ": " + nombreTipo(p.tipo)).join(", ") + ") => " + nombreTipo(tipo.resultado);
      case "generico": return tipo.nombre;
      default: return "desconocido";
    }
  }

  function esDesconocido(tipo) { return !tipo || tipo.clase === "desconocido" || tipo.clase === "generico"; }

  /* ¿Se puede guardar un valor de tipo `origen` donde se espera `destino`? */
  function asignable(origen, destino) {
    if (esDesconocido(origen) || esDesconocido(destino)) return true;
    /* El origen se reparte antes que el destino: con unión contra unión, cada
       miembro del origen tiene que caber en alguno del destino. Al revés, una
       unión completa se comparaba contra un solo miembro y nunca encajaba. */
    if (origen.clase === "union") return origen.miembros.every((m) => asignable(m, destino));
    if (destino.clase === "union") return destino.miembros.some((m) => asignable(origen, m));
    if (origen.clase === "literal") {
      if (destino.clase === "literal") return destino.valor === origen.valor;
      if (destino.clase === "primitivo") return destino.nombre === origen.base;
      return false;
    }
    if (destino.clase === "literal") return false;
    if (origen.clase === "primitivo" && destino.clase === "primitivo") return origen.nombre === destino.nombre;
    if (origen.clase === "arreglo" && destino.clase === "arreglo") {
      if (origen.vacio) return true;
      return asignable(origen.elemento, destino.elemento);
    }
    if (origen.clase === "objeto" && destino.clase === "objeto") {
      for (const esperada of destino.props) {
        const encontrada = origen.props.find((p) => p.nombre === esperada.nombre);
        if (!encontrada) {
          if (esperada.opcional) continue;
          return false;
        }
        if (!asignable(encontrada.tipo, esperada.tipo)) return false;
      }
      /* TypeScript rechaza las propiedades de más solo cuando el valor es un
         objeto escrito ahí mismo, no cuando viene de una variable. */
      if (origen.fresco) {
        for (const propia of origen.props) {
          if (!destino.props.some((p) => p.nombre === propia.nombre)) return false;
        }
      }
      return true;
    }
    if (origen.clase === "funcion" && destino.clase === "funcion") return true;
    return false;
  }

  function propiedadSobrante(origen, destino) {
    if (origen.clase !== "objeto" || destino.clase !== "objeto" || !origen.fresco) return null;
    for (const propia of origen.props) {
      if (!destino.props.some((p) => p.nombre === propia.nombre)) return propia.nombre;
    }
    return null;
  }

  function propiedadFaltante(origen, destino) {
    if (origen.clase !== "objeto" || destino.clase !== "objeto") return null;
    for (const esperada of destino.props) {
      if (esperada.opcional) continue;
      if (!origen.props.some((p) => p.nombre === esperada.nombre)) return esperada.nombre;
    }
    return null;
  }

  /* ======================= Miembros conocidos ======================= */

  const funcion = (params, resultado) => ({ clase: "funcion", params, resultado });
  const par = (nombre, tipo) => ({ nombre, tipo });

  function miembroDe(tipo, nombre) {
    if (esDesconocido(tipo)) return DESCONOCIDO;
    if (tipo.clase === "arreglo") {
      switch (nombre) {
        case "length": return NUMBER;
        case "push": return funcion([par("valor", tipo.elemento)], NUMBER);
        case "join": return funcion([par("separador", STRING)], STRING);
        case "includes": return funcion([par("valor", tipo.elemento)], BOOLEAN);
        case "indexOf": return funcion([par("valor", tipo.elemento)], NUMBER);
        case "slice": return funcion([par("desde", NUMBER)], tipo);
        case "concat": return funcion([par("otro", tipo)], tipo);
        case "map": return { clase: "funcion", params: [par("transformar", DESCONOCIDO)], resultado: DESCONOCIDO, mapea: tipo };
        case "filter": return { clase: "funcion", params: [par("condicion", DESCONOCIDO)], resultado: tipo, filtra: tipo };
        case "find": return { clase: "funcion", params: [par("condicion", DESCONOCIDO)], resultado: unir([tipo.elemento, INDEFINIDO]), filtra: tipo };
        case "forEach": return { clase: "funcion", params: [par("accion", DESCONOCIDO)], resultado: VOID, filtra: tipo };
        case "sort": return { clase: "funcion", params: [par("comparar", DESCONOCIDO)], resultado: tipo, filtra: tipo };
        default: return null;
      }
    }
    if (tipo.clase === "primitivo" && tipo.nombre === "string") {
      switch (nombre) {
        case "length": return NUMBER;
        case "toUpperCase": case "toLowerCase": case "trim": return funcion([], STRING);
        case "includes": case "startsWith": case "endsWith": return funcion([par("texto", STRING)], BOOLEAN);
        case "split": return funcion([par("separador", STRING)], arregloDe(STRING));
        case "slice": return funcion([par("desde", NUMBER)], STRING);
        case "replace": return funcion([par("busca", STRING), par("cambia", STRING)], STRING);
        case "indexOf": return funcion([par("texto", STRING)], NUMBER);
        default: return null;
      }
    }
    if (tipo.clase === "literal" && tipo.base === "string") return miembroDe(STRING, nombre);
    if (tipo.clase === "primitivo" && tipo.nombre === "number") {
      if (nombre === "toFixed") return funcion([par("decimales", NUMBER)], STRING);
      if (nombre === "toString") return funcion([], STRING);
      return null;
    }
    if (tipo.clase === "objeto") {
      const prop = tipo.props.find((p) => p.nombre === nombre);
      if (!prop) return null;
      return prop.opcional ? unir([prop.tipo, INDEFINIDO]) : prop.tipo;
    }
    if (tipo.clase === "union") {
      const partes = tipo.miembros.map((m) => miembroDe(m, nombre));
      if (partes.some((p) => p === null)) return null;
      return unir(partes);
    }
    return null;
  }

  /* =========================== Analizador =========================== */

  function analizar(fuente) {
    const tokens = tokenizar(fuente);
    let pos = 0;
    const ver = (adelanto = 0) => tokens[Math.min(pos + adelanto, tokens.length - 1)];
    const es = (tipo, valor) => ver().tipo === tipo && (valor === undefined || ver().valor === valor);
    const avanzar = () => tokens[pos++];
    const comer = (tipo, valor) => {
      if (!es(tipo, valor)) fallar("Esperaba “" + valor + "” y encontré “" + (ver().valor || "el final") + "”.", ver().linea);
      return avanzar();
    };
    const quitar = (tipo, valor) => (es(tipo, valor) ? Boolean(avanzar()) : false);
    const puntoYComa = () => { while (quitar("simbolo", ";")); };

    /* ------------------------------ tipos ------------------------------ */

    function parsearTipo() {
      const miembros = [parsearTipoSimple()];
      while (quitar("simbolo", "|")) miembros.push(parsearTipoSimple());
      return miembros.length === 1 ? miembros[0] : { clase: "union", miembros };
    }

    function parsearTipoSimple() {
      let base = parsearTipoBase();
      while (es("simbolo", "[") && ver(1).tipo === "simbolo" && ver(1).valor === "]") {
        avanzar(); avanzar();
        base = arregloDe(base);
      }
      return base;
    }

    function parsearTipoBase() {
      const token = ver();
      if (token.tipo === "texto") { avanzar(); return literal(token.valor, "string"); }
      if (token.tipo === "numero") { avanzar(); return literal(token.valor, "number"); }
      if (token.tipo === "palabra" && (token.valor === "true" || token.valor === "false")) {
        avanzar();
        return literal(token.valor === "true", "boolean");
      }
      if (token.tipo === "palabra" && token.valor === "null") { avanzar(); return NULO; }
      if (token.tipo === "palabra" && token.valor === "undefined") { avanzar(); return INDEFINIDO; }
      if (es("simbolo", "{")) return parsearTipoObjeto();
      if (es("simbolo", "(")) {
        avanzar();
        const dentro = parsearTipo();
        comer("simbolo", ")");
        return dentro;
      }
      if (token.tipo !== "nombre") fallar("Esperaba un tipo y encontré “" + token.valor + "”.", token.linea);
      avanzar();
      const nombre = token.valor;
      if (["string", "number", "boolean", "void", "any", "unknown"].includes(nombre)) {
        if (nombre === "any" || nombre === "unknown") return DESCONOCIDO;
        return primitivo(nombre);
      }
      return { clase: "referencia", nombre, linea: token.linea };
    }

    function parsearTipoObjeto(nombre) {
      comer("simbolo", "{");
      const props = [];
      while (!es("simbolo", "}")) {
        const clave = ver().tipo === "texto" ? avanzar().valor : comer("nombre").valor;
        const opcional = quitar("simbolo", "?");
        comer("simbolo", ":");
        props.push({ nombre: clave, tipo: parsearTipo(), opcional });
        if (!quitar("simbolo", ";") && !quitar("simbolo", ",")) break;
      }
      comer("simbolo", "}");
      return { clase: "objeto", props, nombre };
    }

    /* --------------------------- expresiones --------------------------- */

    function parsearExpresion() {
      const condicion = parsearOr();
      if (!es("simbolo", "?")) return condicion;
      const marca = avanzar();
      const siSi = parsearExpresion();
      comer("simbolo", ":");
      return { tipo: "ternario", condicion, siSi, siNo: parsearExpresion(), linea: marca.linea };
    }

    function binario(siguiente, operadores) {
      return function () {
        let izquierda = siguiente();
        while (es("simbolo") && operadores.includes(ver().valor)) {
          const operador = avanzar();
          izquierda = { tipo: "binario", operador: operador.valor, izquierda, derecha: siguiente(), linea: operador.linea };
        }
        return izquierda;
      };
    }

    const parsearUnario = () => {
      if (es("simbolo", "!") || es("simbolo", "-")) {
        const operador = avanzar();
        return { tipo: "unario", operador: operador.valor, valor: parsearUnario(), linea: operador.linea };
      }
      if (es("palabra", "typeof")) {
        const token = avanzar();
        return { tipo: "typeof", valor: parsearUnario(), linea: token.linea };
      }
      return parsearPostfijo();
    };
    const parsearMultiplicacion = binario(parsearUnario, ["*", "/", "%"]);
    const parsearSuma = binario(parsearMultiplicacion, ["+", "-"]);
    const parsearComparacion = binario(parsearSuma, ["<", ">", "<=", ">="]);
    const parsearIgualdad = binario(parsearComparacion, ["===", "!=="]);
    const parsearAnd = binario(parsearIgualdad, ["&&"]);
    const parsearOr = binario(parsearAnd, ["||"]);

    function parsearPostfijo() {
      let nodo = parsearAtomo();
      for (;;) {
        if (es("simbolo", ".")) {
          const punto = avanzar();
          const nombre = comer("nombre").valor;
          nodo = { tipo: "miembro", objeto: nodo, nombre, linea: punto.linea };
          continue;
        }
        if (es("simbolo", "[")) {
          const corchete = avanzar();
          const indice = parsearExpresion();
          comer("simbolo", "]");
          nodo = { tipo: "indice", objeto: nodo, indice, linea: corchete.linea };
          continue;
        }
        if (es("simbolo", "(")) {
          const parentesis = avanzar();
          const args = [];
          while (!es("simbolo", ")")) {
            args.push(parsearExpresion());
            if (!quitar("simbolo", ",")) break;
          }
          comer("simbolo", ")");
          nodo = { tipo: "llamada", destino: nodo, args, linea: parentesis.linea };
          continue;
        }
        return nodo;
      }
    }

    /* ¿Los paréntesis abren una función flecha o una expresión agrupada? */
    function pareceFlecha() {
      let profundidad = 0;
      for (let i = pos; i < tokens.length; i += 1) {
        const token = tokens[i];
        if (token.tipo !== "simbolo") continue;
        if (token.valor === "(") profundidad += 1;
        else if (token.valor === ")") {
          profundidad -= 1;
          if (profundidad === 0) {
            const siguiente = tokens[i + 1];
            if (siguiente && siguiente.tipo === "simbolo" && siguiente.valor === "=>") return true;
            if (siguiente && siguiente.tipo === "simbolo" && siguiente.valor === ":") {
              for (let j = i + 2; j < tokens.length; j += 1) {
                const t = tokens[j];
                if (t.tipo === "simbolo" && t.valor === "=>") return true;
                if (t.tipo === "simbolo" && [";", ",", ")", "}"].includes(t.valor)) return false;
              }
            }
            return false;
          }
        }
      }
      return false;
    }

    function parsearFlecha() {
      const inicio = comer("simbolo", "(");
      const params = [];
      while (!es("simbolo", ")")) {
        const nombre = comer("nombre").valor;
        const opcional = quitar("simbolo", "?");
        const tipo = quitar("simbolo", ":") ? parsearTipo() : null;
        params.push({ nombre, tipo, opcional });
        if (!quitar("simbolo", ",")) break;
      }
      comer("simbolo", ")");
      const resultado = quitar("simbolo", ":") ? parsearTipo() : null;
      comer("simbolo", "=>");
      if (es("simbolo", "{")) {
        return { tipo: "flecha", params, resultado, cuerpo: parsearBloque(), esBloque: true, linea: inicio.linea };
      }
      return { tipo: "flecha", params, resultado, cuerpo: parsearExpresion(), esBloque: false, linea: inicio.linea };
    }

    function parsearAtomo() {
      const token = ver();
      if (token.tipo === "numero") { avanzar(); return { tipo: "numero", valor: token.valor, linea: token.linea }; }
      if (token.tipo === "texto") { avanzar(); return { tipo: "texto", valor: token.valor, linea: token.linea }; }
      if (token.tipo === "plantilla") {
        avanzar();
        const partes = token.partes.map((parte) => (parte.tipo === "texto"
          ? { tipo: "texto", valor: parte.valor }
          : { tipo: "incrustado", nodo: analizarExpresionSuelta(parte.fuente, parte.linea) }));
        return { tipo: "plantilla", partes, linea: token.linea };
      }
      if (token.tipo === "palabra") {
        if (token.valor === "true" || token.valor === "false") {
          avanzar();
          return { tipo: "booleano", valor: token.valor === "true", linea: token.linea };
        }
        if (token.valor === "null") { avanzar(); return { tipo: "nulo", linea: token.linea }; }
        if (token.valor === "undefined") { avanzar(); return { tipo: "indefinido", linea: token.linea }; }
        fallar("La palabra “" + token.valor + "” no puede ir aquí.", token.linea);
      }
      if (token.tipo === "nombre") { avanzar(); return { tipo: "nombre", valor: token.valor, linea: token.linea }; }
      if (es("simbolo", "[")) {
        avanzar();
        const elementos = [];
        while (!es("simbolo", "]")) {
          elementos.push(parsearExpresion());
          if (!quitar("simbolo", ",")) break;
        }
        comer("simbolo", "]");
        return { tipo: "arreglo", elementos, linea: token.linea };
      }
      if (es("simbolo", "{")) {
        avanzar();
        const props = [];
        while (!es("simbolo", "}")) {
          const clave = ver().tipo === "texto" ? avanzar().valor : comer("nombre").valor;
          comer("simbolo", ":");
          props.push({ nombre: clave, valor: parsearExpresion() });
          if (!quitar("simbolo", ",")) break;
        }
        comer("simbolo", "}");
        return { tipo: "objeto", props, linea: token.linea };
      }
      if (es("simbolo", "(")) {
        if (pareceFlecha()) return parsearFlecha();
        avanzar();
        const dentro = parsearExpresion();
        comer("simbolo", ")");
        return { tipo: "grupo", valor: dentro, linea: token.linea };
      }
      fallar("No entiendo esta parte del código: “" + (token.valor || "el final") + "”.", token.linea);
      return null;
    }

    /* --------------------------- sentencias --------------------------- */

    function parsearBloque() {
      comer("simbolo", "{");
      const cuerpo = [];
      while (!es("simbolo", "}") && !es("fin")) cuerpo.push(parsearSentencia());
      comer("simbolo", "}");
      return cuerpo;
    }

    function parsearSentencia() {
      puntoYComa();
      const token = ver();

      if (token.tipo === "palabra" && token.valor === "type") {
        avanzar();
        const nombre = comer("nombre").valor;
        comer("simbolo", "=");
        const definicion = es("simbolo", "{") ? parsearTipoObjeto(nombre) : parsearTipo();
        puntoYComa();
        return { tipo: "alias", nombre, definicion, linea: token.linea };
      }

      if (token.tipo === "palabra" && token.valor === "interface") {
        avanzar();
        const nombre = comer("nombre").valor;
        const definicion = parsearTipoObjeto(nombre);
        puntoYComa();
        return { tipo: "alias", nombre, definicion, linea: token.linea };
      }

      if (token.tipo === "palabra" && (token.valor === "let" || token.valor === "const")) {
        avanzar();
        const nombre = comer("nombre").valor;
        const anotacion = quitar("simbolo", ":") ? parsearTipo() : null;
        const valor = quitar("simbolo", "=") ? parsearExpresion() : null;
        puntoYComa();
        return { tipo: "declaracion", constante: token.valor === "const", nombre, anotacion, valor, linea: token.linea };
      }

      if (token.tipo === "palabra" && token.valor === "function") {
        avanzar();
        const nombre = comer("nombre").valor;
        const genericos = [];
        if (quitar("simbolo", "<")) {
          do { genericos.push(comer("nombre").valor); } while (quitar("simbolo", ","));
          comer("simbolo", ">");
        }
        comer("simbolo", "(");
        const params = [];
        while (!es("simbolo", ")")) {
          const pNombre = comer("nombre").valor;
          const opcional = quitar("simbolo", "?");
          const pTipo = quitar("simbolo", ":") ? parsearTipo() : null;
          params.push({ nombre: pNombre, tipo: pTipo, opcional, linea: token.linea });
          if (!quitar("simbolo", ",")) break;
        }
        comer("simbolo", ")");
        const resultado = quitar("simbolo", ":") ? parsearTipo() : null;
        const cuerpo = parsearBloque();
        return { tipo: "funcion", nombre, genericos, params, resultado, cuerpo, linea: token.linea };
      }

      if (token.tipo === "palabra" && token.valor === "return") {
        avanzar();
        const valor = es("simbolo", ";") || es("simbolo", "}") ? null : parsearExpresion();
        puntoYComa();
        return { tipo: "retorno", valor, linea: token.linea };
      }

      if (token.tipo === "palabra" && token.valor === "if") {
        avanzar();
        comer("simbolo", "(");
        const condicion = parsearExpresion();
        comer("simbolo", ")");
        const entonces = parsearBloque();
        let sino = null;
        if (quitar("palabra", "else")) sino = es("palabra", "if") ? [parsearSentencia()] : parsearBloque();
        return { tipo: "si", condicion, entonces, sino, linea: token.linea };
      }

      if (token.tipo === "palabra" && token.valor === "for") {
        avanzar();
        comer("simbolo", "(");
        const declaracion = ver().valor;
        if (declaracion !== "const" && declaracion !== "let") {
          fallar("Este laboratorio solo admite el ciclo for ... of.", token.linea);
        }
        avanzar();
        const nombre = comer("nombre").valor;
        comer("palabra", "of");
        const lista = parsearExpresion();
        comer("simbolo", ")");
        const cuerpo = parsearBloque();
        return { tipo: "paraCada", nombre, lista, cuerpo, linea: token.linea };
      }

      if (token.tipo === "palabra" && token.valor === "while") {
        avanzar();
        comer("simbolo", "(");
        const condicion = parsearExpresion();
        comer("simbolo", ")");
        return { tipo: "mientras", condicion, cuerpo: parsearBloque(), linea: token.linea };
      }

      const expresion = parsearExpresion();
      if (quitar("simbolo", "=")) {
        const valor = parsearExpresion();
        puntoYComa();
        return { tipo: "asignacion", destino: expresion, valor, linea: token.linea };
      }
      puntoYComa();
      return { tipo: "expresion", valor: expresion, linea: token.linea };
    }

    const cuerpo = [];
    while (!es("fin")) {
      const antes = pos;
      cuerpo.push(parsearSentencia());
      if (pos === antes) fallar("No pude avanzar leyendo el programa.", ver().linea);
    }
    return cuerpo;
  }

  function analizarExpresionSuelta(fuente, linea) {
    try {
      const sentencias = analizar(fuente);
      if (sentencias.length === 1 && sentencias[0].tipo === "expresion") return sentencias[0].valor;
    } catch {
      /* Una plantilla con algo que no entiendo no debe romper el análisis. */
    }
    return { tipo: "desconocido", linea };
  }

  /* ========================== Verificador ========================== */

  function verificar(programa) {
    const errores = [];
    const alias = new Map();

    const avisar = (linea, mensaje) => {
      if (errores.length < 12 && !errores.some((e) => e.linea === linea && e.mensaje === mensaje)) {
        errores.push({ linea, mensaje });
      }
    };

    function resolver(tipo, genericos) {
      if (!tipo) return DESCONOCIDO;
      if (tipo.clase === "referencia") {
        if (genericos && genericos.includes(tipo.nombre)) return { clase: "generico", nombre: tipo.nombre };
        if (alias.has(tipo.nombre)) return alias.get(tipo.nombre);
        avisar(tipo.linea, "El tipo “" + tipo.nombre + "” no está definido. Créalo con type o interface antes de usarlo.");
        return DESCONOCIDO;
      }
      if (tipo.clase === "arreglo") return arregloDe(resolver(tipo.elemento, genericos));
      if (tipo.clase === "union") return unir(tipo.miembros.map((m) => resolver(m, genericos)));
      if (tipo.clase === "objeto") {
        return { clase: "objeto", nombre: tipo.nombre, props: tipo.props.map((p) => ({ ...p, tipo: resolver(p.tipo, genericos) })) };
      }
      return tipo;
    }

    class Alcance {
      constructor(padre) { this.padre = padre; this.vars = new Map(); }
      declarar(nombre, tipo, constante) { this.vars.set(nombre, { tipo, constante }); }
      buscar(nombre) {
        let actual = this;
        while (actual) {
          if (actual.vars.has(nombre)) return actual.vars.get(nombre);
          actual = actual.padre;
        }
        return null;
      }
    }

    const global = new Alcance(null);
    global.declarar("console", { clase: "objeto", nombre: "Console", props: [
      { nombre: "log", tipo: { clase: "funcion", params: [], resultado: VOID, variadica: true }, opcional: false }
    ] }, true);
    global.declarar("Math", { clase: "objeto", nombre: "Math", props: [
      { nombre: "round", tipo: funcion([par("n", NUMBER)], NUMBER), opcional: false },
      { nombre: "floor", tipo: funcion([par("n", NUMBER)], NUMBER), opcional: false },
      { nombre: "ceil", tipo: funcion([par("n", NUMBER)], NUMBER), opcional: false },
      { nombre: "abs", tipo: funcion([par("n", NUMBER)], NUMBER), opcional: false },
      { nombre: "max", tipo: { clase: "funcion", params: [], resultado: NUMBER, variadica: true }, opcional: false },
      { nombre: "min", tipo: { clase: "funcion", params: [], resultado: NUMBER, variadica: true }, opcional: false }
    ] }, true);
    global.declarar("Number", funcion([par("valor", DESCONOCIDO)], NUMBER), true);
    global.declarar("String", funcion([par("valor", DESCONOCIDO)], STRING), true);
    global.declarar("Boolean", funcion([par("valor", DESCONOCIDO)], BOOLEAN), true);

    /* Estrechamiento. Se aplica a un nombre (valor) o a una ruta de propiedades
       (curso.profesor), que es el caso normal al trabajar con opcionales. La
       ruta se guarda en el alcance con su nombre completo como clave, y la
       inferencia de un miembro la consulta antes de calcular nada. */
    function rutaDe(nodo) {
      if (!nodo) return null;
      if (nodo.tipo === "nombre") return nodo.valor;
      if (nodo.tipo === "miembro") {
        const base = rutaDe(nodo.objeto);
        return base ? base + "." + nodo.nombre : null;
      }
      return null;
    }

    /* Tipo actual sin informar errores: sirve para decidir el estrechamiento. */
    function tipoActual(nodo, alcance) {
      const ruta = rutaDe(nodo);
      if (ruta) {
        const guardado = alcance.buscar(ruta);
        if (guardado) return guardado.tipo;
      }
      if (!nodo) return null;
      if (nodo.tipo === "nombre") return null;
      if (nodo.tipo === "miembro") {
        const objeto = tipoActual(nodo.objeto, alcance);
        if (!objeto) return null;
        const miembro = miembroDe(objeto, nodo.nombre);
        return miembro === null ? null : miembro;
      }
      return null;
    }

    function filtrarUnion(tipo, acepta, afirma) {
      if (!tipo || tipo.clase !== "union") return null;
      const miembros = tipo.miembros.filter((m) => (afirma ? acepta(m) : !acepta(m)));
      return miembros.length ? unir(miembros) : null;
    }

    function estrechar(condicion, alcance, positivo) {
      const hijo = new Alcance(alcance);
      if (!condicion) return hijo;
      if (condicion.tipo === "grupo") return estrechar(condicion.valor, alcance, positivo);
      if (condicion.tipo === "unario" && condicion.operador === "!") {
        return estrechar(condicion.valor, alcance, !positivo);
      }
      if (condicion.tipo !== "binario") return hijo;
      const { operador, izquierda, derecha } = condicion;
      if (operador !== "===" && operador !== "!==") return hijo;
      const afirma = positivo === (operador === "===");

      /* typeof x === "number" */
      if (izquierda.tipo === "typeof" && derecha.tipo === "texto") {
        const ruta = rutaDe(izquierda.valor);
        const actual = tipoActual(izquierda.valor, alcance);
        if (!ruta || !actual) return hijo;
        const acepta = (m) => nombreTipo(m) === derecha.valor || (m.clase === "literal" && m.base === derecha.valor);
        const estrecho = filtrarUnion(actual, acepta, afirma);
        if (estrecho) hijo.declarar(ruta, estrecho, true);
        return hijo;
      }

      /* x === "inicial", x === 3, x === undefined, x === null */
      const ruta = rutaDe(izquierda);
      const actual = tipoActual(izquierda, alcance);
      if (!ruta || !actual) return hijo;
      let acepta = null;
      if (derecha.tipo === "texto" || derecha.tipo === "numero" || derecha.tipo === "booleano") {
        acepta = (m) => m.clase === "literal" && m.valor === derecha.valor;
      } else if (derecha.tipo === "indefinido") {
        acepta = (m) => m.clase === "primitivo" && m.nombre === "undefined";
      } else if (derecha.tipo === "nulo") {
        acepta = (m) => m.clase === "primitivo" && m.nombre === "null";
      }
      if (!acepta) return hijo;
      const estrecho = filtrarUnion(actual, acepta, afirma);
      if (estrecho) hijo.declarar(ruta, estrecho, true);
      return hijo;
    }

    /* El cuarto argumento es el tipo esperado en este lugar. TypeScript lo usa
       para no ensanchar los literales cuando hay un destino declarado: sin él,
       { nivel: "inicial" } pasaría a ser { nivel: string } y dejaría de encajar
       en una unión de literales. Sin destino, se ensancha como siempre. */
    function inferir(nodo, alcance, contexto, esperado) {
      if (!nodo) return DESCONOCIDO;
      switch (nodo.tipo) {
        case "numero": return literal(nodo.valor, "number");
        case "texto": return literal(nodo.valor, "string");
        case "booleano": return literal(nodo.valor, "boolean");
        case "nulo": return NULO;
        case "indefinido": return INDEFINIDO;
        case "plantilla":
          for (const parte of nodo.partes) if (parte.tipo === "incrustado") inferir(parte.nodo, alcance, contexto);
          return STRING;
        case "grupo": return inferir(nodo.valor, alcance, contexto);
        case "typeof": inferir(nodo.valor, alcance, contexto); return STRING;
        case "desconocido": return DESCONOCIDO;

        case "nombre": {
          const slot = alcance.buscar(nodo.valor);
          if (!slot) {
            avisar(nodo.linea, "El nombre “" + nodo.valor + "” no existe. Revisa si lo declaraste antes.");
            return DESCONOCIDO;
          }
          return slot.tipo;
        }

        case "unario": {
          const dentro = inferir(nodo.valor, alcance, contexto);
          if (nodo.operador === "!") return BOOLEAN;
          if (!esDesconocido(dentro) && !asignable(dentro, NUMBER)) {
            avisar(nodo.linea, "El operador - necesita un número y recibió “" + nombreTipo(dentro) + "”.");
          }
          return NUMBER;
        }

        case "arreglo": {
          if (nodo.elementos.length === 0) return { ...arregloDe(DESCONOCIDO), vacio: true };
          const dentro = esperado && esperado.clase === "arreglo" ? esperado.elemento : null;
          const tipos = nodo.elementos.map((e) => {
            const tipo = inferir(e, alcance, contexto, dentro);
            return dentro ? tipo : ampliar(tipo);
          });
          return arregloDe(unir(tipos));
        }

        case "objeto": {
          const forma = esperado && esperado.clase === "objeto" ? esperado : null;
          const props = nodo.props.map((p) => {
            const esperadaProp = forma ? forma.props.find((otra) => otra.nombre === p.nombre) : null;
            const tipo = inferir(p.valor, alcance, contexto, esperadaProp ? esperadaProp.tipo : undefined);
            return { nombre: p.nombre, tipo: esperadaProp ? tipo : ampliar(tipo), opcional: false };
          });
          return { clase: "objeto", props, fresco: true };
        }

        case "miembro": {
          const rutaMiembro = rutaDe(nodo);
          const guardado = rutaMiembro ? alcance.buscar(rutaMiembro) : null;
          if (guardado) {
            inferir(nodo.objeto, alcance, contexto);
            return guardado.tipo;
          }
          const objeto = inferir(nodo.objeto, alcance, contexto);
          if (esDesconocido(objeto)) return DESCONOCIDO;
          const miembro = miembroDe(objeto, nodo.nombre);
          if (miembro === null) {
            const puedeFaltar = objeto.clase === "union" && objeto.miembros.some((m) =>
              m.clase === "primitivo" && (m.nombre === "undefined" || m.nombre === "null"));
            if (puedeFaltar) {
              avisar(nodo.linea, "“" + (rutaDe(nodo.objeto) || "este valor") + "” puede ser "
                + nombreTipo(unir(objeto.miembros.filter((m) => m.clase === "primitivo"
                  && (m.nombre === "undefined" || m.nombre === "null"))))
                + ", así que no puedes usar “" + nodo.nombre + "” sin comprobarlo antes.");
            } else {
              avisar(nodo.linea, "El tipo “" + nombreTipo(objeto) + "” no tiene la propiedad “" + nodo.nombre + "”.");
            }
            return DESCONOCIDO;
          }
          return miembro;
        }

        case "indice": {
          const objeto = inferir(nodo.objeto, alcance, contexto);
          inferir(nodo.indice, alcance, contexto);
          if (objeto.clase === "arreglo") return objeto.elemento;
          if (objeto.clase === "primitivo" && objeto.nombre === "string") return STRING;
          return DESCONOCIDO;
        }

        case "flecha": {
          const hijo = new Alcance(alcance);
          for (const p of nodo.params) {
            const tipoParam = resolver(p.tipo, contexto.genericos);
            hijo.declarar(p.nombre, p.opcional ? unir([tipoParam, INDEFINIDO]) : tipoParam, false);
          }
          const declarado = nodo.resultado ? resolver(nodo.resultado, contexto.genericos) : null;
          let resultado;
          if (nodo.esBloque) {
            const interno = { ...contexto, retorno: declarado, retornos: [] };
            revisarCuerpo(nodo.cuerpo, hijo, interno);
            resultado = declarado || (interno.retornos.length ? unir(interno.retornos) : VOID);
          } else {
            const inferido = ampliar(inferir(nodo.cuerpo, hijo, contexto));
            if (declarado && !asignable(inferido, declarado)) {
              avisar(nodo.linea, "La función declara que devuelve “" + nombreTipo(declarado)
                + "” pero devuelve “" + nombreTipo(inferido) + "”.");
            }
            resultado = declarado || inferido;
          }
          return {
            clase: "funcion",
            params: nodo.params.map((p) => par(p.nombre, resolver(p.tipo, contexto.genericos))),
            resultado,
            sinAnotar: nodo.params.some((p) => !p.tipo)
          };
        }

        case "binario": {
          const izquierda = inferir(nodo.izquierda, alcance, contexto);
          const derecha = inferir(nodo.derecha, alcance, contexto);
          if (["===", "!==", "<", ">", "<=", ">="].includes(nodo.operador)) return BOOLEAN;
          if (nodo.operador === "&&" || nodo.operador === "||") return unir([izquierda, derecha]);
          if (nodo.operador === "+") {
            const textoIzq = asignable(izquierda, STRING) && !esDesconocido(izquierda);
            const textoDer = asignable(derecha, STRING) && !esDesconocido(derecha);
            if (textoIzq || textoDer) return STRING;
            if (!esDesconocido(izquierda) && !esDesconocido(derecha)
              && (!asignable(izquierda, NUMBER) || !asignable(derecha, NUMBER))) {
              avisar(nodo.linea, "No se puede usar + entre “" + nombreTipo(izquierda) + "” y “" + nombreTipo(derecha) + "”.");
            }
            return NUMBER;
          }
          for (const [tipo, nodoHijo] of [[izquierda, nodo.izquierda], [derecha, nodo.derecha]]) {
            if (!esDesconocido(tipo) && !asignable(tipo, NUMBER)) {
              avisar(nodoHijo.linea || nodo.linea,
                "El operador " + nodo.operador + " necesita números y recibió “" + nombreTipo(tipo) + "”.");
            }
          }
          return NUMBER;
        }

        case "ternario": {
          inferir(nodo.condicion, alcance, contexto);
          const siSi = inferir(nodo.siSi, estrechar(nodo.condicion, alcance, true), contexto);
          const siNo = inferir(nodo.siNo, estrechar(nodo.condicion, alcance, false), contexto);
          return unir([ampliar(siSi), ampliar(siNo)]);
        }

        case "llamada": return inferirLlamada(nodo, alcance, contexto);
        default: return DESCONOCIDO;
      }
    }

    /* Un literal usado como valor se ensancha a su primitivo, igual que en
       TypeScript: let n = 3 es number, no 3. */
    function perderFrescura(tipo) {
      if (!tipo) return DESCONOCIDO;
      if (tipo.clase === "objeto" && tipo.fresco) {
        const copia = { ...tipo, props: tipo.props.map((p) => ({ ...p, tipo: perderFrescura(p.tipo) })) };
        delete copia.fresco;
        return copia;
      }
      if (tipo.clase === "arreglo") return arregloDe(perderFrescura(tipo.elemento));
      if (tipo.clase === "union") return unir(tipo.miembros.map(perderFrescura));
      return tipo;
    }

    function ampliar(tipo) {
      if (!tipo) return DESCONOCIDO;
      if (tipo.clase === "literal") return primitivo(tipo.base);
      if (tipo.clase === "union") return unir(tipo.miembros.map(ampliar));
      if (tipo.clase === "objeto" && tipo.fresco) {
        return { ...tipo, props: tipo.props.map((p) => ({ ...p, tipo: ampliar(p.tipo) })) };
      }
      return tipo;
    }

    function inferirLlamada(nodo, alcance, contexto) {
      const destino = inferir(nodo.destino, alcance, contexto);

      /* map, filter, find y forEach reciben una función cuyo parámetro es el
         elemento del arreglo; sin eso, el cuerpo de la flecha no se puede tipar. */
      if (destino.clase === "funcion" && (destino.mapea || destino.filtra)) {
        const arreglo = destino.mapea || destino.filtra;
        const flecha = nodo.args[0];
        let tipoElemento = DESCONOCIDO;
        if (flecha && flecha.tipo === "flecha") {
          const hijo = new Alcance(alcance);
          const primero = flecha.params[0];
          if (primero) {
            const anotado = primero.tipo ? resolver(primero.tipo, contexto.genericos) : arreglo.elemento;
            if (primero.tipo && !asignable(arreglo.elemento, anotado)) {
              avisar(flecha.linea, "El elemento del arreglo es “" + nombreTipo(arreglo.elemento)
                + "” y el parámetro se anotó como “" + nombreTipo(anotado) + "”.");
            }
            hijo.declarar(primero.nombre, arreglo.elemento, false);
          }
          if (flecha.params[1]) hijo.declarar(flecha.params[1].nombre, NUMBER, false);
          if (flecha.esBloque) {
            const interno = { ...contexto, retorno: null, retornos: [] };
            revisarCuerpo(flecha.cuerpo, hijo, interno);
            tipoElemento = interno.retornos.length ? unir(interno.retornos) : VOID;
          } else {
            tipoElemento = ampliar(inferir(flecha.cuerpo, hijo, contexto));
          }
        } else if (flecha) {
          inferir(flecha, alcance, contexto);
        }
        if (destino.mapea) return arregloDe(tipoElemento);
        return destino.resultado;
      }

      const params = destino.clase === "funcion" && !destino.variadica ? destino.params : [];
      const args = nodo.args.map((arg, indice) => {
        const parametro = params[indice];
        const esperadoAqui = parametro && parametro.tipo && parametro.tipo.clase !== "generico"
          ? parametro.tipo : undefined;
        return inferir(arg, alcance, contexto, esperadoAqui);
      });

      if (destino.clase !== "funcion") {
        if (!esDesconocido(destino)) {
          avisar(nodo.linea, "El valor de tipo “" + nombreTipo(destino) + "” no se puede llamar como función.");
        }
        return DESCONOCIDO;
      }
      if (destino.variadica) return destino.resultado;

      const obligatorios = destino.params.filter((p) => !p.opcional).length;
      if (args.length < obligatorios || args.length > destino.params.length) {
        avisar(nodo.linea, "La función espera " + (obligatorios === destino.params.length
          ? obligatorios + " argumento(s)" : "entre " + obligatorios + " y " + destino.params.length + " argumentos")
          + " y recibió " + args.length + ".");
        return destino.resultado;
      }

      /* Genéricos de un parámetro: se deduce T del primer argumento que lo use. */
      const deducciones = new Map();
      destino.params.forEach((parametro, indice) => {
        deducir(parametro.tipo, args[indice], deducciones);
      });
      const aplicar = (tipo) => sustituir(tipo, deducciones);

      destino.params.forEach((parametro, indice) => {
        const esperado = aplicar(parametro.tipo);
        const recibido = args[indice];
        if (recibido === undefined) return;
        if (asignable(recibido, esperado)) return;
        const sobrante = propiedadSobrante(recibido, esperado);
        if (sobrante) {
          avisar(nodo.args[indice].linea || nodo.linea,
            "El objeto tiene la propiedad “" + sobrante + "”, que no existe en el tipo “" + nombreTipo(esperado) + "”.");
          return;
        }
        const faltante = propiedadFaltante(recibido, esperado);
        if (faltante) {
          avisar(nodo.args[indice].linea || nodo.linea,
            "Falta la propiedad “" + faltante + "”, que el tipo “" + nombreTipo(esperado) + "” exige.");
          return;
        }
        avisar(nodo.args[indice].linea || nodo.linea,
          "El argumento de tipo “" + nombreTipo(recibido) + "” no se puede asignar al parámetro de tipo “"
          + nombreTipo(esperado) + "”.");
      });

      return aplicar(destino.resultado);
    }

    function deducir(parametro, argumento, deducciones) {
      if (!parametro || !argumento) return;
      if (parametro.clase === "generico") {
        if (!deducciones.has(parametro.nombre)) deducciones.set(parametro.nombre, ampliar(argumento));
        return;
      }
      if (parametro.clase === "arreglo" && argumento.clase === "arreglo") {
        deducir(parametro.elemento, argumento.elemento, deducciones);
      }
    }

    function sustituir(tipo, deducciones) {
      if (!tipo || deducciones.size === 0) return tipo || DESCONOCIDO;
      if (tipo.clase === "generico") return deducciones.get(tipo.nombre) || DESCONOCIDO;
      if (tipo.clase === "arreglo") return arregloDe(sustituir(tipo.elemento, deducciones));
      if (tipo.clase === "union") return unir(tipo.miembros.map((m) => sustituir(m, deducciones)));
      return tipo;
    }

    function revisarCuerpo(sentencias, alcance, contexto) {
      /* Las funciones se declaran antes de recorrer el cuerpo para que puedan
         usarse antes de su definición, igual que en JavaScript. */
      for (const sentencia of sentencias) {
        if (sentencia.tipo === "alias") alias.set(sentencia.nombre, resolver(sentencia.definicion, null));
      }
      for (const sentencia of sentencias) {
        if (sentencia.tipo !== "funcion") continue;
        alcance.declarar(sentencia.nombre, {
          clase: "funcion",
          genericos: sentencia.genericos,
          params: sentencia.params.map((p) => ({
            nombre: p.nombre,
            tipo: resolver(p.tipo, sentencia.genericos),
            opcional: p.opcional
          })),
          resultado: sentencia.resultado ? resolver(sentencia.resultado, sentencia.genericos) : DESCONOCIDO
        }, true);
      }
      let actual = alcance;
      for (const sentencia of sentencias) {
        revisar(sentencia, actual, contexto);
        if (sentencia.tipo === "si" && !sentencia.sino && terminaEnRetorno(sentencia.entonces)) {
          actual = estrechar(sentencia.condicion, actual, false);
        }
      }
    }

    /* Un bloque "termina en retorno" si su última sentencia es un return, o un
       if con else donde ambas ramas lo hacen. Es una regla conservadora: si no
       lo reconoce, simplemente no estrecha y no informa nada de más. */
    function terminaEnRetorno(sentencias) {
      if (!sentencias || sentencias.length === 0) return false;
      const ultima = sentencias[sentencias.length - 1];
      if (ultima.tipo === "retorno") return true;
      if (ultima.tipo === "si" && ultima.sino) {
        return terminaEnRetorno(ultima.entonces) && terminaEnRetorno(ultima.sino);
      }
      return false;
    }

    function revisar(sentencia, alcance, contexto) {
      switch (sentencia.tipo) {
        case "alias": return;

        case "declaracion": {
          const anotado = sentencia.anotacion ? resolver(sentencia.anotacion, contexto.genericos) : null;
          if (!sentencia.valor) {
            alcance.declarar(sentencia.nombre, anotado || DESCONOCIDO, sentencia.constante);
            return;
          }
          const inferido = inferir(sentencia.valor, alcance, contexto, anotado || undefined);
          if (anotado) {
            if (!asignable(inferido, anotado)) {
              const sobrante = propiedadSobrante(inferido, anotado);
              const faltante = propiedadFaltante(inferido, anotado);
              if (sobrante) {
                avisar(sentencia.valor.linea || sentencia.linea,
                  "El objeto tiene la propiedad “" + sobrante + "”, que no existe en el tipo “" + nombreTipo(anotado) + "”.");
              } else if (faltante) {
                avisar(sentencia.valor.linea || sentencia.linea,
                  "Falta la propiedad “" + faltante + "”, que el tipo “" + nombreTipo(anotado) + "” exige.");
              } else {
                avisar(sentencia.valor.linea || sentencia.linea,
                  "El tipo “" + nombreTipo(inferido) + "” no se puede asignar al tipo “" + nombreTipo(anotado) + "”.");
              }
            }
            alcance.declarar(sentencia.nombre, anotado, sentencia.constante);
            return;
          }
          alcance.declarar(sentencia.nombre, perderFrescura(sentencia.constante ? inferido : ampliar(inferido)), sentencia.constante);
          return;
        }

        case "funcion": {
          const hijo = new Alcance(alcance);
          for (const p of sentencia.params) {
            const tipo = resolver(p.tipo, sentencia.genericos);
            hijo.declarar(p.nombre, p.opcional ? unir([tipo, INDEFINIDO]) : tipo, false);
          }
          const declarado = sentencia.resultado ? resolver(sentencia.resultado, sentencia.genericos) : null;
          const interno = { genericos: sentencia.genericos, retorno: declarado, retornos: [] };
          revisarCuerpo(sentencia.cuerpo, hijo, interno);
          if (declarado && nombreTipo(declarado) !== "void" && interno.retornos.length === 0) {
            avisar(sentencia.linea, "La función “" + sentencia.nombre + "” declara que devuelve “"
              + nombreTipo(declarado) + "” pero no tiene ningún return.");
          }
          return;
        }

        case "retorno": {
          const valor = sentencia.valor ? inferir(sentencia.valor, alcance, contexto, contexto.retorno || undefined) : VOID;
          contexto.retornos?.push(ampliar(valor));
          if (contexto.retorno && !asignable(valor, contexto.retorno)) {
            avisar(sentencia.linea, "La función declara que devuelve “" + nombreTipo(contexto.retorno)
              + "” pero este return entrega “" + nombreTipo(valor) + "”.");
          }
          return;
        }

        case "asignacion": {
          const destino = inferir(sentencia.destino, alcance, contexto);
          const valor = inferir(sentencia.valor, alcance, contexto, destino);
          if (sentencia.destino.tipo === "nombre") {
            const slot = alcance.buscar(sentencia.destino.valor);
            if (slot && slot.constante) {
              avisar(sentencia.linea, "No se puede reasignar “" + sentencia.destino.valor + "” porque se declaró con const.");
              return;
            }
          }
          if (!asignable(valor, destino)) {
            avisar(sentencia.linea, "El tipo “" + nombreTipo(valor) + "” no se puede asignar al tipo “"
              + nombreTipo(destino) + "”.");
          }
          return;
        }

        case "si": {
          inferir(sentencia.condicion, alcance, contexto);
          revisarCuerpo(sentencia.entonces, estrechar(sentencia.condicion, alcance, true), contexto);
          if (sentencia.sino) revisarCuerpo(sentencia.sino, estrechar(sentencia.condicion, alcance, false), contexto);
          return;
        }

        case "paraCada": {
          const lista = inferir(sentencia.lista, alcance, contexto);
          const hijo = new Alcance(alcance);
          if (lista.clase === "arreglo") hijo.declarar(sentencia.nombre, lista.elemento, true);
          else if (lista.clase === "primitivo" && lista.nombre === "string") hijo.declarar(sentencia.nombre, STRING, true);
          else {
            if (!esDesconocido(lista)) {
              avisar(sentencia.linea, "No se puede recorrer un valor de tipo “" + nombreTipo(lista) + "” con for ... of.");
            }
            hijo.declarar(sentencia.nombre, DESCONOCIDO, true);
          }
          revisarCuerpo(sentencia.cuerpo, hijo, contexto);
          return;
        }

        case "mientras": {
          inferir(sentencia.condicion, alcance, contexto);
          revisarCuerpo(sentencia.cuerpo, new Alcance(alcance), contexto);
          return;
        }

        case "expresion":
          inferir(sentencia.valor, alcance, contexto);
          return;

        default:
          return;
      }
    }

    revisarCuerpo(programa, global, { genericos: null, retorno: null, retornos: [] });
    errores.sort((a, b) => a.linea - b.linea);
    return errores;
  }

  /* =========================== Emisión =========================== */

  function emitir(sentencias, sangria) {
    return sentencias.map((s) => emitirSentencia(s, sangria)).filter((linea) => linea !== null).join("\n");
  }

  function emitirSentencia(sentencia, sangria) {
    const espacio = "  ".repeat(sangria);
    switch (sentencia.tipo) {
      case "alias": return null;
      case "declaracion":
        return espacio + (sentencia.constante ? "const " : "let ") + sentencia.nombre
          + (sentencia.valor ? " = " + emitirExpresion(sentencia.valor) : "") + ";";
      case "funcion":
        return espacio + "function " + sentencia.nombre + "(" + sentencia.params.map((p) => p.nombre).join(", ") + ") {\n"
          + emitir(sentencia.cuerpo, sangria + 1) + "\n" + espacio + "}";
      case "retorno":
        return espacio + "return" + (sentencia.valor ? " " + emitirExpresion(sentencia.valor) : "") + ";";
      case "si": {
        let texto = espacio + "if (" + emitirExpresion(sentencia.condicion) + ") {\n"
          + emitir(sentencia.entonces, sangria + 1) + "\n" + espacio + "}";
        if (sentencia.sino) texto += " else {\n" + emitir(sentencia.sino, sangria + 1) + "\n" + espacio + "}";
        return texto;
      }
      case "paraCada":
        return espacio + "for (const " + sentencia.nombre + " of " + emitirExpresion(sentencia.lista) + ") {\n"
          + emitir(sentencia.cuerpo, sangria + 1) + "\n" + espacio + "}";
      case "mientras":
        return espacio + "while (" + emitirExpresion(sentencia.condicion) + ") {\n"
          + emitir(sentencia.cuerpo, sangria + 1) + "\n" + espacio + "}";
      case "asignacion":
        return espacio + emitirExpresion(sentencia.destino) + " = " + emitirExpresion(sentencia.valor) + ";";
      case "expresion":
        return espacio + emitirExpresion(sentencia.valor) + ";";
      default: return null;
    }
  }

  function emitirExpresion(nodo) {
    switch (nodo.tipo) {
      case "numero": return String(nodo.valor);
      case "texto": return JSON.stringify(nodo.valor);
      case "booleano": return String(nodo.valor);
      case "nulo": return "null";
      case "indefinido": return "undefined";
      case "nombre": return nodo.valor;
      case "grupo": return "(" + emitirExpresion(nodo.valor) + ")";
      case "typeof": return "typeof " + emitirExpresion(nodo.valor);
      case "unario": return nodo.operador + emitirExpresion(nodo.valor);
      case "binario": return "(" + emitirExpresion(nodo.izquierda) + " " + nodo.operador + " " + emitirExpresion(nodo.derecha) + ")";
      case "miembro": return emitirExpresion(nodo.objeto) + "." + nodo.nombre;
      case "indice": return emitirExpresion(nodo.objeto) + "[" + emitirExpresion(nodo.indice) + "]";
      case "ternario": return "(" + emitirExpresion(nodo.condicion) + " ? " + emitirExpresion(nodo.siSi)
        + " : " + emitirExpresion(nodo.siNo) + ")";
      case "llamada": return emitirExpresion(nodo.destino) + "(" + nodo.args.map(emitirExpresion).join(", ") + ")";
      case "arreglo": return "[" + nodo.elementos.map(emitirExpresion).join(", ") + "]";
      case "objeto": return "{ " + nodo.props.map((p) => p.nombre + ": " + emitirExpresion(p.valor)).join(", ") + " }";
      case "plantilla":
        return "`" + nodo.partes.map((parte) => (parte.tipo === "texto"
          ? parte.valor.replace(/[\\`$]/g, (c) => "\\" + c)
          : "${" + emitirExpresion(parte.nodo) + "}")).join("") + "`";
      case "flecha":
        return "(" + nodo.params.map((p) => p.nombre).join(", ") + ") => "
          + (nodo.esBloque ? "{\n" + emitir(nodo.cuerpo, 1) + "\n}" : emitirExpresion(nodo.cuerpo));
      default: return "undefined";
    }
  }

  /* ============================= run ============================= */

  function run(code) {
    if (typeof code !== "string") code = "";
    if (code.length > MAX_LARGO) {
      return { text: "⚠ El programa es demasiado largo para el laboratorio.", output: [], errores: [], error: "Programa demasiado largo." };
    }

    let programa;
    try {
      programa = analizar(code);
    } catch (error) {
      const mensaje = error.friendly ? error.message : "No pude leer el programa. Revisa la sintaxis.";
      return { text: "⚠ " + mensaje, output: [], errores: [], error: mensaje, javascript: "" };
    }

    const errores = verificar(programa);
    if (errores.length) {
      const lineas = errores.map((e) => "Línea " + e.linea + " · " + e.mensaje);
      return {
        text: "El compilador encontró " + (errores.length === 1 ? "un error de tipos" : errores.length + " errores de tipos") + ":\n\n"
          + lineas.map((linea) => "  ✗ " + linea).join("\n")
          + "\n\nTypeScript no genera el JavaScript mientras haya errores de tipos.",
        output: [],
        errores,
        error: null,
        javascript: ""
      };
    }

    const javascript = emitir(programa, 0);
    const resultado = globalThis.StarterRuntime.runJavaScript(javascript);
    const partes = ["✓ Sin errores de tipos. TypeScript compiló el programa."];
    if (resultado.error) {
      if (resultado.text) partes.push(resultado.text);
      partes.push("⚠ Al ejecutar: " + resultado.error);
    } else {
      partes.push(resultado.text || "El programa no mostró nada. Usa console.log(...) para ver un valor.");
    }
    return {
      text: partes.join("\n\n"),
      output: resultado.output.slice(),
      errores: [],
      error: resultado.error,
      javascript
    };
  }

  globalThis.TsLab = { run, analizar, verificar, emitir, nombreTipo };
})();
