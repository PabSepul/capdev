# Estándar de actualización de cursos — CápsulasDev

Versión 1 · 10 de septiembre de 2026.

Este documento define cómo actualizar las rutas con el enfoque aplicado a los
20 proyectos de Python. Es una guía para futuras entregas: no significa que los
demás cursos ya hayan sido actualizados. Las instrucciones del usuario para una
entrega concreta prevalecen sobre este estándar.

## 1. Objetivo y alcance de cada entrega

Ayudar a una persona adulta que empieza a programar a entender una idea, aplicarla
y comprobar su resultado con autonomía creciente.

- Trabajar por bloques de un nivel existente, normalmente cuatro módulos. El
  usuario puede pedir varios bloques; en ese caso completarlos en el orden indicado.
- Conservar la identidad visual aprobada, con explicaciones breves y apoyos
  desplegables. Añadir contenido útil sin convertir la pantalla en un manual largo.
- Usar español claro, datos ficticios y situaciones cotidianas. Cada curso puede
  tener su propio hilo: una página personal, una salida, un catálogo o un reporte.
  La continuidad debe ayudar a entender, sin forzar el contexto de Python.
- Introducir un concepto principal por módulo y reutilizar lo aprendido antes.
  El cierre del nivel puede integrar varios conceptos conocidos.
- Precisar curso, nivel, módulos y archivos antes de editar. Cuentas, dominio,
  infraestructura y mantenimiento quedan fuera de una actualización de contenido.
- Preparar y revisar en local. Publicar cuando el usuario lo indique; una
  autorización de publicación anterior no se extiende automáticamente a otra entrega.

## 2. Estructura mínima de cada módulo

| Pieza | Contenido esperado | Criterio de revisión |
| --- | --- | --- |
| Título y propósito | Una acción concreta y una situación donde resulta útil. | Se entiende qué podrá hacer la persona al terminar. |
| Prerrequisitos | Conceptos ya vistos que se reutilizan. | Ninguna técnica nueva aparece sin explicación. |
| Ejemplo completo | Código, consulta, documento o comandos que funcionan en el laboratorio. | Incluye los datos y el estado inicial necesarios; no depende de variables inexistentes. |
| Explicación paso a paso | De dos a cuatro pasos sobre lo que ocurre. | Relaciona instrucciones y resultado; no se limita a leer la sintaxis. |
| Predicción | Una pregunta antes de ejecutar, con explicación desplegable. | Se puede responder razonando sobre el ejemplo y su respuesta se ha comprobado. |
| Misión | Datos iniciales, transformación y resultado esperado. | Coincide con lo que las comprobaciones realmente evalúan. |
| Código inicial | Una base que necesita intervención. | No aprueba sin cambios y permite identificar el trabajo pendiente. |
| Tres pistas | Orientación, concepto y ayuda concreta, en ese orden. | La primera invita a pensar; la última permite superar el bloqueo. |
| Comprobaciones | Los criterios existentes expresados en lenguaje comprensible. | Evalúan requisitos observables y admiten soluciones equivalentes. |
| Orientación ante fallos | Qué revisar para el primer criterio pendiente. | Distingue un fallo de ejecución de una misión incompleta. |
| Reflexión | Cambiar un dato, anticipar y explicar el efecto. | Permite comprobar comprensión más allá de copiar la solución. |
| Reto opcional | Una ampliación pequeña con conceptos disponibles. | No cambia los requisitos para completar el módulo. |
| Cierre | Qué se logró y cómo conecta con lo siguiente. | Describe una habilidad concreta, sin prometer más de lo practicado. |

El ejemplo debe mostrar el mecanismo con una variación sencilla de los datos de
la misión cuando eso ayude a aprender. Una plantilla de sintaxis puede acompañarlo,
pero no sustituye al ejemplo completo. Las consultas SQL deben usar tablas reales
del laboratorio; los comandos necesitan su carpeta o estado de partida.

El inicio debería ejecutarse o renderizarse aunque produzca un resultado incompleto.
Se admite un error inicial cuando la misión sea precisamente diagnosticarlo: debe
estar explicado como parte del ejercicio y contar con un camino claro de reparación.
No introducir errores arbitrarios solo para impedir la aprobación.

Si el reto opcional añade líneas o cambia los valores exigidos, indicar que se
pruebe después de completar o en una copia. No penalizar ese trabajo ni sustituir
la solución guardada. Mostrar el límite del laboratorio cuando afecte la tarea.

## 3. Plantilla editorial por módulo

Completar esta ficha al preparar el contenido. Es una plantilla conceptual, no
un esquema obligatorio de JavaScript; se adapta a la estructura de cada ruta.

```text
Curso / nivel / identificador o índice actual:
Título:
Habilidad observable al terminar:
Conceptos previos que reutiliza:
Situación y propósito (2–3 frases):

Ejemplo completo:
Datos o estado inicial necesario:
Resultado esperado del ejemplo:
Paso 1: qué instrucción actúa y qué cambia.
Paso 2: cómo se utiliza ese resultado.
Paso 3: qué se observa al terminar.

Predicción:
Respuesta razonada:

Misión:
Código o documento inicial:
Comprobación 1 y ayuda si falla:
Comprobación 2 y ayuda si falla:
Comprobación 3 y ayuda si falla:

Pista 1 — dónde mirar o qué pregunta hacerse:
Pista 2 — concepto que permite avanzar:
Pista 3 — fragmento o pasos concretos:

Solución de referencia, para verificar la misión:
Variación válida o caso límite relevante:
Solución incompleta que debe rechazarse:
Reflexión:
Reto opcional:
Mensaje de éxito y conexión con el siguiente módulo:
```

## 4. Compatibilidad y calidad de las comprobaciones

1. Conservar IDs, índices, orden, claves de almacenamiento y pertenencia a niveles.
   Algunas rutas guardan índices desde cero; no insertar o reordenar módulos sin
   estudiar la migración. No reiniciar avances, exámenes, intentos ni borradores.
2. Mantener los resultados de las soluciones correctas existentes. Un cambio de
   texto no debe exigir resolver otra vez un módulo aprobado.
3. Comparar resultados completos, tipos, estructura o estado según el ejercicio.
   Para contar tres elementos, comprobar la cantidad; encontrar `3` dentro de
   `30` no acredita ese resultado. Para HTML, observar la estructura pertinente;
   para un comando, su efecto, además de su presencia si la técnica es obligatoria.
4. No copiar debilidades del validador de Python como parte del estándar. Si se
   detecta una en la ruta que se actualiza, documentarla y corregirla con una
   prueba de regresión cuando entre en el alcance. Conservar las soluciones
   correctas y el progreso previo. Si requiere una migración o cambia la misión,
   plantear ese ajuste de alcance por separado.
5. No relajar un validador para que un ejemplo incorrecto pase. Tampoco exigir la
   misma variable auxiliar, espacios o frase de la solución si no son parte de la misión.
6. Mantener los exámenes y sus aprobaciones. Revisar que pregunten conceptos
   enseñados; si se detecta una contradicción, corregirla con justificación y
   compatibilidad, sin ampliar el temario por accidente.
7. Distinguir funcionamiento real, simulación y aproximación. Una vista previa
   estática no demuestra una interacción; un laboratorio de IA no demuestra
   el comportamiento de un modelo externo.

## 5. Adaptación a cada curso

Este inventario orienta la actualización. Confirmar archivos y cantidades al
iniciar, porque el repositorio puede cambiar. Python ya tiene los cinco niveles
actualizados. Las otras 16 rutas se trabajan según las siguientes particularidades.

| Curso | Enfoque del contenido | Evidencia que debe revisarse | Fuente principal |
| --- | --- | --- | --- |
| HTML y CSS | Construir una página útil; separar significado HTML y presentación CSS. | DOM, resultado visual, ancho móvil y estados de foco cuando corresponda. | `base-courses.js`, `course-expansion.js` |
| JavaScript | Transformar datos y producir resultados con funciones y decisiones. | Valores, tipos y salida; explicar lo que admite el intérprete educativo. | `base-courses.js`, `course-expansion.js` |
| SQL | Responder preguntas sobre las tablas disponibles. | Columnas, filas, agregaciones y orden cuando sea un requisito; usar el diccionario de datos. | `sql-course.js`, `sql-guide.js`, `course-expansion.js` |
| Git y GitHub | Entender carpeta, preparación, commits y ramas como estados distintos. | Estado anterior y posterior del simulador; comandos en secuencia y efectos explicados. | `git-course.js`, `course-expansion.js` |
| APIs | Relacionar petición, parámetros, respuesta y errores. | Método, ruta, estado HTTP y cuerpo con datos del laboratorio; aclarar simulación. | `apis-course.js`, `course-expansion.js` |
| Terminal | Orientarse y manipular archivos dentro del entorno del ejercicio. | Directorio actual, árbol de archivos y salida; explicar antes los efectos de mover o borrar. | `terminal-course.js` |
| Expresiones regulares | Buscar, extraer o validar patrones concretos. | Casos que coinciden y que no; límites, grupos y banderas pertinentes. | `regex-course.js` |
| Inteligencia artificial | Formular una tarea, interpretar resultados y reconocer límites. | Cálculo o respuesta que realmente entrega el laboratorio; distinguir aproximaciones y criterio humano. | `ia-course.js` |
| Datos con Python | Transformar colecciones hasta producir un reporte. | Datos de entrada, transformación y resultado; declarar formatos y funciones disponibles. | `datos-python-course.js` |
| Node.js | Entender las operaciones del entorno y organizar pequeños programas. | Salida y estado del laboratorio; explicar qué partes del entorno están representadas. | `nodejs-course.js` |
| TypeScript | Usar tipos para detectar errores y describir datos. | Diagnóstico de tipos y resultado ejecutado; distinguir compilación y ejecución. | `typescript-course.js` |
| React | Construir componentes y relacionar datos, estado e interfaz. | Render y cambios de pantalla cuando corresponda; limitar JSX y APIs a lo soportado. | `react-course.js` |
| JSON | Representar, leer y validar información estructurada. | Parseo, tipos, propiedades y estructura; separar JSON de objetos JavaScript. | `json-course.js` |
| Markdown | Organizar documentos legibles con estructura y enlaces. | Árbol del documento y vista previa; respetar el dialecto soportado. | `markdown-course.js` |
| Accesibilidad web | Hacer contenido operable y comprensible. | Semántica, nombres, relaciones, teclado y contraste según el módulo; no presentar la revisión parcial como certificación. | `accessibility-course.js` |
| Pruebas automatizadas | Convertir requisitos en pruebas que detectan fallos. | Las pruebas pasan con código correcto y fallan con las variantes defectuosas pertinentes. | `testing-course.js` |

### Integración de los apoyos en la interfaz

- Python sirve de referencia editorial y visual, no de controlador para copiar.
  Sus campos `lesson` se renderizan actualmente en `python.js` y `python.html`.
- Las demás rutas utilizan `starter-course.js`; varias definen contenido mediante
  `CourseKit`. Añadir metadatos no basta: comprobar que se muestran en la página.
- SQL ya presenta ejemplos resueltos, pasos, errores frecuentes y preguntas mediante
  `sql-guide.js`. Reutilizarlo y completar lo que falte sin duplicar paneles.
- Cuando se añada soporte común, debe ser opcional para las rutas todavía no
  migradas. No mostrar tarjetas vacías ni preguntas heredadas de otro módulo.
- Usar controles semánticos y detalles desplegables accesibles. Al cambiar de
  módulo, reiniciar las respuestas desplegadas y la ayuda transitoria, conservando
  el borrador y el progreso que corresponden a cada módulo.
- Conservar el diseño de `experience.css` y los editores existentes. No trasladar
  funciones internas, nombres de archivos o información de infraestructura al flujo
  del alumno si no le ayudan a aprender.

## 6. Verificación y definición de terminado

Una entrega está lista para revisión cuando:

- Los módulos previstos cumplen la ficha editorial y encajan con el nivel anterior.
- Cada ejemplo funciona en el motor real de la ruta y su explicación coincide
  con la salida. El inicio necesita intervención y la solución de referencia pasa.
- Se comprueba al menos una variación relevante y un incumplimiento real de la
  misión. Probar límites cuando el concepto los tenga; no fabricar casos irrelevantes.
- Se ejecutan las pruebas existentes pertinentes una vez finalizados los cambios.
  Añadir regresiones para comportamientos o defectos nuevos; no duplicar pruebas
  de implementación ni exigir tests para simples cambios de redacción.
- Se revisan navegación, ayudas, ejecución o vista previa y resultado en navegador,
  en escritorio y a 390 px. Comprobar teclado y tema oscuro si afectan al cambio.
  El código puede desplazarse dentro de su panel; la página no debe desbordarse.
- Si se modifica un controlador compartido, comprobar también rutas sin actualizar,
  la guía SQL y el estado de aprendizaje afectado.
- Se preservan aprobaciones y borradores. No interpretar el avance temporal de
  una sesión invitada como evidencia de sincronización con una cuenta.
- `git diff --check` pasa y el diff contiene solo la entrega prevista.
- Los recursos modificados reciben una versión coherente en los HTML que los cargan.
- HANDOFF.md indica alcance, archivos, verificación, limitaciones y qué está local
  o publicado. No declarar despliegue exitoso hasta comprobarlo.
- Se entrega un enlace local usable y una explicación breve de qué revisar.

Pruebas orientativas según la ruta:

| Alcance | Suites existentes |
| --- | --- |
| HTML/CSS y JavaScript | `starter-course.test.mjs`, `course-expansion.test.mjs` |
| SQL | `sql-guide.test.mjs`, `starter-course.test.mjs`, `course-expansion.test.mjs` |
| Git y APIs | `routes-git-apis.test.mjs`, `course-expansion.test.mjs` |
| Terminal | `terminal-route.test.mjs` |
| Regex e IA | `routes-regex-ia.test.mjs` |
| Datos con Python, Node.js, TypeScript y React | `route-datos-python.test.mjs`, `route-nodejs.test.mjs`, `route-typescript.test.mjs`, `route-react.test.mjs`, según la ruta |
| JSON, Markdown, accesibilidad y pruebas | `route-json.test.mjs`, `route-markdown.test.mjs`, `route-accessibility.test.mjs`, `route-testing.test.mjs`, según la ruta |
| HTML compartido, carga o versiones | `starter-course.test.mjs`; `review-preview.test.mjs` si se afecta la revisión o el mantenimiento |
| Progreso, borradores o controladores que los modifican | `learning-state.test.mjs`, `accounts-ui.test.mjs` y las pruebas de la ruta afectada |

Si un contraste con un motor externo requiere una dependencia no disponible,
declarar qué se verificó y qué se omitió. No afirmar compatibilidad plena a partir
del intérprete educativo. No repetir todas las suites sin un cambio que lo justifique.

## 7. Prompt reutilizable

Sustituir los campos entre corchetes. Para varias entregas del mismo curso,
indicar expresamente el orden de los niveles que se deben completar.

```text
Continúa trabajando en CápsulasDev, en el repositorio:
C:\Users\l3_pa\OneDrive\Documentos\ChatGPT\intenta

Curso: [NOMBRE DEL CURSO]
Alcance: [NIVEL Y MÓDULOS; POR EJEMPLO, NIVEL 1, MÓDULOS 1–4]

Lee ESTANDAR-CURSOS.md y aplícalo a esta entrega. Lee HANDOFF.md como
contexto histórico y comprueba el estado real del repositorio. Respeta
los cambios existentes y distingue lo publicado de lo pendiente.

Mejora el contenido siguiendo la experiencia aprobada de Python:
propósito claro, ejemplo completo, explicación paso a paso, predicción
con respuesta desplegable, misión precisa, inicio que requiere trabajo,
tres pistas graduales, orientación ante fallos, reflexión, reto opcional
y conexión con el siguiente módulo o nivel.

Adapta esos elementos al laboratorio del curso. Reutiliza los apoyos
existentes y, si necesitas ampliar la interfaz compartida, mantén
compatibles las rutas que aún no se han actualizado. Conserva el diseño,
los identificadores, el orden, el progreso y los borradores existentes.

Verifica que la misión y sus comprobaciones coincidan. Conserva las
soluciones correctas; corrige los defectos del validador que entren en
este alcance con regresiones que demuestren el fallo. Si hace falta
cambiar contratos o migrar datos, presenta ese ajuste por separado.

Implementa la entrega, ejecuta las pruebas pertinentes y revisa el
resultado en escritorio y móvil. Corrige los problemas encontrados.
Actualiza HANDOFF.md y dame un resumen breve, limitaciones materiales
si las hubiera y un enlace local para revisar.

Mantén cuentas, infraestructura y mantenimiento en su configuración
actual. Espera mi indicación explícita antes de publicar esta entrega.
```

## 8. Orden sugerido de adopción

Comenzar por HTML/CSS, nivel 1, para concretar los apoyos en el controlador
compartido. Seguir con JavaScript y SQL para validar su adaptación a ejecución y
consultas. Después actualizar las demás rutas por niveles según la prioridad
del usuario. Este orden es una propuesta; no autoriza empezar a modificar cursos.
