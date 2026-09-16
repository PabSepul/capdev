# Revisión de calidad de CápsulasDev

## Entrega local del 13 de septiembre de 2026

La entrega agrega itinerarios, orientación contextual y feedback estructurado a
las 19 rutas. El estado local y la sincronización remota se prueban por separado:
selección de itinerario, cambio de selección, feedback claro, feedback con área
de mejora, invitado sin cuenta, cuenta activa, repetición idempotente y mezcla de
estado remoto. También se prueba la sincronización real embebida para Docker y
MongoDB, rutas que antes quedaban fuera de la función SQL.

`learning-experience.test.mjs` monta la portada y una ruta real con jsdom. Exige
los tres itinerarios, conservación del parámetro de revisión, reanudación del
avance, orientación de ruta y feedback que solo aparece después de ejecutar.
`backup-scripts.test.mjs` analiza los cuatro scripts de PowerShell y exige DPAPI,
dump de `public` y `auth`, comprobación con `pg_restore`, cifrado AES con cabeceras
ocultas, verificación, limpieza de la contraseña del entorno, retención y control
de ruta antes de borrar el dump.

La revisión manual en el navegador integrado confirmó la portada en un ancho
estrecho y el laboratorio en escritorio. En Python y JavaScript el bloque de
feedback apareció después de una ejecución incompleta, mostró la orientación
del primer criterio pendiente y guardó una respuesta de mejora sin recoger el
código. La selección «Python y datos» cambió el estado de la portada y mostró
«paso 1 de 5» en la ruta de Python; JavaScript se presentó como exploración libre.

La migración de Supabase se aplicó a producción el 13 de septiembre antes de
publicar. Una consulta posterior confirmó la columna `itinerary` y que
`learning_sync` contiene las reglas de Docker, MongoDB y feedback. El respaldo
también quedó operativo: una ejecución directa y otra desde el Programador de
tareas crearon archivos 7z cifrados y verificados en OneDrive. La prueba
programada terminó con código `0`, regresó al estado `Ready` y dejó la próxima
ejecución para las 03:00.

Resultado de esa entrega: 26 de 26 suites aprobadas. Incluye los contrastes con PGlite,
TypeScript, React, jsdom, CommonMark, Node y `node:assert`; los contrastes de
Python usaron sus salidas registradas porque CPython no estaba disponible para
esas tres suites en esta ejecución.

## Panel de feedback y progreso guiado

`feedback-panel.test.mjs` carga el informe con datos agregados conocidos y
comprueba totales, porcentaje de claridad, área prioritaria, orden por cápsula y
filtro por ruta. También analiza el script PowerShell y genera un HTML temporal
desde un archivo de prueba. La consulta real a producción se ejecutó correctamente
sin seleccionar identificadores de usuario.

`accounts-ui.test.mjs` cubre ahora la vista de progreso: estado sin itinerario,
seis pasos de Desarrollo web, próximo curso, avance después del primer ejercicio
y enlaces compatibles con revisión. La vista se comprobó en escritorio y a
390 × 844 px. En móvil, el contenido ocupó 375 px dentro de una ventana de 390 px
y `scrollWidth` se mantuvo en 375 px, sin desbordamiento horizontal. Las tarjetas,
el progreso, el llamado a continuar y las etapas conservaron una jerarquía clara.

El informe real también se generó con la conexión de producción. Mostró cero
respuestas, el estado esperado mientras ninguna cuenta haya enviado feedback.
La entrega completa queda cubierta por 27 suites.

## Capi, acompañamiento contextual

La mascota usa cuatro SVG propios y aparece en la portada, la orientación de las
19 rutas, la ayuda gradual, el resultado de cada ejecución y la meta de Mi cuenta.
Las pruebas comprueban que no se duplique, que todas las poses existan y que pase
de reflexión a celebración según el resultado. También verifican la pose adecuada
cuando una cuenta aún no tiene itinerario y cuando ya conoce su siguiente paso.

La revisión visual cubrió portada y Python en claro y oscuro, además de la tarjeta
de progreso. A 390 px, Python y Mi cuenta conservaron `scrollWidth` igual al ancho
del body, sin desbordamiento. Capi se mantiene como apoyo secundario: no tapa el
editor, no cambia el orden de foco y su texto comunica la misma información que
la ilustración.

La ampliación posterior exige 19 mensajes específicos, una nota en el punto de
control, guía en el mini examen y celebración de cierre. Se prueban los estados
pendiente, aprobado y por repasar, incluyendo el cambio entre las poses de
reflexión y celebración. La revisión real no mostró errores de consola ni
desbordamiento en las vistas de escritorio y móvil.

Las poses de reflexión y orientación incluyen ahora un grupo verificable para
los dos brazos. La prueba también exige el contorno claro de la interrogación.
Ese contorno se limita al símbolo: otra aserción impide aplicarlo a los brazos.
En navegador se comprobó el resultado a tamaño pequeño en la orientación y la
ayuda gradual: ambos brazos se distinguen y la interrogación permanece legible
sobre el fondo oscuro.

## Onboarding personalizado

`onboarding.test.mjs` abre el diálogo desde «Empezar desde cero», recorre las
cuatro preguntas y exige que la recomendación incluya itinerario, ritmo semanal,
duración orientativa y tres etapas. También comprueba que nada se guarde antes
de la acción final, que la selección use `LearningState` y que Mi cuenta permita
repetir la orientación. Con esta prueba, la verificación completa suma 28 suites.

La revisión en navegador cubrió el primer paso, navegación hacia atrás y
resultado en 390 px y 1280 px, tanto en claro como en oscuro. El foco entra en el
título de cada pregunta y vuelve al botón de origen al cerrar. No se observaron
desbordamientos en el diálogo; el contenido largo se desplaza dentro de este sin
perder el control de cierre.

# Historial de revisiones

## Despliegue verificado el 8 de septiembre de 2026

Commit `a690dad`, ejecución GitHub Pages `34182805228`: éxito. DNS raíz con
cuatro A de GitHub, www CNAME y dominio verificado mediante TXT. HTTPS obligatorio,
certificado aprobado para ambos nombres; raíz 200, HTTP y www 301 a HTTPS raíz.
El navegador del sitio real muestra solo mantenimiento.

Migración instalada en Supabase `neofezxmcrmrijzxuqjo`, São Paulo. Configuración
de Auth comprobada mediante su API pública: disable_signup=true,
mailer_autoconfirm=false. SELECT anónimo sobre learning_profiles devuelve 401.
delete-account desplegada; solicitudes sin token y con token inválido devuelven
401 desde la verificación propia de la función. No se borraron cuentas reales.
Pendiente proveedor SMTP, plantillas OTP y recorrido con dos cuentas reales.
Las verificaciones anteriores de 21 suites siguen vigentes; se repitieron
cuentas, interfaz, mantenimiento y Python antes de publicar y pasaron.

## Cuentas y dominio: integración local

Se agregaron dos suites: `accounts.test.mjs` verifica PostgreSQL real embebido
(PGlite), RLS entre usuarios, imposibilidad de elegir el propietario desde el
cuerpo, operaciones repetidas, rollback de un lote inválido, versiones en
conflicto, exportación y borrado en cascada. También prueba aislamiento local,
dos pestañas, cuota bloqueada y conservación de 450 intentos sin confirmar.
`accounts-ui.test.mjs` usa el HTML real con jsdom y un doble de transporte para
comprobar progreso e intentos, desconexión, reintento y una respuesta tardía tras
cambiar de cuenta. El token de cada petición queda fijado al propietario de su cola.

Las 19 suites anteriores pasan tras adaptar los dos DOM de pruebas que cargan
todos los scripts de las páginas; las dos nuevas también pasan. Mantenimiento,
referencias y metadatos cubren 20 páginas y los dominios nuevo y anterior.
La pantalla de cuenta se inspeccionó en navegador local, en modo desactivado.
Todavía no se han probado altas, correo, sincronización ni eliminación de cuentas
reales contra Supabase: falta completar SMTP y el aviso de privacidad.

## Corrección local del registro de Python

La ruta principal de Python guardaba el avance y los borradores, pero no los
intentos: su controlador no llamaba a `LearningState.registrarIntento`.
Ahora registra una vez por ejecución las tres validaciones, aprobación, error
y milisegundos desde la última apertura del proyecto. El ejemplo de portada
no genera intentos. El índice del evento comienza en cero, también en Python.

La prueba añadida pulsa el botón real con una misión incumplida, una solución
correcta y un error de sintaxis; verifica eventos y contadores persistidos,
ausencia de código en los eventos y reinicio del intervalo al cambiar de proyecto.
Antes del arreglo falló con cero eventos en lugar de tres; después pasa.
Ese intervalo incluye pausas y no representa tiempo de trabajo activo.
El cambio está en local y la versión de `python.js` en su página se actualizó.
Verificación posterior: las 19 suites pasan, incluidos los contrastes en vivo
con CPython, Node, TypeScript y React. `git diff --check` no detectó errores.

## Herramienta para leer el piloto

Con el modelo de datos ya unificado, faltaba lo que le da sentido: poder leer los
respaldos que llegan. `analizar-avance.mjs` toma una carpeta de archivos y
produce un informe.

Lo que responde, en este orden: hasta dónde llegó cada persona en cada ruta, qué
módulos costaron más intentos, **cuál de las tres comprobaciones falla en cada
uno**, cuántos intentos fallaron por un error de ejecución en vez de por la
validación, y el tiempo mediano por ejercicio resuelto. Los títulos salen de los
propios cursos, cargados en un contexto aislado con un DOM de mentira, así que el
informe dice «Python · proyecto 5: Decide según una edad» y no «python:4».

La prueba fabrica respaldos con datos conocidos —tres personas, una que abandona
en el mismo módulo donde las otras dos pelean— y comprueba que el informe lo
diga. También comprueba que descarte con motivo los archivos que no son
respaldos, y que un respaldo repetido de la misma persona no cuente dos veces.

Dos defectos encontrados al probarlo con datos realistas:

- El desglose por comprobación se saltaba las que nunca habían fallado, porque el
  arreglo llegaba con huecos, y el máximo salía `NaN`. Ahora el largo se toma de
  la propia cadena de validaciones, así que se ven las tres siempre.
- Los plurales: «1 rutas», «1 exámenes», «2 no lo superó».

Dos veces mi cuenta a mano de los fallos por comprobación estuvo mal y la
herramienta tenía razón. Las aserciones se corrigieron hacia lo que el código
calcula, después de verificar el conteo.

Se agregó también un botón de descarga en el panel: pegar cuatro mil caracteres
en un chat se corta o se reformatea, y el respaldo deja de servir. Si el
navegador bloquea la descarga, el texto queda a la vista para copiarlo.

## Modelo de datos del avance

Primer paso hacia usuarios y trazabilidad, sin cuentas ni servidor todavía: la
decisión fue **no** empezar por la identidad, porque construir cuentas sobre el
modelo anterior habría dado toda la infraestructura sincronizando `[0,1,2]`.

El diagnóstico: había tres archivos escribiendo las mismas claves de
`localStorage` por su cuenta —`learning-state.js`, `starter-course.js` y
`python.js`—, 51 claves sueltas, y ninguna guardaba un evento. Solo estado final.

Ahora `learning-state.js` es el único dueño, hay dos claves con esquema y
versión, y cada ejecución deja registro de qué validaciones pasaron, si hubo
error y cuánto se tardó. El código escrito **no** se guarda en ese registro.

Comprobado en el navegador con una persona que se traba: tres intentos con
`v=010` —solo la segunda validación pasa— y luego `v=111`. Esa secuencia es
justo lo que el modelo anterior descartaba.

- Migración: se lee una vez desde las claves anteriores y **no se borra nada**.
  Si algo saliera mal, el avance viejo sigue donde estaba. Probado con avance,
  exámenes y borradores heredados.
- Portabilidad: el panel de la portada genera un respaldo, lo restaura en otro
  navegador y borra todo. El borrado exige un segundo clic porque es
  irreversible y no hay copia en ningún servidor.
- La importación se valida con el motor de la ruta JSON. Los mensajes salen de
  ahí: «Línea 1, columna 3 · El nombre de un campo tiene que ir entre comillas
  dobles», «formato solo admite "codigo-cero/avance" y llegó "otra-app"»,
  «esquema tenía que ser como máximo 1 y llegó 99». Un archivo rechazado no
  toca el avance existente, y eso se comprueba.
- El registro rota a 400 eventos para no llenar el almacenamiento.
- Privacidad: el identificador de instalación es anónimo, se genera en el
  navegador y no viaja a ninguna parte. El sitio no pide nombre ni correo, así
  que el respaldo no los contiene. Sí contiene los borradores de código, y el
  panel lo dice.

Se encontró y corrigió una regresión propia: la portada se actualiza cuando el
avance cambia en otra pestaña, y la caché en memoria lo rompía. Se agregó
`refrescar()` y `catalog.js` lo llama antes de redibujar.

Cuatro suites asertaban contra las claves antiguas y dos montaban su contexto
sin cargar al dueño del dato. Se actualizaron para comprobar el documento y para
cargar los mismos scripts que carga la página. La prueba del panel se verificó
quitando a propósito su validación: la suite falla.

Un detalle que conviene conocer: `read()` cae a una copia en memoria cuando el
almacenamiento falla, lo que da resistencia si el navegador lo bloquea. El
efecto secundario es que un `localStorage.clear()` hecho desde fuera no se nota
hasta recargar. `borrar()` sí escribe un documento vacío, así que el camino del
panel es correcto.


## Dos arreglos técnicos sobre la revisión anterior

Al revisar el estado aparecieron dos cosas que no estaban mal a propósito, sino por acumulación.

**La política de seguridad no había llegado a las vistas previas antiguas.** Markdown y accesibilidad
se escribieron con una `Content-Security-Policy` dentro del `srcdoc`; HTML/CSS y React, no. Y HTML/CSS
es justamente donde la persona escribe HTML crudo, o sea el marco de mayor riesgo del sitio. No era un
agujero explotable —`sandbox=""` ya impedía ejecutar scripts en los cuatro— pero la defensa estaba en
el código nuevo y faltaba en el más expuesto.

Ahora las tres vistas previas llevan la misma política, con `img-src data:` donde las lecciones usan
imágenes. Comprobado en el navegador con un marco de control que reproduce la política exacta: la imagen
incrustada carga, la externa se bloquea, el estilo en línea sigue aplicando y el script no se ejecuta.
`starter-course.test.mjs` recorre ahora todos los `srcdoc` del controlador y exige la política en cada
uno, que no permita scripts y que, si admite imágenes, sean solo incrustadas.

**Cada página cargaba 42 KB de curso que no usaba.** El contenido de HTML/CSS y JavaScript estaba
incrustado dentro de `starter-course.js`, y las dieciocho páginas lo descargaban aunque solo dos lo
necesitan. Se movió a `base-courses.js`: el controlador bajó de 68 KB a 27 KB. Además `html-css.html`
cargaba `starter-runtime.js` sin usarlo nunca —esa ruta no ejecuta JavaScript ni SQL— y se retiró.

El ahorro es de 42 KB en catorce páginas y de 63 KB en HTML/CSS: 649 KB sumando el sitio completo.
Markdown pasó de 315 KB a 273 KB, y las páginas más livianas quedaron cerca de 102 KB.

`starter-course.test.mjs` cargaba una lista de scripts escrita a mano, así que este cambio la
desincronizó y falló con un error de propiedad indefinida. Ahora deriva los scripts de cada página real,
en su orden real, y avisa con claridad cuando el controlador no encuentra su curso. Se comprobó quitando
a propósito un script de una página: la suite lo detecta y lo explica.


## Ampliación: documentación, accesibilidad y pruebas

Estado actual: 19 rutas, 256 ejercicios y 64 mini exámenes. Las tres rutas de esta ampliación aportaron 36 módulos,
108 validaciones y 45 preguntas distribuidas en nueve exámenes. La verificación completa tiene 18 suites.

- Markdown: se resuelven los doce ejercicios; se comprueban HTML esperado, bloques literales que no deben
  contar como encabezados, comentarios, enlaces de esquema peligroso y límites de entrada. Se utiliza
  CommonMark 0.31.2 distribuido con su licencia, no un analizador aproximado propio.
- Accesibilidad: los doce ejercicios se resuelven con DOMParser de jsdom; hay casos de etiquetas sin
  asociación, contenido oculto, saltos de encabezado, alt ausente, errores con destino inexistente y contraste.
  Negro/blanco produce 21:1, iguales 1:1 y #777 sobre blanco no aprueba por redondeo. Se comprueba la
  eliminación de scripts, marcos, eventos y fuentes de imágenes en la vista previa.
- Testing: se resuelven doce módulos y se contrastan 31 ejecuciones con JavaScript nativo y node:assert.
  Incluye pruebas negativas de suites vacías, comparaciones constantes, tipos diferentes y ciclos sin fin.
  Se detectan 19 variantes defectuosas; esta cifra no representa cobertura de todo JavaScript.
- Progreso: guardado y reanudación se verifican para las 19 rutas; cierre independiente de las rutas nuevas.
- Navegador: primer módulo de las tres rutas ejecutado con éxito, vistas previas verificadas y progreso de
  Markdown conservado al recargar. La revisión visual detectó ejemplos con saltos colapsados y un hueco de
  ayuda vacío: corregidos mediante la hoja de estilos de las nuevas rutas. Una suite vacía dejó de aparecer
  como detección de una variante.
- Los tests de estructura y mantenimiento recorren las 18 páginas, incluidos JSON y los tres cursos nuevos.

Pendiente: revisión con principiantes, dispositivos físicos y lectores de pantalla. El laboratorio de
accesibilidad no certifica conformidad, y las pruebas educativas son síncronas y no implementan Jest o node:test.

## Revalidación para retomar el desarrollo

Se ejecutaron de nuevo las quince suites. La comparación nativa de Node encontró un fallo del proceso
en Windows al usar `process.exit(0)` con conexiones HTTP abiertas; la prueba lo capturaba y terminaba
con código exitoso pese a no completar la comparación. Se corrigió el conductor para esperar al servidor,
usar un puerto libre y cerrar sus conexiones antes de terminar. Ahora cualquier comparación incompleta
hace fallar la suite. Las doce soluciones coinciden con Node v26.1.0 y v24.19.0, incluidos los cuatro
servidores HTTP. Con esta corrección, las quince suites completan sus comprobaciones.

## Qué se revisó

Las cuatro rutas que eran mini cursos guiados —Node.js, Datos con Python, TypeScript y React— pasaron a
ser rutas completas de doce módulos con editor libre, y se agregó una ruta nueva, JSON. El motor de mini
cursos se retiró completo. Catálogo total: 196 ejercicios con progreso y 49 exámenes en 14 rutas.
La revisión no modifica el dominio ni el mantenimiento.

Resultado: las quince suites pasan, incluidas las dos que exigen TypeScript y React reales.

## Contraste con las herramientas originales

Un motor escrito a mano solo es defendible si se compara con el original. Cada ruta nueva lo hace:

| Ruta | Contraste | Resultado |
| --- | --- | --- |
| Datos con Python | CPython 3.12.10 | 12 soluciones con salida idéntica |
| Python (motor ampliado) | CPython 3.12.10 | 95 programas idénticos, 30 de ellos nuevos |
| Node.js | Node v22.13.0, con servidor levantado y `fetch` | 12 soluciones idénticas |
| TypeScript | TypeScript 5.9.3 en modo strict | 63 programas con el mismo veredicto |
| React | React 19.2.8 con `renderToStaticMarkup` | 12 primeros renders idénticos |
| JSON | `JSON.parse` del motor | 666 documentos con el mismo veredicto y el mismo valor |

Esas comparaciones no fueron un trámite: encontraron trece defectos, todos corregidos.

- Node: el archivo del programa no existía en el sistema virtual, así que `readdirSync` devolvía un
  archivo menos que Node; `path.join` usaba separadores POSIX sin declararlo; y los avisos del laboratorio
  no llegaban a la pantalla porque el intérprete los reemplazaba por un genérico de sintaxis.
- TypeScript: el orden al comparar unión contra unión, la falta del operador ternario, el estrechamiento
  por ruta de propiedad y por flujo tras un return temprano, el tipado contextual que evita ensanchar los
  literales, la frescura del objeto que sobrevivía a la variable, y los parámetros opcionales que no
  incluían `undefined`.
- React: el espacio dentro de una misma línea se perdía, los elementos vacíos no se cerraban como los
  cierra React, un atributo booleano se escribía suelto y los nombres en camelCase no se traducían al
  atributo real del HTML.

## Pruebas automáticas

- `starter-course.test.mjs`: 36 módulos, 108 validaciones y 9 exámenes; además recorre **todas** las
  páginas del directorio —no una lista escrita a mano— y verifica IDs únicos, archivos existentes,
  versiones consistentes entre páginas, etiquetas Open Graph, enlace desde la portada, tema de arranque
  y orden de carga de los scripts.
- `route-datos-python.test.mjs`, `route-nodejs.test.mjs`, `route-typescript.test.mjs`,
  `route-react.test.mjs`, `route-json.test.mjs`: cada una resuelve sus doce módulos por el camino real de
  la página, comprueba que el código inicial no apruebe, valida los tres exámenes y contrasta con la
  herramienta original según la tabla de arriba.
- `route-nodejs.test.mjs` comprueba además siete errores del laboratorio —pedir un paquete de npm, leer un
  archivo inexistente, leer sin codificación, JSON inválido, no llamar a `end()`, pedir un módulo que no
  existe y `process.exit()`— y exige que el aviso llegue a la pantalla.
- `route-json.test.mjs` incluye 600 documentos generados al azar a partir de piezas sueltas de JSON: la
  parte que más se equivoca de un analizador escrito a mano son las combinaciones que nadie escribiría
  a propósito.
- `python-runtime.test.mjs`: 95 programas contrastados con CPython y 14 errores explicados en español.
  El guardia que impide `eval` y `Function` ahora se auto-verifica: primero comprueba que su patrón
  detecte los casos reales, porque marcaba como infracción el propio `new PyFunction("<lambda>"`.
- `routes-git-apis.test.mjs`, `routes-regex-ia.test.mjs`, `terminal-route.test.mjs`, `sql-guide.test.mjs`,
  `course-expansion.test.mjs`, `learning-state.test.mjs`, `review-preview.test.mjs`: sin cambios de
  alcance respecto de la revisión anterior, salvo el retiro de lo que probaba el motor guiado.
- Las dos suites que necesitan TypeScript y React **fallan** si no encuentran esas herramientas. Antes
  terminaban con éxito y la suite pasaba sin comprobar nada; ahora hay que declarar `CONTENT_QA_SKIP=1`
  para omitirlas a sabiendas.

## Comprobaciones en navegador

Se usaron puertos locales separados del origen de desarrollo habitual, y se limpió `localStorage` antes
de cada recorrido para no heredar avance de pruebas anteriores.

- Datos con Python: resolver el módulo 1 con Python real, ver las tres validaciones en verde y comprobar
  los mensajes de error de sintaxis y de `import pandas`.
- Node.js: resolver el módulo 1; comprobar los avisos de npm, archivo inexistente y lectura sin `utf8`.
  El bloqueo por niveles impidió saltar al módulo 12 sin completar los anteriores, que es lo correcto.
- TypeScript: comprobar que un tipo equivocado detiene la compilación con línea y mensaje, y que el
  programa correcto compila y se ejecuta.
- React: resolver el módulo 1 y comprobar que la interfaz se dibuja en el marco de vista previa, que
  sigue con `sandbox=""`.
- JSON: comprobar el mensaje de comillas simples con línea y columna, y el análisis de estructura de un
  documento válido.
- El título de la pestaña en modo revisión ahora muestra el nombre de la ruta en las catorce páginas:
  antes decía solo «Código Cero · Revisión» en las siete que no tenían `og:title`.

## Límites que se deben mantener explícitos

- Solo navegador integrado de escritorio; falta probar dispositivos físicos, Safari y lectores de pantalla.
- Los doce ejercicios de cada ruta se cubren automáticamente; no se recorrieron manualmente todos en navegador.
- La ruta de inteligencia artificial no ejecuta ningún modelo: calcula tokens, costos, similitud y softmax
  sobre datos locales, y analiza la estructura de un prompt. No evalúa la calidad de una respuesta ni genera
  texto; los precios y el tokenizador son aproximaciones declaradas en pantalla.
- Python se ejecuta con un intérprete propio que cubre un subconjunto amplio del lenguaje, contrastado con
  CPython. No es CPython: no hay módulos externos (import), input(), clases, archivos ni expresiones
  generadoras. Lo declara en pantalla.
- Node.js no es un proceso de Node: los archivos, los módulos y el servidor son simulados, y no hay npm,
  red, Buffers ni código asíncrono. Lo que se ejecuta de verdad es el JavaScript que escribe la persona.
- TypeScript no usa tsc: el verificador es propio y cubre un subconjunto declarado. Cuando no puede
  determinar un tipo lo deja pasar en vez de inventar un error, así que puede dejar escapar problemas que
  tsc sí detectaría. Quedan fuera las clases, los módulos, async y los tipos avanzados.
- React no es React: no hay reconciliación con DOM virtual, ni `useEffect`, ni contexto, ni renderizado
  concurrente, ni fragmentos vacíos. Solo se contrasta el primer render con React real; la secuencia de
  interacciones se prueba contra el propio laboratorio.
- El validador de JSON cubre un subconjunto de JSON Schema. Quedan fuera las referencias, los combinadores
  como `allOf` o `anyOf`, los formatos y las expresiones regulares dentro del esquema.
- Las comprobaciones HTML/CSS son patrones educativos, no un validador completo de semántica o accesibilidad.
- Progreso y borradores se guardan en un solo navegador y origen. No hay cuentas ni sincronización. Las
  cuatro rutas que dejaron de ser mini cursos empiezan con progreso vacío: cambian de clave de
  almacenamiento y no migran el avance anterior.
- La vista previa permite revisar el sitio publicado, pero sus archivos y el repositorio siguen siendo
  públicos. El enlace de revisión no autentica ni protege información privada.

## Próxima revisión

Probar la experiencia con principiantes y dispositivos reales. Registrar tropiezos didácticos antes de
seguir ampliando el catálogo. Mantener el mantenimiento hasta autorización expresa.
