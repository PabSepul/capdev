export const HTML_CSS_FIFTY_SOLUTIONS = {
  17: `<article>
  <h2>Clínica de HTML</h2>
  <p>Práctica abierta para comenzar.</p>
  <p><time datetime="2026-10-12T18:30">12 de octubre, 18:30</time></p>
</article>`,
  18: `<nav aria-label="Migas de pan">
  <ol>
    <li><a href="index.html">Inicio</a></li>
    <li><a href="rutas.html">Rutas</a></li>
    <li aria-current="page">HTML y CSS</li>
  </ol>
</nav>`,
  19: `<figure>
  <blockquote cite="https://example.com/aprender">
    <p>La práctica convierte ideas en habilidades</p>
  </blockquote>
  <figcaption>— <cite>Manual de aprendizaje</cite></figcaption>
</figure>`,
  20: `<h2>Ejecutar pruebas</h2>
<p>Presiona <kbd>Ctrl</kbd> + <kbd>Enter</kbd>.</p>
<pre><code>python -m unittest</code></pre>`,
  21: `<form>
  <fieldset>
    <legend>Ritmo de estudio</legend>
    <label><input type="radio" name="ritmo" value="suave"> Suave</label>
    <label><input type="radio" name="ritmo" value="constante"> Constante</label>
    <label><input type="radio" name="ritmo" value="intensivo"> Intensivo</label>
  </fieldset>
</form>`,
  22: `<form>
  <label for="nombre">Nombre</label>
  <input id="nombre" name="nombre" type="text" autocomplete="name" required>
  <label for="correo">Correo</label>
  <input id="correo" name="correo" type="email" autocomplete="email" required>
</form>`,
  23: `<label for="usuario">Usuario</label>
<input id="usuario" name="usuario" minlength="4" maxlength="12" pattern="[a-z0-9]+" required aria-describedby="ayuda-usuario">
<small id="ayuda-usuario">Letras minúsculas y números</small>`,
  24: `<p>Progreso: <progress value="8" max="12">8 de 12</progress></p>
<p>Dominio: <meter min="0" max="100" value="80">80%</meter></p>
<p>Resultado: <output name="estado">Buen avance</output></p>`,
  25: `<style>
:root { --fondo: #eef7e8; --texto: #17352a; --radio: 12px; }
.aviso { color: var(--texto); background: var(--fondo); border-radius: var(--radio); padding: 1rem; }
</style>
<p class="aviso">Tu progreso quedó guardado.</p>`,
  26: `<style>
.boton { padding: .75rem 1rem; border-radius: .5rem; border: 1px solid transparent; }
.boton--principal { color: white; background: #185c45; }
.boton--secundario { color: #185c45; background: transparent; }
</style>
<button class="boton boton--principal">Guardar</button>
<button class="boton boton--secundario">Cancelar</button>`,
  27: `<style>
.titulo { font-size: clamp(2rem, 6vw, 4.5rem); line-height: 1.05; }
.bajada { font-size: clamp(1rem, 2vw, 1.25rem); }
</style>
<h1 class="titulo">Aprende paso a paso</h1>
<p class="bajada">Una práctica breve cada día.</p>`,
  28: `<style>
.externo::after { content: " ↗"; }
.destacado::before { content: "★"; margin-right: .4rem; }
</style>
<a class="externo" href="https://example.com">Documentación</a>
<span class="destacado">Recomendado</span>`,
  29: `<style>
.cursos { display: grid; grid-template-columns: 1fr; gap: 16px; }
@media (min-width: 720px) { .cursos { grid-template-columns: repeat(3, 1fr); } }
</style>
<section class="cursos"><article>HTML</article><article>CSS</article><article>Accesibilidad</article></section>`,
  30: `<style>
.contenedor { width: min(100% - 32px, 1100px); margin-inline: auto; }
</style>
<main class="contenedor"><h1>Ruta frontend</h1><p>Contenido cómodo de leer en cualquier pantalla.</p></main>`,
  31: `<style>
.catalogo { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; }
</style>
<div class="catalogo"><article class="curso">HTML</article><article class="curso">CSS</article><article class="curso">JavaScript</article><article class="curso">React</article></div>`,
  32: `<picture>
  <source media="(min-width: 800px)" srcset="aula-grande.webp">
  <img src="aula-pequena.webp" alt="Personas aprendiendo desarrollo web" width="640" height="360">
</picture>`,
  33: `<style>
.tarjeta-curso { display: grid; gap: 12px; border: 1px solid #ccd5e0; border-radius: 16px; padding: 24px; }
</style>
<article class="tarjeta-curso"><span>Intermedio</span><h2>CSS adaptable</h2><p>Construye interfaces claras.</p><a href="html-css.html">Ver curso</a></article>`,
  34: `<style>
.menu { display: flex; flex-wrap: wrap; gap: 16px; list-style: none; }
</style>
<nav aria-label="Principal"><ul class="menu"><li><a href="index.html">Inicio</a></li><li><a href="rutas.html" aria-current="page">Rutas</a></li><li><a href="cuenta.html">Mi cuenta</a></li></ul></nav>`,
  35: `<style>
.aviso { border-left: 4px solid #185c45; padding: 16px; background: #eef7e8; }
</style>
<section class="aviso" role="status" aria-labelledby="estado-titulo"><h2 id="estado-titulo">Progreso guardado</h2><p>Puedes continuar más tarde.</p></section>`,
  36: `<dialog open aria-labelledby="dialogo-titulo">
  <form method="dialog">
    <h2 id="dialogo-titulo">Guardar progreso</h2>
    <p>¿Quieres conservar los cambios?</p>
    <button value="cancelar">Cancelar</button>
    <button value="guardar">Guardar</button>
  </form>
</dialog>`,
  37: `<style>
.layout { display: grid; grid-template-columns: 240px 1fr; grid-template-areas: "cabecera cabecera" "lateral contenido"; gap: 20px; }
header { grid-area: cabecera; }
aside { grid-area: lateral; }
main { grid-area: contenido; }
</style>
<div class="layout"><header>Cabecera</header><aside>Menú</aside><main>Contenido</main></div>`,
  38: `<style>
.ayuda { position: sticky; top: 24px; align-self: start; max-height: calc(100vh - 48px); }
</style>
<aside class="ayuda"><h2>Pistas</h2><p>Revisa primero la estructura del documento.</p></aside>`,
  39: `<style>
.portada { width: 100%; aspect-ratio: 16 / 9; object-fit: cover; border-radius: 16px; }
</style>
<img class="portada" src="curso.jpg" alt="Persona diseñando una interfaz">`,
  40: `<style>
.carrusel { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; gap: 16px; }
.carrusel article { flex: 0 0 80%; scroll-snap-align: start; }
</style>
<div class="carrusel"><article>HTML</article><article>CSS</article><article>JavaScript</article></div>`,
  41: `<header><h1>Mi aprendizaje</h1></header>
<nav aria-label="Principal"><a href="#cursos">Cursos</a></nav>
<main id="cursos"><section><h2>Rutas activas</h2><article><h3>HTML</h3><p>Estructura.</p></article><article><h3>CSS</h3><p>Presentación.</p></article></section></main>
<footer>Fin de página</footer>`,
  42: `<style>
.saltar { position: absolute; transform: translateY(-150%); }
.saltar:focus { transform: translateY(0); }
</style>
<a class="saltar" href="#contenido">Saltar al contenido</a>
<header>Cabecera</header>
<main id="contenido" tabindex="-1"><h1>Contenido principal</h1></main>`,
  43: `<style>
.accion { color: #17352a; background: #ffffff; border: 2px solid currentColor; }
.accion:focus-visible { outline: 3px solid #ffbf47; outline-offset: 4px; }
</style>
<button class="accion" type="button">Continuar</button>`,
  44: `<style>
.tarjeta { transition: transform .3s ease; }
.tarjeta:hover { transform: translateY(-6px); }
@media (prefers-reduced-motion: reduce) { .tarjeta { transition: none; } .tarjeta:hover { transform: none; } }
</style>
<article class="tarjeta">Curso disponible</article>`,
  45: `<style>
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; }
img, picture, video { display: block; max-width: 100%; }
</style>`,
  46: `<style>
.nota { padding-block: 12px; padding-inline: 20px; margin-block: 16px; border-inline-start: 4px solid #185c45; }
</style>
<aside class="nota"><h2>Nota</h2><p>Las propiedades lógicas se adaptan a la dirección del texto.</p></aside>`,
  47: `<style>
@media print {
  nav, .acciones { display: none; }
  body { color: #000; background: #fff; }
  a[href]::after { content: " (" attr(href) ")"; }
}
</style>
<nav>Menú</nav><main><a href="guia.html">Guía</a><div class="acciones">Guardar</div></main>`,
  48: `<section class="galeria"><h2>Proyectos</h2>
  <img src="html.jpg" alt="Código HTML en pantalla" width="480" height="270" loading="lazy" decoding="async">
  <img src="css.jpg" alt="Estilos CSS de una tarjeta" width="480" height="270" loading="lazy" decoding="async">
  <img src="accesibilidad.jpg" alt="Persona navegando con teclado" width="480" height="270" loading="lazy" decoding="async">
</section>`,
  49: `<style>
.contenedor { width: min(100% - 2rem, 70rem); margin-inline: auto; }
.beneficios { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
.accion:focus-visible { outline: 3px solid #f2b705; outline-offset: 3px; }
</style>
<header class="contenedor"><nav aria-label="Principal"><a href="#beneficios">Beneficios</a></nav><h1>Aprende desarrollo web</h1><a class="accion" href="#beneficios">Comenzar</a></header>
<main id="beneficios" class="contenedor"><section class="beneficios"><article><h2>Práctica</h2><p>Ejercicios reales.</p></article><article><h2>Progreso</h2><p>Avance guardado.</p></article><article><h2>Orientación</h2><p>Un camino claro.</p></article></section></main>`,
  50: `<style>
.panel { display: grid; grid-template-columns: 1fr; grid-template-areas: "cabecera" "menu" "contenido"; }
.panel > header { grid-area: cabecera; } .panel > nav { grid-area: menu; } .panel > main { grid-area: contenido; }
.tarjetas { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
a:focus-visible { outline: 3px solid #ffcc33; outline-offset: 3px; }
@media (min-width: 800px) { .panel { grid-template-columns: 220px 1fr; grid-template-areas: "cabecera cabecera" "menu contenido"; } }
@media (prefers-reduced-motion: reduce) { * { scroll-behavior: auto; transition: none; } }
</style>
<a class="saltar" href="#contenido">Saltar al contenido</a>
<div class="panel"><header><h1>Panel de aprendizaje</h1></header><nav aria-label="Principal"><a href="#cursos">Cursos</a><a href="#rutas">Rutas</a><a href="#actividad">Actividad</a></nav><main id="contenido" tabindex="-1"><section id="cursos" class="tarjetas"><h2>Cursos en progreso</h2><article class="tarjeta"><h3>HTML</h3><p>70%</p></article><article class="tarjeta"><h3>CSS</h3><p>4 prácticas</p></article><article class="tarjeta"><h3>Accesibilidad</h3><p>Próximo paso</p></article></section></main></div>`
};
