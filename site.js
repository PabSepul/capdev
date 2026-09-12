const SITE_THEME_KEY = "codigo-cero.theme";
const siteThemeToggle = document.querySelector("#theme-toggle");
const siteThemeToggleLabel = document.querySelector("#theme-toggle-label");
const siteThemeColor = document.querySelector('meta[name="theme-color"]');

function saveSiteTheme(theme) {
  try {
    localStorage.setItem(SITE_THEME_KEY, theme);
  } catch {
    // El selector continúa funcionando aunque el almacenamiento esté bloqueado.
  }
}

function applySiteTheme(theme, persist = false) {
  const isDark = theme === "dark";
  document.documentElement.dataset.theme = isDark ? "dark" : "light";
  siteThemeToggle.setAttribute("aria-pressed", String(isDark));
  siteThemeToggle.setAttribute("aria-label", isDark ? "Activar modo claro" : "Activar modo oscuro");
  siteThemeToggleLabel.textContent = isDark ? "Claro" : "Oscuro";
  siteThemeColor.content = isDark ? "#151a20" : "#1c69d4";
  if (persist) saveSiteTheme(isDark ? "dark" : "light");
}

siteThemeToggle.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applySiteTheme(nextTheme, true);
});

document.querySelectorAll("[data-current-year]").forEach((element) => {
  element.textContent = new Date().getFullYear();
});

applySiteTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");

// Este modo oculta el mantenimiento solo para quien usa el enlace de revisión.
// No protege archivos ni constituye una sesión autenticada.
if (document.documentElement.dataset.review) {
  const value = document.documentElement.dataset.review;
  const banner = document.createElement("aside");
  banner.className = "review-banner";
  banner.setAttribute("aria-label", "Modo revisión");
  const text = document.createElement("p");
  text.textContent = "Modo revisión · El público sigue viendo mantenimiento. Este enlace no es un acceso privado.";
  const exit = document.createElement("a");
  exit.textContent = "Salir y ver mantenimiento";
  exit.href = window.location.pathname + "?maintenance";
  // También funciona con el almacenamiento bloqueado y en pestañas nuevas.
  const keepReviewLinks = () => document.querySelectorAll("a[href]").forEach((link) => {
    const target = new URL(link.getAttribute("href"), window.location.href);
    if (target.origin === window.location.origin && /(?:\.html|\/)$/i.test(target.pathname) && !target.searchParams.has("maintenance")) {
      target.searchParams.set("revision", value);
      link.href = target.href;
    }
  });
  keepReviewLinks();
  document.addEventListener("DOMContentLoaded", keepReviewLinks, { once: true });
  banner.append(text, exit);
  document.body.prepend(banner);
}
