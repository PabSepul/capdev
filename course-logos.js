/* Logotipos vectoriales de Simple Icons (CC0). Se cargan como imágenes, no como
   texto abreviado, para que cada ruta se reconozca de un vistazo. */
(() => {
  "use strict";
  const logos = {
    python: [["python", "Python", "3776AB"]],
    "html-css": [["html5", "HTML5", "E34F26"], ["custom-css", "CSS3", "1572B6"]],
    javascript: [["javascript", "JavaScript", "F7DF1E"]],
    sql: [["postgresql", "PostgreSQL", "4169E1"]],
    git: [["git", "Git", "F05032"], ["github", "GitHub", "FFFFFF"]],
    apis: [["openapiinitiative", "OpenAPI", "6BA539"]],
    terminal: [["gnubash", "Terminal", "FFFFFF"]],
    regex: [[null, "Expresiones regulares", "E879F9"]],
    ia: [["custom-ai", "Inteligencia artificial", "7DD3FC"]],
    "datos-python": [["pandas", "Datos con Python", "150458"]],
    nodejs: [["nodedotjs", "Node.js", "5FA04E"]],
    typescript: [["typescript", "TypeScript", "3178C6"]],
    react: [["react", "React", "61DAFB"]],
    json: [["json", "JSON", "FFFFFF"]],
    markdown: [["markdown", "Markdown", "FFFFFF"]],
    accesibilidad: [["custom-a11y", "Accesibilidad web", "86EFAC"]],
    testing: [["jest", "Pruebas automatizadas", "C21325"]],
    docker: [["docker", "Docker", "2496ED"]],
    mongodb: [["mongodb", "MongoDB", "47A248"]]
  };
  const svgNode = (name, attributes = {}) => {
    const node = document.createElementNS("http://www.w3.org/2000/svg", name);
    for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
    return node;
  };
  function customLogo(kind, label) {
    const svg = svgNode("svg", { class: "course-logo course-logo-custom course-logo-" + kind, viewBox: "0 0 40 40", role: "img", "aria-label": label });
    if (kind === "css") {
      svg.append(svgNode("path", { d: "M6 3h28l-3 29-11 5-11-5L6 3Z", fill: "#1572B6" }));
      const text = svgNode("text", { x: "20", y: "25", "text-anchor": "middle", fill: "#fff", "font-size": "12", "font-weight": "700", "font-family": "Arial, sans-serif" });
      text.textContent = "CSS"; svg.append(text);
    } else if (kind === "ai") {
      svg.append(svgNode("path", { d: "M12 10c5-5 11-5 16 0M10 17c-4 5-2 11 3 13M30 17c4 5 2 11-3 13M14 29c4 4 8 4 12 0M14 13l12 14M26 13 14 27", fill: "none", stroke: "#7DD3FC", "stroke-width": "2.5", "stroke-linecap": "round" }));
      for (const [cx, cy] of [[12,10],[28,10],[10,17],[30,17],[13,30],[27,30]]) svg.append(svgNode("circle", { cx, cy, r: "2.5", fill: "#A78BFA" }));
    } else {
      svg.append(svgNode("circle", { cx: "20", cy: "8", r: "4", fill: "#86EFAC" }));
      svg.append(svgNode("path", { d: "M20 14v18M8 17c4 3 8 4 12 4s8-1 12-4M12 32l8-10 8 10", fill: "none", stroke: "#86EFAC", "stroke-width": "3", "stroke-linecap": "round", "stroke-linejoin": "round" }));
    }
    return svg;
  }
  for (const card of document.querySelectorAll("[data-learning-route]")) {
    const icon = card.querySelector(".technology-icon");
    const items = logos[card.dataset.learningRoute];
    if (!icon || !items) continue;
    icon.replaceChildren();
    for (const [name, label, color] of items) {
      if (!name) {
        const symbol = document.createElement("span");
        symbol.className = "course-symbol";
        symbol.textContent = ".*";
        symbol.setAttribute("aria-label", label);
        icon.append(symbol);
      } else if (name.startsWith("custom-")) {
        icon.append(customLogo(name.slice(7), label));
      } else {
        const image = document.createElement("img");
        image.className = "course-logo";
        image.src = "https://cdn.simpleicons.org/" + name + "/" + color;
        image.alt = label;
        image.width = 38;
        image.height = 38;
        image.loading = "lazy";
        icon.append(image);
      }
    }
  }
})();
