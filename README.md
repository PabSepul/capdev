# Código Cero

Para futuras mejoras de contenido, consultar el [estándar de actualización de cursos](ESTANDAR-CURSOS.md):
plantilla por módulo, adaptación a las 16 rutas restantes, verificación y prompt reutilizable.

Plataforma educativa estática en español. Estado local actualizado el 7 de septiembre de 2026.
La identidad educativa sigue siendo Código Cero. El código está preparado para
capsulasdev.com; GitHub Pages aún debe completar el cambio desde intenta.cl.

## Perfiles y sincronización automática

Mi cuenta asocia el progreso a un perfil privado mediante un código por correo.
Los ejercicios, exámenes, intentos y borradores se sincronizan automáticamente;
una copia local queda solo para recuperación del modo invitado y exportaciones.
El lanzamiento inicial es para mayores de 18 años y conserva la pantalla de
mantenimiento mientras se decide la apertura pública.

Ver [CUENTAS.md](CUENTAS.md) para arquitectura, SQL, configuración, DNS y verificación.
Hay 22 páginas y 24 suites. Las pruebas de cuentas incluyen `accounts.test.mjs` (PostgreSQL/PGlite)
y `accounts-ui.test.mjs` (flujo de interfaz, desconexión y cambios de cuenta).

## Catálogo actual

| Ruta | Ejercicios | Niveles | Mini exámenes |
| --- | ---: | ---: | ---: |
| Python | 20 proyectos | 5 | 5 |
| HTML y CSS | 16 módulos | 4 | 4 |
| JavaScript | 16 módulos | 4 | 4 |
| SQL | 16 módulos + 3 desafíos independientes | 4 | 4 |
| Git y GitHub | 16 módulos | 4 | 4 |
| APIs | 16 módulos | 4 | 4 |
| Terminal | 12 módulos | 3 | 3 |
| Expresiones regulares | 12 módulos | 3 | 3 |
| Inteligencia artificial | 12 módulos | 3 | 3 |
| Datos con Python | 12 módulos | 3 | 3 |
| Node.js | 12 módulos | 3 | 3 |
| TypeScript | 12 módulos | 3 | 3 |
| React | 12 módulos | 3 | 3 |
| JSON | 12 módulos | 3 | 3 |
| Markdown y documentación | 12 módulos | 3 | 3 |
| Accesibilidad web | 12 módulos | 3 | 3 |
| Pruebas automatizadas | 12 módulos | 3 | 3 |
| Docker | 12 módulos | 3 | 3 |
| MongoDB | 12 módulos | 3 | 3 |

Hay 256 ejercicios con progreso y 64 mini exámenes en 19 rutas. Todas tienen editor libre, niveles y exámenes.
Las tres rutas pendientes del mapa —Markdown, accesibilidad y pruebas automatizadas— ya están desarrolladas.

Cada módulo tiene explicación, conceptos, ejemplo, misión, tres pistas y tres comprobaciones.
Cada ruta desbloquea el nivel siguiente al completar los cuatro ejercicios del anterior.
Cada examen tiene cinco preguntas, cuatro alternativas y explicación; se aprueba con cuatro aciertos.
Los exámenes no bloquean el siguiente nivel, pero todos deben aprobarse para cerrar la ruta.
Un intento posterior reprobado no elimina una aprobación anterior.

## Cambios del 7 de septiembre

La ampliación más reciente añade 36 módulos y 9 exámenes, con tres laboratorios:

- `markdown.html`: CommonMark 0.31.2 distribuido localmente con su licencia; vista previa y comprobaciones
  del árbol del documento. El HTML incrustado se omite. No incluye extensiones de GitHub como tablas con barras.
- `accesibilidad.html`: inspección con DOMParser, etiquetas y relaciones HTML, contraste de colores sólidos
  en línea y vista previa aislada. Es una revisión parcial, sin certificación WCAG ni comprobación de CSS
  externo, lectores de pantalla o anuncios dinámicos.
- `testing.html`: aserciones síncronas sobre el intérprete educativo. Las pruebas del alumno deben pasar
  con la implementación correcta y detectar 19 variantes defectuosas repartidas en los doce módulos.
  Las 31 ejecuciones (12 correctas y 19 variantes) se contrastan con JavaScript nativo y `node:assert`.

Se conservan las claves anteriores de progreso. Las tres rutas nuevas usan sus propias claves `-v2`.
Las vistas previas nuevas mantienen `sandbox=""` y una política que bloquea scripts, descargas de recursos
y envíos de formularios. Los ejemplos conservan saltos de línea y se retira el espacio de ayuda vacío.
Las pruebas de páginas y mantenimiento recorren ahora todos los HTML: 18 páginas.

Las cuatro rutas que eran mini cursos guiados —Node.js, Datos con Python, TypeScript y React— pasaron de
tres o seis ejercicios de opciones a doce módulos con editor libre y exámenes. El motor guiado
(`mini-course.js`, `mini-courses.js`, `mini-expansion.js`, `mini-course.css` y sus dos pruebas) quedó sin
usuarios y se retiró completo. Se agregó además una ruta nueva, JSON.

Cada una se apoya en un motor que ejecuta de verdad, y cada motor se contrasta contra el original:

| Ruta | Motor | Contraste |
| --- | --- | --- |
| Datos con Python | `python-runtime.js`, el mismo de Python | 12 soluciones iguales a CPython 3.12 |
| Node.js | `node-lab.js` sobre el intérprete de JavaScript | 12 soluciones iguales a Node.js real, con servidor levantado |
| TypeScript | `ts-lab.js`, verificador de tipos propio | 63 programas con el mismo veredicto que TypeScript 5.9.3 |
| React | `react-lab.js`, transformación de JSX y React mínimo | 12 primeros renders iguales a React 19 |
| JSON | `json-lab.js`, analizador y validador propios | 666 documentos con el mismo veredicto que `JSON.parse` |

## Ampliación del 6 de septiembre

Los cinco cuartos niveles viven en `course-expansion.js`, que se carga antes de `starter-course.js`:

- HTML/CSS: formularios etiquetados, tablas semánticas, foco de teclado y desplegables nativos.
- JavaScript: normalización de textos, búsquedas reutilizables, acumuladores y reportes filtrados.
- SQL: GROUP BY, promedios por grupo, filtros antes de resumir y JOIN con filtros y alias.
- Git/GitHub: revisión del área preparada, publicación de ramas, base/comparación de un pull request y entregas selectivas.
- APIs: búsqueda ordenada, paginación estable, recuperación de errores de formato y ciclo de vida de una inscripción.

Cada cuarto nivel tiene un examen de cinco preguntas. SQL conserva ejemplos resueltos, tablas de resultados,
errores frecuentes y reflexión también en los módulos nuevos.

## Arquitectura y alcance

El sitio no requiere build ni instalación npm para servir sus páginas. CommonMark
y el SDK de Supabase se distribuyen localmente en vendor con sus licencias.
Cada tecnología tiene su propia página HTML. Las cuentas requieren el servicio externo.

- `python-runtime.js`: intérprete propio de un subconjunto de Python, con límites de pasos, profundidad y salida.
  Incluye variables, condiciones, ciclos, colecciones, conjuntos, funciones, lambda, comprensiones de lista, de
  conjunto y de diccionario, f-strings con alineación y manejo de errores. No es CPython; no admite import,
  input(), clases, archivos ni expresiones generadoras.
- `starter-runtime.js`: intérprete educativo de JavaScript y motor SQL sobre tablas en memoria. Admite
  desestructuración de listas y objetos, `typeof` y globales inyectados por un laboratorio.
- `starter-course.js` y `starter-exams.js`: control de rutas, comprobaciones, niveles y exámenes.
- `base-courses.js`: contenido de HTML/CSS y JavaScript. Vive aparte del controlador porque son 42 KB
  que solo necesitan sus dos páginas; antes viajaban en `starter-course.js` a las dieciocho.
- `sql-course.js`, `sql-guide.js`, `sql.css`: lecciones base, explorador de datos, guías y desafíos SQL.
- `git-lab.js`: repositorio simulado; no ejecuta Git ni se conecta a GitHub. Admite diff --staged/--cached,
  preserva cambios compatibles al cambiar de rama y rechaza cambios de rama que los sobrescribirían.
  El flujo de pull request se explica; el simulador no abre solicitudes ni registra revisiones reales.
- `api-lab.js`: servidor HTTP simulado con cursos y estudiantes, autenticación de práctica, JSON y paginación.
  Cada intento reinicia los datos. Las respuestas guardan una instantánea; una URL mal codificada devuelve 400.
  No usa red. El token clave-demo-2026 es parte pública del ejercicio, no una credencial.
- `terminal-lab.js` y `terminal-course.js`: shell simulado y los 12 módulos de la ruta Terminal.
- `regex-lab.js` y `regex-course.js`: motor de patrones del navegador y los 12 módulos de expresiones regulares.
- `ia-lab.js` y `ia-course.js`: consola de cálculos y los 12 módulos de inteligencia artificial.
- `datos-python-course.js`: los 12 módulos de Datos con Python, sobre el intérprete de Python.
- `node-lab.js` y `nodejs-course.js`: entorno de Node simulado y los 12 módulos de la ruta.
- `ts-lab.js` y `typescript-course.js`: verificador de tipos y los 12 módulos de TypeScript.
- `react-lab.js` y `react-course.js`: transformación de JSX, React mínimo y los 12 módulos de React.
- `json-lab.js` y `json-course.js`: analizador de JSON, validador de esquemas y los 12 módulos de la ruta.
- `learning-state.js`, `catalog.js`: continuidad, borradores y avance de las diecisiete rutas en portada.
- `site.js`, `styles.css`, `learning-review.css`: tema, comportamiento y estilos compartidos.
- El avance requiere un perfil y se guarda automáticamente; no hay panel de respaldo ni restauración manual en la portada.
- `analizar-avance.mjs`: lee los respaldos del piloto y dice dónde se traba la gente.
  No se publica ni forma parte del sitio; se ejecuta en local.
- `starter-harness.mjs`: arnés compartido por las pruebas de ruta. No se publica en el sitio.

Toda vista previa se dibuja en un iframe con `sandbox=""` y, dentro del `srcdoc`, una política
`default-src 'none'; style-src 'unsafe-inline'; form-action 'none'; base-uri 'none'`. Donde las lecciones
usan imágenes se agrega `img-src data:`: una dirección externa no se descarga, así que nada de lo que
escriba la persona sale a la red. `starter-course.test.mjs` exige esa política en todas.

Los intérpretes no usan eval ni Function para ejecutar el código del estudiante.
HTML/CSS y React usan un iframe con sandbox vacío; las comprobaciones de HTML/CSS son patrones educativos,
no un validador completo de semántica, estilos computados o accesibilidad.

## Progreso y trazabilidad

En modo invitado, el avance vive en el navegador de cada persona, y
`learning-state.js` es su **único dueño**: antes lo escribían también
`starter-course.js` y `python.js`, cada uno con su propio parseo, en 51 claves
sueltas de `localStorage`.

Ahora son dos claves con esquema y versión:

- `codigo-cero.perfil-v1` — un documento con un identificador de instalación
  anónimo y, por ruta, los ejercicios completados, los exámenes aprobados, el
  módulo activo, los borradores de código y cuántos intentos costó cada módulo.
- `codigo-cero.intentos-v1` — un registro de hasta 400 ejecuciones: qué
  validaciones pasaron, si hubo error de ejecución y cuánto se tardó.
  **No guarda el código escrito.**

La diferencia importa. El modelo anterior solo guardaba estado final: con
`completados: [0,1,2]` se sabe que alguien terminó tres módulos, pero no que
intentó el cuarto once veces y se fue. Ese es exactamente el dato que hace falta
para enseñar mejor, y era el que se descartaba.

La migración desde las claves anteriores ocurre en la primera lectura y **no
borra nada**: si algo saliera mal, el avance viejo sigue donde estaba.

El panel de la portada permite generar un respaldo, restaurarlo en otro
navegador y borrar todo. La importación se valida con el motor de la ruta JSON:
el mismo que enseña a escribir un esquema es el que revisa el archivo, así que
un documento roto responde con línea, columna y qué se esperaba.

Python usa ids de proyecto 1–20; las otras rutas usan índices desde 0.
No limpiar el almacenamiento del usuario para hacer pruebas; usar un origen
local de QA separado.

## Cómo correr un piloto

No hay cuentas ni servidor, así que el piloto funciona con archivos.

**1. Antes de empezar.** Pídele a cada persona que use el mismo navegador durante
toda la prueba: el avance vive ahí. Si cambia de equipo, que restaure su respaldo
antes de seguir.

**2. Al terminar cada sesión.** En la portada, dentro de «Tu avance», pulsa
**Descargar archivo**. Se guarda como `codigo-cero-<instalación>-<fecha>.json`.
Ese archivo es lo que te manda. Si su navegador no permite descargas, el botón
**Copiar** deja el mismo contenido en el portapapeles.

**3. Para leerlos.** Junta todos los archivos en una carpeta y ejecuta:

```powershell
node analizar-avance.mjs C:\ruta\a\la\carpeta
```

El informe dice hasta dónde llegó cada persona, qué módulos costaron más, **cuál
de las tres comprobaciones falla** en cada uno —que es donde está el concepto que
no llega—, cuántos intentos fallaron por un error de ejecución en vez de por la
validación, y cuánto tiempo tomó resolver cada ejercicio.

Un archivo repetido de la misma persona no cuenta dos veces: manda el más
reciente. Los archivos que no sean respaldos se descartan diciendo por qué.

**Qué contiene y qué no.** El respaldo lleva ejercicios completados, exámenes
aprobados, borradores de código, el conteo de intentos por módulo y el registro
de las últimas 400 ejecuciones. **No lleva nombre ni correo**, porque el sitio no
los pide, y el registro de intentos **no guarda el código escrito**: solo qué
comprobaciones pasaron, si hubo error y cuánto se tardó. Los borradores sí
contienen código, y el panel lo advierte antes de exportar.

**Qué no te va a decir.** Con cinco personas esto no es estadística. Un módulo
con muchos intentos puede ser difícil, estar mal explicado o tener una
comprobación demasiado estricta: hay que abrirlo y mirarlo. El informe lo repite
al final para que el número no se lea como conclusión.

## Verificación

La verificación completa tiene veintiuna suites. Estas dieciséis usan Node.js, Python y los archivos del repositorio:

```powershell
node starter-course.test.mjs
node course-expansion.test.mjs
node routes-git-apis.test.mjs
node terminal-route.test.mjs
node routes-regex-ia.test.mjs
node route-datos-python.test.mjs
node route-nodejs.test.mjs
node route-json.test.mjs
node route-markdown.test.mjs
node route-testing.test.mjs
node python-runtime.test.mjs
node python-checkpoints.test.mjs
node sql-guide.test.mjs
node learning-state.test.mjs
node analisis-avance.test.mjs
node review-preview.test.mjs
```

Cada prueba de ruta resuelve sus doce módulos por el camino real de la página: monta un DOM falso, ejecuta
`starter-course.js`, comprueba que el código inicial **no** apruebe, escribe la solución de referencia y exige
las tres validaciones. `starter-course.test.mjs` recorre además todas las páginas del directorio y verifica
IDs únicos, archivos existentes, versiones consistentes, etiquetas Open Graph, enlace desde la portada,
tema de arranque y orden de carga.

Las suites de Python y de Node contrastan en vivo con `python` y con el Node.js que ejecuta la prueba.
La de JSON compara 666 documentos —66 escritos y 600 generados al azar— con `JSON.parse`.

Tres suites de rutas necesitan TypeScript, React o jsdom y **fallan** si no los encuentran. jsdom aporta
el DOM real para comprobar etiquetas y asociaciones de la ruta de accesibilidad. Instala estas herramientas
únicamente en una carpeta temporal (no se publican como dependencias del sitio):

```powershell
$contentQaDir = Join-Path ([IO.Path]::GetTempPath()) 'capsulasdev-content-qa'
npm install --prefix $contentQaDir --ignore-scripts --no-audit --no-fund typescript@5.9.3 react@19.2.8 react-dom@19.2.8 @types/react @types/react-dom jsdom@26.1.0
node route-typescript.test.mjs
node route-react.test.mjs
node route-accessibility.test.mjs
```

Las tres admiten CONTENT_QA_MODULES apuntando a un node_modules con esas herramientas. Solo TypeScript
y React admiten CONTENT_QA_SKIP=1 para omitir el contraste a sabiendas. Omitirlo no cuenta como contraste
nativo aprobado. La comparación de Node también es obligatoria y cierra sus servidores antes de terminar.

Para una vista local: `python -m http.server 4174 --bind 127.0.0.1`.
Ver `QA.md` para el alcance de la revisión y `HANDOFF.md` para continuidad operativa.

## Mantenimiento y publicación

La configuración pública conserva mantenimiento en intenta.cl y www.intenta.cl, incluso en rutas directas.
El HTML comienza con `is-maintenance` y mantiene esa pantalla sin JavaScript.
No retirar mantenimiento sin autorización expresa.

- Revisión publicada: https://intenta.cl/?revision=septiembre-2026
- Salida de revisión: https://intenta.cl/?maintenance

`review-preview.js` conserva la revisión en sessionStorage; los enlaces internos propagan el parámetro.
Mantenimiento y revisión declaran noindex, nofollow. El enlace no autentica ni protege archivos privados:
cualquiera que lo conozca puede entrar y los recursos siguen siendo públicos.

### Terminal

`terminal-lab.js` es un shell educativo con un sistema de archivos virtual en memoria: carpetas, archivos, ruta
actual, tuberías con `|` y redirecciones con `>` y `>>`. Reconoce `pwd`, `ls`, `cd`, `mkdir`, `touch`, `cat`,
`echo`, `cp`, `mv`, `rm`, `grep`, `wc` y `head`, con las convenciones de un shell de estilo Bash.

No ejecuta procesos, no toca el disco y no accede a la red. Lo que queda fuera de su alcance lo dice en lugar de
inventar una salida: comodines, sustituciones, variables (incluso entre comillas dobles), borrado recursivo y
expresiones regulares en `grep` devuelven un aviso explicando el límite. Cada intento parte del mismo estado
inicial, así que el resultado siempre es comprobable y se puede experimentar sin miedo.

### Expresiones regulares

`regex-lab.js` compila el patrón con `RegExp` y lo ejecuta sobre el texto de prueba de cada módulo: el motor es el
del navegador, así que lo aprendido sirve tal cual en JavaScript. Muestra cada coincidencia con su posición, sus
grupos numerados y sus grupos con nombre, y admite una segunda línea `reemplazo:` para practicar sustituciones.

Antes de compilar rechaza los patrones con riesgo de retroceso catastrófico —un cuantificador sobre un grupo que ya
repite, como `(\d+)+`— en lugar de dejar la pestaña colgada. El texto de prueba y el patrón están acotados por la
misma razón.

### Inteligencia artificial

`ia-lab.js` es una consola que **calcula**: cuenta tokens con una aproximación declarada, estima costos con una
tabla de precios de ejemplo, mide similitud del coseno entre textos, recupera documentos de un corpus local,
aplica softmax para mostrar el efecto de la temperatura y revisa si una respuesta cita documentos que existen y
que fueron recuperados. El comando `prompt` analiza la estructura de una instrucción —rol, tarea, contexto,
formato, restricciones y ejemplo— y explica qué falta.

**No ejecuta ningún modelo de lenguaje y no genera respuestas.** Todo lo que muestra proviene de un cálculo
determinista sobre datos locales, y lo que un modelo real haría distinto se dice en pantalla en vez de simularlo.
Es la diferencia entre enseñar cómo funciona una herramienta y fingir que la herramienta está ahí.

### Datos con Python

No hay motor nuevo: la ruta usa `python-runtime.js`, el mismo intérprete de la ruta de Python. Para sostenerla
se le agregaron `lambda`, conjuntos, comprensiones de diccionario y de conjunto, comparación lexicográfica de
listas y tuplas, alineación y ancho en los formatos de f-string, y los builtins `any`, `all`, `set` e
`isinstance`. Los treinta programas nuevos de la suite se contrastaron con CPython 3.12 y coinciden carácter
a carácter.

No hay pandas ni numpy, y el material no los menciona: la prueba lo verifica. Un conjunto conserva el orden de
inserción para que la salida sea reproducible, y todos los módulos usan `sorted()` antes de mostrarlo, que es lo
correcto también con CPython.

### Node.js

`node-lab.js` aporta el entorno de Node sobre el intérprete de JavaScript que ya existía: `require` con módulos
propios y caché, `module.exports`, `process.argv`, `JSON`, `node:fs` sobre un sistema de archivos en memoria,
`node:path` y `node:http` con un servidor cuyo manejador es literalmente la función que escribió la persona,
invocada con las peticiones que define cada módulo.

No hay npm, no hay red, no hay Buffers y no hay código asíncrono. Las rutas usan separadores de estilo POSIX;
en Windows, Node real usaría la barra invertida, y la página lo dice. Las doce soluciones se ejecutan también
con el Node.js real de la máquina —incluidos cuatro servidores levantados de verdad— y coinciden en las doce.

### TypeScript

`ts-lab.js` hace dos cosas en orden. Primero revisa los tipos de un subconjunto declarado: anotaciones, firmas
de funciones, arreglos, `type`, `interface`, objetos, uniones de literales, propiedades opcionales,
estrechamiento por `typeof` y por comparación, genéricos de un parámetro y tipado contextual. Si hay errores,
los muestra con su línea y no genera nada. Si no los hay, borra las anotaciones y ejecuta el JavaScript
resultante.

No es tsc: es un verificador propio, y cuando no puede determinar un tipo lo deja pasar en vez de inventar un
error. Quedan fuera las clases, los módulos, async y los tipos avanzados. La prueba compara 63 programas
—las doce soluciones, veinticuatro correctos y veintisiete equivocados— con TypeScript 5.9.3: si tsc y el
laboratorio no coincidieran en si hay error, la prueba falla.

### React

`react-lab.js` transforma el JSX en llamadas a `createElement`, igual que hace Babel, y ejecuta los componentes
con el intérprete del sitio. Incluye componentes de función, props, children, key y `useState`, con un ciclo de
eventos: cada interacción del módulo dispara el manejador real, cambia el estado y vuelve a dibujar, así que se
ve la secuencia completa de renders. La interfaz se muestra en el marco de vista previa, que sigue sin permitir
scripts.

No es React completo: no hay reconciliación con DOM virtual, ni `useEffect`, ni contexto, ni renderizado
concurrente, ni fragmentos vacíos. El primer render de las doce soluciones se contrasta con React 19.2.8 real,
transpilando el mismo JSX con el compilador de TypeScript.

### JSON

`json-lab.js` no usa `JSON.parse` para leer lo que escribe la persona, porque el mensaje de error es la mitad de
la lección: el analizador es propio y explica cada problema con su línea, su columna y qué esperaba encontrar.
Las pruebas comprueban que acepte y rechace exactamente lo mismo que `JSON.parse` —666 documentos, 600 de ellos
generados al azar— y que el valor obtenido sea idéntico.

El validador cubre un subconjunto de JSON Schema: `type`, `required`, `properties`, `items`, `enum`,
`additionalProperties`, `minimum`, `maximum`, `minLength`, `maxLength` y `minItems`. Quedan fuera las
referencias, los combinadores como `allOf` o `anyOf`, los formatos y las expresiones regulares dentro del
esquema. En los cuatro últimos módulos la persona escribe un contrato y el laboratorio lo prueba contra
ejemplos que deben aceptarse y ejemplos que deben rechazarse: un esquema que acepta todo no aprueba.
