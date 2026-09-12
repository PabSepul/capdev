/* Comprobaciones didácticas sobre el DOM real. No certifica conformidad WCAG. */
(() => {
  "use strict";
  const text = (n) => (n?.textContent || "").trim();
  function visible(n) {
    for (let p = n; p; p = p.parentElement) {
      if (p.hidden || p.getAttribute("aria-hidden") === "true" || p.style?.display === "none" || p.style?.visibility === "hidden") return false;
    }
    return true;
  }
  function rgb(value) {
    if (/^#[0-9a-f]{3}$/i.test(value)) value = "#" + [...value.slice(1)].map((c) => c + c).join("");
    if (/^#[0-9a-f]{6}$/i.test(value)) return [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16));
    const m = value.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
    return m && m.slice(1).every((v) => +v <= 255) ? m.slice(1).map(Number) : null;
  }
  function contrast(foreground, background) {
    const a = rgb(foreground), b = rgb(background);
    if (!a || !b) return null;
    const luminance = (c) => c.map((v) => { const s = v / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; })
      .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
    const x = luminance(a), y = luminance(b);
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
  }
  function run(code, scenario = {}) {
    try {
      if (code.length > 30000) throw new Error("Usa un HTML de hasta 30.000 caracteres.");
      const doc = new DOMParser().parseFromString(code, "text/html");
      const all = (selector) => [...doc.querySelectorAll(selector)].filter(visible);
      const one = (selector) => all(selector)[0];
      const named = (el) => Boolean(text(el) || el?.getAttribute("aria-label")?.trim());
      const labels = (el) => Boolean(el?.labels && [...el.labels].some((l) => visible(l) && text(l)));
      const headings = all("h1,h2,h3,h4,h5,h6");
      const fields = all('input:not([type="hidden"]):not([type="submit"]):not([type="button"]),select,textarea');
      const links = all("a[href]");
      const radios = all('input[type="radio"]');
      const specimen = one("#muestra");
      const ratio = specimen ? contrast(specimen.style.color, specimen.style.backgroundColor) : null;
      const described = (el) => (el?.getAttribute("aria-describedby") || "").split(/\s+/).some((id) => {
        const target = doc.getElementById(id); return target && visible(target) && text(target);
      });
      const diagram = one("img#diagrama"), decoration = one("img#adorno");
      const table = one("table");
      const facts = {
        language: /^es(?:-|$)/i.test(doc.documentElement.lang),
        title: doc.title.trim().length >= 8,
        heading: all("h1").length === 1 && named(one("h1")),
        hierarchy: headings.length >= 2 && headings[0].tagName === "H1" && headings.every((h, i) => !i || +h.tagName[1] <= +headings[i - 1].tagName[1] + 1),
        sections: all("h2").length >= 2,
        main: all("main").length === 1 && Boolean(text(one("main"))),
        navigation: named(one("nav")) && Boolean(one('nav[aria-label]')?.getAttribute("aria-label")?.trim()),
        skip: links.some((a) => !a.closest("nav") && a.getAttribute("href") === "#contenido" && text(a) && one("main#contenido")),
        informative: Boolean(diagram?.getAttribute("alt")?.trim().length >= 12),
        imageContext: Boolean(one("figure")?.contains(diagram) && text(one("figure figcaption"))),
        decorative: Boolean(decoration && decoration.hasAttribute("alt") && decoration.getAttribute("alt") === ""),
        surroundingText: Boolean(text(one("p"))),
        labels: fields.length > 0 && fields.every(labels),
        email: Boolean(one('input[type="email"][name="correo"]')),
        button: all("button").some((b) => named(b) && !b.disabled && b.tabIndex >= 0),
        nativeControls: !all('[role="button"],div[onclick],span[onclick]').length,
        tabOrder: !all("[tabindex]").some((n) => Number(n.getAttribute("tabindex")) > 0),
        descriptiveLinks: links.length >= 2 && links.every((a) => text(a).length >= 8 && !/^(haz clic aqu[ií]|aqu[ií]|ver m[aá]s)$/i.test(text(a))),
        linkTargets: links.length >= 2 && links.every((a) => /^(https:\/\/|[\w-]+\.html|#[\w-]+$)/.test(a.getAttribute("href"))),
        group: radios.length >= 2 && radios.every((r) => r.closest("fieldset") === radios[0].closest("fieldset") && text(r.closest("fieldset")?.querySelector("legend"))),
        radioNames: radios.length >= 2 && Boolean(radios[0].name) && radios.every((r) => r.name === radios[0].name)
          && new Set(radios.map((r) => r.value)).size === radios.length,
        caption: Boolean(text(table?.querySelector("caption"))),
        headers: Boolean(table && [...table.querySelectorAll('th[scope="col"]')].filter((n) => visible(n) && text(n)).length >= 2),
        cells: Boolean(table && [...table.querySelectorAll("td")].filter(visible).length >= 2),
        colors: ratio !== null,
        contrast: ratio !== null && ratio >= 4.5,
        sample: Boolean(text(specimen)),
        feedback: fields.some((f) => f.getAttribute("aria-invalid") === "true" && described(f)),
        status: Boolean(one('[role="status"], [aria-live="polite"]'))
      };
      const selected = scenario.rules || Object.keys(facts);
      const report = selected.map((key) => (facts[key] ? "✓ " : "✗ ") + (scenario.labels?.[key] || key));
      if (ratio !== null) report.push("Contraste calculado: " + ratio.toFixed(2) + ":1 (texto normal: al menos 4,5:1, sin redondear para aprobar).");
      report.push("Revisión parcial: no evalúa CSS externo, cascada, lector de pantalla, orden visual ni anuncios dinámicos. El texto alternativo requiere juicio humano. Comprueba teclado y foco en la vista previa.");
      /* La vista previa conserva los elementos semánticos, pero no ejecuta ni descarga contenido. */
      for (const el of doc.querySelectorAll("script,style,link,meta,base,iframe,object,embed,svg,math")) el.remove();
      for (const el of doc.querySelectorAll("*")) {
        for (const attr of [...el.attributes]) {
          if (/^on/i.test(attr.name) || ["src", "srcset", "action", "formaction", "srcdoc", "autofocus"].includes(attr.name)) el.removeAttribute(attr.name);
          if (attr.name === "href" && !attr.value.startsWith("#")) el.removeAttribute("href");
        }
      }
      return { error: null, facts, ratio, html: doc.body.innerHTML, text: report.join("\n") };
    } catch (error) { return { error: error.message, facts: {}, html: "", text: error.message }; }
  }
  globalThis.AccessibilityLab = { run, contrast };
})();
