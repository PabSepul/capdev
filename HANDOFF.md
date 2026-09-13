# Traspaso y continuidad de CápsulasDev

Estado al 13 de septiembre de 2026. Base inicial: `adf9e2b`.

### Entrega de itinerarios, feedback, calidad y respaldos

Después de una prueba informal positiva con varias personas adultas, se mantuvo
la dirección visual y se añadieron tres itinerarios opcionales en la portada:
Desarrollo web, Python y datos, y Herramientas profesionales. Cada uno muestra
orden, avance y próximo paso sin bloquear la exploración libre. La selección se
guarda localmente y, cuando existe una cuenta, se sincroniza con el perfil.

Los laboratorios de las 19 rutas muestran orientación según el itinerario. Tras
ejecutar un ejercicio aparece una pregunta breve sobre su claridad; si necesita
mejoras, la persona puede indicar explicación, misión, resultado, pistas u otro
aspecto. Son datos cerrados: no incluyen texto libre ni el código escrito. El
feedback de visitantes queda en el dispositivo y el de cuentas entra en la cola
de sincronización existente.

Se corrigió `learning_sync`: Docker y MongoDB ya forman parte de las rutas
admitidas y se agregaron las operaciones `preference` y `feedback`. La migración
incremental está en
`supabase/migrations/202609120001_learning_experience.sql`. Se aplicó a producción
el 13 de septiembre y se comprobó que la columna `itinerary` y la función con
Docker, MongoDB y feedback quedaron activas. El commit `30de716` es el punto
público anterior a esta entrega.

La calidad queda automatizada en `.github/workflows/quality.yml`, que ejecuta
las 26 suites con Node 22, Python 3.12 y las dependencias de contraste. Se añadió
una página 404 coherente con el sitio y se corrigieron textos visibles que aún
usaban la marca anterior, además de precisar que Python ejecuta el subconjunto
educativo disponible en la plataforma.

Los scripts de `scripts/` preparan, crean, verifican, cifran y programan un
respaldo diario de los esquemas `public` y `auth` de Supabase en OneDrive. Las
contraseñas se protegen con DPAPI fuera del repositorio, el dump temporal se
crea fuera de OneDrive y se elimina solo después de verificar el archivo cifrado.
La retención predeterminada es de 30 días. Ver `RESPALDOS.md`.

La configuración quedó protegida con DPAPI y la tarea de Windows se activó el
13 de septiembre a las 03:00. El primer respaldo automático de prueba terminó
con código `0` y creó `capsulasdev-20260913-180834.7z` en OneDrive, con 19154
bytes. La próxima ejecución quedó programada para el 14 de septiembre a las
03:00. Un primer intento inmediatamente después de cambiar la contraseña falló
por propagación; el script eliminó el dump vacío y el reintento fue correcto.

La revisión local cubrió la portada estrecha, la selección de itinerario, la
orientación de Python y JavaScript, la aparición del feedback después de ejecutar
y su confirmación local. El usuario autorizó aplicar la migración y publicar el
13 de septiembre; la migración quedó confirmada antes de preparar el commit.

Las 26 suites pasaron en una corrida completa el 13 de septiembre. También
pasaron `node --check` sobre los controladores modificados y `git diff --check`.

### Repositorio principal desde el 11 de septiembre de 2026

El proyecto se trasladó a `https://github.com/PabSepul/capdev` con un historial
limpio. El commit raíz contiene el estado completo y tiene a
`PabSepul <pablosepulvedadz@gmail.com>` como único autor, sin trailers de
coautoría. La copia local conserva el historial anterior en `legacy-main` y el
repositorio previo como `legacy-origin`; `origin/main` apunta a `capdev`.

GitHub Pages se activó desde `main`, raíz `/`. El dominio personalizado continúa
siendo `capsulasdev.com`; Supabase, Resend y Namecheap no cambian porque la URL
pública se conserva. HTTPS está forzado y el despliegue `34706339328` terminó
correctamente. GitHub atribuye el repositorio público solo a `PabSepul`.
`PabSepul/SpanaPS.github.io` quedó privado como respaldo y la copia provisional
`PabloSepul/capdev` también quedó privada.

### Última entrega publicada: nuevas rutas Docker y MongoDB

Se añadieron dos rutas completas, con doce módulos y tres mini exámenes cada una.
Docker cubre imágenes, contenedores, puertos, variables, Dockerfile, construcción,
caché, `.dockerignore`, volúmenes, redes, Compose y un proyecto final. MongoDB
cubre `find`, filtros, operadores, `findOne`, orden, límites, conteos, valores
distintos, inserción, actualización, eliminación y una consulta integradora.
El catálogo muestra los logotipos oficiales de Docker y MongoDB con el mismo
sistema vectorial, tamaño y tratamiento visual que las demás rutas.

`new-tech-labs.js` implementa simuladores locales y acotados. Docker interpreta
comandos, Dockerfile, `.dockerignore` y una parte de Compose sin ejecutar Docker
Desktop ni modificar el equipo. MongoDB trabaja sobre cuatro documentos
ficticios y admite un subconjunto de mongosh con objetos JSON estrictos, sin
conectarse a una base externa. Las páginas explican expresamente estos límites.
`new-tech-courses.js` contiene los 24 módulos, 72 comprobaciones y 30 preguntas.

Las rutas usan la misma ficha educativa y estética de Python: propósito, ejemplo,
tres pasos, predicción, misión, tres pistas, orientación por criterio, reflexión,
reto y conexión. Se agregaron al catálogo y a `learning-state.js`; el sitio pasa
a 19 rutas, 256 ejercicios y 64 mini exámenes. El progreso y los borradores de
las rutas anteriores se conservan, y las rutas nuevas tienen espacios separados.
`learning-state.js` y `starter-course.js` se versionan como
`20260910-newtech1` en todas las páginas que los cargan.

Pasan `new-tech-routes.test.mjs`, `starter-course.test.mjs`, `home.test.mjs` y
`learning-state.test.mjs`. Se ejecutaron los 24 ejemplos y soluciones, se rechazó
cada inicio incompleto y se comprobaron límites de los simuladores. Docker y
MongoDB se revisaron en escritorio, modo oscuro y a 390 px; ambos reportaron
`innerWidth`, `scrollWidth` y ancho del body de 390 px, sin desbordamiento.
Publicada en `7089299`; GitHub Pages `34559305184` finalizó correctamente.
Revisión pública: `https://capsulasdev.com/docker.html` y
`https://capsulasdev.com/mongodb.html`.

### Publicado en la misma entrega: estándar aplicado a las rutas restantes

Después de JavaScript se aplicó la ficha de `ESTANDAR-CURSOS.md` a SQL, Git y
GitHub, APIs, Terminal, Expresiones regulares, Inteligencia artificial, Datos con
Python, Node.js, TypeScript, React, JSON, Markdown y documentación, Accesibilidad
web y Pruebas automatizadas. El alcance comprende 180 módulos: dieciséis en SQL,
Git y APIs, y doce en cada una de las otras once rutas, respetando todos los
niveles que existen actualmente.

`starter-course.js` incorpora perfiles pedagógicos adaptados al tipo de
laboratorio. Aprovecha los ejemplos, conceptos, escenarios, misiones, pistas y
comprobaciones existentes para añadir prerrequisitos, tres pasos explicados,
predicción razonada, reflexión, reto opcional, ayuda para el primer criterio
pendiente y conexión con el siguiente módulo. Los cierres de nivel también
explican qué se consolidó. Se conservaron índices, orden, soluciones,
validadores, exámenes, progreso y borradores.

Las trece rutas con interfaz común incluyen los paneles de apoyo y reto de
`course-learning.css`, con la estética ya igualada a Python. SQL conserva
`sql-guide.js`, sus ejemplos resueltos, tablas, diccionario, errores frecuentes
y preguntas para evitar duplicar información; el apoyo común se usa allí para
la orientación específica después de una consulta incompleta. Las catorce rutas
cargan la hoja compartida. La versión actual del controlador compartido se
documenta en la entrega de Docker y MongoDB.

`starter-course.test.mjs` recorre todos los módulos base de las catorce rutas y
comprueba contenido, visibilidad, tres pasos y orientación. La prueba de expansión
comprueba también los dieciséis módulos de SQL, Git y APIs. Pasan todas las suites
propias: SQL; Git/APIs; Terminal; Regex/IA; Datos con Python; Node.js; TypeScript;
React; JSON; Markdown; Accesibilidad y Testing. Los contrastes disponibles usan
Node, TypeScript, React, `JSON.parse`, CommonMark, DOM real y `node:assert`;
CPython continúa sin estar disponible en esta máquina.

La revisión real en navegador cubrió las catorce rutas en modo oscuro y a 390 px.
Todas reportaron `innerWidth`, `scrollWidth` y ancho del body de 390 px, sin
desbordamiento horizontal; los apoyos, pasos y orientación aparecieron en cada
laboratorio. Git se revisó visualmente en escritorio y móvil, y SQL en escritorio
con su guía especializada. Esta actualización también se publicó en `7089299`.

### Publicado en la misma entrega: ruta JavaScript completa

Se aplicó `ESTANDAR-CURSOS.md` a los cuatro niveles y los dieciséis módulos de
JavaScript, desde variables hasta la transformación e integración de datos. Se
conservaron los índices, el orden, las misiones, los validadores, los exámenes,
las claves de progreso y los borradores existentes. Cuentas, infraestructura y
mantenimiento no se modificaron.

`javascript-learning.js` añade a cada módulo un propósito práctico, ejemplo
completo, explicación en tres pasos, predicción con respuesta, tres pistas
graduales, orientación para cada comprobación, reflexión, reto opcional y un
cierre que conduce al siguiente módulo o nivel. El recorrido usa situaciones
cotidianas como organizar una salida, preparar presupuestos, filtrar opciones y
resumir un plan. Los cuatro niveles tienen cierres propios.

`javascript.html` incorpora los mismos paneles pedagógicos y el mismo orden
visual que Python. Usa `course-learning.css`, cuya escala calculada coincide con
`python-foundations.css` en márgenes, rellenos, bordes, radios, fondos, colores,
tamaños, pesos e interlineados. `starter-course.js` aplica la ampliación de forma
opcional. `javascript-learning.js` conserva la versión `20260910-javascript1`;
el controlador compartido usa la versión indicada en la entrega local más reciente.

Pasan `starter-course.test.mjs`, `course-expansion.test.mjs`,
`accounts-ui.test.mjs` y `learning-state.test.mjs`. Las pruebas recorren los
dieciséis módulos, comprueban sus fichas y ayudas, y ejecutan cada ejemplo tanto
en el intérprete educativo como en JavaScript nativo, comparando el resultado.
En el navegador local se verificaron la predicción, el inicio incompleto y su
orientación específica. La comparación real con Python confirmó estilos
idénticos; las vistas de escritorio y móvil se revisaron visualmente. A 390 px,
`innerWidth`, `scrollWidth` y el ancho del body son 390 px, sin desbordamiento
horizontal.

Esta actualización también se publicó en `7089299`.

### Última entrega publicada: ruta HTML/CSS completa

Por solicitud del usuario se aplicó `ESTANDAR-CURSOS.md` a los cuatro niveles y
los dieciséis módulos de HTML/CSS, en orden. Se conservaron índices, orden,
misiones, validadores, exámenes, claves de progreso y borradores. Cuentas,
infraestructura y mantenimiento no se modificaron.

`html-css-learning.js` añade a cada módulo prerrequisitos, un ejemplo completo,
dos a tres pasos explicados, una predicción con respuesta, tres pistas graduales,
orientación específica para cada comprobación, reflexión, reto opcional y un
cierre conectado con el módulo siguiente. Los cuatro niveles tienen ahora un
cierre propio que enlaza estructura, estilos, composición e interfaces
utilizables. `course-learning.css` y el marcado de `html-css.html` presentan esos
apoyos como paneles desplegables accesibles.

`starter-course.js` admite estos apoyos de forma opcional: las rutas aún no
actualizadas mantienen su interfaz anterior y no muestran paneles vacíos. Al
cambiar de módulo se cierran las respuestas y retos abiertos; después de probar
una solución incompleta se explica el primer criterio pendiente. El controlador
también respeta textos de cierre específicos cuando el curso los define. Su URL
se renovó a `20260910-htmlcss1` en todas las páginas que lo cargan.

Pasan `starter-course.test.mjs`, `course-expansion.test.mjs`,
`review-preview.test.mjs` y `learning-state.test.mjs`. La prueba de expansión
comprueba las dieciséis fichas de HTML/CSS y su orientación ante fallos. En el
navegador local se verificaron el ejemplo, los desplegables, la vista previa y
la ayuda del módulo 1. La emulación móvil real confirmó `innerWidth`, `scrollWidth`
y ancho del body en 390 px, sin desbordamiento horizontal; se revisó visualmente
la lección apilada. El usuario solicitó publicar esta entrega. Contenido y estándar
publicados en `04375fb`; GitHub Pages `34443512789` finalizó correctamente. Se
comprobaron HTTP 200, la versión `20260910-htmlcss1`, los paneles nuevos y el
contenido del cuarto nivel en `capsulasdev.com`. Mantenimiento conservado.
Revisión local: `http://127.0.0.1:4317/html-css.html`.

Corrección visual posterior solicitada por el usuario: el primer arreglo de
contraste todavía conservaba una tarjeta exterior, acento lateral, rellenos y
tamaños distintos a Python. `course-learning.css` replica ahora la escala de
`python-foundations.css`: márgenes, rellenos, bordes, radio, fondos, colores,
tamaños, pesos e interlineados calculados coinciden en ambos paneles. La misión
también aparece antes del apoyo, como en Python; solo se conserva la fila «Antes
de empezar», propia del estándar nuevo. La hoja se versiona como
`20260910-htmlcss3`. La prueba de expansión fija la escala compartida y evita
variables ajenas al tema. Comparación real en modo oscuro: todos los estilos
medidos de apoyo, resumen, lista, predicción, textos, reto y orientación fueron
idénticos; las pruebas de expansión, controlador y cuentas pasaron.

### Estándar de actualización de las demás rutas

Se creó `ESTANDAR-CURSOS.md` por solicitud del usuario. Define una ficha editorial,
criterios de compatibilidad y validación, adaptaciones para las 16 rutas restantes,
pruebas pertinentes y un prompt reutilizable. Se enlaza desde README.md.
El estándar y su primera aplicación a HTML/CSS se publicaron en `04375fb`.

### Última entrega publicada: Python completo, proyectos 9–20

El usuario pidió extender el enfoque pedagógico aprobado primero a los proyectos
9–12 y después a 13–16 y 17–20. Tras revisar el resultado, solicitó publicar la
entrega completa. Se mejoraron los tres
niveles restantes: colecciones de datos, funciones propias e integración final.
Los doce proyectos conservan IDs, validadores, soluciones de referencia,
exámenes, progreso y borradores existentes.

Cada proyecto 9–20 incluye ahora un ejemplo completo y ejecutable, explicación paso a
paso, predicción con respuesta desplegable, misión alineada con las comprobaciones,
inicio que requiere intervención, tres pistas graduales, ayuda según el primer
criterio pendiente, reflexión y ampliación opcional. El contenido continúa desde
la lista de preparativos, continúa con funciones reutilizables y termina con
filtros, manejo de errores, reportes y un gestor de tareas. El inicio del proyecto
18 ahora captura ValueError y se ejecuta hasta el final; el alumno debe mejorar
el aviso para identificar el dato inválido. `python.js` se versiona como
`20260910-complete1`.

`python-foundations.test.mjs` cubre ahora los proyectos 1–20, todos sus ejemplos,
inicios ejecutables, orientación y variaciones de listas, diccionarios,
funciones, filtros, errores, reportes y el proyecto final. Pasan python-foundations, python-checkpoints y
starter-course; accounts-ui también pasó durante esta entrega. CPython no está
disponible para el contraste independiente. Revisión en navegador completada en
escritorio y a 390 px, sin desbordamiento horizontal; se comprobó el desbloqueo
normal de los niveles, los inicios de los proyectos 12, 13, 18 y 20 y sus mensajes
de ayuda. Funciones se revisó en escritorio y el proyecto final a 390 px.

Publicada en `210240f`, con GitHub Pages `34441104496` completado correctamente.
Se comprobaron HTTP 200, versión `20260910-complete1` y contenido de los proyectos
9, 13, 18 y 20 en capsulasdev.com. Mantenimiento, cuentas e infraestructura conservados.

### Entrega anterior publicada: nivel 2 de Python

El usuario aprobó el diseño y los primeros cuatro proyectos y pidió publicarlos
antes de seguir. Publicados en `40bbb13`, GitHub Pages ejecución `34425247336`
finalizada correctamente. Se comprobaron HTTP 200, portada nueva, apoyo pedagógico
y contenido de Python en capsulasdev.com. Mantenimiento conservado.

Después se extendió el contenido a los proyectos 5–8: edad ficticia, temperatura,
vueltas y preparativos. Incluyen ejemplos completos, explicación de cada paso,
predicciones con respuesta desplegable, pistas graduales, reflexión, ampliación
opcional y ayuda según la comprobación pendiente. Se explican los límites de >=,
< y range(), además de la sangría y len(). Se mantienen IDs, validadores, exámenes
y progreso. El cierre de ambos niveles conecta los contenidos siguientes.

El usuario revisó esta segunda entrega y solicitó publicarla. Se publicó en
`ee3450d` y GitHub Pages finalizó correctamente. `python.js` usa
versión `20260909-decisions1`; el CSS existente sigue igual. La prueba
`python-foundations.test.mjs` ahora cubre proyectos 1–8, 17/18/19 años,
9/10/24/25/30 grados, rangos vacíos y lista ampliada. Pasan también
python-checkpoints (20 proyectos, 60 validaciones, 5 exámenes), starter-course
y accounts-ui. CPython no está disponible para el contraste independiente.
Comprobado en navegador con ejecución y avance normal, tema oscuro de escritorio
y claro a 390 px sin desbordamiento. Vista de revisión: localhost:4317/python.html
(origen distinto de 127.0.0.1; contiene avance de prueba local de los proyectos
1–4 para acceder al nivel 2 sin modificar el progreso habitual).

La publicación se comprobó en capsulasdev.com y conservó el mantenimiento.

### Contenido aprobado: primeros cuatro proyectos de Python

Después de aprobar la dirección del diseño, el usuario autorizó mejorar los
primeros cuatro proyectos antes de extender el enfoque al resto. Ahora comparten
el contexto de organizar una salida: mensaje, presentación ficticia, gasto y
duración. Se conservan IDs, variables requeridas, validadores y progreso previo;
los borradores existentes no se sustituyen por los nuevos inicios.

`python.js` incluye ejemplos ejecutables explicados, preguntas de predicción con
respuesta desplegable, pistas graduales, reflexión y desafíos opcionales. El
código inicial de cada proyecto necesita intervención; el cuarto deja más pasos
por escribir. La orientación tras ejecutar explica la primera comprobación
fallida y distingue un error de ejecución. En esta primera entrega los apoyos
se ocultaban desde el proyecto 5; la entrega local posterior los extiende hasta
el 8. Se actualizó también el cierre del nivel para conectar lo aprendido.

Archivos nuevos: `python-foundations.css` y `python-foundations.test.mjs`.
Versionado Python: `20260909-foundations1`. Pasan python-foundations,
python-checkpoints, starter-course y accounts-ui. Los ejemplos y casos de 0 %,
15 %, 59/60/61/135 minutos se verificaron con el intérprete; CPython no está
disponible para el contraste de esta ejecución. Revisión visual y comprobación
del mensaje de ayuda en el navegador local. El usuario aprobó esta entrega y
solicitó publicar el rediseño y los contenidos antes de continuar con el nivel 2.
La publicación conserva el mantenimiento; no implica apertura del registro.

### Prioridad actual: extender el diseño aprobado de la portada

El usuario pidió dejar de ampliar la infraestructura y concentrarse en la
experiencia de aprendizaje. Se preparó una propuesta local de la portada para
compararla con la anterior antes de continuar. Al usuario le encantó la propuesta
y pidió seguir en esa dirección. Se extendió el estilo a las 17 rutas, Mi cuenta
y privacidad mediante `experience.css`. Esta dirección visual está aprobada;
el usuario solicitó su publicación junto con los contenidos aprobados. La entrega anterior de privacidad se publicó en
`470a16e`: GitHub Pages terminó correctamente y el aviso respondió HTTP 200 con
la nueva retención y el mantenimiento intacto.

La propuesta modifica `index.html` y añade `home.css`, `home.js` y
`home.test.mjs`. Presenta tres puntos de partida por objetivo, una cápsula de
ejemplo, catálogo con búsqueda y categorías, seis rutas iniciales ampliables a
las 17, continuidad arriba cuando existe progreso y preguntas frecuentes.
Conserva los controladores de cuentas y cursos. La extensión aplica colores,
tipografía, navegación y tarjetas coherentes; cabeceras de ruta más compactas,
guías introductorias desplegables, pasos visibles de entender/probar/comprobar y
formulario de acceso reorganizado. En móvil, el formulario de Mi cuenta aparece
antes que la explicación. Se corrigió el título antiguo de Python que anunciaba
tres niveles, pese a que hay cinco. El alcance de su intérprete sigue disponible
en un desplegable dentro del ejercicio. En esta etapa visual no se cambió autenticación ni contenido
de ejercicios, validación, exámenes, progreso o la política de privacidad.

Comprobado: starter-course, accounts-ui y home pasan; navegador en temas claro y
oscuro, categorías y búsqueda; vista móvil a 390 px sin desbordamiento horizontal.
Tras extender el diseño: python-checkpoints, starter-course, accounts-ui,
sql-guide y course-expansion pasan;
ejecución de Python comprobada también en el navegador. Revisión visual de
Python, HTML/CSS, SQL y Mi cuenta; móvil en HTML/CSS y cuenta sin desbordamiento.
La prueba de Python no encontró CPython local y avisó que omitió ese contraste.
Servidor de comparación temporal en `http://127.0.0.1:4317/` (propuesta) y
`http://127.0.0.1:4317/anterior/` (portada anterior). El servidor y la copia anterior
están en la carpeta temporal `capsulasdev-portada`, fuera del repositorio.
Si el servidor ya no está activo, se puede iniciar con Node y `server.cjs` de esa
carpeta, pasando la ruta absoluta del repositorio como argumento.

Siguiente paso: publicar lo aprobado y extender el enfoque pedagógico al nivel 2 de Python; no retomar
automáticamente las mejoras de infraestructura enumeradas más abajo.

### Actualización posterior: pruebas y respaldo confirmados por el usuario

Esta actualización sustituye los pendientes históricos equivalentes de abajo.
Última publicación: `d39b981`. El usuario confirmó funcionamiento del despliegue,
borrado de la cuenta y cero filas en las cinco tablas de aprendizaje, recepción
del reenvío de privacidad, alta por código, progreso entre dos navegadores y una
segunda cuenta con cero ejercicios. Después volvió a desactivar las altas en
Supabase Auth. Mantenimiento conservado; no hay autorización de apertura.

El usuario creó un respaldo de public y auth, restauró los datos seleccionados
en un proyecto separado y confirmó los recuentos y cero referencias huérfanas.
También confirmó la prueba del archivo cifrado local y de la copia descargada
de OneDrive. Son resultados comunicados por el usuario, no nuevas comprobaciones
ejecutadas por el agente. Procedimiento y límites en `CUENTAS.md`, sección
«Respaldos y retención acordados».

Frecuencia aceptada: semanal durante las pruebas y antes de cambios importantes;
diaria cuando se abra el registro; conservación de 30 días. Operación manual a
cargo del responsable del sitio, sin automatización ni eliminación programada.
El aviso de privacidad ya refleja esta retención, OneDrive cifrado, proceso
manual y diferencia entre eliminación activa y copias anteriores. Aclara además
el almacenamiento de Resend en Estados Unidos y sus plazos separados. El usuario
autorizó publicar esta entrega el 9 de septiembre. Próximo trabajo: concretar el registro de
bajas para restauraciones y completar los pendientes de apertura, siguiendo un
paso por respuesta. La restauración de
prueba sigue existiendo y no se ha probado el acceso de la aplicación contra ella.

### Continuación guiada por el usuario

El 9 de septiembre el usuario pidió terminar la comprobación pendiente y luego
darle un paso cada vez para que él realice las acciones. No continuar ejecutando
configuraciones externas automáticamente. Posteriormente autorizó publicar las
correcciones del repositorio; esa publicación conserva el mantenimiento y no
autoriza por sí sola cambiar Auth o abrir el sitio. El usuario completó después la
eliminación desde Mi cuenta y confirmó que se eliminó. Esa confirmación no es
una consulta posterior de las tablas: queda por verificar la cascada en el servidor.
No se ha retirado el mantenimiento.

Revisión solicitada después de la eliminación: main y GitHub coinciden en
14bf70e. Los tres commits nuevos exigen perfil para guardar, incorporan logotipos
y cambian los estilos de Mi cuenta. El frontend ahora tiene registrationEnabled
en true; no se verificó de nuevo la configuración externa de Auth en esta revisión.
El usuario pidió corregir los hallazgos de esa revisión y publicar esta entrega:
versiones renovadas de account.js, configuración,
estilos y catálogo en las 20 páginas; privacidad coherente con perfil obligatorio.
account.js recuerda que el perfil se verificó en este navegador y conserva la cola
al reabrir una página sin red; online/focus y el intervalo reintentan cargar sesión
y perfil antes de enviar. La marca local no autoriza ninguna petición al servidor.
Las respuestas tardías de inicialización también comprueban identidad y época.
Tras actualizar, el perfil debe verificarse una vez con red para guardar esa marca;
no hay service worker ni garantía de cargar páginas nuevas sin conexión.
Se corrigieron starter-course y course-expansion para probar los controladores con
su almacenamiento aislado; la integración Auth se prueba con DOM real en accounts-ui.
Las 21 suites pasan, incluyendo regresiones de recarga sin red, fallo al cargar
el perfil, reconexión, cambios de identidad y coherencia de versiones de recursos.

### Integración de cuentas autorizada, todavía en preparación

El usuario pidió implementar cuentas y sincronización en capsulasdev.com, comprado
en Namecheap. Confirmó lanzamiento inicial solo para adultos y que no tiene avance
antiguo que conservar. Implementación publicada en `a690dad`. La guía vigente es
`CUENTAS.md`; las instrucciones anteriores de esperar al piloto quedan superadas
para este alcance. No se ha autorizado retirar la pantalla de mantenimiento.

Implementado: pantalla de cuenta y privacidad, SDK oficial Supabase 2.116.0,
aislamiento por cuenta, cola sin descarte de intentos pendientes, permisos RLS,
deduplicación, borradores en conflicto, exportación y función de eliminación.
21 suites y 20 páginas. PostgreSQL se prueba con PGlite en la carpeta temporal
capsulasdev-account-qa; el flujo de interfaz se prueba con jsdom.

Estado externo confirmado: raíz con los cuatro A de GitHub Pages y www con
CNAME a pabsepul.github.io; DNS público comprobado. Propiedad de capsulasdev.com
verificada en GitHub mediante TXT de Namecheap. Despliegue exitoso, HTTPS
obligatorio activado y certificado para raíz y www. Raíz HTTPS responde 200;
HTTP y www redirigen 301 a https://capsulasdev.com/. Mantenimiento comprobado
en el navegador del dominio real.
Supabase capsulasdev (neofezxmcrmrijzxuqjo) existe en São Paulo, organización
CapsulasDev (reojjepzyoqafrpoujox). Migración SQL instalada con éxito; URL y dos
retornos HTTPS configurados. Altas públicas desactivadas en Auth, correo
verificado requerido. La API real rechaza SELECT anónimo sobre perfiles (401).
Función delete-account desplegada, con verificación explícita auth.getUser y
verificación JWT heredada desactivada. Rechaza sin sesión y token inválido (401).
SMTP y las dos plantillas OTP están guardados y el acceso real está probado.
El usuario creó Resend en el plan gratuito; no se contrataron planes de pago.

Continuación: el usuario ya creó Resend. Dominio capsulasdev.com agregado en
São Paulo (ID 02251202-8e9b-4615-8a08-87e7aad89615), verificado.
DKIM, los CNAME rsend y send, y DMARC están guardados en Namecheap. DNS comprobado
con 1.1.1.1 y 8.8.8.8. Resend confirmó el dominio y sus registros como Verified.
TLS Enforced guardado. Receiving y seguimiento sin habilitar.
La integración OAuth fue rechazada por revisión automática por pedir
Auth y Projects READ+WRITE para toda la organización. Se canceló ese flujo.
SMTP manual guardado con clave Sending access limitada a capsulasdev.com.
No se concedió OAuth ni se guardó la clave privada en el repositorio. Remitente:
acceso@capsulasdev.com, CápsulasDev, smtp.resend.com, 465, usuario resend,
intervalo 60. Plantillas Confirm sign up y Magic link or OTP guardadas con
supabase/templates/access-code.html y el asunto en español.
Prueba real: invitación y dos códigos entregados según Resend; invitación aceptada,
perfil «Prueba de integración» activado, cierre de sesión y acceso OTP correctos.
Python guardó un intento, un proyecto completado y un borrador; PostgreSQL confirmó
los registros y el avance reapareció al cerrar sesión y entrar con otro código.
RLS real pasó con rol authenticated y dos identidades mediante una transacción
revertida: datos propios visibles, cero filas ajenas en las cinco tablas y sin
permisos directos de INSERT de perfiles o UPDATE de rutas. Esto no sustituye una
prueba completa con dos cuentas y navegadores independientes.
Exportación pulsada sin error visible, archivo descargado aún sin inspeccionar.
El usuario confirmó la eliminación real; falta verificar la cascada, la prueba
entre dos navegadores, la entrega del reenvío y los respaldos.
El usuario confirmó privacidad@capsulasdev.com y proporcionó un destino privado.
El reenvío quedó guardado en Namecheap y se autorizaron códigos de prueba a ese
destino. No copiar su dirección privada al repositorio. Códigos entregados y usados;
la entrega del reenvío todavía no se ha probado. El aviso
continúa en preparación hasta validar correo y política de respaldos.
`account-config.js` contiene solo la URL y clave publicable. Los últimos cambios
del usuario preparan altas en el frontend; el último estado observado de Auth
tenía las altas públicas desactivadas.

Corrección publicada: Python registra los intentos
desde el botón de ejecución, incluidos los fallos de validación y los errores.
Antes guardaba progreso y borradores, pero no llamaba a `registrarIntento`.
La prueba de Python cubre ahora esa integración. El tiempo mide desde la última
apertura del proyecto, incluye pausas y se reinicia al volver a mostrarlo.

El usuario autorizó completar la integración, el dominio y la publicación de
estos cambios conservando mantenimiento. La recomendación histórica de esperar
al piloto no restringe esta solicitud.

Esta sección tiene prioridad sobre todo lo que venga después.

---

## 1. Objetivo general

**Código Cero** es una plataforma educativa estática en español para aprender a
programar desde cero, publicada en `https://intenta.cl` (GitHub Pages, repo
`PabloSepul/capdev`). La mantiene una sola persona: Pablo Sepúlveda.

La idea que gobierna todas las decisiones: **lo que el sitio dice que ejecuta,
lo ejecuta de verdad.** No hay simuladores que finjan una salida. Cuando algo
queda fuera del alcance de un laboratorio, se dice en pantalla en lugar de
inventar un resultado. Y cada motor escrito a mano se contrasta contra la
herramienta original —CPython, Node, tsc, React, `JSON.parse`— en las pruebas.

El sitio **está cerrado al público**: todas las páginas arrancan con una pantalla
de mantenimiento. Se revisa con un enlace privado. No se abre sin autorización
expresa de Pablo.

---

## 2. Stack tecnológico

Lo más importante que hay que entender: **no hay framework, no hay build, no hay
dependencias de producción.**

- HTML5 + CSS nativo con tokens de tema claro/oscuro + JavaScript de navegador.
- Cada ruta es una página HTML independiente que carga sus scripts con `<script src>`.
- Alojamiento: GitHub Pages sobre `main`, raíz `/`. Publicar = `git push`.
- **Node.js solo para las pruebas.** El sitio no lo necesita.
- Una sola dependencia de terceros, incorporada al repo con su licencia:
  `vendor/commonmark-0.31.2.min.js` (ruta Markdown). Ver `vendor/README.md`.
- Herramientas de QA (TypeScript 5.9.3, React 19.2.8) se instalan en una carpeta
  temporal, **nunca** como dependencias del sitio.

### Reglas que no se negocian

1. **Ningún intérprete usa `eval` ni `Function`.** Las pruebas lo verifican en
   cada laboratorio. Si necesitas ejecutar código de la persona, se escribe un
   intérprete o se extiende el que existe.
2. **Toda vista previa va en un `<iframe sandbox="">`** y, dentro del `srcdoc`,
   con `Content-Security-Policy: default-src 'none'`. Donde hacen falta imágenes
   se agrega `img-src data:` y nada más: una dirección externa no se descarga.
   `starter-course.test.mjs` recorre todos los `srcdoc` y lo exige.
3. **Versionado de recursos:** cada archivo lleva en la URL la versión de su
   último cambio (`archivo.js?v=20260907-perfil1`) y **todas** las páginas que lo
   cargan piden esa misma versión. Es normal que archivos distintos tengan
   versiones distintas. `starter-course.test.mjs` falla si una página se queda
   atrás.
4. **No se publica sin instrucción explícita** y no se retira el mantenimiento.
5. Lo que un laboratorio no hace, se declara en su página.

---

## 3. Estado actual

**19 rutas · 256 ejercicios · 64 mini exámenes · 22 páginas · 24 suites.**

| Ruta | Ejercicios | Motor | Contrastado contra |
| --- | ---: | --- | --- |
| Python | 20 | `python-runtime.js` | CPython 3.12 (95 programas) |
| HTML y CSS | 16 | vista previa en iframe | — |
| JavaScript | 16 | `starter-runtime.js` | — |
| SQL | 16 | motor SQL en `starter-runtime.js` | — |
| Git y GitHub | 16 | `git-lab.js` | — |
| APIs | 16 | `api-lab.js` | — |
| Terminal | 12 | `terminal-lab.js` | — |
| Expresiones regulares | 12 | `RegExp` del navegador | — |
| Inteligencia artificial | 12 | `ia-lab.js` (solo calcula) | — |
| Datos con Python | 12 | `python-runtime.js` | CPython (12 soluciones) |
| Node.js | 12 | `node-lab.js` | Node real, con servidor levantado |
| TypeScript | 12 | `ts-lab.js` | tsc 5.9.3 (63 programas) |
| React | 12 | `react-lab.js` | React 19.2.8 (12 renders) |
| JSON | 12 | `json-lab.js` | `JSON.parse` (666 documentos) |
| Markdown | 12 | CommonMark 0.31.2 | — |
| Accesibilidad | 12 | `accessibility-lab.js` | — |
| Pruebas automatizadas | 12 | `testing-lab.js` | `node:assert` (31 ejecuciones) |
| Docker | 12 | `new-tech-labs.js` | simulación acotada, sin Docker Desktop |
| MongoDB | 12 | `new-tech-labs.js` | simulación local de un subconjunto de mongosh |

### Los tres últimos commits

**`7089299` — Amplía y unifica las rutas de aprendizaje.** Completa JavaScript,
aplica el estándar pedagógico al resto del catálogo y añade Docker y MongoDB.

**`bef1462` — Iguala los apoyos de HTML y CSS con Python.** Corrige la escala y
la presentación de los paneles educativos para conservar el diseño aprobado.

**`f2ce7a1` — Corrige el contraste de los apoyos de HTML y CSS.** Mejora la
legibilidad de los paneles de explicación y predicción.

### El modelo de datos (lo más importante que cambió)

```
codigo-cero.perfil-v1
{
  esquema: 1,
  instalacion: "a1b2c3d4",        // anónimo, generado en el navegador
  creado, actualizado,            // ISO
  rutas: {
    python: {
      completados: [1, 2, 3],     // Python usa ids 1–20; el resto, índices desde 0
      examenes: [1],
      activo: 3,
      borradores: { "3": "código..." },
      intentos: { "3": 11 },      // contador permanente por módulo
      actualizado: 1757000000000
    }
  }
}

codigo-cero.intentos-v1
{ esquema: 1, eventos: [ { r, m, v: "101", ok, e, ms, t } ] }   // máx 400, rota
```

`v` es una cadena de 0/1, una por comprobación. **No se guarda el código escrito**
en el registro de intentos. Los borradores sí contienen código, y el panel lo
advierte.

La migración desde las 51 claves anteriores ocurre en la primera lectura y **no
borra nada**.

### API de `learning-state.js`

```js
globalThis.LearningState = {
  routes,                                  // las 17 rutas con count, offset, unit
  progress(id), session(id), resumeIndex(id), storageAvailable(),
  perfil(), refrescar(),                   // refrescar suelta la caché en memoria
  completados(id), examenes(id),
  save(id, indice, codigo), removeDraft(id, indice),
  completar(id, valor), aprobarExamen(id, nivel),
  registrarIntento(id, indice, { validaciones, aprobado, error, ms }),
  atascos(minimo), bitacora(), resumen(),
  exportar(), importar(texto), borrar(), esquema
};
```

---

## 4. Problemas pendientes

**No hay defectos conocidos. Las 19 suites pasan.** Lo que sigue son límites y
decisiones abiertas, no errores.

### El pendiente que importa

**Nadie ha usado esto todavía.** Ninguna persona aprendiendo ha tocado el sitio.
Es el único punto donde la plataforma no tiene ninguna evidencia, y lleva tres
revisiones pendiente. Todo lo demás es secundario frente a esto.

### Límites declarados (no son defectos)

- Los laboratorios de Node, TypeScript y React **son simulaciones**: no hay un
  proceso de Node, ni tsc, ni el runtime de React. Cada página lo declara y las
  pruebas contrastan contra las herramientas reales.
- El verificador de TypeScript, cuando no puede determinar un tipo, **deja pasar**
  en vez de inventar un error. Puede escapársele algo que tsc sí detectaría.
- El laboratorio de accesibilidad no certifica conformidad WCAG.
- El enlace de revisión es un secreto compartido en un repositorio público:
  **no es autenticación**.
- Sin pruebas en dispositivos físicos, Safari ni lectores de pantalla.

### Detalles que conviene conocer antes de tocar el código

- `read()` en `learning-state.js` cae a una copia en memoria cuando el
  almacenamiento falla. Da resistencia si el navegador lo bloquea, pero un
  `localStorage.clear()` hecho desde fuera no se nota hasta recargar. `borrar()`
  sí escribe un documento vacío.
- Tras migrar, **las 51 claves antiguas siguen en el navegador**. No molestan y
  se dejaron a propósito como red de seguridad; nadie las limpia.
- La profundidad de las rutas es despareja a propósito: Python 20, cinco rutas
  16, once rutas 12.

### Antes de cualquier trabajo con cuentas

1. **Verificar la ley chilena de datos personales** (Ley 21.719 y su entrada en
   vigor). Un sitio así va a tener menores. Esto no se puede dar por sabido.
2. **Cambiar el dominio primero.** `capsulasdev.com` está comprado y sin
   configurar. Las cuentas se atan al dominio; migrarlas después duele.
3. **La autenticación no se escribe a mano.** Todo en este proyecto está escrito
   a mano y ha sido correcto. Esta es la única excepción, sin matices.

---

## 5. El próximo paso exacto

**Correr el piloto con 3 a 5 personas que estén aprendiendo de verdad.**

No hace falta construir nada más: la infraestructura para hacerlo está lista y
publicada. El procedimiento completo está en `README.md`, sección «Cómo correr un
piloto». En corto:

1. Cada persona usa el mismo navegador durante toda la prueba.
2. Al terminar, en la portada abre «Tu avance» y pulsa **Descargar archivo**.
3. Te manda ese `.json`.
4. Todos los archivos en una carpeta, y:

```powershell
node analizar-avance.mjs C:\ruta\a\la\carpeta
```

**Lo que NO hay que hacer todavía:** construir usuarios, roles ni base de datos.
Esa fue una decisión razonada, no una postergación. Hacerlo antes del piloto daría
toda la infraestructura —autenticación, respaldos, obligaciones legales—
sincronizando `[0,1,2]`, que no dice dónde se traba nadie. El movimiento 3
(cuentas y roles) se hace **solo si el piloto muestra que la gente vuelve**.

Si Pablo pide avanzar sin piloto, el orden es: dominio → verificación legal →
autenticación con un proveedor → modelo en Postgres con el esquema que ya existe.

---

## 6. Estructura de archivos

### Núcleo compartido

| Archivo | Qué hace |
| --- | --- |
| `learning-state.js` | **Único dueño del avance.** Documento, migración, intentos, exportar/importar. |
| `starter-course.js` | Controlador de las 16 rutas de tipo *starter*. Una rama por `kind` en `runModule`. |
| `starter-exams.js` | `LEVEL_EXAMS` por ruta: 5 preguntas, 4 alternativas, explicación. |
| `starter-runtime.js` | Intérprete de JavaScript + motor SQL. `runJavaScript(fuente, { globals })`. |
| `python-runtime.js` | Intérprete de Python. `globalThis.PythonRuntime.run(fuente)`. |
| `base-courses.js` | Contenido de HTML/CSS y JavaScript. Solo lo cargan sus dos páginas. |
| `course-expansion.js` | Cuarto nivel de HTML/CSS, JavaScript, SQL, Git y APIs. |
| `course-kit.js` | Ayudantes compartidos por los cursos nuevos. |
| `catalog.js` | Portada: tarjetas, progreso y «tu próxima sesión». |
| `progress-panel.js` | Panel de respaldo, restauración y borrado en la portada. |
| `review-preview.js` | Mantenimiento y enlace de revisión. |
| `site.js`, `styles.css`, `learning-review.css`, `practice-courses.css` | Tema y estilos. |

### Laboratorios (uno por ruta con motor propio)

`git-lab.js` · `api-lab.js` · `terminal-lab.js` · `regex-lab.js` · `ia-lab.js` ·
`node-lab.js` · `ts-lab.js` · `react-lab.js` · `json-lab.js` · `markdown-lab.js` ·
`accessibility-lab.js` · `testing-lab.js`

### Herramientas (ninguna página las carga; se ejecutan con Node en local)

- `analizar-avance.mjs` — lee los respaldos del piloto y produce el informe.
  Está en el repositorio como las pruebas, pero no forma parte del sitio.
- `starter-harness.mjs` — arnés compartido por las pruebas de ruta.

### Contrato de un curso

```js
globalThis.XCourse = {
  name, kind,                       // kind decide la rama de runModule
  storageKey, examsKey,             // heredados; el avance lo guarda LearningState
  stages: [t1, t2, t3],
  levels: [{ title, description, modules: [...] }],
  lessons                           // los módulos en plano
};
```

Cada módulo:

```js
{
  kicker, title, shortTitle,        // shortTitle ≤ 34 caracteres o no cabe en la tarjeta
  duration, difficulty, file,
  intro, example, explanation,
  concepts: [3],                    // exactamente 3
  goal, hints: [3],                 // exactamente 3
  starter, success,
  checks: [3],                      // exactamente 3: { label, test(code, result) }
  scenario                          // opcional: datos del laboratorio
}
```

### Cómo agregar una ruta nueva

1. Motor (`x-lab.js`) si hace falta, con su contraste contra la herramienta real.
2. Contenido (`x-course.js`): 12 módulos + 3 exámenes en `StarterExams.LEVEL_EXAMS`.
3. Rama por `kind` en `runModule` de `starter-course.js` y entrada en `COURSES`.
4. Ruta en `learning-state.js` (`{ id, name, count, offset, unit }`).
5. Página `x.html` copiando una existente; ajustar Open Graph, textos y scripts.
6. Tarjeta en `index.html`.
7. Prueba `route-x.test.mjs` usando `starter-harness.mjs`.
8. Subir la versión del archivo cambiado **en todas** las páginas que lo cargan.
9. `README.md`, `QA.md`, `HANDOFF.md`.

### Verificación

```powershell
# Las 16 suites sin paquetes externos de QA (el contraste Python requiere CPython)
node starter-course.test.mjs; node learning-state.test.mjs; node analisis-avance.test.mjs
# ... (la lista completa está en README.md)

# Las tres que exigen TypeScript, React o jsdom; fallan si no los encuentran
$qa = Join-Path ([IO.Path]::GetTempPath()) 'capsulasdev-content-qa'
npm install --prefix $qa --ignore-scripts --no-audit --no-fund typescript@5.9.3 react@19.2.8 react-dom@19.2.8 @types/react @types/react-dom jsdom@26.1.0
node route-typescript.test.mjs
node route-react.test.mjs
node route-accessibility.test.mjs
```

Vista local: `python -m http.server 4174 --bind 127.0.0.1`
Revisión publicada: `https://intenta.cl/?revision=septiembre-2026`
Salir de revisión: `https://intenta.cl/?maintenance`

### Una advertencia práctica sobre el entorno

En Windows, los heredocs de Bash corrompen las barras invertidas y algunos
caracteres UTF-8 (`·`, acentos). Para cualquier parche que contenga expresiones
regulares o acentos, escribe el script con una herramienta de escritura de
archivos y ejecútalo, en vez de usar un heredoc.

---

## Notas anteriores (historial, no estado operativo)

## Actualización vigente: 3 de septiembre de 2026

Esta sección reemplaza el estado operativo y los próximos pasos de las notas históricas que siguen.

El usuario autorizó publicar **toda la actualización**, manteniendo la pantalla de mantenimiento para
el público. No autorizó abrir el sitio de forma general. El destino sigue siendo GitHub Pages, `main`, raíz `/`,
repositorio histórico `PabSepul/SpanaPS.github.io`; no se migró el hosting ni se añadieron servicios en esa entrega.

- Respaldo previo local: `38667bf`, con todo el desarrollo que estaba sin confirmar.
- Portada: avance en las ocho tarjetas, grupos separados de rutas y mini cursos y «Continuar donde quedaste».
- `learning-state.js`: conserva las claves anteriores; añade módulo activo, fecha y borradores por ruta.
- `catalog.js`: muestra proyectos/módulos y exámenes por separado; cada ruta exige todos sus módulos y un examen
  por nivel (Python: 20 + 5; las demás: 12 + 3). El número de exámenes se deduce de `count / 4`.
- `learning-guidance.js`: 24 ayudas (HTML/CSS y JavaScript) con resultado esperado y error frecuente.
- `learning-review.css`: ajustes de lectura, controles y anchura de editores móviles en ambos temas.
- Python: cambios de código invalidan la validación pendiente. Los veinte proyectos se ejecutan con el intérprete
  real de `python-runtime.js`, así que aceptan cualquier solución válida; las validaciones revisan la salida y las
  variables, no la forma del texto.
- Los niveles de Python se llaman por su contenido: conceptos básicos, decisiones y ciclos, colecciones de datos,
  funciones propias e integración final. No se promete dominio «experto».
- Navegación con teclado en pestañas y foco de los exámenes mejorados.

### Revisar el sitio montado sin abrirlo al público

Entrada: `https://intenta.cl/?revision=septiembre-2026`.
Salida: `https://intenta.cl/?maintenance`, o el enlace «Salir y ver mantenimiento» del aviso de revisión.

`review-preview.js` se carga inmediatamente después de la lógica de mantenimiento de cada HTML.
El HTML comienza cerrado (`class="is-maintenance"`), por lo que sin JavaScript sigue mostrando mantenimiento.
El enlace habilita la revisión en esa pestaña y conserva el estado en `sessionStorage`. Los enlaces internos
incluyen el parámetro para funcionar incluso si el almacenamiento está bloqueado. `?maintenance` tiene prioridad.
No hay credenciales: **es una vista previa por enlace, no autenticación ni privacidad**; fuente y contenido
siguen siendo públicos. Ambos modos declaran `noindex, nofollow`.


### Intérprete de Python del 3 de septiembre de 2026

`python-runtime.js` reemplazó al intérprete de una línea y a los ocho modelos guiados. Es un intérprete escrito para
el proyecto: tokenizador con INDENT/DEDENT, analizador sintáctico descendente y evaluador propio.

Qué reconoce:

- Enteros y decimales con la distinción real de Python (`10 / 5` da `2.0`, `10 // 5` da `2`).
- Textos, f-strings con expresiones y formato `:.2f`, listas, diccionarios, tuplas, rebanadas y desempaquetado.
- `if` / `elif` / `else`, `for`, `for ... in ... .items()`, `while`, `break`, `continue`, expresiones condicionales.
- `def` con parámetros por defecto y argumentos con nombre, `return`, recursión y comprensiones de listas.
- `try` / `except NombreDelError` / `finally` y `raise ValueError("...")`.
- Más de cuarenta funciones y métodos: `print` (con `sep` y `end`), `len`, `range`, `sum`, `min`, `max`, `abs`,
  `round` (mitad al par, como CPython), `int`, `float`, `str`, `bool`, `list`, `dict`, `tuple`, `sorted` (con `key`
  y `reverse`), `reversed`, `enumerate`, `zip`, `type`, más los métodos habituales de texto, listas y diccionarios.

Qué no reconoce, y lo dice en pantalla en vez de simular: `import`, `input()`, `lambda`, clases y archivos.

Garantías que no se deben romper:

- No usa `eval`, `Function` ni ejecución nativa. Hay una prueba que lo verifica sobre el texto del archivo.
- Límite de pasos, de profundidad de llamadas y de líneas de salida: un ciclo infinito se detiene con un aviso.
- El acceso a métodos usa tablas explícitas por tipo, así que no se llega al prototipo de JavaScript.
- Los errores se explican en español con el número de línea y el nombre del error de Python.

La fidelidad se comprueba contra CPython 3.12: `python-runtime.test.mjs` guarda 65 programas con su salida real y la
vuelve a comparar en vivo si el equipo tiene Python; `python-checkpoints.test.mjs` hace lo mismo con las 20 soluciones
de referencia de los proyectos. Si se agrega contenido nuevo, conviene ampliar esas listas antes que ajustar el motor.


### Rutas de Git y APIs del 4 de septiembre de 2026

Las dos tarjetas que estaban como «Próximamente» ya son rutas completas de 12 módulos, con la misma estructura de
niveles, puntos de control y exámenes que las demás. Se conectan al motor existente por el mismo punto que SQL:
`COURSES` en `starter-course.js` recibe `git: globalThis.GitCourse` y `apis: globalThis.ApisCourse`, y `runModule`
suma dos ramas para los tipos `git` y `api`.

- `git-lab.js`: repositorio simulado con área de trabajo, preparación, commits, ramas, ignorados y remoto.
  Cada módulo declara en `scenario` la carpeta inicial (archivos, commits previos, rama activa).
- `api-lab.js`: servidor HTTP simulado con `/cursos` y `/estudiantes`, autenticación por token, validaciones y
  paginación. Ejecuta varias peticiones por intento y reinicia los datos en cada ejecución.

Ninguno de los dos usa `eval`, `Function`, `fetch` ni red; hay una prueba que lo verifica sobre el texto de los
archivos. Cuando el estudiante pide algo fuera del alcance, ambos lo dicen explícitamente en vez de simular.

El token del laboratorio de APIs es `clave-demo-2026` y aparece en las pistas de los módulos: es parte del ejercicio,
no una credencial real.


### Ruta Terminal del 6 de septiembre de 2026

`terminal-lab.js` y `terminal-course.js` existían desde antes como archivos sueltos, sin commit y sin conexión con
el resto del sitio. Esta entrega los cablea: `terminal.html`, el registro en `COURSES` de `starter-course.js`, una
rama para el tipo `terminal` en `runModule`, la ruta en `learning-state.js` y la tarjeta en la portada.

El laboratorio es un shell con archivos virtuales en memoria. Cada módulo declara en `scenario` la carpeta con la
que empieza; sin `scenario` se usa `TerminalLab.initial()`. El resultado que reciben las validaciones trae
`{ text, output, error, history, state }`, donde `history` guarda cada línea con sus comandos y su salida, y
`state` el árbol de archivos final.

Dos ajustes hechos al cablear, ambos detectados por la prueba nueva:

- Los títulos cortos eran la frase completa del módulo y desbordaban las tarjetas del listado. Ahora hay una lista
  de `shortTitles` (`pwd y ls`, `cd y cat`, …) y una dificultad por nivel. La prueba falla si un título corto pasa
  de 34 caracteres.
- `echo "$HOME"` imprimía `$HOME` literal, algo que Bash real expandiría. Un laboratorio que enseña Bash no puede
  divergir en silencio, así que ahora avisa que no admite variables tampoco entre comillas dobles.

La ruta tiene 12 módulos y 3 exámenes: `course-expansion.js` no la cubre y no necesita cubrirla.


### Rutas de Regex e IA del 6 de septiembre de 2026

La única tarjeta que quedaba sin contenido —Inteligencia artificial— ya es una ruta completa, y se sumó una
tecnología nueva: Expresiones regulares. Ambas siguen el mismo cableado que las anteriores: `COURSES` en
`starter-course.js`, una rama por tipo en `runModule`, la ruta en `learning-state.js` y la tarjeta en la portada.

`regex-lab.js` usa `RegExp` del navegador, así que el resultado es el motor real y no una imitación. Lo único que
filtra es el riesgo de retroceso catastrófico: un cuantificador aplicado sobre un grupo que ya repite se rechaza
con un mensaje antes de compilar, porque un patrón así congela la pestaña.

`ia-lab.js` es el caso más delicado del proyecto: enseñar IA sin poder ejecutar un modelo. La decisión fue no
simular respuestas en ningún caso. El laboratorio calcula lo que sí es calculable —tokens, costo, similitud del
coseno, recuperación, softmax, verificación de citas— y analiza la estructura de un prompt con reglas explícitas.
Cada salida declara su alcance en pantalla. Si más adelante alguien conecta un modelo real, el contrato del
laboratorio no debería romperse: bastaría agregar un comando nuevo sin tocar los que ya calculan.

Dos ajustes que detectaron las pruebas al escribir el contenido:

- Dos módulos de regex usaban un texto de prueba donde el patrón esperado también coincidía con otros números.
  Se cambió el texto en vez de relajar la comprobación.
- El detector de restricciones del analizador de prompts no reconocía “no lo sabes”, que era justamente la frase
  que sugería su propia pista. Se amplió el detector.

El grupo «Más adelante» de la portada quedó con cuatro rutas del mapa: Markdown, JSON, accesibilidad y pruebas
automatizadas. Las cuatro son construibles con la infraestructura actual.

### Verificación y próximos pasos

Ejecutar las ocho suites antes de publicar nuevos cambios:

```powershell
node starter-course.test.mjs
node routes-git-apis.test.mjs
node terminal-route.test.mjs
node routes-regex-ia.test.mjs
node python-runtime.test.mjs
node python-checkpoints.test.mjs
node sql-guide.test.mjs
node mini-courses.test.mjs
node learning-state.test.mjs
node review-preview.test.mjs
```

Para comparar los modelos de datos con CPython, indicar un Python 3 disponible mediante `$env:PYTHON`.
No hay instalación npm, compilación ni dependencias nuevas. `QA.md` registra el alcance de las comprobaciones.

Próximo paso de producto: recorrer la vista publicada con usuarios principiantes, registrar dónde se traban
y ajustar las explicaciones. Después decidir si se necesitan editores libres con runtimes reales y/o cuentas.
No retirar mantenimiento ni presentar este enlace como un sistema privado. Para privacidad real, evaluar
autenticación en un proveedor o servidor con autorización explícita del usuario.

## Notas históricas del 2 de septiembre (no usar como estado operativo actual)

Fecha del traspaso: 2 de septiembre de 2026  
Repositorio: <https://github.com/PabSepul/capdev>  
Dominio público: <https://intenta.cl>  
Rama actual: `main`  
Último commit publicado: `05dd2a5 Activa pantalla temporal de mantenimiento`

## 1. Objetivo general

Transformar la antigua página de intenta.cl en **Código Cero**, una plataforma educativa en español para personas que quieren comenzar a programar mediante explicaciones breves, ejercicios editables y validación inmediata.

La arquitectura buscada es:

- Una portada general para explicar el proyecto y elegir qué tecnología aprender.
- Una página independiente para cada tecnología, evitando acumular todas las lecciones en una sola vista.
- Aprendizaje mediante proyectos o módulos pequeños agrupados en niveles.
- Pistas progresivas, validaciones y progreso guardado en el navegador.
- Funcionamiento correcto en modo claro, modo oscuro, escritorio y móvil.

El dominio público debe continuar mostrando mantenimiento hasta que el usuario autorice expresamente publicar la nueva experiencia.

## 2. Stack tecnológico

El proyecto es un sitio estático sin framework ni proceso de compilación:

- HTML5 semántico.
- CSS nativo en `styles.css`, con variables para temas claro y oscuro y diseño responsive.
- JavaScript vanilla.
- `localStorage` para el tema y el progreso de cada ruta.
- `iframe` con `sandbox=""` para la vista previa segura de HTML/CSS.
- Intérpretes propios y controlados para los ejercicios de Python, JavaScript y SQL. No se utiliza `eval`, `Function()` ni ejecución de código arbitrario.
- Pruebas con Node.js y módulos incorporados, sin dependencias externas.
- GitHub Pages mediante el archivo `CNAME` para `intenta.cl`.
- Fuente Inter cargada desde Google Fonts, con fuentes del sistema como alternativa.

No existen `package.json`, bundler, React, base de datos ni servidor backend.

## 3. Estado actual

### Publicado

`main` y `origin/main` apuntan al commit `05dd2a5`. El sitio público muestra una pantalla de mantenimiento.

La detección ocurre al comienzo de cada página:

```js
const publicHosts = ["intenta.cl", "www.intenta.cl"];
const showMaintenance = publicHosts.includes(window.location.hostname)
  || new URLSearchParams(window.location.search).has("maintenance");
```

Cuando se detecta el dominio público se agrega la clase `is-maintenance`, se oculta el resto del sitio y se añade `noindex, nofollow`.

### Solo en local, todavía sin commit ni publicación

- La portada fue separada del contenido educativo y ahora funciona como catálogo de rutas.
- Python tiene una página propia con 5 niveles, 20 proyectos, explicaciones, pistas, validaciones y progreso independiente.
- **HTML/CSS, JavaScript y SQL alcanzaron la misma profundidad: 3 niveles y 12 módulos cada una.**
- Las tres rutas comparten el motor de `starter-course.js` y los intérpretes de `starter-runtime.js`.
- El selector de tema vive en `site.js` y se comparte entre todas las páginas.
- La preferencia de tema y el progreso de cada tecnología usan claves separadas de `localStorage`.
- Las cuatro rutas tienen puntos de control: niveles que se desbloquean y un mini examen por etapa.
- La portada enlaza a ocho tecnologías: cuatro rutas extensas y cuatro mini cursos nuevos.
- **El servidor local se detuvo al terminar esta revisión.** Se inició temporalmente para comprobar HTTP y preparar la vista local. El usuario había pedido detenerlo al pausar el trabajo anterior; no se deja un proceso activo al finalizar. Usar localhost:4174 al iniciarlo de nuevo conserva el origen del progreso.

### Última ampliación: cuatro mini cursos locales

Se añadieron Node.js, Datos con Python, React y TypeScript, cada uno con página independiente y tres proyectos
guiados de aproximadamente 10, 12 y 15 minutos. El catálogo ya los enlaza como disponibles. Git/GitHub,
Terminal, APIs e IA siguen como próximos.

| Mini curso | Proyecto 1 | Proyecto 2 | Proyecto 3 |
| --- | --- | --- | --- |
| Node.js | Argumentos y conversión de minutos | Archivo JSON y reporte | Ruta HTTP, estado y fin de respuesta |
| Datos con Python | Cantidad, total y promedio | Normalización y etiquetas únicas | Diccionarios e importes por pedido |
| React | JSX y fragmentos | Componentes reutilizables y props | Estado y evento de un contador |
| TypeScript | Números frente a texto | Parámetros y retorno tipados | Interfaz y forma de un objeto |

Decisión de alcance: son **constructores por selectores con simulación didáctica**, no editores libres ni runtimes
nuevos. Las opciones generan ejemplos para copiar a un entorno real. Los modelos solo representan las
alternativas ofrecidas. Las páginas lo advierten antes de practicar y junto al código/resultado; no debe afirmarse
que ejecutan React, JSX, un compilador TypeScript, Node o Python completos. Node no abre puertos ni lee archivos
reales. React tiene una representación de tarjetas y un contador interactivo, no una dependencia React.
No se añadieron paquetes ni cambios en los intérpretes existentes.

Cada proyecto tiene introducción, tres conceptos, tres pasos, datos, misión, salida esperada, errores frecuentes,
tres pistas, pregunta de reflexión y tres comprobaciones. Para marcarlo completado hay que aprobar las tres;
cambiar opciones invalida la aprobación pendiente. Los tres proyectos están abiertos para explorar y son
introductorios, sin los niveles/exámenes de las rutas extensas.

Archivos nuevos:

- nodejs.html, datos-python.html, react.html, typescript.html.
- mini-courses.js: registro y saneamiento de opciones.
- nodejs-course.js, datos-python-course.js, react-course.js, typescript-course.js: contenido y modelos puros.
- mini-course.js y mini-course.css: constructor, resultados, progreso y estilos aislados.
- mini-courses.test.mjs: pruebas de los doce proyectos y de su interfaz.

Los recursos nuevos usan v=20260902-mini1; las versiones compartidas anteriores se conservan.

Claves de guardado (JSON con completed, drafts y active):

- codigo-cero.nodejs-mini-v1
- codigo-cero.datos-python-mini-v1
- codigo-cero.react-mini-v1
- codigo-cero.typescript-mini-v1

completed guarda índices 0, 1 y 2; se filtran valores inválidos y duplicados. Los borradores solo admiten opciones
de las listas declaradas. El guardado bloqueado no impide practicar; copiar tiene alternativa manual.
Restablecer opciones conserva el progreso. Las claves anteriores no se migran ni se borran.

Verificado con node mini-courses.test.mjs: 12 proyectos, 36 comprobaciones, 100 combinaciones, 24 resultados
contrastados con CPython, fragmentos Node contrastados con dobles en memoria de fs/HTTP, navegación,
persistencia, copia y alternativa manual, contador, datos corruptos/bloqueados, nueve páginas y mantenimiento.
Las tres suites anteriores también pasan. No se hizo QA visual de navegador ni se instaló un compilador JSX/TS:
las plantillas React/TypeScript requieren esa verificación adicional en un entorno real antes de ampliar su alcance.

### Ampliación de contenido del 2 de septiembre de 2026

Las tres rutas introductorias pasaron de 3 a 12 módulos, organizados en niveles como la ruta de Python.

| Ruta | Nivel 1 | Nivel 2 | Nivel 3 |
| --- | --- | --- | --- |
| HTML y CSS | Estructura: etiquetas, listas y enlaces, imágenes accesibles, semántica | Estilos: primeros estilos, tipografía, modelo de caja, estados `:hover` | Composición: flexbox, grid, responsive, componente final |
| JavaScript | Datos: variables, números, plantillas, booleanos | Decisiones y colecciones: `if/else`, `else if`, arreglos, ciclos | Funciones y proyecto: funciones, flechas, `map`/`filter`/`reduce`, carrito |
| SQL | Consultar: `SELECT`, `DISTINCT`, `WHERE`, comparaciones con `AND` | Buscar y ordenar: `LIKE`, `BETWEEN`, `ORDER BY`, `LIMIT` | Resumir y combinar: `COUNT`, `AVG`/`SUM`, `GROUP BY`, `JOIN` |

Cada módulo conserva la estructura pedagógica de Python: kicker, título, introducción, ejemplo, explicación, tres conceptos, misión, tres pistas progresivas, código inicial, duración, dificultad, mensaje de éxito y tres validaciones.

Para sostener ese contenido se creó `starter-runtime.js`, que contiene dos motores nuevos:

- **Intérprete de JavaScript.** Tokenizador, analizador sintáctico y evaluador propios. Soporta `const`/`let`, funciones declaradas y flecha, parámetros por defecto, `if/else if/else`, `for`, `for...of`, `while`, `break`, `continue`, plantillas con acentos graves, objetos, arreglos y sus métodos habituales (`push`, `map`, `filter`, `reduce`, `sort`, `join`, entre otros), además de `console.log`, `Math`, `Object`, `Number` y `String`. El acceso a propiedades usa listas explícitas, así que no se alcanza el prototipo ni `Function`. Hay límite de pasos, de profundidad de llamadas y de líneas de salida, y los errores se explican en español.
- **Motor de SQL.** Analizador propio para `SELECT` con `DISTINCT`, alias con `AS`, `WHERE` con `AND`/`OR`/`NOT`, paréntesis, `LIKE`, `IN`, `BETWEEN` y comparaciones, `GROUP BY`, funciones `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`, `ORDER BY` con `ASC`/`DESC`, `LIMIT` y `JOIN ... ON` entre dos tablas. La base de práctica ahora tiene `cursos` (7 filas) y `estudiantes` (8 filas) relacionadas por `curso_id`.

Las validaciones ya no dependen solo de expresiones regulares: cada módulo de JavaScript y SQL comprueba también el resultado real de la ejecución, es decir la salida de la consola, las variables creadas o las filas y columnas devueltas por la consulta.

Cambios de interfaz que acompañan la ampliación:

- Las tres páginas muestran pestañas de nivel (`#starter-level-tabs`) que reutilizan los estilos `.level-tabs` de Python.
- El listado de módulos muestra los 4 módulos del nivel activo: 4 columnas en escritorio, 2 hasta 980px y 1 hasta 820px.
- La etiqueta de dificultad y la duración se toman del módulo activo (`#starter-difficulty`).
- El mensaje de éxito es propio de cada módulo (`#starter-success-copy`).

Como el número de módulos cambió, el progreso guardado usa claves nuevas para no arrastrar avances antiguos que ya no corresponden: `codigo-cero.html-css-v2.completed`, `codigo-cero.javascript-v2.completed` y `codigo-cero.sql-v2.completed`.


### Puntos de control y mini exámenes de Python

La ruta de Python avanza por etapas: 5 niveles de 4 proyectos con un mini examen cada uno.

- Cada nivel declara su etapa (`stage`): conceptos básicos, avanzados y expertos.
- Al comenzar solo el nivel 1 está disponible. El nivel siguiente se desbloquea cuando los cuatro proyectos del
  anterior están completados; las pestañas de nivel, la franja superior y el botón de proyecto siguiente respetan ese
  bloqueo.
- Al terminar un nivel aparece el panel `#level-checkpoint` con el mensaje de cierre, el botón para rendir el mini
  examen y el acceso directo al nivel siguiente.
- Cada nivel tiene un mini examen de 5 preguntas de selección múltiple con 4 alternativas, explicación por pregunta y
  umbral de 4 aciertos. Se puede reintentar cuantas veces se quiera y al aprobar queda registrado.
- La ruta se marca como completada solo con los 20 proyectos y los 5 exámenes aprobados.

Los exámenes aprobados se guardan aparte del avance de proyectos, en `codigo-cero.python-v2.exams`.

La corrección vive en `gradeExam(levelId, answers)`, una función pura que recibe las respuestas y devuelve
`{ total, correct, passing, passed, details }`. La interfaz solo renderiza ese resultado, así que la lógica de
aprobación se puede probar sin DOM.

Durante la revisión en el navegador apareció un desborde horizontal en móvil: el botón del examen llevaba
`white-space: nowrap` y estiraba el panel a 406px dentro de una pantalla de 375px. Se corrigió permitiendo que el texto
del botón se ajuste y agregando `min-width: 0` a las columnas del panel.

### Avance posterior: puntos de control en HTML/CSS, JavaScript y SQL

Ya se implementó el pendiente del traspaso anterior. Las cuatro tecnologías comparten ahora el mismo recorrido:

- Completar los cuatro módulos de un nivel abre el siguiente y habilita el examen de esa etapa.
- Cada examen contiene cinco preguntas con cuatro alternativas y explicación individual. Se aprueba con cuatro aciertos.
- El examen no bloquea el siguiente nivel, pero los doce módulos y los tres exámenes son necesarios para cerrar la ruta.
- Se pueden repetir los exámenes; un repaso fallido no borra una aprobación anterior.
- Las pestañas y los botones de navegación impiden saltar hacia niveles bloqueados. Cambiar de nivel cierra el examen abierto.
- `starter-exams.js` reúne nueve exámenes y 45 preguntas específicas de las tres tecnologías, y exporta la función pura
  `StarterExams.gradeExam(courseId, levelId, answers)` para corregirlos.
- `starter-course.js` gestiona el estado, los puntos de control y la interfaz. Los índices de módulos son 0–11; los
  identificadores guardados de exámenes son 1–3.
- Se conservan las claves de módulos `codigo-cero.<ruta>-v2.completed`; se agregan
  `codigo-cero.html-css-v2.exams`, `codigo-cero.javascript-v2.exams` y `codigo-cero.sql-v2.exams`.
- Los módulos ya completados no se reinician. Si el avance previo tiene huecos, se conserva, pero es necesario terminar
  los niveles anteriores para acceder al siguiente. Valores corruptos de almacenamiento se ignoran de forma segura.
- Se invalida la comprobación al editar código: no se puede completar un módulo con una validación de un texto anterior.
- La interfaz reutiliza los paneles y temas de Python. Se ajustó el quiebre de líneas de respuestas largas y se mantuvo
  el arreglo de ancho de los editores.

Las pruebas nuevas son automatizadas con un DOM simulado y comprobaciones del HTML real. No se realizó una nueva
revisión visual de estos exámenes en el navegador; la revisión visual descrita a continuación corresponde al estado anterior.

### Reestructuración didáctica de SQL

El usuario pidió una segunda revisión de SQL, explicaciones mucho más didácticas y más secciones. Se conservaron los
doce módulos, sus índices, los tres exámenes y las claves v2, para no borrar avances. No cambió el intérprete.

- La ruta comienza explicando base de datos, tabla, fila, columna, consulta y resultado con el ejemplo de una academia.
- El explorador muestra los datos reales del motor (cursos y estudiantes) y un diccionario con tipos, unidades y relación
  curso_id → id. Aclara que inscritos es una cifra ficticia del catálogo y no el conteo de los ocho estudiantes de muestra.
- Los doce módulos se reescribieron con párrafos explicativos, pasos de un ejemplo distinto de la misión, ejemplo resuelto
  ejecutable, tabla esperada, tres pistas, dos errores frecuentes y pregunta de comprensión con respuesta desplegable.
- Los resultados se muestran como tablas HTML accesibles y con desplazamiento horizontal contenido, no como tablas ASCII.
  Los errores y resultados vacíos tienen mensajes diferentes.
- Hay secciones de guía rápida, modelo mental del orden de una consulta, diccionario, solución de errores y límites del laboratorio.
- Se añadieron tres desafíos fuera del progreso: cursos cortos ordenados, ciudades con IN y extremos con MIN/MAX. Su editor
  es independiente, conserva borradores en memoria y no altera el código del módulo ni las aprobaciones.
- La validación de SQL ahora compara columnas, valores y orden cuando corresponde. No basta devolver el mismo número de filas.
  En GROUP BY se admiten órdenes diferentes entre grupos empatados.
- SQL utiliza los nombres de etapa Primeras consultas, Búsquedas y rankings, y Reportes y relaciones; no promete nivel experto.

El contenido SQL se extrajo de starter-course.js hacia `sql-course.js` (`globalThis.SQLCourse`). La presentación adicional
vive en `sql-guide.js` (`globalThis.SQLGuide`) y `sql.css`, cargados solamente por sql.html. Orden de scripts: site → runtime
→ sql-course → sql-guide → starter-exams → starter-course. Las otras rutas conservan su presentación y contenidos.

Las comprobaciones son automatizadas con dobles de DOM y marcado real. No se hizo una nueva revisión visual en navegador
durante esta reestructuración. El navegador se abrió solo para entregar la vista local.

### Revisión visual previa del 2 de septiembre de 2026

La revisión se hizo con el navegador integrado sobre `http://localhost:4174/`, midiendo la geometría real de cada editor en lugar de confiar solo en capturas.

- `.code-input.starter-code-input` resuelve `display: block` y `grid-template-columns: none` en las tres rutas.
- Escritorio de 1280 px: `textarea` de 468 px. Móvil de 375 px: `textarea` de 225 px.
- Sin desbordamiento horizontal en el `textarea` ni en el documento, en modo claro y oscuro.
- Contraste del código sobre su fondo: 17.08 en modo oscuro y 16.24 en modo claro.
- Python conserva su editor con numeración: `grid-template-columns: 26px 360.5px` en escritorio.
- `?maintenance` sigue ocultando el sitio y aplicando `noindex, nofollow`.

Corrección aplicada durante esa revisión: `index.html` pedía `site.js?v=20260902-multiroute1` mientras el resto usaba
`multiroute2`, así que la portada podía servir un `site.js` viejo desde la caché.

La regla que quedó: **cada archivo lleva la versión de su último cambio, y todas las páginas que lo cargan deben pedir
esa misma versión.** Estado actual:

| Archivo | Versión en la URL | Páginas que lo cargan |
| --- | --- | --- |
| `styles.css` | `20260902-checkpoints2` | las cinco |
| `site.js` | `20260902-depth1` | las cinco |
| `starter-runtime.js` | `20260902-depth1` | html-css, javascript, sql |
| `starter-exams.js` | `20260902-checkpoints2` | html-css, javascript, sql |
| `starter-course.js` | `20260902-sql1` | html-css, javascript, sql |
| `sql-course.js` | `20260902-sql1` | sql |
| `sql-guide.js` | `20260902-sql1` | sql |
| `sql.css` | `20260902-sql1` | sql |
| `python.js` | `20260902-checkpoints1` | python |

Que `site.js` siga en `depth1` no es un error: ese archivo no ha cambiado desde entonces. Si se edita un archivo, hay
que subir su versión en **todas** las páginas que lo piden.

### Validaciones ejecutadas

- Las cinco páginas responden con HTTP 200 en local. La revisión de consola sin errores corresponde a la sesión visual anterior.
- No hay referencias locales faltantes ni IDs duplicados en las páginas.
- `site.js`, `python.js`, `starter-runtime.js`, `starter-exams.js`, `starter-course.js`, `sql-course.js` y `sql-guide.js` pasan `node --check`.
- `starter-course.test.mjs` resuelve los 36 módulos, comprueba que el código inicial de cada módulo **no** valide y que la solución sí lo haga, y verifica los mensajes de error de los intérpretes.
- La misma prueba ahora valida los nueve mini exámenes y sus 45 preguntas, umbrales, bloqueo, reintentos, explicaciones,
  conservación del progreso anterior, recarga, aislamiento entre rutas, almacenamiento bloqueado y cierre de cada ruta.
- También contrasta los selectores con el HTML real, busca IDs duplicados, comprueba archivos enlazados, versiones de caché,
  el orden de carga de scripts y la regla que corrige el ancho del editor.
- `python-checkpoints.test.mjs` revisa los datos de los tres exámenes, el desbloqueo progresivo de niveles, la navegación bloqueada, el examen aprobado, reprobado y reintentado, y el cierre de la ruta.
- `sql-guide.test.mjs` prueba las doce lecciones y ejemplos, los tres desafíos, el explorador y las tablas de resultados,
  consultas erróneas y vacías, valores dibujados como texto seguro, borradores y aislamiento respecto al progreso existente.
- Los 36 módulos se resolvieron dentro del navegador real en la sesión anterior; falta esa revisión para los nueve exámenes nuevos.
- Las llaves de `styles.css` están equilibradas.
- `git diff --check` no reporta errores de whitespace; solo aparecen advertencias normales de conversión LF/CRLF en Windows.

Para repetir las tres pruebas desde la raíz del repositorio:

```powershell
node starter-course.test.mjs
node python-checkpoints.test.mjs
node sql-guide.test.mjs
```

Resultado esperado:

```text
3 rutas, 36 módulos y 108 validaciones: OK
HTML/CSS, JavaScript y SQL: 9 mini exámenes, 45 preguntas; desbloqueo, reintentos, persistencia y cierre: OK
5 páginas: IDs, archivos, versiones, orden de carga y editor: OK
Python: 3 puntos de control, 15 preguntas y 6 escenarios de desbloqueo: OK
SQL didáctico: 12 lecciones, 12 ejemplos ejecutables, 3 desafíos, tablas, errores, aislamiento y progreso: OK
```

Las tres pruebas pasan después de la reestructuración de SQL.

## 4. Errores actuales y problemas pendientes

No hay errores funcionales conocidos.

Quedan estos puntos pendientes:

1. Los cambios están sin commit. No deben subirse sin autorización explícita del usuario.
2. El sitio público continúa en mantenimiento intencionalmente.
3. Los intérpretes de JavaScript y SQL cubren el subconjunto usado por los módulos más un margen razonable. Es una restricción deliberada: no son un motor de JavaScript ni una base de datos completa. Cualquier módulo nuevo debe comprobarse contra el intérprete antes de darlo por listo.
4. Falta la revisión visual del SQL reestructurado, los exámenes y los cuatro mini cursos en modo claro/oscuro y escritorio/móvil; la lógica tiene pruebas automatizadas.
5. Git y GitHub, Terminal, APIs e Inteligencia artificial siguen como próximas, sin contenido. Las otras cuatro ya tienen mini cursos guiados.
6. La revisión visual se hizo midiendo el DOM en Chromium. Si el usuario quiere, puede confirmar el aspecto en sus propios navegadores y dispositivos.

Estado de Git al actualizar este documento:

```text
## main...origin/main
 M README.md
 M index.html
 D script.js
 M styles.css
?? HANDOFF.md
?? datos-python.html
?? datos-python-course.js
?? nodejs.html
?? nodejs-course.js
?? react.html
?? react-course.js
?? typescript.html
?? typescript-course.js
?? mini-courses.js
?? mini-course.js
?? mini-course.css
?? mini-courses.test.mjs
?? html-css.html
?? javascript.html
?? python-checkpoints.test.mjs
?? python.html
?? python.js
?? site.js
?? sql-course.js
?? sql-guide.js
?? sql-guide.test.mjs
?? sql.css
?? sql.html
?? starter-course.js
?? starter-course.test.mjs
?? starter-exams.js
?? starter-runtime.js
```

Estos avances todavía no están confirmados ni publicados en `origin/main`: si se pierde el directorio local, se pierde
el trabajo no respaldado de esta actualización.

`script.js` no se eliminó conceptualmente: su contenido evolucionó y fue movido a `python.js`. Git todavía lo muestra como archivo eliminado y archivo nuevo porque los cambios no se han preparado ni confirmado.

## 5. Próximo paso exacto

### Antes de tocar nada: reconstruir el entorno

No hace falta instalar nada. Desde la raíz del repositorio:

```powershell
cd C:\Users\l3_pa\OneDrive\Documentos\ChatGPT\intenta
node starter-course.test.mjs
node python-checkpoints.test.mjs
node sql-guide.test.mjs
node mini-courses.test.mjs
& 'C:\Users\l3_pa\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' -u -m http.server 4174 --bind 127.0.0.1
```

El comando `python` no está en PATH en esta sesión; el comando anterior usa el intérprete incluido en el entorno.
Si se trabaja desde otro equipo, puede utilizarse `python -m http.server 4174` cuando Python esté instalado.

El servidor debe quedar en el puerto **4174** para conservar las URL usadas en este documento. Usar **localhost**
en el navegador conserva el origen del progreso anterior (127.0.0.1 tiene almacenamiento diferente). Con él arriba:

- <http://localhost:4174/> portada
- <http://localhost:4174/python.html> ruta con puntos de control
- <http://localhost:4174/html-css.html#laboratorio>, `javascript.html`, `sql.html`
- <http://localhost:4174/nodejs.html>, `datos-python.html`, `react.html`, `typescript.html`: mini cursos.
- Agregar `?maintenance` a cualquier URL para ver la pantalla pública.

Para probar desde cero, utilizar un perfil de prueba separado. No limpiar el progreso real del usuario. Las pruebas
automatizadas ya crean almacenamiento en memoria independiente y no modifican el avance del navegador.

### Siguiente paso pendiente

Revisar primero un mini proyecto de cada tecnología nueva: elecciones, pistas, salida, avance y copia. Pedir al usuario
una revisión de claro/oscuro y móvil; las pruebas unitarias no sustituyen esa revisión visual. Después revisar SQL: leer las tablas, recorrer un ejemplo, resolver una misión
y probar los desafíos adicionales. Después revisar el flujo de exámenes en HTML/CSS, JavaScript y SQL: completar un nivel, responder,
revisar explicaciones, reintentar y regresar al curso. Verificar claro/oscuro y escritorio/móvil sin borrar el progreso
real. No volver a implementar los puntos de control: ya están terminados.

Después de esa revisión, pedir autorización antes de confirmar o publicar los cambios. La pantalla pública de
mantenimiento debe permanecer hasta que el usuario pida explícitamente abrir el sitio.

Si se pide pasar los mini cursos a editores libres, decidir e integrar runtimes reales aislados: los modelos actuales
solo cubren los selectores declarados. No ampliar las promesas de ejecución sin cambiar esa arquitectura y probarla.

## 6. Estructura de archivos y código relevante

```text
intenta/
├── CNAME                    # Dominio intenta.cl
├── HANDOFF.md               # Este documento
├── README.md                # Descripción general y arquitectura
├── index.html               # Portada y catálogo de tecnologías
├── python.html              # Vista independiente de Python
├── html-css.html            # Ruta de HTML y CSS
├── javascript.html          # Ruta de JavaScript
├── sql.html                 # Ruta de SQL
├── nodejs.html / datos-python.html / react.html / typescript.html # Mini cursos
├── mini-courses.js          # Registro y opciones permitidas
├── nodejs-course.js / datos-python-course.js / react-course.js / typescript-course.js # Contenido
├── mini-course.js / mini-course.css # Interfaz, modelos visibles y progreso independiente
├── mini-courses.test.mjs    # Doce proyectos y cien combinaciones
├── site.js                  # Tema compartido y año del footer
├── python-runtime.js        # Intérprete de Python del laboratorio (contrastado con CPython)
├── python.js                # 20 proyectos, puntos de control y exámenes de Python
├── starter-runtime.js       # Intérprete de JavaScript y motor de SQL
├── sql-course.js            # 12 lecciones didácticas y 3 desafíos extra de SQL
├── sql-guide.js             # Explorador, tablas de resultados y guía didáctica
├── sql.css                  # Estilos exclusivos de SQL sobre el tema compartido
├── sql-guide.test.mjs       # Prueba de la experiencia didáctica de SQL
├── starter-exams.js         # 9 exámenes, 45 preguntas y corrección pura
├── starter-course.js        # Módulos, desbloqueos, exámenes y progreso de las 3 rutas
├── starter-course.test.mjs  # 36 módulos, 108 validaciones, 9 exámenes y pruebas de marcado
├── python-checkpoints.test.mjs # Prueba de niveles y mini exámenes de Python
├── styles.css               # Diseño compartido, temas y responsive
├── favicon.svg
└── og.png
```

### Responsabilidades principales

`site.js`

- Alterna entre `light` y `dark`.
- Guarda la preferencia en `codigo-cero.theme`.
- Actualiza `theme-color` y el año del pie de página.

`python.js`

- Contiene la estructura de los 5 niveles y 20 proyectos de Python.
- Renderiza lecciones, pistas, navegación y validaciones.
- Ejecuta únicamente el subconjunto de Python permitido por los ejercicios.
- Guarda el progreso de proyectos en `codigo-cero.python-v2.completed` y los exámenes aprobados en `codigo-cero.python-v2.exams`.
- Controla el desbloqueo de niveles (`isLevelUnlocked`), el panel de punto de control y los tres mini exámenes.
- `gradeExam(levelId, answers)` corrige sin tocar el DOM y es el punto de entrada para las pruebas.

`starter-runtime.js`

- Publica `globalThis.StarterRuntime` con `runJavaScript(code)` y `runSql(code)`.
- `runJavaScript` devuelve `{ output, text, error, environment }`.
- `runSql` devuelve `{ columns, rows, error, text }`, con `text` ya formateado como tabla.
- Contiene la base de práctica `cursos` y `estudiantes`.

`starter-course.js`

- Selecciona la ruta mediante `body[data-course]`.
- Contiene `COURSES` con 3 niveles y 12 módulos para `html-css` y `javascript`; incorpora SQL desde `globalThis.SQLCourse`.
- Aplana los niveles en una lista de módulos y mantiene la navegación anterior y siguiente sobre esa lista.
- Renderiza pestañas de nivel, listado, lección, pistas y validaciones.
- Para HTML/CSS construye `iframe.srcdoc` dentro de un iframe aislado.
- Para JavaScript y SQL delega la ejecución en `StarterRuntime`.
- Cada validación recibe `(code, result)`, así que puede comprobar el texto escrito y el resultado real de la ejecución.
- Controla el desbloqueo, renderiza puntos de control y exámenes, guarda aprobaciones y muestra el cierre de la ruta.

`starter-exams.js`

- Publica `globalThis.StarterExams` con el banco `LEVEL_EXAMS` y `gradeExam(courseId, levelId, answers)`.
- `gradeExam` recibe respuestas como arreglo, objeto indexado o Map, y devuelve `{ total, correct, passing, passed, details }`.
- Debe cargarse antes de `starter-course.js` en las tres páginas de rutas.

### Fragmento central de selección de ruta

```js
const course = COURSES[document.body.dataset.course];
if (!course) return;
```

Cada página declara su tecnología así:

```html
<body class="course-page starter-page" data-course="html-css">
<body class="course-page starter-page" data-course="javascript">
<body class="course-page starter-page" data-course="sql">
```

### Seguridad importante

- No sustituir los intérpretes por `eval`, `Function()` o ejecución directa del código del usuario.
- Mantener las listas explícitas de propiedades y métodos del intérprete de JavaScript: son las que impiden llegar al prototipo o a `Function`.
- Conservar los límites de pasos, profundidad y salida del intérprete.
- Mantener `sandbox=""` en el iframe de HTML/CSS.
- No quitar la lógica de mantenimiento ni publicar hasta que el usuario lo solicite.
- Preservar los cambios locales existentes: el árbol de trabajo está deliberadamente sin commit.
