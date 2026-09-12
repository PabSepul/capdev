(() => {
  "use strict";

  // Contenido local de repaso; no es una certificación ni una evaluación remota.
  const LEVEL_EXAMS = {
    git: [
      {
        levelId: 1, title: "Mini examen de repositorio y commits", passing: 4,
        intro: "Repasa qué hace cada paso del ciclo básico de Git. Necesitas cuatro aciertos de cinco.",
        questions: [
          { question: "¿Qué crea git init?", options: ["Una copia en GitHub", "El repositorio local, con la carpeta .git", "Un archivo .gitignore", "El primer commit"], answer: 1, explanation: "git init crea el repositorio en tu computador. Publicarlo en GitHub es un paso posterior y distinto." },
          { question: "¿Para qué sirve el área de preparación?", options: ["Para borrar archivos", "Para elegir qué cambios entran en el próximo commit", "Para subir al remoto", "Para crear ramas"], answer: 1, explanation: "git add coloca cambios en el área de preparación; solo eso entra en el commit siguiente." },
          { question: "Si modificas un archivo y haces commit sin git add, ¿qué ocurre?", options: ["Se guarda igual", "Git avisa que no hay nada preparado", "Se borra el cambio", "Se crea una rama"], answer: 1, explanation: "El commit solo guarda lo preparado. Sin git add no hay nada que confirmar." },
          { question: "¿Qué debe describir el mensaje de un commit?", options: ["El nombre del archivo", "El cambio que se hizo y por qué", "La fecha", "El nombre de la rama"], answer: 1, explanation: "El mensaje lo lee tu equipo (y tu yo futuro): describe el cambio, no el archivo." },
          { question: "¿Qué muestra git log --oneline?", options: ["Los archivos sin seguimiento", "Una línea por commit con su identificador y mensaje", "Las diferencias del último cambio", "Las ramas del repositorio"], answer: 1, explanation: "--oneline resume cada commit en una línea: identificador corto y mensaje." }
        ]
      },
      {
        levelId: 2, title: "Mini examen de correcciones", passing: 4,
        intro: "Comprueba cómo deshacer con seguridad y qué queda fuera del repositorio. Necesitas cuatro aciertos.",
        questions: [
          { question: "¿Qué hace git restore archivo.txt?", options: ["Lo borra del proyecto", "Devuelve el archivo a su última versión confirmada", "Lo saca del área de preparación", "Crea un commit nuevo"], answer: 1, explanation: "Sin --staged, git restore descarta los cambios locales y recupera la versión del último commit." },
          { question: "¿Y git restore --staged archivo.txt?", options: ["Descarta lo escrito", "Lo saca del área de preparación sin perder los cambios", "Lo sube al remoto", "Lo agrega al commit"], answer: 1, explanation: "--staged solo deshace el git add: el archivo conserva lo que escribiste." },
          { question: "¿Qué pasa con un archivo listado en .gitignore?", options: ["Se sube igual", "Git deja de mostrarlo y no lo versiona", "Se borra del disco", "Se convierte en rama"], answer: 1, explanation: "Los archivos ignorados no aparecen en git status ni entran con git add ." },
          { question: "¿Qué muestra git diff?", options: ["El historial completo", "Las diferencias entre tu archivo actual y el último commit", "Las ramas existentes", "Los remotos configurados"], answer: 1, explanation: "git diff compara el área de trabajo con lo último guardado, línea por línea." },
          { question: "¿Qué indica HEAD -> main en el historial?", options: ["Que falta hacer push", "Que estás parado en ese commit de la rama main", "Que el commit tiene errores", "Que la rama está protegida"], answer: 1, explanation: "HEAD señala tu posición actual; la flecha indica en qué rama estás trabajando." }
        ]
      },
      {
        levelId: 3, title: "Mini examen de ramas y GitHub", passing: 4,
        intro: "Últimas cinco preguntas sobre trabajo paralelo y publicación. Necesitas cuatro aciertos.",
        questions: [
          { question: "¿Para qué sirve una rama?", options: ["Para respaldar archivos", "Para trabajar en paralelo sin tocar la versión principal", "Para borrar el historial", "Para conectar con GitHub"], answer: 1, explanation: "Una rama es una línea de trabajo independiente que después puedes unir." },
          { question: "¿Qué hace git switch -c mejora?", options: ["Borra la rama mejora", "Crea la rama mejora y te cambia a ella", "Une mejora con main", "Publica la rama"], answer: 1, explanation: "La opción -c crea la rama y te sitúa en ella en un solo comando." },
          { question: "Antes de unir una rama con git merge, ¿dónde debes estar?", options: ["En la rama que aporta los cambios", "En la rama que recibirá los cambios", "En cualquiera", "Sin ramas activas"], answer: 1, explanation: "git merge trae los cambios hacia la rama actual, así que primero te cambias a la que recibe." },
          { question: "¿Qué configura git remote add origin <url>?", options: ["Sube los commits", "Guarda la dirección del repositorio remoto con el apodo origin", "Crea el repositorio en GitHub", "Descarga los cambios"], answer: 1, explanation: "remote add solo registra la dirección; enviar los commits es trabajo de git push." },
          { question: "¿Qué agrega la opción -u en git push -u origin main?", options: ["Fuerza el envío", "Deja recordada la relación entre tu rama y la del remoto", "Crea un commit", "Borra la rama anterior"], answer: 1, explanation: "Con -u las próximas veces basta escribir git push, sin repetir remoto ni rama." }
        ]
      }
    ],
    apis: [
      {
        levelId: 1, title: "Mini examen de peticiones", passing: 4,
        intro: "Repasa rutas, parámetros y códigos de estado. Necesitas cuatro aciertos de cinco.",
        questions: [
          { question: "¿Qué método se usa para pedir datos sin modificarlos?", options: ["POST", "GET", "DELETE", "PATCH"], answer: 1, explanation: "GET solo lee. Los métodos que escriben son POST, PUT, PATCH y DELETE." },
          { question: "¿Qué diferencia hay entre /cursos y /cursos/3?", options: ["Ninguna", "La primera es la colección y la segunda un recurso concreto", "La segunda no existe", "La segunda es un parámetro"], answer: 1, explanation: "La colección devuelve una lista; el recurso identificado devuelve un solo objeto." },
          { question: "En /cursos?nivel=Inicial&categoria=Web, ¿qué hace el símbolo &?", options: ["Cierra la ruta", "Separa un parámetro del siguiente", "Ordena los resultados", "Indica autenticación"], answer: 1, explanation: "? abre la lista de parámetros y & separa cada par clave=valor." },
          { question: "¿Qué significa el código 200?", options: ["El recurso no existe", "La petición se resolvió correctamente", "Falta autenticación", "El servidor falló"], answer: 1, explanation: "Los códigos 2xx indican éxito; 200 OK es la respuesta habitual de un GET." },
          { question: "¿Qué significa 404?", options: ["Error del servidor", "El recurso o la ruta no existen", "Falta el token", "Los datos son inválidos"], answer: 1, explanation: "404 Not Found es un error del cliente: se pidió algo que no está en el servidor." }
        ]
      },
      {
        levelId: 2, title: "Mini examen de escritura", passing: 4,
        intro: "Comprueba cómo crear, corregir y eliminar recursos. Necesitas cuatro aciertos.",
        questions: [
          { question: "¿Qué código devuelve una creación exitosa con POST?", options: ["200", "201", "204", "400"], answer: 1, explanation: "201 Created confirma que el recurso se creó e incluye el objeto con su id nuevo." },
          { question: "¿Dónde se escribe el cuerpo JSON de una petición?", options: ["En la ruta", "Después de una línea en blanco, bajo las cabeceras", "Dentro de la cabecera Authorization", "Antes del método"], answer: 1, explanation: "Las cabeceras van primero; una línea en blanco las separa del cuerpo." },
          { question: "¿Qué indica el código 400?", options: ["Que el servidor se cayó", "Que la petición tiene datos inválidos o incompletos", "Que falta el token", "Que el recurso fue borrado"], answer: 1, explanation: "400 Bad Request señala un problema en lo que enviaste; el cuerpo explica qué corregir." },
          { question: "¿Qué hace PATCH frente a PUT?", options: ["Borra el recurso", "Actualiza solo los campos enviados", "Crea uno nuevo", "Lee el recurso"], answer: 1, explanation: "PATCH modifica parcialmente; PUT espera el recurso completo." },
          { question: "¿Por qué un DELETE exitoso responde 204?", options: ["Porque falló", "Porque la operación funcionó y no hay contenido que devolver", "Porque falta autenticación", "Porque el recurso se movió"], answer: 1, explanation: "204 No Content significa éxito sin cuerpo: el recurso ya no existe." }
        ]
      },
      {
        levelId: 3, title: "Mini examen de APIs en producción", passing: 4,
        intro: "Últimas cinco preguntas sobre autenticación, paginación y consultas. Necesitas cuatro aciertos.",
        questions: [
          { question: "¿Qué significa el código 401?", options: ["El recurso no existe", "Falta la credencial o no es válida", "El dato es incorrecto", "El método no está permitido"], answer: 1, explanation: "401 Unauthorized: el recurso puede existir, pero no acreditaste permiso para operarlo." },
          { question: "¿Dónde viaja el token de acceso?", options: ["En la ruta", "En la cabecera Authorization", "En el nombre del archivo", "En el cuerpo obligatoriamente"], answer: 1, explanation: "Se envía como Authorization: Bearer <token> en cada petición que lo necesite." },
          { question: "¿Para qué sirve la paginación?", options: ["Para ordenar alfabéticamente", "Para pedir la colección por partes en lugar de completa", "Para autenticar", "Para borrar registros antiguos"], answer: 1, explanation: "Con pagina y tamano se piden bloques manejables de una colección grande." },
          { question: "En orden=-inscritos, ¿qué hace el guion?", options: ["Filtra los negativos", "Invierte el orden, de mayor a menor", "Excluye ese campo", "Es un error de sintaxis"], answer: 1, explanation: "El guion delante del campo indica orden descendente." },
          { question: "¿Por qué conviene comprobar con un GET después de escribir?", options: ["Porque el servidor lo exige", "Para confirmar que el cambio quedó guardado como esperabas", "Para borrar la caché", "Para renovar el token"], answer: 1, explanation: "Verificar el estado final evita asumir que una escritura funcionó cuando no fue así." }
        ]
      }
    ],
    regex: [
      {
        levelId: 1, title: "Mini examen de búsqueda", passing: 4,
        intro: "Repasa literales, clases, cuantificadores y anclas. Necesitas cuatro aciertos de cinco.",
        questions: [
          { question: "¿Qué hace la bandera g en /hola/g?", options: ["Ignora mayúsculas", "Devuelve todas las coincidencias, no solo la primera", "Busca solo al inicio", "Agrupa el resultado"], answer: 1, explanation: "Sin g el motor se detiene en la primera coincidencia; con g recorre todo el texto." },
          { question: "¿Con qué coincide \\d?", options: ["Cualquier letra", "Un dígito", "Un espacio", "El final de línea"], answer: 1, explanation: "\\d representa un dígito. \\w incluye letras, dígitos y guion bajo; \\s es un espacio." },
          { question: "¿Cuántos caracteres busca \\d{4}?", options: ["Al menos cuatro", "Como máximo cuatro", "Exactamente cuatro", "Cuatro o más, según el texto"], answer: 2, explanation: "{4} pide exactamente cuatro repeticiones. Para un rango se escribe {4,6}." },
          { question: "¿Qué diferencia hay entre + y *?", options: ["Ninguna", "+ pide al menos una repetición y * acepta cero", "* pide al menos una y + acepta cero", "+ solo funciona con dígitos"], answer: 1, explanation: "* puede coincidir con la nada; + exige que aparezca al menos una vez." },
          { question: "En /^Factura/gm, ¿qué agrega la bandera m?", options: ["Hace la búsqueda más rápida", "Aplica ^ y $ a cada línea en vez de a todo el texto", "Permite mayúsculas", "Multiplica las coincidencias"], answer: 1, explanation: "Sin m, ^ significa el inicio del texto completo; con m, el inicio de cada línea." }
        ]
      },
      {
        levelId: 2, title: "Mini examen de captura", passing: 4,
        intro: "Comprueba grupos, alternancia, reemplazo y nombres. Necesitas cuatro aciertos.",
        questions: [
          { question: "¿Para qué sirven los paréntesis en un patrón?", options: ["Para comentar", "Para capturar una parte del resultado", "Para acelerar la búsqueda", "Para ignorar mayúsculas"], answer: 1, explanation: "Cada par de paréntesis crea un grupo numerado que puedes reutilizar después." },
          { question: "¿Cómo se numeran los grupos?", options: ["Por tamaño", "De izquierda a derecha, según dónde abren", "Al azar", "De derecha a izquierda"], answer: 1, explanation: "El orden lo da el paréntesis de apertura, incluso si los grupos están anidados." },
          { question: "¿Qué significa (ERROR|WARN)?", options: ["ERROR seguido de WARN", "ERROR o WARN", "Ni ERROR ni WARN", "ERROR repetido"], answer: 1, explanation: "La barra vertical separa alternativas y el grupo delimita hasta dónde llega cada una." },
          { question: "En un reemplazo, ¿qué representa $2?", options: ["El segundo carácter", "El contenido del segundo grupo capturado", "Dos coincidencias", "El texto original"], answer: 1, explanation: "$1, $2 y siguientes insertan lo que capturó cada grupo, en el orden en que se abrieron." },
          { question: "¿Qué aporta (?<anio>\\d{4}) frente a (\\d{4})?", options: ["Busca más rápido", "Le pone nombre al grupo sin perder su número", "Deja de capturar", "Acepta letras"], answer: 1, explanation: "El nombre documenta el patrón; el grupo sigue existiendo también como $1." }
        ]
      },
      {
        levelId: 3, title: "Mini examen de casos reales", passing: 4,
        intro: "Últimas cinco preguntas sobre validar, acotar y normalizar. Necesitas cuatro aciertos.",
        questions: [
          { question: "¿Cuál es la diferencia entre buscar y validar?", options: ["Ninguna", "Validar exige anclar el patrón al inicio y al final", "Validar necesita la bandera g", "Buscar requiere grupos"], answer: 1, explanation: "Sin ^ y $, un patrón puede coincidir con un fragmento dentro de un texto más largo." },
          { question: "¿Qué significa [^:] ?", options: ["El carácter ^ seguido de :", "Cualquier carácter que no sea dos puntos", "El inicio de la línea", "Dos puntos obligatorios"], answer: 1, explanation: "Dentro de corchetes, ^ al inicio invierte la clase: coincide con todo lo que no esté en la lista." },
          { question: "¿Qué hace el signo ? en +?", options: ["Vuelve opcional el cuantificador", "Hace la repetición perezosa: toma lo mínimo posible", "Duplica la búsqueda", "Es un error de sintaxis"], answer: 1, explanation: "Por defecto los cuantificadores son ávidos; agregar ? los vuelve perezosos." },
          { question: "¿Por qué se evita un patrón como (\\d+)+ ?", options: ["Porque no compila", "Porque puede tardar muchísimo por retroceso del motor", "Porque no acepta banderas", "Porque solo busca dígitos"], answer: 1, explanation: "Un cuantificador sobre un grupo que ya repite obliga al motor a probar combinaciones que crecen de forma explosiva." },
          { question: "¿Qué conviene hacer antes de usar un patrón en producción?", options: ["Acortarlo lo más posible", "Probarlo con casos que deben pasar y casos que deben fallar", "Quitarle todos los grupos", "Escribirlo en una sola línea"], answer: 1, explanation: "Un patrón se valida con ejemplos positivos y negativos: lo que no debe coincidir importa tanto como lo que sí." }
        ]
      }
    ],
    ia: [
      {
        levelId: 1, title: "Mini examen de procesamiento", passing: 4,
        intro: "Repasa tokens, costo, similitud y temperatura. Necesitas cuatro aciertos de cinco.",
        questions: [
          { question: "¿Qué es un token para un modelo de lenguaje?", options: ["Una palabra completa siempre", "Una pieza de texto: puede ser una palabra corta o parte de una larga", "Una letra", "Una frase"], answer: 1, explanation: "El tamaño del token es variable: las palabras frecuentes suelen ser una sola pieza y las largas se dividen." },
          { question: "¿De qué depende principalmente el costo de una consulta?", options: ["De la cantidad de preguntas", "De la cantidad de tokens de entrada y salida", "Del idioma", "De la hora del día"], answer: 1, explanation: "Se cobra por tokens procesados, así que un texto largo cuesta más aunque sea una sola pregunta." },
          { question: "Si dos frases significan lo mismo pero usan palabras distintas, una similitud por palabras…", options: ["Da un puntaje alto", "Da un puntaje bajo aunque el significado coincida", "Da exactamente 1", "No se puede calcular"], answer: 1, explanation: "Comparar palabras no es comparar significado; por eso en producción se usan embeddings." },
          { question: "¿Qué hace bajar la temperatura a 0.2?", options: ["Acorta la respuesta", "Concentra la probabilidad en la opción más probable", "Aumenta la creatividad", "Reduce el costo"], answer: 1, explanation: "La temperatura agudiza o aplana la distribución; con valores bajos el resultado es más predecible." },
          { question: "¿La temperatura mide creatividad?", options: ["Sí, es su definición", "No: solo cambia cómo se reparte la probabilidad entre candidatos", "Solo en modelos grandes", "Sí, cuando supera 1"], answer: 1, explanation: "Es un parámetro estadístico. Una temperatura alta produce variedad, no necesariamente mejores ideas." }
        ]
      },
      {
        levelId: 2, title: "Mini examen de instrucciones", passing: 4,
        intro: "Comprueba cómo se escribe una instrucción completa. Necesitas cuatro aciertos.",
        questions: [
          { question: "¿Para qué sirve declarar un rol al inicio?", options: ["Para acelerar la respuesta", "Para orientar el tono y el nivel de detalle", "Para reducir el costo", "Para evitar errores de sintaxis"], answer: 1, explanation: "El rol le dice al modelo desde qué punto de vista responder y con qué profundidad." },
          { question: "¿Qué logra especificar el formato de salida?", options: ["Que la respuesta sea verdadera", "Que la respuesta llegue en una forma reutilizable y estable", "Que el modelo sea más rápido", "Que no se cobren tokens"], answer: 1, explanation: "Sin formato, cada ejecución devuelve una estructura distinta y cuesta usarla en un proceso." },
          { question: "¿Cuál es la mejor forma de reducir invenciones?", options: ["Pedir que sea preciso", "Acotar la fuente y permitir la respuesta “no lo sé”", "Subir la temperatura", "Escribir en mayúsculas"], answer: 1, explanation: "Limitar de dónde puede sacar la información y autorizar el “no sé” reduce mucho las respuestas inventadas." },
          { question: "¿Por qué ayuda incluir un ejemplo?", options: ["Porque alarga el prompt", "Porque fija el formato mejor que describirlo con palabras", "Porque baja el costo", "Porque evita usar el rol"], answer: 1, explanation: "Un caso resuelto comunica la forma esperada con menos ambigüedad que una descripción." },
          { question: "Un prompt con los seis elementos, ¿garantiza una respuesta correcta?", options: ["Sí, siempre", "No: mejora la estructura, pero el resultado igual debe verificarse", "Solo con temperatura 0", "Sí, si es largo"], answer: 1, explanation: "La estructura reduce errores de forma; la exactitud del contenido sigue necesitando revisión humana." }
        ]
      },
      {
        levelId: 3, title: "Mini examen de datos propios", passing: 4,
        intro: "Últimas cinco preguntas sobre recuperación, citas y verificación. Necesitas cuatro aciertos.",
        questions: [
          { question: "¿Por qué se recuperan documentos antes de responder?", options: ["Para gastar menos tokens", "Porque el modelo no conoce tus datos internos", "Para subir la temperatura", "Para evitar el formato"], answer: 1, explanation: "Un modelo general no vio tus documentos: hay que entregárselos junto con la pregunta." },
          { question: "Si la búsqueda recupera el documento equivocado, ¿qué pasa?", options: ["El modelo lo corrige solo", "La respuesta final estará mal aunque el modelo sea bueno", "Se cobra doble", "No afecta"], answer: 1, explanation: "La respuesta no puede ser mejor que el material recuperado: la recuperación es parte de la calidad." },
          { question: "¿Qué indica una respuesta que cita un identificador inexistente?", options: ["Que el documento se borró", "Que la respuesta fue inventada", "Que la búsqueda fue lenta", "Que faltó formato"], answer: 1, explanation: "Un identificador que no existe en la base es una señal clara de alucinación." },
          { question: "¿Para qué se pide que la respuesta cite su fuente?", options: ["Para alargarla", "Para poder verificarla sin conocer el tema", "Para subir la similitud", "Para reducir tokens"], answer: 1, explanation: "La cita convierte una afirmación en algo comprobable por cualquiera que revise." },
          { question: "¿Qué parte del flujo puede automatizarse por completo sin revisión?", options: ["La recuperación", "La respuesta final al usuario", "El cálculo de costo", "Ninguna que afecte a una persona sin control humano"], answer: 3, explanation: "Recuperar y calcular son deterministas, pero lo que llega a una persona necesita criterio y revisión." }
        ]
      }
    ],
    "html-css": [
      {
        levelId: 1, title: "Mini examen de estructura HTML", passing: 4,
        intro: "Repasa etiquetas, enlaces, imágenes accesibles y estructura semántica. Responde las cinco preguntas; necesitas cuatro aciertos.",
        questions: [
          { question: "¿Qué etiqueta representa el título principal de una página?", options: ["<p>", "<h1>", "<footer>", "<li>"], answer: 1, explanation: "h1 identifica el título principal. p representa un párrafo y li un elemento de una lista." },
          { question: "¿Qué etiqueta contiene cada elemento dentro de una lista ul?", options: ["<img>", "<a>", "<li>", "<main>"], answer: 2, explanation: "Cada elemento de una lista se escribe dentro de li, que a su vez queda dentro de ul u ol." },
          { question: "¿Qué atributo indica a dónde lleva un enlace a?", options: ["href", "alt", "class", "src"], answer: 0, explanation: "href define la dirección de destino del enlace. src indica el recurso de una imagen y alt lo describe." },
          { question: "¿Para qué sirve un alt descriptivo en una imagen informativa?", options: ["Cambiar su ancho", "Agregar un borde", "Reemplazar su dirección", "Comunicar su contenido cuando no puede verse"], answer: 3, explanation: "alt ofrece una alternativa textual para lectores de pantalla o cuando la imagen no carga." },
          { question: "¿Dónde ubicarías el contenido principal, separado del encabezado y pie de página?", options: ["Dentro de footer", "Dentro de main", "Dentro de una etiqueta img", "Dentro de style"], answer: 1, explanation: "main identifica el contenido principal; header y footer organizan el encabezado y el pie de página." }
        ]
      },
      {
        levelId: 2, title: "Mini examen de estilos CSS", passing: 4,
        intro: "Comprueba cómo seleccionas elementos y controlas su espacio, lectura y estados. Necesitas cuatro de cinco aciertos.",
        questions: [
          { question: "¿Qué selector aplica estilos a class=\"mensaje\"?", options: ["#mensaje", "<mensaje>", ".mensaje", "@mensaje"], answer: 2, explanation: "El punto delante del nombre selecciona una clase: .mensaje encuentra los elementos con class=\"mensaje\"." },
          { question: "¿Qué propiedad agrega espacio entre el contenido y su borde?", options: ["padding", "margin", "color", "font-family"], answer: 0, explanation: "padding crea espacio interior. margin deja espacio exterior respecto a otros elementos." },
          { question: "¿Qué propiedad usarías para separar una caja de las cajas vecinas?", options: ["border-radius", "color", "font-size", "margin"], answer: 3, explanation: "margin controla el espacio exterior de la caja; no cambia la separación interna de su contenido." },
          { question: "¿Qué consigue line-height: 1.6 en un párrafo?", options: ["Crea seis columnas", "Ajusta la altura de línea para facilitar la lectura", "Redondea el borde", "Cambia la familia tipográfica"], answer: 1, explanation: "line-height define la altura de cada línea. El valor 1.6 es proporcional al tamaño de la fuente." },
          { question: "¿Cuándo se aplican los estilos de .accion:hover?", options: ["Siempre, aunque no exista el botón", "Solo al abrir un examen", "Cuando el puntero está sobre el elemento", "Únicamente en pantallas pequeñas"], answer: 2, explanation: ":hover es un estado que se activa al situar el puntero sobre el elemento; no es una regla de tamaño de pantalla." }
        ]
      },
      {
        levelId: 3, title: "Mini examen de composición web", passing: 4,
        intro: "Repasa flexbox, grid y diseño adaptable antes de cerrar tu ruta. Necesitas cuatro de cinco aciertos.",
        questions: [
          { question: "¿Qué declaración activa flexbox en el contenedor .fila?", options: ["display: flex", "font-family: flex", "position: grid", "color: flex"], answer: 0, explanation: "display: flex convierte al elemento en un contenedor flex y organiza sus hijos con ese sistema." },
          { question: "¿Qué describe grid-template-columns: repeat(3, 1fr)?", options: ["Tres filas de un píxel", "Una sola columna fija", "Tres bordes iguales", "Tres columnas con la misma fracción de espacio"], answer: 3, explanation: "repeat(3, 1fr) repite tres columnas de una fracción cada una, distribuyendo el espacio disponible." },
          { question: "¿Qué propiedad separa los elementos de un contenedor flex o grid?", options: ["alt", "gap", "href", "font-size"], answer: 1, explanation: "gap agrega separación entre los elementos de flex o grid sin crear espacio interior en cada elemento." },
          { question: "¿Cuándo se aplica @media (max-width: 600px)?", options: ["Solo cuando el ancho es mayor a 600px", "Cuando hay seis elementos", "Cuando la ventana tiene 600px de ancho o menos", "Solo cuando el texto mide 600px"], answer: 2, explanation: "max-width limita la regla a una ventana de hasta 600px inclusive; permite adaptar la interfaz a pantallas pequeñas." },
          { question: "¿Qué combinación permite una tarjeta con estructura y presentación adaptable?", options: ["article con contenido y CSS con una media query", "Solo un console.log", "Una consulta SELECT", "Eliminar todo el HTML y usar un color"], answer: 0, explanation: "HTML organiza el contenido de la tarjeta; CSS define su presentación y una media query puede ajustarla al ancho disponible." }
        ]
      }
    ],
    javascript: [
      {
        levelId: 1, title: "Mini examen de datos y operaciones", passing: 4,
        intro: "Comprueba variables, cálculos, textos y comparaciones. Responde las cinco preguntas; necesitas cuatro aciertos.",
        questions: [
          { question: "¿Qué ocurre si intentas reasignar una variable declarada con const?", options: ["Se convierte en una lista", "Se produce un error", "El navegador la elimina", "Se imprime automáticamente"], answer: 1, explanation: "const no permite reasignar la variable. Para un valor que necesitas reasignar durante un cálculo puedes utilizar let." },
          { question: "Si precio vale 4500 y cantidad vale 3, ¿cuánto vale precio * cantidad?", options: ["4503", "45003", "1500", "13500"], answer: 3, explanation: "El operador * multiplica los números: 4500 por 3 da un total de 13500." },
          { question: "¿Qué muestran console.log(lenguaje) y console.log(\"lenguaje\")?", options: ["Ambos muestran siempre JavaScript", "Ambos muestran el nombre de la variable", "El primero muestra el valor de la variable y el segundo el texto literal", "Ninguno puede mostrar texto"], answer: 2, explanation: "Sin comillas se consulta la variable. Con comillas se crea un texto literal, independiente del valor guardado." },
          { question: "Si nombre vale \"ada\", ¿qué devuelve nombre.toUpperCase()?", options: ["ADA", "ada", "3", "true"], answer: 0, explanation: "toUpperCase() devuelve una versión del texto en mayúsculas; por eso \"ada\" se transforma en \"ADA\"." },
          { question: "Si horas vale 12 y meta vale 10, ¿qué resultado tiene horas >= meta?", options: ["false", "true", "22", "\"horas\""], answer: 1, explanation: "La comparación pregunta si 12 es mayor o igual a 10. Como se cumple, su resultado booleano es true." }
        ]
      },
      {
        levelId: 2, title: "Mini examen de decisiones y colecciones", passing: 4,
        intro: "Aplica condiciones, arreglos y ciclos. Necesitas cuatro de cinco aciertos para aprobar esta etapa.",
        questions: [
          { question: "Con edad = 18, ¿se ejecuta la rama if (edad >= 18)?", options: ["No, solo acepta mayores de 18", "Se ejecutan siempre if y else", "Sí, la igualdad también cumple la condición", "No se pueden comparar números"], answer: 2, explanation: ">= incluye la igualdad. Cuando la condición de if se cumple, la rama else no se ejecuta." },
          { question: "Con nota = 5, if (nota >= 6) ... else if (nota >= 4) ... else ..., ¿qué rama se ejecuta?", options: ["else if (nota >= 4)", "if (nota >= 6)", "El último else", "Las tres ramas"], answer: 0, explanation: "Cinco no alcanza seis, pero sí es mayor o igual a cuatro. Se ejecuta la primera condición verdadera de la cadena." },
          { question: "¿Qué hace cursos.push(\"SQL\")?", options: ["Borra todos los cursos", "Ordena alfabéticamente", "Devuelve siempre el primer curso", "Agrega SQL al final del arreglo"], answer: 3, explanation: "push añade un elemento al final del arreglo y aumenta su cantidad de elementos." },
          { question: "En [\"Python\", \"SQL\"], ¿qué valor está en el índice 0?", options: ["SQL", "Python", "0", "No existe ningún valor"], answer: 1, explanation: "Los índices de los arreglos comienzan en cero: el primer elemento de este arreglo es \"Python\"." },
          { question: "Con total = 0, ¿cuánto queda después de sumar cada valor de [12, 6, 8] con for...of?", options: ["3", "8", "26", "1268"], answer: 2, explanation: "El acumulador suma cada número una vez: 0 + 12 + 6 + 8 da 26." }
        ]
      },
      {
        levelId: 3, title: "Mini examen de funciones y proyecto", passing: 4,
        intro: "Comprueba funciones y transformaciones de arreglos antes de cerrar la ruta. Necesitas cuatro de cinco aciertos.",
        questions: [
          { question: "¿Qué devuelve doblar(6) si la función retorna numero * 2?", options: ["12", "6", "2", "62"], answer: 0, explanation: "El parámetro recibe 6 y return entrega el resultado de 6 * 2, que es 12." },
          { question: "Si porcentaje tiene un valor por defecto de 10, ¿qué porcentaje usa descuento(1000)?", options: ["1000", "0", "Ninguno; siempre falla", "10"], answer: 3, explanation: "Cuando se omite ese argumento, se usa el valor por defecto declarado en el parámetro: 10." },
          { question: "¿Qué hace cursos.filter(curso => curso.horas >= 9)?", options: ["Suma todas las horas", "Crea un arreglo con los cursos que cumplen la condición", "Devuelve siempre un texto", "Cambia todas las horas por 9"], answer: 1, explanation: "filter conserva los elementos que cumplen la condición y devuelve un nuevo arreglo con ellos." },
          { question: "¿Qué devuelve cursos.map(curso => curso.nombre)?", options: ["La cantidad de cursos", "El primer curso", "Un arreglo con los nombres de los cursos", "Una suma de objetos"], answer: 2, explanation: "map transforma cada elemento con la función indicada; en este caso extrae el nombre de cada curso." },
          { question: "¿Qué expresión sirve para sumar el costo de un carrito, considerando la cantidad de cada producto?", options: ["items.reduce((suma, item) => suma + item.precio * item.cantidad, 0)", "items.map(item => item.producto)", "items.filter(item => item.cantidad > 0)", "items.length"], answer: 0, explanation: "reduce acumula los subtotales precio por cantidad, empezando desde cero, y devuelve un único total." }
        ]
      }
    ],
    sql: [
      {
        levelId: 1, title: "Mini examen de consultas y filtros", passing: 4,
        intro: "Repasa columnas, tablas, valores distintos y condiciones. Responde las cinco preguntas; necesitas cuatro aciertos.",
        questions: [
          { question: "¿Qué indica SELECT nombre, nivel en una consulta?", options: ["Qué tabla borrar", "Qué columnas mostrar", "Qué filas insertar", "Qué contraseña utilizar"], answer: 1, explanation: "SELECT elige las columnas del resultado; nombre y nivel son los dos campos solicitados." },
          { question: "¿Qué parte indica la tabla de origen?", options: ["WHERE", "DISTINCT", "FROM cursos", "ORDER BY"], answer: 2, explanation: "FROM cursos especifica que los datos se obtienen de la tabla cursos." },
          { question: "¿Para qué se utiliza SELECT DISTINCT categoria?", options: ["Mostrar cada categoría sin repeticiones", "Borrar categorías", "Contar automáticamente las filas", "Ordenar siempre de mayor a menor"], answer: 0, explanation: "DISTINCT elimina las repeticiones del resultado de las columnas seleccionadas; no borra datos de la tabla." },
          { question: "¿Qué filtro selecciona los cursos de nivel Inicial?", options: ["ORDER BY 'Inicial'", "SELECT nivel > 'Inicial'", "FROM Inicial", "WHERE nivel = 'Inicial'"], answer: 3, explanation: "WHERE conserva las filas cuyo valor de nivel coincide con el texto 'Inicial'." },
          { question: "¿Qué exige WHERE nivel = 'Inicial' AND duracion > 6?", options: ["Que se cumpla solo una condición", "Que ambas condiciones se cumplan", "Que ninguna condición se cumpla", "Que la duración sea exactamente 6"], answer: 1, explanation: "AND exige que las dos condiciones sean verdaderas para incluir la fila en el resultado." }
        ]
      },
      {
        levelId: 2, title: "Mini examen de búsqueda y orden", passing: 4,
        intro: "Comprueba patrones, rangos, ordenamiento y límites. Necesitas cuatro de cinco aciertos.",
        questions: [
          { question: "¿Qué busca nombre LIKE '%Python%'?", options: ["Solo el nombre exacto Python", "Nombres sin Python", "Nombres que contienen Python", "Únicamente nombres que empiezan con el signo %"], answer: 2, explanation: "El comodín % permite texto antes y después de Python; por eso el patrón busca esa palabra dentro del nombre." },
          { question: "¿Qué duraciones incluye BETWEEN 5 AND 9?", options: ["De 5 a 9, incluyendo ambos extremos", "Solo 6, 7 y 8", "Solo 5 y 9", "Todas las mayores de 9"], answer: 0, explanation: "BETWEEN incluye los límites: selecciona los valores mayores o iguales a 5 y menores o iguales a 9." },
          { question: "¿Cómo ordena ORDER BY inscritos DESC?", options: ["De menor a mayor", "Por nombre", "En un orden aleatorio", "De mayor a menor cantidad de inscritos"], answer: 3, explanation: "DESC indica orden descendente; las filas con más inscritos aparecen primero." },
          { question: "¿Qué hace LIMIT 3 después de ordenar?", options: ["Multiplica cada duración por tres", "Conserva como máximo las tres primeras filas", "Muestra la tercera columna", "Elimina tres cursos de la tabla"], answer: 1, explanation: "LIMIT recorta la cantidad de filas del resultado; no modifica ni elimina los datos originales." },
          { question: "¿Qué final de consulta devuelve los tres cursos de mayor duración?", options: ["ORDER BY duracion ASC LIMIT 3", "LIMIT 3 ORDER BY nombre", "ORDER BY duracion DESC LIMIT 3", "WHERE duracion = 3"], answer: 2, explanation: "Primero se ordena de mayor a menor duración con DESC y luego se toman las tres primeras filas con LIMIT." }
        ]
      },
      {
        levelId: 3, title: "Mini examen de resúmenes y relaciones", passing: 4,
        intro: "Repasa funciones de resumen, agrupación y JOIN antes de cerrar la ruta. Necesitas cuatro de cinco aciertos.",
        questions: [
          { question: "¿Qué calcula COUNT(*)?", options: ["La cantidad de filas", "El promedio de duración", "El nombre más largo", "La suma de todos los identificadores"], answer: 0, explanation: "COUNT(*) cuenta las filas consideradas por la consulta, después de aplicar sus filtros." },
          { question: "¿Qué hace AS promedio en AVG(duracion) AS promedio?", options: ["Cambia la tabla original", "Filtra los cursos largos", "Duplica el promedio", "Da el nombre promedio a la columna del resultado"], answer: 3, explanation: "AS asigna un alias legible a la columna calculada; no renombra una columna de la tabla original." },
          { question: "¿Qué función calcula el total de todas las duraciones?", options: ["AVG(duracion)", "SUM(duracion)", "MIN(duracion)", "COUNT(*)"], answer: 1, explanation: "SUM suma los valores. AVG obtiene el promedio, MIN el menor valor y COUNT la cantidad de filas." },
          { question: "¿Qué produce SELECT categoria, COUNT(*) AS total FROM cursos GROUP BY categoria?", options: ["Una fila por cada estudiante", "Un único nombre de curso", "Una fila por categoría con su cantidad de cursos", "Una tabla nueva en la base de datos"], answer: 2, explanation: "GROUP BY forma grupos por categoría y COUNT(*) cuenta los cursos de cada grupo." },
          { question: "¿Qué relación permite unir cada estudiante con su curso?", options: ["estudiantes.curso_id = cursos.id", "estudiantes.nombre = cursos.nombre", "estudiantes.id = cursos.duracion", "cursos.id = cursos.duracion"], answer: 0, explanation: "curso_id indica el curso del estudiante y se relaciona con el identificador id de la tabla cursos mediante JOIN ... ON." }
        ]
      }
    ]
  };

  // Corrección pura: permite probar el umbral sin crear elementos de interfaz.
  function gradeExam(courseId, levelId, answers) {
    const exam = LEVEL_EXAMS[courseId]?.find((item) => item.levelId === levelId);
    if (!exam) return null;
    const details = exam.questions.map((question, index) => {
      const chosen = typeof answers?.get === "function" ? answers.get(index) : answers?.[index];
      return { index, chosen: chosen ?? null, answer: question.answer, isCorrect: chosen === question.answer };
    });
    const correct = details.filter((detail) => detail.isCorrect).length;
    return { total: exam.questions.length, correct, passing: exam.passing, passed: correct >= exam.passing, details };
  }

  globalThis.StarterExams = { LEVEL_EXAMS, gradeExam };
})();
