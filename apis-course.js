/*
  Ruta de APIs: 3 niveles de 4 módulos sobre el servidor simulado de api-lab.js.
  Cada módulo se resuelve escribiendo peticiones HTTP reales, una por bloque.
*/
(() => {
  "use strict";

  const TOKEN = "clave-demo-2026";
  const usa = (code, patron) => patron.test(String(code).replace(/^\s*#.*$/gm, ""));
  const primera = (result) => result.respuestas[0] || {};
  const ultima = (result) => result.respuestas[result.respuestas.length - 1] || {};
  const conMetodo = (result, metodo) => result.respuestas.filter((item) => item.metodo === metodo);

  const lessons = [
    {
      kicker: "Módulo 01 · Primera petición",
      title: "Pide datos a una API",
      shortTitle: "GET",
      duration: "12 min",
      difficulty: "Inicio",
      file: "peticion.http · api.codigocero.cl",
      intro: "Una API es un servicio al que se le piden datos por una dirección. La petición más común es GET: “dame esto”.",
      example: "GET /cursos",
      explanation: "Escribes el método y la ruta. El servidor responde con un código de estado (200 significa que todo salió bien), unas cabeceras y un cuerpo en formato JSON.",
      concepts: [
        "GET pide información sin modificar nada.",
        "200 OK indica que la petición se resolvió correctamente.",
        "El cuerpo llega en JSON: llaves, comillas dobles y pares clave-valor."
      ],
      goal: "Pide la colección completa de cursos y comprueba que el servidor responde 200 con los siete cursos.",
      hints: [
        "Escribe el método en mayúsculas y la ruta en la misma línea.",
        "La ruta de la colección es /cursos.",
        "En la respuesta, el campo total debe decir 7."
      ],
      starter: "GET /",
      success: "Ya sabes leer la respuesta de una API: estado, cabeceras y cuerpo.",
      checks: [
        { label: "Haces una petición GET a /cursos", test: (code, result) => primera(result).metodo === "GET" && primera(result).url.startsWith("/cursos") },
        { label: "El servidor responde 200", test: (code, result) => primera(result).status === 200 },
        { label: "Llegan los siete cursos", test: (code, result) => primera(result).cuerpo?.total === 7 }
      ]
    },
    {
      kicker: "Módulo 02 · Un recurso",
      title: "Consulta un solo recurso",
      shortTitle: "Recurso por id",
      duration: "12 min",
      difficulty: "Inicio",
      file: "peticion.http · api.codigocero.cl",
      intro: "Además de la lista completa, casi todas las APIs permiten pedir un elemento concreto por su identificador.",
      example: "GET /cursos/3",
      explanation: "La ruta /cursos representa la colección y /cursos/3 el elemento con id 3. Cuando pides un solo recurso, el cuerpo ya no trae una lista: trae directamente ese objeto.",
      concepts: [
        "La colección y el elemento tienen rutas distintas.",
        "El identificador forma parte de la ruta, no de los parámetros.",
        "La respuesta de un recurso es un objeto, no una lista."
      ],
      goal: "Pide el curso con id 3 y comprueba que la respuesta trae ese objeto con el nombre JavaScript.",
      hints: [
        "Agrega el identificador al final de la ruta.",
        "La ruta completa es /cursos/3.",
        "En el cuerpo debe aparecer \"nombre\": \"JavaScript\"."
      ],
      starter: "GET /cursos",
      success: "Distingues una colección de un recurso individual.",
      checks: [
        { label: "Consultas la ruta /cursos/3", test: (code, result) => primera(result).url === "/cursos/3" },
        { label: "La respuesta es 200", test: (code, result) => primera(result).status === 200 },
        { label: "El cuerpo es el curso JavaScript", test: (code, result) => primera(result).cuerpo?.nombre === "JavaScript" && primera(result).cuerpo?.id === 3 }
      ]
    },
    {
      kicker: "Módulo 03 · Parámetros",
      title: "Filtra con parámetros de consulta",
      shortTitle: "Query params",
      duration: "14 min",
      difficulty: "Fundamentos",
      file: "peticion.http · api.codigocero.cl",
      intro: "Pedir todo y filtrar después desperdicia datos. Las APIs permiten pedir exactamente lo que necesitas.",
      example: "GET /cursos?nivel=Inicial",
      explanation: "Después del signo de interrogación van los parámetros, en pares clave=valor separados por &. El servidor los usa para filtrar antes de responder.",
      concepts: [
        "? separa la ruta de los parámetros.",
        "& une varios parámetros en la misma petición.",
        "Los parámetros no cambian el recurso: solo acotan la respuesta."
      ],
      goal: "Pide únicamente los cursos de categoría Web que sean de nivel Inicial. Deben quedar dos.",
      hints: [
        "El primer parámetro va después de ?, el segundo después de &.",
        "Los campos que necesitas son categoria y nivel.",
        "GET /cursos?categoria=Web&nivel=Inicial devuelve total 2."
      ],
      starter: "GET /cursos?nivel=Inicial",
      success: "Ya pides datos con precisión en lugar de traerlo todo.",
      checks: [
        { label: "Usas dos parámetros en la misma petición", test: (code) => usa(code, /\?[^\s]*&[^\s]*/) },
        { label: "Filtras por categoria y nivel", test: (code) => usa(code, /categoria=Web/i) && usa(code, /nivel=Inicial/i) },
        { label: "La respuesta trae exactamente 2 cursos", test: (code, result) => primera(result).status === 200 && primera(result).cuerpo?.total === 2 }
      ]
    },
    {
      kicker: "Módulo 04 · Estados",
      title: "Entiende los códigos de estado",
      shortTitle: "Códigos 200 y 404",
      duration: "14 min",
      difficulty: "Fundamentos",
      file: "peticion.http · api.codigocero.cl",
      intro: "El código de estado es lo primero que se revisa: dice si la petición funcionó y, si no, de quién fue el problema.",
      example: "HTTP/1.1 404 Not Found",
      explanation: "Los códigos 2xx indican éxito y los 4xx que la petición tiene un problema. 404 significa que la ruta o el recurso no existen; el cuerpo suele explicar qué pasó.",
      concepts: [
        "200 OK: la petición se resolvió.",
        "404 Not Found: el recurso pedido no existe.",
        "Leer el cuerpo del error ahorra horas de depuración."
      ],
      goal: "Haz dos peticiones en el mismo intento: una que exista (curso 1) y otra a un curso inexistente (id 99), y compara los códigos.",
      hints: [
        "Escribe las dos peticiones una debajo de la otra, separadas por una línea en blanco.",
        "La primera es GET /cursos/1 y la segunda GET /cursos/99.",
        "Deben responder 200 y 404 respectivamente."
      ],
      starter: "GET /cursos/1",
      success: "Ya sabes distinguir un error del cliente de una respuesta correcta.",
      checks: [
        { label: "Envías dos peticiones en el mismo intento", test: (code, result) => result.respuestas.length === 2 },
        { label: "La primera responde 200", test: (code, result) => primera(result).status === 200 },
        { label: "La segunda responde 404 y explica el motivo", test: (code, result) => ultima(result).status === 404 && typeof ultima(result).cuerpo?.error === "string" }
      ]
    },
    {
      kicker: "Módulo 05 · Crear",
      title: "Crea un recurso con POST",
      shortTitle: "POST",
      duration: "16 min",
      difficulty: "Práctica",
      file: "peticion.http · api.codigocero.cl",
      intro: "GET solo lee. Para agregar algo nuevo se usa POST, y esta vez la petición lleva un cuerpo con los datos.",
      example: 'POST /cursos\nContent-Type: application/json\n\n{"nombre": "Go", "nivel": "Inicial"}',
      explanation: "El cuerpo va después de una línea en blanco. La cabecera Content-Type avisa que es JSON y Authorization demuestra que tienes permiso para escribir. La respuesta 201 Created incluye el recurso con el id que asignó el servidor.",
      concepts: [
        "POST crea; el servidor decide el id.",
        "La línea en blanco separa cabeceras de cuerpo.",
        "201 Created confirma que el recurso se creó."
      ],
      goal: "Crea el curso Go, de nivel Inicial y 7 horas de duración. Necesitas la cabecera Authorization: Bearer " + TOKEN + ".",
      hints: [
        "Después de POST /cursos escribe las dos cabeceras, una por línea.",
        "Deja una línea en blanco y luego el objeto JSON.",
        'El cuerpo es {"nombre": "Go", "nivel": "Inicial", "duracion": 7}.'
      ],
      starter: 'POST /cursos\nContent-Type: application/json\n\n{"nombre": "Go"}',
      success: "Ya sabes enviar datos a una API y leer el recurso que devuelve.",
      checks: [
        { label: "Envías un POST autenticado a /cursos", test: (code, result) => primera(result).metodo === "POST" && usa(code, /Authorization:\s*Bearer/i) },
        { label: "El servidor responde 201 Created", test: (code, result) => primera(result).status === 201 },
        { label: "El curso creado es Go, Inicial y 7 horas", test: (code, result) => primera(result).cuerpo?.nombre === "Go" && primera(result).cuerpo?.nivel === "Inicial" && Number(primera(result).cuerpo?.duracion) === 7 }
      ]
    },
    {
      kicker: "Módulo 06 · Validación",
      title: "Lee un error de validación",
      shortTitle: "Error 400",
      duration: "14 min",
      difficulty: "Práctica",
      file: "peticion.http · api.codigocero.cl",
      intro: "Una API seria revisa lo que recibe. Si faltan datos, responde 400 y explica qué corregir.",
      example: "HTTP/1.1 400 Bad Request",
      explanation: "400 Bad Request significa que el problema está en la petición, no en el servidor. El cuerpo indica qué campo falta o tiene un valor inválido, para que puedas corregirlo y reintentar.",
      concepts: [
        "400 es un error del cliente: la petición está mal formada.",
        "El campo ayuda del cuerpo dice exactamente qué revisar.",
        "Corregir y reintentar es parte normal del trabajo con APIs."
      ],
      goal: "Provoca primero un 400 enviando un curso sin nivel y después envía la versión corregida hasta obtener 201.",
      hints: [
        "La primera petición manda solo el nombre; falta el nivel.",
        "Deja una línea en blanco y escribe la segunda petición completa.",
        "El nivel debe ser Inicial, Siguiente o Avanzado."
      ],
      starter: 'POST /cursos\nAuthorization: Bearer ' + TOKEN + '\nContent-Type: application/json\n\n{"nombre": "Kotlin"}',
      success: "Sabes leer un error de validación y corregir la petición.",
      checks: [
        { label: "La primera petición recibe 400", test: (code, result) => primera(result).status === 400 },
        { label: "El error explica qué falta", test: (code, result) => /nivel/i.test(String(primera(result).cuerpo?.ayuda || primera(result).cuerpo?.error || "")) },
        { label: "La segunda petición corregida recibe 201", test: (code, result) => result.respuestas.length >= 2 && ultima(result).status === 201 }
      ]
    },
    {
      kicker: "Módulo 07 · Modificar",
      title: "Actualiza un recurso existente",
      shortTitle: "PATCH",
      duration: "16 min",
      difficulty: "Práctica",
      file: "peticion.http · api.codigocero.cl",
      intro: "Para corregir un dato no hace falta reenviar el recurso completo: PATCH cambia solo los campos que envías.",
      example: 'PATCH /cursos/4\n\n{"duracion": 6}',
      explanation: "PATCH actualiza parcialmente y responde 200 con el recurso ya modificado. Como escribe datos, también necesita la cabecera Authorization.",
      concepts: [
        "PATCH modifica solo los campos enviados.",
        "La ruta apunta al recurso concreto: /cursos/4.",
        "La respuesta devuelve el recurso actualizado para confirmarlo."
      ],
      goal: "Cambia la duración del curso 4 a 6 horas y, en la misma ejecución, vuelve a consultarlo para comprobar el cambio.",
      hints: [
        "Usa PATCH /cursos/4 con las cabeceras Authorization y Content-Type.",
        'El cuerpo es {"duracion": 6}.',
        "Después agrega GET /cursos/4 para verificar."
      ],
      starter: 'GET /cursos/4',
      success: "Ya modificas datos existentes y compruebas el resultado.",
      checks: [
        { label: "Envías un PATCH autenticado al curso 4", test: (code, result) => conMetodo(result, "PATCH").some((item) => item.url === "/cursos/4" && item.status === 200) },
        { label: "La duración queda en 6 horas", test: (code, result) => conMetodo(result, "PATCH").some((item) => Number(item.cuerpo?.duracion) === 6) },
        { label: "Compruebas el cambio con un GET posterior", test: (code, result) => ultima(result).metodo === "GET" && Number(ultima(result).cuerpo?.duracion) === 6 }
      ]
    },
    {
      kicker: "Módulo 08 · Eliminar",
      title: "Elimina un recurso",
      shortTitle: "DELETE",
      duration: "14 min",
      difficulty: "Práctica",
      file: "peticion.http · api.codigocero.cl",
      intro: "DELETE es la operación más delicada: quita el recurso y la respuesta ni siquiera trae cuerpo.",
      example: "HTTP/1.1 204 No Content",
      explanation: "204 No Content significa que la operación funcionó y no hay nada que devolver. Para comprobarlo se consulta el recurso otra vez: ahora debe responder 404.",
      concepts: [
        "DELETE necesita autenticación, igual que POST y PATCH.",
        "204 indica éxito sin cuerpo de respuesta.",
        "Después de borrar, el mismo recurso responde 404."
      ],
      goal: "Elimina el curso 5 y comprueba en la misma ejecución que consultarlo después devuelve 404.",
      hints: [
        "DELETE /cursos/5 con la cabecera Authorization.",
        "No necesita Content-Type ni cuerpo.",
        "Agrega después GET /cursos/5: debe responder 404."
      ],
      starter: "GET /cursos/5",
      success: "Completaste las cuatro operaciones básicas: leer, crear, modificar y borrar.",
      checks: [
        { label: "Eliminas el curso 5 con DELETE", test: (code, result) => conMetodo(result, "DELETE").some((item) => item.url === "/cursos/5" && item.status === 204) },
        { label: "Compruebas el resultado con un GET posterior", test: (code, result) => ultima(result).metodo === "GET" && ultima(result).url === "/cursos/5" },
        { label: "El curso eliminado responde 404", test: (code, result) => ultima(result).status === 404 }
      ]
    },
    {
      kicker: "Módulo 09 · Autenticación",
      title: "Comprueba qué protege el token",
      shortTitle: "Error 401",
      duration: "14 min",
      difficulty: "Integración",
      file: "peticion.http · api.codigocero.cl",
      intro: "Leer es público, pero escribir requiere identificarse. Esa diferencia se ve en el código 401.",
      example: "Authorization: Bearer " + TOKEN,
      explanation: "401 Unauthorized indica que falta la credencial o que no es válida. La cabecera Authorization viaja en cada petición: el servidor no recuerda quién eres entre una y otra.",
      concepts: [
        "401 es distinto de 404: el recurso existe, tú no tienes permiso.",
        "El token viaja en una cabecera, nunca en la ruta.",
        "GET es público en esta API; POST, PATCH y DELETE no."
      ],
      goal: "Demuestra la diferencia: un POST sin token que devuelva 401 y el mismo POST con token que devuelva 201.",
      hints: [
        "La primera petición va sin la cabecera Authorization.",
        "La segunda es idéntica pero con Authorization: Bearer " + TOKEN + ".",
        'Puedes crear {"nombre": "Ruby", "nivel": "Siguiente"}.'
      ],
      starter: 'POST /cursos\nContent-Type: application/json\n\n{"nombre": "Ruby", "nivel": "Siguiente"}',
      success: "Entiendes cómo una API distingue entre leer y escribir.",
      checks: [
        { label: "La petición sin token recibe 401", test: (code, result) => primera(result).status === 401 },
        { label: "Repites la petición con el token correcto", test: (code) => usa(code, new RegExp("Authorization:\\s*Bearer\\s+" + TOKEN, "i")) },
        { label: "Con token la creación responde 201", test: (code, result) => result.respuestas.length >= 2 && ultima(result).status === 201 }
      ]
    },
    {
      kicker: "Módulo 10 · Paginación",
      title: "Pide los datos por páginas",
      shortTitle: "Paginación",
      duration: "16 min",
      difficulty: "Integración",
      file: "peticion.http · api.codigocero.cl",
      intro: "Cuando una colección crece, nadie pide diez mil registros de una vez: se piden por páginas.",
      example: "GET /cursos?pagina=2&tamano=3",
      explanation: "tamano indica cuántos elementos trae cada página y pagina cuál de ellas quieres. La respuesta agrega el total y cuántas páginas existen, para que sepas si quedan más.",
      concepts: [
        "total es el número de resultados; datos trae solo la página pedida.",
        "El campo paginas indica cuántas veces hay que pedir.",
        "La paginación se combina con filtros y orden."
      ],
      goal: "Pide la segunda página de cursos con tres elementos por página y comprueba que la respuesta informa 7 en total y 3 páginas.",
      hints: [
        "Combina los dos parámetros con &.",
        "GET /cursos?pagina=2&tamano=3.",
        "El campo datos debe traer tres cursos y paginas debe decir 3."
      ],
      starter: "GET /cursos",
      success: "Ya puedes recorrer colecciones grandes sin pedirlas completas.",
      checks: [
        { label: "Pides la página 2 con tamaño 3", test: (code) => usa(code, /pagina=2/) && usa(code, /tamano=3/) },
        { label: "La respuesta informa 7 resultados en 3 páginas", test: (code, result) => primera(result).cuerpo?.total === 7 && primera(result).cuerpo?.paginas === 3 },
        { label: "La página trae exactamente 3 cursos", test: (code, result) => Array.isArray(primera(result).cuerpo?.datos) && primera(result).cuerpo.datos.length === 3 }
      ]
    },
    {
      kicker: "Módulo 11 · Búsqueda",
      title: "Busca y ordena resultados",
      shortTitle: "Búsqueda y orden",
      duration: "16 min",
      difficulty: "Integración",
      file: "peticion.http · api.codigocero.cl",
      intro: "Buscar por texto y ordenar son las dos funciones que convierten una lista en algo útil.",
      example: "GET /cursos?orden=-inscritos",
      explanation: "El parámetro q busca dentro del nombre y orden ordena por un campo; el guion delante invierte el sentido. Ambos se combinan con los filtros que ya conoces.",
      concepts: [
        "q busca coincidencias parciales, sin distinguir mayúsculas.",
        "orden=-campo ordena de mayor a menor.",
        "Los parámetros se pueden combinar libremente."
      ],
      goal: "Pide los cursos de categoría Web ordenados por inscritos de mayor a menor. El primero debe ser HTML y CSS.",
      hints: [
        "Filtra con categoria=Web.",
        "Agrega orden=-inscritos con &.",
        "El primer elemento de datos debe ser HTML y CSS con 410 inscritos."
      ],
      starter: "GET /cursos?categoria=Web",
      success: "Sabes armar consultas que responden preguntas concretas.",
      checks: [
        { label: "Filtras por categoria=Web", test: (code) => usa(code, /categoria=Web/i) },
        { label: "Ordenas de mayor a menor por inscritos", test: (code) => usa(code, /orden=-inscritos/i) },
        { label: "El primer resultado es HTML y CSS", test: (code, result) => primera(result).cuerpo?.datos?.[0]?.nombre === "HTML y CSS" && primera(result).cuerpo?.total === 3 }
      ]
    },
    {
      kicker: "Módulo 12 · Proyecto final",
      title: "Proyecto final: un flujo completo",
      shortTitle: "Proyecto final",
      duration: "20 min",
      difficulty: "Proyecto",
      file: "peticion.http · api.codigocero.cl",
      intro: "Así se trabaja de verdad con una API: crear, corregir, comprobar y limpiar, revisando el estado en cada paso.",
      example: "POST → PATCH → GET → DELETE",
      explanation: "Cada petición es independiente, pero juntas forman un flujo. El laboratorio ejecuta todas en orden sobre los mismos datos, así puedes ver el efecto de una en la siguiente.",
      concepts: [
        "El id que devuelve el POST es el que usan las siguientes peticiones.",
        "Cada operación de escritura necesita el token.",
        "Comprobar con un GET al final es una buena costumbre."
      ],
      goal: "Crea el curso Rust (Inicial, 10 horas), corrígele la duración a 11, consúltalo para verificarlo y por último elimínalo.",
      hints: [
        "El curso creado recibirá el id 8: úsalo en las peticiones siguientes.",
        "Escribe las cuatro peticiones una debajo de otra, separadas por líneas en blanco.",
        "El orden es POST /cursos, PATCH /cursos/8, GET /cursos/8 y DELETE /cursos/8."
      ],
      starter: 'POST /cursos\nAuthorization: Bearer ' + TOKEN + '\nContent-Type: application/json\n\n{"nombre": "Rust", "nivel": "Inicial", "duracion": 10}',
      success: "Terminaste la ruta: puedes conversar con una API de principio a fin.",
      checks: [
        { label: "Creas Rust Inicial de 10 horas y recibes 201", test: (code, result) => conMetodo(result, "POST").some((item) => item.url === "/cursos" && item.status === 201 && item.cuerpo?.nombre === "Rust" && item.cuerpo?.nivel === "Inicial" && item.cuerpo?.duracion === 10) },
        { label: "Corriges ese mismo Rust a 11 horas con PATCH", test: (code, result) => {
          const created = result.respuestas.findIndex(item => item.metodo === "POST" && item.url === "/cursos" && item.status === 201 && item.cuerpo?.nombre === "Rust");
          const id = result.respuestas[created]?.cuerpo?.id;
          return created >= 0 && result.respuestas.slice(created + 1).some(item => item.metodo === "PATCH" && item.url === "/cursos/" + id && item.status === 200 && item.cuerpo?.duracion === 11);
        } },
        { label: "Verificas y eliminas Rust sin alterar los cursos anteriores", test: (code, result) => {
          const created = result.respuestas.findIndex(item => item.metodo === "POST" && item.url === "/cursos" && item.status === 201 && item.cuerpo?.nombre === "Rust");
          const url = "/cursos/" + result.respuestas[created]?.cuerpo?.id;
          const patched = result.respuestas.findIndex((item, i) => i > created && item.metodo === "PATCH" && item.url === url && item.status === 200 && item.cuerpo?.duracion === 11);
          const verified = result.respuestas.findIndex((item, i) => i > patched && item.metodo === "GET" && item.url === url && item.status === 200 && item.cuerpo?.nombre === "Rust" && item.cuerpo?.duracion === 11);
          return created >= 0 && patched > created && verified > patched && result.respuestas.some((item, i) => i > verified && item.metodo === "DELETE" && item.url === url && item.status === 204)
            && JSON.stringify(result.datos.cursos) === JSON.stringify(globalThis.ApiLab.datosIniciales().cursos);
        } }
      ]
    }
  ];

  globalThis.ApisCourse = {
    name: "APIs",
    storageKey: "codigo-cero.apis-v2.completed",
    examsKey: "codigo-cero.apis-v2.exams",
    kind: "api",
    stages: ["Pedir datos", "Crear y modificar", "Como en producción"],
    levels: [
      { title: "Las consultas", description: "Peticiones, recursos, filtros y estados", modules: lessons.slice(0, 4) },
      { title: "La escritura de datos", description: "POST, validación, PATCH y DELETE", modules: lessons.slice(4, 8) },
      { title: "El trabajo en producción", description: "Autenticación, paginación y flujos completos", modules: lessons.slice(8, 12) }
    ],
    lessons
  };
})();
