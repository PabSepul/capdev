/*
  Intérprete educativo de Python para Código Cero.
  Analiza y evalúa un subconjunto real del lenguaje: no usa eval, Function ni
  ejecución nativa, y nunca devuelve resultados inventados. Si una instrucción
  no está soportada, lo dice en español en lugar de fingir que funcionó.
*/
(() => {
  "use strict";

  const MAX_STEPS = 200000;
  const MAX_OUTPUT_LINES = 200;
  const MAX_DEPTH = 100;

  function pyError(message, line) {
    const error = new Error(message);
    error.friendly = true;
    error.line = line;
    return error;
  }

  /* ========================= Tokenizador ========================= */

  const KEYWORDS = new Set([
    "and", "or", "not", "in", "is", "if", "elif", "else", "for", "while",
    "def", "return", "break", "continue", "pass", "True", "False", "None",
    "try", "except", "finally", "raise", "del", "global", "lambda", "import"
  ]);

  const OPERATORS = [
    "**=", "//=", "**", "//", "==", "!=", "<=", ">=", "+=", "-=", "*=", "/=", "%=",
    "(", ")", "[", "]", "{", "}", ",", ":", ".", "+", "-", "*", "/", "%", "<", ">", "="
  ];

  const STRING_ESCAPES = { n: "\n", t: "\t", r: "\r", "\\": "\\", "'": "'", "\"": "\"", "0": "\0" };

  function isDigit(character) { return character >= "0" && character <= "9"; }
  function isNameStart(character) { return /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ_]/.test(character); }
  function isNamePart(character) { return /[A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ_]/.test(character); }

  function readStringBody(source, start, quote, line) {
    let index = start;
    let value = "";
    while (index < source.length) {
      const character = source[index];
      if (character === "\n") throw pyError("Falta cerrar las comillas antes del final de la línea.", line);
      if (character === "\\") {
        const next = source[index + 1];
        value += Object.prototype.hasOwnProperty.call(STRING_ESCAPES, next) ? STRING_ESCAPES[next] : next ?? "";
        index += 2;
        continue;
      }
      if (character === quote) return { value, end: index + 1 };
      value += character;
      index += 1;
    }
    throw pyError("Falta cerrar las comillas.", line);
  }

  function splitFormatString(raw, line) {
    const parts = [];
    let text = "";
    let index = 0;
    while (index < raw.length) {
      const character = raw[index];
      if (character === "{" && raw[index + 1] === "{") { text += "{"; index += 2; continue; }
      if (character === "}" && raw[index + 1] === "}") { text += "}"; index += 2; continue; }
      if (character === "}") throw pyError("Hay una llave de cierre sin abrir dentro de la f-string.", line);
      if (character !== "{") { text += character; index += 1; continue; }
      if (text) { parts.push({ type: "text", value: text }); text = ""; }
      let depth = 1;
      let expression = "";
      index += 1;
      while (index < raw.length && depth > 0) {
        const current = raw[index];
        if (current === "{") depth += 1;
        if (current === "}") {
          depth -= 1;
          if (depth === 0) break;
        }
        expression += current;
        index += 1;
      }
      if (depth !== 0) throw pyError("Falta cerrar una llave dentro de la f-string.", line);
      index += 1;
      let spec = "";
      const separator = expression.lastIndexOf(":");
      if (separator > -1 && !expression.slice(separator).includes(")") && !expression.slice(separator).includes("]")) {
        spec = expression.slice(separator + 1).trim();
        expression = expression.slice(0, separator);
      }
      if (!expression.trim()) throw pyError("Hay unas llaves vacías dentro de la f-string.", line);
      parts.push({ type: "expression", source: expression, spec });
    }
    if (text) parts.push({ type: "text", value: text });
    return parts;
  }

  function tokenize(source) {
    const tokens = [];
    const indents = [0];
    const lines = String(source).replace(/\r\n?/g, "\n").split("\n");
    let brackets = 0;
    let continued = false;

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
      const rawLine = lines[lineIndex];
      const lineNumber = lineIndex + 1;

      if (brackets === 0 && !continued) {
        const withoutIndent = rawLine.replace(/^[ \t]*/, "");
        if (!withoutIndent || withoutIndent.startsWith("#")) continue;
        if (/^\t/.test(rawLine) || /^[ ]*\t/.test(rawLine.slice(0, rawLine.length - withoutIndent.length))) {
          throw pyError("Usa espacios para la sangría, no tabulaciones.", lineNumber);
        }
        const indent = rawLine.length - withoutIndent.length;
        const current = indents[indents.length - 1];
        if (indent > current) {
          indents.push(indent);
          tokens.push({ type: "INDENT", line: lineNumber });
        } else if (indent < current) {
          while (indents.length > 1 && indents[indents.length - 1] > indent) {
            indents.pop();
            tokens.push({ type: "DEDENT", line: lineNumber });
          }
          if (indents[indents.length - 1] !== indent) {
            throw pyError("La sangría no coincide con ningún bloque abierto.", lineNumber);
          }
        }
      }

      continued = false;
      let index = 0;
      while (index < rawLine.length) {
        const character = rawLine[index];
        if (character === " " || character === "\t") { index += 1; continue; }
        if (character === "#") break;
        if (character === "\\" && index === rawLine.length - 1) { continued = true; index += 1; continue; }

        if (isDigit(character) || (character === "." && isDigit(rawLine[index + 1] || ""))) {
          let raw = "";
          while (index < rawLine.length && /[0-9._]/.test(rawLine[index])) { raw += rawLine[index]; index += 1; }
          if (/[eE]/.test(rawLine[index] || "") && /[0-9+-]/.test(rawLine[index + 1] || "")) {
            raw += rawLine[index];
            index += 1;
            if (/[+-]/.test(rawLine[index])) { raw += rawLine[index]; index += 1; }
            while (index < rawLine.length && isDigit(rawLine[index])) { raw += rawLine[index]; index += 1; }
          }
          const clean = raw.replace(/_/g, "");
          const value = Number(clean);
          if (!Number.isFinite(value)) throw pyError("El número “" + raw + "” no es válido.", lineNumber);
          tokens.push({ type: "NUMBER", value, isFloat: /[.eE]/.test(clean), line: lineNumber });
          continue;
        }

        const prefix = rawLine.slice(index, index + 2).toLowerCase();
        if ((prefix === "f'" || prefix === 'f"') || (prefix[0] === "r" && (prefix[1] === "'" || prefix[1] === '"'))) {
          const quote = rawLine[index + 1];
          const body = readStringBody(rawLine, index + 2, quote, lineNumber);
          if (prefix[0] === "f") {
            tokens.push({ type: "FSTRING", parts: splitFormatString(body.value, lineNumber), line: lineNumber });
          } else {
            tokens.push({ type: "STRING", value: body.value, line: lineNumber });
          }
          index = body.end;
          continue;
        }

        if (character === "'" || character === '"') {
          const body = readStringBody(rawLine, index + 1, character, lineNumber);
          tokens.push({ type: "STRING", value: body.value, line: lineNumber });
          index = body.end;
          continue;
        }

        if (isNameStart(character)) {
          let name = "";
          while (index < rawLine.length && isNamePart(rawLine[index])) { name += rawLine[index]; index += 1; }
          tokens.push({ type: KEYWORDS.has(name) ? "KEYWORD" : "NAME", value: name, line: lineNumber });
          continue;
        }

        const operator = OPERATORS.find((candidate) => rawLine.startsWith(candidate, index));
        if (!operator) throw pyError("No reconozco el símbolo “" + character + "”.", lineNumber);
        if ("([{".includes(operator)) brackets += 1;
        if (")]}".includes(operator)) brackets = Math.max(0, brackets - 1);
        tokens.push({ type: "OP", value: operator, line: lineNumber });
        index += operator.length;
      }

      if (brackets === 0 && !continued && tokens.length && tokens[tokens.length - 1].type !== "NEWLINE") {
        tokens.push({ type: "NEWLINE", line: lineNumber });
      }
    }

    const lastLine = lines.length;
    while (indents.length > 1) { indents.pop(); tokens.push({ type: "DEDENT", line: lastLine }); }
    tokens.push({ type: "EOF", line: lastLine });
    return tokens;
  }

  /* ========================= Analizador ========================= */

  const AUGMENTED = { "+=": "+", "-=": "-", "*=": "*", "/=": "/", "//=": "//", "%=": "%", "**=": "**" };

  function parse(tokens) {
    let position = 0;

    const peek = (offset = 0) => tokens[position + offset] ?? tokens[tokens.length - 1];
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
      if (at(type, value)) return advance();
      const token = peek();
      throw pyError("Esperaba “" + (value ?? type) + "” y encontré “" + (token.value ?? token.type) + "”.", token.line);
    };

    function parseBlock() {
      if (!eat("NEWLINE")) {
        const statement = parseSimpleStatement();
        eat("NEWLINE");
        return [statement];
      }
      expect("INDENT");
      const body = [];
      while (!at("DEDENT") && !at("EOF")) body.push(parseStatement());
      expect("DEDENT");
      if (body.length === 0) throw pyError("El bloque quedó vacío. Usa pass si no quieres escribir nada.", peek().line);
      return body;
    }

    function parseStatement() {
      const token = peek();
      if (token.type === "KEYWORD") {
        if (token.value === "if") return parseIf();
        if (token.value === "while") return parseWhile();
        if (token.value === "for") return parseFor();
        if (token.value === "def") return parseFunction();
        if (token.value === "try") return parseTry();
        if (token.value === "import") throw pyError("El laboratorio no tiene módulos externos: import no está disponible.", token.line);
      }
      const statement = parseSimpleStatement();
      if (!at("EOF")) expect("NEWLINE");
      return statement;
    }

    function parseIf() {
      const line = expect("KEYWORD", "if").line;
      const test = parseExpression();
      expect("OP", ":");
      const body = parseBlock();
      let orelse = [];
      if (at("KEYWORD", "elif")) {
        tokens[position] = { ...tokens[position], value: "if" };
        orelse = [parseIf()];
      } else if (eat("KEYWORD", "else")) {
        expect("OP", ":");
        orelse = parseBlock();
      }
      return { type: "If", test, body, orelse, line };
    }

    function parseWhile() {
      const line = expect("KEYWORD", "while").line;
      const test = parseExpression();
      expect("OP", ":");
      return { type: "While", test, body: parseBlock(), line };
    }

    function parseFor() {
      const line = expect("KEYWORD", "for").line;
      const target = parseTargetList();
      expect("KEYWORD", "in");
      const iterable = parseExpression();
      expect("OP", ":");
      return { type: "For", target, iterable, body: parseBlock(), line };
    }

    function parseFunction() {
      const line = expect("KEYWORD", "def").line;
      const name = expect("NAME").value;
      expect("OP", "(");
      const params = [];
      while (!at("OP", ")")) {
        const paramName = expect("NAME").value;
        let fallback = null;
        if (eat("OP", "=")) fallback = parseExpression();
        params.push({ name: paramName, fallback });
        if (!eat("OP", ",")) break;
      }
      expect("OP", ")");
      expect("OP", ":");
      return { type: "FunctionDef", name, params, body: parseBlock(), line };
    }

    function parseTry() {
      const line = expect("KEYWORD", "try").line;
      expect("OP", ":");
      const body = parseBlock();
      const handlers = [];
      while (at("KEYWORD", "except")) {
        advance();
        let errorName = null;
        if (at("NAME")) errorName = advance().value;
        expect("OP", ":");
        handlers.push({ errorName, body: parseBlock() });
      }
      let finalBody = [];
      if (eat("KEYWORD", "finally")) {
        expect("OP", ":");
        finalBody = parseBlock();
      }
      if (handlers.length === 0 && finalBody.length === 0) {
        throw pyError("Un bloque try necesita al menos un except.", line);
      }
      return { type: "Try", body, handlers, finalBody, line };
    }

    function parseTargetList() {
      const first = parsePostfix();
      if (!at("OP", ",")) return first;
      const elements = [first];
      while (eat("OP", ",")) {
        if (at("KEYWORD", "in") || at("OP", "=")) break;
        elements.push(parsePostfix());
      }
      return { type: "TupleTarget", elements, line: first.line };
    }

    function parseSimpleStatement() {
      const token = peek();
      if (token.type === "KEYWORD") {
        if (token.value === "return") {
          advance();
          const value = at("NEWLINE") || at("EOF") ? null : parseExpressionList();
          return { type: "Return", value, line: token.line };
        }
        if (token.value === "break") { advance(); return { type: "Break", line: token.line }; }
        if (token.value === "continue") { advance(); return { type: "Continue", line: token.line }; }
        if (token.value === "pass") { advance(); return { type: "Pass", line: token.line }; }
        if (token.value === "raise") {
          advance();
          const value = at("NEWLINE") || at("EOF") ? null : parseExpression();
          return { type: "Raise", value, line: token.line };
        }
        if (token.value === "del") {
          advance();
          return { type: "Delete", target: parsePostfix(), line: token.line };
        }
      }

      const first = parseExpressionList();
      if (at("OP", "=")) {
        const targets = [first];
        let value = null;
        while (eat("OP", "=")) {
          const next = parseExpressionList();
          if (at("OP", "=")) targets.push(next);
          else value = next;
        }
        for (const target of targets) assertAssignable(target);
        return { type: "Assign", targets, value, line: token.line };
      }
      const operator = peek();
      if (operator.type === "OP" && Object.prototype.hasOwnProperty.call(AUGMENTED, operator.value)) {
        advance();
        assertAssignable(first);
        return { type: "AugAssign", target: first, operator: AUGMENTED[operator.value], value: parseExpressionList(), line: token.line };
      }
      return { type: "ExpressionStatement", value: first, line: token.line };
    }

    function assertAssignable(node) {
      if (node.type === "Name" || node.type === "Subscript" || node.type === "Attribute") return;
      if (node.type === "Tuple" || node.type === "TupleTarget") {
        node.elements.forEach(assertAssignable);
        return;
      }
      throw pyError("No puedo asignar un valor a esa expresión.", node.line);
    }

    function parseExpressionList() {
      const first = parseExpression();
      if (!at("OP", ",")) return first;
      const elements = [first];
      while (eat("OP", ",")) {
        if (at("NEWLINE") || at("EOF") || at("OP", "=") || at("OP", ")")) break;
        elements.push(parseExpression());
      }
      return { type: "Tuple", elements, line: first.line };
    }

    function parseExpression() {
      if (at("KEYWORD", "lambda")) return parseLambda();
      const value = parseOr();
      if (!at("KEYWORD", "if")) return value;
      advance();
      const test = parseOr();
      expect("KEYWORD", "else");
      return { type: "IfExp", test, body: value, orelse: parseExpression(), line: value.line };
    }

    /* lambda tiene la precedencia más baja: su cuerpo es una sola expresión y
       termina donde aparece una coma o un paréntesis de cierre. */
    function parseLambda() {
      const line = expect("KEYWORD", "lambda").line;
      const params = [];
      while (!at("OP", ":")) {
        const paramName = expect("NAME").value;
        let fallback = null;
        if (eat("OP", "=")) fallback = parseExpression();
        params.push({ name: paramName, fallback });
        if (!eat("OP", ",")) break;
      }
      expect("OP", ":");
      return { type: "Lambda", params, body: parseExpression(), line };
    }

    function parseOr() {
      let left = parseAnd();
      while (at("KEYWORD", "or")) {
        const line = advance().line;
        left = { type: "BoolOp", operator: "or", left, right: parseAnd(), line };
      }
      return left;
    }

    function parseAnd() {
      let left = parseNot();
      while (at("KEYWORD", "and")) {
        const line = advance().line;
        left = { type: "BoolOp", operator: "and", left, right: parseNot(), line };
      }
      return left;
    }

    function parseNot() {
      if (at("KEYWORD", "not")) {
        const line = advance().line;
        return { type: "Not", operand: parseNot(), line };
      }
      return parseComparison();
    }

    const COMPARISONS = ["==", "!=", "<", "<=", ">", ">="];

    function parseComparison() {
      let left = parseArithmetic();
      const operations = [];
      for (;;) {
        const token = peek();
        if (token.type === "OP" && COMPARISONS.includes(token.value)) {
          advance();
          operations.push({ operator: token.value, right: parseArithmetic() });
          continue;
        }
        if (token.type === "KEYWORD" && token.value === "in") {
          advance();
          operations.push({ operator: "in", right: parseArithmetic() });
          continue;
        }
        if (token.type === "KEYWORD" && token.value === "not" && peek(1).type === "KEYWORD" && peek(1).value === "in") {
          advance();
          advance();
          operations.push({ operator: "not in", right: parseArithmetic() });
          continue;
        }
        if (token.type === "KEYWORD" && token.value === "is") {
          advance();
          const negated = at("KEYWORD", "not") ? Boolean(advance()) : false;
          operations.push({ operator: negated ? "is not" : "is", right: parseArithmetic() });
          continue;
        }
        break;
      }
      if (operations.length === 0) return left;
      return { type: "Compare", left, operations, line: left.line };
    }

    function parseArithmetic() {
      let left = parseTerm();
      for (;;) {
        const token = peek();
        if (token.type !== "OP" || (token.value !== "+" && token.value !== "-")) return left;
        advance();
        left = { type: "BinOp", operator: token.value, left, right: parseTerm(), line: token.line };
      }
    }

    function parseTerm() {
      let left = parseUnary();
      for (;;) {
        const token = peek();
        if (token.type !== "OP" || !["*", "/", "//", "%"].includes(token.value)) return left;
        advance();
        left = { type: "BinOp", operator: token.value, left, right: parseUnary(), line: token.line };
      }
    }

    function parseUnary() {
      const token = peek();
      if (token.type === "OP" && (token.value === "-" || token.value === "+")) {
        advance();
        return { type: "UnaryOp", operator: token.value, operand: parseUnary(), line: token.line };
      }
      return parsePower();
    }

    function parsePower() {
      const base = parsePostfix();
      if (at("OP", "**")) {
        const line = advance().line;
        return { type: "BinOp", operator: "**", left: base, right: parseUnary(), line };
      }
      return base;
    }

    function parseArguments() {
      const args = [];
      const keywords = [];
      expect("OP", "(");
      while (!at("OP", ")")) {
        if (at("NAME") && peek(1).type === "OP" && peek(1).value === "=") {
          const name = advance().value;
          advance();
          keywords.push({ name, value: parseExpression() });
        } else {
          args.push(parseExpression());
        }
        /* Una expresión generadora, sum(n for n in datos), no está disponible:
           conviene decirlo en vez de dejar un “esperaba )” sin explicación. */
        if (at("KEYWORD", "for")) {
          throw pyError("Las expresiones generadoras todavía no están disponibles. Escribe la lista entre corchetes: por ejemplo sum([n for n in datos]).", peek().line);
        }
        if (!eat("OP", ",")) break;
      }
      expect("OP", ")");
      return { args, keywords };
    }

    function parsePostfix() {
      let node = parseAtom();
      for (;;) {
        if (at("OP", ".")) {
          const line = advance().line;
          const attribute = expect("NAME").value;
          node = { type: "Attribute", value: node, attribute, line };
          continue;
        }
        if (at("OP", "(")) {
          const call = parseArguments();
          node = { type: "Call", func: node, args: call.args, keywords: call.keywords, line: node.line };
          continue;
        }
        if (at("OP", "[")) {
          const line = advance().line;
          let lower = at("OP", ":") ? null : parseExpression();
          if (eat("OP", ":")) {
            const upper = at("OP", "]") || at("OP", ":") ? null : parseExpression();
            let step = null;
            if (eat("OP", ":")) step = at("OP", "]") ? null : parseExpression();
            expect("OP", "]");
            node = { type: "Slice", value: node, lower, upper, step, line };
            continue;
          }
          expect("OP", "]");
          node = { type: "Subscript", value: node, index: lower, line };
          continue;
        }
        return node;
      }
    }

    function parseAtom() {
      const token = peek();
      if (token.type === "NUMBER") { advance(); return { type: "Num", value: token.value, isFloat: token.isFloat, line: token.line }; }
      if (token.type === "STRING") {
        advance();
        let value = token.value;
        while (at("STRING")) value += advance().value;
        return { type: "Str", value, line: token.line };
      }
      if (token.type === "FSTRING") {
        advance();
        const parts = token.parts.map((part) => {
          if (part.type === "text") return part;
          const inner = parse(tokenize(part.source));
          const statement = inner.body[0];
          if (!statement || statement.type !== "ExpressionStatement") {
            throw pyError("La expresión dentro de la f-string no es válida.", token.line);
          }
          return { type: "expression", node: statement.value, spec: part.spec };
        });
        return { type: "FString", parts, line: token.line };
      }
      if (token.type === "KEYWORD" && ["True", "False", "None"].includes(token.value)) {
        advance();
        const value = token.value === "True" ? true : token.value === "False" ? false : null;
        return { type: "Constant", value, line: token.line };
      }
      if (token.type === "NAME") { advance(); return { type: "Name", id: token.value, line: token.line }; }
      if (token.type === "OP" && token.value === "[") {
        advance();
        if (at("OP", "]")) { advance(); return { type: "List", elements: [], line: token.line }; }
        const first = parseExpression();
        if (at("KEYWORD", "for")) {
          advance();
          const target = parseTargetList();
          expect("KEYWORD", "in");
          const iterable = parseOr();
          const condition = eat("KEYWORD", "if") ? parseOr() : null;
          expect("OP", "]");
          return { type: "ListComp", element: first, target, iterable, condition, line: token.line };
        }
        const elements = [first];
        while (eat("OP", ",")) {
          if (at("OP", "]")) break;
          elements.push(parseExpression());
        }
        expect("OP", "]");
        return { type: "List", elements, line: token.line };
      }
      if (token.type === "OP" && token.value === "{") {
        advance();
        if (at("OP", "}")) { advance(); return { type: "Dict", pairs: [], line: token.line }; }
        const first = parseExpression();
        if (eat("OP", ":")) {
          const firstValue = parseExpression();
          if (at("KEYWORD", "for")) {
            advance();
            const target = parseTargetList();
            expect("KEYWORD", "in");
            const iterable = parseOr();
            const condition = eat("KEYWORD", "if") ? parseOr() : null;
            expect("OP", "}");
            return { type: "DictComp", key: first, value: firstValue, target, iterable, condition, line: token.line };
          }
          const pairs = [{ key: first, value: firstValue }];
          while (eat("OP", ",")) {
            if (at("OP", "}")) break;
            const key = parseExpression();
            expect("OP", ":");
            pairs.push({ key, value: parseExpression() });
          }
          expect("OP", "}");
          return { type: "Dict", pairs, line: token.line };
        }
        /* Sin dos puntos, las llaves forman un conjunto: {1, 2} o {n for n in datos}. */
        if (at("KEYWORD", "for")) {
          advance();
          const target = parseTargetList();
          expect("KEYWORD", "in");
          const iterable = parseOr();
          const condition = eat("KEYWORD", "if") ? parseOr() : null;
          expect("OP", "}");
          return { type: "SetComp", element: first, target, iterable, condition, line: token.line };
        }
        const elements = [first];
        while (eat("OP", ",")) {
          if (at("OP", "}")) break;
          elements.push(parseExpression());
        }
        expect("OP", "}");
        return { type: "Set", elements, line: token.line };
      }
      if (token.type === "OP" && token.value === "(") {
        advance();
        if (at("OP", ")")) { advance(); return { type: "Tuple", elements: [], line: token.line }; }
        const first = parseExpression();
        if (at("OP", ",")) {
          const elements = [first];
          while (eat("OP", ",")) {
            if (at("OP", ")")) break;
            elements.push(parseExpression());
          }
          expect("OP", ")");
          return { type: "Tuple", elements, line: token.line };
        }
        expect("OP", ")");
        return first;
      }
      if (token.type === "KEYWORD") {
        throw pyError("La palabra “" + token.value + "” todavía no está disponible en el laboratorio.", token.line);
      }
      throw pyError("No entiendo esta parte del código: “" + (token.value ?? token.type) + "”.", token.line);
    }

    const body = [];
    while (!at("EOF")) {
      if (eat("NEWLINE")) continue;
      body.push(parseStatement());
    }
    return { type: "Module", body };
  }

  /* ========================= Valores ========================= */

  class PyFloat {
    constructor(value) { this.value = value; }
  }

  class PyTuple {
    constructor(items) { this.items = items; }
  }

  class PyRange {
    constructor(start, stop, step) {
      this.start = start;
      this.stop = stop;
      this.step = step;
      this.items = [];
      if (step === 0) throw raisePy("ValueError", "range() no acepta un paso de 0.");
      for (let value = start; step > 0 ? value < stop : value > stop; value += step) {
        this.items.push(value);
        if (this.items.length > 100000) throw pyError("El rango es demasiado grande para el laboratorio.");
      }
    }
  }

  /* Un conjunto real de Python no garantiza ningún orden al recorrerlo. Aquí se
     conserva el orden de inserción para que la salida sea reproducible; el curso
     insiste en usar sorted() antes de mostrar un conjunto, que es lo correcto
     también con CPython. */
  class PySet {
    constructor(items) {
      this.items = [];
      for (const item of items || []) this.add(item);
    }
    add(item) {
      if (!this.items.some((existing) => pyEquals(existing, item))) this.items.push(item);
      return null;
    }
    has(item) { return this.items.some((existing) => pyEquals(existing, item)); }
    discard(item) {
      const index = this.items.findIndex((existing) => pyEquals(existing, item));
      if (index >= 0) this.items.splice(index, 1);
      return null;
    }
  }

  class PyFunction {
    constructor(name, params, body, scope) {
      this.name = name;
      this.params = params;
      this.body = body;
      this.scope = scope;
    }
  }

  function raisePy(name, message) {
    const error = new Error(message);
    error.friendly = true;
    error.pyName = name;
    return error;
  }

  const isFloat = (value) => value instanceof PyFloat;
  const isInt = (value) => typeof value === "number";
  const isNumber = (value) => isInt(value) || isFloat(value);
  const numberOf = (value) => (isFloat(value) ? value.value : value);
  const makeFloat = (value) => new PyFloat(value);
  const makeNumber = (value, asFloat) => (asFloat ? new PyFloat(value) : Math.trunc(value));

  function typeName(value) {
    if (value === null) return "None";
    if (typeof value === "boolean") return "bool";
    if (isInt(value)) return "int";
    if (isFloat(value)) return "float";
    if (typeof value === "string") return "str";
    if (Array.isArray(value)) return "list";
    if (value instanceof Map) return "dict";
    if (value instanceof PyTuple) return "tuple";
    if (value instanceof PyRange) return "range";
    if (value instanceof PySet) return "set";
    if (value instanceof PyFunction || typeof value === "function") return "function";
    return "objeto";
  }

  function roundDecimalString(value, digits) {
    if (!Number.isFinite(value)) return String(value);
    const negative = value < 0 || Object.is(value, -0);
    const expanded = Math.abs(value).toFixed(Math.min(100, digits + 25));
    const [whole, fraction = ""] = expanded.split(".");
    const keep = fraction.slice(0, digits);
    const rest = fraction.slice(digits);
    let digitsArray = (whole + keep).split("");
    const firstRest = rest[0] || "0";
    const restTail = rest.slice(1).replace(/0+$/, "");
    let roundUp = false;
    if (firstRest > "5") roundUp = true;
    else if (firstRest === "5") {
      if (restTail) roundUp = true;
      else roundUp = Number(digitsArray[digitsArray.length - 1] || "0") % 2 === 1;
    }
    if (roundUp) {
      let index = digitsArray.length - 1;
      while (index >= 0) {
        if (digitsArray[index] === "9") { digitsArray[index] = "0"; index -= 1; continue; }
        digitsArray[index] = String(Number(digitsArray[index]) + 1);
        break;
      }
      if (index < 0) digitsArray = ["1"].concat(digitsArray);
    }
    const text = digitsArray.join("");
    const cut = text.length - digits;
    const wholePart = (text.slice(0, cut) || "0").replace(/^0+(?=\d)/, "");
    const fractionPart = text.slice(cut);
    const sign = negative && /[1-9]/.test(text) ? "-" : negative && digits === 0 && wholePart === "0" ? "-" : negative ? "-" : "";
    return sign + wholePart + (digits > 0 ? "." + fractionPart : "");
  }

  function roundDecimal(value, digits) {
    return Number(roundDecimalString(value, digits));
  }

  function formatFloat(value) {
    if (!Number.isFinite(value)) return value > 0 ? "inf" : Number.isNaN(value) ? "nan" : "-inf";
    if (Number.isInteger(value) && Math.abs(value) < 1e16) return value.toFixed(1);
    return String(value);
  }

  function pyStr(value) {
    if (value === null) return "None";
    if (value === true) return "True";
    if (value === false) return "False";
    if (isInt(value)) return String(value);
    if (isFloat(value)) return formatFloat(value.value);
    if (typeof value === "string") return value;
    if (Array.isArray(value)) return "[" + value.map(pyRepr).join(", ") + "]";
    if (value instanceof PyTuple) {
      if (value.items.length === 1) return "(" + pyRepr(value.items[0]) + ",)";
      return "(" + value.items.map(pyRepr).join(", ") + ")";
    }
    if (value instanceof Map) {
      return "{" + [...value.entries()].map(([key, item]) => pyRepr(key) + ": " + pyRepr(item)).join(", ") + "}";
    }
    if (value instanceof PySet) return value.items.length === 0 ? "set()" : "{" + value.items.map(pyRepr).join(", ") + "}";
    if (value instanceof PyRange) return "range(" + value.start + ", " + value.stop + (value.step === 1 ? "" : ", " + value.step) + ")";
    if (value instanceof PyFunction) return "<function " + value.name + ">";
    if (typeof value === "function") return "<built-in function " + (value.pyName || "") + ">";
    return String(value);
  }

  function pyRepr(value) {
    if (typeof value === "string") {
      const quote = value.includes("'") && !value.includes('"') ? '"' : "'";
      return quote + value.replace(/\\/g, "\\\\").replace(new RegExp(quote, "g"), "\\" + quote) + quote;
    }
    return pyStr(value);
  }

  function truthy(value) {
    if (value === null || value === false) return false;
    if (value === true) return true;
    if (isNumber(value)) return numberOf(value) !== 0;
    if (typeof value === "string") return value.length > 0;
    if (Array.isArray(value)) return value.length > 0;
    if (value instanceof PyTuple) return value.items.length > 0;
    if (value instanceof Map) return value.size > 0;
    if (value instanceof PyRange) return value.items.length > 0;
    if (value instanceof PySet) return value.items.length > 0;
    return true;
  }

  function pyEquals(left, right) {
    if (isNumber(left) && isNumber(right)) return numberOf(left) === numberOf(right);
    if (typeof left === "boolean" || typeof right === "boolean") {
      if (isNumber(left) || isNumber(right)) return Number(left === true ? 1 : left === false ? 0 : numberOf(left))
        === Number(right === true ? 1 : right === false ? 0 : numberOf(right));
    }
    if (typeof left === "string" && typeof right === "string") return left === right;
    if (Array.isArray(left) && Array.isArray(right)) {
      return left.length === right.length && left.every((item, index) => pyEquals(item, right[index]));
    }
    if (left instanceof PyTuple && right instanceof PyTuple) {
      return left.items.length === right.items.length && left.items.every((item, index) => pyEquals(item, right.items[index]));
    }
    if (left instanceof PySet && right instanceof PySet) {
      return left.items.length === right.items.length && left.items.every((item) => right.has(item));
    }
    if (left instanceof Map && right instanceof Map) {
      if (left.size !== right.size) return false;
      for (const [key, value] of left) {
        if (!right.has(key) || !pyEquals(value, right.get(key))) return false;
      }
      return true;
    }
    return left === right;
  }

  function compareValues(left, right, operator) {
    if (isNumber(left) && isNumber(right)) {
      const a = numberOf(left);
      const b = numberOf(right);
      return operator === "<" ? a < b : operator === "<=" ? a <= b : operator === ">" ? a > b : a >= b;
    }
    if (typeof left === "string" && typeof right === "string") {
      const comparison = left < right ? -1 : left > right ? 1 : 0;
      return operator === "<" ? comparison < 0 : operator === "<=" ? comparison <= 0
        : operator === ">" ? comparison > 0 : comparison >= 0;
    }
    const leftItems = Array.isArray(left) ? left : left instanceof PyTuple ? left.items : null;
    const rightItems = Array.isArray(right) ? right : right instanceof PyTuple ? right.items : null;
    if (leftItems && rightItems && Array.isArray(left) === Array.isArray(right)) {
      /* Orden lexicográfico, igual que CPython: manda el primer elemento distinto
         y, si uno es prefijo del otro, decide la cantidad de elementos. */
      const shared = Math.min(leftItems.length, rightItems.length);
      for (let index = 0; index < shared; index += 1) {
        if (pyEquals(leftItems[index], rightItems[index])) continue;
        return compareValues(leftItems[index], rightItems[index], operator);
      }
      const difference = leftItems.length - rightItems.length;
      return operator === "<" ? difference < 0 : operator === "<=" ? difference <= 0
        : operator === ">" ? difference > 0 : difference >= 0;
    }
    throw raisePy("TypeError", "No puedo comparar " + typeName(left) + " con " + typeName(right) + " usando " + operator + ".");
  }

  function iterableOf(value) {
    if (Array.isArray(value)) return value;
    if (typeof value === "string") return [...value];
    if (value instanceof PyTuple) return value.items;
    if (value instanceof PyRange) return value.items;
    if (value instanceof PySet) return value.items;
    if (value instanceof Map) return [...value.keys()];
    throw raisePy("TypeError", "El valor de tipo " + typeName(value) + " no se puede recorrer.");
  }

  function containerLength(value) {
    if (typeof value === "string") return value.length;
    if (Array.isArray(value)) return value.length;
    if (value instanceof PyTuple) return value.items.length;
    if (value instanceof Map) return value.size;
    if (value instanceof PyRange) return value.items.length;
    if (value instanceof PySet) return value.items.length;
    throw raisePy("TypeError", "len() no funciona con un valor de tipo " + typeName(value) + ".");
  }

  function normalizeIndex(index, length, container) {
    const position = index < 0 ? length + index : index;
    if (position < 0 || position >= length) {
      throw raisePy("IndexError", "La posición " + index + " está fuera de " + container + " de largo " + length + ".");
    }
    return position;
  }

  function applyBinary(operator, left, right, line) {
    if (operator === "+") {
      if (typeof left === "string" && typeof right === "string") return left + right;
      if (Array.isArray(left) && Array.isArray(right)) return [...left, ...right];
      if (left instanceof PyTuple && right instanceof PyTuple) return new PyTuple([...left.items, ...right.items]);
      if (typeof left === "string" || typeof right === "string") {
        throw raisePy("TypeError", "No puedes unir " + typeName(left) + " con " + typeName(right) + ". Convierte el número con str().");
      }
    }
    if (operator === "*") {
      if (typeof left === "string" && isInt(right)) return right > 0 ? left.repeat(Math.min(right, 10000)) : "";
      if (isInt(left) && typeof right === "string") return left > 0 ? right.repeat(Math.min(left, 10000)) : "";
      if (Array.isArray(left) && isInt(right)) {
        const result = [];
        for (let index = 0; index < right && result.length < 100000; index += 1) result.push(...left);
        return result;
      }
    }
    if (!isNumber(left) || !isNumber(right)) {
      if (typeof left === "boolean" || typeof right === "boolean") {
        // Los booleanos participan como 1 y 0 en la aritmética de Python.
      } else {
        throw raisePy("TypeError", "No puedo usar " + operator + " entre " + typeName(left) + " y " + typeName(right) + ".");
      }
    }
    const a = typeof left === "boolean" ? (left ? 1 : 0) : numberOf(left);
    const b = typeof right === "boolean" ? (right ? 1 : 0) : numberOf(right);
    const asFloat = isFloat(left) || isFloat(right);
    if (operator === "+") return makeNumber(a + b, asFloat);
    if (operator === "-") return makeNumber(a - b, asFloat);
    if (operator === "*") return makeNumber(a * b, asFloat);
    if (operator === "/") {
      if (b === 0) throw raisePy("ZeroDivisionError", "No es posible dividir por cero.");
      return makeFloat(a / b);
    }
    if (operator === "//") {
      if (b === 0) throw raisePy("ZeroDivisionError", "No es posible dividir por cero.");
      const value = Math.floor(a / b);
      return asFloat ? makeFloat(value) : value;
    }
    if (operator === "%") {
      if (b === 0) throw raisePy("ZeroDivisionError", "No es posible calcular el resto de una división por cero.");
      const value = a - Math.floor(a / b) * b;
      return asFloat ? makeFloat(value) : value;
    }
    if (operator === "**") {
      const value = Math.pow(a, b);
      return makeNumber(value, asFloat || (b < 0 && !Number.isInteger(value)) || !Number.isInteger(value));
    }
    throw pyError("Operador no disponible: " + operator, line);
  }

  function membership(item, container) {
    if (typeof container === "string") {
      if (typeof item !== "string") throw raisePy("TypeError", "Para buscar dentro de un texto necesitas otro texto.");
      return container.includes(item);
    }
    if (container instanceof Map) {
      for (const key of container.keys()) if (pyEquals(key, item)) return true;
      return false;
    }
    return iterableOf(container).some((value) => pyEquals(value, item));
  }

  /* Subconjunto de la mini-especificación de formato: [relleno][alineación][0][ancho][,][.precisión][f|d|s].
     Cubre lo necesario para alinear columnas y mostrar montos; lo que no entra se rechaza con un aviso. */
  function formatWithSpec(value, spec) {
    if (!spec) return pyStr(value);
    const match = spec.match(/^(?:([^<>^])?([<>^]))?(0)?(\d+)?(,)?(?:\.(\d+))?([fds])?$/);
    if (!match) throw pyError("El formato “" + spec + "” todavía no está disponible en el laboratorio.");
    const fillCharacter = match[1];
    const align = match[2];
    const zeroPadded = Boolean(match[3]);
    const width = match[4] ? Number(match[4]) : 0;
    const thousands = Boolean(match[5]);
    const precision = match[6] === undefined ? null : Number(match[6]);
    const kind = match[7] || "";
    const numeric = isNumber(value) || typeof value === "boolean";

    let text;
    if (kind === "f" || (precision !== null && numeric && kind !== "s")) {
      if (!numeric) throw raisePy("TypeError", "El formato ." + (precision ?? 6) + "f solo funciona con números.");
      text = roundDecimalString(numberOf(value), precision === null ? 6 : precision);
    } else if (kind === "d") {
      if (!isInt(value) && typeof value !== "boolean") {
        throw raisePy("TypeError", "El formato d solo funciona con números enteros.");
      }
      text = String(numberOf(value));
    } else if (precision !== null) {
      text = pyStr(value).slice(0, precision);
    } else {
      text = pyStr(value);
    }

    if (thousands) {
      if (!numeric) throw raisePy("TypeError", "El separador de miles solo funciona con números.");
      const negative = text.startsWith("-");
      const bare = negative ? text.slice(1) : text;
      const parts = bare.split(".");
      text = (negative ? "-" : "") + parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        + (parts.length > 1 ? "." + parts[1] : "");
    }

    if (width > text.length) {
      const fill = fillCharacter || (zeroPadded ? "0" : " ");
      const padding = width - text.length;
      const effective = align || (zeroPadded ? ">" : numeric ? ">" : "<");
      if (effective === "<") text = text + fill.repeat(padding);
      else if (effective === "^") {
        const left = Math.floor(padding / 2);
        text = fill.repeat(left) + text + fill.repeat(padding - left);
      } else if (zeroPadded && !align && text.startsWith("-")) {
        text = "-" + fill.repeat(padding) + text.slice(1);
      } else {
        text = fill.repeat(padding) + text;
      }
    }
    return text;
  }

  /* ========================= Evaluador ========================= */

  const RETURN = "return";
  const BREAK = "break";
  const CONTINUE = "continue";

  function createScope(parent) {
    return { vars: new Map(), parent };
  }

  function lookup(scope, name, line) {
    let current = scope;
    while (current) {
      if (current.vars.has(name)) return current.vars.get(name);
      current = current.parent;
    }
    throw raisePy("NameError", "El nombre “" + name + "” no está definido todavía.");
  }

  function hasName(scope, name) {
    let current = scope;
    while (current) {
      if (current.vars.has(name)) return true;
      current = current.parent;
    }
    return false;
  }

  function getAttribute(value, name, context) {
    const methods = methodTable(value, context);
    if (methods && Object.prototype.hasOwnProperty.call(methods, name)) return methods[name];
    throw raisePy("AttributeError", "El tipo " + typeName(value) + " no tiene el método “" + name + "”.");
  }

  function evaluate(node, scope, context) {
    context.tick();
    if (node.line) context.line = node.line;
    switch (node.type) {
      case "Num": return node.isFloat ? makeFloat(node.value) : node.value;
      case "Str": return node.value;
      case "Constant": return node.value;
      case "Name": return lookup(scope, node.id, node.line);
      case "FString": return node.parts.map((part) => (part.type === "text"
        ? part.value
        : formatWithSpec(evaluate(part.node, scope, context), part.spec))).join("");
      case "List": return node.elements.map((element) => evaluate(element, scope, context));
      case "Tuple": return new PyTuple(node.elements.map((element) => evaluate(element, scope, context)));
      case "Dict": {
        const result = new Map();
        for (const pair of node.pairs) {
          const key = evaluate(pair.key, scope, context);
          result.set(normalizeKey(key), evaluate(pair.value, scope, context));
        }
        return result;
      }
      case "UnaryOp": {
        const value = evaluate(node.operand, scope, context);
        if (!isNumber(value) && typeof value !== "boolean") {
          throw raisePy("TypeError", "No puedo aplicar " + node.operator + " a un valor de tipo " + typeName(value) + ".");
        }
        const raw = typeof value === "boolean" ? (value ? 1 : 0) : numberOf(value);
        return makeNumber(node.operator === "-" ? -raw : raw, isFloat(value));
      }
      case "Not": return !truthy(evaluate(node.operand, scope, context));
      case "IfExp": return truthy(evaluate(node.test, scope, context))
        ? evaluate(node.body, scope, context)
        : evaluate(node.orelse, scope, context);
      case "ListComp": {
        const items = iterableOf(evaluate(node.iterable, scope, context));
        const result = [];
        for (const item of items) {
          const inner = createScope(scope);
          assign(node.target, item, inner, context);
          if (node.condition && !truthy(evaluate(node.condition, inner, context))) continue;
          result.push(evaluate(node.element, inner, context));
        }
        return result;
      }
      case "SetComp": {
        const items = iterableOf(evaluate(node.iterable, scope, context));
        const result = new PySet([]);
        for (const item of items) {
          const inner = createScope(scope);
          assign(node.target, item, inner, context);
          if (node.condition && !truthy(evaluate(node.condition, inner, context))) continue;
          result.add(evaluate(node.element, inner, context));
        }
        return result;
      }
      case "DictComp": {
        const items = iterableOf(evaluate(node.iterable, scope, context));
        const result = new Map();
        for (const item of items) {
          const inner = createScope(scope);
          assign(node.target, item, inner, context);
          if (node.condition && !truthy(evaluate(node.condition, inner, context))) continue;
          result.set(normalizeKey(evaluate(node.key, inner, context)), evaluate(node.value, inner, context));
        }
        return result;
      }
      case "Set": return new PySet(node.elements.map((element) => evaluate(element, scope, context)));
      case "Lambda": return new PyFunction("<lambda>", node.params, [{ type: "Return", value: node.body }], scope);
      case "BoolOp": {
        const left = evaluate(node.left, scope, context);
        if (node.operator === "and") return truthy(left) ? evaluate(node.right, scope, context) : left;
        return truthy(left) ? left : evaluate(node.right, scope, context);
      }
      case "BinOp": return applyBinary(
        node.operator,
        evaluate(node.left, scope, context),
        evaluate(node.right, scope, context),
        node.line
      );
      case "Compare": {
        let left = evaluate(node.left, scope, context);
        for (const operation of node.operations) {
          const right = evaluate(operation.right, scope, context);
          let result;
          if (operation.operator === "==") result = pyEquals(left, right);
          else if (operation.operator === "!=") result = !pyEquals(left, right);
          else if (operation.operator === "in") result = membership(left, right);
          else if (operation.operator === "not in") result = !membership(left, right);
          else if (operation.operator === "is") result = left === right || (left === null && right === null);
          else if (operation.operator === "is not") result = !(left === right || (left === null && right === null));
          else result = compareValues(left, right, operation.operator);
          if (!result) return false;
          left = right;
        }
        return true;
      }
      case "Attribute": return getAttribute(evaluate(node.value, scope, context), node.attribute, context);
      case "Subscript": {
        const target = evaluate(node.value, scope, context);
        const index = evaluate(node.index, scope, context);
        if (target instanceof Map) {
          const key = normalizeKey(index);
          for (const [existing, value] of target) if (pyEquals(existing, key)) return value;
          throw raisePy("KeyError", "La clave " + pyRepr(index) + " no existe en el diccionario.");
        }
        if (!isInt(index) && typeof index !== "boolean") {
          throw raisePy("TypeError", "Las posiciones deben ser números enteros.");
        }
        const position = Number(index);
        if (typeof target === "string") return target[normalizeIndex(position, target.length, "el texto")];
        if (Array.isArray(target)) return target[normalizeIndex(position, target.length, "la lista")];
        if (target instanceof PyTuple) return target.items[normalizeIndex(position, target.items.length, "la tupla")];
        if (target instanceof PyRange) return target.items[normalizeIndex(position, target.items.length, "el rango")];
        throw raisePy("TypeError", "El tipo " + typeName(target) + " no admite posiciones con corchetes.");
      }
      case "Slice": {
        const target = evaluate(node.value, scope, context);
        const items = typeof target === "string" ? [...target] : Array.isArray(target) ? target
          : target instanceof PyTuple ? target.items : target instanceof PyRange ? target.items : null;
        if (!items) throw raisePy("TypeError", "El tipo " + typeName(target) + " no admite rebanadas.");
        const readBound = (bound, fallback) => {
          if (bound === null) return fallback;
          const value = evaluate(bound, scope, context);
          if (!isInt(value)) throw raisePy("TypeError", "Los límites de una rebanada deben ser enteros.");
          return value;
        };
        const step = node.step === null ? 1 : readBound(node.step, 1);
        if (step === 0) throw raisePy("ValueError", "El paso de una rebanada no puede ser 0.");
        const length = items.length;
        let start = readBound(node.lower, step > 0 ? 0 : length - 1);
        let stop = readBound(node.upper, step > 0 ? length : -length - 1);
        if (start < 0) start += length;
        if (stop < 0 && node.upper !== null) stop += length;
        const result = [];
        if (step > 0) {
          for (let index = Math.max(0, start); index < Math.min(length, stop); index += step) result.push(items[index]);
        } else {
          for (let index = Math.min(length - 1, start); index > Math.max(-1, stop); index += step) result.push(items[index]);
        }
        if (typeof target === "string") return result.join("");
        if (target instanceof PyTuple) return new PyTuple(result);
        return result;
      }
      case "Call": {
        const args = node.args.map((argument) => evaluate(argument, scope, context));
        const keywords = {};
        for (const keyword of node.keywords) keywords[keyword.name] = evaluate(keyword.value, scope, context);
        const callee = evaluate(node.func, scope, context);
        return callValue(callee, args, keywords, context, node.line);
      }
      default: throw pyError("Todavía no puedo evaluar esta expresión.", node.line);
    }
  }

  function normalizeKey(key) {
    if (isFloat(key) && Number.isInteger(key.value)) return key.value;
    return key;
  }

  function callValue(callee, args, keywords, context, line) {
    if (typeof callee === "function") return callee(args, keywords || {}, context, line);
    if (!(callee instanceof PyFunction)) {
      throw raisePy("TypeError", "El valor de tipo " + typeName(callee) + " no se puede llamar como función.");
    }
    context.depth += 1;
    if (context.depth > MAX_DEPTH) {
      context.depth -= 1;
      throw raisePy("RecursionError", "La función se llamó a sí misma demasiadas veces.");
    }
    const scope = createScope(callee.scope);
    const used = new Set();
    callee.params.forEach((param, index) => {
      let value;
      if (index < args.length) value = args[index];
      else if (Object.prototype.hasOwnProperty.call(keywords || {}, param.name)) value = keywords[param.name];
      else if (param.fallback) value = evaluate(param.fallback, scope, context);
      else {
        context.depth -= 1;
        throw raisePy("TypeError", "A la función " + callee.name + "() le falta el argumento “" + param.name + "”.");
      }
      used.add(param.name);
      scope.vars.set(param.name, value);
    });
    if (args.length > callee.params.length) {
      context.depth -= 1;
      throw raisePy("TypeError", "La función " + callee.name + "() recibe " + callee.params.length
        + " argumento(s) y le enviaste " + args.length + ".");
    }
    for (const name of Object.keys(keywords || {})) {
      if (!used.has(name)) {
        context.depth -= 1;
        throw raisePy("TypeError", "La función " + callee.name + "() no tiene un parámetro llamado “" + name + "”.");
      }
    }
    const signal = executeBlock(callee.body, scope, context);
    context.depth -= 1;
    return signal && signal.type === RETURN ? signal.value : null;
  }

  function assign(target, value, scope, context) {
    if (target.type === "Name") { scope.vars.set(target.id, value); return; }
    if (target.type === "Tuple" || target.type === "TupleTarget") {
      const items = value instanceof PyTuple ? value.items : Array.isArray(value) ? value : iterableOf(value);
      if (items.length !== target.elements.length) {
        throw raisePy("ValueError", "Esperaba " + target.elements.length + " valores para repartir y recibí " + items.length + ".");
      }
      target.elements.forEach((element, index) => assign(element, items[index], scope, context));
      return;
    }
    if (target.type === "Subscript") {
      const container = evaluate(target.value, scope, context);
      const index = evaluate(target.index, scope, context);
      if (container instanceof Map) {
        const key = normalizeKey(index);
        for (const existing of container.keys()) {
          if (pyEquals(existing, key)) { container.set(existing, value); return; }
        }
        container.set(key, value);
        return;
      }
      if (Array.isArray(container)) {
        container[normalizeIndex(Number(index), container.length, "la lista")] = value;
        return;
      }
      throw raisePy("TypeError", "No puedo cambiar un elemento dentro de " + typeName(container) + ".");
    }
    throw pyError("No puedo asignar un valor a esa expresión.", target.line);
  }

  function executeBlock(statements, scope, context) {
    for (const statement of statements) {
      const signal = execute(statement, scope, context);
      if (signal) return signal;
    }
    return null;
  }

  function execute(node, scope, context) {
    context.tick();
    if (node.line) context.line = node.line;
    switch (node.type) {
      case "ExpressionStatement": evaluate(node.value, scope, context); return null;
      case "Assign": {
        const value = evaluate(node.value, scope, context);
        for (const target of node.targets) assign(target, value, scope, context);
        return null;
      }
      case "AugAssign": {
        const current = evaluate(node.target, scope, context);
        const value = applyBinary(node.operator, current, evaluate(node.value, scope, context), node.line);
        assign(node.target, value, scope, context);
        return null;
      }
      case "If": {
        if (truthy(evaluate(node.test, scope, context))) return executeBlock(node.body, scope, context);
        return executeBlock(node.orelse, scope, context);
      }
      case "While": {
        let rounds = 0;
        while (truthy(evaluate(node.test, scope, context))) {
          rounds += 1;
          if (rounds > 100000) throw pyError("El ciclo while no termina. Revisa la condición.", node.line);
          const signal = executeBlock(node.body, scope, context);
          if (signal && signal.type === BREAK) break;
          if (signal && signal.type === RETURN) return signal;
        }
        return null;
      }
      case "For": {
        const items = iterableOf(evaluate(node.iterable, scope, context));
        for (const item of items) {
          assign(node.target, item, scope, context);
          const signal = executeBlock(node.body, scope, context);
          if (signal && signal.type === BREAK) break;
          if (signal && signal.type === RETURN) return signal;
        }
        return null;
      }
      case "FunctionDef": {
        scope.vars.set(node.name, new PyFunction(node.name, node.params, node.body, scope));
        return null;
      }
      case "Return": return { type: RETURN, value: node.value ? evaluate(node.value, scope, context) : null };
      case "Break": return { type: BREAK };
      case "Continue": return { type: CONTINUE };
      case "Pass": return null;
      case "Delete": {
        if (node.target.type === "Name") { scope.vars.delete(node.target.id); return null; }
        const container = evaluate(node.target.value, scope, context);
        const index = evaluate(node.target.index, scope, context);
        if (container instanceof Map) {
          for (const key of container.keys()) if (pyEquals(key, index)) { container.delete(key); return null; }
          throw raisePy("KeyError", "La clave " + pyRepr(index) + " no existe en el diccionario.");
        }
        if (Array.isArray(container)) {
          container.splice(normalizeIndex(Number(index), container.length, "la lista"), 1);
          return null;
        }
        throw raisePy("TypeError", "No puedo borrar dentro de " + typeName(container) + ".");
      }
      case "Raise": {
        const value = node.value ? evaluate(node.value, scope, context) : null;
        if (value && value.pyException) throw raisePy(value.pyException, value.message || "El programa lanzó " + value.pyException + ".");
        if (typeof value === "function" && value.pyException) throw raisePy(value.pyException, "El programa lanzó " + value.pyException + ".");
        throw raisePy("Exception", value === null ? "El programa lanzó un error." : pyStr(value));
      }
      case "Try": {
        let signal = null;
        try {
          signal = executeBlock(node.body, scope, context);
        } catch (error) {
          if (!error.pyName) throw error;
          const handler = node.handlers.find((item) => !item.errorName || item.errorName === error.pyName || item.errorName === "Exception");
          if (!handler) {
            if (node.finalBody.length) executeBlock(node.finalBody, scope, context);
            throw error;
          }
          signal = executeBlock(handler.body, scope, context);
        }
        if (node.finalBody.length) {
          const finalSignal = executeBlock(node.finalBody, scope, context);
          if (finalSignal) return finalSignal;
        }
        return signal;
      }
      default: throw pyError("Todavía no puedo ejecutar esta instrucción.", node.line);
    }
  }

  /* ========================= Funciones incorporadas ========================= */

  function expectArgs(name, args, min, max) {
    if (args.length < min || args.length > max) {
      throw raisePy("TypeError", name + "() recibe entre " + min + " y " + max + " argumento(s).");
    }
  }

  function toInt(value) {
    if (typeof value === "boolean") return value ? 1 : 0;
    if (isInt(value)) return value;
    if (isFloat(value)) return Math.trunc(value.value);
    if (typeof value === "string") {
      const clean = value.trim();
      if (!/^[+-]?\d+$/.test(clean)) {
        throw raisePy("ValueError", "int() no puede convertir el texto " + pyRepr(value) + " en un número entero.");
      }
      return Number(clean);
    }
    throw raisePy("TypeError", "int() no funciona con un valor de tipo " + typeName(value) + ".");
  }

  function toFloat(value) {
    if (typeof value === "boolean") return makeFloat(value ? 1 : 0);
    if (isNumber(value)) return makeFloat(numberOf(value));
    if (typeof value === "string") {
      const clean = value.trim();
      if (!/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(clean)) {
        throw raisePy("ValueError", "float() no puede convertir el texto " + pyRepr(value) + " en un número decimal.");
      }
      return makeFloat(Number(clean));
    }
    throw raisePy("TypeError", "float() no funciona con un valor de tipo " + typeName(value) + ".");
  }

  function bankersRound(value) {
    const floor = Math.floor(value);
    const difference = value - floor;
    if (Math.abs(difference - 0.5) > Number.EPSILON * 8) return Math.round(value);
    return floor % 2 === 0 ? floor : floor + 1;
  }

  function keyReader(keywords, context) {
    const keyFunction = keywords && keywords.key !== undefined ? keywords.key : null;
    return (item) => (keyFunction ? callValue(keyFunction, [item], {}, context) : item);
  }

  function sortItems(items, keywords, context) {
    const keyFunction = keywords.key ?? null;
    const decorated = items.map((item) => ({
      item,
      key: keyFunction ? callValue(keyFunction, [item], {}, context) : item
    }));
    decorated.sort((left, right) => {
      if (pyEquals(left.key, right.key)) return 0;
      return compareValues(left.key, right.key, "<") ? -1 : 1;
    });
    if (truthy(keywords.reverse ?? false)) decorated.reverse();
    return decorated.map((entry) => entry.item);
  }

  function installBuiltins(scope, context) {
    const builtins = {
      print(args, keywords) {
        const separator = keywords.sep === undefined ? " " : pyStr(keywords.sep);
        const ending = keywords.end === undefined ? "\n" : pyStr(keywords.end);
        context.stdout += args.map(pyStr).join(separator) + ending;
        if (context.stdout.length > 40000 || (context.stdout.match(/\n/g) || []).length > MAX_OUTPUT_LINES) {
          throw pyError("El programa mostró demasiadas líneas. Revisa si un ciclo se repite de más.");
        }
        return null;
      },
      len(args) { expectArgs("len", args, 1, 1); return containerLength(args[0]); },
      range(args) {
        expectArgs("range", args, 1, 3);
        const numbers = args.map((value) => {
          if (!isInt(value) && typeof value !== "boolean") {
            throw raisePy("TypeError", "range() solo acepta números enteros.");
          }
          return Number(value);
        });
        if (numbers.length === 1) return new PyRange(0, numbers[0], 1);
        if (numbers.length === 2) return new PyRange(numbers[0], numbers[1], 1);
        return new PyRange(numbers[0], numbers[1], numbers[2]);
      },
      sum(args) {
        expectArgs("sum", args, 1, 2);
        const items = iterableOf(args[0]);
        let total = args.length === 2 ? args[1] : 0;
        for (const item of items) total = applyBinary("+", total, item);
        return total;
      },
      min(args, keywords) {
        const items = args.length === 1 ? iterableOf(args[0]) : args;
        if (items.length === 0) throw raisePy("ValueError", "min() necesita al menos un valor.");
        const keyOf = keyReader(keywords, context);
        return items.reduce((best, item) => (compareValues(keyOf(item), keyOf(best), "<") ? item : best));
      },
      max(args, keywords) {
        const items = args.length === 1 ? iterableOf(args[0]) : args;
        if (items.length === 0) throw raisePy("ValueError", "max() necesita al menos un valor.");
        const keyOf = keyReader(keywords, context);
        return items.reduce((best, item) => (compareValues(keyOf(item), keyOf(best), ">") ? item : best));
      },
      any(args) { expectArgs("any", args, 1, 1); return iterableOf(args[0]).some((item) => truthy(item)); },
      all(args) { expectArgs("all", args, 1, 1); return iterableOf(args[0]).every((item) => truthy(item)); },
      set(args) { expectArgs("set", args, 0, 1); return new PySet(args.length === 0 ? [] : iterableOf(args[0])); },
      isinstance(args) {
        expectArgs("isinstance", args, 2, 2);
        const targets = args[1] instanceof PyTuple ? args[1].items : [args[1]];
        const actual = typeName(args[0]);
        return targets.some((target) => {
          const expected = typeof target === "function" ? target.pyName : null;
          if (!expected || !["int", "float", "str", "bool", "list", "dict", "tuple", "set"].includes(expected)) {
            throw raisePy("TypeError", "isinstance() necesita un tipo como int, float, str, bool, list, dict, tuple o set.");
          }
          /* En Python bool es una subclase de int: isinstance(True, int) vale True. */
          if (expected === "int") return actual === "int" || actual === "bool";
          return actual === expected;
        });
      },
      abs(args) {
        expectArgs("abs", args, 1, 1);
        if (!isNumber(args[0]) && typeof args[0] !== "boolean") {
          throw raisePy("TypeError", "abs() necesita un número.");
        }
        return makeNumber(Math.abs(numberOf(args[0])), isFloat(args[0]));
      },
      round(args) {
        expectArgs("round", args, 1, 2);
        if (!isNumber(args[0]) && typeof args[0] !== "boolean") {
          throw raisePy("TypeError", "round() necesita un número.");
        }
        const value = numberOf(args[0]);
        if (args.length === 1) return roundDecimal(value, 0);
        const digits = Number(args[1]);
        if (!isInt(args[1])) throw raisePy("TypeError", "El segundo argumento de round() debe ser un entero.");
        const rounded = roundDecimal(value, Math.max(0, digits));
        return isFloat(args[0]) ? makeFloat(rounded) : rounded;
      },
      int(args) { expectArgs("int", args, 0, 1); return args.length === 0 ? 0 : toInt(args[0]); },
      float(args) { expectArgs("float", args, 0, 1); return args.length === 0 ? makeFloat(0) : toFloat(args[0]); },
      str(args) { expectArgs("str", args, 0, 1); return args.length === 0 ? "" : pyStr(args[0]); },
      bool(args) { expectArgs("bool", args, 0, 1); return args.length === 0 ? false : truthy(args[0]); },
      list(args) { expectArgs("list", args, 0, 1); return args.length === 0 ? [] : [...iterableOf(args[0])]; },
      tuple(args) { expectArgs("tuple", args, 0, 1); return new PyTuple(args.length === 0 ? [] : [...iterableOf(args[0])]); },
      dict(args) {
        expectArgs("dict", args, 0, 1);
        if (args.length === 0) return new Map();
        if (args[0] instanceof Map) return new Map(args[0]);
        const result = new Map();
        for (const item of iterableOf(args[0])) {
          const pair = item instanceof PyTuple ? item.items : Array.isArray(item) ? item : null;
          if (!pair || pair.length !== 2) throw raisePy("ValueError", "dict() necesita pares de clave y valor.");
          result.set(normalizeKey(pair[0]), pair[1]);
        }
        return result;
      },
      sorted(args, keywords) {
        expectArgs("sorted", args, 1, 1);
        return sortItems([...iterableOf(args[0])], keywords, context);
      },
      reversed(args) { expectArgs("reversed", args, 1, 1); return [...iterableOf(args[0])].reverse(); },
      enumerate(args, keywords) {
        expectArgs("enumerate", args, 1, 2);
        const start = args.length === 2 ? Number(args[1]) : Number(keywords.start ?? 0);
        return iterableOf(args[0]).map((item, index) => new PyTuple([start + index, item]));
      },
      zip(args) {
        const lists = args.map(iterableOf);
        const length = lists.length ? Math.min(...lists.map((list) => list.length)) : 0;
        const result = [];
        for (let index = 0; index < length; index += 1) result.push(new PyTuple(lists.map((list) => list[index])));
        return result;
      },
      type(args) {
        expectArgs("type", args, 1, 1);
        const name = typeName(args[0]);
        return { toString: () => "<class '" + name + "'>", pyTypeName: name };
      },
      input() {
        throw pyError("input() no está disponible: el laboratorio no puede pedir datos por teclado. Asigna el valor directamente en una variable.");
      },
      __placeholder() { return null; }
    };
    for (const name of ["ValueError", "TypeError", "ZeroDivisionError", "IndexError", "KeyError", "NameError", "Exception"]) {
      const build = (args) => ({ pyException: name, message: args.length ? pyStr(args[0]) : "" });
      build.pyName = name;
      build.pyException = name;
      builtins[name] = build;
    }
    delete builtins.__placeholder;
    for (const [name, fn] of Object.entries(builtins)) {
      fn.pyName = name;
      scope.vars.set(name, fn);
    }
    return new Set(Object.keys(builtins));
  }

  /* ========================= Métodos ========================= */

  function methodTable(value, context) {
    if (typeof value === "string") return stringMethods(value, context);
    if (Array.isArray(value)) return listMethods(value, context);
    if (value instanceof Map) return dictMethods(value, context);
    if (value instanceof PySet) return setMethods(value);
    return null;
  }

  function setMethods(target) {
    const otherItems = (args, name) => {
      expectArgs(name, args, 1, 1);
      return iterableOf(args[0]);
    };
    return {
      add: (args) => { expectArgs("add", args, 1, 1); return target.add(args[0]); },
      discard: (args) => { expectArgs("discard", args, 1, 1); return target.discard(args[0]); },
      remove: (args) => {
        expectArgs("remove", args, 1, 1);
        if (!target.has(args[0])) throw raisePy("KeyError", "El valor " + pyRepr(args[0]) + " no está en el conjunto.");
        return target.discard(args[0]);
      },
      union: (args) => new PySet(target.items.concat(otherItems(args, "union"))),
      intersection: (args) => {
        const other = new PySet(otherItems(args, "intersection"));
        return new PySet(target.items.filter((item) => other.has(item)));
      },
      difference: (args) => {
        const other = new PySet(otherItems(args, "difference"));
        return new PySet(target.items.filter((item) => !other.has(item)));
      },
      copy: () => new PySet(target.items),
      clear: () => { target.items.length = 0; return null; }
    };
  }

  function requireString(name, value) {
    if (typeof value !== "string") throw raisePy("TypeError", name + "() necesita un texto.");
    return value;
  }

  function stringMethods(text, context) {
    return {
      upper: () => text.toUpperCase(),
      lower: () => text.toLowerCase(),
      title: () => text.replace(/(^|[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ])([a-záéíóúüñ])/g, (_, before, letter) => before + letter.toUpperCase()),
      capitalize: () => (text ? text[0].toUpperCase() + text.slice(1).toLowerCase() : text),
      strip: (args) => (args.length ? text.replace(new RegExp("^[" + escapeClass(args[0]) + "]+|[" + escapeClass(args[0]) + "]+$", "g"), "") : text.trim()),
      lstrip: () => text.replace(/^\s+/, ""),
      rstrip: () => text.replace(/\s+$/, ""),
      split: (args) => {
        if (!args.length) return text.split(/\s+/).filter(Boolean);
        const separator = requireString("split", args[0]);
        if (!separator) throw raisePy("ValueError", "split() necesita un separador que no esté vacío.");
        return text.split(separator);
      },
      join: (args) => {
        expectArgs("join", args, 1, 1);
        const items = iterableOf(args[0]);
        for (const item of items) {
          if (typeof item !== "string") throw raisePy("TypeError", "join() necesita que todos los elementos sean texto.");
        }
        return items.join(text);
      },
      replace: (args) => {
        expectArgs("replace", args, 2, 2);
        return text.split(requireString("replace", args[0])).join(requireString("replace", args[1]));
      },
      startswith: (args) => text.startsWith(requireString("startswith", args[0])),
      endswith: (args) => text.endsWith(requireString("endswith", args[0])),
      find: (args) => text.indexOf(requireString("find", args[0])),
      count: (args) => {
        const needle = requireString("count", args[0]);
        if (!needle) return text.length + 1;
        return text.split(needle).length - 1;
      },
      isdigit: () => text.length > 0 && /^\d+$/.test(text),
      isalpha: () => text.length > 0 && /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+$/.test(text),
      isupper: () => /[A-ZÁÉÍÓÚÜÑ]/.test(text) && text === text.toUpperCase(),
      islower: () => /[a-záéíóúüñ]/.test(text) && text === text.toLowerCase()
    };
  }

  function escapeClass(value) {
    return String(value).replace(/[\\\]^-]/g, "\\$&");
  }

  function listMethods(list, context) {
    return {
      append: (args) => { expectArgs("append", args, 1, 1); list.push(args[0]); return null; },
      extend: (args) => { expectArgs("extend", args, 1, 1); list.push(...iterableOf(args[0])); return null; },
      insert: (args) => {
        expectArgs("insert", args, 2, 2);
        const position = Number(args[0]);
        list.splice(position < 0 ? Math.max(0, list.length + position) : Math.min(position, list.length), 0, args[1]);
        return null;
      },
      pop: (args) => {
        if (list.length === 0) throw raisePy("IndexError", "No puedes sacar elementos de una lista vacía.");
        if (!args.length) return list.pop();
        return list.splice(normalizeIndex(Number(args[0]), list.length, "la lista"), 1)[0];
      },
      remove: (args) => {
        expectArgs("remove", args, 1, 1);
        const index = list.findIndex((item) => pyEquals(item, args[0]));
        if (index < 0) throw raisePy("ValueError", "El valor " + pyRepr(args[0]) + " no está en la lista.");
        list.splice(index, 1);
        return null;
      },
      sort: (args, keywords) => {
        const sorted = sortItems([...list], keywords || {}, context);
        list.length = 0;
        list.push(...sorted);
        return null;
      },
      reverse: () => { list.reverse(); return null; },
      count: (args) => list.filter((item) => pyEquals(item, args[0])).length,
      index: (args) => {
        const index = list.findIndex((item) => pyEquals(item, args[0]));
        if (index < 0) throw raisePy("ValueError", "El valor " + pyRepr(args[0]) + " no está en la lista.");
        return index;
      },
      clear: () => { list.length = 0; return null; },
      copy: () => [...list]
    };
  }

  function dictMethods(map, context) {
    const findKey = (key) => {
      const normalized = normalizeKey(key);
      for (const existing of map.keys()) if (pyEquals(existing, normalized)) return existing;
      return undefined;
    };
    return {
      keys: () => [...map.keys()],
      values: () => [...map.values()],
      items: () => [...map.entries()].map(([key, value]) => new PyTuple([key, value])),
      get: (args) => {
        expectArgs("get", args, 1, 2);
        const key = findKey(args[0]);
        if (key === undefined) return args.length === 2 ? args[1] : null;
        return map.get(key);
      },
      pop: (args) => {
        expectArgs("pop", args, 1, 2);
        const key = findKey(args[0]);
        if (key === undefined) {
          if (args.length === 2) return args[1];
          throw raisePy("KeyError", "La clave " + pyRepr(args[0]) + " no existe en el diccionario.");
        }
        const value = map.get(key);
        map.delete(key);
        return value;
      },
      update: (args) => {
        expectArgs("update", args, 1, 1);
        if (!(args[0] instanceof Map)) throw raisePy("TypeError", "update() necesita otro diccionario.");
        for (const [key, value] of args[0]) map.set(normalizeKey(key), value);
        return null;
      },
      setdefault: (args) => {
        expectArgs("setdefault", args, 1, 2);
        const key = findKey(args[0]);
        if (key !== undefined) return map.get(key);
        const fallback = args.length === 2 ? args[1] : null;
        map.set(normalizeKey(args[0]), fallback);
        return fallback;
      },
      clear: () => { map.clear(); return null; },
      copy: () => new Map(map)
    };
  }

  /* ========================= Ejecución ========================= */

  function toPlain(value) {
    if (isFloat(value)) return value.value;
    if (value instanceof PyTuple) return value.items.map(toPlain);
    if (value instanceof PyRange) return value.items.slice();
    if (value instanceof PySet) return value.items.map(toPlain);
    if (Array.isArray(value)) return value.map(toPlain);
    if (value instanceof Map) {
      const result = {};
      for (const [key, item] of value) result[typeof key === "string" ? key : pyStr(key)] = toPlain(item);
      return result;
    }
    if (value instanceof PyFunction) return "<function " + value.name + ">";
    if (typeof value === "function") return "<built-in " + (value.pyName || "") + ">";
    return value;
  }

  function describeError(error, fallbackLine) {
    if (!error || (!error.friendly && !error.pyName)) {
      return "No pude ejecutar el programa. Revisa la sintaxis de Python usada en el laboratorio.";
    }
    const line = error.line ?? fallbackLine;
    const name = error.pyName && error.pyName !== "Error" ? error.pyName + ": " : "";
    return (line ? "Línea " + line + " · " : "") + name + error.message;
  }

  function run(source) {
    const context = {
      steps: 0,
      depth: 0,
      line: 0,
      stdout: "",
      tick() {
        this.steps += 1;
        if (this.steps > MAX_STEPS) {
          throw pyError("El programa hizo demasiadas operaciones. Revisa si un ciclo nunca termina.");
        }
      }
    };
    const globals = createScope(null);
    const builtinNames = installBuiltins(globals, context);

    const finish = (errorMessage) => {
      const raw = context.stdout;
      const output = raw === "" ? [] : raw.split("\n");
      if (raw.endsWith("\n")) output.pop();
      const environment = {};
      for (const [name, value] of globals.vars) {
        if (builtinNames.has(name)) continue;
        environment[name] = toPlain(value);
      }
      return { output, text: output.join("\n"), error: errorMessage, environment };
    };

    try {
      const tree = parse(tokenize(source));
      executeBlock(tree.body, globals, context);
    } catch (error) {
      return finish(describeError(error, context.line));
    }
    return finish(null);
  }

  globalThis.PythonRuntime = { run };
})();
