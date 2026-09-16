/* Niveles 6–10 de Python. Se mantienen separados del controlador para que el
   contenido avanzado pueda crecer sin volver más difícil revisar la interfaz. */
(() => {
  "use strict";

  const uses = (source, pattern) => pattern.test(source);
  const hasLine = (result, expected) => result.output.some(line => line.trim() === String(expected));
  const hasText = (result, pattern) => result.output.some(line => pattern.test(line));
  const sameList = (value, expected) => Array.isArray(value)
    && value.length === expected.length
    && value.every((item, index) => JSON.stringify(item) === JSON.stringify(expected[index]));

  const levels = [
    {
      id: 6,
      title: "Control y recorridos",
      description: "Mientras, índices, recorridos paralelos y conjuntos",
      stage: "Control y recorridos",
      completionTitle: "Finalizaste el control y los recorridos de Python.",
      completionCopy: "Ya controlas repeticiones con while, numeras elementos, coordinas colecciones y comparas conjuntos. Realiza el mini examen para consolidar este nuevo bloque.",
      approvedCopy: "Aprobaste el nivel de control y recorridos. Ya puedes construir transformaciones más expresivas.",
      projects: [
        {
          id: 21,
          title: "Controla una cuenta regresiva",
          shortTitle: "Ciclo while",
          duration: "18 min",
          difficulty: "Intermedio",
          file: "proyecto_21.py",
          prerequisites: "Reutiliza variables, comparaciones, print() y actualización de valores.",
          summary: "Una actividad tiene cuatro oportunidades de confirmación. Usarás while cuando la cantidad de repeticiones dependa de una condición y no de recorrer una colección.",
          example: 'restantes = 3\nwhile restantes > 0:\n    print(f"Quedan {restantes}")\n    restantes -= 1\nprint("Comienza la actividad")',
          explanation: "while vuelve a comprobar la condición antes de cada vuelta. Restar uno acerca restantes a cero; cuando la comparación deja de cumplirse, Python continúa con la instrucción que está fuera del bloque.",
          concepts: ["Repetir mientras se cumpla algo", "Actualizar la condición", "Evitar ciclos infinitos"],
          goal: "Parte con intentos = 4. Usa while para mostrar Intento 4, Intento 3, Intento 2 e Intento 1. Reduce intentos en cada vuelta y, al terminar, muestra Sin intentos.",
          starter: 'intentos = 4\nwhile intentos > 2:\n    print(f"Intento {intentos}")\n    intentos -= 1\n\nprint("Proceso incompleto")',
          hints: [
            "Mira la condición: el ciclo debe continuar también cuando queden 2 y 1 intentos.",
            "Mientras intentos sea mayor que cero, muestra el valor y réstale uno dentro del bloque.",
            'Usa while intentos > 0: y conserva intentos -= 1 con sangría. Fuera del ciclo escribe print("Sin intentos").'
          ],
          checks: ["Usas while y actualizas intentos", "Llegas desde Intento 4 hasta Intento 1", "Terminas con intentos en 0 y el mensaje final"],
          success: "Controlaste un ciclo mediante su estado. Ahora añadirás posición y contenido al recorrer una lista.",
          lesson: {
            walkthrough: ["restantes comienza en 3 y cumple restantes > 0.", "Cada vuelta muestra el valor actual y lo reduce en uno.", "Después de mostrar 1, el valor queda en 0; la condición falla y aparece el mensaje final."],
            prediction: "¿Qué ocurriría si olvidaras restantes -= 1?",
            answer: "La condición seguiría siendo verdadera y el ciclo no terminaría. El laboratorio lo detendría por exceder su límite de operaciones.",
            reflection: "Cambia temporalmente el inicio a 1 y predice cuántas líneas aparecerán. Después restaura 4.",
            extension: "Después de completar, añade un aviso especial cuando intentos sea igual a 2.",
            feedback: ["Usa un encabezado while y cambia intentos dentro del bloque; de lo contrario, la condición no avanza.", "La salida debe incluir cuatro líneas, desde Intento 4 hasta Intento 1. Revisa que la condición permita llegar a 1.", "Al salir del ciclo, intentos debe valer 0 y debes mostrar exactamente Sin intentos."]
          },
          validate(result, source) {
            const attempts = result.output.filter(line => /^Intento [1-4]$/.test(line.trim()));
            return [
              uses(source, /\bwhile\b/) && uses(source, /intentos\s*(?:-=\s*1|=\s*intentos\s*-\s*1)/),
              attempts.length === 4 && ["Intento 4", "Intento 3", "Intento 2", "Intento 1"].every((line, index) => attempts[index]?.trim() === line),
              result.environment.intentos === 0 && hasLine(result, "Sin intentos")
            ];
          }
        },
        {
          id: 22,
          title: "Numera los pasos del plan",
          shortTitle: "Índices con enumerate",
          duration: "18 min",
          difficulty: "Intermedio",
          file: "proyecto_22.py",
          prerequisites: "Reutiliza listas, ciclos for y f-strings.",
          summary: "Una lista ordenada se entiende mejor cuando cada paso lleva su posición. enumerate() entrega el índice y el elemento sin mantener un contador manual.",
          example: 'etapas = ["Elegir fecha", "Reservar", "Confirmar"]\nfor numero, etapa in enumerate(etapas, 1):\n    print(f"{numero}. {etapa}")',
          explanation: "enumerate(etapas, 1) produce pares: 1 con el primer texto, 2 con el segundo y 3 con el tercero. El for desempaqueta cada par en numero y etapa.",
          concepts: ["Obtener posición y valor", "Comenzar a contar en 1", "Desempaquetar dos datos"],
          goal: "Recorre los tres pasos con enumerate(pasos, 1) y muestra exactamente 1. Elegir lugar, 2. Confirmar hora y 3. Preparar mochila.",
          starter: 'pasos = ["Elegir lugar", "Confirmar hora", "Preparar mochila"]\nfor paso in pasos:\n    print(paso)',
          hints: [
            "Necesitas dos datos por vuelta: la posición y el texto del paso.",
            "enumerate(pasos, 1) crea pares que el for puede repartir en numero y paso.",
            'Escribe for numero, paso in enumerate(pasos, 1): y dentro print(f"{numero}. {paso}").'
          ],
          checks: ["Usas enumerate() comenzando en 1", "Muestras los tres pasos", "Cada línea conserva su número y texto"],
          success: "Numeraste una colección sin administrar el contador. A continuación recorrerás dos listas al mismo tiempo.",
          lesson: {
            walkthrough: ["enumerate recibe la lista y el número inicial 1.", "En cada vuelta entrega un par formado por posición y texto.", "La f-string reúne ambos valores sin modificar la lista original."],
            prediction: "Si quitas el segundo argumento de enumerate(), ¿qué número tendrá el primer paso?",
            answer: "Tendrá 0, porque enumerate() empieza en cero cuando no se indica otro valor.",
            reflection: "Agrega temporalmente una cuarta etapa y predice su número. Después restaura los tres pasos.",
            extension: "Muestra también cuántos pasos quedan usando len(pasos) - numero.",
            feedback: ["Usa enumerate(pasos, 1), no un contador escrito a mano. El 1 indica dónde comienza la numeración.", "El ciclo debe recorrer los tres elementos de pasos; no selecciones posiciones individuales.", "Cada línea necesita el formato número, punto, espacio y texto. Revisa la f-string."]
          },
          validate(result, source) {
            const expected = ["1. Elegir lugar", "2. Confirmar hora", "3. Preparar mochila"];
            return [
              uses(source, /enumerate\s*\(\s*pasos\s*,\s*1\s*\)/),
              expected.every(line => hasLine(result, line)) && result.output.length === 3,
              expected.every((line, index) => result.output[index]?.trim() === line)
            ];
          }
        },
        {
          id: 23,
          title: "Combina personas y preferencias",
          shortTitle: "Recorridos con zip",
          duration: "20 min",
          difficulty: "Intermedio",
          file: "proyecto_23.py",
          prerequisites: "Reutiliza listas, ciclos y desempaquetado de variables.",
          summary: "Los nombres y sus preferencias llegaron en listas separadas pero en el mismo orden. zip() permite recorrer las parejas correspondientes sin buscar posiciones manualmente.",
          example: 'personas = ["Ana", "Luis"]\nopciones = ["parque", "museo"]\nfor persona, opcion in zip(personas, opciones):\n    print(f"{persona}: {opcion}")',
          explanation: "zip() forma una pareja con el primer elemento de cada lista, después con los segundos y así sucesivamente. El ciclo recibe cada pareja ya separada en dos variables.",
          concepts: ["Coordinar colecciones", "Formar parejas con zip()", "Detenerse en la lista más corta"],
          goal: "Combina personas y opciones con zip(). Muestra Ana: parque, Luis: museo y Zoe: café, una pareja por línea y en ese orden.",
          starter: 'personas = ["Ana", "Luis", "Zoe"]\nopciones = ["parque", "museo", "café"]\nprint(len(personas))',
          hints: [
            "Ambas listas tienen tres elementos alineados por posición. No necesitas usar índices.",
            "zip(personas, opciones) entrega cada nombre junto a su preferencia.",
            'Usa for persona, opcion in zip(personas, opciones): y muestra print(f"{persona}: {opcion}").'
          ],
          checks: ["Usas zip() con las dos listas", "Muestras las tres parejas", "Conservas la correspondencia y el orden"],
          success: "Coordinaste dos fuentes de datos por posición. El cierre del nivel comparará grupos sin duplicados.",
          lesson: {
            walkthrough: ["zip toma Ana de personas y parque de opciones.", "El for guarda esos valores en persona y opcion.", "La segunda vuelta repite el proceso con Luis y museo."],
            prediction: "¿Cuántas vueltas habrá si personas tiene tres elementos y opciones solo dos?",
            answer: "Habrá dos. zip() se detiene cuando se termina la colección más corta.",
            reflection: "Quita temporalmente café de opciones y observa qué persona queda sin pareja. Después restaura ambas listas.",
            extension: "Después de completar, crea una lista parejas = list(zip(personas, opciones)) y muéstrala.",
            feedback: ["Recorre zip(personas, opciones). Pasar solo una lista no forma las parejas requeridas.", "Deben aparecer tres líneas, una por cada pareja disponible.", "Revisa que Ana conserve parque, Luis museo y Zoe café, en el orden original."]
          },
          validate(result, source) {
            const expected = ["Ana: parque", "Luis: museo", "Zoe: café"];
            return [
              uses(source, /zip\s*\(\s*personas\s*,\s*opciones\s*\)/),
              result.output.length === 3 && expected.every(line => hasLine(result, line)),
              expected.every((line, index) => result.output[index]?.trim() === line)
            ];
          }
        },
        {
          id: 24,
          title: "Compara grupos sin duplicados",
          shortTitle: "Conjuntos",
          duration: "22 min",
          difficulty: "Intermedio",
          file: "proyecto_24.py",
          prerequisites: "Reutiliza listas, funciones incorporadas y pertenencia con in.",
          summary: "Una lista puede repetir nombres, pero para calcular invitaciones importa cada persona una sola vez. Los conjuntos eliminan duplicados y permiten comparar grupos.",
          example: 'invitados = set(["Ana", "Luis", "Ana"])\nconfirmados = set(["Ana"])\npendientes = invitados.difference(confirmados)\nprint(len(invitados))\nprint(sorted(pendientes))',
          explanation: "set() conserva valores únicos. difference() produce los elementos que están en invitados y no aparecen en confirmados; sorted() les da un orden estable para mostrarlos.",
          concepts: ["Eliminar duplicados", "Calcular una diferencia", "Ordenar antes de mostrar"],
          goal: "Crea invitados únicos desde Ana, Luis, Ana y Zoe. Compara con Ana y Zoe confirmados. Muestra Total únicos: 3 y Pendientes: ['Luis'].",
          starter: 'invitados = ["Ana", "Luis", "Ana", "Zoe"]\nconfirmados = ["Ana", "Zoe"]\nprint(invitados)',
          hints: [
            "Primero convierte cada lista a set para que Ana no se cuente dos veces.",
            "difference() responde qué elementos del primer conjunto no están en el segundo.",
            'Usa pendientes = invitados.difference(confirmados), len(invitados) y sorted(pendientes) dentro de los dos mensajes pedidos.'
          ],
          checks: ["Construyes conjuntos y una diferencia", "Calculas 3 personas únicas", "Muestras únicamente a Luis como pendiente"],
          success: "Comparaste grupos sin duplicados. El siguiente nivel transformará colecciones completas con expresiones compactas.",
          lesson: {
            walkthrough: ["set elimina la segunda aparición de Ana y deja dos invitados únicos en el ejemplo.", "difference descarta a Ana porque ya está confirmada.", "sorted convierte el conjunto pendiente en una lista estable: ['Luis']."],
            prediction: "Si confirmados incluye un nombre que no está en invitados, ¿aparecerá en pendientes?",
            answer: "No. La diferencia solo devuelve elementos del conjunto invitados que faltan en confirmados.",
            reflection: "Agrega temporalmente a Luis entre los confirmados. Predice el tamaño de pendientes y restaura los datos.",
            extension: "Calcula también invitados.intersection(confirmados) para mostrar quiénes sí confirmaron.",
            feedback: ["Convierte ambas colecciones con set() y usa difference() para comparar, en lugar de contar la lista con duplicados.", "len(invitados) debe calcular 3 después de eliminar el Ana repetido. Muestra ese valor junto a Total únicos.", "Ordena pendientes antes de mostrarlo. El único nombre que debe quedar es Luis."]
          },
          validate(result, source) {
            return [
              uses(source, /\bset\s*\(/) && uses(source, /\.difference\s*\(/),
              hasText(result, /Total únicos:\s*3/i),
              hasText(result, /Pendientes:\s*\['Luis'\]/)
            ];
          }
        }
      ]
    },
    {
      id: 7,
      title: "Transformaciones expresivas",
      description: "Comprensiones, funciones breves y decisiones sobre colecciones",
      stage: "Transformaciones expresivas",
      completionTitle: "Finalizaste las transformaciones expresivas de Python.",
      completionCopy: "Construiste listas y diccionarios derivados, ordenaste estructuras con una función y resumiste condiciones con any() y all(). Repasa estas decisiones en el mini examen.",
      approvedCopy: "Aprobaste el nivel de transformaciones expresivas. Estás listo para diseñar funciones más robustas.",
      projects: [
        {
          id: 25,
          title: "Calcula precios transformados",
          shortTitle: "Comprensión de transformación",
          duration: "20 min",
          difficulty: "Intermedio",
          file: "proyecto_25.py",
          prerequisites: "Reutiliza listas, operaciones numéricas y comprensiones.",
          summary: "Necesitas aplicar el mismo cálculo a todos los precios sin modificar la lista original. Una comprensión puede transformar cada elemento y construir un resultado nuevo.",
          example: 'precios = [100, 200, 300]\ncon_impuesto = [int(precio * 1.1) for precio in precios]\nprint(con_impuesto)\nprint(sum(con_impuesto))',
          explanation: "La expresión int(precio * 1.1) se evalúa una vez por cada elemento. El resultado de cada vuelta entra en una lista nueva; sum() resume esa transformación.",
          concepts: ["Transformar cada elemento", "Conservar los datos originales", "Encadenar transformación y resumen"],
          goal: "Desde precios = [1000, 2000, 3000], crea con_impuesto con una comprensión que aplique 19 %. Muestra [1190, 2380, 3570] y Total: 7140.",
          starter: 'precios = [1000, 2000, 3000]\ncon_impuesto = precios\nprint(con_impuesto)',
          hints: [
            "La lista nueva necesita calcular un valor por cada precio de la lista original.",
            "Usa una comprensión con int(precio * 1.19) antes de for precio in precios.",
            'Escribe con_impuesto = [int(precio * 1.19) for precio in precios] y muestra la lista y f"Total: {sum(con_impuesto)}".'
          ],
          checks: ["Creas con_impuesto mediante una comprensión", "Obtienes los tres precios transformados", "Calculas el total 7140"],
          success: "Transformaste todos los elementos con una sola regla. Ahora construirás un diccionario calculado desde una lista.",
          lesson: {
            walkthrough: ["La comprensión toma 100, 200 y 300 por separado.", "Multiplica cada valor por 1.1 y convierte el resultado a entero.", "La lista queda [110, 220, 330] y su suma es 660."],
            prediction: "¿Cambia la lista precios cuando se crea con_impuesto?",
            answer: "No. La comprensión construye otra lista y precios conserva sus valores originales.",
            reflection: "Prueba temporalmente una tasa de 10 % y predice la lista. Después vuelve a 19 %.",
            extension: "Muestra también la diferencia entre sum(con_impuesto) y sum(precios).",
            feedback: ["Crea una lista nueva con una comprensión; asignar precios directamente reutiliza la misma colección sin transformar.", "Aplica 1.19 a cada precio y convierte a entero. La lista esperada tiene 1190, 2380 y 3570.", "Usa sum(con_impuesto) para calcular el total real y muéstralo junto a Total:."]
          },
          validate(result, source) {
            return [
              uses(source, /con_impuesto\s*=\s*\[[^\]]*\bfor\b[^\]]*\]/),
              sameList(result.environment.con_impuesto, [1190, 2380, 3570]),
              hasLine(result, "Total: 7140")
            ];
          }
        },
        {
          id: 26,
          title: "Construye un índice de longitudes",
          shortTitle: "Comprensión de diccionario",
          duration: "20 min",
          difficulty: "Intermedio",
          file: "proyecto_26.py",
          prerequisites: "Reutiliza diccionarios, len() y comprensiones.",
          summary: "Para preparar etiquetas necesitas relacionar cada nombre con su cantidad de caracteres. Una comprensión de diccionario calcula cada par de clave y valor.",
          example: 'rutas = ["web", "datos"]\nlongitudes = {ruta: len(ruta) for ruta in rutas}\nprint(longitudes)',
          explanation: "Antes de los dos puntos se define la clave; después se calcula el valor. El for recorre la colección de origen y agrega un par nuevo por cada elemento.",
          concepts: ["Crear claves y valores", "Comprensión de diccionario", "Derivar un índice"],
          goal: "Desde nombres = ['Python', 'SQL', 'React'], crea longitudes mediante una comprensión. Muestra Python: 6, SQL: 3 y React: 5, una línea por nombre.",
          starter: 'nombres = ["Python", "SQL", "React"]\nlongitudes = {}\nprint(longitudes)',
          hints: [
            "Cada nombre debe convertirse en una clave y su len() en el valor.",
            "Dentro de llaves, escribe nombre: len(nombre) y después el recorrido.",
            'Usa longitudes = {nombre: len(nombre) for nombre in nombres}; recorre nombres para mostrar f"{nombre}: {longitudes[nombre]}".'
          ],
          checks: ["Usas una comprensión de diccionario", "longitudes contiene los tres cálculos", "Muestras 6, 3 y 5 con su nombre"],
          success: "Creaste un índice calculado a partir de otra colección. El siguiente proyecto ordenará registros según una regla propia.",
          lesson: {
            walkthrough: ["La primera vuelta usa web como clave.", "len('web') produce 3 y se guarda como su valor.", "La segunda vuelta agrega datos con el valor 5."],
            prediction: "¿Qué ocurre si nombres contiene el mismo texto dos veces?",
            answer: "El diccionario conserva una sola clave para ese texto; el segundo cálculo reemplaza el mismo valor.",
            reflection: "Agrega temporalmente Vue y predice su longitud. Después restaura la lista.",
            extension: "Crea otro diccionario que relacione cada nombre con su versión en minúsculas.",
            feedback: ["Construye longitudes con llaves y una expresión for. Un diccionario vacío no calcula los pares.", "Las claves deben ser Python, SQL y React, con valores 6, 3 y 5 obtenidos mediante len().", "Muestra cada nombre junto al valor guardado en longitudes; evita escribir las cantidades manualmente."]
          },
          validate(result, source) {
            const expected = { Python: 6, SQL: 3, React: 5 };
            return [
              uses(source, /longitudes\s*=\s*\{[^}]*\bfor\b[^}]*\}/),
              JSON.stringify(result.environment.longitudes) === JSON.stringify(expected),
              ["Python: 6", "SQL: 3", "React: 5"].every(line => hasLine(result, line))
            ];
          }
        },
        {
          id: 27,
          title: "Ordena un ranking por puntaje",
          shortTitle: "sorted() y lambda",
          duration: "22 min",
          difficulty: "Intermedio",
          file: "proyecto_27.py",
          prerequisites: "Reutiliza listas de diccionarios, funciones y acceso por clave.",
          summary: "Los registros necesitan un orden distinto del alfabético. sorted() puede recibir una función breve que indique qué dato de cada registro debe comparar.",
          example: 'equipos = [{"nombre": "Sol", "puntos": 8}, {"nombre": "Luna", "puntos": 12}]\nranking = sorted(equipos, key=lambda equipo: equipo["puntos"], reverse=True)\nfor equipo in ranking:\n    print(equipo["nombre"], equipo["puntos"])',
          explanation: "lambda recibe un registro y devuelve su puntaje. sorted() usa ese resultado como clave de comparación; reverse=True coloca primero el valor mayor.",
          concepts: ["Definir una clave de orden", "Usar lambda", "Ordenar de mayor a menor"],
          goal: "Ordena a Sol 72, Luna 95 y Río 81 por puntaje descendente. Guarda el resultado en ranking y muestra Luna 95, Río 81 y Sol 72, en ese orden.",
          starter: 'equipos = [\n    {"nombre": "Sol", "puntos": 72},\n    {"nombre": "Luna", "puntos": 95},\n    {"nombre": "Río", "puntos": 81}\n]\nranking = equipos\nfor equipo in ranking:\n    print(equipo["nombre"], equipo["puntos"])',
          hints: [
            "La lista original está ordenada por llegada, no por puntaje. Necesitas producir otra lista.",
            "sorted() acepta key=lambda equipo: equipo['puntos'] y reverse=True.",
            'Asigna ranking = sorted(equipos, key=lambda equipo: equipo["puntos"], reverse=True) y conserva el ciclo de impresión.'
          ],
          checks: ["Usas sorted() con lambda y reverse=True", "ranking comienza con Luna y termina con Sol", "Muestras las tres líneas en orden descendente"],
          success: "Separaste la regla de ordenamiento de los datos. Ahora resumirás condiciones de toda una colección.",
          lesson: {
            walkthrough: ["lambda extrae puntos de cada diccionario.", "sorted compara 8 y 12 mediante esos resultados.", "reverse=True coloca primero a Luna con 12."],
            prediction: "¿Se modifica la lista equipos al crear ranking con sorted()?",
            answer: "No. sorted() devuelve una lista nueva; equipos conserva su orden original.",
            reflection: "Quita temporalmente reverse=True y predice quién aparecerá primero. Después restáuralo.",
            extension: "Usa enumerate(ranking, 1) para añadir la posición a cada línea.",
            feedback: ["Crea ranking con sorted(), una clave lambda que lea puntos y reverse=True.", "Revisa el contenido de ranking: Luna debe estar primero, Río al centro y Sol al final.", "Recorre ranking, no equipos, para que la salida conserve el orden descendente calculado."]
          },
          validate(result, source) {
            const names = Array.isArray(result.environment.ranking) ? result.environment.ranking.map(item => item.nombre) : [];
            return [
              uses(source, /sorted\s*\(/) && uses(source, /key\s*=\s*lambda/) && uses(source, /reverse\s*=\s*True/),
              sameList(names, ["Luna", "Río", "Sol"]),
              ["Luna 95", "Río 81", "Sol 72"].every((line, index) => result.output[index]?.trim() === line)
            ];
          }
        },
        {
          id: 28,
          title: "Resume reglas con any y all",
          shortTitle: "Condiciones colectivas",
          duration: "20 min",
          difficulty: "Intermedio",
          file: "proyecto_28.py",
          prerequisites: "Reutiliza comparaciones, comprensiones y valores booleanos.",
          summary: "Antes de aceptar un horario necesitas comprobar dos reglas: que todas las duraciones sean positivas y que exista al menos una sesión larga. all() y any() responden esas preguntas.",
          example: 'duraciones = [30, 45, 20]\npositivas = all([minutos > 0 for minutos in duraciones])\nhay_larga = any([minutos >= 45 for minutos in duraciones])\nprint(positivas, hay_larga)',
          explanation: "all() solo devuelve True si todas las condiciones son verdaderas. any() devuelve True cuando encuentra al menos una. Las comprensiones producen las comparaciones que ambas funciones resumen.",
          concepts: ["Comprobar todos los elementos", "Detectar al menos uno", "Resumir booleanos"],
          goal: "Con duraciones = [45, 60, 30], calcula todos_validos con all() para valores mayores que cero y hay_sesion_larga con any() para valores mayores que 45. Muestra ambos como True.",
          starter: 'duraciones = [45, 60, 30]\ntodos_validos = False\nhay_sesion_larga = False\nprint(f"Todos válidos: {todos_validos}")\nprint(f"Hay sesión larga: {hay_sesion_larga}")',
          hints: [
            "Formula primero una comparación por cada duración y observa la lista de True y False.",
            "all() resume la condición > 0; any() resume la condición > 45.",
            'Usa all([minutos > 0 for minutos in duraciones]) y any([minutos > 45 for minutos in duraciones]).'
          ],
          checks: ["Usas all() y any()", "todos_validos es True", "hay_sesion_larga es True y muestras ambas respuestas"],
          success: "Resumiste reglas sobre una colección completa. En el próximo nivel construirás funciones que también expliquen y controlen sus errores.",
          lesson: {
            walkthrough: ["Las tres duraciones son mayores que cero, así que all devuelve True.", "Solo 45 cumple >= 45 en el ejemplo, y eso basta para any.", "Las dos respuestas se pueden usar después en una decisión mayor."],
            prediction: "Si una duración vale 0, ¿qué devuelve all([minutos > 0 ...])?",
            answer: "Devuelve False, porque ya no se cumple que todos los valores sean mayores que cero.",
            reflection: "Cambia temporalmente 60 por 40 y predice hay_sesion_larga. Después restaura 60.",
            extension: "Añade una variable listo = todos_validos and hay_sesion_larga y muestra la decisión final.",
            feedback: ["Calcula las condiciones desde duraciones usando all() y any(); no asignes los booleanos manualmente.", "todos_validos debe usar minutos > 0 para los tres elementos y quedar en True.", "hay_sesion_larga necesita minutos > 45, y la salida debe mostrar las dos respuestas True."]
          },
          validate(result, source) {
            return [
              uses(source, /\ball\s*\(/) && uses(source, /\bany\s*\(/),
              result.environment.todos_validos === true,
              result.environment.hay_sesion_larga === true && hasText(result, /Todos válidos:\s*True/) && hasText(result, /Hay sesión larga:\s*True/)
            ];
          }
        }
      ]
    },
    {
      id: 8,
      title: "Funciones robustas",
      description: "Recursión, validación, limpieza y cierre garantizado",
      stage: "Funciones robustas",
      completionTitle: "Finalizaste las funciones robustas de Python.",
      completionCopy: "Diseñaste una función recursiva, rechazaste estados inválidos, garantizaste una acción final y compusiste transformaciones reutilizables. Comprueba estos principios en el mini examen.",
      approvedCopy: "Aprobaste el nivel de funciones robustas. Ya puedes convertir datos semiestructurados en reportes.",
      projects: [
        {
          id: 29,
          title: "Resuelve una suma recursiva",
          shortTitle: "Recursión",
          duration: "24 min",
          difficulty: "Avanzado",
          file: "proyecto_29.py",
          prerequisites: "Reutiliza funciones, return, condiciones y operaciones numéricas.",
          summary: "Una función recursiva resuelve un problema llamándose con una versión más pequeña. Practicarás el caso base que detiene el proceso y el paso que acerca cada llamada a ese caso.",
          example: 'def sumar_hasta(n):\n    if n == 0:\n        return 0\n    return n + sumar_hasta(n - 1)\n\nprint(sumar_hasta(4))',
          explanation: "El caso n == 0 devuelve 0 sin hacer otra llamada. Para cualquier otro valor, la función suma n al resultado de n - 1. Así 4 se convierte en 4 + 3 + 2 + 1 + 0.",
          concepts: ["Definir un caso base", "Reducir el problema", "Combinar resultados al volver"],
          goal: "Completa sumar_hasta(n) de forma recursiva. El caso base devuelve 0 y la llamada sumar_hasta(5) debe mostrar 15.",
          starter: 'def sumar_hasta(n):\n    return n\n\nprint(sumar_hasta(5))',
          hints: [
            "Pregunta cuál es la suma cuando n llega a cero y úsala para detener las llamadas.",
            "Para n mayor que cero, suma n con el resultado de llamar la función usando n - 1.",
            "Añade if n == 0: return 0. Después usa return n + sumar_hasta(n - 1)."
          ],
          checks: ["La función se llama a sí misma", "Incluyes un caso base para 0", "sumar_hasta(5) produce 15"],
          success: "Controlaste una cadena de llamadas con un caso base. Ahora harás que una función rechace datos imposibles de forma explícita.",
          lesson: {
            walkthrough: ["sumar_hasta(4) necesita el resultado de sumar_hasta(3).", "Las llamadas continúan hasta sumar_hasta(0), que devuelve 0.", "Al regresar, se forman 1, 3, 6 y finalmente 10."],
            prediction: "¿Qué problema aparece si quitas el caso base?",
            answer: "La función seguiría llamándose con números cada vez menores hasta superar el límite de profundidad del laboratorio.",
            reflection: "Prueba temporalmente sumar_hasta(1) y sumar_hasta(3). Predice 1 y 6 antes de ejecutar.",
            extension: "Después de completar, crea una función recursiva cuenta_atras(n) que muestre los valores hasta llegar a cero.",
            feedback: ["Dentro de sumar_hasta debe aparecer otra llamada a sumar_hasta con un problema más pequeño.", "Agrega un caso n == 0 que devuelva 0 antes de la llamada recursiva.", "Llama sumar_hasta(5) y muestra su retorno. La suma 5 + 4 + 3 + 2 + 1 es 15."]
          },
          validate(result, source) {
            const bodyCalls = (source.match(/sumar_hasta\s*\(/g) || []).length;
            return [
              uses(source, /def\s+sumar_hasta\s*\(/) && bodyCalls >= 3,
              uses(source, /if\s+n\s*==\s*0\s*:/) && uses(source, /return\s+0/),
              hasLine(result, 15)
            ];
          }
        },
        {
          id: 30,
          title: "Rechaza un cupo imposible",
          shortTitle: "Errores con raise",
          duration: "22 min",
          difficulty: "Avanzado",
          file: "proyecto_30.py",
          prerequisites: "Reutiliza funciones, if y try/except.",
          summary: "Una función no debería aceptar un cupo negativo como si fuera válido. raise permite detener esa operación con un error claro y deja que quien llama decida cómo responder.",
          example: 'def validar_cantidad(cantidad):\n    if cantidad < 0:\n        raise ValueError("Cantidad negativa")\n    return cantidad\n\ntry:\n    validar_cantidad(-1)\nexcept ValueError:\n    print("Revisa la cantidad")',
          explanation: "raise crea el ValueError cuando se rompe la regla. El try protege la llamada y except transforma el error técnico en un mensaje útil; los valores válidos siguen retornándose normalmente.",
          concepts: ["Declarar una regla inválida", "Lanzar ValueError", "Separar validación y respuesta"],
          goal: "Define validar_cupo(cupos). Si recibe un valor negativo, levanta ValueError. Captura validar_cupo(-2) para mostrar Cupo inválido y después muestra que validar_cupo(3) devuelve 3.",
          starter: 'def validar_cupo(cupos):\n    return cupos\n\nprint(validar_cupo(-2))\nprint(validar_cupo(3))',
          hints: [
            "La regla pertenece dentro de la función: comprueba si cupos es menor que cero.",
            "Usa raise ValueError(...) para interrumpir solo el caso inválido y protege esa llamada con try/except.",
            'Dentro de if cupos < 0 escribe raise ValueError("Cupo negativo"). Rodea validar_cupo(-2) con try y except ValueError que muestre Cupo inválido.'
          ],
          checks: ["Usas raise ValueError dentro de validar_cupo", "Capturas el error y muestras Cupo inválido", "El valor válido 3 se devuelve y se muestra"],
          success: "Hiciste explícito un contrato de la función. El siguiente proyecto garantizará una acción final ocurra o no un error.",
          lesson: {
            walkthrough: ["validar_cantidad(-1) entra en la condición negativa.", "raise interrumpe esa llamada y entrega un ValueError.", "except captura el error y muestra un mensaje comprensible."],
            prediction: "¿Se ejecuta return cantidad después de raise?",
            answer: "No en ese caso. raise termina inmediatamente la ejecución de la función y transfiere el control al except correspondiente.",
            reflection: "Prueba temporalmente validar_cupo(0). Debe devolver 0 porque el límite inválido es menor que cero.",
            extension: "Incluye el valor inválido dentro del mensaje del ValueError y obsérvalo temporalmente en except.",
            feedback: ["La función debe usar raise ValueError cuando cupos < 0. Devolver el número negativo no hace cumplir la regla.", "Protege la llamada con -2 mediante try/except ValueError y muestra exactamente Cupo inválido.", "Llama también validar_cupo(3) fuera del caso fallido y muestra el 3 devuelto."]
          },
          validate(result, source) {
            return [
              uses(source, /def\s+validar_cupo\s*\(/) && uses(source, /raise\s+ValueError\s*\(/),
              uses(source, /except\s+ValueError\s*:/) && hasLine(result, "Cupo inválido"),
              hasLine(result, 3)
            ];
          }
        },
        {
          id: 31,
          title: "Cierra cada revisión con finally",
          shortTitle: "Bloque finally",
          duration: "22 min",
          difficulty: "Avanzado",
          file: "proyecto_31.py",
          prerequisites: "Reutiliza funciones, conversiones, try/except y comprensiones.",
          summary: "Cada dato debe quedar marcado como revisado, incluso cuando su conversión falle. finally ejecuta una acción final tanto en el camino exitoso como en el que produjo un error.",
          example: 'def convertir(texto):\n    try:\n        return int(texto)\n    except ValueError:\n        return 0\n    finally:\n        print("Revisado:", texto)\n\nprint(convertir("8"))\nprint(convertir("error"))',
          explanation: "try intenta la conversión y except entrega cero si no es posible. Antes de devolver cualquiera de esos resultados, finally muestra qué texto terminó de revisarse.",
          concepts: ["Ejecutar un cierre garantizado", "Retornar desde try/except", "Procesar varios datos"],
          goal: "Define convertir(texto) con try, except ValueError y finally. Convierte ['12', 'hola', '30'] mediante una comprensión, muestra Revisado para cada dato y termina con Total: 42.",
          starter: 'datos = ["12", "hola", "30"]\n\ndef convertir(texto):\n    try:\n        return int(texto)\n    except ValueError:\n        return 0\n\nvalores = [convertir(dato) for dato in datos]\nprint(f"Total: {sum(valores)}")',
          hints: [
            "La conversión y el total ya funcionan. Falta una acción que ocurra para los tres datos.",
            "Añade finally al mismo nivel que except; su bloque se ejecuta antes de cada return definitivo.",
            'Después de except agrega finally: y con sangría print("Revisado:", texto). Conserva la comprensión y el total.'
          ],
          checks: ["Usas try, except y finally en convertir", "Muestras tres revisiones", "Los valores válidos suman 42"],
          success: "Garantizaste una acción final en todos los caminos. Ahora compondrás funciones pequeñas para limpiar una colección completa.",
          lesson: {
            walkthrough: ["La primera llamada convierte 8 y prepara ese retorno.", "finally muestra Revisado: 8 antes de que la función termine.", "La segunda conversión falla, except devuelve 0 y finally igualmente registra error."],
            prediction: "¿Cuántas veces se ejecuta finally si convertir se llama tres veces?",
            answer: "Tres veces, una por cada llamada, sin importar si la conversión funciona o cae en except.",
            reflection: "Agrega temporalmente otro texto inválido. Predice el total y la cantidad de líneas Revisado; después restaura los datos.",
            extension: "Dentro de except muestra también Dato inválido antes de devolver cero.",
            feedback: ["Conserva try y except, y añade un bloque finally dentro de convertir.", "finally debe mostrar Revisado junto al parámetro texto. Al procesar tres datos deben aparecer tres líneas.", "Suma la lista valores después de las conversiones. 12 + 0 + 30 debe producir Total: 42."]
          },
          validate(result, source) {
            const reviewed = result.output.filter(line => /^Revisado:/.test(line.trim()));
            return [
              uses(source, /\btry\s*:/) && uses(source, /except\s+ValueError/) && uses(source, /\bfinally\s*:/),
              reviewed.length === 3 && ["12", "hola", "30"].every(value => reviewed.some(line => line.includes(value))),
              hasLine(result, "Total: 42")
            ];
          }
        },
        {
          id: 32,
          title: "Compone una limpieza reutilizable",
          shortTitle: "Composición de funciones",
          duration: "24 min",
          difficulty: "Avanzado",
          file: "proyecto_32.py",
          prerequisites: "Reutiliza métodos de texto, funciones, comprensiones y join().",
          summary: "Una tarea compleja se vuelve más fácil de probar cuando se divide en funciones pequeñas. Separarás la limpieza de un nombre del procesamiento de toda la lista.",
          example: 'def limpiar(texto):\n    return texto.strip().lower().title()\n\ndef preparar(items):\n    return [limpiar(item) for item in items]\n\nnombres = ["  ana", "LUIS  "]\nlimpios = preparar(nombres)\nprint(", ".join(limpios))',
          explanation: "limpiar resuelve un solo texto. preparar reutiliza esa función dentro de una comprensión, por lo que la regla queda en un lugar y puede aplicarse a cualquier lista.",
          concepts: ["Separar responsabilidades", "Llamar una función desde otra", "Construir un resultado reutilizable"],
          goal: "Define limpiar(texto) con strip(), lower() y title(), y preparar(items) que la aplique a cada elemento. Para ['  ana', 'LUIS  ', '  maría  '] muestra ['Ana', 'Luis', 'María'] y Ana, Luis, María.",
          starter: 'nombres = ["  ana", "LUIS  ", "  maría  "]\n\ndef limpiar(texto):\n    return texto\n\nlimpios = [limpiar(nombre) for nombre in nombres]\nprint(limpios)',
          hints: [
            "Haz que limpiar resuelva espacios y mayúsculas para un único texto antes de pensar en la lista.",
            "preparar(items) puede devolver una comprensión que llame limpiar(item) en cada vuelta.",
            'Usa return texto.strip().lower().title(), define preparar y luego muestra limpios y ", ".join(limpios).'
          ],
          checks: ["Defines limpiar() y preparar()", "limpios contiene Ana, Luis y María", "Muestras los nombres unidos por coma"],
          success: "Compusiste funciones con responsabilidades claras. El siguiente nivel aplicará estas decisiones a datos que llegan como texto y registros.",
          lesson: {
            walkthrough: ["limpiar elimina los espacios externos y normaliza las palabras.", "preparar recorre la lista y llama limpiar para cada elemento.", "join reúne la lista final en un texto legible sin repetir la regla de limpieza."],
            prediction: "Si cambia la regla de limpieza, ¿en cuántos lugares necesitas corregirla?",
            answer: "En uno: dentro de limpiar. preparar reutiliza automáticamente esa versión.",
            reflection: "Prueba temporalmente un nombre ya limpio y otro con varios espacios. Explica por qué ambos quedan consistentes.",
            extension: "Añade una función presentar(items) que reciba la lista limpia y devuelva el texto unido.",
            feedback: ["Define las dos funciones. limpiar trabaja con un texto y preparar coordina la colección completa.", "Usa strip().lower().title() dentro de limpiar y llama esa función desde preparar; limpios debe contener tres nombres normalizados.", "Muestra también el resultado de ', '.join(limpios), no una frase escrita manualmente."]
          },
          validate(result, source) {
            return [
              uses(source, /def\s+limpiar\s*\(/) && uses(source, /def\s+preparar\s*\(/),
              sameList(result.environment.limpios, ["Ana", "Luis", "María"]),
              hasLine(result, "Ana, Luis, María")
            ];
          }
        }
      ]
    },
    {
      id: 9,
      title: "Procesamiento de datos",
      description: "Normalización, agrupación, lectura tabular y reportes ordenados",
      stage: "Procesamiento de datos",
      completionTitle: "Finalizaste el procesamiento de datos de Python.",
      completionCopy: "Normalizaste texto, agrupaste registros, interpretaste datos tabulares y construiste un ranking. Repasa cómo cada transformación prepara la siguiente.",
      approvedCopy: "Aprobaste el nivel de procesamiento de datos. Estás listo para integrar validación, métricas y reportes en proyectos avanzados.",
      projects: [
        {
          id: 33,
          title: "Cuenta palabras normalizadas",
          shortTitle: "Frecuencias",
          duration: "24 min",
          difficulty: "Avanzado",
          file: "proyecto_33.py",
          prerequisites: "Reutiliza métodos de texto, diccionarios, ciclos y get().",
          summary: "Un mismo término puede llegar con mayúsculas o signos. Antes de contar, normalizarás el texto para que Python reúna las apariciones equivalentes.",
          example: 'texto = "Sol, luna sol"\npalabras = texto.lower().replace(",", "").split()\nconteo = {}\nfor palabra in palabras:\n    conteo[palabra] = conteo.get(palabra, 0) + 1\nprint(conteo)',
          explanation: "lower() unifica mayúsculas, replace() elimina la coma y split() separa las palabras. El diccionario usa cada palabra como clave y get(..., 0) permite sumar desde la primera aparición.",
          concepts: ["Normalizar antes de medir", "Acumular frecuencias", "Separar preparación y conteo"],
          goal: "Procesa 'Python, datos python código datos python'. Crea conteo y muestra Python: 3, datos: 2 y código: 1 usando los valores calculados.",
          starter: 'texto = "Python, datos python código datos python"\npalabras = texto.split()\nconteo = {}\nprint(palabras)',
          hints: [
            "Primero consigue palabras comparables: pasa todo a minúsculas y elimina la coma.",
            "Recorre palabras y actualiza conteo[palabra] con conteo.get(palabra, 0) + 1.",
            'Crea palabras = texto.lower().replace(",", "").split(); después muestra cada frecuencia desde conteo.'
          ],
          checks: ["Normalizas y separas el texto", "Construyes conteo acumulando frecuencias", "Muestras 3, 2 y 1 para las palabras correctas"],
          success: "Convertiste texto irregular en frecuencias comparables. Ahora reunirás registros completos por una categoría.",
          lesson: {
            walkthrough: ["lower y replace convierten el ejemplo en sol luna sol.", "split produce tres palabras independientes.", "El ciclo crea sol con 1 y luego actualiza esa misma clave a 2."],
            prediction: "¿Qué conteo tendría Sol si no aplicas lower()?",
            answer: "Sol y sol quedarían como claves distintas, cada una con una aparición. La normalización evita esa separación accidental.",
            reflection: "Añade temporalmente PYTHON al final y predice la nueva frecuencia. Después restaura el texto.",
            extension: "Ordena conteo.items() por frecuencia descendente usando una lambda.",
            feedback: ["Antes del ciclo aplica lower(), elimina la coma y usa split(); contar el texto sin normalizar separa Python de python.", "Recorre palabras y suma con conteo.get(palabra, 0) + 1 para no perder apariciones anteriores.", "Muestra los valores del diccionario calculado: Python 3, datos 2 y código 1."]
          },
          validate(result, source) {
            return [
              uses(source, /\.lower\s*\(\)/) && uses(source, /\.replace\s*\(/) && uses(source, /\.split\s*\(/),
              JSON.stringify(result.environment.conteo) === JSON.stringify({ python: 3, datos: 2, "código": 1 }),
              hasText(result, /Python:\s*3/i) && hasText(result, /datos:\s*2/i) && hasText(result, /código:\s*1/i)
            ];
          }
        },
        {
          id: 34,
          title: "Agrupa participantes por área",
          shortTitle: "Agrupación con setdefault",
          duration: "24 min",
          difficulty: "Avanzado",
          file: "proyecto_34.py",
          prerequisites: "Reutiliza tuplas, diccionarios, listas, ciclos y join().",
          summary: "Los registros llegan uno por uno, pero el reporte necesita reunirlos por área. setdefault() crea la lista de un grupo solo cuando todavía no existe.",
          example: 'registros = [("Ana", "datos"), ("Luis", "datos"), ("Zoe", "web")]\ngrupos = {}\nfor nombre, area in registros:\n    grupos.setdefault(area, []).append(nombre)\nfor area in sorted(grupos):\n    print(area, grupos[area])',
          explanation: "setdefault(area, []) devuelve la lista ya guardada o crea una vacía. append() agrega el nombre al grupo correspondiente; luego sorted() permite presentar las áreas en orden estable.",
          concepts: ["Agrupar por una clave", "Inicializar bajo demanda", "Presentar grupos ordenados"],
          goal: "Agrupa Ana y Luis en Datos, y Zoe y Mara en Web. Muestra Datos: Ana, Luis y Web: Zoe, Mara, en orden alfabético de área.",
          starter: 'registros = [("Ana", "Datos"), ("Luis", "Datos"), ("Zoe", "Web"), ("Mara", "Web")]\ngrupos = {}\nfor nombre, area in registros:\n    grupos[area] = nombre\nprint(grupos)',
          hints: [
            "Una clave necesita guardar varios nombres, por lo que su valor debe ser una lista.",
            "setdefault(area, []) entrega la lista del grupo y append(nombre) agrega el registro actual.",
            'Dentro del primer ciclo usa grupos.setdefault(area, []).append(nombre). Recorre sorted(grupos) y une con ", ".join(grupos[area]).'
          ],
          checks: ["Agrupas con setdefault() y append()", "Cada área conserva sus dos nombres", "Muestras Datos antes de Web con los nombres unidos"],
          success: "Transformaste registros individuales en grupos útiles. El siguiente proyecto interpretará una pequeña tabla de texto.",
          lesson: {
            walkthrough: ["El primer registro crea la clave datos con una lista vacía y agrega Ana.", "El segundo encuentra la misma lista y agrega Luis.", "Web crea otro grupo con Zoe, y el ciclo final muestra ambos."],
            prediction: "¿Qué se perdería si asignas grupos[area] = nombre en cada vuelta?",
            answer: "Cada nombre reemplazaría al anterior de la misma área. Solo quedaría el último registro.",
            reflection: "Agrega temporalmente una persona en Diseño y predice dónde aparecerá esa área al ordenar.",
            extension: "Muestra también la cantidad de participantes de cada área con len(grupos[area]).",
            feedback: ["Usa setdefault(area, []) y append(nombre); asignar un texto directamente reemplaza participantes anteriores.", "Datos debe conservar Ana y Luis, y Web debe conservar Zoe y Mara en sus listas.", "Recorre sorted(grupos) y usa join() para mostrar Datos antes de Web con el formato pedido."]
          },
          validate(result, source) {
            return [
              uses(source, /\.setdefault\s*\(/) && uses(source, /\.append\s*\(/),
              JSON.stringify(result.environment.grupos) === JSON.stringify({ Datos: ["Ana", "Luis"], Web: ["Zoe", "Mara"] }),
              result.output[0]?.trim() === "Datos: Ana, Luis" && result.output[1]?.trim() === "Web: Zoe, Mara"
            ];
          }
        },
        {
          id: 35,
          title: "Interpreta una tabla de texto",
          shortTitle: "Datos tabulares",
          duration: "26 min",
          difficulty: "Avanzado",
          file: "proyecto_35.py",
          prerequisites: "Reutiliza split(), segmentos de listas, zip(), dict() y comprensiones.",
          summary: "Muchos datos llegan como líneas separadas por delimitadores. Construirás registros usando la primera línea como cabecera y las siguientes como valores.",
          example: 'texto = "nombre,curso\\nAna,Python\\nLuis,SQL"\nlineas = texto.split("\\n")\ncabecera = lineas[0].split(",")\nfilas = [dict(zip(cabecera, linea.split(","))) for linea in lineas[1:]]\nprint(filas)',
          explanation: "La primera línea define los nombres de campo. Cada línea restante se divide en valores; zip() la alinea con la cabecera y dict() convierte esas parejas en un registro.",
          concepts: ["Separar filas y columnas", "Usar una cabecera", "Construir registros con zip()"],
          goal: "Interpreta nombre,curso con las filas Ana,Python y Luis,SQL. Guarda dos diccionarios en filas, muestra Ana estudia Python y Registros: 2.",
          starter: 'texto = "nombre,curso\\nAna,Python\\nLuis,SQL"\nlineas = texto.split("\\n")\nprint(lineas)',
          hints: [
            "Separa la cabecera de las filas: la primera está en lineas[0] y los datos en lineas[1:].",
            "Para cada línea de datos, combina cabecera con sus valores mediante dict(zip(...)).",
            'Usa filas = [dict(zip(cabecera, linea.split(","))) for linea in lineas[1:]]. Después lee filas[0] y len(filas).'
          ],
          checks: ["Construyes filas con dict(), zip() y la cabecera", "filas contiene dos registros correctos", "Muestras el primer registro y el total 2"],
          success: "Convertiste texto delimitado en registros consultables. A continuación ordenarás y presentarás un reporte completo.",
          lesson: {
            walkthrough: ["split por salto de línea crea tres elementos.", "La cabecera aporta nombre y curso.", "zip alinea esas claves con Ana y Python, y dict crea el primer registro."],
            prediction: "¿Qué parte del programa decide los nombres de las claves?",
            answer: "La cabecera, obtenida desde lineas[0]. Cada texto separado por coma se convierte en una clave.",
            reflection: "Agrega temporalmente una tercera fila y predice len(filas). Después restaura las dos.",
            extension: "Recorre filas para mostrar una frase por cada estudiante, no solo la primera.",
            feedback: ["Crea cabecera desde la primera línea y usa las líneas restantes para construir filas.", "Cada registro debe nacer de dict(zip(cabecera, valores)); filas debe contener Ana/Python y Luis/SQL.", "Lee el primer diccionario para mostrar Ana estudia Python y usa len(filas) para Registros: 2."]
          },
          validate(result, source) {
            const rows = [{ nombre: "Ana", curso: "Python" }, { nombre: "Luis", curso: "SQL" }];
            return [
              uses(source, /dict\s*\(\s*zip\s*\(/) && uses(source, /lineas\s*\[\s*1\s*:/),
              sameList(result.environment.filas, rows),
              hasLine(result, "Ana estudia Python") && hasLine(result, "Registros: 2")
            ];
          }
        },
        {
          id: 36,
          title: "Publica un ranking de ventas",
          shortTitle: "Reporte ordenado",
          duration: "28 min",
          difficulty: "Avanzado",
          file: "proyecto_36.py",
          prerequisites: "Reutiliza listas de diccionarios, sorted(), lambda, enumerate() y f-strings.",
          summary: "Un reporte útil no solo calcula: también decide un orden y presenta posiciones comprensibles. Integrarás ordenamiento, numeración y acceso a registros.",
          example: 'ventas = [{"curso": "SQL", "total": 40}, {"curso": "Python", "total": 120}]\nordenadas = sorted(ventas, key=lambda fila: fila["total"], reverse=True)\nfor posicion, fila in enumerate(ordenadas, 1):\n    curso = fila["curso"]\n    total = fila["total"]\n    print(f"{posicion}. {curso}: {total}")',
          explanation: "sorted crea la secuencia de mayor a menor usando total. enumerate añade la posición visible, mientras cada diccionario conserva juntos el curso y su monto.",
          concepts: ["Ordenar registros", "Numerar un resultado", "Presentar campos relacionados"],
          goal: "Ordena Python 120, SQL 40 y Git 75 de mayor a menor. Muestra exactamente 1. Python: 120, 2. Git: 75 y 3. SQL: 40.",
          starter: 'ventas = [\n    {"curso": "SQL", "total": 40},\n    {"curso": "Python", "total": 120},\n    {"curso": "Git", "total": 75}\n]\nfor fila in ventas:\n    print(fila["curso"], fila["total"])',
          hints: [
            "Primero produce una lista ordenada por el campo total; después piensa en la numeración.",
            "Usa sorted con key=lambda fila: fila['total'] y reverse=True. Recorre ese resultado con enumerate(..., 1).",
            'En el ciclo muestra f"{posicion}. {fila[\"curso\"]}: {fila[\"total\"]}".'
          ],
          checks: ["Ordenas por total descendente", "Numeras con enumerate() desde 1", "Muestras las tres líneas con formato y orden correctos"],
          success: "Construiste un reporte ordenado a partir de registros. El nivel final combinará estas herramientas con validación y métricas reutilizables.",
          lesson: {
            walkthrough: ["lambda entrega 40 para SQL y 120 para Python.", "reverse coloca Python antes de SQL.", "enumerate asigna las posiciones 1 y 2 al resultado ya ordenado."],
            prediction: "Si Git tiene total 120 también, ¿qué curso conserva primero esa posición empatada?",
            answer: "Python, si aparece antes en la lista original. sorted() conserva el orden de llegada entre elementos con la misma clave.",
            reflection: "Cambia temporalmente Git a 150 y predice las tres posiciones. Después restaura 75.",
            extension: "Muestra al final el total general calculado con una comprensión y sum().",
            feedback: ["Crea una lista nueva con sorted(), una lambda que lea total y reverse=True.", "Recorre la lista ordenada con enumerate(..., 1) para obtener posiciones 1, 2 y 3.", "La salida debe conservar exactamente Python 120, Git 75 y SQL 40 con su posición y dos puntos."]
          },
          validate(result, source) {
            const expected = ["1. Python: 120", "2. Git: 75", "3. SQL: 40"];
            return [
              uses(source, /sorted\s*\(/) && uses(source, /key\s*=\s*lambda/) && uses(source, /reverse\s*=\s*True/),
              uses(source, /enumerate\s*\([^)]*,\s*1\s*\)/),
              expected.every((line, index) => result.output[index]?.trim() === line)
            ];
          }
        }
      ]
    },
    {
      id: 10,
      title: "Desarrollo avanzado aplicado",
      description: "Calidad de datos, métricas, validación y proyecto modular",
      stage: "Desarrollo avanzado aplicado",
      completionTitle: "Finalizaste el desarrollo avanzado aplicado de Python.",
      completionCopy: "Completaste cuarenta proyectos: depuraste registros, diseñaste métricas seguras, validaste lotes y construiste un reporte modular. El último examen comprueba las decisiones que sostienen ese trabajo.",
      approvedCopy: "Aprobaste los diez mini exámenes y completaste la ruta avanzada disponible en CápsulasDev.",
      projects: [
        {
          id: 37,
          title: "Depura registros duplicados",
          shortTitle: "Deduplicación",
          duration: "26 min",
          difficulty: "Avanzado",
          file: "proyecto_37.py",
          prerequisites: "Reutiliza listas de diccionarios, conjuntos, métodos de texto y condiciones.",
          summary: "Dos registros pueden representar el mismo correo aunque cambien las mayúsculas. Mantendrás la primera aparición y usarás un conjunto para detectar las siguientes.",
          example: 'personas = [{"nombre": "Ana", "correo": "ANA@MAIL.CL"}, {"nombre": "Otra Ana", "correo": "ana@mail.cl"}]\nvistos = set()\nunicas = []\nfor persona in personas:\n    correo = persona["correo"].lower()\n    if correo not in vistos:\n        vistos.add(correo)\n        unicas.append(persona)\nprint(len(unicas))',
          explanation: "lower() crea una clave comparable. vistos permite preguntar rápidamente si ya apareció; unicas conserva el primer registro completo para cada correo normalizado.",
          concepts: ["Elegir una clave de identidad", "Normalizar antes de comparar", "Conservar la primera aparición"],
          goal: "Depura cuatro registros donde Ana@MAIL.cl y ana@mail.cl son el mismo correo. Conserva Ana, Luis y Zoe. Muestra Únicos: 3 y sus tres correos normalizados, uno por línea.",
          starter: 'personas = [\n    {"nombre": "Ana", "correo": "Ana@MAIL.cl"},\n    {"nombre": "Luis", "correo": "luis@mail.cl"},\n    {"nombre": "Ana repetida", "correo": "ana@mail.cl"},\n    {"nombre": "Zoe", "correo": "zoe@mail.cl"}\n]\nunicas = personas\nprint(f"Únicos: {len(unicas)}")',
          hints: [
            "Compara una versión en minúsculas del correo y conserva el diccionario completo solo la primera vez.",
            "Usa vistos = set() y unicas = []. Si correo not in vistos, agrégalo a ambos destinos.",
            'Recorre personas, calcula correo = persona["correo"].lower(), usa vistos.add(correo) y unicas.append(persona). Después muestra los correos normalizados.'
          ],
          checks: ["Normalizas el correo y controlas vistos con un set", "unicas conserva tres registros y excluye el duplicado", "Muestras el total y los tres correos normalizados"],
          success: "Depuraste registros con una regla explícita de identidad. Ahora diseñarás una métrica que cubra también una colección vacía.",
          lesson: {
            walkthrough: ["El primer correo se normaliza y entra en vistos.", "La segunda fila produce la misma clave y se descarta.", "unicas conserva el primer diccionario de Ana, sin perder su información original."],
            prediction: "¿Qué Ana se conserva cuando dos correos normalizados coinciden?",
            answer: "La primera que aparece, porque solo se agrega cuando la clave todavía no está en vistos.",
            reflection: "Intercambia temporalmente el orden de las dos Anas y predice qué nombre quedará.",
            extension: "Cuenta también cuántos duplicados se descartaron comparando len(personas) y len(unicas).",
            feedback: ["Crea vistos como set y normaliza cada correo con lower() antes de comprobar pertenencia.", "Agrega a unicas solo cuando el correo aún no esté en vistos. Deben quedar Ana, Luis y Zoe.", "Muestra Únicos: 3 y recorre unicas para mostrar los tres correos en minúsculas."]
          },
          validate(result, source) {
            const names = Array.isArray(result.environment.unicas) ? result.environment.unicas.map(item => item.nombre) : [];
            return [
              uses(source, /\bset\s*\(/) && uses(source, /\.lower\s*\(\)/) && uses(source, /not\s+in\s+vistos/),
              sameList(names, ["Ana", "Luis", "Zoe"]),
              hasLine(result, "Únicos: 3") && ["ana@mail.cl", "luis@mail.cl", "zoe@mail.cl"].every(value => hasLine(result, value))
            ];
          }
        },
        {
          id: 38,
          title: "Diseña una métrica segura",
          shortTitle: "Casos límite",
          duration: "24 min",
          difficulty: "Avanzado",
          file: "proyecto_38.py",
          prerequisites: "Reutiliza funciones, diccionarios de listas, condiciones y formato decimal.",
          summary: "Una función de promedio debe definir qué ocurre cuando no hay datos. Resolver ese caso límite evita una división por cero y hace que el contrato sea predecible.",
          example: 'def promedio(valores):\n    if len(valores) == 0:\n        return 0\n    return sum(valores) / len(valores)\n\nprint(promedio([4, 6]))\nprint(promedio([]))',
          explanation: "La condición vacía se atiende antes de dividir. Los demás casos siguen una sola fórmula, por lo que la función sirve para grupos con distinta cantidad de valores.",
          concepts: ["Definir un caso límite", "Evitar división por cero", "Reutilizar una métrica"],
          goal: "Define promedio(valores) devolviendo 0 para una lista vacía. Recorre Python [5, 6], SQL [6] y Diseño []. Muestra Python: 5.50, SQL: 6.00 y Diseño: 0.00.",
          starter: 'grupos = {"Python": [5, 6], "SQL": [6], "Diseño": []}\n\ndef promedio(valores):\n    if len(valores) == 0:\n        return -1\n    return sum(valores) / len(valores)\n\nfor nombre, notas in grupos.items():\n    print(nombre, promedio(notas))',
          hints: [
            "Antes de dividir, pregunta qué debería devolver la función cuando len(valores) sea cero.",
            "Agrega un retorno temprano para la lista vacía; después conserva la fórmula general.",
            'Usa if len(valores) == 0: return 0. En el ciclo muestra f"{nombre}: {promedio(notas):.2f}".'
          ],
          checks: ["promedio() cubre la lista vacía", "Calculas 5.50, 6.00 y 0.00", "Muestras los tres grupos con dos decimales"],
          success: "Definiste el comportamiento normal y el caso límite de una métrica. A continuación separarás registros válidos e inválidos.",
          lesson: {
            walkthrough: ["[4, 6] tiene dos valores y produce 10 / 2 = 5.", "La lista vacía entra en el retorno temprano.", "No se intenta dividir 0 por 0, por lo que la función devuelve 0 de forma controlada."],
            prediction: "¿Qué error aparecería con una lista vacía si quitas la condición inicial?",
            answer: "ZeroDivisionError, porque len([]) vale 0 y la fórmula intentaría dividir por cero.",
            reflection: "Prueba temporalmente un grupo con una sola nota 7 y predice su promedio.",
            extension: "Crea una función resumen(valores) que devuelva mínimo, máximo y promedio cuando la lista no esté vacía.",
            feedback: ["Agrega un caso para len(valores) == 0 antes de la división y devuelve 0.", "Usa la misma función con los tres grupos; los resultados calculados deben ser 5.50, 6.00 y 0.00.", "Presenta cada valor con .2f para conservar dos decimales, incluido Diseño: 0.00."]
          },
          validate(result, source) {
            return [
              uses(source, /def\s+promedio\s*\(/) && uses(source, /if\s+len\s*\(\s*valores\s*\)\s*==\s*0/),
              hasLine(result, "Python: 5.50") && hasLine(result, "SQL: 6.00") && hasLine(result, "Diseño: 0.00"),
              result.output.length === 3 && uses(source, /\.2f/)
            ];
          }
        },
        {
          id: 39,
          title: "Valida un lote de cursos",
          shortTitle: "Pipeline de validación",
          duration: "28 min",
          difficulty: "Avanzado",
          file: "proyecto_39.py",
          prerequisites: "Reutiliza funciones, get(), condiciones compuestas y comprensiones.",
          summary: "Antes de generar un reporte necesitas separar los registros que cumplen el contrato. Una función de validación concentra las reglas y una comprensión construye el lote limpio.",
          example: 'def es_valido(fila):\n    return fila.get("nombre", "") != "" and fila.get("horas", 0) > 0\n\nregistros = [{"nombre": "Python", "horas": 8}, {"nombre": "", "horas": 4}]\nvalidos = [fila for fila in registros if es_valido(fila)]\nprint(validos)',
          explanation: "get() aporta valores seguros cuando falta una clave. es_valido reúne las reglas en un booleano y la comprensión conserva únicamente los registros que devuelven True.",
          concepts: ["Expresar un contrato", "Filtrar con una función", "Medir datos rechazados"],
          goal: "Valida cuatro cursos: Python 8, nombre vacío 4, SQL 0 y React 6. Conserva Python y React. Muestra Válidos: Python, React y Rechazados: 2.",
          starter: 'registros = [\n    {"nombre": "Python", "horas": 8},\n    {"nombre": "", "horas": 4},\n    {"nombre": "SQL", "horas": 0},\n    {"nombre": "React", "horas": 6}\n]\nvalidos = registros\nprint(validos)',
          hints: [
            "Define primero qué significa válido: nombre no vacío y horas mayores que cero.",
            "Usa get() dentro de es_valido(fila) y llama esa función desde una comprensión con if.",
            'Crea validos = [fila for fila in registros if es_valido(fila)]. Une sus nombres y calcula len(registros) - len(validos).'
          ],
          checks: ["Defines es_valido() con las dos reglas", "validos conserva Python y React", "Muestras los nombres válidos y 2 rechazados"],
          success: "Convertiste reglas de calidad en un filtro reutilizable. El proyecto final integrará métricas, ordenamiento y presentación.",
          lesson: {
            walkthrough: ["Python cumple nombre y horas, por lo que es_valido devuelve True.", "El segundo registro falla por nombre vacío.", "La comprensión conserva solo Python; la resta calcula un rechazo."],
            prediction: "¿Qué ocurre con un registro que no tiene la clave horas?",
            answer: "get('horas', 0) devuelve 0 y la validación lo rechaza sin producir KeyError.",
            reflection: "Agrega temporalmente un curso sin nombre y sin horas. Predice el nuevo total de rechazados.",
            extension: "Construye una lista errores que explique por qué se rechazó cada registro.",
            feedback: ["Define es_valido(fila) y comprueba nombre no vacío y horas mayores que cero usando get().", "Filtra registros llamando es_valido desde una comprensión. Solo Python y React deben quedar.", "Une los nombres calculados y muestra Rechazados: 2 mediante la diferencia de tamaños."]
          },
          validate(result, source) {
            const names = Array.isArray(result.environment.validos) ? result.environment.validos.map(item => item.nombre) : [];
            return [
              uses(source, /def\s+es_valido\s*\(/) && uses(source, /\.get\s*\(/) && uses(source, /\band\b/),
              sameList(names, ["Python", "React"]),
              hasLine(result, "Válidos: Python, React") && hasLine(result, "Rechazados: 2")
            ];
          }
        },
        {
          id: 40,
          title: "Proyecto avanzado: reporte de actividades",
          shortTitle: "Proyecto avanzado",
          duration: "35 min",
          difficulty: "Proyecto",
          file: "proyecto_40.py",
          prerequisites: "Integra funciones, listas de diccionarios, sorted(), lambda, ciclos, condiciones y f-strings.",
          summary: "Cerrarás la ruta con un programa modular que calcula ocupación, ordena actividades y resume los cupos disponibles. Cada función tendrá una responsabilidad observable.",
          example: 'actividades = [{"nombre": "Museo", "inscritos": 8, "cupo": 10}, {"nombre": "Parque", "inscritos": 10, "cupo": 10}]\n\ndef ocupacion(item):\n    return int(item["inscritos"] / item["cupo"] * 100)\n\ndef reporte(items):\n    ordenadas = sorted(items, key=lambda item: ocupacion(item), reverse=True)\n    libres = 0\n    for item in ordenadas:\n        disponibles = item["cupo"] - item["inscritos"]\n        libres += disponibles\n        nombre = item["nombre"]\n        porcentaje = ocupacion(item)\n        print(f"{nombre}: {porcentaje}% · {disponibles} cupos")\n    print(f"Cupos disponibles: {libres}")\n\nreporte(actividades)',
          explanation: "ocupacion concentra el cálculo porcentual. reporte ordena mediante esa función, calcula cupos por actividad, acumula el total y presenta ambos niveles de información.",
          concepts: ["Diseñar funciones con una tarea", "Ordenar por una métrica calculada", "Integrar detalle y resumen"],
          goal: "Completa ocupacion(item) y reporte(items). Ordena Parque 20/20, Museo 12/15 y Café 8/10 por ocupación descendente. Muestra Parque: 100% · 0 cupos, Museo: 80% · 3 cupos, Café: 80% · 2 cupos y Cupos disponibles: 5.",
          starter: 'actividades = [\n    {"nombre": "Parque", "inscritos": 20, "cupo": 20},\n    {"nombre": "Museo", "inscritos": 12, "cupo": 15},\n    {"nombre": "Café", "inscritos": 8, "cupo": 10}\n]\n\ndef ocupacion(item):\n    return 0\n\ndef reporte(items):\n    for item in items:\n        print(item["nombre"])\n\nreporte(actividades)',
          hints: [
            "Resuelve primero ocupacion: inscritos dividido por cupo, multiplicado por 100 y convertido a entero.",
            "Dentro de reporte crea ordenadas con sorted(), una lambda que llame ocupacion y reverse=True. Acumula cupo - inscritos.",
            'Por cada item muestra nombre, ocupacion(item) y disponibles. Después del ciclo muestra f"Cupos disponibles: {libres}".'
          ],
          checks: ["Defines ocupacion() y reporte() con ordenamiento descendente", "Muestras las tres actividades con porcentaje y cupos correctos", "Calculas Cupos disponibles: 5"],
          success: "Construiste un programa avanzado dentro del alcance del laboratorio: funciones coordinadas, registros, métrica, ordenamiento y resumen. Completaste los cuarenta proyectos de Python.",
          lesson: {
            walkthrough: ["ocupacion calcula 80 % para Museo y 100 % para Parque.", "sorted usa esa métrica y coloca Parque primero.", "reporte calcula 2 cupos libres en Museo, 0 en Parque y muestra un total de 2."],
            prediction: "Cuando dos actividades tienen el mismo porcentaje, ¿qué orden conservan?",
            answer: "Conservan su orden relativo original porque sorted() es estable. Por eso Museo aparece antes que Café en la misión.",
            reflection: "Cambia temporalmente Café a 10 inscritos. Predice su porcentaje, sus cupos y el nuevo total.",
            extension: "Añade una función estado(item) que devuelva completo cuando no queden cupos y disponible en los demás casos.",
            feedback: ["Completa las dos funciones y crea ordenadas con sorted(), una lambda que use ocupacion y reverse=True.", "Recorre ordenadas y calcula disponibles como cupo - inscritos. Las líneas deben mostrar 100 %, 80 % y 80 % con 0, 3 y 2 cupos.", "Acumula disponibles dentro del ciclo y muestra el total después. El resultado correcto es Cupos disponibles: 5."]
          },
          validate(result, source) {
            const expected = ["Parque: 100% · 0 cupos", "Museo: 80% · 3 cupos", "Café: 80% · 2 cupos"];
            return [
              uses(source, /def\s+ocupacion\s*\(/) && uses(source, /def\s+reporte\s*\(/)
                && uses(source, /sorted\s*\(/) && uses(source, /reverse\s*=\s*True/),
              expected.every((line, index) => result.output[index]?.trim() === line),
              hasLine(result, "Cupos disponibles: 5")
            ];
          }
        }
      ]
    }
  ];

  const exams = [
    {
      levelId: 6,
      title: "Mini examen de control y recorridos",
      intro: "Cinco preguntas sobre while, enumerate(), zip() y conjuntos. Necesitas 4 respuestas correctas para aprobar.",
      passing: 4,
      questions: [
        { question: "¿Qué necesita un ciclo while para no continuar indefinidamente?", options: ["Una lista ordenada", "Un cambio que acerque su condición a False", "Una función lambda", "Un bloque finally"], answer: 1, explanation: "El estado usado por la condición debe cambiar; de lo contrario, while puede repetir para siempre." },
        { question: "¿Qué produce enumerate([\"a\", \"b\"], 1) durante un for?", options: ["Solo los textos", "Los pares 1/a y 2/b", "Los pares 0/a y 1/b", "Un diccionario"], answer: 1, explanation: "El segundo argumento fija el comienzo en 1 y cada vuelta entrega posición y elemento." },
        { question: "Si zip() recibe listas de tres y dos elementos, ¿cuántas parejas entrega?", options: ["Una", "Dos", "Tres", "Produce un error"], answer: 1, explanation: "zip() se detiene al terminar la colección más corta, por lo que entrega dos parejas." },
        { question: "¿Qué ventaja principal tiene set() al contar personas únicas?", options: ["Ordena automáticamente", "Elimina valores duplicados", "Convierte textos en números", "Conserva cada repetición"], answer: 1, explanation: "Un conjunto mantiene una sola aparición de cada valor, aunque la entrada lo repita." },
        { question: "¿Qué devuelve invitados.difference(confirmados)?", options: ["Quienes están en ambos grupos", "Quienes están invitados pero no confirmados", "Todos los confirmados", "La cantidad de invitados"], answer: 1, explanation: "difference() conserva elementos del primer conjunto que no aparecen en el segundo." }
      ]
    },
    {
      levelId: 7,
      title: "Mini examen de transformaciones expresivas",
      intro: "Cinco preguntas sobre comprensiones, ordenamiento y condiciones colectivas. Necesitas 4 respuestas correctas para aprobar.",
      passing: 4,
      questions: [
        { question: "¿Qué crea [n * 2 for n in numeros]?", options: ["Una lista nueva con cada valor duplicado", "El doble del tamaño de numeros", "La misma lista modificada", "Un diccionario"], answer: 0, explanation: "La comprensión evalúa n * 2 para cada elemento y reúne los resultados en una lista nueva." },
        { question: "En {nombre: len(nombre) for nombre in nombres}, ¿qué representa nombre antes de los dos puntos?", options: ["El valor", "La clave", "La condición", "El índice"], answer: 1, explanation: "En una comprensión de diccionario, la expresión anterior a los dos puntos crea la clave." },
        { question: "¿Para qué sirve key=lambda fila: fila[\"total\"] en sorted()?", options: ["Filtra filas vacías", "Indica el valor usado para comparar cada fila", "Cambia todos los totales", "Imprime el resultado"], answer: 1, explanation: "La función key extrae de cada elemento el dato que sorted() debe utilizar al ordenar." },
        { question: "¿Qué devuelve all([True, True, False])?", options: ["True", "False", "None", "Un error"], answer: 1, explanation: "all() exige que todos los elementos sean verdaderos; un solo False hace que el resultado sea False." },
        { question: "¿Qué devuelve any([False, True, False])?", options: ["True", "False", "La posición 1", "Una lista"], answer: 0, explanation: "any() necesita al menos un elemento verdadero, condición que esta colección sí cumple." }
      ]
    },
    {
      levelId: 8,
      title: "Mini examen de funciones robustas",
      intro: "Cinco preguntas sobre recursión, raise, finally y composición. Necesitas 4 respuestas correctas para aprobar.",
      passing: 4,
      questions: [
        { question: "¿Qué tarea cumple el caso base en una función recursiva?", options: ["Ordena las llamadas", "Detiene la recursión con un resultado conocido", "Convierte la función en ciclo", "Captura ValueError"], answer: 1, explanation: "El caso base resuelve la versión más pequeña sin otra llamada y permite que la recursión termine." },
        { question: "¿Qué hace raise ValueError(\"dato inválido\")?", options: ["Muestra el texto y continúa", "Lanza un error que interrumpe ese camino", "Devuelve False", "Repite la función"], answer: 1, explanation: "raise crea explícitamente el error y transfiere el control a un except compatible si existe." },
        { question: "¿Cuándo se ejecuta finally?", options: ["Solo cuando no hay error", "Solo después de except", "Tanto si try funciona como si ocurre un error", "Antes de try"], answer: 2, explanation: "finally realiza la acción final en ambos caminos, incluso cuando try o except preparan un return." },
        { question: "¿Cuál es una ventaja de dividir limpiar() y preparar()?", options: ["Python usa menos memoria siempre", "Cada función tiene una responsabilidad y la regla se corrige en un lugar", "Ya no se necesitan pruebas", "Permite usar import"], answer: 1, explanation: "Separar responsabilidades facilita probar, reutilizar y cambiar la limpieza sin duplicarla." },
        { question: "¿Qué riesgo tiene una llamada recursiva que no se acerca al caso base?", options: ["Entrega siempre cero", "Puede superar el límite de profundidad", "Ordena los datos al revés", "Convierte el resultado en texto"], answer: 1, explanation: "Si el problema no se reduce, las llamadas continúan hasta agotar el límite de profundidad." }
      ]
    },
    {
      levelId: 9,
      title: "Mini examen de procesamiento de datos",
      intro: "Cinco preguntas sobre normalización, agrupación, tablas y reportes. Necesitas 4 respuestas correctas para aprobar.",
      passing: 4,
      questions: [
        { question: "¿Por qué conviene aplicar lower() antes de contar palabras?", options: ["Elimina todos los espacios", "Reúne variantes que solo difieren en mayúsculas", "Ordena las palabras", "Convierte el texto en lista"], answer: 1, explanation: "Normalizar mayúsculas evita que Python trate Python y python como claves diferentes." },
        { question: "¿Qué aporta grupos.setdefault(area, []) antes de append()?", options: ["Borra el grupo anterior", "Obtiene la lista existente o crea una vacía", "Ordena el área", "Cuenta los registros"], answer: 1, explanation: "setdefault inicializa la lista solo si la clave todavía no existe y devuelve el valor guardado." },
        { question: "Al interpretar una tabla, ¿para qué se usa la cabecera?", options: ["Para calcular el total", "Para nombrar las claves de cada registro", "Para eliminar filas", "Para ordenar los valores"], answer: 1, explanation: "La cabecera aporta los nombres que zip() alinea con los valores de cada fila." },
        { question: "¿Qué propiedad tiene sorted() cuando dos elementos comparten la misma clave?", options: ["Los elimina", "Conserva su orden relativo original", "Siempre invierte su orden", "Produce ValueError"], answer: 1, explanation: "El ordenamiento de Python es estable y mantiene el orden de llegada entre claves iguales." },
        { question: "¿Por qué un reporte debería separar transformación y presentación?", options: ["Para que print() sea más rápido", "Para poder comprobar los datos antes de darles formato", "Porque sorted() no admite textos", "Para evitar funciones"], answer: 1, explanation: "Separar ambas etapas permite verificar el resultado calculado y cambiar su formato con menor riesgo." }
      ]
    },
    {
      levelId: 10,
      title: "Mini examen de desarrollo avanzado aplicado",
      intro: "Cinco preguntas sobre calidad de datos, casos límite y diseño modular. Necesitas 4 respuestas correctas para aprobar.",
      passing: 4,
      questions: [
        { question: "¿Qué dato conviene guardar en vistos para detectar correos duplicados?", options: ["El nombre visible", "El correo normalizado", "La posición de la fila", "El diccionario completo como texto"], answer: 1, explanation: "La clave de identidad debe ser estable; normalizar el correo permite comparar mayúsculas distintas." },
        { question: "¿Por qué promedio([]) necesita un caso especial?", options: ["sum([]) produce error", "len([]) es cero y la fórmula dividiría por cero", "Una lista vacía vale None", "No se puede usar return"], answer: 1, explanation: "La suma vacía es cero, pero dividirla por len([]), que también es cero, causa ZeroDivisionError." },
        { question: "¿Qué beneficio tiene concentrar reglas en es_valido(fila)?", options: ["Los datos cambian automáticamente", "El filtro y otras partes reutilizan el mismo contrato", "Desaparecen los registros inválidos del origen", "No hace falta manejar claves ausentes"], answer: 1, explanation: "Una función única evita repetir condiciones y permite aplicar el mismo contrato en varios lugares." },
        { question: "En un proyecto modular, ¿qué debería hacer ocupacion(item)?", options: ["Ordenar toda la lista", "Calcular y devolver la métrica de un registro", "Imprimir el reporte completo", "Modificar el cupo"], answer: 1, explanation: "Una función pequeña tiene una responsabilidad observable: calcular la ocupación de un elemento." },
        { question: "¿Qué evidencia muestra que un reporte avanzado es correcto?", options: ["Que usa muchas líneas", "Que sus detalles, orden y resumen se derivan de los datos", "Que incluye una clase", "Que evita todas las funciones incorporadas"], answer: 1, explanation: "La corrección se comprueba relacionando entradas, transformaciones y resultados observables, no por longitud." }
      ]
    }
  ];

  globalThis.PythonAdvancedCourse = Object.freeze({ levels, exams, helpers: { uses, hasLine, hasText, sameList } });
})();
