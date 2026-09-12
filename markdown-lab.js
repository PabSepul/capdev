/* CommonMark 0.31.2, distribuido localmente con su licencia. Sin HTML activo. */
(() => {
  "use strict";
  function run(code) {
    try {
      if (code.length > 30000) throw new Error("Usa un documento de hasta 30.000 caracteres.");
      const tree = new globalThis.commonmark.Parser().parse(code);
      const walker = tree.walker();
      const nodes = [];
      let event;
      while ((event = walker.next())) {
        if (!event.entering) continue;
        const n = event.node;
        nodes.push({ type: n.type, literal: n.literal || "", destination: n.destination || "",
          level: n.level || 0, listType: n.listType || "", info: n.info || "",
          parent: n.parent?.type || "" });
      }
      return { nodes, html: new globalThis.commonmark.HtmlRenderer({ safe: true }).render(tree), error: null,
        text: "Documento renderizado con CommonMark. " + nodes.filter((n) => n.type === "heading").length
          + " encabezados.\nEl HTML incrustado se omite; las imágenes externas no se descargan en esta vista previa." };
    } catch (error) { return { nodes: [], html: "", error: error.message, text: error.message }; }
  }
  globalThis.MarkdownLab = { run };
})();
