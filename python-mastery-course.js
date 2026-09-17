(() => {
  "use strict";

  const clean = source => String(source || "").replace(/#.*$/gm, "");
  const uses = (source, pattern) => pattern.test(clean(source));
  const hasLine = (result, text) => result.output.some(line => line.trim() === text);
  const sameList = (value, expected) => Array.isArray(value) && value.length === expected.length
    && value.every((item, index) => item === expected[index]);

  function project(spec) {
    return {
      ...spec,
      lesson: {
        walkthrough: spec.walkthrough,
        prediction: spec.prediction,
        answer: spec.answer,
        reflection: spec.reflection,
        extension: spec.extension,
        feedback: spec.feedback
      }
    };
  }

  const levels = [
    {
      id: 11,
      title: "Algoritmos sobre colecciones",
      description: "Pilas, búsqueda, ventanas y mezcla ordenada",
      stage: "Algoritmos sobre colecciones",
      completionTitle: "Finalizaste los algoritmos sobre colecciones de Python.",
      completionCopy: "Modelaste una pila, redujiste una búsqueda, calculaste ventanas y combinaste secuencias ordenadas. Rinde el mini examen antes de avanzar.",
      approvedCopy: "Aprobaste algoritmos sobre colecciones. Ya puedes concentrarte en la calidad y mantenibilidad del programa.",
      projects: [
        project({
          id: 41,
          title: "Gestiona una pila de tareas",
          shortTitle: "Pila LIFO",
          duration: "22 min",
          difficulty: "Avanzado",
          file: "proyecto_41.py",
          prerequisites: "Reutiliza listas, append(), pop(), while y f-strings.",
          summary: "Una pila procesa primero lo último que entró. Este patrón aparece al deshacer acciones, recorrer historiales y administrar tareas pendientes.",
          example: 'pila = []\npila.append("abrir")\npila.append("editar")\nwhile len(pila) > 0:\n    accion = pila.pop()\n    print(accion)',
          explanation: "append() agrega al final y pop() retira ese mismo extremo. Juntas forman una estructura LIFO: último en entrar, primero en salir.",
          concepts: ["Modelar una pila con list", "Retirar con pop()", "Controlar el caso vacío"],
          goal: "Parte con Preparar mochila, Revisar clima y Cargar teléfono, en ese orden. Procesa la pila hasta vaciarla y muestra primero Cargar teléfono, luego Revisar clima y finalmente Preparar mochila. Termina con Pendientes: 0.",
          starter: 'tareas = ["Preparar mochila", "Revisar clima", "Cargar teléfono"]\n\nwhile len(tareas) > 1:\n    print(tareas.pop(0))\n\nprint(f"Pendientes: {len(tareas)}")',
          hints: [
            "La tarea que debe salir primero está al final de la lista.",
            "Repite mientras la lista tenga elementos y guarda tareas.pop() en una variable.",
            'Usa while len(tareas) > 0:, tarea = tareas.pop() y print(tarea). Después muestra f"Pendientes: {len(tareas)}".'
          ],
          checks: ["Usas una pila con pop() dentro de while", "Procesas las tres tareas en orden LIFO", "La pila termina vacía"],
          success: "Procesaste una pila completa. Ahora reducirás una búsqueda descartando la mitad de los datos en cada paso.",
          walkthrough: ["append coloca abrir y después editar al final.", "pop retira editar porque fue la última acción agregada.", "La segunda vuelta retira abrir y la condición termina con la lista vacía."],
          prediction: "¿Qué texto aparece primero aunque abrir se haya agregado antes?",
          answer: "editar, porque una pila devuelve primero el último elemento agregado.",
          reflection: "Agrega Reservar entradas al final y predice la nueva primera salida.",
          extension: "Guarda las tareas procesadas en otra lista para construir un historial.",
          feedback: ["Usa pop() sin índice para retirar el último elemento dentro de while.", "No leas tareas[0]: la salida esperada empieza con Cargar teléfono y conserva el orden inverso.", "Continúa hasta len(tareas) == 0 y muestra Pendientes: 0."],
          validate(result, source) {
            return [
              uses(source, /while\s+len\s*\(\s*tareas\s*\)\s*>\s*0/) && uses(source, /tareas\.pop\s*\(/),
              ["Cargar teléfono", "Revisar clima", "Preparar mochila"].every((line, index) => result.output[index]?.trim() === line),
              hasLine(result, "Pendientes: 0") && Array.isArray(result.environment.tareas) && result.environment.tareas.length === 0
            ];
          }
        }),
        project({
          id: 42,
          title: "Encuentra un valor con búsqueda binaria",
          shortTitle: "Búsqueda binaria",
          duration: "28 min",
          difficulty: "Avanzado",
          file: "proyecto_42.py",
          prerequisites: "Reutiliza índices, while, división entera, condiciones y return.",
          summary: "En una lista ordenada no necesitas revisar cada posición. La búsqueda binaria compara el centro y descarta la mitad que ya no puede contener el objetivo.",
          example: 'def buscar(valores, objetivo):\n    inicio = 0\n    fin = len(valores) - 1\n    while inicio <= fin:\n        medio = (inicio + fin) // 2\n        if valores[medio] == objetivo:\n            return medio\n        if valores[medio] < objetivo:\n            inicio = medio + 1\n        else:\n            fin = medio - 1\n    return -1\n\nprint(buscar([2, 5, 8, 12], 8))',
          explanation: "inicio y fin delimitan la zona pendiente. Cada comparación mueve uno de esos límites más allá del centro; devolver -1 expresa que la zona terminó sin coincidencia.",
          concepts: ["Mantener límites inclusivos", "Calcular un punto medio", "Reducir el espacio de búsqueda"],
          goal: "Define buscar(valores, objetivo). En [3, 7, 11, 18, 24, 31, 45], muestra Posición 24: 4 y Posición 10: -1.",
          starter: 'def buscar(valores, objetivo):\n    return 0\n\nnumeros = [3, 7, 11, 18, 24, 31, 45]\nprint(f"Posición 24: {buscar(numeros, 24)}")',
          hints: [
            "Comienza con inicio en 0 y fin en len(valores) - 1.",
            "Mientras inicio <= fin, calcula medio y mueve inicio o fin según la comparación.",
            "Devuelve medio al encontrar el objetivo y -1 después del ciclo. Llama también buscar(numeros, 10)."
          ],
          checks: ["Implementas límites y punto medio dentro de while", "Encuentras 24 en el índice 4", "Devuelves -1 cuando 10 no existe"],
          success: "Implementaste una búsqueda que reduce el problema en cada vuelta. Ahora resumirás tramos consecutivos de una serie.",
          walkthrough: ["El centro inicial de cuatro valores es el índice 1, cuyo valor es 5.", "Como 8 es mayor, inicio avanza al índice 2.", "El nuevo centro contiene 8 y la función devuelve 2."],
          prediction: "¿La función puede aplicarse correctamente a [12, 2, 8, 5] sin ordenar?",
          answer: "No. La decisión de descartar una mitad depende de que los valores estén ordenados.",
          reflection: "Busca temporalmente 3 y 45. Explica por qué ambos extremos también se encuentran.",
          extension: "Devuelve además cuántas comparaciones fueron necesarias.",
          feedback: ["Crea inicio, fin y medio; actualiza un límite en cada vuelta del while.", "La función debe devolver el índice, no el valor. Para 24 corresponde 4.", "Cuando inicio supere fin, devuelve -1 y muestra Posición 10: -1."],
          validate(result, source) {
            return [
              uses(source, /def\s+buscar\s*\(/) && uses(source, /while\s+inicio\s*<=\s*fin/) && uses(source, /\/\//),
              hasLine(result, "Posición 24: 4"),
              hasLine(result, "Posición 10: -1")
            ];
          }
        }),
        project({
          id: 43,
          title: "Calcula promedios móviles",
          shortTitle: "Ventana móvil",
          duration: "25 min",
          difficulty: "Avanzado",
          file: "proyecto_43.py",
          prerequisites: "Reutiliza range(), segmentos de listas, sum(), len() y funciones.",
          summary: "Una ventana móvil resume grupos consecutivos y permite observar tendencias sin perder el orden temporal de los datos.",
          example: 'def promedios(valores, ventana):\n    salida = []\n    for inicio in range(len(valores) - ventana + 1):\n        tramo = valores[inicio:inicio + ventana]\n        salida.append(sum(tramo) / ventana)\n    return salida\n\nprint(promedios([2, 4, 8, 10], 2))',
          explanation: "Cada inicio define un segmento del mismo tamaño. El límite del range evita una ventana incompleta y append conserva el orden de los promedios.",
          concepts: ["Recorrer ventanas válidas", "Extraer un segmento", "Resumir sin cambiar la serie"],
          goal: "Define promedios_moviles(valores, ventana). Para [4, 6, 8, 10, 12] y ventana 3, guarda y muestra [6.0, 8.0, 10.0]. Muestra Ventanas: 3.",
          starter: 'def promedios_moviles(valores, ventana):\n    return valores\n\ndatos = [4, 6, 8, 10, 12]\nresultado = promedios_moviles(datos, 3)\nprint(resultado)',
          hints: [
            "Una serie de cinco valores tiene tres ventanas completas de tamaño tres.",
            "Recorre range(len(valores) - ventana + 1) y extrae valores[inicio:inicio + ventana].",
            "Agrega sum(tramo) / ventana a salida, devuélvela y muestra len(resultado)."
          ],
          checks: ["Recorres únicamente ventanas completas", "Obtienes los tres promedios esperados", "Informas que hay 3 ventanas"],
          success: "Resumiste tramos consecutivos manteniendo su orden. En el siguiente proyecto combinarás dos secuencias ordenadas sin reordenar todo al final.",
          walkthrough: ["La primera ventana contiene 2 y 4, cuyo promedio es 3.", "La siguiente comienza una posición después y contiene 4 y 8.", "La última ventana válida contiene 8 y 10; no se crea ningún tramo incompleto."],
          prediction: "¿Cuántas ventanas de tamaño 2 produce una lista con 4 elementos?",
          answer: "Tres: posiciones 0–1, 1–2 y 2–3. La fórmula es 4 - 2 + 1.",
          reflection: "Cambia temporalmente la ventana a 2 y anticipa los cuatro promedios.",
          extension: "Devuelve una lista vacía cuando ventana sea mayor que la cantidad de valores.",
          feedback: ["El range debe terminar en len(valores) - ventana + 1 para omitir tramos incompletos.", "Extrae cada tramo con slicing y divide su suma por ventana. El resultado es [6.0, 8.0, 10.0].", "Guarda la lista devuelta y muestra Ventanas: 3 con len(resultado)."],
          validate(result, source) {
            return [
              uses(source, /range\s*\(\s*len\s*\(\s*valores\s*\)\s*-\s*ventana\s*\+\s*1\s*\)/) && uses(source, /valores\s*\[\s*inicio\s*:\s*inicio\s*\+\s*ventana\s*\]/),
              sameList(result.environment.resultado, [6, 8, 10]),
              hasLine(result, "Ventanas: 3")
            ];
          }
        }),
        project({
          id: 44,
          title: "Mezcla dos listas ordenadas",
          shortTitle: "Mezcla lineal",
          duration: "30 min",
          difficulty: "Avanzado",
          file: "proyecto_44.py",
          prerequisites: "Reutiliza índices, while, append() y comparaciones.",
          summary: "Si dos listas ya están ordenadas, puedes combinarlas comparando solo sus próximos elementos. Este patrón evita ordenar nuevamente todos los datos.",
          example: 'def mezclar(a, b):\n    salida = []\n    i = 0\n    j = 0\n    while i < len(a) and j < len(b):\n        if a[i] <= b[j]:\n            salida.append(a[i])\n            i += 1\n        else:\n            salida.append(b[j])\n            j += 1\n    while i < len(a):\n        salida.append(a[i])\n        i += 1\n    while j < len(b):\n        salida.append(b[j])\n        j += 1\n    return salida\n\nprint(mezclar([1, 4], [2, 3]))',
          explanation: "i y j señalan el siguiente candidato de cada lista. El menor entra en salida y su índice avanza. Los ciclos finales copian el tramo que haya quedado pendiente.",
          concepts: ["Coordinar dos índices", "Elegir el menor candidato", "Copiar el resto pendiente"],
          goal: "Define mezclar(a, b). Combina [2, 8, 15, 21] y [1, 9, 10, 30] en [1, 2, 8, 9, 10, 15, 21, 30]. Muestra Total: 8.",
          starter: 'def mezclar(a, b):\n    return a + b\n\nprimera = [2, 8, 15, 21]\nsegunda = [1, 9, 10, 30]\ncombinada = mezclar(primera, segunda)\nprint(combinada)',
          hints: [
            "Mantén un índice para cada lista y compara a[i] con b[j].",
            "Después del ciclo conjunto, necesitas otro while para cada lista por si conserva elementos.",
            "Agrega el menor a salida, avanza solo su índice, copia ambos restos y muestra len(combinada)."
          ],
          checks: ["Coordinas dos índices y tres ciclos while", "Produces una única lista ordenada", "Muestras Total: 8"],
          success: "Combinaste secuencias ordenadas con un recorrido lineal. El próximo nivel aplicará estas decisiones a programas fáciles de mantener y comprobar.",
          walkthrough: ["1 se compara con 2 y entra primero.", "2 se compara con 3 y ocupa la siguiente posición.", "Cuando una lista termina, el ciclo final copia el valor pendiente de la otra."],
          prediction: "¿Qué ocurre si una de las listas comienza vacía?",
          answer: "El ciclo conjunto no se ejecuta y uno de los ciclos finales copia completa la lista restante.",
          reflection: "Prueba dos listas con valores repetidos y explica por qué ninguno se pierde.",
          extension: "Cuenta cuántas comparaciones realiza el primer while.",
          feedback: ["No concatenes ni llames sorted(): compara a[i] y b[j] mientras ambas listas tengan elementos.", "Agrega el menor y avanza solo el índice correspondiente; luego copia los restos. La lista final tiene ocho valores ordenados.", "Guarda el resultado en combinada y muestra Total: 8 con len()."],
          validate(result, source) {
            return [
              uses(source, /while\s+i\s*<\s*len\s*\(\s*a\s*\)\s+and\s+j\s*<\s*len\s*\(\s*b\s*\)/)
                && (clean(source).match(/\bwhile\b/g) || []).length >= 3 && !uses(source, /sorted\s*\(/),
              sameList(result.environment.combinada, [1, 2, 8, 9, 10, 15, 21, 30]),
              hasLine(result, "Total: 8")
            ];
          }
        })
      ]
    },
    {
      id: 12,
      title: "Calidad y mantenibilidad",
      description: "Configuración, contratos, regresiones y pipelines",
      stage: "Calidad y mantenibilidad",
      completionTitle: "Finalizaste la calidad y mantenibilidad de Python.",
      completionCopy: "Separaste configuración, validación, casos de prueba y etapas de procesamiento. Comprueba esas decisiones en el mini examen.",
      approvedCopy: "Aprobaste calidad y mantenibilidad. Estás listo para integrar toda la ruta en un proyecto final.",
      projects: [
        project({
          id: 45,
          title: "Normaliza datos con configuración",
          shortTitle: "Configuración separada",
          duration: "23 min",
          difficulty: "Avanzado",
          file: "proyecto_45.py",
          prerequisites: "Reutiliza diccionarios, funciones, strip(), lower(), get() y comprensiones.",
          summary: "Las equivalencias cambian con más frecuencia que el algoritmo. Guardarlas en un diccionario permite actualizar reglas sin reescribir la función.",
          example: 'alias = {"py": "Python", "js": "JavaScript"}\n\ndef normalizar(valor):\n    clave = valor.strip().lower()\n    return alias.get(clave, "Desconocido")\n\nprint(normalizar(" PY "))',
          explanation: "La función normaliza la entrada y consulta una configuración externa. get() define un resultado seguro para valores que no tienen equivalencia.",
          concepts: ["Separar datos de reglas", "Normalizar antes de consultar", "Definir un valor alternativo"],
          goal: "Crea alias para py, js y db con Python, JavaScript y Bases de datos. Normaliza [\" PY \", \"js\", \"DB\", \"go\"] y muestra [\"Python\", \"JavaScript\", \"Bases de datos\", \"Desconocido\"]. Muestra Conocidos: 3.",
          starter: 'alias = {"py": "Python"}\n\ndef normalizar(valor):\n    return valor\n\nentradas = [" PY ", "js", "DB", "go"]\nresultados = entradas\nprint(resultados)',
          hints: [
            "Completa primero el diccionario alias con tres claves en minúsculas.",
            "Dentro de normalizar, crea clave = valor.strip().lower() y consulta alias.get().",
            'Construye resultados con una comprensión y cuenta los valores distintos de "Desconocido".'
          ],
          checks: ["Separás las equivalencias en alias y defines normalizar()", "Obtienes cuatro nombres normalizados", "Calculas Conocidos: 3"],
          success: "Convertiste reglas cambiantes en configuración. Ahora expresarás un contrato que explique los problemas de cada registro.",
          walkthrough: ["strip elimina los espacios exteriores de PY.", "lower transforma la clave en py.", "alias.get encuentra Python; una clave ausente devolvería Desconocido."],
          prediction: "¿Qué parte cambiarías para aceptar ts como TypeScript?",
          answer: "Solo agregarías la pareja ts: TypeScript al diccionario alias; la función no necesita cambios.",
          reflection: "Añade temporalmente TS y comprueba que el total de conocidos aumenta.",
          extension: "Guarda los valores desconocidos en una lista para revisarlos después.",
          feedback: ["Completa alias y crea normalizar(valor); las equivalencias deben quedar fuera de la función.", "Aplica strip().lower() antes de alias.get(). La lista esperada termina con Desconocido.", "Cuenta con una comprensión los resultados que no sean Desconocido y muestra Conocidos: 3."],
          validate(result, source) {
            return [
              uses(source, /alias\s*=\s*\{/) && uses(source, /def\s+normalizar\s*\(/) && uses(source, /\.strip\s*\(\)\.lower\s*\(\)/),
              sameList(result.environment.resultados, ["Python", "JavaScript", "Bases de datos", "Desconocido"]),
              hasLine(result, "Conocidos: 3")
            ];
          }
        }),
        project({
          id: 46,
          title: "Explica errores de un registro",
          shortTitle: "Contrato de datos",
          duration: "27 min",
          difficulty: "Avanzado",
          file: "proyecto_46.py",
          prerequisites: "Reutiliza funciones, get(), isinstance(), condiciones y listas.",
          summary: "Validar no consiste solo en responder sí o no. Una lista de errores muestra qué regla falló y permite corregir el dato adecuado.",
          example: 'def errores_de(fila):\n    errores = []\n    if fila.get("nombre", "").strip() == "":\n        errores.append("nombre requerido")\n    horas = fila.get("horas", 0)\n    if not isinstance(horas, int) or horas <= 0:\n        errores.append("horas inválidas")\n    return errores\n\nprint(errores_de({"nombre": "", "horas": 0}))',
          explanation: "Cada regla agrega un mensaje independiente. La función devuelve evidencia concreta sin imprimir ni modificar el registro recibido.",
          concepts: ["Validar reglas independientes", "Comprobar un tipo", "Devolver errores accionables"],
          goal: "Define errores_de(fila). Valida nombre no vacío, horas como int mayor que 0 y nivel dentro de Inicial o Intermedio. Para nombre vacío, horas \"8\" y nivel Experto, muestra los tres mensajes y Errores: 3.",
          starter: 'def errores_de(fila):\n    return []\n\ncurso = {"nombre": "", "horas": "8", "nivel": "Experto"}\nerrores = errores_de(curso)\nprint(errores)',
          hints: [
            "Crea errores = [] y agrega un mensaje por cada regla incumplida.",
            "Comprueba las horas con not isinstance(horas, int) or horas <= 0.",
            'Rechaza nivel cuando no esté in ["Inicial", "Intermedio"], devuelve errores y muestra len(errores).'
          ],
          checks: ["Defines tres reglas dentro de errores_de()", "Devuelves los tres mensajes esperados", "Muestras Errores: 3"],
          success: "Construiste un contrato que explica cada rechazo. El siguiente proyecto convertirá requisitos en casos de regresión repetibles.",
          walkthrough: ["El nombre vacío agrega el primer mensaje.", "horas vale 0 y agrega el segundo sin impedir revisar otras reglas.", "La función devuelve ambos mensajes para que quien llama decida cómo mostrarlos."],
          prediction: "¿Por qué conviene usar tres if en lugar de elif?",
          answer: "Porque un mismo registro puede incumplir varias reglas y necesitas informar todas, no detenerte en la primera.",
          reflection: "Prueba un registro válido y anticipa la lista devuelta.",
          extension: "Agrupa los errores de varios registros en un diccionario por posición.",
          feedback: ["Inicializa una lista y usa tres if independientes dentro de errores_de().", "Agrega mensajes para nombre requerido, horas inválidas y nivel inválido; el registro dado debe producir los tres.", "Guarda el resultado en errores y muestra Errores: 3 con len()."],
          validate(result, source) {
            const errors = result.environment.errores;
            return [
              uses(source, /def\s+errores_de\s*\(/) && uses(source, /isinstance\s*\(/) && uses(source, /nivel[^\n]*not\s+in|not\s+in[^\n]*Inicial/),
              sameList(errors, ["nombre requerido", "horas inválidas", "nivel inválido"]),
              hasLine(result, "Errores: 3")
            ];
          }
        }),
        project({
          id: 47,
          title: "Crea casos de regresión",
          shortTitle: "Pruebas con datos",
          duration: "26 min",
          difficulty: "Avanzado",
          file: "proyecto_47.py",
          prerequisites: "Reutiliza funciones, listas de tuplas, desempaquetado, condiciones y acumuladores.",
          summary: "Una tabla de casos permite repetir las mismas comprobaciones después de cambiar una función. Cada fila documenta entrada, resultado esperado y propósito.",
          example: 'def precio_final(total):\n    if total >= 100:\n        return total - 10\n    return total\n\ncasos = [(80, 80), (100, 90), (150, 140)]\nfor entrada, esperado in casos:\n    print(precio_final(entrada) == esperado)',
          explanation: "Los casos separan los ejemplos de la implementación. Recorrerlos aplica el mismo criterio y hace visible cualquier diferencia entre obtenido y esperado.",
          concepts: ["Representar casos como datos", "Comparar obtenido y esperado", "Contar resultados aprobados"],
          goal: "Define costo(total): resta 20 si total >= 200 y no cambia los menores. Ejecuta casos (150,150), (200,180), (260,240). Muestra OK para cada uno y Aprobados: 3/3.",
          starter: 'def costo(total):\n    return total\n\ncasos = [("sin descuento", 150, 150)]\naprobados = 0\nfor nombre, entrada, esperado in casos:\n    obtenido = costo(entrada)\n    print(nombre, obtenido)',
          hints: [
            "Completa costo con la condición de borde total >= 200.",
            "Agrega los tres casos como tuplas de nombre, entrada y esperado.",
            'Compara obtenido == esperado, suma uno si pasa y muestra f"{nombre}: OK". Termina con Aprobados: 3/3.'
          ],
          checks: ["Defines la regla y tres casos de borde", "Los tres casos muestran OK", "El resumen indica 3/3"],
          success: "Convertiste requisitos en regresiones repetibles. Ahora organizarás un proceso completo en etapas pequeñas.",
          walkthrough: ["80 no cumple el umbral y conserva su valor.", "100 prueba exactamente el borde y recibe descuento.", "150 vuelve a cumplir la misma regla; cada comparación produce True."],
          prediction: "¿Qué caso detecta mejor si escribes total > 200 por error?",
          answer: "El caso con entrada 200, porque distingue si el límite está incluido.",
          reflection: "Cambia temporalmente el umbral a 250 y predice qué casos fallarán.",
          extension: "Agrega un cuarto caso con 0 para documentar el valor mínimo aceptado.",
          feedback: ["La condición de costo debe incluir el borde 200 y restar 20 solo desde allí.", "Representa los tres casos y compara obtenido con esperado; cada línea debe terminar en OK.", "Incrementa aprobados únicamente cuando coincidan y muestra Aprobados: 3/3."],
          validate(result, source) {
            return [
              uses(source, /def\s+costo\s*\(/) && uses(source, />=\s*200/) && (clean(source).match(/\(\s*"[^"]+"\s*,\s*\d+\s*,\s*\d+\s*\)/g) || []).length >= 3,
              result.output.filter(line => /:\s*OK$/.test(line.trim())).length === 3,
              hasLine(result, "Aprobados: 3/3")
            ];
          }
        }),
        project({
          id: 48,
          title: "Diseña un pipeline de transformación",
          shortTitle: "Pipeline por etapas",
          duration: "30 min",
          difficulty: "Avanzado",
          file: "proyecto_48.py",
          prerequisites: "Reutiliza funciones, comprensiones, diccionarios y composición.",
          summary: "Un pipeline divide un proceso en limpiar, validar y transformar. Cada etapa recibe una forma conocida y entrega datos preparados para la siguiente.",
          example: 'def limpiar(fila):\n    return {"nombre": fila["nombre"].strip(), "horas": fila["horas"]}\n\ndef es_valida(fila):\n    return fila["nombre"] != "" and fila["horas"] > 0\n\ndef transformar(fila):\n    return {"nombre": fila["nombre"].title(), "minutos": fila["horas"] * 60}\n\ndef procesar(filas):\n    limpias = [limpiar(fila) for fila in filas]\n    validas = [fila for fila in limpias if es_valida(fila)]\n    return [transformar(fila) for fila in validas]\n\nprint(procesar([{"nombre": " python ", "horas": 2}]))',
          explanation: "Cada función tiene un contrato reducido. procesar coordina las etapas y conserva variables intermedias que puedes inspeccionar por separado.",
          concepts: ["Separar etapas", "Filtrar entre transformaciones", "Conservar contratos previsibles"],
          goal: "Procesa Python con espacios y 8 horas, un nombre vacío con 5 y SQL con 6. Limpia nombres, rechaza el vacío y transforma horas a minutos. Muestra Python: 480, SQL: 360 y Registros: 2.",
          starter: 'registros = [\n    {"nombre": " python ", "horas": 8},\n    {"nombre": " ", "horas": 5},\n    {"nombre": "sql", "horas": 6}\n]\n\ndef procesar(filas):\n    return filas\n\nresultado = procesar(registros)\nprint(resultado)',
          hints: [
            "Crea funciones limpiar, es_valida y transformar antes de procesar.",
            "Dentro de procesar guarda limpias, luego validas y por último devuelve las transformadas.",
            "transformar devuelve nombre.title() y minutos = horas * 60. Recorre resultado y muestra también su tamaño."
          ],
          checks: ["Separás limpiar, validar y transformar", "El pipeline conserva Python y SQL con minutos", "Muestras dos líneas y Registros: 2"],
          success: "Construiste un pipeline observable y reutilizable. En el nivel final integrarás algoritmos, calidad y presentación en un producto pequeño.",
          walkthrough: ["limpiar retira los espacios del nombre.", "es_valida rechaza la fila que queda sin nombre.", "transformar convierte las horas aceptadas en minutos y procesar devuelve el lote final."],
          prediction: "¿En qué etapa conviene convertir horas a minutos: antes o después de validar?",
          answer: "Después de validar, para transformar únicamente registros que ya cumplen el contrato.",
          reflection: "Agrega temporalmente una fila con horas 0 y predice en qué etapa desaparece.",
          extension: "Haz que procesar devuelva también la cantidad de rechazados.",
          feedback: ["Define las tres funciones pequeñas; procesar debe coordinarlas en ese orden.", "Limpia con strip, filtra el nombre vacío y transforma horas a minutos. Deben quedar Python 480 y SQL 360.", "Recorre resultado para mostrar las dos líneas y termina con Registros: 2."],
          validate(result, source) {
            const rows = result.environment.resultado;
            return [
              ["limpiar", "es_valida", "transformar", "procesar"].every(name => uses(source, new RegExp("def\\s+" + name + "\\s*\\("))),
              Array.isArray(rows) && rows.length === 2 && rows[0]?.nombre === "Python" && rows[0]?.minutos === 480 && rows[1]?.nombre === "Sql" && rows[1]?.minutos === 360
                && hasLine(result, "Python: 480") && hasLine(result, "SQL: 360"),
              hasLine(result, "Registros: 2")
            ];
          }
        })
      ]
    },
    {
      id: 13,
      title: "Proyecto profesional integrado",
      description: "Recomendación explicable y reporte final",
      stage: "Proyecto profesional integrado",
      completionTitle: "Finalizaste el proyecto profesional integrado de Python.",
      completionCopy: "Integraste algoritmos, contratos, transformación y reportes en dos programas completos. Rinde el último mini examen para cerrar la ruta.",
      approvedCopy: "Aprobaste el nivel final. Completaste una ruta de cincuenta proyectos desde tu primera instrucción hasta programas modulares y verificables.",
      projects: [
        project({
          id: 49,
          title: "Construye una recomendación explicable",
          shortTitle: "Motor de recomendación",
          duration: "32 min",
          difficulty: "Proyecto",
          file: "proyecto_49.py",
          prerequisites: "Integra funciones, listas de diccionarios, condiciones, sorted(), lambda y f-strings.",
          summary: "Un recomendador sencillo debe separar criterios, puntuar cada opción y explicar el resultado. Así puedes revisar por qué una alternativa quedó primero.",
          example: 'def puntaje(curso, objetivo, tiempo):\n    puntos = 0\n    if curso["objetivo"] == objetivo:\n        puntos += 2\n    if curso["horas"] <= tiempo:\n        puntos += 1\n    return puntos\n\ndef recomendar(cursos, objetivo, tiempo):\n    return sorted(cursos, key=lambda curso: puntaje(curso, objetivo, tiempo), reverse=True)\n\nopciones = [{"nombre": "Python", "objetivo": "datos", "horas": 8}, {"nombre": "SQL", "objetivo": "datos", "horas": 5}]\nprint([curso["nombre"] for curso in recomendar(opciones, "datos", 6)])',
          explanation: "puntaje concentra reglas observables y recomendar solo ordena según esa medida. Mantenerlas separadas permite cambiar un criterio y volver a ejecutar los mismos casos.",
          concepts: ["Traducir criterios en puntaje", "Ordenar sin ocultar reglas", "Explicar una recomendación"],
          goal: "Puntúa Python (datos, 8 h), HTML (web, 6 h) y SQL (datos, 5 h): +2 si coincide objetivo datos y +1 si cabe en 6 horas. Ordena y muestra 1. SQL · 3 puntos, 2. Python · 2 puntos, 3. HTML · 1 puntos. Muestra Recomendación: SQL.",
          starter: 'cursos = [\n    {"nombre": "Python", "objetivo": "datos", "horas": 8},\n    {"nombre": "HTML", "objetivo": "web", "horas": 6},\n    {"nombre": "SQL", "objetivo": "datos", "horas": 5}\n]\n\ndef puntaje(curso, objetivo, tiempo):\n    return 0\n\nordenados = cursos\nfor curso in ordenados:\n    print(curso["nombre"])',
          hints: [
            "En puntaje comienza en cero y suma por coincidencia de objetivo y por tiempo suficiente.",
            "Ordena cursos con sorted(), key=lambda curso: puntaje(curso, \"datos\", 6), reverse=True.",
            "Usa enumerate(..., 1) para mostrar posición, nombre y puntos; después usa ordenados[0]."
          ],
          checks: ["Defines puntaje() con dos criterios y ordenas por él", "Muestras SQL, Python y HTML con 3, 2 y 1 puntos", "La recomendación final es SQL"],
          success: "Construiste una recomendación cuyas reglas pueden explicarse. El proyecto 50 cerrará la ruta con un pipeline y un reporte de calidad.",
          walkthrough: ["El curso de datos obtiene dos puntos por objetivo.", "Si además cabe en el tiempo, suma un tercer punto.", "sorted coloca primero el mayor puntaje y conserva el orden original cuando hay empate."],
          prediction: "¿Qué curso queda primero si el tiempo disponible aumenta a 10 horas?",
          answer: "Python y SQL empatan con 3; Python queda primero porque aparece antes y el ordenamiento es estable.",
          reflection: "Cambia el objetivo a web y predice los tres puntajes antes de ejecutar.",
          extension: "Agrega una tercera regla para favorecer cursos de nivel inicial y explica su peso.",
          feedback: ["puntaje debe sumar 2 por objetivo y 1 por tiempo; no escribas un resultado fijo.", "Ordena con la función de puntaje y muestra exactamente SQL 3, Python 2 y HTML 1 en posiciones 1–3.", "Toma el nombre de ordenados[0] para mostrar Recomendación: SQL."],
          validate(result, source) {
            return [
              uses(source, /def\s+puntaje\s*\(/) && uses(source, /sorted\s*\(/) && uses(source, /reverse\s*=\s*True/),
              ["1. SQL · 3 puntos", "2. Python · 2 puntos", "3. HTML · 1 puntos"].every((line, index) => result.output[index]?.trim() === line),
              hasLine(result, "Recomendación: SQL")
            ];
          }
        }),
        project({
          id: 50,
          title: "Proyecto final: informe de aprendizaje",
          shortTitle: "Proyecto 50",
          duration: "40 min",
          difficulty: "Proyecto final",
          file: "proyecto_50.py",
          prerequisites: "Integra normalización, validación, agrupación, métricas, ordenamiento, funciones y presentación.",
          summary: "Cerrarás la ruta con un programa que recibe registros imperfectos, aplica un contrato, agrupa datos válidos y produce un informe reproducible con detalle y resumen.",
          example: 'def limpiar(fila):\n    return {"area": fila["area"].strip().title(), "horas": fila["horas"]}\n\ndef es_valida(fila):\n    return fila["area"] != "" and fila["horas"] > 0\n\ndef resumir(filas):\n    grupos = {}\n    for fila in filas:\n        grupos.setdefault(fila["area"], []).append(fila["horas"])\n    return grupos\n\nfilas = [limpiar({"area": " python ", "horas": 3})]\nprint(resumir([fila for fila in filas if es_valida(fila)]))',
          explanation: "El programa conserva etapas con responsabilidades distintas: limpiar forma, validar contrato, resumir grupos y presentar resultados. El total de rechazados permite auditar lo que quedó fuera.",
          concepts: ["Diseñar un flujo de extremo a extremo", "Agrupar y calcular métricas", "Hacer visible la calidad de entrada"],
          goal: "Procesa cinco registros: Python 3, python 5, Web 4, área vacía 2 y Datos 0. Normaliza áreas, rechaza los dos inválidos y agrupa. Muestra Python: 2 registros · 8 horas, Web: 1 registros · 4 horas, Válidos: 3, Rechazados: 2 y Horas totales: 12.",
          starter: 'registros = [\n    {"area": " Python ", "horas": 3},\n    {"area": "python", "horas": 5},\n    {"area": "Web", "horas": 4},\n    {"area": " ", "horas": 2},\n    {"area": "Datos", "horas": 0}\n]\n\ndef procesar(filas):\n    return filas\n\nresultado = procesar(registros)\nprint(resultado)',
          hints: [
            "Separa limpiar(fila), es_valida(fila), resumir(filas) y procesar(filas).",
            "Normaliza area con strip().title(), filtra horas > 0 y agrupa con setdefault(area, []).append(horas).",
            "Ordena las áreas al mostrar, suma cada lista y calcula válidos, rechazados y horas totales desde los datos."
          ],
          checks: ["Organizas el programa en al menos cuatro funciones", "Agrupas Python y Web con sus cantidades y horas", "Calculas 3 válidos, 2 rechazados y 12 horas"],
          success: "Completaste cincuenta proyectos de Python. Construiste desde mensajes y decisiones hasta algoritmos, contratos, pipelines y un informe modular verificable.",
          walkthrough: ["limpiar unifica Python y python bajo la misma área.", "es_valida rechaza el área vacía y las horas iguales a cero.", "resumir agrupa tres registros válidos y permite calcular doce horas en total."],
          prediction: "¿Qué cambia si agregas otro registro Web con 2 horas?",
          answer: "Web pasa a 2 registros y 6 horas; Válidos sube a 4, Rechazados sigue en 2 y Horas totales sube a 14.",
          reflection: "Agrega temporalmente ese registro y comprueba cada parte de la predicción.",
          extension: "Incluye el promedio de horas por área con dos decimales y un caso seguro para una lista vacía.",
          feedback: ["Crea funciones separadas para limpiar, validar, resumir y coordinar; evita resolver todo con resultados escritos a mano.", "Normaliza antes de agrupar y usa setdefault. La salida de detalle debe ser Python 2/8 y Web 1/4.", "Deriva los resúmenes de las colecciones: Válidos 3, Rechazados 2 y Horas totales 12."],
          validate(result, source) {
            return [
              (clean(source).match(/def\s+[a-zA-Z_]\w*\s*\(/g) || []).length >= 4 && uses(source, /setdefault\s*\(/),
              hasLine(result, "Python: 2 registros · 8 horas") && hasLine(result, "Web: 1 registros · 4 horas"),
              hasLine(result, "Válidos: 3") && hasLine(result, "Rechazados: 2") && hasLine(result, "Horas totales: 12")
            ];
          }
        })
      ]
    }
  ];

  const exams = [
    {
      levelId: 11, title: "Mini examen de algoritmos sobre colecciones", passing: 4,
      intro: "Repasa pilas, búsqueda binaria, ventanas y mezcla. Necesitas cuatro aciertos de cinco.",
      questions: [
        { question: "¿Qué elemento retira list.pop() sin índice?", options: ["El primero", "El último", "El menor", "Uno aleatorio"], answer: 1, explanation: "pop() usa el último índice y permite modelar una pila LIFO junto con append()." },
        { question: "¿Qué condición necesita la búsqueda binaria?", options: ["Datos ordenados", "Datos sin repetir", "Solo textos", "Una lista impar"], answer: 0, explanation: "Solo con orden puedes decidir qué mitad ya no contiene el objetivo." },
        { question: "¿Cuántas ventanas de tamaño 3 hay en 5 valores?", options: ["2", "3", "4", "5"], answer: 1, explanation: "La cantidad es 5 - 3 + 1: comienzan en las posiciones 0, 1 y 2." },
        { question: "Al mezclar listas ordenadas, ¿qué índice avanza?", options: ["Ambos siempre", "El del elemento que se agregó", "Ninguno", "El de la lista más larga"], answer: 1, explanation: "Solo se consume el candidato elegido; el otro debe compararse nuevamente." },
        { question: "¿Qué representa devolver -1 en buscar()?", options: ["El primer índice", "Que el objetivo no se encontró", "Una lista vacía", "La última posición"], answer: 1, explanation: "-1 es un resultado explícito fuera de los índices válidos de la lista." }
      ]
    },
    {
      levelId: 12, title: "Mini examen de calidad y mantenibilidad", passing: 4,
      intro: "Repasa configuración, contratos, regresiones y pipelines. Necesitas cuatro aciertos de cinco.",
      questions: [
        { question: "¿Por qué separar alias en un diccionario?", options: ["Para evitar funciones", "Para cambiar equivalencias sin reescribir el algoritmo", "Para ordenar automáticamente", "Para eliminar get()"], answer: 1, explanation: "La configuración cambia de forma independiente a la lógica que la consulta." },
        { question: "¿Por qué una validación puede devolver una lista de errores?", options: ["Para informar todas las reglas incumplidas", "Para modificar el registro", "Para reemplazar excepciones siempre", "Para ordenar datos"], answer: 0, explanation: "La lista aporta motivos accionables y puede contener más de un problema." },
        { question: "¿Qué caso detecta un error entre > 200 y >= 200?", options: ["Entrada 0", "Entrada 199", "Entrada 200", "Entrada 300"], answer: 2, explanation: "El valor exacto del borde distingue si el límite está incluido." },
        { question: "¿Qué etapa debería ejecutarse antes de transformar?", options: ["Presentar", "Validar", "Imprimir", "Ordenar siempre"], answer: 1, explanation: "Validar evita transformar registros que no cumplen el contrato." },
        { question: "¿Qué ventaja tiene una variable intermedia por etapa?", options: ["Permite inspeccionar y probar cada resultado", "Hace innecesarias las reglas", "Reduce siempre a una línea", "Convierte listas en archivos"], answer: 0, explanation: "Los estados intermedios hacen observable dónde cambia o se descarta un dato." }
      ]
    },
    {
      levelId: 13, title: "Mini examen del proyecto profesional integrado", passing: 4,
      intro: "Comprueba recomendación explicable, calidad de datos e informes. Necesitas cuatro aciertos de cinco.",
      questions: [
        { question: "¿Qué hace explicable una recomendación basada en puntaje?", options: ["Ocultar los pesos", "Separar y mostrar los criterios que suman puntos", "Usar el curso más largo", "Evitar funciones"], answer: 1, explanation: "Los criterios explícitos permiten reconstruir por qué una opción quedó antes que otra." },
        { question: "¿Por qué normalizar antes de agrupar?", options: ["Para reunir variantes equivalentes", "Para borrar horas", "Para ordenar los registros", "Para crear archivos"], answer: 0, explanation: "Sin normalización, Python y python formarían grupos distintos." },
        { question: "¿Qué aporta contar registros rechazados?", options: ["Un indicador de calidad de entrada", "Un promedio", "Una nueva ruta", "Un valor aleatorio"], answer: 0, explanation: "Hace visible cuánto material no pasó el contrato y evita perderlo silenciosamente." },
        { question: "¿Dónde conviene calcular el total general?", options: ["Escrito como constante", "Derivado de los datos válidos", "Dentro del texto del título", "Antes de limpiar"], answer: 1, explanation: "Un resumen reproducible debe cambiar automáticamente cuando cambian las entradas válidas." },
        { question: "¿Qué demuestra el proyecto 50?", options: ["Que más líneas significan mejor código", "Que etapas pequeñas pueden formar un proceso completo y verificable", "Que no se necesitan pruebas", "Que todo debe vivir en una función"], answer: 1, explanation: "La integración conserva responsabilidades separadas y resultados observables de extremo a extremo." }
      ]
    }
  ];

  globalThis.PythonMasteryCourse = Object.freeze({ levels, exams });
})();
