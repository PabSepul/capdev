/*
  Motores educativos compartidos por las rutas de JavaScript y SQL.
  Se interpretan solamente los subconjuntos utilizados por los módulos:
  nunca se usa eval, Function ni ejecución directa del código del estudiante.
*/
(() => {
  "use strict";

  const MAX_STEPS = 120000;
  const MAX_OUTPUT_LINES = 120;

  function friendlyError(message) {
    const error = new Error(message);
    error.friendly = true;
    return error;
  }

  function describeError(error) {
    if (error && error.friendly) return error.message;
    return "No pude ejecutar el código. Revisa la sintaxis usada en el módulo.";
  }

  /* ===================== Tokenizador de JavaScript ===================== */

  const JS_KEYWORDS = new Set([
    "const", "let", "function", "return", "if", "else", "for", "of", "while",
    "true", "false", "null", "undefined", "break", "continue", "typeof"
  ]);

  const JS_PUNCTUATORS = [
    "===", "!==", "=>", "==", "!=", "<=", ">=", "&&", "||", "++", "--",
    "+=", "-=", "*=", "/=", "(", ")", "{", "}", "[", "]", ";", ",", ".", ":",
    "?", "+", "-", "*", "/", "%", "<", ">", "=", "!"
  ];

  const ESCAPES = { n: "\n", t: "\t", r: "\r", "\\": "\\", "'": "'", "\"": "\"", "`": "`" };

  function isDigit(character) { return character >= "0" && character <= "9"; }
  function isNameStart(character) { return /[A-Za-z_$]/.test(character); }
  function isNamePart(character) { return /[A-Za-z0-9_$]/.test(character); }

  function readTemplate(source, start) {
    const parts = [];
    let text = "";
    let index = start + 1;
    while (index < source.length) {
      const character = source[index];
      if (character === "\\") {
        text += ESCAPES[source[index + 1]] ?? source[index + 1] ?? "";
        index += 2;
        continue;
      }
      if (character === "`") {
        parts.push({ type: "text", value: text });
        return { parts, end: index + 1 };
      }
      if (character === "$" && source[index + 1] === "{") {
        parts.push({ type: "text", value: text });
        text = "";
        let depth = 1;
        let expression = "";
        index += 2;
        while (index < source.length) {
          const current = source[index];
          if (current === "{") depth += 1;
          if (current === "}") {
            depth -= 1;
            if (depth === 0) break;
          }
          expression += current;
          index += 1;
        }
        if (depth !== 0) throw friendlyError("Falta cerrar una expresión dentro del texto con acentos graves.");
        parts.push({ type: "expression", value: expression });
        index += 1;
        continue;
      }
      text += character;
      index += 1;
    }
    throw friendlyError("Falta cerrar el acento grave del texto.");
  }

  function tokenizeJs(source) {
    const tokens = [];
    let index = 0;
    while (index < source.length) {
      const character = source[index];
      if (character === " " || character === "\t" || character === "\r" || character === "\n") {
        index += 1;
        continue;
      }
      if (character === "/" && source[index + 1] === "/") {
        while (index < source.length && source[index] !== "\n") index += 1;
        continue;
      }
      if (character === "/" && source[index + 1] === "*") {
        index += 2;
        while (index < source.length && !(source[index] === "*" && source[index + 1] === "/")) index += 1;
        index += 2;
        continue;
      }
      if (isDigit(character) || (character === "." && isDigit(source[index + 1] || ""))) {
        let raw = "";
        while (index < source.length && (isDigit(source[index]) || source[index] === ".")) {
          raw += source[index];
          index += 1;
        }
        tokens.push({ type: "number", value: Number(raw) });
        continue;
      }
      if (character === "\"" || character === "'") {
        let value = "";
        index += 1;
        while (index < source.length && source[index] !== character) {
          if (source[index] === "\\") {
            value += ESCAPES[source[index + 1]] ?? source[index + 1] ?? "";
            index += 2;
            continue;
          }
          value += source[index];
          index += 1;
        }
        if (index >= source.length) throw friendlyError("Falta cerrar unas comillas.");
        index += 1;
        tokens.push({ type: "string", value });
        continue;
      }
      if (character === "`") {
        const template = readTemplate(source, index);
        tokens.push({ type: "template", parts: template.parts });
        index = template.end;
        continue;
      }
      if (isNameStart(character)) {
        let name = "";
        while (index < source.length && isNamePart(source[index])) {
          name += source[index];
          index += 1;
        }
        tokens.push({ type: JS_KEYWORDS.has(name) ? "keyword" : "name", value: name });
        continue;
      }
      const punctuator = JS_PUNCTUATORS.find((candidate) => source.startsWith(candidate, index));
      if (!punctuator) throw friendlyError("El código incluye un símbolo que todavía no reconozco.");
      tokens.push({ type: "punctuator", value: punctuator });
      index += punctuator.length;
    }
    tokens.push({ type: "end" });
    return tokens;
  }

  /* ======================= Analizador sintáctico ======================= */

  function parseJs(tokens) {
    let position = 0;

    const peek = (offset = 0) => tokens[position + offset] ?? { type: "end" };
    const at = (type, value) => {
      const token = peek();
      return token.type === type && (value === undefined || token.value === value);
    };
    const advance = () => tokens[position++];
    const eat = (type, value) => {
      if (!at(type, value)) return false;
      position += 1;
      return true;
    };
    const expect = (type, value) => {
      if (!eat(type, value)) throw friendlyError("Falta un símbolo para completar la instrucción: " + (value ?? type));
    };

    function parseProgram() {
      const body = [];
      while (!at("end")) body.push(parseStatement());
      return { type: "Program", body };
    }

    function parseBlock() {
      expect("punctuator", "{");
      const body = [];
      while (!at("punctuator", "}")) {
        if (at("end")) throw friendlyError("Falta cerrar una llave.");
        body.push(parseStatement());
      }
      expect("punctuator", "}");
      return { type: "Block", body };
    }

    function parseStatement() {
      if (at("punctuator", "{")) return parseBlock();
      if (at("keyword", "const") || at("keyword", "let")) return parseDeclaration();
      if (at("keyword", "function")) return parseFunctionDeclaration();
      if (at("keyword", "if")) return parseIf();
      if (at("keyword", "for")) return parseFor();
      if (at("keyword", "while")) return parseWhile();
      if (at("keyword", "return")) {
        advance();
        const argument = at("punctuator", ";") || at("punctuator", "}") ? null : parseExpression();
        eat("punctuator", ";");
        return { type: "Return", argument };
      }
      if (at("keyword", "break")) { advance(); eat("punctuator", ";"); return { type: "Break" }; }
      if (at("keyword", "continue")) { advance(); eat("punctuator", ";"); return { type: "Continue" }; }
      const expression = parseExpression();
      eat("punctuator", ";");
      return { type: "ExpressionStatement", expression };
    }

    /* Además del nombre simple, se admite desestructurar una lista o un objeto:
       const [valor, poner] = useState(0) y const { nombre, horas } = curso. Es el
       patrón habitual al trabajar con hooks y con objetos de datos. */
    function parseDeclaration(consumeSemicolon = true) {
      const kind = advance().value;
      const declarations = [];
      do {
        const target = parseDeclarationTarget();
        let value = null;
        if (eat("punctuator", "=")) value = parseAssignment();
        declarations.push({ ...target, value });
      } while (eat("punctuator", ","));
      if (consumeSemicolon) eat("punctuator", ";");
      return { type: "Declaration", kind, declarations };
    }

    function parseDeclarationTarget() {
      if (at("punctuator", "[")) {
        advance();
        const names = [];
        while (!at("punctuator", "]")) {
          if (at("punctuator", ",")) { advance(); names.push(null); continue; }
          if (!at("name")) throw friendlyError("Dentro de [ ] solo pueden ir nombres de variables.");
          names.push(advance().value);
          if (!eat("punctuator", ",")) break;
        }
        expect("punctuator", "]");
        if (names.length === 0) throw friendlyError("La lista de nombres entre [ ] está vacía.");
        return { pattern: "list", names };
      }
      if (at("punctuator", "{")) {
        advance();
        const entries = [];
        while (!at("punctuator", "}")) {
          if (!at("name")) throw friendlyError("Dentro de { } solo pueden ir nombres de propiedades.");
          const key = advance().value;
          let alias = key;
          if (eat("punctuator", ":")) {
            if (!at("name")) throw friendlyError("Después de : hace falta el nombre de la variable.");
            alias = advance().value;
          }
          entries.push({ key, alias });
          if (!eat("punctuator", ",")) break;
        }
        expect("punctuator", "}");
        if (entries.length === 0) throw friendlyError("La lista de propiedades entre { } está vacía.");
        return { pattern: "object", entries };
      }
      if (!at("name")) throw friendlyError("Falta el nombre de una variable.");
      return { pattern: "name", name: advance().value };
    }

    function parseParameters() {
      expect("punctuator", "(");
      const parameters = [];
      while (!at("punctuator", ")")) {
        if (!at("name")) throw friendlyError("Los parámetros deben ser nombres simples.");
        const name = advance().value;
        let fallback = null;
        if (eat("punctuator", "=")) fallback = parseAssignment();
        parameters.push({ name, fallback });
        if (!eat("punctuator", ",")) break;
      }
      expect("punctuator", ")");
      return parameters;
    }

    function parseFunctionDeclaration() {
      advance();
      if (!at("name")) throw friendlyError("La función necesita un nombre.");
      const name = advance().value;
      const parameters = parseParameters();
      const body = parseBlock();
      return { type: "FunctionDeclaration", name, parameters, body };
    }

    function parseIf() {
      advance();
      expect("punctuator", "(");
      const test = parseExpression();
      expect("punctuator", ")");
      const consequent = parseStatement();
      let alternate = null;
      if (eat("keyword", "else")) alternate = parseStatement();
      return { type: "If", test, consequent, alternate };
    }

    function parseWhile() {
      advance();
      expect("punctuator", "(");
      const test = parseExpression();
      expect("punctuator", ")");
      return { type: "While", test, body: parseStatement() };
    }

    function parseFor() {
      advance();
      expect("punctuator", "(");
      const isForOf = (peek().type === "keyword" && (peek().value === "const" || peek().value === "let"))
        && peek(1).type === "name"
        && peek(2).type === "keyword" && peek(2).value === "of";
      if (isForOf) {
        advance();
        const name = advance().value;
        advance();
        const iterable = parseExpression();
        expect("punctuator", ")");
        return { type: "ForOf", name, iterable, body: parseStatement() };
      }
      let init = null;
      if (!at("punctuator", ";")) {
        init = at("keyword", "const") || at("keyword", "let")
          ? parseDeclaration(false)
          : { type: "ExpressionStatement", expression: parseExpression() };
      }
      expect("punctuator", ";");
      const test = at("punctuator", ";") ? null : parseExpression();
      expect("punctuator", ";");
      const update = at("punctuator", ")") ? null : parseExpression();
      expect("punctuator", ")");
      return { type: "For", init, test, update, body: parseStatement() };
    }

    function parseExpression() { return parseAssignment(); }

    const ASSIGNMENTS = new Set(["=", "+=", "-=", "*=", "/="]);

    function parseAssignment() {
      const left = parseConditional();
      const token = peek();
      if (token.type === "punctuator" && ASSIGNMENTS.has(token.value)) {
        advance();
        const value = parseAssignment();
        return { type: "Assign", operator: token.value, target: left, value };
      }
      return left;
    }

    function parseConditional() {
      const test = parseBinary(0);
      if (!eat("punctuator", "?")) return test;
      const consequent = parseAssignment();
      expect("punctuator", ":");
      const alternate = parseAssignment();
      return { type: "Conditional", test, consequent, alternate };
    }

    const BINARY_LEVELS = [
      ["||"],
      ["&&"],
      ["===", "!==", "==", "!="],
      ["<", "<=", ">", ">="],
      ["+", "-"],
      ["*", "/", "%"]
    ];

    function parseBinary(level) {
      if (level >= BINARY_LEVELS.length) return parseUnary();
      let left = parseBinary(level + 1);
      for (;;) {
        const token = peek();
        if (token.type !== "punctuator" || !BINARY_LEVELS[level].includes(token.value)) return left;
        advance();
        const right = parseBinary(level + 1);
        const type = token.value === "&&" || token.value === "||" ? "Logical" : "Binary";
        left = { type, operator: token.value, left, right };
      }
    }

    function parseUnary() {
      if (at("keyword", "typeof")) {
        advance();
        return { type: "Unary", operator: "typeof", argument: parseUnary() };
      }
      if (at("punctuator", "!") || at("punctuator", "-") || at("punctuator", "+")) {
        const operator = advance().value;
        return { type: "Unary", operator, argument: parseUnary() };
      }
      if (at("punctuator", "++") || at("punctuator", "--")) {
        const operator = advance().value;
        return { type: "Update", operator, prefix: true, target: parseUnary() };
      }
      return parsePostfix();
    }

    function parsePostfix() {
      let node = parseCall();
      if (at("punctuator", "++") || at("punctuator", "--")) {
        const operator = advance().value;
        node = { type: "Update", operator, prefix: false, target: node };
      }
      return node;
    }

    function parseArguments() {
      expect("punctuator", "(");
      const args = [];
      while (!at("punctuator", ")")) {
        args.push(parseAssignment());
        if (!eat("punctuator", ",")) break;
      }
      expect("punctuator", ")");
      return args;
    }

    function parseCall() {
      let node = parsePrimary();
      for (;;) {
        if (eat("punctuator", ".")) {
          if (!at("name") && !at("keyword")) throw friendlyError("Falta el nombre de la propiedad después del punto.");
          node = { type: "Member", object: node, name: advance().value };
          continue;
        }
        if (eat("punctuator", "[")) {
          const property = parseExpression();
          expect("punctuator", "]");
          node = { type: "Index", object: node, property };
          continue;
        }
        if (at("punctuator", "(")) {
          node = { type: "Call", callee: node, args: parseArguments() };
          continue;
        }
        return node;
      }
    }

    function looksLikeArrow() {
      if (!at("punctuator", "(")) return false;
      let depth = 0;
      let index = position;
      while (index < tokens.length) {
        const token = tokens[index];
        if (token.type === "punctuator" && token.value === "(") depth += 1;
        if (token.type === "punctuator" && token.value === ")") {
          depth -= 1;
          if (depth === 0) {
            const following = tokens[index + 1];
            return Boolean(following && following.type === "punctuator" && following.value === "=>");
          }
        }
        index += 1;
      }
      return false;
    }

    function parseArrowBody(parameters) {
      expect("punctuator", "=>");
      if (at("punctuator", "{")) return { type: "Arrow", parameters, body: parseBlock(), expression: false };
      return { type: "Arrow", parameters, body: parseAssignment(), expression: true };
    }

    function parseObject() {
      expect("punctuator", "{");
      const properties = [];
      while (!at("punctuator", "}")) {
        let key;
        if (at("string")) key = advance().value;
        else if (at("name") || at("keyword")) key = advance().value;
        else throw friendlyError("Las propiedades de un objeto necesitan un nombre.");
        if (eat("punctuator", ":")) properties.push({ key, value: parseAssignment() });
        else properties.push({ key, value: { type: "Name", name: key } });
        if (!eat("punctuator", ",")) break;
      }
      expect("punctuator", "}");
      return { type: "ObjectLiteral", properties };
    }

    function parsePrimary() {
      if (at("number") || at("string")) return { type: "Literal", value: advance().value };
      if (at("template")) {
        const parts = advance().parts.map((part) => {
          if (part.type === "text") return { type: "text", value: part.value };
          const inner = parseJs(tokenizeJs(part.value)).body[0];
          return { type: "expression", node: inner && inner.expression ? inner.expression : { type: "Literal", value: "" } };
        });
        return { type: "Template", parts };
      }
      if (at("keyword", "true")) { advance(); return { type: "Literal", value: true }; }
      if (at("keyword", "false")) { advance(); return { type: "Literal", value: false }; }
      if (at("keyword", "null")) { advance(); return { type: "Literal", value: null }; }
      if (at("keyword", "undefined")) { advance(); return { type: "Literal", value: undefined }; }
      if (at("keyword", "function")) {
        advance();
        if (at("name")) advance();
        const parameters = parseParameters();
        return { type: "Arrow", parameters, body: parseBlock(), expression: false };
      }
      if (at("punctuator", "[")) {
        advance();
        const elements = [];
        while (!at("punctuator", "]")) {
          elements.push(parseAssignment());
          if (!eat("punctuator", ",")) break;
        }
        expect("punctuator", "]");
        return { type: "ArrayLiteral", elements };
      }
      if (at("punctuator", "{")) return parseObject();
      if (looksLikeArrow()) return parseArrowBody(parseParameters());
      if (at("punctuator", "(")) {
        advance();
        const expression = parseExpression();
        expect("punctuator", ")");
        return expression;
      }
      if (at("name")) {
        const name = advance().value;
        if (at("punctuator", "=>")) return parseArrowBody([{ name, fallback: null }]);
        return { type: "Name", name };
      }
      throw friendlyError("El código incluye una instrucción que todavía no puedo interpretar.");
    }

    return parseProgram();
  }

  /* ========================= Evaluador ========================= */

  function createScope(parent) {
    return { values: new Map(), parent };
  }

  function findScope(scope, name) {
    let current = scope;
    while (current) {
      if (current.values.has(name)) return current;
      current = current.parent;
    }
    return null;
  }

  function readVariable(scope, name) {
    const owner = findScope(scope, name);
    if (!owner) throw friendlyError("La variable " + name + " no existe todavía.");
    return owner.values.get(name).value;
  }

  function declareVariable(scope, name, value, constant) {
    scope.values.set(name, { value, constant });
  }

  function writeVariable(scope, name, value) {
    const owner = findScope(scope, name);
    if (!owner) throw friendlyError("La variable " + name + " no existe todavía.");
    const slot = owner.values.get(name);
    if (slot.constant) throw friendlyError("No puedes reasignar " + name + " porque se declaró con const.");
    slot.value = value;
    return value;
  }

  function formatValue(value, nested) {
    if (typeof value === "string") return nested ? "'" + value + "'" : value;
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    if (value === null) return "null";
    if (value === undefined) return "undefined";
    if (Array.isArray(value)) return "[" + value.map((item) => formatValue(item, true)).join(", ") + "]";
    if (typeof value === "function" || value.__starterFunction) return "[Function]";
    if (typeof value === "object") {
      const keys = Object.keys(value);
      if (keys.length === 0) return "{}";
      return "{ " + keys.map((key) => key + ": " + formatValue(value[key], true)).join(", ") + " }";
    }
    return String(value);
  }

  /* typeof responde lo mismo que JavaScript, incluido el histórico "object"
     para null y para los arreglos. */
  function describeType(value) {
    if (value === null) return "object";
    if (value === undefined) return "undefined";
    if (typeof value === "string") return "string";
    if (typeof value === "number") return "number";
    if (typeof value === "boolean") return "boolean";
    if (isCallable(value)) return "function";
    return "object";
  }

  function isCallable(value) {
    return typeof value === "function" || Boolean(value && value.__starterFunction);
  }

  function callValue(callee, args, context) {
    if (typeof callee === "function") return callee(...args);
    if (!callee || !callee.__starterFunction) throw friendlyError("Intentaste llamar algo que no es una función.");
    context.depth += 1;
    if (context.depth > 120) throw friendlyError("La función se llamó a sí misma demasiadas veces.");
    const scope = createScope(callee.scope);
    callee.parameters.forEach((parameter, index) => {
      let value = args[index];
      if (value === undefined && parameter.fallback) value = evaluate(parameter.fallback, scope, context);
      declareVariable(scope, parameter.name, value, false);
    });
    let result;
    if (callee.expression) {
      result = evaluate(callee.body, scope, context);
    } else {
      const signal = executeBody(callee.body.body, createScope(scope), context);
      result = signal && signal.signal === "return" ? signal.value : undefined;
    }
    context.depth -= 1;
    return result;
  }

  function arrayMember(target, name, context) {
    switch (name) {
      case "length": return target.length;
      case "push": return (...values) => target.push(...values);
      case "pop": return () => target.pop();
      case "shift": return () => target.shift();
      case "unshift": return (...values) => target.unshift(...values);
      case "join": return (separator) => target.join(separator === undefined ? "," : separator);
      case "includes": return (value) => target.includes(value);
      case "indexOf": return (value) => target.indexOf(value);
      case "slice": return (start, end) => target.slice(start, end);
      case "concat": return (other) => target.concat(other);
      case "reverse": return () => target.reverse();
      case "map": return (callback) => target.map((item, index) => callValue(callback, [item, index], context));
      case "filter": return (callback) => target.filter((item, index) => Boolean(callValue(callback, [item, index], context)));
      case "forEach": return (callback) => { target.forEach((item, index) => callValue(callback, [item, index], context)); };
      case "find": return (callback) => target.find((item, index) => Boolean(callValue(callback, [item, index], context)));
      case "some": return (callback) => target.some((item, index) => Boolean(callValue(callback, [item, index], context)));
      case "every": return (callback) => target.every((item, index) => Boolean(callValue(callback, [item, index], context)));
      case "sort": return (callback) => (callback
        ? target.sort((left, right) => Number(callValue(callback, [left, right], context)))
        : target.sort());
      case "reduce": return (callback, initial) => {
        if (target.length === 0 && initial === undefined) {
          throw friendlyError("No puedes usar reduce sobre un arreglo vacío sin un valor inicial.");
        }
        return initial === undefined
          ? target.reduce((accumulator, item, index) => callValue(callback, [accumulator, item, index], context))
          : target.reduce((accumulator, item, index) => callValue(callback, [accumulator, item, index], context), initial);
      };
      default: return undefined;
    }
  }

  function stringMember(target, name) {
    switch (name) {
      case "length": return target.length;
      case "toUpperCase": return () => target.toUpperCase();
      case "toLowerCase": return () => target.toLowerCase();
      case "includes": return (value) => target.includes(value);
      case "indexOf": return (value) => target.indexOf(value);
      case "startsWith": return (value) => target.startsWith(value);
      case "endsWith": return (value) => target.endsWith(value);
      case "slice": return (start, end) => target.slice(start, end);
      case "split": return (separator) => target.split(separator === undefined ? "" : separator);
      case "trim": return () => target.trim();
      case "repeat": return (times) => target.repeat(Math.max(0, Math.min(200, Number(times) || 0)));
      case "padStart": return (size, filler) => target.padStart(Math.min(200, Number(size) || 0), filler);
      case "padEnd": return (size, filler) => target.padEnd(Math.min(200, Number(size) || 0), filler);
      case "charAt": return (index) => target.charAt(index);
      case "replace": return (search, replacement) => target.replace(String(search), String(replacement));
      case "replaceAll": return (search, replacement) => target.split(String(search)).join(String(replacement));
      case "concat": return (other) => target.concat(String(other));
      default: return undefined;
    }
  }

  function numberMember(target, name) {
    switch (name) {
      case "toFixed": return (digits) => target.toFixed(Math.max(0, Math.min(10, Number(digits) || 0)));
      case "toString": return () => String(target);
      default: return undefined;
    }
  }

  function getMember(object, name, context) {
    if (typeof object === "string") return stringMember(object, name);
    if (typeof object === "number") return numberMember(object, name);
    if (Array.isArray(object)) return arrayMember(object, name, context);
    if (object === null || object === undefined) {
      throw friendlyError("No puedo leer la propiedad " + name + " porque el valor no existe.");
    }
    if (typeof object === "function" || typeof object === "object") {
      if (Object.prototype.hasOwnProperty.call(object, name)) return object[name];
      return undefined;
    }
    return undefined;
  }

  function setMember(object, name, value) {
    if (name === "__proto__" || name === "constructor" || name === "prototype") {
      throw friendlyError("Esa propiedad no está disponible en este laboratorio.");
    }
    if (Array.isArray(object) || (object && typeof object === "object")) {
      object[name] = value;
      return value;
    }
    throw friendlyError("Solo puedes guardar propiedades dentro de un objeto o un arreglo.");
  }

  function evaluate(node, scope, context) {
    context.tick();
    switch (node.type) {
      case "Literal": return node.value;
      case "Name": return readVariable(scope, node.name);
      case "Template": return node.parts
        .map((part) => (part.type === "text" ? part.value : formatValue(evaluate(part.node, scope, context), false)))
        .join("");
      case "ArrayLiteral": return node.elements.map((element) => evaluate(element, scope, context));
      case "ObjectLiteral": {
        const result = {};
        for (const property of node.properties) setMember(result, property.key, evaluate(property.value, scope, context));
        return result;
      }
      case "Arrow": return {
        __starterFunction: true,
        parameters: node.parameters,
        body: node.body,
        expression: node.expression,
        scope
      };
      case "Unary": {
        const value = evaluate(node.argument, scope, context);
        if (node.operator === "!") return !value;
        if (node.operator === "typeof") return describeType(value);
        if (node.operator === "-") return -Number(value);
        return Number(value);
      }
      case "Update": {
        const current = Number(evaluate(node.target, scope, context));
        const updated = node.operator === "++" ? current + 1 : current - 1;
        assign(node.target, updated, scope, context);
        return node.prefix ? updated : current;
      }
      case "Binary": {
        const left = evaluate(node.left, scope, context);
        const right = evaluate(node.right, scope, context);
        switch (node.operator) {
          case "+": return typeof left === "string" || typeof right === "string"
            ? formatValue(left, false) + formatValue(right, false)
            : Number(left) + Number(right);
          case "-": return Number(left) - Number(right);
          case "*": return Number(left) * Number(right);
          case "/": return Number(left) / Number(right);
          case "%": return Number(left) % Number(right);
          case "===": return left === right;
          case "!==": return left !== right;
          case "==": return left == right;
          case "!=": return left != right;
          case "<": return left < right;
          case "<=": return left <= right;
          case ">": return left > right;
          case ">=": return left >= right;
          default: throw friendlyError("Operador no permitido en este laboratorio.");
        }
      }
      case "Logical": {
        const left = evaluate(node.left, scope, context);
        if (node.operator === "&&") return left ? evaluate(node.right, scope, context) : left;
        return left ? left : evaluate(node.right, scope, context);
      }
      case "Conditional": return evaluate(node.test, scope, context)
        ? evaluate(node.consequent, scope, context)
        : evaluate(node.alternate, scope, context);
      case "Assign": {
        let value = evaluate(node.value, scope, context);
        if (node.operator !== "=") {
          const current = evaluate(node.target, scope, context);
          if (node.operator === "+=") {
            value = typeof current === "string" || typeof value === "string"
              ? formatValue(current, false) + formatValue(value, false)
              : Number(current) + Number(value);
          }
          if (node.operator === "-=") value = Number(current) - Number(value);
          if (node.operator === "*=") value = Number(current) * Number(value);
          if (node.operator === "/=") value = Number(current) / Number(value);
        }
        return assign(node.target, value, scope, context);
      }
      case "Member": return getMember(evaluate(node.object, scope, context), node.name, context);
      case "Index": {
        const object = evaluate(node.object, scope, context);
        const property = evaluate(node.property, scope, context);
        if (Array.isArray(object) && typeof property === "number") return object[property];
        if (typeof object === "string" && typeof property === "number") return object.charAt(property);
        return getMember(object, String(property), context);
      }
      case "Call": {
        let callee;
        let args;
        if (node.callee.type === "Member" || node.callee.type === "Index") {
          const object = evaluate(node.callee.object, scope, context);
          const name = node.callee.type === "Member"
            ? node.callee.name
            : String(evaluate(node.callee.property, scope, context));
          callee = getMember(object, name, context);
          if (!isCallable(callee)) throw friendlyError("La función " + name + " no está disponible en este laboratorio.");
          args = node.args.map((argument) => evaluate(argument, scope, context));
        } else {
          callee = evaluate(node.callee, scope, context);
          args = node.args.map((argument) => evaluate(argument, scope, context));
        }
        return callValue(callee, args, context);
      }
      default: throw friendlyError("El código incluye una expresión que todavía no puedo interpretar.");
    }
  }

  function assign(target, value, scope, context) {
    if (target.type === "Name") return writeVariable(scope, target.name, value);
    if (target.type === "Member") return setMember(evaluate(target.object, scope, context), target.name, value);
    if (target.type === "Index") {
      const object = evaluate(target.object, scope, context);
      const property = evaluate(target.property, scope, context);
      if (Array.isArray(object) && typeof property === "number") {
        object[property] = value;
        return value;
      }
      return setMember(object, String(property), value);
    }
    throw friendlyError("Solo puedes asignar valores a variables, propiedades o posiciones de un arreglo.");
  }

  function hoistFunctions(body, scope) {
    for (const statement of body) {
      if (statement.type !== "FunctionDeclaration") continue;
      declareVariable(scope, statement.name, {
        __starterFunction: true,
        parameters: statement.parameters,
        body: statement.body,
        expression: false,
        scope
      }, false);
    }
  }

  function executeBody(body, scope, context) {
    hoistFunctions(body, scope);
    for (const statement of body) {
      const signal = execute(statement, scope, context);
      if (signal) return signal;
    }
    return null;
  }

  function execute(node, scope, context) {
    context.tick();
    switch (node.type) {
      case "Declaration": {
        const constante = node.kind === "const";
        for (const declaration of node.declarations) {
          const value = declaration.value ? evaluate(declaration.value, scope, context) : undefined;
          if (declaration.pattern === "list") {
            if (!Array.isArray(value)) {
              throw friendlyError("Para repartir con [ ] hace falta una lista, y recibiste " + formatValue(value, true) + ".");
            }
            declaration.names.forEach((name, index) => {
              if (name) declareVariable(scope, name, value[index], constante);
            });
            continue;
          }
          if (declaration.pattern === "object") {
            if (value === null || value === undefined || typeof value !== "object") {
              throw friendlyError("Para repartir con { } hace falta un objeto, y recibiste " + formatValue(value, true) + ".");
            }
            for (const entry of declaration.entries) {
              declareVariable(scope, entry.alias, value[entry.key], constante);
            }
            continue;
          }
          declareVariable(scope, declaration.name, value, constante);
        }
        return null;
      }
      case "FunctionDeclaration": return null;
      case "ExpressionStatement": {
        evaluate(node.expression, scope, context);
        return null;
      }
      case "Block": return executeBody(node.body, createScope(scope), context);
      case "If": {
        if (evaluate(node.test, scope, context)) return execute(node.consequent, createScope(scope), context);
        if (node.alternate) return execute(node.alternate, createScope(scope), context);
        return null;
      }
      case "While": {
        while (evaluate(node.test, scope, context)) {
          const signal = execute(node.body, createScope(scope), context);
          if (signal && signal.signal === "break") break;
          if (signal && signal.signal === "return") return signal;
        }
        return null;
      }
      case "For": {
        const loopScope = createScope(scope);
        if (node.init) execute(node.init, loopScope, context);
        while (node.test ? evaluate(node.test, loopScope, context) : true) {
          const signal = execute(node.body, createScope(loopScope), context);
          if (signal && signal.signal === "break") break;
          if (signal && signal.signal === "return") return signal;
          if (node.update) evaluate(node.update, loopScope, context);
        }
        return null;
      }
      case "ForOf": {
        const iterable = evaluate(node.iterable, scope, context);
        const items = Array.isArray(iterable) ? iterable : typeof iterable === "string" ? iterable.split("") : null;
        if (!items) throw friendlyError("Solo puedes recorrer arreglos o textos con for...of.");
        for (const item of items) {
          const loopScope = createScope(scope);
          declareVariable(loopScope, node.name, item, false);
          const signal = execute(node.body, loopScope, context);
          if (signal && signal.signal === "break") break;
          if (signal && signal.signal === "return") return signal;
        }
        return null;
      }
      case "Return": return { signal: "return", value: node.argument ? evaluate(node.argument, scope, context) : undefined };
      case "Break": return { signal: "break" };
      case "Continue": return { signal: "continue" };
      default: throw friendlyError("El código incluye una instrucción que todavía no puedo interpretar.");
    }
  }

  function createGlobalScope(output) {
    const scope = createScope(null);
    const log = (...values) => {
      if (output.length >= MAX_OUTPUT_LINES) throw friendlyError("El programa mostró demasiadas líneas. Revisa tus ciclos.");
      output.push(values.map((value) => formatValue(value, false)).join(" "));
    };
    const mathObject = {
      round: (value) => Math.round(Number(value)),
      floor: (value) => Math.floor(Number(value)),
      ceil: (value) => Math.ceil(Number(value)),
      abs: (value) => Math.abs(Number(value)),
      trunc: (value) => Math.trunc(Number(value)),
      sqrt: (value) => Math.sqrt(Number(value)),
      pow: (base, exponent) => Math.pow(Number(base), Number(exponent)),
      max: (...values) => Math.max(...values.map(Number)),
      min: (...values) => Math.min(...values.map(Number))
    };
    const objectHelpers = {
      keys: (value) => Object.keys(value ?? {}),
      values: (value) => Object.values(value ?? {}),
      entries: (value) => Object.entries(value ?? {}).map(([key, item]) => [key, item])
    };
    const arrayHelpers = { isArray: (value) => Array.isArray(value) };
    const numberHelper = (value) => Number(value);
    numberHelper.isInteger = (value) => Number.isInteger(value);
    numberHelper.parseFloat = (value) => Number.parseFloat(value);

    declareVariable(scope, "console", { log }, true);
    declareVariable(scope, "Math", mathObject, true);
    declareVariable(scope, "Object", objectHelpers, true);
    declareVariable(scope, "Array", arrayHelpers, true);
    declareVariable(scope, "Number", numberHelper, true);
    declareVariable(scope, "String", (value) => formatValue(value, false), true);
    declareVariable(scope, "Boolean", (value) => Boolean(value), true);
    return scope;
  }

  const BUILT_IN_NAMES = new Set(["console", "Math", "Object", "Array", "Number", "String", "Boolean"]);

  function snapshotScope(scope) {
    const result = {};
    for (const [name, slot] of scope.values) {
      if (BUILT_IN_NAMES.has(name)) continue;
      result[name] = slot.value;
    }
    return result;
  }

  /* options.globals permite a un laboratorio agregar sus propios objetos al
     alcance global (require, process, module...). Recibe un api para llamar
     de vuelta a las funciones que escribió la persona y para dar formato a los
     valores del intérprete, porque son estructuras internas y no valores JS. */
  function runJavaScript(source, options = {}) {
    const output = [];
    let steps = 0;
    const context = {
      depth: 0,
      tick() {
        steps += 1;
        if (steps > MAX_STEPS) throw friendlyError("El programa hizo demasiadas operaciones. Revisa si un ciclo nunca termina.");
      }
    };
    const scope = createGlobalScope(output);
    if (typeof options.globals === "function") {
      const api = {
        call: (callee, args) => callValue(callee, args || [], context),
        isCallable,
        format: (value, nested) => formatValue(value, Boolean(nested)),
        print: (line) => {
          if (output.length >= MAX_OUTPUT_LINES) throw friendlyError("El programa mostró demasiadas líneas. Revisa tus ciclos.");
          output.push(String(line));
        },
        fail: (message) => { throw friendlyError(message); }
      };
      for (const [name, value] of Object.entries(options.globals(api) || {})) {
        declareVariable(scope, name, value, true);
      }
    }
    try {
      const program = parseJs(tokenizeJs(source));
      const signal = executeBody(program.body, scope, context);
      if (signal && signal.signal === "return") { /* return fuera de una función: se ignora */ }
    } catch (error) {
      return { output, text: output.join("\n"), error: describeError(error), environment: snapshotScope(scope) };
    }
    return { output, text: output.join("\n"), error: null, environment: snapshotScope(scope) };
  }

  /* ===================== Base de datos de práctica ===================== */

  const SQL_TABLES = {
    cursos: [
      { id: 1, nombre: "Python", nivel: "Inicial", categoria: "Lenguajes", duracion: 12, inscritos: 320 },
      { id: 2, nombre: "HTML y CSS", nivel: "Inicial", categoria: "Web", duracion: 6, inscritos: 410 },
      { id: 3, nombre: "JavaScript", nivel: "Inicial", categoria: "Web", duracion: 8, inscritos: 275 },
      { id: 4, nombre: "SQL", nivel: "Inicial", categoria: "Datos", duracion: 5, inscritos: 190 },
      { id: 5, nombre: "Git", nivel: "Siguiente", categoria: "Herramientas", duracion: 4, inscritos: 150 },
      { id: 6, nombre: "APIs", nivel: "Siguiente", categoria: "Web", duracion: 9, inscritos: 96 },
      { id: 7, nombre: "Datos con Python", nivel: "Avanzado", categoria: "Datos", duracion: 14, inscritos: 64 }
    ],
    estudiantes: [
      { id: 1, nombre: "Ada", ciudad: "Santiago", curso_id: 1, horas: 18 },
      { id: 2, nombre: "Grace", ciudad: "Valparaíso", curso_id: 1, horas: 24 },
      { id: 3, nombre: "Linus", ciudad: "Santiago", curso_id: 3, horas: 9 },
      { id: 4, nombre: "Katherine", ciudad: "Concepción", curso_id: 4, horas: 12 },
      { id: 5, nombre: "Alan", ciudad: "Santiago", curso_id: 2, horas: 7 },
      { id: 6, nombre: "Margaret", ciudad: "La Serena", curso_id: 2, horas: 15 },
      { id: 7, nombre: "Barbara", ciudad: "Valparaíso", curso_id: 6, horas: 21 },
      { id: 8, nombre: "Edsger", ciudad: "Concepción", curso_id: 7, horas: 30 }
    ]
  };

  /* ===================== Tokenizador de SQL ===================== */

  const SQL_OPERATORS = ["<>", "!=", ">=", "<=", "=", "<", ">"];

  function tokenizeSql(source) {
    const tokens = [];
    let index = 0;
    while (index < source.length) {
      const character = source[index];
      if (character === " " || character === "\t" || character === "\r" || character === "\n") {
        index += 1;
        continue;
      }
      if (character === "-" && source[index + 1] === "-") {
        while (index < source.length && source[index] !== "\n") index += 1;
        continue;
      }
      if (character === "'" || character === "\"") {
        let value = "";
        index += 1;
        while (index < source.length && source[index] !== character) {
          value += source[index];
          index += 1;
        }
        if (index >= source.length) throw friendlyError("Falta cerrar unas comillas en la consulta.");
        index += 1;
        tokens.push({ type: "string", value });
        continue;
      }
      if (character >= "0" && character <= "9") {
        let raw = "";
        while (index < source.length && /[0-9.]/.test(source[index])) {
          raw += source[index];
          index += 1;
        }
        tokens.push({ type: "number", value: Number(raw) });
        continue;
      }
      if (/[A-Za-z_]/.test(character)) {
        let word = "";
        while (index < source.length && /[A-Za-z0-9_]/.test(source[index])) {
          word += source[index];
          index += 1;
        }
        tokens.push({ type: "word", value: word, keyword: word.toLowerCase() });
        continue;
      }
      const operator = SQL_OPERATORS.find((candidate) => source.startsWith(candidate, index));
      if (operator) {
        tokens.push({ type: "operator", value: operator });
        index += operator.length;
        continue;
      }
      if ("(),.;*".includes(character)) {
        tokens.push({ type: "punctuator", value: character });
        index += 1;
        continue;
      }
      throw friendlyError("La consulta incluye un símbolo que todavía no reconozco.");
    }
    tokens.push({ type: "end" });
    return tokens;
  }

  /* ===================== Analizador de SQL ===================== */

  const AGGREGATES = new Set(["count", "sum", "avg", "min", "max"]);

  function parseSql(tokens) {
    let position = 0;
    const peek = (offset = 0) => tokens[position + offset] ?? { type: "end" };
    const advance = () => tokens[position++];
    const atKeyword = (keyword) => peek().type === "word" && peek().keyword === keyword;
    const atPunctuator = (value) => peek().type === "punctuator" && peek().value === value;
    const eatKeyword = (keyword) => {
      if (!atKeyword(keyword)) return false;
      position += 1;
      return true;
    };
    const eatPunctuator = (value) => {
      if (!atPunctuator(value)) return false;
      position += 1;
      return true;
    };
    const expectKeyword = (keyword) => {
      if (!eatKeyword(keyword)) throw friendlyError("La consulta necesita la palabra " + keyword.toUpperCase() + ".");
    };
    const expectPunctuator = (value) => {
      if (!eatPunctuator(value)) throw friendlyError("Falta el símbolo " + value + " en la consulta.");
    };

    const RESERVED = new Set([
      "select", "distinct", "from", "join", "inner", "on", "where", "group", "order",
      "by", "asc", "desc", "limit", "and", "or", "not", "like", "in", "between", "as"
    ]);

    function parseName() {
      if (peek().type !== "word") throw friendlyError("Falta el nombre de una tabla o de una columna.");
      return advance().value;
    }

    function parseColumnReference() {
      const first = parseName();
      if (!atPunctuator(".")) return { type: "Column", table: null, name: first.toLowerCase(), label: first };
      advance();
      if (atPunctuator("*")) {
        advance();
        return { type: "AllColumns", table: first.toLowerCase() };
      }
      const second = parseName();
      return { type: "Column", table: first.toLowerCase(), name: second.toLowerCase(), label: first + "." + second };
    }

    function parseValue() {
      const token = peek();
      if (token.type === "number" || token.type === "string") {
        advance();
        return { type: "Literal", value: token.value };
      }
      if (token.type === "word" && AGGREGATES.has(token.keyword) && peek(1).type === "punctuator" && peek(1).value === "(") {
        return parseAggregate();
      }
      if (token.type === "word" && !RESERVED.has(token.keyword)) return parseColumnReference();
      throw friendlyError("Esperaba un valor o el nombre de una columna en la consulta.");
    }

    function parseAggregate() {
      const name = advance().keyword;
      expectPunctuator("(");
      let argument = null;
      let label = name.toUpperCase() + "(";
      if (eatPunctuator("*")) {
        label += "*";
      } else {
        argument = parseColumnReference();
        label += argument.label;
      }
      expectPunctuator(")");
      label += ")";
      if (name !== "count" && !argument) throw friendlyError("Solo COUNT admite el asterisco. Usa una columna dentro de la función.");
      return { type: "Aggregate", name, argument, label };
    }

    function parseSelectList() {
      const items = [];
      const distinct = eatKeyword("distinct");
      do {
        if (eatPunctuator("*")) {
          items.push({ type: "AllColumns", table: null });
          continue;
        }
        const expression = parseValue();
        let label = expression.label ?? String(expression.value);
        if (eatKeyword("as")) label = parseName();
        if (expression.type === "AllColumns") items.push(expression);
        else items.push({ type: "Item", expression, label });
      } while (eatPunctuator(","));
      return { distinct, items };
    }

    function parseComparison() {
      if (eatPunctuator("(")) {
        const condition = parseOr();
        expectPunctuator(")");
        return condition;
      }
      if (eatKeyword("not")) return { type: "Not", condition: parseComparison() };
      const left = parseValue();
      if (eatKeyword("like")) return { type: "Like", left, pattern: parseValue() };
      if (eatKeyword("in")) {
        expectPunctuator("(");
        const values = [];
        do { values.push(parseValue()); } while (eatPunctuator(","));
        expectPunctuator(")");
        return { type: "In", left, values };
      }
      if (eatKeyword("between")) {
        const low = parseValue();
        expectKeyword("and");
        const high = parseValue();
        return { type: "Between", left, low, high };
      }
      if (peek().type !== "operator") throw friendlyError("Falta un operador de comparación dentro de WHERE.");
      const operator = advance().value;
      return { type: "Comparison", operator, left, right: parseValue() };
    }

    function parseAnd() {
      let left = parseComparison();
      while (eatKeyword("and")) left = { type: "And", left, right: parseComparison() };
      return left;
    }

    function parseOr() {
      let left = parseAnd();
      while (eatKeyword("or")) left = { type: "Or", left, right: parseAnd() };
      return left;
    }

    expectKeyword("select");
    const selection = parseSelectList();
    expectKeyword("from");
    const fromName = parseName();
    let fromAlias = fromName;
    if (eatKeyword("as")) fromAlias = parseName();
    else if (peek().type === "word" && !RESERVED.has(peek().keyword)) fromAlias = parseName();

    let join = null;
    eatKeyword("inner");
    if (eatKeyword("join")) {
      const joinName = parseName();
      let joinAlias = joinName;
      if (eatKeyword("as")) joinAlias = parseName();
      else if (peek().type === "word" && !RESERVED.has(peek().keyword)) joinAlias = parseName();
      expectKeyword("on");
      const left = parseColumnReference();
      if (peek().type !== "operator") throw friendlyError("La condición del JOIN necesita una comparación con =.");
      const operator = advance().value;
      const right = parseColumnReference();
      join = { table: joinName.toLowerCase(), alias: joinAlias.toLowerCase(), left, operator, right };
    }

    const where = eatKeyword("where") ? parseOr() : null;

    let groupBy = null;
    if (eatKeyword("group")) {
      expectKeyword("by");
      groupBy = [];
      do { groupBy.push(parseColumnReference()); } while (eatPunctuator(","));
    }

    let orderBy = null;
    if (eatKeyword("order")) {
      expectKeyword("by");
      orderBy = [];
      do {
        const expression = parseValue();
        let direction = "asc";
        if (eatKeyword("desc")) direction = "desc";
        else eatKeyword("asc");
        orderBy.push({ expression, direction });
      } while (eatPunctuator(","));
    }

    let limit = null;
    if (eatKeyword("limit")) {
      if (peek().type !== "number") throw friendlyError("LIMIT necesita un número.");
      limit = advance().value;
    }

    eatPunctuator(";");
    if (peek().type !== "end") throw friendlyError("Hay texto extra al final de la consulta.");

    return {
      distinct: selection.distinct,
      items: selection.items,
      from: { table: fromName.toLowerCase(), alias: fromAlias.toLowerCase() },
      join,
      where,
      groupBy,
      orderBy,
      limit
    };
  }

  /* ===================== Ejecución de SQL ===================== */

  function buildRow(sources) {
    const values = new Map();
    const ambiguous = new Set();
    const order = [];
    for (const source of sources) {
      for (const column of Object.keys(source.record)) {
        values.set(source.alias + "." + column, source.record[column]);
        order.push({ qualified: source.alias + "." + column, plain: column, alias: source.alias });
        if (values.has(column)) ambiguous.add(column);
        else values.set(column, source.record[column]);
      }
    }
    return { values, ambiguous, order };
  }

  function readColumn(row, reference) {
    const key = reference.table ? reference.table + "." + reference.name : reference.name;
    if (!reference.table && row.ambiguous.has(reference.name)) {
      throw friendlyError("La columna " + reference.name + " existe en las dos tablas. Escribe tabla.columna para elegir una.");
    }
    if (!row.values.has(key)) throw friendlyError("No encuentro la columna " + reference.label + " en esta consulta.");
    return row.values.get(key);
  }

  function readOperand(row, node) {
    if (node.type === "Literal") return node.value;
    if (node.type === "Column") return readColumn(row, node);
    throw friendlyError("Esa expresión no está disponible dentro de WHERE.");
  }

  function compareValues(left, right) {
    if (typeof left === "number" && typeof right === "number") return left - right;
    return String(left).localeCompare(String(right), "es", { numeric: true, sensitivity: "base" });
  }

  function likeToRegExp(pattern) {
    const escaped = String(pattern).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp("^" + escaped.replace(/%/g, ".*").replace(/_/g, ".") + "$", "i");
  }

  function evaluateCondition(row, condition) {
    switch (condition.type) {
      case "And": return evaluateCondition(row, condition.left) && evaluateCondition(row, condition.right);
      case "Or": return evaluateCondition(row, condition.left) || evaluateCondition(row, condition.right);
      case "Not": return !evaluateCondition(row, condition.condition);
      case "Like": return likeToRegExp(readOperand(row, condition.pattern)).test(String(readOperand(row, condition.left)));
      case "In": {
        const value = readOperand(row, condition.left);
        return condition.values.some((item) => compareValues(value, readOperand(row, item)) === 0);
      }
      case "Between": {
        const value = readOperand(row, condition.left);
        return compareValues(value, readOperand(row, condition.low)) >= 0
          && compareValues(value, readOperand(row, condition.high)) <= 0;
      }
      case "Comparison": {
        const left = readOperand(row, condition.left);
        const right = readOperand(row, condition.right);
        const comparison = compareValues(left, right);
        switch (condition.operator) {
          case "=": return comparison === 0;
          case "!=": case "<>": return comparison !== 0;
          case ">": return comparison > 0;
          case ">=": return comparison >= 0;
          case "<": return comparison < 0;
          case "<=": return comparison <= 0;
          default: return false;
        }
      }
      default: throw friendlyError("Esa condición todavía no está disponible.");
    }
  }

  function aggregateValue(aggregate, rows) {
    if (aggregate.name === "count" && !aggregate.argument) return rows.length;
    const values = rows.map((row) => readColumn(row, aggregate.argument)).filter((value) => value !== null && value !== undefined);
    if (aggregate.name === "count") return values.length;
    if (values.length === 0) return null;
    const numbers = values.map(Number);
    if (numbers.some((value) => Number.isNaN(value)) && (aggregate.name === "sum" || aggregate.name === "avg")) {
      throw friendlyError("SUM y AVG necesitan una columna numérica.");
    }
    if (aggregate.name === "sum") return numbers.reduce((total, value) => total + value, 0);
    if (aggregate.name === "avg") return Math.round((numbers.reduce((total, value) => total + value, 0) / numbers.length) * 100) / 100;
    if (aggregate.name === "min") return values.reduce((best, value) => (compareValues(value, best) < 0 ? value : best));
    return values.reduce((best, value) => (compareValues(value, best) > 0 ? value : best));
  }

  function expandColumns(row, table) {
    return row.order
      .filter((entry) => (table ? entry.alias === table : true))
      .map((entry) => ({
        label: row.ambiguous.has(entry.plain) ? entry.qualified : entry.plain,
        key: entry.qualified
      }));
  }

  function runSql(source, tables = SQL_TABLES) {
    try {
      const query = parseSql(tokenizeSql(String(source).trim()));
      if (!tables[query.from.table]) {
        throw friendlyError("No existe la tabla " + query.from.table + ". Prueba con cursos o estudiantes.");
      }
      if (query.join && !tables[query.join.table]) {
        throw friendlyError("No existe la tabla " + query.join.table + ". Prueba con cursos o estudiantes.");
      }

      let rows = tables[query.from.table].map((record) => buildRow([{ alias: query.from.alias, record }]));
      if (query.join) {
        const joined = [];
        for (const record of tables[query.from.table]) {
          for (const other of tables[query.join.table]) {
            const row = buildRow([
              { alias: query.from.alias, record },
              { alias: query.join.alias, record: other }
            ]);
            if (compareValues(readColumn(row, query.join.left), readColumn(row, query.join.right)) === 0) joined.push(row);
          }
        }
        rows = joined;
      }

      if (query.where) rows = rows.filter((row) => evaluateCondition(row, query.where));

      const hasAggregate = query.items.some((item) => item.type === "Item" && item.expression.type === "Aggregate");
      let columns = [];
      let results = [];

      if (hasAggregate || query.groupBy) {
        const groups = new Map();
        for (const row of rows) {
          const key = query.groupBy
            ? query.groupBy.map((reference) => String(readColumn(row, reference))).join("||")
            : "__todo__";
          if (!groups.has(key)) groups.set(key, []);
          groups.get(key).push(row);
        }
        if (!query.groupBy && groups.size === 0) groups.set("__todo__", []);

        for (const item of query.items) {
          if (item.type === "AllColumns") throw friendlyError("No puedes mezclar * con funciones de resumen. Escribe las columnas que necesitas.");
          columns.push(item.label);
        }

        for (const [, groupRows] of groups) {
          const output = {};
          for (const item of query.items) {
            if (item.expression.type === "Aggregate") {
              output[item.label] = aggregateValue(item.expression, groupRows);
              continue;
            }
            if (item.expression.type === "Literal") {
              output[item.label] = item.expression.value;
              continue;
            }
            const isGrouped = query.groupBy && query.groupBy.some((reference) => reference.name === item.expression.name);
            if (!isGrouped) {
              throw friendlyError("La columna " + item.expression.label + " debe aparecer dentro de GROUP BY o de una función de resumen.");
            }
            output[item.label] = groupRows.length > 0 ? readColumn(groupRows[0], item.expression) : null;
          }
          results.push({ output, source: groupRows[0] ?? null });
        }
      } else {
        const first = rows[0] ?? buildRow([
          { alias: query.from.alias, record: tables[query.from.table][0] ?? {} },
          ...(query.join ? [{ alias: query.join.alias, record: tables[query.join.table][0] ?? {} }] : [])
        ]);
        const plan = [];
        for (const item of query.items) {
          if (item.type === "AllColumns") {
            for (const column of expandColumns(first, item.table)) plan.push({ label: column.label, key: column.key });
            continue;
          }
          plan.push({ label: item.label, expression: item.expression });
        }
        columns = plan.map((entry) => entry.label);
        results = rows.map((row) => {
          const output = {};
          for (const entry of plan) {
            output[entry.label] = entry.key
              ? row.values.get(entry.key)
              : entry.expression.type === "Literal" ? entry.expression.value : readColumn(row, entry.expression);
          }
          return { output, source: row };
        });
      }

      if (query.distinct) {
        const seen = new Set();
        results = results.filter((entry) => {
          const key = columns.map((column) => String(entry.output[column])).join("||");
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      }

      if (query.orderBy) {
        const orders = query.orderBy.map((order) => {
          if (order.expression.type === "Aggregate") return { label: order.expression.label, direction: order.direction };
          if (order.expression.type === "Literal") return { label: null, direction: order.direction };
          const label = columns.find((column) => column.toLowerCase() === order.expression.label.toLowerCase());
          return { label: label ?? null, reference: order.expression, direction: order.direction };
        });
        results = results.slice().sort((left, right) => {
          for (const order of orders) {
            const leftValue = order.label ? left.output[order.label] : (left.source ? readColumn(left.source, order.reference) : null);
            const rightValue = order.label ? right.output[order.label] : (right.source ? readColumn(right.source, order.reference) : null);
            const comparison = compareValues(leftValue, rightValue) * (order.direction === "desc" ? -1 : 1);
            if (comparison !== 0) return comparison;
          }
          return 0;
        });
      }

      if (query.limit !== null) results = results.slice(0, query.limit);

      return { columns, rows: results.map((entry) => entry.output), error: null };
    } catch (error) {
      return { columns: [], rows: [], error: describeError(error) };
    }
  }

  function formatCell(value) {
    if (value === null || value === undefined) return "NULL";
    return String(value);
  }

  function formatSqlResult(result) {
    if (result.error) return result.error;
    if (result.columns.length === 0) return "La consulta no devolvió columnas.";
    const widths = result.columns.map((column) => Math.max(
      column.length,
      ...result.rows.map((row) => formatCell(row[column]).length),
      3
    ));
    const divider = "+-" + widths.map((width) => "-".repeat(width)).join("-+-") + "-+";
    const renderRow = (values) => "| " + values.map((value, index) => value.padEnd(widths[index])).join(" | ") + " |";
    const lines = [divider, renderRow(result.columns), divider];
    for (const row of result.rows) lines.push(renderRow(result.columns.map((column) => formatCell(row[column]))));
    lines.push(divider);
    lines.push(result.rows.length === 1 ? "1 fila" : result.rows.length + " filas");
    return lines.join("\n");
  }

  globalThis.StarterRuntime = {
    runJavaScript,
    formatValue,
    runSql(source, tables) {
      const result = runSql(source, tables);
      return { columns: result.columns, rows: result.rows, error: result.error, text: formatSqlResult(result) };
    },
    formatSqlResult,
    tables: SQL_TABLES
  };
})();
