/* Cola por operación y por cuenta. Cada pestaña tiene sus propios borradores
   pendientes: no hay un arreglo compartido que otra pestaña pueda sobrescribir. */
(() => {
  "use strict";
  function create({ storage, uuid, owner, onChange = () => {} }) {
    const prefix = "capsulasdev.user." + owner + ".outbox.";
    const tab = uuid();
    const memory = new Map();
    let durable = true;
    function entries() {
      const all = new Map();
      try {
        for (let i=0; i<storage.length; i++) {
          const key = storage.key(i);
          if (key?.startsWith(prefix)) {
            try { all.set(key, JSON.parse(storage.getItem(key))); } catch { durable=false; }
          }
        }
      } catch { durable=false; }
      for (const [key, value] of memory) all.set(key,value);
      return [...all].map(([key, op]) => ({key, op}));
    }
    function enqueue(data) {
      const op = { ...data, id: uuid() };
      const slot = op.kind === "draft" && !op.resolve ? "draft." + tab + "." + op.route + "." + op.module : op.id;
      const key = prefix + slot;
      try { storage.setItem(key, JSON.stringify(op)); memory.delete(key); }
      catch { durable=false; memory.set(key,op); }
      onChange();
      return op;
    }
    function acknowledge(sent, ids) {
      const accepted = new Set(ids);
      for (const {key,op} of sent) {
        if (!accepted.has(op.id)) continue;
        if (memory.get(key)?.id === op.id) memory.delete(key);
        try {
          // Una edición producida durante la petición tiene otro ID: no se borra.
          if (JSON.parse(storage.getItem(key) || "null")?.id === op.id) storage.removeItem(key);
        } catch { durable=false; }
      }
      onChange();
    }
    return { enqueue, entries, acknowledge, durable: () => durable, owner };
  }
  globalThis.LearningSync = { create };
})();
