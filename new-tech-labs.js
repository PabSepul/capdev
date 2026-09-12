(() => {
  "use strict";

  const cleanLines = code => String(code).split(/\r?\n/).map(line => line.trim()).filter(line => line && !line.startsWith("#"));

  function runDocker(code, scenario = {}) {
    if (String(code).length > 12000) return { error: "Usa hasta 12.000 caracteres.", text: "El ejercicio es demasiado largo." };
    const lines = cleanLines(code);
    if (!lines.length) return { error: "Escribe al menos una instrucción.", text: "No hay instrucciones para simular." };
    const facts = { lines, instructions: [], commands: [], images: [], containers: [], volumes: [], networks: [] };
    if (scenario.mode === "dockerfile") {
      for (const line of lines) {
        const match = line.match(/^([A-Z]+)\s+(.+)$/);
        if (!match) return { error: `No se reconoce la instrucción: ${line}`, text: `Error en Dockerfile: ${line}` };
        facts.instructions.push({ name: match[1], value: match[2] });
      }
      if (facts.instructions[0]?.name !== "FROM") return { error: "Un Dockerfile debe comenzar con FROM.", text: "Falta la imagen base." };
      return { error: null, facts, text: facts.instructions.map((item, index) => `${index + 1}. ${item.name} ${item.value}`).join("\n") + "\n\nSimulación educativa: no se construyó una imagen real." };
    }
    if (scenario.mode === "ignore") {
      facts.patterns = lines;
      return { error: null, facts, text: `Contexto excluido: ${lines.join(", ")}\n\nSimulación educativa de .dockerignore.` };
    }
    if (scenario.mode === "compose") {
      const source = String(code);
      facts.services = [...source.matchAll(/^\s{2}([\w-]+):\s*$/gm)].map(match => match[1]).filter(name => name !== "services" && name !== "volumes");
      facts.hasServices = /^services:\s*$/m.test(source);
      facts.hasPorts = /^\s+ports:\s*$/m.test(source);
      facts.hasVolumes = /^\s+volumes:\s*$/m.test(source);
      if (!facts.hasServices) return { error: "Compose necesita la clave services.", text: "Falta services." };
      return { error: null, facts, text: `Servicios descritos: ${facts.services.join(", ") || "ninguno"}\n\nSimulación educativa: no se iniciaron contenedores.` };
    }
    for (const line of lines) {
      if (!/^docker\s+/.test(line)) return { error: `El comando debe comenzar con docker: ${line}`, text: `Comando no reconocido: ${line}` };
      facts.commands.push(line);
      const image = line.match(/docker\s+(?:pull|build\s+-t)\s+([^\s]+)/)?.[1];
      if (image) facts.images.push(image);
      const container = line.match(/--name\s+([\w.-]+)/)?.[1];
      if (container) facts.containers.push(container);
      const volume = line.match(/docker\s+volume\s+create\s+([\w.-]+)/)?.[1];
      if (volume) facts.volumes.push(volume);
      const network = line.match(/docker\s+network\s+create\s+([\w.-]+)/)?.[1];
      if (network) facts.networks.push(network);
    }
    return { error: null, facts, text: lines.map(line => `✓ ${line}`).join("\n") + "\n\nSimulación educativa: no usa Docker Desktop ni modifica tu equipo." };
  }

  const seed = [
    { _id: 1, nombre: "Python", nivel: "Inicial", horas: 12, etiquetas: ["datos", "automatización"] },
    { _id: 2, nombre: "JavaScript", nivel: "Inicial", horas: 8, etiquetas: ["web"] },
    { _id: 3, nombre: "APIs", nivel: "Siguiente", horas: 9, etiquetas: ["web", "backend"] },
    { _id: 4, nombre: "Docker", nivel: "Siguiente", horas: 10, etiquetas: ["devops"] }
  ];
  const clone = value => JSON.parse(JSON.stringify(value));
  const readJson = (source, fallback = {}) => source.trim() ? JSON.parse(source) : fallback;
  const matches = (document, filter) => Object.entries(filter).every(([key, expected]) => {
    const actual = document[key];
    if (expected && typeof expected === "object" && !Array.isArray(expected)) {
      return Object.entries(expected).every(([operator, value]) => operator === "$gte" ? actual >= value
        : operator === "$lte" ? actual <= value : operator === "$gt" ? actual > value : operator === "$lt" ? actual < value
          : operator === "$in" ? value.some(item => Array.isArray(actual) ? actual.includes(item) : actual === item) : false);
    }
    return actual === expected;
  });
  const objectArgument = (code, method, position = 0) => {
    const call = String(code).match(new RegExp(`\\.${method}\\(([\\s\\S]*?)\\)(?:\\.|;|$)`));
    if (!call) return null;
    let depth = 0, quoted = false, escaped = false, split = -1;
    for (let index = 0; index < call[1].length; index += 1) {
      const char = call[1][index];
      if (escaped) { escaped = false; continue; }
      if (char === "\\") { escaped = true; continue; }
      if (char === '"') quoted = !quoted;
      if (quoted) continue;
      if (char === "{" || char === "[") depth += 1;
      if (char === "}" || char === "]") depth -= 1;
      if (char === "," && depth === 0) { split = index; break; }
    }
    const parts = split < 0 ? [call[1]] : [call[1].slice(0, split), call[1].slice(split + 1)];
    return readJson(parts[position] || "{}");
  };

  function runMongo(code) {
    if (String(code).length > 12000) return { error: "Usa hasta 12.000 caracteres.", text: "La consulta es demasiado larga." };
    const source = String(code).trim();
    if (!/^db\.cursos\./.test(source)) return { error: "Usa la colección db.cursos.", text: "La simulación solo contiene db.cursos." };
    const documents = clone(seed);
    try {
      let output = [];
      let operation = "";
      if (/\.findOne\(/.test(source)) { operation = "findOne"; output = documents.filter(item => matches(item, objectArgument(source, "findOne") || {})).slice(0, 1); }
      else if (/\.find\(/.test(source)) {
        operation = "find";
        output = documents.filter(item => matches(item, objectArgument(source, "find") || {}));
        const sort = objectArgument(source, "sort");
        if (sort) { const [field, direction] = Object.entries(sort)[0]; output.sort((a, b) => (a[field] > b[field] ? 1 : a[field] < b[field] ? -1 : 0) * direction); }
        const limit = Number(source.match(/\.limit\((\d+)\)/)?.[1] || output.length);
        output = output.slice(0, limit);
      } else if (/\.insertOne\(/.test(source)) { operation = "insertOne"; const item = objectArgument(source, "insertOne"); documents.push(item); output = [item]; }
      else if (/\.updateOne\(/.test(source)) {
        operation = "updateOne"; const filter = objectArgument(source, "updateOne", 0); const update = objectArgument(source, "updateOne", 1);
        const item = documents.find(document => matches(document, filter)); if (item && update?.$set) Object.assign(item, update.$set); output = item ? [item] : [];
      } else if (/\.deleteOne\(/.test(source)) { operation = "deleteOne"; const index = documents.findIndex(item => matches(item, objectArgument(source, "deleteOne") || {})); output = index >= 0 ? documents.splice(index, 1) : []; }
      else if (/\.countDocuments\(/.test(source)) { operation = "countDocuments"; output = [documents.filter(item => matches(item, objectArgument(source, "countDocuments") || {})).length]; }
      else if (/\.distinct\(/.test(source)) {
        operation = "distinct"; const field = source.match(/\.distinct\("([\w]+)"/)?.[1]; output = [...new Set(documents.map(item => item[field]))];
      } else return { error: "Operación no admitida por este laboratorio.", text: "Usa find, findOne, insertOne, updateOne, deleteOne, countDocuments o distinct." };
      return { error: null, operation, documents, output, text: JSON.stringify(output, null, 2) + "\n\nSimulación educativa sobre cuatro documentos; no se conecta a MongoDB." };
    } catch (error) { return { error: "Revisa llaves, comillas y operadores JSON: " + error.message, text: "La consulta no pudo interpretarse." }; }
  }

  globalThis.DockerLab = { run: runDocker };
  globalThis.MongoLab = { run: runMongo, seed: () => clone(seed) };
})();
