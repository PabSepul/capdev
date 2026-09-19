/* Niveles 5–13 de APIs. Conserva intactos los 16 módulos publicados. */
(() => {
  "use strict";

  const TOKEN = "clave-demo-2026";
  const auth = `Authorization: Bearer ${TOKEN}`;
  const json = "Content-Type: application/json";
  const request = (method, path, body, withAuth = true) =>
    `${method} ${path}${withAuth ? `\n${auth}` : ""}${body === undefined ? "" : `\n${json}\n\n${JSON.stringify(body)}`}`;
  const spec = (id, title, short, topic, goal, starter, solution, required, prediction, answer) =>
    ({ id, title, short, topic, goal, starter, solution, required, prediction, answer });

  const specs = [
    spec(17, "Combina filtros sin pedir datos de más", "Filtros compuestos", "Consultas",
      "Consulta únicamente cursos Web de nivel Inicial, ordenados por duración ascendente.",
      "GET /cursos?categoria=Web",
      "GET /cursos?categoria=Web&nivel=Inicial&orden=duracion",
      [/GET\s+\/cursos\?/i, /categoria=Web/i, /nivel=Inicial/i, /orden=duracion/i],
      "¿Qué cursos quedarán y cuál aparecerá primero?",
      "Quedarán HTML y CSS, y JavaScript; HTML y CSS aparecerá primero porque dura menos horas."),
    spec(18, "Busca texto y ordena los resultados", "Búsqueda y orden", "Consultas",
      "Busca nombres que contengan python y ordena sus coincidencias por duración descendente.",
      "GET /cursos?q=python",
      "GET /cursos?q=python&orden=-duracion",
      [/q=python/i, /orden=-duracion/i],
      "¿La búsqueda distingue entre Python y python?",
      "No. Este laboratorio normaliza mayúsculas; Datos con Python aparece antes por su mayor duración."),
    spec(19, "Pide una página de los cursos más populares", "Orden y límite", "Consultas",
      "Obtén la primera página de tres cursos, ordenada por inscritos de mayor a menor.",
      "GET /cursos?orden=-inscritos",
      "GET /cursos?orden=-inscritos&pagina=1&tamano=3",
      [/orden=-inscritos/i, /pagina=1/i, /tamano=3/i],
      "¿Qué identificadores debería contener la primera página?",
      "Debería contener 2, 1 y 3: son los tres cursos con mayor cantidad de inscritos."),
    spec(20, "Recorre todas las páginas con un orden estable", "Paginación completa", "Consultas",
      "Consulta las tres páginas del catálogo con tamaño tres y orden por id, sin duplicar elementos.",
      "GET /cursos?pagina=1&tamano=3&orden=id",
      "GET /cursos?pagina=1&tamano=3&orden=id\n\nGET /cursos?pagina=2&tamano=3&orden=id\n\nGET /cursos?pagina=3&tamano=3&orden=id",
      [/pagina=1/, /pagina=2/, /pagina=3/, /tamano=3/, /orden=id/],
      "¿Cuántos cursos tendrá la tercera página?",
      "Tendrá un curso, el id 7, porque las dos páginas anteriores ya contienen seis de los siete cursos."),

    spec(21, "Corrige una ruta inexistente", "404 y recuperación", "Errores",
      "Observa el 404 de /curso y después consulta correctamente /cursos.",
      "GET /curso",
      "GET /curso\n\nGET /cursos",
      [/GET\s+\/curso(?:\s|$)/im, /GET\s+\/cursos(?:\s|$)/im],
      "¿Un 404 significa que toda la API está caída?",
      "No. Aquí significa que esa ruta no existe; la colección correcta responde 200 inmediatamente después."),
    spec(22, "Corrige un identificador mal formado", "400 e id", "Errores",
      "Prueba /cursos/tres, lee el 400 y vuelve a pedir el curso mediante el id numérico 3.",
      "GET /cursos/tres",
      "GET /cursos/tres\n\nGET /cursos/3",
      [/GET\s+\/cursos\/tres/i, /GET\s+\/cursos\/3/i],
      "¿Por qué la primera respuesta es 400 y no 404?",
      "Porque la ruta reconoce el recurso, pero el identificador incumple el formato numérico esperado."),
    spec(23, "Reemplaza un parámetro desconocido", "Contrato de filtros", "Errores",
      "Observa el rechazo de tipo=Web y repite la consulta con el parámetro admitido categoria=Web.",
      "GET /cursos?tipo=Web",
      "GET /cursos?tipo=Web\n\nGET /cursos?categoria=Web",
      [/tipo=Web/i, /categoria=Web/i],
      "¿Por qué una API puede rechazar un parámetro que parece razonable?",
      "Porque los nombres pertenecen al contrato del servicio; esta API define categoria y no tipo."),
    spec(24, "Corrige una página fuera del contrato", "Validar paginación", "Errores",
      "Comprueba el error de pagina=0 y repite con pagina=1 y tamano=2.",
      "GET /cursos?pagina=0&tamano=2",
      "GET /cursos?pagina=0&tamano=2\n\nGET /cursos?pagina=1&tamano=2",
      [/pagina=0/i, /pagina=1/i, /tamano=2/i],
      "¿Qué condición incumple pagina=0?",
      "La numeración de esta API comienza en 1; tanto pagina como tamano deben ser enteros mayores que cero."),

    spec(25, "Crea un curso con los datos obligatorios", "POST mínimo", "Creación",
      "Crea Rust de nivel Inicial y consulta la dirección /cursos/8 asignada por el servidor.",
      request("POST", "/cursos", { nombre: "Rust" }),
      `${request("POST", "/cursos", { nombre: "Rust", nivel: "Inicial" })}\n\nGET /cursos/8`,
      [/POST\s+\/cursos/i, /Authorization:\s*Bearer/i, /Content-Type:\s*application\/json/i, /GET\s+\/cursos\/8/i],
      "¿Quién decide el id del curso nuevo?",
      "El servidor asigna el id 8 y lo comunica en el cuerpo y en la cabecera Location."),
    spec(26, "Crea un curso con datos de catálogo", "POST completo", "Creación",
      "Crea Kotlin Avanzado, categoría Lenguajes, de 10 horas y 45 inscritos; después consúltalo.",
      request("POST", "/cursos", { nombre: "Kotlin", nivel: "Avanzado" }),
      `${request("POST", "/cursos", { nombre: "Kotlin", nivel: "Avanzado", categoria: "Lenguajes", duracion: 10, inscritos: 45 })}\n\nGET /cursos/8`,
      [/POST\s+\/cursos/i, /"categoria":"Lenguajes"/i, /"duracion":10/i, /"inscritos":45/i],
      "¿La respuesta 201 devuelve solo un mensaje?",
      "No. Devuelve el recurso creado con su id y conserva todos los campos enviados."),
    spec(27, "Crea una inscripción relacionada", "POST estudiante", "Creación",
      "Crea a Elena en Temuco, inscrita en curso_id 3, y consulta /estudiantes/5.",
      request("POST", "/estudiantes", { nombre: "Elena" }),
      `${request("POST", "/estudiantes", { nombre: "Elena", ciudad: "Temuco", curso_id: 3 })}\n\nGET /estudiantes/5`,
      [/POST\s+\/estudiantes/i, /"curso_id":3/i, /GET\s+\/estudiantes\/5/i],
      "¿Qué identifica curso_id en el estudiante creado?",
      "Referencia al curso JavaScript; no es el identificador propio de Elena, que el servidor asigna como 5."),
    spec(28, "Recupera una creación rechazada por autorización", "401 y reintento", "Creación",
      "Intenta crear Go sin Authorization, reintenta con el token correcto y consulta el único curso creado.",
      `POST /cursos\n${json}\n\n{"nombre":"Go","nivel":"Inicial"}`,
      `POST /cursos\n${json}\n\n{"nombre":"Go","nivel":"Inicial"}\n\n${request("POST", "/cursos", { nombre: "Go", nivel: "Inicial" })}\n\nGET /cursos/8`,
      [/POST\s+\/cursos/i, /Authorization:\s*Bearer\s+clave-demo-2026/i, /GET\s+\/cursos\/8/i],
      "¿El intento 401 consume un identificador?",
      "No. Solo la petición autorizada crea el curso y recibe el id 8."),

    spec(29, "Actualiza un solo campo con PATCH", "PATCH parcial", "Actualización",
      "Cambia la duración de APIs a 11 horas y consulta el recurso para verificar el resto de sus datos.",
      "GET /cursos/6",
      `${request("PATCH", "/cursos/6", { duracion: 11 })}\n\nGET /cursos/6`,
      [/PATCH\s+\/cursos\/6/i, /"duracion":11/i, /GET\s+\/cursos\/6/i],
      "¿Qué campos deberían permanecer iguales?",
      "El id, nombre, nivel, categoría e inscritos se conservan; PATCH cambia solamente duración."),
    spec(30, "Corrige dos campos de un recurso", "PATCH combinado", "Actualización",
      "Renombra Git como Git y GitHub y cambia su nivel a Inicial; comprueba /cursos/5.",
      "GET /cursos/5",
      `${request("PATCH", "/cursos/5", { nombre: "Git y GitHub", nivel: "Inicial" })}\n\nGET /cursos/5`,
      [/PATCH\s+\/cursos\/5/i, /"nombre":"Git y GitHub"/i, /"nivel":"Inicial"/i],
      "¿El id 5 cambia con esta actualización?",
      "No. La identidad del recurso se conserva aunque cambien dos propiedades descriptivas."),
    spec(31, "Envía una actualización con PUT", "PUT del recurso", "Actualización",
      "Actualiza /cursos/4 con nombre SQL práctico, nivel Siguiente y duración 7; después consúltalo.",
      "GET /cursos/4",
      `${request("PUT", "/cursos/4", { nombre: "SQL práctico", nivel: "Siguiente", duracion: 7 })}\n\nGET /cursos/4`,
      [/PUT\s+\/cursos\/4/i, /"nombre":"SQL práctico"/i, /"nivel":"Siguiente"/i, /GET\s+\/cursos\/4/i],
      "¿Cómo trata este laboratorio los campos no enviados en PUT?",
      "Su contrato educativo los conserva; por eso la consulta posterior sigue mostrando categoría e inscritos."),
    spec(32, "Actualiza una inscripción y vuelve a leerla", "PATCH estudiante", "Actualización",
      "Cambia la ciudad de Grace a Viña del Mar y confirma el resultado con GET /estudiantes/2.",
      "GET /estudiantes/2",
      `${request("PATCH", "/estudiantes/2", { ciudad: "Viña del Mar" })}\n\nGET /estudiantes/2`,
      [/PATCH\s+\/estudiantes\/2/i, /"ciudad":"Viña del Mar"/i, /GET\s+\/estudiantes\/2/i],
      "¿Qué relación mantiene Grace después del cambio?",
      "Conserva id 2 y curso_id 1; solo cambia la ciudad solicitada."),

    spec(33, "Elimina y confirma la ausencia", "DELETE y 404", "Eliminación",
      "Elimina el curso 7 y demuestra su ausencia con una consulta posterior al mismo id.",
      "GET /cursos/7",
      `${request("DELETE", "/cursos/7", undefined)}\n\nGET /cursos/7`,
      [/DELETE\s+\/cursos\/7/i, /Authorization:\s*Bearer/i, /GET\s+\/cursos\/7/i],
      "¿Por qué DELETE responde 204 sin cuerpo?",
      "La operación terminó correctamente y no necesita representar un recurso que ya no existe."),
    spec(34, "Corrige un borrado sin autorización", "DELETE protegido", "Eliminación",
      "Observa el 401 al borrar /cursos/6 sin token, repite con autorización y confirma el 404.",
      "DELETE /cursos/6",
      `DELETE /cursos/6\n\n${request("DELETE", "/cursos/6", undefined)}\n\nGET /cursos/6`,
      [/DELETE\s+\/cursos\/6/i, /Authorization:\s*Bearer/i, /GET\s+\/cursos\/6/i],
      "¿El primer DELETE modifica el catálogo?",
      "No. La respuesta 401 deja el recurso intacto; solo el segundo DELETE autorizado lo elimina."),
    spec(35, "Crea y elimina un recurso temporal", "Ciclo temporal", "Eliminación",
      "Crea a Margaret en Santiago, consulta su id 5, elimínala y confirma que ya no existe.",
      request("POST", "/estudiantes", { nombre: "Margaret" }),
      `${request("POST", "/estudiantes", { nombre: "Margaret", ciudad: "Santiago", curso_id: 4 })}\n\nGET /estudiantes/5\n\n${request("DELETE", "/estudiantes/5", undefined)}\n\nGET /estudiantes/5`,
      [/POST\s+\/estudiantes/i, /GET\s+\/estudiantes\/5/i, /DELETE\s+\/estudiantes\/5/i],
      "¿Cuántos estudiantes quedan al terminar?",
      "Quedan los cuatro iniciales: el recurso temporal se crea y luego se elimina dentro del mismo flujo."),
    spec(36, "Elimina solo el recurso elegido", "Borrado selectivo", "Eliminación",
      "Elimina a Linus, comprueba su 404 y consulta la colección para verificar que quedan tres estudiantes.",
      "GET /estudiantes/3",
      `${request("DELETE", "/estudiantes/3", undefined)}\n\nGET /estudiantes/3\n\nGET /estudiantes?orden=id`,
      [/DELETE\s+\/estudiantes\/3/i, /GET\s+\/estudiantes\/3/i, /GET\s+\/estudiantes\?orden=id/i],
      "¿Qué ids deberían quedar en la colección?",
      "Quedan 1, 2 y 4; borrar el id 3 no renumera ni modifica los demás recursos."),

    spec(37, "Consulta estudiantes de un curso", "Filtro relacionado", "Relaciones",
      "Obtén estudiantes con curso_id 1, ordenados por nombre, y comprueba que son Ada y Grace.",
      "GET /estudiantes?curso_id=1",
      "GET /estudiantes?curso_id=1&orden=nombre",
      [/GET\s+\/estudiantes\?/i, /curso_id=1/i, /orden=nombre/i],
      "¿Por qué filtras por curso_id y no por id?",
      "id identifica a cada estudiante; curso_id contiene la referencia común al curso Python."),
    spec(38, "Sigue una referencia entre recursos", "Consulta encadenada", "Relaciones",
      "Consulta al estudiante 3 y luego el curso indicado por su curso_id.",
      "GET /estudiantes/3",
      "GET /estudiantes/3\n\nGET /cursos/3",
      [/GET\s+\/estudiantes\/3/i, /GET\s+\/cursos\/3/i],
      "¿Qué curso encontrarás para Linus?",
      "Su curso_id es 3, por lo que la segunda consulta devuelve JavaScript."),
    spec(39, "Valida la relación antes de crear", "Referencia verificada", "Relaciones",
      "Comprueba /cursos/3, crea a Elena con curso_id 3 y vuelve a leer estudiante y curso.",
      "GET /cursos/3",
      `GET /cursos/3\n\n${request("POST", "/estudiantes", { nombre: "Elena", ciudad: "Temuco", curso_id: 3 })}\n\nGET /estudiantes/5\n\nGET /cursos/3`,
      [/GET\s+\/cursos\/3/i, /POST\s+\/estudiantes/i, /"curso_id":3/i, /GET\s+\/estudiantes\/5/i],
      "¿Qué riesgo reduces al consultar primero el curso?",
      "Evitas crear una referencia hacia un identificador inexistente, algo que este simulador no impide por sí solo."),
    spec(40, "Detecta una referencia que no existe", "Relación ausente", "Relaciones",
      "Comprueba que /cursos/99 no existe y que tampoco hay estudiantes con curso_id 99.",
      "GET /cursos/99",
      "GET /cursos/99\n\nGET /estudiantes?curso_id=99",
      [/GET\s+\/cursos\/99/i, /GET\s+\/estudiantes\?curso_id=99/i],
      "¿Conviene crear una inscripción con curso_id 99 después de estas respuestas?",
      "No. El 404 y la colección vacía muestran que la referencia no es válida para este catálogo."),

    spec(41, "Crea, corrige y verifica un curso", "Flujo de edición", "Flujos robustos",
      "Crea Rust Inicial con 8 horas, corrígelo a 10 horas y consulta su estado final.",
      request("POST", "/cursos", { nombre: "Rust", nivel: "Inicial", duracion: 8 }),
      `${request("POST", "/cursos", { nombre: "Rust", nivel: "Inicial", duracion: 8 })}\n\n${request("PATCH", "/cursos/8", { duracion: 10 })}\n\nGET /cursos/8`,
      [/POST\s+\/cursos/i, /PATCH\s+\/cursos\/8/i, /"duracion":10/i, /GET\s+\/cursos\/8/i],
      "¿Qué duración mostrará la consulta final?",
      "Mostrará 10, mientras el nombre, nivel e id asignados durante la creación se mantienen."),
    spec(42, "Comprueba un recurso durante todo su ciclo", "Ciclo CRUD", "Flujos robustos",
      "Crea Go, búscalo, elimínalo y confirma su ausencia sin afectar los siete cursos iniciales.",
      request("POST", "/cursos", { nombre: "Go", nivel: "Inicial" }),
      `${request("POST", "/cursos", { nombre: "Go", nivel: "Inicial" })}\n\nGET /cursos?q=go\n\n${request("DELETE", "/cursos/8", undefined)}\n\nGET /cursos/8\n\nGET /cursos`,
      [/POST\s+\/cursos/i, /GET\s+\/cursos\?q=go/i, /DELETE\s+\/cursos\/8/i, /GET\s+\/cursos\s*$/im],
      "¿Cuál será el total final del catálogo?",
      "Volverá a 7: el curso temporal se elimina y los recursos iniciales permanecen."),
    spec(43, "Actualiza y localiza el resultado", "Actualizar y filtrar", "Flujos robustos",
      "Cambia Git a nivel Inicial y usa un filtro para comprobar que aparece en esa colección.",
      "GET /cursos?nivel=Inicial",
      `${request("PATCH", "/cursos/5", { nivel: "Inicial" })}\n\nGET /cursos?nivel=Inicial&orden=id`,
      [/PATCH\s+\/cursos\/5/i, /"nivel":"Inicial"/i, /GET\s+\/cursos\?nivel=Inicial/i],
      "¿Cuántos cursos Iniciales habrá después del cambio?",
      "Habrá cinco: los cuatro iniciales del catálogo más Git, que cambió desde Siguiente."),
    spec(44, "Pagina un catálogo después de ampliarlo", "Mutación y página", "Flujos robustos",
      "Crea Rust y consulta la tercera página con tamaño tres y orden por id; deben aparecer 7 y 8.",
      request("POST", "/cursos", { nombre: "Rust", nivel: "Inicial" }),
      `${request("POST", "/cursos", { nombre: "Rust", nivel: "Inicial" })}\n\nGET /cursos?orden=id&pagina=3&tamano=3`,
      [/POST\s+\/cursos/i, /orden=id/i, /pagina=3/i, /tamano=3/i],
      "¿Cambian total y páginas después de crear Rust?",
      "Sí. El total pasa a 8 y siguen siendo tres páginas; la última ahora contiene dos recursos."),

    spec(45, "Registra un curso y su primera inscripción", "Alta relacionada", "Proyecto",
      "Crea Diseño de APIs, crea a Elena con la referencia al curso nuevo y consulta ambos recursos.",
      request("POST", "/cursos", { nombre: "Diseño de APIs", nivel: "Siguiente" }),
      `${request("POST", "/cursos", { nombre: "Diseño de APIs", nivel: "Siguiente", categoria: "Web", duracion: 10 })}\n\n${request("POST", "/estudiantes", { nombre: "Elena", ciudad: "Temuco", curso_id: 8 })}\n\nGET /cursos/8\n\nGET /estudiantes/5`,
      [/POST\s+\/cursos/i, /POST\s+\/estudiantes/i, /"curso_id":8/i, /GET\s+\/cursos\/8/i, /GET\s+\/estudiantes\/5/i],
      "¿Qué ids conectan los dos recursos creados?",
      "El curso recibe id 8 y la estudiante id 5; curso_id 8 conecta la inscripción con el curso."),
    spec(46, "Corrige un campo rechazado antes de crear", "Validación del contrato", "Proyecto",
      "Intenta crear un curso con campo horas, corrige a duracion y verifica una sola creación.",
      request("POST", "/cursos", { nombre: "Rust", nivel: "Inicial", horas: 8 }),
      `${request("POST", "/cursos", { nombre: "Rust", nivel: "Inicial", horas: 8 })}\n\n${request("POST", "/cursos", { nombre: "Rust", nivel: "Inicial", duracion: 8 })}\n\nGET /cursos/8`,
      [/"horas":8/i, /"duracion":8/i, /GET\s+\/cursos\/8/i],
      "¿Por qué el recurso creado conserva el id 8?",
      "La petición con el campo desconocido se rechaza con 400 y no consume un id; la corregida es la primera creación."),
    spec(47, "Coordina cambios en curso e inscripción", "Actualización coordinada", "Proyecto",
      "Actualiza JavaScript a nivel Siguiente y mueve a Linus a Valparaíso; consulta ambos resultados.",
      "GET /cursos/3\n\nGET /estudiantes/3",
      `${request("PATCH", "/cursos/3", { nivel: "Siguiente" })}\n\n${request("PATCH", "/estudiantes/3", { ciudad: "Valparaíso" })}\n\nGET /cursos/3\n\nGET /estudiantes/3`,
      [/PATCH\s+\/cursos\/3/i, /PATCH\s+\/estudiantes\/3/i, /GET\s+\/cursos\/3/i, /GET\s+\/estudiantes\/3/i],
      "¿Una petición modifica automáticamente el otro recurso?",
      "No. Cada PATCH tiene su ruta y responsabilidad; las dos consultas finales comprueban ambos cambios."),
    spec(48, "Retira una inscripción sin borrar el curso", "Baja controlada", "Proyecto",
      "Elimina a Linus, confirma su ausencia y demuestra que JavaScript sigue disponible.",
      "GET /estudiantes/3\n\nGET /cursos/3",
      `${request("DELETE", "/estudiantes/3", undefined)}\n\nGET /estudiantes/3\n\nGET /cursos/3\n\nGET /estudiantes?curso_id=3`,
      [/DELETE\s+\/estudiantes\/3/i, /GET\s+\/estudiantes\/3/i, /GET\s+\/cursos\/3/i, /curso_id=3/i],
      "¿Eliminar la inscripción borra también JavaScript?",
      "No. Son recursos distintos; el curso 3 sigue respondiendo 200 y ya no tiene estudiantes asociados."),

    spec(49, "Publica una ampliación del catálogo verificable", "Proyecto catálogo", "Proyecto final",
      "Revisa los cursos de Datos, crea Análisis con pandas, actualiza sus inscritos y localízalo con búsqueda.",
      "GET /cursos?categoria=Datos",
      `GET /cursos?categoria=Datos&orden=id\n\n${request("POST", "/cursos", { nombre: "Análisis con pandas", nivel: "Avanzado", categoria: "Datos", duracion: 12, inscritos: 0 })}\n\n${request("PATCH", "/cursos/8", { inscritos: 30 })}\n\nGET /cursos?q=pandas\n\nGET /cursos/8`,
      [/categoria=Datos/i, /POST\s+\/cursos/i, /PATCH\s+\/cursos\/8/i, /q=pandas/i, /GET\s+\/cursos\/8/i],
      "¿Qué evidencia confirma la publicación del curso?",
      "La búsqueda devuelve un único resultado con id 8 y la consulta individual muestra 30 inscritos."),
    spec(50, "Gestiona una inscripción de principio a fin", "Proyecto integrador 50", "Proyecto final",
      "Crea un curso y una estudiante relacionados, corrige la ciudad, verifica, elimina la inscripción y conserva el curso.",
      "GET /cursos",
      `${request("POST", "/cursos", { nombre: "Arquitectura de APIs", nivel: "Avanzado", categoria: "Web", duracion: 14 })}\n\n${request("POST", "/estudiantes", { nombre: "Elena", ciudad: "Santiago", curso_id: 8 })}\n\n${request("PATCH", "/estudiantes/5", { ciudad: "Temuco" })}\n\nGET /estudiantes/5\n\nGET /cursos/8\n\n${request("DELETE", "/estudiantes/5", undefined)}\n\nGET /estudiantes/5\n\nGET /cursos/8`,
      [/POST\s+\/cursos/i, /POST\s+\/estudiantes/i, /PATCH\s+\/estudiantes\/5/i, /DELETE\s+\/estudiantes\/5/i, /GET\s+\/cursos\/8/i],
      "¿Qué debe existir al terminar y qué debe haber desaparecido?",
      "El curso 8 permanece disponible; la estudiante temporal responde 404 después del DELETE autorizado.")
  ];

  const levelMeta = [
    ["Consultas precisas", "Filtros, búsqueda, orden y paginación"],
    ["Errores que orientan", "Códigos de estado y correcciones verificables"],
    ["Creación de recursos", "Autorización, JSON, ids y Location"],
    ["Actualizaciones controladas", "PATCH, PUT y lectura posterior"],
    ["Eliminación verificable", "Autorización, 204 y confirmación de ausencia"],
    ["Relaciones entre recursos", "Identificadores propios y referencias"],
    ["Flujos robustos", "Secuencias completas con estado comprobable"],
    ["Casos de producto", "Altas, correcciones, coordinación y bajas"],
    ["Proyectos integradores", "Catálogo e inscripciones de principio a fin"]
  ];

  const stable = value => {
    if (Array.isArray(value)) return value.map(stable);
    if (!value || typeof value !== "object") return value;
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])]));
  };
  const shape = result => JSON.stringify(stable({ respuestas: result.respuestas, datos: result.datos }));
  const usesAll = (code, patterns) => patterns.every(pattern => pattern.test(String(code).replace(/^\s*#.*$/gm, "")));
  const check = (label, test) => ({ label, test });
  const levels = [];
  const exams = [];

  function makeModule(item, index) {
    const reference = globalThis.ApiLab.run(item.solution);
    if (reference.error) throw new Error(`APIs, módulo ${item.id}: ${reference.error}`);
    const next = specs[index + 1];
    const statusSequence = reference.respuestas.map(response => response.status).join(" → ");
    return {
      id: item.id, kicker: `Módulo ${String(item.id).padStart(2, "0")} · ${item.topic}`,
      title: item.title, shortTitle: item.short, duration: item.id >= 49 ? "32 min" : "20 min",
      difficulty: item.id >= 49 ? "Proyecto final" : "Avanzado", file: "peticion.http · servidor simulado",
      intro: `Usarás ${item.short.toLowerCase()} para resolver una necesidad concreta y comprobar cada respuesta antes de continuar el flujo.`,
      example: item.solution,
      explanation: `La secuencia completa produce los estados ${statusSequence}. Lee método, ruta, código, cabeceras y cuerpo como partes del mismo contrato; una respuesta válida todavía puede pertenecer al recurso equivocado.`,
      paragraphs: [
        `Esta práctica profundiza en ${item.short.toLowerCase()} sin salir a internet. Cada ejecución comienza con el mismo catálogo y mantiene los cambios solamente durante esa secuencia.`,
        "Los códigos 2xx confirman operaciones aceptadas; los 4xx explican qué debe corregir el cliente. Revisa el cuerpo de error antes de reenviar.",
        "Si una comprobación falla, compara el método, la ruta, los parámetros, Authorization, Content-Type y el JSON antes de cambiar varias cosas a la vez."
      ],
      concepts: [
        `${item.short} forma parte del contrato observable de la API.`,
        "Cada respuesta se interpreta junto con su código de estado y su cuerpo.",
        "Las operaciones del laboratorio modifican datos solo dentro del intento actual."
      ],
      goal: item.goal, starter: item.starter, solution: item.solution,
      hints: [
        `Identifica primero qué petición demuestra ${item.short.toLowerCase()}.`,
        "Conserva un bloque por petición y separa método, cabeceras y cuerpo JSON con una línea vacía.",
        `Compara tu secuencia con esta estructura: ${item.solution.replace(/\n\n/g, " → ").replace(/\n/g, " · ")}`
      ],
      checks: [
        check(`Incluyes las peticiones esenciales de ${item.short}`, code => usesAll(code, item.required)),
        check(`Obtienes la secuencia de estados ${statusSequence}`, (_, result) => !result.error && result.respuestas.map(response => response.status).join(" → ") === statusSequence),
        check("Los recursos y respuestas coinciden con el resultado esperado", (_, result) => !result.error && shape(result) === shape(reference))
      ],
      success: next ? `Completaste un flujo HTTP verificable. El siguiente módulo aplicará esta base en «${next.title}».` : "Completaste cincuenta módulos y un ciclo relacionado desde la creación hasta una baja comprobada.",
      steps: [
        ["Petición", "Lee método, ruta, parámetros y cabeceras antes de interpretar el cuerpo."],
        ["Respuesta", `Sigue los códigos esperados en orden: ${statusSequence}.`],
        ["Estado", "Comprueba el recurso final mediante otra petición en vez de asumir el resultado."]
      ],
      question: item.prediction, answer: item.answer,
      mistakes: [
        ["La ruta responde, pero el dato no es el pedido", "Revisa id, filtros y orden; un 200 no garantiza que la pregunta esté bien formulada."],
        ["Una escritura devuelve 400, 401 o 415", "Lee la ayuda del cuerpo y corrige permisos, tipo de contenido o propiedades JSON."]
      ],
      lesson: {
        prerequisites: index === 0 ? "Haber completado los dieciséis módulos iniciales de APIs." : `Haber completado el módulo anterior: ${specs[index - 1].title}.`,
        walkthrough: ["Separa cada petición y predice su código de estado.", "Relaciona la respuesta con el cambio que debería producir.", "Usa la consulta final para verificar datos, ids y ausencia cuando corresponda."],
        prediction: item.prediction, answer: item.answer,
        reflection: "Explica qué evidencia aporta cada respuesta y cuál de ellas confirma realmente el objetivo de la misión.",
        extension: "Adapta mentalmente el flujo a otro id o filtro y anticipa qué código, recurso y total deberían cambiar.",
        feedback: ["Revisa las peticiones y valores imprescindibles.", "Compara el orden exacto de los códigos de estado.", "Contrasta cuerpos, ids y estado final del catálogo."]
      }
    };
  }

  function build() {
    if (levels.length) return;
    for (let levelIndex = 0; levelIndex < levelMeta.length; levelIndex += 1) {
      const start = levelIndex * 4;
      const part = specs.slice(start, start + (levelIndex === 8 ? 2 : 4));
      const modules = part.map((item, localIndex) => makeModule(item, start + localIndex));
      const [title, description] = levelMeta[levelIndex];
      levels.push({
        title, description, modules,
        completionTitle: `Finalizaste ${title.toLowerCase()} de APIs.`,
        completionCopy: levelIndex < 8 ? `Completaste ${modules.length} prácticas conectadas. Rinde el mini examen y continúa cuando estés listo.` : "Completaste los dos proyectos integradores. Rinde el examen final y repasa cualquier respuesta que todavía no puedas explicar.",
        approvedCopy: levelIndex < 8 ? `Aprobaste ${title.toLowerCase()}.` : "Aprobaste el nivel final y completaste cincuenta módulos de APIs."
      });
      const questions = Array.from({ length: 5 }, (_, questionIndex) => {
        if (questionIndex === 4) return { question: `¿Cómo compruebas un flujo de ${title.toLowerCase()}?`, options: ["Revisando método, ruta, estado, cuerpo y recurso final", "Mirando solo si aparece JSON", "Repitiendo la petición sin leer", "Aceptando cualquier código 2xx o 4xx"], answer: 0, explanation: "La petición y la respuesta forman un contrato; la lectura posterior confirma el estado alcanzado." };
        const module = modules[questionIndex % modules.length];
        const correct = module.concepts[0];
        const options = [correct, "Un 200 hace correcta cualquier consulta", "Todos los endpoints aceptan los mismos campos", "Cada petición reinicia los datos dentro del mismo intento"];
        const shift = questionIndex % options.length;
        const rotated = options.slice(shift).concat(options.slice(0, shift));
        return { question: `¿Qué idea corresponde a «${module.shortTitle}»?`, options: rotated, answer: rotated.indexOf(correct), explanation: `${correct} ${module.explanation}` };
      });
      exams.push({ levelId: levelIndex + 5, title: `Mini examen: ${title}`, passing: 4, intro: `Repasa ${title.toLowerCase()}. Necesitas cuatro respuestas correctas de cinco.`, questions });
    }
  }

  function apply() {
    const course = globalThis.ApisCourse;
    if (!course || !globalThis.ApiLab) return;
    if (course.levels.length === 3) globalThis.CourseExpansion?.apply({ apis: course });
    if (course.levels.length !== 4) return;
    build();
    course.levels.push(...levels);
    course.lessons = course.levels.flatMap(level => level.modules);
    course.stages = [...course.stages, ...levels.map(level => level.title)];
    const bank = globalThis.StarterExams?.LEVEL_EXAMS?.apis;
    if (bank) for (const exam of exams) if (!bank.some(item => item.levelId === exam.levelId)) bank.push(exam);
  }

  apply();
  globalThis.ApisFiftyCourse = Object.freeze({ levels, exams, specs, apply });
})();
