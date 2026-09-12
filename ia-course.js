/*
  Ruta de Inteligencia artificial: 3 niveles de 4 módulos sobre ia-lab.js.
  Todo lo que el laboratorio muestra está calculado; no hay respuestas simuladas.
*/
(() => {
  "use strict";

  const accion = (result, tipo) => result.acciones.find((item) => item.tipo === tipo);
  const acciones = (result, tipo) => result.acciones.filter((item) => item.tipo === tipo);
  const usa = (code, patron) => patron.test(String(code).replace(/^\s*#.*$/gm, ""));

  const lesson = (datos) => ({
    duration: "15 min",
    file: "consola.ia · laboratorio local",
    success: "Listo. Fíjate en qué se calculó y qué sigue dependiendo de tu criterio.",
    ...datos
  });

  const lessons = [
    lesson({
      title: "Mide un texto en tokens",
      shortTitle: "Tokens",
      difficulty: "Inicio",
      intro: "Un modelo de lenguaje no lee letras ni palabras completas: trabaja con tokens, piezas de texto de tamaño variable.",
      example: "tokenizar Hola, ¿cómo estás?",
      explanation: "Los tokens son la unidad con la que se mide todo: el límite de una conversación, la velocidad y el precio. Una palabra corta suele ser un token; una larga se parte en varios. Este laboratorio usa una aproximación declarada, no el tokenizador exacto de un modelo comercial.",
      concepts: [
        "El token es la unidad de medida, no la palabra.",
        "Las palabras largas se dividen en varias piezas.",
        "Los signos de puntuación también ocupan tokens."
      ],
      goal: "Mide un texto de al menos 12 palabras y observa cuántos tokens resultan.",
      hints: [
        "Escribe tokenizar seguido de tu texto en la misma línea.",
        "Usa una frase larga: un párrafo corto sirve.",
        "Fíjate en cómo se parten las palabras de más de seis letras."
      ],
      starter: "tokenizar Hola",
      checks: [
        { label: "Usas el comando tokenizar", test: (code, result) => Boolean(accion(result, "tokenizar")) },
        { label: "El texto tiene al menos 12 palabras", test: (code, result) => String(accion(result, "tokenizar")?.texto || "").trim().split(/\s+/).length >= 12 },
        { label: "El resultado supera los 15 tokens", test: (code, result) => (accion(result, "tokenizar")?.tokens || 0) > 15 }
      ]
    }),
    lesson({
      title: "Calcula cuánto cuesta una tarea",
      shortTitle: "Costo por tokens",
      difficulty: "Inicio",
      intro: "Si los tokens son la unidad de medida, también son la unidad de cobro. Estimar el costo antes de automatizar algo evita sorpresas.",
      example: "costo 1200 avanzado",
      explanation: "El precio se expresa por cada mil tokens y cambia mucho entre modelos. Una tarea simple repetida diez mil veces puede costar más que una compleja hecha una vez. Los precios de este laboratorio son de ejemplo, para practicar el cálculo.",
      concepts: [
        "El costo depende de los tokens, no de las preguntas.",
        "Un modelo avanzado puede costar decenas de veces más.",
        "Conviene estimar antes de automatizar a gran escala."
      ],
      goal: "Compara el costo de 5000 tokens en el modelo rápido y en el avanzado, en el mismo intento.",
      hints: [
        "Escribe una línea por cada modelo.",
        "La forma es: costo 5000 rapido",
        "Repite con avanzado y compara los dos totales."
      ],
      starter: "costo 1000 rapido",
      checks: [
        { label: "Calculas el costo dos veces", test: (code, result) => acciones(result, "costo").length === 2 },
        { label: "Usas 5000 tokens en ambos casos", test: (code, result) => acciones(result, "costo").every((item) => item.tokens === 5000) },
        { label: "Comparas el modelo rápido con el avanzado", test: (code, result) => {
          const modelos = acciones(result, "costo").map((item) => item.modelo);
          return modelos.includes("rapido") && modelos.includes("avanzado");
        } }
      ]
    }),
    lesson({
      title: "Compara qué tan parecidos son dos textos",
      shortTitle: "Similitud",
      difficulty: "Fundamentos",
      intro: "Buena parte de lo que hace una herramienta con IA es comparar textos: encontrar la pregunta parecida, el documento relacionado, el duplicado.",
      example: "comparar cambiar de plan | modificar mi suscripción",
      explanation: "Este laboratorio calcula la similitud del coseno sobre las palabras de cada texto: cuenta cuántas comparten y en qué proporción. Es la versión simple de lo que un modelo hace con embeddings, y ya muestra el problema central: dos frases con el mismo significado pueden compartir muy pocas palabras.",
      concepts: [
        "La similitud va de 0 (nada en común) a 1 (mismas palabras).",
        "Se ignoran palabras muy frecuentes como de, la o para.",
        "Comparar palabras no es comparar significado."
      ],
      goal: "Compara dos frases que signifiquen lo mismo pero compartan pocas palabras, y obtén una similitud menor a 0.3.",
      hints: [
        "Separa las dos frases con una barra vertical: |",
        "Usa sinónimos: “quiero cancelar” frente a “dar de baja el servicio”.",
        "Si el puntaje sale alto, cambia más palabras entre una frase y otra."
      ],
      starter: "comparar hola | hola",
      checks: [
        { label: "Comparas dos textos", test: (code, result) => Boolean(accion(result, "comparar")) },
        { label: "Ambas frases tienen al menos tres palabras", test: (code, result) => {
          const item = accion(result, "comparar");
          return Boolean(item) && item.a.trim().split(/\s+/).length >= 3 && item.b.trim().split(/\s+/).length >= 3;
        } },
        { label: "La similitud queda bajo 0.3", test: (code, result) => (accion(result, "comparar")?.puntaje ?? 1) < 0.3 }
      ]
    }),
    lesson({
      title: "Ajusta la temperatura",
      shortTitle: "Temperatura",
      difficulty: "Fundamentos",
      intro: "Un modelo no elige la única palabra correcta: calcula una probabilidad para cada candidata. La temperatura decide cuánto se respeta ese ranking.",
      example: "temperatura 0.2",
      explanation: "Con temperatura baja, la opción más probable se lleva casi toda la probabilidad y las respuestas se vuelven predecibles. Con temperatura alta, la distribución se aplana y aparecen alternativas menos esperables. El laboratorio aplica la fórmula softmax sobre una lista fija de candidatos.",
      concepts: [
        "La temperatura no mide creatividad: aplana o agudiza probabilidades.",
        "Cerca de 0 el resultado es casi siempre el mismo.",
        "Un valor alto reparte la probabilidad entre más opciones."
      ],
      goal: "Muestra el efecto de dos temperaturas: una baja, donde el primer token pase del 90 %, y una alta, donde baje del 50 %.",
      hints: [
        "Escribe dos líneas, una con cada valor.",
        "Un valor bajo es 0.2; uno alto puede ser 3.",
        "Compara cómo cambia el porcentaje del primer token."
      ],
      starter: "temperatura 1",
      checks: [
        { label: "Pruebas dos temperaturas distintas", test: (code, result) => {
          const items = acciones(result, "temperatura");
          return items.length === 2 && items[0].valor !== items[1].valor;
        } },
        { label: "Con la temperatura baja el primer token supera el 90 %", test: (code, result) => acciones(result, "temperatura").some((item) => item.distribucion[0].probabilidad > 90) },
        { label: "Con la temperatura alta baja del 50 %", test: (code, result) => acciones(result, "temperatura").some((item) => item.distribucion[0].probabilidad < 50) }
      ]
    }),
    lesson({
      title: "Empieza por el rol y la tarea",
      shortTitle: "Rol y tarea",
      difficulty: "Práctica",
      intro: "Una instrucción vaga produce una respuesta vaga. Las dos piezas que más cambian el resultado son quién debe responder y qué debe hacer exactamente.",
      example: "Eres un tutor de matemáticas. Explica…",
      explanation: "El rol fija el tono y el nivel de detalle. La tarea debe ser un verbo concreto: explica, resume, clasifica, corrige. El laboratorio revisa la estructura de tu instrucción; no ejecuta ningún modelo ni evalúa la calidad de una respuesta.",
      concepts: [
        "El rol orienta el tono y la profundidad.",
        "Un verbo concreto evita respuestas genéricas.",
        "Estructura no es lo mismo que calidad."
      ],
      goal: "Escribe un prompt que defina un rol y pida una tarea concreta. Debe alcanzar al menos 2 de 6 elementos.",
      hints: [
        "Escribe prompt en la primera línea y tu instrucción debajo.",
        'Empieza con "Eres un…" para declarar el rol.',
        "Sigue con un verbo claro: explica, resume, corrige."
      ],
      starter: "prompt\nAyúdame con esto",
      checks: [
        { label: "Analizas un prompt", test: (code, result) => Boolean(accion(result, "prompt")) },
        { label: "Defines un rol", test: (code, result) => Boolean(accion(result, "prompt")?.criterios.find((c) => c.clave === "rol")?.cumple) },
        { label: "Pides una tarea concreta", test: (code, result) => Boolean(accion(result, "prompt")?.criterios.find((c) => c.clave === "tarea")?.cumple) }
      ]
    }),
    lesson({
      title: "Agrega contexto y formato",
      shortTitle: "Contexto y formato",
      difficulty: "Práctica",
      intro: "Saber qué hacer no basta: el modelo necesita sobre qué material trabajar y en qué forma quieres el resultado.",
      example: "Usando el siguiente texto… responde en una lista de 3 puntos.",
      explanation: "El contexto evita que el modelo rellene con datos genéricos. El formato convierte la respuesta en algo que puedes usar directamente: una lista, una tabla, un JSON o un máximo de palabras. Sin formato, cada ejecución devuelve una forma distinta.",
      concepts: [
        "El contexto delimita de dónde sacar la información.",
        "El formato hace la respuesta reutilizable.",
        "Un límite de extensión también es formato."
      ],
      goal: "Amplía tu prompt para que incluya rol, tarea, contexto y formato: al menos 4 de 6 elementos.",
      hints: [
        'Menciona el material: "usando el siguiente texto".',
        'Pide una forma concreta: "en una lista de 3 puntos" o "máximo 80 palabras".',
        "Conserva el rol y el verbo del módulo anterior."
      ],
      starter: "prompt\nEres un tutor. Explica el tema.",
      checks: [
        { label: "El prompt suma al menos 4 elementos", test: (code, result) => (accion(result, "prompt")?.puntaje || 0) >= 4 },
        { label: "Entregas contexto", test: (code, result) => Boolean(accion(result, "prompt")?.criterios.find((c) => c.clave === "contexto")?.cumple) },
        { label: "Especificas el formato de salida", test: (code, result) => Boolean(accion(result, "prompt")?.criterios.find((c) => c.clave === "formato")?.cumple) }
      ]
    }),
    lesson({
      title: "Pon límites para evitar invenciones",
      shortTitle: "Restricciones",
      difficulty: "Práctica",
      intro: "Un modelo prefiere responder algo antes que reconocer que no sabe. La instrucción tiene que darle permiso explícito para no saber.",
      example: "Si la respuesta no está en el texto, dilo.",
      explanation: "Las alucinaciones no se corrigen pidiendo “no inventes” y confiando: se reducen acotando la fuente, permitiendo la respuesta “no lo sé” y pidiendo que cite de dónde salió cada dato. Es una mitigación, no una garantía: siempre hay que verificar.",
      concepts: [
        "Permitir “no lo sé” reduce las invenciones.",
        "Acotar la fuente es más efectivo que pedir precisión.",
        "Ninguna instrucción elimina el riesgo por completo."
      ],
      goal: "Agrega una restricción explícita a tu prompt y llega a 5 de 6 elementos.",
      hints: [
        'Agrega: "si no está en el texto, responde que no lo sabes".',
        'También sirve: "usa solo la información entregada".',
        "Conserva rol, tarea, contexto y formato."
      ],
      starter: "prompt\nEres un asistente. Resume el siguiente texto en 3 puntos.",
      checks: [
        { label: "El prompt suma al menos 5 elementos", test: (code, result) => (accion(result, "prompt")?.puntaje || 0) >= 5 },
        { label: "Incluyes una restricción", test: (code, result) => Boolean(accion(result, "prompt")?.criterios.find((c) => c.clave === "restriccion")?.cumple) },
        { label: "Mantienes el formato de salida", test: (code, result) => Boolean(accion(result, "prompt")?.criterios.find((c) => c.clave === "formato")?.cumple) }
      ]
    }),
    lesson({
      title: "Muestra un ejemplo",
      shortTitle: "Prompt completo",
      difficulty: "Práctica",
      intro: "Cuando la salida tiene una forma exacta, describirla cuesta más que mostrarla. Un ejemplo vale más que tres frases de instrucciones.",
      example: "Por ejemplo: entrada … salida …",
      explanation: "Mostrar un caso resuelto reduce las respuestas fuera de formato mucho más que insistir en el formato con palabras. Con rol, tarea, contexto, formato, restricción y ejemplo tienes una instrucción completa y reutilizable.",
      concepts: [
        "Un ejemplo fija el formato mejor que una descripción.",
        "Los seis elementos hacen la instrucción reutilizable.",
        "Un prompt bueno se puede versionar como código."
      ],
      goal: "Completa los 6 elementos del prompt: rol, tarea, contexto, formato, restricción y ejemplo.",
      hints: [
        'Agrega una línea que empiece con "Por ejemplo:".',
        "Muestra una entrada corta y su salida esperada.",
        "Revisa la lista del laboratorio: deben quedar los seis con ✓."
      ],
      starter: "prompt\nEres un clasificador. Clasifica el siguiente comentario en una palabra, máximo 1 línea. Si no está claro, responde sin_datos.",
      checks: [
        { label: "El prompt alcanza los 6 elementos", test: (code, result) => (accion(result, "prompt")?.puntaje || 0) === 6 },
        { label: "Incluyes un ejemplo", test: (code, result) => Boolean(accion(result, "prompt")?.criterios.find((c) => c.clave === "ejemplo")?.cumple) },
        { label: "El prompt tiene cuerpo suficiente", test: (code, result) => String(accion(result, "prompt")?.texto || "").trim().split(/\s+/).length >= 25 }
      ]
    }),
    lesson({
      title: "Busca en tus propios documentos",
      shortTitle: "Recuperación",
      difficulty: "Integración",
      intro: "Un modelo no conoce los datos de tu empresa. La técnica habitual es buscar primero los documentos relevantes y entregárselos junto con la pregunta.",
      example: "buscar cómo cancelo mi plan",
      explanation: "Eso es la recuperación: convertir la consulta y los documentos en vectores, comparar y quedarse con los más cercanos. El laboratorio usa la misma idea con una medida simple sobre palabras. La base tiene cinco documentos sobre un servicio de suscripciones.",
      concepts: [
        "Primero se recupera, después se responde.",
        "El modelo solo ve los documentos que le entregas.",
        "Una mala recuperación produce una mala respuesta."
      ],
      goal: "Haz una búsqueda cuyo primer resultado sea doc-2, el documento sobre cancelar la suscripción.",
      hints: [
        "Escribe buscar seguido de la consulta.",
        "Usa palabras que aparezcan en ese documento: cancelar, suscripción.",
        "Revisa el puntaje: el primero de la lista debe ser doc-2."
      ],
      starter: "buscar certificado",
      checks: [
        { label: "Haces una búsqueda", test: (code, result) => Boolean(accion(result, "buscar")) },
        { label: "El primer resultado es doc-2", test: (code, result) => accion(result, "buscar")?.ranking[0]?.id === "doc-2" },
        { label: "Con un puntaje mayor a 0.3", test: (code, result) => (accion(result, "buscar")?.ranking[0]?.puntaje || 0) > 0.3 }
      ]
    }),
    lesson({
      title: "Descubre por qué falla una búsqueda",
      shortTitle: "Consultas que fallan",
      difficulty: "Integración",
      intro: "Cuando la búsqueda no encuentra el documento correcto, la respuesta final estará mal por más bueno que sea el modelo.",
      example: "comparar dar de baja el servicio | Cancelar la suscripción",
      explanation: "Buscar por palabras falla cuando el usuario y el documento usan vocabularios distintos. Compararlos directamente muestra el problema con un número, y explica por qué en producción se usan embeddings, sinónimos o reescritura de la consulta.",
      concepts: [
        "El usuario no usa las palabras del manual.",
        "Un puntaje bajo anticipa una mala recuperación.",
        "Detectar el problema es el primer paso para resolverlo."
      ],
      goal: "Muestra el problema: una búsqueda con palabras distintas que no deje a doc-2 primero, y la comparación entre esa consulta y el título del documento con menos de 0.2 de similitud.",
      hints: [
        'Busca con otras palabras: "dar de baja el servicio".',
        "Después compara esa frase con: Cancelar la suscripción",
        "La comparación debe quedar bajo 0.2."
      ],
      starter: "buscar cancelar suscripción",
      checks: [
        { label: "Haces una búsqueda y una comparación", test: (code, result) => Boolean(accion(result, "buscar")) && Boolean(accion(result, "comparar")) },
        { label: "La búsqueda no deja a doc-2 en el primer lugar", test: (code, result) => accion(result, "buscar")?.ranking[0]?.id !== "doc-2" },
        { label: "La comparación queda bajo 0.2", test: (code, result) => (accion(result, "comparar")?.puntaje ?? 1) < 0.2 }
      ]
    }),
    lesson({
      title: "Exige que la respuesta cite su fuente",
      shortTitle: "Citas y verificación",
      difficulty: "Integración",
      intro: "Una respuesta sin fuente no se puede verificar. Pedir la cita convierte una afirmación en algo comprobable.",
      example: "citar Entra a Suscripción y presiona Cancelar [doc-2]",
      explanation: "El laboratorio revisa dos cosas distintas: que los documentos citados existan y que estén entre los recuperados. Un identificador inventado es la señal más clara de una alucinación, y aparece incluso cuando la redacción suena convincente.",
      concepts: [
        "Citar permite verificar sin conocer el tema.",
        "Un identificador inventado delata una invención.",
        "Citar un documento no recuperado también es sospechoso."
      ],
      goal: "Busca cómo cancelar y escribe una respuesta citada que se apoye en doc-2, sin citar documentos inexistentes.",
      hints: [
        "Primero busca: el laboratorio necesita saber qué se recuperó.",
        "Después escribe citar seguido de tu respuesta.",
        "Incluye [doc-2] dentro del texto de la respuesta."
      ],
      starter: "buscar cancelar suscripción\ncitar Puedes cancelar cuando quieras [doc-9]",
      checks: [
        { label: "Buscas antes de responder", test: (code, result) => Boolean(accion(result, "buscar")) && Boolean(accion(result, "citar")) },
        { label: "No citas documentos inexistentes", test: (code, result) => (accion(result, "citar")?.inventados || ["x"]).length === 0 },
        { label: "La respuesta se apoya en doc-2", test: (code, result) => (accion(result, "citar")?.respaldadas || []).includes("doc-2") }
      ]
    }),
    lesson({
      title: "Proyecto final: un asistente responsable",
      shortTitle: "Proyecto final",
      difficulty: "Proyecto",
      intro: "Reúne el flujo completo: recuperar el documento correcto, responder citándolo y estimar cuánto costaría atender esa consulta.",
      example: "buscar … · citar … · costo …",
      explanation: "Así se arma un asistente sobre datos propios: recuperación, respuesta citada y control de costos. Ninguna de las tres partes es opcional. La calidad de la respuesta final sigue dependiendo de una persona que la revise.",
      concepts: [
        "Recuperar, responder y medir forman un solo flujo.",
        "La cita es lo que hace auditable la respuesta.",
        "El costo decide si la solución es viable."
      ],
      goal: "En un mismo intento: busca cómo recuperar la contraseña, responde citando doc-4 y calcula el costo de 800 tokens en el modelo rápido.",
      hints: [
        "Primera línea: busca con palabras del documento de contraseñas.",
        "Segunda línea: citar tu respuesta incluyendo [doc-4].",
        "Tercera línea: costo 800 rapido"
      ],
      starter: "buscar contraseña",
      checks: [
        { label: "La búsqueda deja a doc-4 en primer lugar", test: (code, result) => accion(result, "buscar")?.ranking[0]?.id === "doc-4" },
        { label: "La respuesta cita doc-4 y ningún documento inventado", test: (code, result) => {
          const cita = accion(result, "citar");
          return Boolean(cita) && cita.respaldadas.includes("doc-4") && cita.inventados.length === 0;
        } },
        { label: "Calculas 800 tokens en el modelo rápido", test: (code, result) => {
          const costo = accion(result, "costo");
          return Boolean(costo) && costo.tokens === 800 && costo.modelo === "rapido";
        } }
      ]
    })
  ];

  lessons.forEach((leccion, indice) => {
    leccion.kicker = "Módulo " + String(indice + 1).padStart(2, "0") + " · IA";
  });

  globalThis.IaCourse = {
    name: "Inteligencia artificial",
    storageKey: "codigo-cero.ia-v2.completed",
    examsKey: "codigo-cero.ia-v2.exams",
    kind: "ia",
    stages: ["Cómo procesa el texto", "Escribir instrucciones", "Datos propios y verificación"],
    levels: [
      { title: "El procesamiento del texto", description: "Tokens, costo, similitud y temperatura", modules: lessons.slice(0, 4) },
      { title: "Las instrucciones", description: "Rol, contexto, formato, límites y ejemplos", modules: lessons.slice(4, 8) },
      { title: "Los datos propios", description: "Recuperación, fallos, citas y flujo completo", modules: lessons.slice(8, 12) }
    ],
    lessons
  };
})();
