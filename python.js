const PROGRESS_KEY = "codigo-cero.python-v2.completed";

const EXAMS_KEY = "codigo-cero.python-v2.exams";

const clean = (source) => String(source).replace(/#.*$/gm, "");
const uses = (source, pattern) => pattern.test(clean(source));
const shows = (result, text) => result.output.some((line) => line.includes(String(text)));
const near = (value, expected) => typeof value === "number" && Math.abs(value - expected) < 0.001;
const isList = (value) => Array.isArray(value);
const sameList = (value, expected) => isList(value) && value.length === expected.length
  && value.every((item, index) => item === expected[index]);

const COURSE_LEVELS = [
  {
    id: 1,
    title: "Fundamentos",
    description: "Mensajes, variables y operaciones",
    stage: "Conceptos básicos",
    completionTitle: "Finalizaste los conceptos básicos de Python.",
    completionCopy: "Ya puedes anunciar un plan, presentar datos ficticios, calcular una cuenta y expresar su duración. Antes del mini examen, prueba tus cálculos con otros valores. En el siguiente nivel aprenderás a tomar decisiones: por ejemplo, elegir un mensaje según una temperatura.",
    approvedCopy: "Aprobaste el mini examen de conceptos básicos. Puedes repetirlo cuando quieras para repasar.",
    projects: [
      {
        id: 1,
        title: "Anuncia tu primer plan",
        shortTitle: "El mensaje",
        duration: "8 min",
        difficulty: "Inicio",
        file: "proyecto_01.py",
        summary: "Vas a organizar una salida con amistades. Lo primero es anunciar el plan: una instrucción print() muestra tu mensaje en la consola, sin enviarlo a nadie.",
        example: 'print("Hoy vamos al parque")',
        explanation: "print() muestra el contenido de los paréntesis. Las comillas indican dónde empieza y termina un texto; no forman parte del mensaje que aparece en el resultado.",
        concepts: ["Llamar una función", "Escribir texto entre comillas", "Leer la salida de un programa"],
        goal: "Dentro de las comillas vacías, escribe un plan inventado de al menos tres caracteres. Ejecútalo y comprueba que el resultado muestra lo que escribiste.",
        starter: 'print("")',
        hints: [
          "¿En qué parte del ejemplo aparece el mensaje que quieres cambiar? Conserva lo demás.",
          "Escribe el texto entre las dos comillas. print y sus paréntesis forman la instrucción.",
          'Prueba con print("Vamos al cine") y después inventa otro mensaje.'
        ],
        checks: ["Usas print()", "Se produce una salida", "Escribes al menos tres caracteres"],
        success: "Tu plan ya aparece en la consola. En el siguiente proyecto guardarás datos para construir una presentación.",
        lesson: {
          walkthrough: ["print es el nombre de la función que muestra información.", "Los paréntesis contienen lo que quieres mostrar.", "Cambia solo el texto entre comillas: la instrucción sigue funcionando."],
          prediction: "Antes de ejecutar el ejemplo, ¿se mostrarán también las comillas?",
          answer: "No. Aparece Hoy vamos al parque, sin comillas. Las comillas sirven para escribir el texto dentro del programa.",
          reflection: "Cambia el mensaje y predice la nueva salida antes de ejecutar.",
          extension: "Añade otra instrucción print() con una hora inventada. Observa en qué orden aparecen las dos líneas. La misión principal sigue siendo mostrar tu mensaje.",
          feedback: ["Usa print(...) para mostrar el mensaje; escribir solo el texto no lo imprime.", "No hay salida todavía. Comprueba que la instrucción print() se ejecute.", "El mensaje está vacío o es muy corto. Escribe al menos tres caracteres dentro de las comillas."]
        },
        validate(result, source) {
          return [
            uses(source, /print\s*\(/),
            result.output.length > 0,
            result.output.some((line) => line.trim().length >= 3)
          ];
        }
      },
      {
        id: 2,
        title: "Presenta a alguien del grupo",
        shortTitle: "La presentación",
        duration: "12 min",
        difficulty: "Fundamentos",
        file: "proyecto_02.py",
        summary: "Tu plan ya tiene un mensaje. Ahora presenta a un personaje ficticio que irá a la salida. Guarda su nombre y edad en variables; no uses datos personales reales.",
        example: 'nombre = "Luna"\nedad = 24\nprint(f"Soy {nombre} y tengo {edad} años")',
        explanation: "El signo = asigna un valor a un nombre. Una cadena con f delante de las comillas, llamada f-string, sustituye cada nombre entre llaves por su valor.",
        concepts: ["Variables de texto y número", "Asignación con =", "Texto con formato usando f"],
        goal: "Usa un nombre ficticio y una edad numérica. Corrige la última línea para que una sola frase muestre los valores de nombre y edad, en lugar de las palabras entre llaves.",
        starter: 'nombre = "Ada"\nedad = 28\nprint("Soy {nombre} y tengo {edad} años")',
        hints: [
          "Compara el inicio de la última línea con el ejemplo. ¿Qué carácter falta antes de las comillas?",
          "Sin la f, las llaves se muestran como texto. Con la f, Python busca el valor de las variables.",
          'Usa print(f"Soy {nombre} y tengo {edad} años"). Guarda nombre como texto y edad como número sin comillas.'
        ],
        checks: ["Creas nombre y edad", "Usas una f-string", "La salida muestra ambos datos"],
        success: "Tu presentación utiliza datos guardados. Ahora usarás variables para calcular el gasto de la salida.",
        lesson: {
          walkthrough: ["nombre guarda el texto Luna; edad guarda el número 24.", "La f antes de las comillas permite insertar variables entre llaves.", "El ejemplo muestra: Soy Luna y tengo 24 años. Cambiar una variable cambia la presentación."],
          prediction: "¿Qué aparecería si quitas la f de la última línea del ejemplo?",
          answer: "Soy {nombre} y tengo {edad} años. Sin la f, las llaves y los nombres son parte del texto; no se sustituyen.",
          reflection: "Cambia solo el valor de nombre. ¿Necesitas editar también el texto de print() para ver el nuevo nombre?",
          extension: "Crea una variable lugar con un destino inventado y añádela a la misma frase usando llaves. Conserva nombre y edad para completar la misión.",
          feedback: ["Define nombre como texto entre comillas y edad como un número sin comillas. Revisa que ambos nombres estén escritos igual.", "La frase necesita una f justo antes de las comillas: print(f\"...\"). Así se sustituyen las variables.", "Incluye {nombre} y {edad} dentro de la misma f-string. Comprueba que la salida tenga sus valores y no sus nombres."]
        },
        validate(result, source) {
          const nombre = result.environment.nombre;
          const edad = result.environment.edad;
          const tieneDatos = typeof nombre === "string" && typeof edad === "number";
          return [
            tieneDatos,
            uses(source, /print\s*\(\s*f["']/),
            tieneDatos && result.output.some((line) => line.includes(nombre) && line.includes(String(edad)))
          ];
        }
      },
      {
        id: 3,
        title: "Calcula una propina",
        shortTitle: "Calculadora",
        duration: "15 min",
        difficulty: "Operaciones",
        file: "proyecto_03.py",
        summary: "El grupo comparte una comida. Para saber cuánto pagar, calcula una propina y súmala a la cuenta. Primero comprueba una fórmula con números pequeños; después corrige la calculadora.",
        example: 'cuenta = 10000\nporcentaje = 10\npropina = cuenta * porcentaje / 100\ntotal = cuenta + propina\nprint(propina)\nprint(total)',
        explanation: "Diez por ciento significa diez de cada cien: multiplicar por 10 no basta, también hay que dividir por 100. Después, el total suma la cuenta y la propina calculada.",
        concepts: ["Multiplicar y dividir", "Reutilizar resultados", "Construir un cálculo por pasos"],
        goal: "Calcula la propina y el total de la cuenta usando el porcentaje indicado, y muestra ambos valores.",
        starter: 'cuenta = 20000\nporcentaje = 10\npropina = cuenta * porcentaje\ntotal = cuenta\nprint(f"Propina: {propina}")\nprint(f"Total: {total}")',
        hints: [
          "¿El 10 % de una cuenta debería ser mayor o menor que la cuenta? Revisa el tamaño del primer resultado.",
          "Un porcentaje se divide por 100. Una vez calculada la propina, úsala para obtener el total.",
          "Corrige dos líneas: propina = cuenta * porcentaje / 100 y total = cuenta + propina. Con 20000 y 10 %, obtendrás 2000.0 y 22000.0."
        ],
        checks: ["Calculas la propina", "Calculas el total", "Muestras ambos resultados"],
        success: "Ya puedes calcular cuánto pagar. El último proyecto te ayudará a expresar la duración de la salida.",
        lesson: {
          walkthrough: ["El ejemplo usa una cuenta de 10000 y una propina del 10 %.", "10000 × 10 ÷ 100 da 1000.0. La división puede mostrar un resultado con .0.", "Sumar la cuenta y la propina da 11000.0. En tu ejercicio la cuenta inicial será de 20000."],
          prediction: "Si porcentaje vale 0, ¿cuánto deberían valer la propina y el total?",
          answer: "La propina debería ser 0 y el total debería coincidir con la cuenta. Es una buena prueba para revisar la fórmula.",
          reflection: "Prueba con 0 y luego con 15 como porcentaje. Comprueba a mano al menos uno de los resultados.",
          extension: "Añade personas = 4 y calcula cuanto paga cada persona dividiendo total por personas. Conserva la salida de propina y total; el reparto es opcional.",
          feedback: ["Revisa el porcentaje: multiplica cuenta por porcentaje y divide por 100. La propina no es cuenta × porcentaje sin esa división.", "El total debe sumar cuenta y propina. Guardar solo cuenta deja fuera el gasto extra.", "Muestra propina y total después de calcularlos. Comprueba los valores que aparecen, no solo los nombres de las variables."]
        },
        validate(result) {
          const { cuenta, porcentaje, propina, total } = result.environment;
          const esperada = Number(cuenta) * Number(porcentaje) / 100;
          return [
            near(propina, esperada),
            near(total, Number(cuenta) + esperada),
            near(propina, esperada) && shows(result, propina) && shows(result, total)
          ];
        }
      },
      {
        id: 4,
        title: "Convierte minutos",
        shortTitle: "Conversor de tiempo",
        duration: "15 min",
        difficulty: "Práctico",
        file: "proyecto_04.py",
        summary: "Ya tienes el mensaje y el gasto. Falta expresar cuánto dura la salida: 135 minutos se entienden mejor como horas y minutos. En este cierre escribirás tú los pasos que faltan.",
        example: 'minutos = 95\nhoras = minutos // 60\nresto = minutos % 60\nprint(f"{horas} h y {resto} min")',
        explanation: "Cada hora contiene 60 minutos. // cuenta los grupos completos de 60; % obtiene lo que sobra. Con 95 minutos hay una hora completa y quedan 35 minutos.",
        concepts: ["División entera //", "Resto con %", "Combinar resultados"],
        goal: "Calcula cuántas horas completas y cuántos minutos sobran, y muéstralo en una sola línea.",
        starter: 'minutos = 135\n# Crea las variables horas y resto.\n# Sustituye este mensaje por una frase con ambos valores.\nprint("Aquí irá la duración")',
        hints: [
          "¿Cuántos grupos completos de 60 caben en 135? ¿Cuántos minutos quedan fuera de esos grupos?",
          "Guarda la división entera con // en horas y el resto con % en resto. Reutiliza minutos en ambos cálculos.",
          'Escribe horas = minutos // 60, resto = minutos % 60 y print(f"{horas} h y {resto} min"). Con 135 minutos debe aparecer 2 h y 15 min.'
        ],
        checks: ["Calculas horas completas", "Calculas los minutos restantes", "Muestras la conversión"],
        success: "Completaste las cuatro piezas: mensaje, presentación, gasto y duración. Ya puedes combinarlas en un pequeño plan escrito con Python.",
        lesson: {
          walkthrough: ["95 // 60 da 1: cabe una hora completa.", "95 % 60 da 35: esos son los minutos restantes.", "La f-string del ejemplo muestra 1 h y 35 min. En la misión usarás 135 minutos."],
          prediction: "¿Qué mostraría el ejemplo si minutos fuera 60?",
          answer: "1 h y 0 min. Hay una hora completa y no sobra ningún minuto.",
          reflection: "Prueba 59, 60 y 61 minutos. Explica por qué las horas cambian al llegar a 60 y el resto vuelve a cero.",
          extension: "Reúne un mensaje, la presentación ficticia, el gasto y la duración en un mismo programa. Copia tus soluciones anteriores y usa print() para presentar el plan. No es obligatorio para aprobar el nivel.",
          feedback: ["Crea horas usando minutos // 60. La división / puede dar decimales y no cuenta solo las horas completas.", "Crea resto usando minutos % 60. El operador % conserva los minutos que no forman otra hora.", "Muestra horas y resto juntos en una línea. Una f-string permite insertarlos entre llaves."]
        },
        validate(result, source) {
          const { minutos, horas, resto } = result.environment;
          const validos = typeof minutos === "number";
          return [
            validos && horas === Math.floor(minutos / 60) && uses(source, /\/\//),
            validos && resto === minutos % 60 && uses(source, /%/),
            validos && result.output.some((line) => line.includes(String(horas)) && line.includes(String(resto)))
          ];
        }
      }
    ]
  },
  {
    id: 2,
    title: "Decisiones y ciclos",
    description: "Condiciones, repeticiones y listas",
    stage: "Decisiones y ciclos",
    completionTitle: "Finalizaste las decisiones y ciclos de Python.",
    completionCopy: "Ya puedes elegir una respuesta, clasificar una temperatura, contar vueltas y recorrer los preparativos de una salida. Prueba los límites de tus condiciones antes del mini examen. En el próximo nivel modificarás listas y organizarás más datos.",
    approvedCopy: "Aprobaste el mini examen de decisiones y ciclos. Puedes repetirlo cuando quieras para repasar.",
    projects: [
      {
        id: 5,
        title: "Decide según una edad",
        shortTitle: "Mayoría de edad",
        duration: "12 min",
        difficulty: "Decisiones",
        file: "proyecto_05.py",
        summary: "Seguimos preparando la salida. Practica una regla inventada que clasifica a un personaje según su edad: el programa elige uno de dos mensajes. Usa datos ficticios, como en la presentación del primer nivel.",
        example: 'edad = 18\nif edad >= 18:\n    print(f"Tienes {edad} años: mayor de edad")\nelse:\n    print(f"Tienes {edad} años: menor de edad")',
        explanation: "if comprueba una condición; >= significa mayor o igual. Si se cumple, ejecuta su bloque. Si no, ejecuta else. Los dos puntos abren cada bloque y la sangría de cuatro espacios agrupa sus instrucciones.",
        concepts: ["Comparar con >=", "Bloques con sangría", "El camino alternativo con else"],
        goal: "Conserva los dos caminos, if y else. Deja edad en 20 y construye una frase que muestre ese valor y la palabra “mayor”. Después podrás probar otras edades ficticias.",
        starter: 'edad = 16\nif edad >= 18:\n    print("Mayor de edad")\nelse:\n    print("Menor de edad")',
        hints: [
          "Mira la salida del código inicial: ¿qué camino se ejecutó? ¿Qué dato falta en el mensaje?",
          "Cambia edad a 20. Para mostrar su valor, recuerda la f-string y las llaves del proyecto de presentación.",
          'Dentro del if escribe print(f"Tienes {edad} años: mayor de edad"). Mantén la sangría y el bloque else para las edades inferiores a 18.'
        ],
        checks: ["Usas if y else", "La edad es 20", "El mensaje incluye la edad y la palabra mayor"],
        success: "Tu programa elige entre dos caminos y explica la respuesta. Ahora añadirás una tercera posibilidad con elif.",
        lesson: {
          walkthrough: ["edad vale 18. La comparación 18 >= 18 es verdadera porque incluye la igualdad.", "Solo se ejecuta el print() del if: Tienes 18 años: mayor de edad.", "El bloque else queda sin ejecutar. Con edad = 17 se ejecutaría ese otro bloque."],
          prediction: "Si cambias la edad del ejemplo a 17, ¿aparecen los dos mensajes o solo uno?",
          answer: "Solo uno: Tienes 17 años: menor de edad. La condición es falsa, así que se ejecuta el bloque else.",
          reflection: "Prueba 17, 18 y 19. ¿Por qué 18 sigue el mismo camino que 19? Vuelve a 20 para completar la misión.",
          extension: "Después de los dos bloques, escribe un print() sin sangría con un mensaje de despedida. Prueba ambas ramas y observa que esa última instrucción se ejecuta en los dos casos.",
          feedback: ["Conserva una condición if y su alternativa else. Ambos encabezados terminan con dos puntos y sus instrucciones llevan sangría.", "Para esta misión edad debe valer 20. Puedes explorar 17, 18 y 19 y después volver al valor pedido.", "El mensaje del camino verdadero necesita el valor 20 y la palabra mayor. Usa {edad} dentro de una f-string para mostrar el dato."]
        },
        validate(result, source) {
          return [
            uses(source, /\bif\b/) && uses(source, /\belse\b/),
            result.environment.edad === 20,
            result.output.some((line) => line.includes("20") && /mayor/i.test(line))
          ];
        }
      },
      {
        id: 6,
        title: "Clasifica la temperatura",
        shortTitle: "Clasificador",
        duration: "15 min",
        difficulty: "Decisiones",
        file: "proyecto_06.py",
        summary: "Antes de salir, el grupo quiere un mensaje según la temperatura. En este ejercicio usarás tres categorías sencillas: menos de 10 °C, desde 10 hasta menos de 25 °C, y 25 °C o más.",
        example: 'temperatura = 18\nif temperatura < 10:\n    print("Hace frío")\nelif temperatura < 25:\n    print("Clima agradable")\nelse:\n    print("Hace calor")',
        explanation: "elif significa comprobar otra condición si las anteriores fallaron. Python revisa de arriba hacia abajo y ejecuta solo el primer bloque que corresponde. Al llegar al elif, ya sabemos que la temperatura no es menor que 10.",
        concepts: ["Encadenar con elif", "El orden de las condiciones", "Cerrar con else"],
        goal: "Completa if, elif y else: muestra “Hace frío” bajo 10, “Clima agradable” desde 10 hasta menos de 25 y “Hace calor” desde 25. Deja temperatura en 30 para completar la misión.",
        starter: 'temperatura = 5\nif temperatura < 10:\n    print("Hace frío")\nelse:\n    print("Hace calor")',
        hints: [
          "Prueba el código inicial con 18. ¿Qué respuesta da y qué categoría intermedia falta?",
          "Entre if y else, añade un elif que compare temperatura con 25. Su bloque debe mostrar exactamente Clima agradable.",
          'Añade elif temperatura < 25: y debajo, con cuatro espacios, print("Clima agradable"). Deja temperatura = 30: debe aparecer solo Hace calor.'
        ],
        checks: ["Usas elif y el mensaje “Clima agradable”", "La temperatura es 30", "La salida es “Hace calor”"],
        success: "Ya tienes tres respuestas posibles. Comprueba los límites 10 y 25 antes de pasar a las repeticiones.",
        lesson: {
          walkthrough: ["Con 18, temperatura < 10 es falso: se omite el primer bloque.", "18 < 25 es verdadero: se muestra Clima agradable.", "El else no se ejecuta. Cuando ninguna comparación anterior se cumple, ese bloque muestra Hace calor."],
          prediction: "Con temperatura = 25, ¿aparecerá Clima agradable o Hace calor?",
          answer: "Hace calor. La condición usa < 25, que no incluye 25. Como tampoco es menor que 10, se ejecuta else.",
          reflection: "Prueba 9, 10, 24 y 25. Deben aparecer, en orden: Hace frío, Clima agradable, Clima agradable y Hace calor. Después vuelve a 30.",
          extension: "Añade en cada bloque una segunda línea con un plan inventado para ese clima. Para completar la misión, conserva un único mensaje de clasificación; prueba esta ampliación en una copia después de completar.",
          feedback: ["Falta la categoría intermedia: usa elif y escribe Clima agradable respetando mayúsculas y espacios. Revisa también el límite 25.", "Deja temperatura en 30 para completar. Los otros valores sirven para comprobar tus decisiones antes de volver a 30.", "Con 30 debe salir una sola línea: Hace calor. Revisa el orden de las condiciones y que cada print() esté dentro de su bloque."]
        },
        validate(result, source) {
          return [
            uses(source, /\belif\b/) && uses(source, /Clima agradable/),
            result.environment.temperatura === 30,
            result.output.length === 1 && result.output[0].includes("Hace calor")
          ];
        }
      },
      {
        id: 7,
        title: "Construye un contador",
        shortTitle: "Contador",
        duration: "15 min",
        difficulty: "Ciclos",
        file: "proyecto_07.py",
        summary: "El plan incluye dar cinco vueltas por el parque. En lugar de escribir cinco mensajes a mano, usarás un ciclo: una instrucción que repite un bloque cambiando el número en cada vuelta.",
        example: 'for numero in range(1, 4):\n    print(f"Vuelta {numero}")',
        explanation: "for toma cada valor de range(inicio, fin) y lo guarda en numero. El inicio se incluye y el fin se excluye. El bloque con sangría se ejecuta una vez por valor; la f-string muestra el número de esa repetición.",
        concepts: ["Repetir con for", "Rangos con range()", "Usar la variable del ciclo"],
        goal: "Usa for y range() para mostrar exactamente cinco líneas: Vuelta 1, Vuelta 2, Vuelta 3, Vuelta 4 y Vuelta 5. Cambia el límite y el mensaje del código inicial.",
        starter: 'for numero in range(1, 3):\n    print(numero)',
        hints: [
          "El inicio ya es 1. Si el último valor de range() queda fuera, ¿qué límite permite llegar hasta 5?",
          "Usa 6 como límite final. Dentro del ciclo, una f-string combina Vuelta con el valor de numero.",
          'Escribe for numero in range(1, 6): y, en la línea siguiente con sangría, print(f"Vuelta {numero}").'
        ],
        checks: ["Usas for con range()", "Muestras cinco líneas", "Las líneas van de Vuelta 1 a Vuelta 5"],
        success: "Un solo bloque genera las cinco vueltas. Ahora recorrerás textos de una lista en lugar de números de un rango.",
        lesson: {
          walkthrough: ["range(1, 4) entrega 1, 2 y 3; no entrega 4.", "En cada repetición, numero toma el siguiente valor y se ejecuta el print() con sangría.", "El ejemplo muestra tres líneas: Vuelta 1, Vuelta 2 y Vuelta 3. Tu misión necesita cinco."],
          prediction: "¿Cuántas líneas mostraría el ejemplo con range(1, 1)?",
          answer: "Ninguna: el inicio coincide con el límite excluido, así que no hay valores que recorrer. El laboratorio puede avisar que no hay salida; eso no significa que el ciclo tenga un error de sintaxis.",
          reflection: "Compara range(1, 5) con range(1, 6). Predice la última vuelta de cada uno antes de ejecutar y deja cinco vueltas al terminar.",
          extension: "Añade después del ciclo un print() sin sangría que diga Recorrido terminado. Observa que aparece una sola vez. Hazlo en una copia tras completar: la misión pide exactamente cinco líneas.",
          feedback: ["Utiliza un ciclo for con range(). La idea es repetir el mismo bloque, no escribir cada vuelta por separado.", "Cuenta las líneas: necesitas cinco. Revisa que el rango vaya de 1 hasta 6 sin incluir 6 y que no haya mensajes extra.", "Incluye la palabra Vuelta y el valor de numero en cada mensaje. La primera línea debe ser Vuelta 1 y la última Vuelta 5."]
        },
        validate(result, source) {
          return [
            uses(source, /\bfor\b/) && uses(source, /range\s*\(/),
            result.output.length === 5,
            result.output.length === 5
              && result.output[0].includes("Vuelta 1")
              && result.output[4].includes("Vuelta 5")
          ];
        }
      },
      {
        id: 8,
        title: "Recorre una lista de tareas",
        shortTitle: "Lista de tareas",
        duration: "15 min",
        difficulty: "Ciclos",
        file: "proyecto_08.py",
        summary: "Cierra el nivel preparando una lista para la salida. Vas a mostrar cada tarea con un guion y contar cuántas hay. Esta vez el ciclo recorre textos: no necesitas un rango de números.",
        example: 'tareas = ["Elegir el lugar", "Acordar la hora"]\nfor tarea in tareas:\n    print("-", tarea)\nprint(f"Total: {len(tareas)} tareas")',
        explanation: "Los corchetes crean una lista; las comas separan sus elementos. for guarda cada elemento en tarea, en orden. len(tareas) cuenta los elementos. El último print() no lleva sangría: se ejecuta una vez, después del ciclo.",
        concepts: ["Crear listas con corchetes", "Recorrer con for", "Contar con len()"],
        goal: "Escribe al menos tres tareas, muestra cada una precedida por un guion y termina indicando cuántas hay.",
        starter: 'tareas = ["Elegir el lugar"]\n# Añade más preparativos a la lista.\nfor tarea in tareas:\n    print(tarea)\n# Muestra el total después del ciclo.',
        hints: [
          "El inicio tiene una sola tarea. ¿Qué otros dos preparativos necesita el grupo y dónde los guardarías?",
          'Añade textos separados por comas dentro de los corchetes. En el ciclo, print("-", tarea) pone el guion antes de cada tarea.',
          'Fuera del ciclo, sin sangría, agrega print(f"Total: {len(tareas)} tareas"). Con tres elementos debe aparecer Total: 3 tareas una sola vez.'
        ],
        checks: ["La lista tiene al menos tres tareas", "Muestras cada tarea con un guion", "Indicas cuántas tareas hay"],
        success: "Tu lista muestra los preparativos y su total. Ya puedes combinar datos, decisiones y repeticiones en un pequeño programa.",
        lesson: {
          walkthrough: ["La lista del ejemplo contiene dos textos. En la misión inventarás al menos tres tareas.", "El ciclo muestra - Elegir el lugar y después - Acordar la hora. La coma de print() separa sus argumentos con un espacio en la salida.", "Al salir del ciclo, len(tareas) vale 2 y el último print() muestra Total: 2 tareas una sola vez."],
          prediction: "Si añades una tercera tarea a la lista, ¿tienes que cambiar también el ciclo o escribir el total a mano?",
          answer: "No. El ciclo recorre todos los elementos y len(tareas) calcula el nuevo tamaño. Aparecerán tres tareas con guion y Total: 3 tareas.",
          reflection: "Añade una cuarta tarea y luego quítala. Comprueba que el total cambia solo. Si el total aparece varias veces, revisa la sangría del último print().",
          extension: "En una copia, combina un anuncio del primer nivel, la clasificación de temperatura y esta lista para presentar un plan completo. Predice qué mensaje cambiará al modificar la temperatura.",
          feedback: ["La variable tareas debe ser una lista con al menos tres elementos. Escribe cada texto entre comillas y sepáralos con comas dentro de los corchetes.", "Muestra todas las tareas con un guion al comienzo. Pon print(\"-\", tarea) dentro del ciclo para repetirlo con cada elemento.", "Usa len(tareas) para calcular el total y muéstralo después del ciclo. Evita escribir un número fijo: no se actualizaría al cambiar la lista."]
        },
        validate(result, source) {
          const tareas = result.environment.tareas;
          const conGuion = result.output.filter((line) => line.trim().startsWith("-"));
          return [
            isList(tareas) && tareas.length >= 3,
            isList(tareas) && conGuion.length >= tareas.length,
            isList(tareas) && uses(source, /len\s*\(/) && shows(result, tareas.length)
          ];
        }
      }
    ]
  },
  {
    id: 3,
    title: "Colecciones de datos",
    description: "Listas, orden, diccionarios e inventarios",
    stage: "Colecciones de datos",
    completionTitle: "Finalizaste las colecciones de datos de Python.",
    completionCopy: "Ya puedes actualizar una lista, resumir sus números, organizar datos con nombres y recorrer un inventario completo. Antes del mini examen, cambia un dato y explica qué partes del resultado se actualizan solas. En el próximo nivel aprenderás a reunir instrucciones en funciones reutilizables.",
    approvedCopy: "Aprobaste el mini examen de colecciones de datos. Puedes repetirlo cuando quieras para repasar.",
    projects: [
      {
        id: 9,
        title: "Administra una lista de compras",
        shortTitle: "Lista de compras",
        duration: "15 min",
        difficulty: "Listas",
        file: "proyecto_09.py",
        summary: "La lista de preparativos del nivel anterior puede cambiar. Antes de la salida, el grupo añade huevos para la comida y decide quitar la leche. Aprenderás a actualizar la misma lista y a comprobar cómo quedó.",
        example: 'compras = ["pan", "leche"]\ncompras.append("fruta")\ncompras.remove("leche")\nprint(compras)\nprint(len(compras))',
        explanation: "append() añade un elemento al final de la lista y remove() elimina la primera coincidencia. Ambas operaciones modifican compras. len(compras) cuenta su estado actual, así que no tienes que actualizar el total a mano.",
        concepts: ["Agregar con append()", "Quitar con remove()", "Contar el estado actual con len()"],
        goal: "Partiendo de pan y leche, añade “huevos”, quita “leche”, muestra la lista final y calcula cuántos productos quedan con len(). El resultado debe conservar pan antes de huevos.",
        starter: 'compras = ["pan", "leche"]\nprint(compras)',
        hints: [
          "Compara la lista inicial con la que pide la misión. ¿Qué producto entra y cuál sale? Haz cada cambio antes de imprimir.",
          "Una lista tiene métodos para modificarse: append() añade al final y remove() busca el valor que debe quitar. len() cuenta el resultado.",
          'Después de crear la lista, escribe compras.append("huevos") y compras.remove("leche"). Luego muestra compras y len(compras): deben quedar [\'pan\', \'huevos\'] y 2.'
        ],
        checks: ["Agregas huevos con append()", "Quitas leche con remove()", "Muestras la lista final y su tamaño"],
        success: "Actualizaste la lista y calculaste su tamaño real. En el siguiente proyecto resumirás una colección de números sin revisar cada valor a mano.",
        lesson: {
          walkthrough: ["compras empieza con pan y leche.", "append(\"fruta\") coloca fruta al final; después remove(\"leche\") encuentra y quita leche.", "El ejemplo muestra ['pan', 'fruta'] y luego 2, porque la lista actual contiene dos productos."],
          prediction: "Si añades fruta dos veces y después ejecutas remove(\"fruta\") una sola vez, ¿cuántas frutas quedarán?",
          answer: "Quedará una. append() puede añadir valores repetidos y remove() elimina solo la primera coincidencia que encuentra.",
          reflection: "Añade temporalmente otro producto antes de imprimir. ¿Cambia len(compras) sin modificar la línea que lo calcula? Vuelve a dejar solo pan y huevos para completar.",
          extension: "Después de completar, trabaja en una copia: muestra compras[0] para consultar el primer producto. Las posiciones de una lista comienzan en cero.",
          feedback: ["Todavía falta añadir huevos con append(). Hazlo después de crear compras y antes de mostrar el resultado.", "La leche sigue en la lista o no usaste remove(). Quita exactamente el texto leche antes de imprimir.", "La lista final debe ser pan y huevos, en ese orden, y la salida debe incluir su tamaño calculado. Usa print(compras) y print(len(compras))."]
        },
        validate(result, source) {
          const compras = result.environment.compras;
          return [
            uses(source, /\.append\s*\(/) && isList(compras) && compras.includes("huevos"),
            uses(source, /\.remove\s*\(/) && isList(compras) && !compras.includes("leche"),
            sameList(compras, ["pan", "huevos"]) && shows(result, 2)
          ];
        }
      },
      {
        id: 10,
        title: "Ordena y resume números",
        shortTitle: "Resumen de precios",
        duration: "18 min",
        difficulty: "Listas",
        file: "proyecto_10.py",
        summary: "El grupo comparó cuatro precios para la salida. Python puede ordenarlos y calcular un resumen, lo que evita buscar el menor, el mayor y el promedio manualmente cada vez que cambia la lista.",
        example: 'precios = [1500, 700, 1100]\nordenados = sorted(precios)\npromedio = sum(precios) / len(precios)\nprint(ordenados)\nprint(min(precios), max(precios))\nprint(f"Promedio: {promedio:.2f}")',
        explanation: "sorted() crea una lista ordenada sin cambiar precios. min() y max() buscan los extremos. sum() acumula los valores y len() indica cuántos hay; al dividirlos obtienes el promedio. :.2f muestra dos decimales.",
        concepts: ["Ordenar con sorted()", "Extremos con min() y max()", "Promediar con sum() y len()"],
        goal: "Conserva los cuatro precios iniciales. Muestra una lista nueva ordenada de menor a mayor, los valores mínimo y máximo, y el promedio 1210.00 con dos decimales.",
        starter: 'precios = [1200, 890, 2300, 450]\nprint(precios)',
        hints: [
          "Empieza por observar qué resultados pide la misión. ¿Qué función del ejemplo corresponde a ordenar y cuáles buscan los extremos?",
          "Guarda sorted(precios) en ordenados. Para el promedio, divide la suma de todos los valores por la cantidad de elementos.",
          'Usa ordenados = sorted(precios), promedio = sum(precios) / len(precios) y muestra ordenados, min(precios), max(precios) y f"Promedio: {promedio:.2f}".'
        ],
        checks: ["Muestras la lista ordenada", "Muestras el más barato y el más caro", "Muestras el promedio con dos decimales"],
        success: "Ordenaste y resumiste todos los precios con funciones que se adaptan a la lista. Ahora organizarás distintos tipos de datos bajo nombres propios.",
        lesson: {
          walkthrough: ["sorted(precios) produce [700, 1100, 1500], mientras precios conserva su orden original.", "min() encuentra 700 y max() encuentra 1500.", "sum() da 3300; len() da 3. Su división es 1100.00 al mostrarla con dos decimales."],
          prediction: "Si añades un cuarto precio de 2100, ¿el promedio quedará por debajo, igual o por encima de 1100?",
          answer: "Quedará por encima: la suma pasa a 5400 y la cantidad a 4, por lo que el nuevo promedio es 1350.00.",
          reflection: "Cambia temporalmente 450 por 4500. Predice qué valores del resumen cambiarán y cuáles se conservarán. Restaura la lista inicial al terminar.",
          extension: "Después de completar, muestra también precios para comprobar que sorted() no cambió la lista original. Compara las dos salidas.",
          feedback: ["Muestra el resultado de sorted(precios). Debe aparecer la lista [450, 890, 1200, 2300] en ese orden.", "Todavía falta mostrar los dos extremos. Usa min(precios) para 450 y max(precios) para 2300.", "Calcula el promedio con sum(precios) / len(precios) y muéstralo con dos decimales usando :.2f. El resultado esperado es 1210.00."]
        },
        validate(result) {
          return [
            shows(result, "[450, 890, 1200, 2300]"),
            shows(result, 450) && shows(result, 2300),
            shows(result, "1210.00")
          ];
        }
      },
      {
        id: 11,
        title: "Guarda datos con diccionarios",
        shortTitle: "Diccionarios",
        duration: "18 min",
        difficulty: "Diccionarios",
        file: "proyecto_11.py",
        summary: "Una lista funciona bien para datos del mismo tipo. Para describir el curso que seguirá el grupo, conviene relacionar cada dato con un nombre: nombre, horas y nivel. Eso es un diccionario.",
        example: 'curso = {"nombre": "Python", "horas": 12}\ncurso["nivel"] = "inicial"\nprint(curso)\nprint(curso.get("profesor", "sin datos"))',
        explanation: "Un diccionario guarda pares de clave y valor entre llaves. curso[\"nivel\"] asigna una clave nueva. get() consulta una clave de forma segura y devuelve el valor alternativo cuando esa clave no existe.",
        concepts: ["Pares clave y valor", "Agregar claves nuevas", "Consultar seguro con get()"],
        goal: "Añade al diccionario curso la clave “nivel” con el valor “inicial”. Muestra el diccionario completo y consulta la clave inexistente “profesor” con get(), usando “sin datos” como respuesta alternativa.",
        starter: 'curso = {"nombre": "Python", "horas": 12}\nprint(curso["nombre"])',
        hints: [
          "El diccionario ya contiene nombre y horas. ¿Cómo relaciona el ejemplo una clave nueva con su valor?",
          "Asigna nivel con corchetes. Para consultar profesor sin detener el programa, usa get() con dos argumentos: la clave y la respuesta alternativa.",
          'Escribe curso["nivel"] = "inicial", luego print(curso) y print(curso.get("profesor", "sin datos")).'
        ],
        checks: ["Agregas la clave nivel", "Muestras el diccionario completo", "Usas get() con un valor por defecto"],
        success: "Organizaste datos distintos bajo claves claras y resolviste una consulta ausente de forma segura. El cierre del nivel recorrerá todos los pares de un diccionario.",
        lesson: {
          walkthrough: ["curso comienza con las claves nombre y horas.", "La asignación curso[\"nivel\"] = \"inicial\" agrega un tercer par sin reemplazar los anteriores.", "Como profesor no existe, get(\"profesor\", \"sin datos\") devuelve sin datos y el programa continúa."],
          prediction: "Si el diccionario ya incluyera \"profesor\": \"Luna\", ¿qué devolvería la misma llamada a get()?",
          answer: "Devolvería Luna. El valor alternativo sin datos se usa solamente cuando la clave solicitada no existe.",
          reflection: "Añade temporalmente la clave profesor y repite la consulta. Observa cómo cambia el resultado sin modificar get(). Después quita esa clave para completar la misión original.",
          extension: "En una copia, actualiza curso[\"horas\"] a 16 y muestra el diccionario. La misma sintaxis agrega una clave nueva o reemplaza el valor de una existente.",
          feedback: ["El diccionario todavía necesita la clave nivel con el valor inicial. Agrégala con una asignación mediante corchetes.", "Muestra curso completo después de añadir nivel. Imprimir solo curso[\"nombre\"] no permite comprobar todas las claves.", "Consulta una clave inexistente con get() y proporciona sin datos como segundo argumento. Luego muestra el valor devuelto."]
        },
        validate(result, source) {
          const curso = result.environment.curso;
          const tieneNivel = curso && typeof curso === "object" && curso.nivel === "inicial";
          return [
            Boolean(tieneNivel),
            result.output.some((line) => line.includes("'nombre'") && line.includes("'nivel'")),
            uses(source, /\.get\s*\(/) && shows(result, "sin datos")
          ];
        }
      },
      {
        id: 12,
        title: "Recorre un inventario",
        shortTitle: "Inventario",
        duration: "20 min",
        difficulty: "Diccionarios",
        file: "proyecto_12.py",
        summary: "Antes de una actividad tecnológica, necesitas revisar teclado, mouse y monitor. Recorrer el inventario permite informar cada cantidad, detectar lo agotado y sumar las unidades sin escribir una instrucción distinta por producto.",
        example: 'stock = {"teclado": 2, "mouse": 0}\ntotal = 0\nfor producto, cantidad in stock.items():\n    if cantidad == 0:\n        print(producto, "agotado")\n    else:\n        print(producto, cantidad)\n    total += cantidad\nprint(f"Total: {total} unidades")',
        explanation: "items() entrega cada clave y su valor; el ciclo los guarda en producto y cantidad. La condición identifica el cero. total empieza en 0 y += añade cada cantidad. El print() final queda fuera del ciclo para aparecer una sola vez.",
        concepts: ["Recorrer con items()", "Repartir clave y valor", "Acumular dentro del ciclo"],
        goal: "Recorre stock con items(). Para cada producto, muestra “agotado” si su cantidad es 0 o muestra su cantidad en caso contrario. Acumula las cantidades y termina con “Total: 8 unidades”.",
        starter: 'stock = {"teclado": 3, "mouse": 0, "monitor": 5}\nfor producto in stock:\n    print(producto)',
        hints: [
          "El ciclo inicial recibe solo las claves. ¿Qué método del ejemplo permite obtener producto y cantidad al mismo tiempo?",
          "Crea total = 0 antes del ciclo. Dentro, usa if cantidad == 0 para el aviso y else para mostrar las cantidades disponibles. Suma cada cantidad después de decidir el mensaje.",
          'Usa for producto, cantidad in stock.items():, total += cantidad dentro del ciclo y print(f"Total: {total} unidades") fuera de él. Con el stock inicial, mouse debe aparecer agotado y el total debe ser 8.'
        ],
        checks: ["Recorres el inventario con items()", "Avisas los productos agotados", "Muestras el total de unidades"],
        success: "Recorriste todos los pares, tomaste una decisión para cada producto y acumulaste un total. Ya puedes combinar listas, diccionarios, ciclos y condiciones en un mismo programa.",
        lesson: {
          walkthrough: ["items() entrega primero teclado y 2, y después mouse y 0.", "La condición muestra teclado 2; para mouse, el cero activa el mensaje mouse agotado.", "total += cantidad acumula 2 y luego 0. El print() sin sangría muestra Total: 2 unidades al terminar el ciclo."],
          prediction: "Si cambias mouse de 0 a 4, ¿qué mensaje y qué total mostrará el ejemplo?",
          answer: "Mostrará mouse 4 en lugar de mouse agotado, y el total será 6 unidades. El mismo dato participa en la decisión y en la suma.",
          reflection: "Prueba temporalmente con todas las cantidades en cero. ¿Cuántos avisos aparecen y cuál es el total? Restaura 3, 0 y 5 para completar.",
          extension: "Después de completar, añade disponibles = 0 y aumenta ese contador solo en el bloque else. Al final muestra cuántos tipos de producto tienen unidades.",
          feedback: ["Recorre stock con items() para obtener producto y cantidad en cada vuelta. Un ciclo que usa solo for producto in stock no entrega la cantidad en una segunda variable.", "Detecta cantidad == 0 y muestra el nombre mouse junto con agotado. Conserva un camino alternativo para los productos disponibles.", "Acumula todas las cantidades en total, empezando en 0, y muéstralo después del ciclo. El stock inicial suma 8 unidades."]
        },
        validate(result, source) {
          return [
            uses(source, /\.items\s*\(\s*\)/),
            result.output.some((line) => /agotad/i.test(line) && line.toLowerCase().includes("mouse")),
            shows(result, 8)
          ];
        }
      }
    ]
  },
  {
    id: 4,
    title: "Funciones propias",
    description: "Reutilizar lógica con parámetros y resultados",
    stage: "Funciones propias",
    completionTitle: "Finalizaste las funciones propias de Python.",
    completionCopy: "Ya puedes crear funciones con parámetros, ofrecer valores predeterminados, procesar listas y analizar textos. Antes del mini examen, llama una función con datos nuevos y comprueba que no tuviste que reescribir su lógica. En el nivel final combinarás todo en programas más completos.",
    approvedCopy: "Aprobaste el mini examen de funciones propias. Puedes repetirlo cuando quieras para repasar.",
    projects: [
      {
        id: 13,
        title: "Crea una función para saludar",
        shortTitle: "Función saludar",
        duration: "15 min",
        difficulty: "Funciones",
        file: "proyecto_13.py",
        summary: "El grupo necesita enviar el mismo saludo a distintas personas. Una función permite definir la forma del mensaje una sola vez y cambiar únicamente el nombre en cada llamada.",
        example: 'def saludar(nombre):\n    return f"Hola, {nombre}"\n\nprint(saludar("Luna"))\nprint(saludar("Nico"))',
        explanation: "def crea una función llamada saludar. El parámetro nombre recibe un valor distinto en cada llamada. return entrega el texto construido y print() muestra ese resultado. Definir la función no la ejecuta: hay que llamarla.",
        concepts: ["Definir con def", "Recibir un parámetro", "Entregar con return"],
        goal: "Completa saludar(nombre) para que devuelva “Hola, ” seguido del nombre recibido. Llama la función con dos nombres ficticios distintos y muestra ambos resultados.",
        starter: 'def saludar(nombre):\n    return nombre\n\nprint(saludar("Ada"))',
        hints: [
          "La función ya recibe nombre. ¿Qué debería añadir al valor antes de devolverlo para formar un saludo?",
          "Construye el resultado dentro de return mediante una f-string o uniendo dos textos. Después reutiliza la función con otro argumento.",
          'Usa return f"Hola, {nombre}". Fuera de la función, muestra saludar("Ada") y saludar("Grace") en dos llamadas separadas.'
        ],
        checks: ["Defines la función saludar", "Devuelve el saludo con el nombre", "La pruebas con dos nombres distintos"],
        success: "Definiste el saludo una vez y lo reutilizaste con datos distintos. Ahora añadirás un valor predeterminado para el caso más común.",
        lesson: {
          walkthrough: ["def guarda las instrucciones de saludar; todavía no produce una salida.", "saludar(\"Luna\") asigna Luna al parámetro nombre y return entrega Hola, Luna.", "La segunda llamada usa Nico sin duplicar la lógica de la función."],
          prediction: "Si cambias solo la segunda llamada por saludar(\"Ada\"), ¿cuál de las dos líneas cambia?",
          answer: "Cambia únicamente la segunda: la primera llamada conserva Luna. Cada llamada recibe su propio argumento.",
          reflection: "Añade temporalmente una tercera llamada. ¿Tuviste que modificar el cuerpo de la función? Déjala con dos nombres distintos para completar.",
          extension: "Después de completar, añade un parámetro momento y devuelve un saludo como Hola, Luna. Buenas tardes. Esta ampliación cambia el contrato de la función, así que pruébala en una copia.",
          feedback: ["Define saludar con un parámetro entre paréntesis. Conserva def, los dos puntos y la sangría del cuerpo.", "La salida debe comenzar con Hola, y contener el nombre recibido. Construye ese texto en return y muestra el valor que devuelve la función.", "Llama saludar() al menos dos veces con nombres diferentes. Reutilizar la función evita repetir la construcción del mensaje."]
        },
        validate(result, source) {
          const saludos = result.output.filter((line) => /^hola,\s*\S/i.test(line.trim()));
          return [
            uses(source, /def\s+saludar\s*\(\s*\w+\s*\)/),
            saludos.length >= 1,
            saludos.length >= 2 && new Set(saludos).size >= 2
          ];
        }
      },
      {
        id: 14,
        title: "Calcula un precio final",
        shortTitle: "Función descuento",
        duration: "18 min",
        difficulty: "Funciones",
        file: "proyecto_14.py",
        summary: "Para reservar la actividad se aplica normalmente un descuento del 10 %, aunque a veces existe una promoción especial. Un parámetro predeterminado cubre ambos casos con la misma función.",
        example: 'def precio_final(precio, descuento=10):\n    return precio - precio * descuento / 100\n\nprint(precio_final(2000))\nprint(precio_final(2000, 25))',
        explanation: "descuento=10 se usa cuando la llamada envía solo el precio. Si la llamada incluye un segundo argumento, ese valor reemplaza al predeterminado. La función calcula y devuelve el precio; quien la llama decide cómo mostrarlo.",
        concepts: ["Varios parámetros", "Valores por defecto", "Probar distintos casos"],
        goal: "Define descuento=10 y calcula el precio menos su porcentaje de descuento. Muestra precio_final(1000) sin indicar descuento y precio_final(1000, 50). Deben resultar 900.0 y 500.0.",
        starter: 'def precio_final(precio, descuento):\n    return precio\n\nprint(precio_final(1000, 10))',
        hints: [
          "Observa la definición inicial: ¿qué parámetro debería funcionar aunque la llamada no lo envíe? Compara con el ejemplo.",
          "Asigna 10 al parámetro descuento en la definición. Dentro de return, resta al precio el porcentaje calculado.",
          "Define precio_final(precio, descuento=10) y devuelve precio - precio * descuento / 100. Prueba precio_final(1000) y precio_final(1000, 50)."
        ],
        checks: ["El descuento tiene valor por defecto", "Muestras el precio con el descuento por defecto", "Muestras el precio con 50 % de descuento"],
        success: "La misma función resuelve el descuento habitual y uno especial. A continuación recibirás una lista completa como argumento.",
        lesson: {
          walkthrough: ["precio_final(2000) no envía descuento, por lo que se usa 10 y el resultado es 1800.0.", "precio_final(2000, 25) reemplaza 10 por 25 y devuelve 1500.0.", "El valor predeterminado simplifica el caso habitual sin impedir otros descuentos."],
          prediction: "¿Qué resultado entrega precio_final(2000, 0)? ¿Se utiliza el 10 predeterminado?",
          answer: "Entrega 2000.0. Como la llamada sí envía 0, ese valor reemplaza al 10 predeterminado.",
          reflection: "Prueba temporalmente descuentos de 0, 10 y 100. Predice cada precio final y vuelve a las dos llamadas solicitadas.",
          extension: "En una copia, agrega un parámetro envio=0 y súmalo después de aplicar el descuento. Los parámetros predeterminados deben quedar después de los obligatorios.",
          feedback: ["El parámetro descuento necesita el valor predeterminado 10 en la definición. Así puedes llamar la función enviando solo el precio.", "La primera llamada debe usar 1000 sin indicar el descuento y mostrar 900. Revisa que return reste precio * descuento / 100.", "Añade una segunda llamada con precio 1000 y descuento 50. Su resultado debe ser 500."]
        },
        validate(result, source) {
          return [
            uses(source, /def\s+precio_final\s*\([^)]*descuento\s*=\s*10/),
            shows(result, "900"),
            shows(result, "500")
          ];
        }
      },
      {
        id: 15,
        title: "Obtén un promedio",
        shortTitle: "Promedio de notas",
        duration: "18 min",
        difficulty: "Funciones",
        file: "proyecto_15.py",
        summary: "Para comparar valoraciones de distintas actividades, conviene reutilizar un mismo cálculo. Una función puede recibir cada lista completa y devolver un solo promedio.",
        example: 'def promedio(valores):\n    return sum(valores) / len(valores)\n\nprint(f"{promedio([5, 6, 7]):.2f}")\nprint(f"{promedio([4, 6]):.2f}")',
        explanation: "La lista recibida queda disponible mediante el parámetro. sum() suma sus valores y len() cuenta cuántos contiene; dividir ambos devuelve el promedio. La función calcula, mientras la f-string decide mostrar dos decimales.",
        concepts: ["Recibir una lista", "Combinar sum() y len()", "Reutilizar con datos distintos"],
        goal: "Haz que promedio(notas) calcule sum(notas) / len(notas). Reutilízala con [4, 5, 6, 7] y [6, 7], mostrando respectivamente 5.50 y 6.50.",
        starter: 'def promedio(notas):\n    return 0\n\nprint(promedio([4, 5, 6, 7]))',
        hints: [
          "La función recibe todos los valores en notas. ¿Qué dos funciones usaste en el resumen de precios para sumar y contar?",
          "Divide sum(notas) por len(notas) dentro de return. Llama la función una vez por cada lista.",
          'Devuelve sum(notas) / len(notas) y muestra f"{promedio([4, 5, 6, 7]):.2f}" y f"{promedio([6, 7]):.2f}".'
        ],
        checks: ["Defines la función promedio", "Muestras 5.50 para la primera lista", "Muestras 6.50 para la segunda lista"],
        success: "Reutilizaste el mismo cálculo con dos listas. El último proyecto del nivel aplicará una función a un texto.",
        lesson: {
          walkthrough: ["La primera llamada recibe 5, 6 y 7: sum() da 18 y len() da 3.", "18 / 3 devuelve 6. La f-string lo muestra como 6.00.", "La segunda llamada procesa una lista distinta con el mismo cuerpo y muestra 5.00."],
          prediction: "Si llamas promedio([8]), ¿qué devuelve?",
          answer: "Devuelve 8.0: la suma es 8 y la lista contiene un elemento. Al mostrarlo con :.2f verías 8.00.",
          reflection: "Añade temporalmente una tercera lista con un solo valor. Comprueba el resultado y luego conserva únicamente las dos llamadas de la misión.",
          extension: "En una copia, guarda el resultado en una variable antes de mostrarlo. Esto permite reutilizar el promedio en otro cálculo sin volver a llamar la función.",
          feedback: ["Define promedio y devuelve una división que use sum() y len() sobre el parámetro. Devolver 0 todavía no calcula la lista.", "Llama la función con [4, 5, 6, 7] y muestra el resultado con dos decimales: 5.50.", "Reutiliza la función con [6, 7] y muestra 6.50. No cambies el cuerpo para cada lista."]
        },
        validate(result, source) {
          return [
            uses(source, /def\s+promedio\s*\(\s*\w+\s*\)/) && uses(source, /sum\s*\(/) && uses(source, /len\s*\(/),
            shows(result, "5.50"),
            shows(result, "6.50")
          ];
        }
      },
      {
        id: 16,
        title: "Analiza una frase",
        shortTitle: "Analizador de texto",
        duration: "20 min",
        difficulty: "Texto",
        file: "proyecto_16.py",
        summary: "Para preparar un anuncio breve, quieres saber cuántas palabras contiene y obtener una versión destacada. Los textos también ofrecen operaciones que puedes combinar dentro y fuera de una función.",
        example: 'frase = "la salida comienza temprano"\n\ndef contar_palabras(texto):\n    return len(texto.split())\n\nprint(contar_palabras(frase))\nprint(frase.upper())',
        explanation: "split() separa el texto por espacios y devuelve una lista de palabras. len() cuenta esa lista. upper() crea una versión en mayúsculas sin modificar la frase original.",
        concepts: ["Dividir con split()", "Contar palabras", "Transformar con upper()"],
        goal: "Completa contar_palabras(texto) usando split() y len(). Para la frase inicial, muestra el total 4 y, en otra línea, APRENDER PYTHON ABRE PUERTAS.",
        starter: 'frase = "aprender python abre puertas"\n\ndef contar_palabras(texto):\n    return 0\n\nprint(contar_palabras(frase))',
        hints: [
          "Piensa qué debe recibir len(): ¿el texto completo o la lista de palabras que produce split()?",
          "Aplica split() al parámetro texto y cuenta el resultado. Fuera de la función, upper() crea la versión en mayúsculas.",
          "Devuelve len(texto.split()). Después muestra contar_palabras(frase) y frase.upper(); deben aparecer 4 y la frase completa en mayúsculas."
        ],
        checks: ["Usas split() dentro de la función", "Muestras el total de palabras", "Muestras la frase en mayúsculas"],
        success: "Combinaste una función propia con métodos de texto. Ya tienes las herramientas necesarias para integrar colecciones, decisiones y funciones.",
        lesson: {
          walkthrough: ["split() convierte la frase del ejemplo en cuatro elementos: la, salida, comienza y temprano.", "len() cuenta esos elementos y la función devuelve 4.", "upper() produce LA SALIDA COMIENZA TEMPRANO, mientras frase conserva su escritura original."],
          prediction: "¿Qué devuelve contar_palabras(\"hola mundo\") si hay varios espacios entre ambas palabras?",
          answer: "Devuelve 2. split() sin argumentos agrupa los espacios y conserva solamente las palabras.",
          reflection: "Prueba una frase inventada de dos palabras y otra de cinco. Predice el total antes de ejecutar y restaura la frase inicial.",
          extension: "Después de completar, crea una función presentar_frase(texto) que devuelva el texto en mayúsculas. Así tanto el conteo como la transformación quedan reutilizables.",
          feedback: ["Dentro de contar_palabras usa split() sobre el parámetro texto y cuenta la lista resultante con len().", "Muestra el valor devuelto por contar_palabras(frase). La frase inicial contiene cuatro palabras.", "Muestra también frase.upper() para obtener toda la frase en mayúsculas, no solo una palabra."]
        },
        validate(result, source) {
          const frase = result.environment.frase;
          const total = typeof frase === "string" ? frase.trim().split(/\s+/).length : 0;
          return [
            uses(source, /def\s+contar_palabras\s*\(/) && uses(source, /\.split\s*\(/),
            total > 0 && shows(result, total),
            typeof frase === "string" && shows(result, frase.toUpperCase())
          ];
        }
      }
    ]
  },
  {
    id: 5,
    title: "Integración final",
    description: "Filtros, errores y proyectos completos",
    stage: "Integración final",
    completionTitle: "Finalizaste la integración final de Python.",
    completionCopy: "Terminaste los veinte proyectos: filtraste datos, manejaste una conversión inválida, construiste un reporte y reuniste todo en un gestor de tareas. Revisa tu proyecto final y aprueba el último mini examen para cerrar la ruta completa.",
    approvedCopy: "Aprobaste los cinco mini exámenes de la ruta. Completaste Python de principio a fin.",
    projects: [
      {
        id: 17,
        title: "Filtra con una comprensión",
        shortTitle: "Comprensión de listas",
        duration: "18 min",
        difficulty: "Integración",
        file: "proyecto_17.py",
        summary: "El plan reúne cantidades de distintos grupos y solo necesitas revisar las mayores a 10. Una comprensión crea la lista filtrada sin modificar los datos originales.",
        example: 'numeros = [5, 12, 20, 7]\ngrandes = [n for n in numeros if n > 10]\nprint(grandes)\nprint(len(grandes))',
        explanation: "La comprensión se lee como: guarda n, por cada n en numeros, si n > 10. Produce una lista nueva y conserva el orden de los valores aceptados. len() cuenta el resultado filtrado.",
        concepts: ["Construir listas en una línea", "Filtrar con una condición", "Leer el resultado con len()"],
        goal: "Usa una comprensión para crear grandes con los valores estrictamente mayores a 10. Muestra [12, 30, 18] y calcula con len() que contiene 3 elementos.",
        starter: 'numeros = [12, 7, 30, 4, 18]\nprint(numeros)',
        hints: [
          "Recorre mentalmente la lista: ¿cuáles valores cumplen ser mayores que 10? El 10 exacto no se incluiría.",
          "Una comprensión coloca entre corchetes el valor, el recorrido y la condición. Guarda el resultado en una variable nueva llamada grandes.",
          "Escribe grandes = [n for n in numeros if n > 10]. Luego muestra grandes y len(grandes): deben aparecer [12, 30, 18] y 3."
        ],
        checks: ["Usas una comprensión de listas", "grandes contiene 12, 30 y 18", "Indicas que son 3"],
        success: "Filtraste una lista sin alterar la original. Ahora protegerás un cálculo frente a un dato que no se puede convertir.",
        lesson: {
          walkthrough: ["La comprensión examina 5, 12, 20 y 7 en ese orden.", "Solo 12 y 20 cumplen n > 10, por lo que grandes queda [12, 20].", "len(grandes) devuelve 2. La lista numeros mantiene sus cuatro valores."],
          prediction: "Si la lista contiene 10, ¿ese valor pasa el filtro n > 10?",
          answer: "No. > exige que el valor sea mayor; 10 es igual. Para incluirlo habría que usar >= 10.",
          reflection: "Cambia temporalmente la condición a n >= 10 y añade 10 a numeros. Predice la diferencia y después restaura la misión.",
          extension: "Después de completar, crea pares = [n for n in numeros if n % 2 == 0] y compara ambas listas filtradas.",
          feedback: ["Crea grandes con una comprensión entre corchetes que incluya for e in. Un print() de numeros no construye una lista nueva.", "Filtra con n > 10 y conserva el orden original. grandes debe quedar exactamente [12, 30, 18].", "Muestra len(grandes) para calcular cuántos valores pasaron el filtro. El resultado debe ser 3."]
        },
        validate(result, source) {
          return [
            uses(source, /\[[^\]]*\bfor\b[^\]]*\bin\b[^\]]*\]/),
            sameList(result.environment.grandes, [12, 30, 18]),
            shows(result, 3)
          ];
        }
      },
      {
        id: 18,
        title: "Maneja errores con try",
        shortTitle: "Manejo de errores",
        duration: "20 min",
        difficulty: "Integración",
        file: "proyecto_18.py",
        summary: "Al registrar cantidades, un texto inesperado no debería perder la suma de los datos correctos. try y except permiten detectar esa conversión fallida, informar cuál fue y continuar.",
        example: 'datos = ["8", "error", "2"]\ntotal = 0\nfor dato in datos:\n    try:\n        total += int(dato)\n    except ValueError:\n        print("Dato inválido:", dato)\nprint(total)',
        explanation: "try intenta convertir cada texto con int(). Si esa conversión produce ValueError, except muestra el aviso y el ciclo continúa. El total solo aumenta en las vueltas que pudieron convertirse.",
        concepts: ["Proteger con try", "Capturar ValueError", "Continuar después del error"],
        goal: "Recorre 12, hola y 30. Conserva try y except para que el programa continúe, muestra “Dato inválido: hola” cuando falle la conversión y termina mostrando el total 42.",
        starter: 'datos = ["12", "hola", "30"]\ntotal = 0\n\nfor dato in datos:\n    try:\n        total += int(dato)\n    except ValueError:\n        print("Revisa este dato")\n\nprint(total)',
        hints: [
          "El programa ya continúa y suma 42. Observa el aviso: ¿permite saber cuál elemento causó el problema?",
          "Dentro de except, muestra tanto las palabras Dato inválido como la variable dato. Esa variable todavía contiene el texto que falló.",
          'Sustituye el aviso por print("Dato inválido:", dato). Deben aparecer Dato inválido: hola y, al final, 42.'
        ],
        checks: ["Usas try y except", "Avisas del dato inválido", "El total es 42"],
        success: "El programa conserva los datos válidos, explica cuál falló y llega al total. El siguiente proyecto convertirá un diccionario en un reporte legible.",
        lesson: {
          walkthrough: ["int(\"8\") funciona y total pasa de 0 a 8.", "int(\"error\") produce ValueError; except muestra el dato y evita que el programa se detenga.", "La última conversión suma 2. El ejemplo termina con un total de 10."],
          prediction: "Si datos contiene dos textos inválidos, ¿cuántas veces se ejecuta except?",
          answer: "Dos veces, una por cada conversión fallida. El ciclo continúa después de cada aviso.",
          reflection: "Añade temporalmente otro texto inválido y un número. Comprueba que aparezca otro aviso y que el número sí se sume; luego restaura la lista inicial.",
          extension: "Después de completar, crea una variable errores = 0 antes del ciclo y auméntala dentro de except. Muéstrala junto al total.",
          feedback: ["Conserva try y except dentro del ciclo para proteger cada conversión. Así un dato inválido no detiene las vueltas siguientes.", "El aviso debe incluir Dato inválido y el valor hola. Muestra la variable dato dentro de except para identificar lo que falló.", "Suma solo las conversiones válidas y muestra total después del ciclo. 12 + 30 debe dar 42."]
        },
        validate(result, source) {
          return [
            uses(source, /\btry\s*:/) && uses(source, /\bexcept\b/),
            result.output.some((line) => /inv[áa]lid/i.test(line) && line.includes("hola")),
            result.environment.total === 42 && shows(result, 42)
          ];
        }
      },
      {
        id: 19,
        title: "Arma un reporte de ventas",
        shortTitle: "Reporte de ventas",
        duration: "22 min",
        difficulty: "Integración",
        file: "proyecto_19.py",
        summary: "Un pequeño reporte de ventas debe responder dos preguntas: qué día tuvo el monto mayor y cuánto se vendió en total. Combinarás un diccionario, un ciclo y una función para producirlo.",
        example: 'ventas = {"lunes": 50, "martes": 90}\n\ndef mejor_dia(datos):\n    dia = ""\n    monto = 0\n    for clave, valor in datos.items():\n        if valor > monto:\n            dia = clave\n            monto = valor\n    return f"El mejor día fue {dia} con {monto}"\n\nprint(mejor_dia(ventas))\nprint(sum(ventas.values()))',
        explanation: "La función recorre los pares con items() y conserva el mejor día encontrado hasta ese momento. return entrega el mensaje. Fuera de la función, values() obtiene los montos y sum() calcula el total.",
        concepts: ["Recorrer y comparar", "Devolver el resultado", "Presentar el reporte"],
        goal: "Completa mejor_dia(datos) para recorrer las ventas y devolver un mensaje con martes y 340. Muestra ese reporte y, en otra línea, el total 550 calculado desde ventas.values().",
        starter: 'ventas = {"lunes": 120, "martes": 340, "miercoles": 90}\n\ndef mejor_dia(datos):\n    return ""\n\nprint(mejor_dia(ventas))',
        hints: [
          "La función debe recordar dos datos mientras recorre el diccionario: la clave ganadora y su monto. ¿Con qué valores podrían comenzar?",
          "Recorre datos.items(). Cuando valor sea mayor que monto, actualiza monto y dia. Después del ciclo, devuelve una frase con ambos.",
          'Inicia dia = "" y monto = 0; actualízalos dentro de if valor > monto y devuelve f"El mejor día fue {dia} con {monto}". Fuera, muestra sum(ventas.values()).'
        ],
        checks: ["Defines la función mejor_dia", "El reporte indica martes y 340", "Muestras el total 550"],
        success: "Transformaste varios datos en dos conclusiones claras. El proyecto final reunirá estas técnicas en un gestor de tareas.",
        lesson: {
          walkthrough: ["Al revisar lunes, 50 supera al monto inicial 0: lunes queda como mejor día.", "Martes tiene 90, supera 50 y reemplaza el resultado anterior.", "La función devuelve El mejor día fue martes con 90; sum(ventas.values()) muestra 140."],
          prediction: "Si agregas miércoles con 80 al ejemplo, ¿cambia el mejor día? ¿Cambia el total?",
          answer: "El mejor día sigue siendo martes con 90, pero el total aumenta de 140 a 220.",
          reflection: "Cambia temporalmente el monto del lunes a 100. Predice las dos líneas del reporte y restaura los datos de la misión.",
          extension: "Después de completar, crea una función total_ventas(datos) que devuelva sum(datos.values()) y úsala para la segunda línea.",
          feedback: ["Define mejor_dia(datos) y llámala con ventas. La función debe devolver el resultado después de revisar el diccionario.", "El mensaje debe incluir martes y 340. Recorre datos.items() y actualiza el día solo cuando encuentres un monto mayor.", "Muestra también el total 550. Puedes calcularlo con sum(ventas.values()) fuera de la función."]
        },
        validate(result, source) {
          return [
            uses(source, /def\s+mejor_dia\s*\(/),
            result.output.some((line) => line.includes("martes") && line.includes("340")),
            shows(result, 550)
          ];
        }
      },
      {
        id: 20,
        title: "Proyecto final: gestor de tareas",
        shortTitle: "Proyecto final",
        duration: "30 min",
        difficulty: "Proyecto",
        file: "proyecto_20.py",
        summary: "El cierre de la ruta reúne una lista de diccionarios, una función, ciclos, condiciones y cálculos. Crearás un resumen de avance y una lista de pendientes a partir de los mismos datos.",
        example: 'tareas = [\n    {"nombre": "Reservar", "hecha": True},\n    {"nombre": "Confirmar hora", "hecha": False}\n]\n\ndef resumen(items):\n    hechas = 0\n    for tarea in items:\n        if tarea["hecha"]:\n            hechas += 1\n    porcentaje = int(hechas / len(items) * 100)\n    print(f"Completadas {hechas} de {len(items)} ({porcentaje}%)")\n    for tarea in items:\n        if not tarea["hecha"]:\n            print("-", tarea["nombre"])\n\nresumen(tareas)',
        explanation: "Cada diccionario representa una tarea y la lista forma el conjunto. La función cuenta los valores True, calcula el porcentaje y recorre nuevamente la lista para mostrar solo los nombres pendientes.",
        concepts: ["Listas de diccionarios", "Contar con condiciones", "Reportar el avance"],
        goal: "Completa resumen(items) y llámala con tareas. Debe mostrar “Completadas 1 de 3 (33%)” y después “- Practicar” y “- Repasar”, una pendiente por línea.",
        starter: 'tareas = [\n    {"nombre": "Leer la guía", "hecha": True},\n    {"nombre": "Practicar", "hecha": False},\n    {"nombre": "Repasar", "hecha": False}\n]\n\ndef resumen(items):\n    print(len(items))\n\nresumen(tareas)',
        hints: [
          "Separa el problema en dos resultados: primero cuenta las tareas hechas; después muestra únicamente las que no lo están.",
          "Inicia hechas en 0 y recorre items. Aumenta el contador cuando tarea[\"hecha\"] sea verdadero. Usa ese total para calcular el porcentaje.",
          'Calcula int(hechas / len(items) * 100), muestra el resumen con una f-string y haz otro recorrido: si not tarea["hecha"], usa print("-", tarea["nombre"]).'
        ],
        checks: ["Defines resumen() y la llamas", "Muestras “1 de 3” con su porcentaje", "Listas las dos tareas pendientes"],
        success: "Construiste un programa completo que transforma datos en un resumen útil. Terminaste los veinte proyectos de la ruta Python.",
        lesson: {
          walkthrough: ["El primer ciclo encuentra una tarea hecha de un total de dos.", "1 / 2 × 100 produce 50, por lo que el resumen muestra Completadas 1 de 2 (50%).", "El segundo ciclo ignora Reservar porque está hecha y muestra - Confirmar hora como pendiente."],
          prediction: "Si marcas las dos tareas del ejemplo como hechas, ¿qué porcentaje y cuántas líneas pendientes aparecerán?",
          answer: "Aparecerá 100 % y ninguna línea pendiente, porque las dos condiciones hecha serán verdaderas.",
          reflection: "Cambia temporalmente una tarea pendiente a True. Predice el nuevo resumen y cuál nombre dejará de aparecer; luego restaura los datos iniciales.",
          extension: "Después de completar, añade una clave prioridad a cada tarea y muestra ese dato junto al nombre pendiente. Conserva el resumen principal.",
          feedback: ["Conserva resumen(items) y la llamada resumen(tareas). Dentro de la función, recorre la lista para calcular el resultado.", "Cuenta las tareas con hecha igual a True y calcula int(hechas / len(items) * 100). El resumen esperado contiene 1 de 3 y 33.", "Recorre las tareas y muestra con un guion solo las que tienen hecha igual a False. Deben aparecer Practicar y Repasar."]
        },
        validate(result, source) {
          const pendientes = result.output.filter((line) => line.trim().startsWith("-"));
          return [
            uses(source, /def\s+resumen\s*\(/) && uses(source, /resumen\s*\(\s*tareas\s*\)/),
            result.output.some((line) => line.includes("1 de 3")) && shows(result, 33),
            pendientes.length >= 2
              && pendientes.some((line) => line.includes("Practicar"))
              && pendientes.some((line) => line.includes("Repasar"))
          ];
        }
      }
    ]
  }
];

const LEVEL_EXAMS = [
  {
    levelId: 1,
    title: "Mini examen de conceptos básicos",
    intro: "Cinco preguntas sobre mensajes, variables y operaciones. Necesitas 4 respuestas correctas para aprobar.",
    passing: 4,
    questions: [
      {
        question: "¿Qué hace print(\"Hola\")?",
        options: [
          "Guarda el texto dentro de una variable",
          "Muestra el texto en la consola",
          "Convierte el texto en un número",
          "Crea un archivo con ese texto"
        ],
        answer: 1,
        explanation: "print() es una función incorporada: escribe en la consola el valor que recibe entre paréntesis."
      },
      {
        question: "¿Cuál línea guarda el número 28 dentro de la variable edad?",
        options: ["edad == 28", "28 = edad", "edad = 28", "print(edad)"],
        answer: 2,
        explanation: "El signo igual asigna: a la izquierda va el nombre de la variable y a la derecha el valor."
      },
      {
        question: "Si nombre = \"Ada\", ¿qué muestra print(f\"Hola {nombre}\")?",
        options: ["Hola {nombre}", "Hola Ada", "f\"Hola Ada\"", "Un error, porque falta una coma"],
        answer: 1,
        explanation: "La f inicial convierte el texto en una f-string y reemplaza {nombre} por el valor guardado."
      },
      {
        question: "¿Cuál es el resultado de 7 // 2?",
        options: ["3.5", "3", "1", "14"],
        answer: 1,
        explanation: "// es la división entera: entrega 3 y descarta la parte decimal. Con / obtendrías 3.5."
      },
      {
        question: "¿En qué se diferencian 5 y \"5\"?",
        options: [
          "En nada, Python los trata igual",
          "5 es un número y \"5\" es texto",
          "\"5\" es un número decimal",
          "5 solo puede usarse dentro de print"
        ],
        answer: 1,
        explanation: "Las comillas convierten el valor en texto: \"5\" + \"5\" entrega \"55\", mientras que 5 + 5 entrega 10."
      }
    ]
  },
  {
    levelId: 2,
    title: "Mini examen de decisiones y ciclos",
    intro: "Cinco preguntas sobre condiciones, repeticiones y recorridos. Necesitas 4 respuestas correctas para aprobar.",
    passing: 4,
    questions: [
      {
        question: "Con edad = 15, ¿qué imprime un if edad >= 18 que tiene un else?",
        options: [
          "El mensaje del if",
          "El mensaje del else",
          "Los dos mensajes",
          "Nada, porque falta un elif"
        ],
        answer: 1,
        explanation: "15 >= 18 es falso, así que Python ejecuta el bloque else."
      },
      {
        question: "¿Para qué sirve elif?",
        options: [
          "Para repetir un bloque de código",
          "Para revisar otra condición cuando la anterior resultó falsa",
          "Para terminar el programa",
          "Para declarar una variable nueva"
        ],
        answer: 1,
        explanation: "elif encadena condiciones: solo se evalúa si las anteriores no se cumplieron."
      },
      {
        question: "¿Cuántas veces se repite for numero in range(1, 5)?",
        options: ["5 veces", "4 veces", "6 veces", "1 vez"],
        answer: 1,
        explanation: "range(1, 5) recorre 1, 2, 3 y 4: incluye el inicio y excluye el final."
      },
      {
        question: "¿Qué hace la palabra continue dentro de un ciclo?",
        options: [
          "Termina el ciclo por completo",
          "Salta a la siguiente vuelta sin ejecutar el resto del bloque",
          "Vuelve a empezar el programa",
          "Repite la vuelta actual otra vez"
        ],
        answer: 1,
        explanation: "continue abandona solo la vuelta actual; break es el que termina el ciclo completo."
      },
      {
        question: "¿Qué símbolo compara si dos valores son iguales?",
        options: ["=", "==", "=>", "><"],
        answer: 1,
        explanation: "Un signo igual asigna un valor; dos signos iguales comparan y entregan True o False."
      }
    ]
  },
  {
    levelId: 3,
    title: "Mini examen de colecciones de datos",
    intro: "Cinco preguntas sobre listas, diccionarios y recorridos. Necesitas 4 respuestas correctas para aprobar.",
    passing: 4,
    questions: [
      {
        question: "Si compras = [\"pan\", \"leche\"], ¿cómo obtienes \"pan\"?",
        options: ["compras[1]", "compras[0]", "compras(\"pan\")", "compras.primero"],
        answer: 1,
        explanation: "Las posiciones empiezan en cero, así que el primer elemento es compras[0]."
      },
      {
        question: "¿Qué hace lista.append(\"nuevo\")?",
        options: [
          "Reemplaza toda la lista",
          "Agrega el elemento al final de la lista",
          "Ordena la lista alfabéticamente",
          "Elimina el último elemento"
        ],
        answer: 1,
        explanation: "append() agrega al final y modifica la lista original, sin crear una copia."
      },
      {
        question: "¿Qué devuelve len({\"a\": 1, \"b\": 2})?",
        options: ["1", "2", "3", "Un error"],
        answer: 1,
        explanation: "len() sobre un diccionario cuenta cuántos pares de clave y valor contiene."
      },
      {
        question: "¿Cuál es la ventaja de curso.get(\"nivel\", \"sin datos\")?",
        options: [
          "Ordena las claves del diccionario",
          "Entrega un valor por defecto si la clave no existe, en vez de fallar",
          "Agrega la clave al diccionario",
          "Convierte el diccionario en lista"
        ],
        answer: 1,
        explanation: "Con corchetes una clave inexistente provoca un KeyError; get() permite entregar una alternativa."
      },
      {
        question: "En for producto, cantidad in stock.items(), ¿qué recibe cada variable?",
        options: [
          "Las dos reciben la clave",
          "producto recibe la clave y cantidad recibe el valor",
          "producto recibe el valor y cantidad la posición",
          "Ambas reciben la lista completa"
        ],
        answer: 1,
        explanation: "items() entrega pares de clave y valor, y el for los reparte en ese mismo orden."
      }
    ]
  },
  {
    levelId: 4,
    title: "Mini examen de funciones propias",
    intro: "Cinco preguntas sobre funciones, parámetros y resultados. Necesitas 4 respuestas correctas para aprobar.",
    passing: 4,
    questions: [
      {
        question: "¿Cuál línea define correctamente una función?",
        options: [
          "function saludar(nombre):",
          "def saludar(nombre):",
          "def saludar[nombre]:",
          "saludar = def(nombre)"
        ],
        answer: 1,
        explanation: "En Python una función se define con def, el nombre, los paréntesis y dos puntos."
      },
      {
        question: "¿Qué hace return dentro de una función?",
        options: [
          "Muestra el valor en la consola",
          "Entrega el resultado a quien llamó la función",
          "Detiene el programa completo",
          "Convierte la función en variable"
        ],
        answer: 1,
        explanation: "return entrega el valor y termina la función. print solo lo muestra, no lo devuelve."
      },
      {
        question: "Si una función no tiene return, ¿qué devuelve al llamarla?",
        options: ["0", "None", "Un error", "El último print"],
        answer: 1,
        explanation: "Sin return, Python devuelve None: la función hizo su trabajo pero no entregó un valor."
      },
      {
        question: "En def precio_final(precio, descuento=10), ¿qué significa descuento=10?",
        options: [
          "Que el descuento siempre vale 10",
          "Que si no envías ese dato, la función usa 10",
          "Que el parámetro es obligatorio",
          "Que la función devuelve 10"
        ],
        answer: 1,
        explanation: "Es un valor por defecto: cubre el caso habitual y se puede reemplazar en cada llamada."
      },
      {
        question: "¿Cómo se calcula el promedio de notas = [4, 5, 6]?",
        options: [
          "sum(notas)",
          "sum(notas) / len(notas)",
          "len(notas) / sum(notas)",
          "notas / 3"
        ],
        answer: 1,
        explanation: "sum() suma los valores y len() cuenta cuántos hay: el promedio es la división entre ambos."
      }
    ]
  },
  {
    levelId: 5,
    title: "Mini examen de integración final",
    intro: "Cinco preguntas sobre filtros, errores y formato. Necesitas 4 respuestas correctas para aprobar.",
    passing: 4,
    questions: [
      {
        question: "¿Qué produce [n for n in numeros if n > 10]?",
        options: [
          "Un número con la cantidad de elementos",
          "Una lista nueva con los elementos mayores a 10",
          "La lista original ordenada",
          "Un error, porque falta append()"
        ],
        answer: 1,
        explanation: "Una comprensión construye una lista nueva; la original no se modifica."
      },
      {
        question: "¿Para qué sirve try / except?",
        options: [
          "Para repetir un bloque hasta que funcione",
          "Para ejecutar una alternativa cuando ocurre un error, sin detener el programa",
          "Para comentar código que no se usa",
          "Para definir funciones más rápidas"
        ],
        answer: 1,
        explanation: "El bloque try intenta la operación y except decide qué hacer si falla."
      },
      {
        question: "¿Qué error ocurre al ejecutar int(\"hola\")?",
        options: ["ZeroDivisionError", "ValueError", "IndexError", "NameError"],
        answer: 1,
        explanation: "El texto no representa un número entero, así que Python levanta un ValueError."
      },
      {
        question: "¿Qué muestra print(f\"{2 / 3:.2f}\")?",
        options: ["0.666666", "0.67", "2/3", "0.66"],
        answer: 1,
        explanation: "El formato .2f redondea a dos decimales al mostrar el valor."
      },
      {
        question: "¿Por qué conviene mover un cálculo repetido a una función?",
        options: [
          "Porque el programa ocupa menos memoria",
          "Porque se escribe y se corrige en un solo lugar, y se puede probar aparte",
          "Porque Python obliga a usar funciones",
          "Porque las funciones se ejecutan más rápido siempre"
        ],
        answer: 1,
        explanation: "Reunir la lógica en una función evita repetir código y facilita corregirlo y probarlo."
      }
    ]
  }
];

const allProjects = () => COURSE_LEVELS.flatMap((level) => level.projects);
const TOTAL_PROJECTS = COURSE_LEVELS.reduce((total, level) => total + level.projects.length, 0);
const hasValue = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

const heroCode = document.querySelector("#hero-code");
const heroRun = document.querySelector("#hero-run");
const heroOutput = document.querySelector("#hero-output");
const levelTabs = document.querySelector("#level-tabs");
const projectList = document.querySelector("#project-list");
const projectCode = document.querySelector("#course-project-code");
const projectOutput = document.querySelector("#course-project-output");
const validationList = document.querySelector("#project-validations");
const successPanel = document.querySelector("#course-project-success");
const completeButton = document.querySelector("#complete-course-project");
const previousButton = document.querySelector("#course-previous");
const nextButton = document.querySelector("#course-next");
const positionText = document.querySelector("#course-project-position");
const hintsList = document.querySelector("#project-hints");
const hintButton = document.querySelector("#show-hint");
const routeProgressText = document.querySelector("#route-progress-text");
const routeProgressFill = document.querySelector("#route-progress-fill");
const courseFinish = document.querySelector("#course-finish");
const checkpointPanel = document.querySelector("#level-checkpoint");
const checkpointKicker = document.querySelector("#checkpoint-kicker");
const checkpointTitle = document.querySelector("#checkpoint-title");
const checkpointCopy = document.querySelector("#checkpoint-copy");
const checkpointExam = document.querySelector("#checkpoint-exam");
const checkpointNext = document.querySelector("#checkpoint-next");
const examPanel = document.querySelector("#level-exam");
const examKicker = document.querySelector("#exam-kicker");
const examTitle = document.querySelector("#exam-title");
const examIntro = document.querySelector("#exam-intro");
const examQuestions = document.querySelector("#exam-questions");
const examSubmit = document.querySelector("#exam-submit");
const examRetry = document.querySelector("#exam-retry");
const examClose = document.querySelector("#exam-close");
const examResult = document.querySelector("#exam-result");

let activeLevelId = 1;
let activeProjectId = 1;
let projectOpenedAt = Date.now();
let completedProjects = loadProgress();
const validRuns = new Map();
const revealedHints = new Map();
const drafts = new Map(Object.entries(globalThis.LearningState?.session("python").drafts || {}).map(([index, code]) => [Number(index) + 1, code]));
const validatedSources = new Map();
let approvedExams = loadApprovedExams();
let examLevelId = 1;
let examAnswers = new Map();
let examReviewed = false;

function runPython(source) {
  const runtime = globalThis.PythonRuntime;
  if (!runtime) throw new Error("El intérprete de Python no se cargó. Recarga la página para volver a intentarlo.");
  const result = runtime.run(source);
  if (result.error) {
    const failure = new Error(result.error);
    failure.output = result.output;
    throw failure;
  }
  if (result.output.length === 0) {
    throw new Error("El programa no mostró ningún resultado. Agrega print() para ver la salida.");
  }
  return result;
}

const EXAM_LETTERS = ["A", "B", "C", "D"];

/* El avance lo guarda learning-state.js, que es el unico dueno del dato. */
function loadApprovedExams() {
  const saved = globalThis.LearningState?.examenes("python") || [];
  return new Set(saved.filter((levelId) => Number.isInteger(levelId) && levelId >= 1 && levelId <= COURSE_LEVELS.length));
}

function saveApprovedExams() {
  for (const levelId of approvedExams) globalThis.LearningState?.aprobarExamen("python", levelId);
}

function levelOfProject(projectId) {
  return COURSE_LEVELS.find((level) => level.projects.some((project) => project.id === Number(projectId)));
}

function levelProjectsDone(level) {
  return Boolean(level) && level.projects.length > 0 && level.projects.every((project) => completedProjects.has(project.id));
}

function isLevelUnlocked(levelId) {
  const index = COURSE_LEVELS.findIndex((level) => level.id === Number(levelId));
  if (index < 0) return false;
  if (index === 0) return true;
  return levelProjectsDone(COURSE_LEVELS[index - 1]);
}

function isExamUnlocked(levelId) {
  return levelProjectsDone(COURSE_LEVELS.find((level) => level.id === Number(levelId)));
}

function getExam(levelId) {
  return LEVEL_EXAMS.find((exam) => exam.levelId === Number(levelId));
}

function gradeExam(levelId, answers) {
  const exam = getExam(levelId);
  if (!exam) return null;
  const read = (index) => {
    if (!answers) return undefined;
    if (typeof answers.get === "function") return answers.get(index);
    return answers[index];
  };
  const details = exam.questions.map((question, index) => {
    const chosen = read(index);
    return {
      index,
      chosen: chosen === undefined ? null : chosen,
      answer: question.answer,
      isCorrect: chosen === question.answer
    };
  });
  const correct = details.filter((detail) => detail.isCorrect).length;
  return { total: exam.questions.length, correct, passing: exam.passing, passed: correct >= exam.passing, details };
}

function levelStatusLabel(level) {
  if (level.locked) return "Preparando";
  if (!isLevelUnlocked(level.id)) return "Bloqueado";
  if (approvedExams.has(level.id)) return "Examen aprobado ✓";
  if (levelProjectsDone(level)) return "Examen disponible";
  const done = level.projects.filter((project) => completedProjects.has(project.id)).length;
  return done + " de " + level.projects.length + " proyectos";
}

function renderRouteStrip() {
  document.querySelectorAll("[data-level-target]").forEach((button) => {
    const level = COURSE_LEVELS.find((item) => item.id === Number(button.dataset.levelTarget));
    if (!level) return;
    button.disabled = Boolean(level.locked) || !isLevelUnlocked(level.id);
    const caption = button.querySelector("small");
    if (caption) caption.textContent = levelStatusLabel(level);
  });
}

function renderCheckpoint() {
  const level = getActiveLevel();
  if (!checkpointPanel || !level) return;
  const done = levelProjectsDone(level);
  checkpointPanel.hidden = !done;
  if (!done) return;
  const approved = approvedExams.has(level.id);
  const next = COURSE_LEVELS.find((item) => item.id === level.id + 1);
  checkpointKicker.textContent = "Punto de control · " + level.stage;
  checkpointTitle.textContent = level.completionTitle;
  checkpointCopy.textContent = approved ? level.approvedCopy : level.completionCopy;
  checkpointExam.textContent = approved
    ? "Repetir el mini examen"
    : "Rendir el mini examen de " + level.stage.toLowerCase();
  checkpointNext.hidden = !next;
  if (next) checkpointNext.textContent = "Continuar con " + next.stage.toLowerCase();
}

function renderExam() {
  const exam = getExam(examLevelId);
  const level = COURSE_LEVELS.find((item) => item.id === examLevelId);
  if (!exam || !level || !examQuestions) return;
  examKicker.textContent = "Mini examen · " + level.stage;
  examTitle.textContent = exam.title;
  examIntro.textContent = exam.intro;
  examQuestions.replaceChildren();

  exam.questions.forEach((question, index) => {
    const chosen = examAnswers.has(index) ? examAnswers.get(index) : null;
    const item = document.createElement("li");
    item.className = "exam-question"
      + (examReviewed ? (chosen === question.answer ? " is-correct" : " is-wrong") : "");

    const statement = document.createElement("p");
    statement.className = "exam-statement";
    statement.id = "python-exam-question-" + index;
    statement.textContent = question.question;
    item.append(statement);

    const options = document.createElement("div");
    options.className = "exam-options";
    options.setAttribute("role", "group");
    options.setAttribute("aria-labelledby", statement.id);
    question.options.forEach((option, optionIndex) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "exam-option"
        + (chosen === optionIndex ? " is-selected" : "")
        + (examReviewed && optionIndex === question.answer ? " is-answer" : "");
      button.dataset.question = String(index);
      button.dataset.option = String(optionIndex);
      button.setAttribute("aria-pressed", String(chosen === optionIndex));
      button.disabled = examReviewed;
      const letter = document.createElement("span");
      letter.textContent = EXAM_LETTERS[optionIndex] || "•";
      const text = document.createElement("small");
      text.textContent = option;
      button.append(letter);
      button.append(text);
      options.append(button);
    });
    item.append(options);

    if (examReviewed) {
      const feedback = document.createElement("p");
      feedback.className = "exam-feedback";
      feedback.textContent = question.explanation;
      item.append(feedback);
    }

    examQuestions.append(item);
  });

  examSubmit.hidden = examReviewed;
  examRetry.hidden = !examReviewed;
}

function openExam(levelId) {
  if (!isExamUnlocked(levelId)) return;
  examLevelId = Number(levelId);
  examAnswers = new Map();
  examReviewed = false;
  examResult.textContent = "";
  examResult.className = "exam-result";
  examPanel.hidden = false;
  renderExam();
  examTitle.focus?.({ preventScroll: true });
  if (typeof examPanel.scrollIntoView === "function") examPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function closeExam(returnFocus = false) {
  if (examPanel) examPanel.hidden = true;
  if (returnFocus) checkpointExam?.focus?.();
}

function submitExam() {
  if (examPanel.hidden || examReviewed || !isExamUnlocked(examLevelId)) return;
  const exam = getExam(examLevelId);
  if (!exam) return;
  if (examAnswers.size < exam.questions.length) {
    examResult.textContent = "Responde las " + exam.questions.length + " preguntas antes de revisar.";
    examResult.className = "exam-result is-pending";
    return;
  }
  const result = gradeExam(examLevelId, examAnswers);
  examReviewed = true;
  renderExam();
  const next = COURSE_LEVELS.find((item) => item.id === examLevelId + 1);
  if (result.passed) {
    approvedExams.add(examLevelId);
    saveApprovedExams();
    examResult.textContent = "Aprobado con " + result.correct + " de " + result.total + " respuestas correctas. "
      + (next ? "Ya puedes continuar con " + next.stage.toLowerCase() + "."
        : approvedExams.size === 3 ? "Con esto cierras la ruta de Python." : "Revisa los otros mini exámenes: necesitas aprobar los tres para cerrar la ruta.");
    examResult.className = "exam-result is-passed";
  } else {
    examResult.textContent = "Obtuviste " + result.correct + " de " + result.total + " y necesitas " + result.passing
      + " para aprobar. Revisa las explicaciones y vuelve a intentarlo.";
    examResult.className = "exam-result is-failed";
  }
  renderLevelTabs();
  renderProgress();
  renderCheckpoint();
  examResult.focus?.();
}

function retryExam() {
  examAnswers = new Map();
  examReviewed = false;
  examResult.textContent = "";
  examResult.className = "exam-result";
  renderExam();
  examTitle.focus?.();
}

function getActiveLevel() {
  return COURSE_LEVELS.find((level) => level.id === activeLevelId);
}

function getActiveProject() {
  return allProjects().find((project) => project.id === activeProjectId);
}

function saveCurrentDraft() {
  if (projectCode && getActiveProject()) {
    drafts.set(activeProjectId, projectCode.value);
    globalThis.LearningState?.save("python", activeProjectId - 1, projectCode.value);
  }
}

function loadProgress() {
  const saved = globalThis.LearningState?.completados("python") || [];
  return new Set(saved.filter((project) => Number.isInteger(project) && project >= 1 && project <= TOTAL_PROJECTS));
}

function saveProgress() {
  for (const project of completedProjects) globalThis.LearningState?.completar("python", project);
}

function renderLevelTabs() {
  levelTabs.innerHTML = "";
  COURSE_LEVELS.forEach((level) => {
    const button = document.createElement("button");
    const isActive = level.id === activeLevelId;
    button.type = "button";
    button.role = "tab";
    button.id = "level-tab-" + level.id;
    button.className = "level-tab";
    button.dataset.level = String(level.id);
    button.setAttribute("aria-selected", String(isActive));
    button.setAttribute("aria-controls", "course-project");
    button.tabIndex = isActive ? 0 : -1;
    button.disabled = Boolean(level.locked) || !isLevelUnlocked(level.id);
    button.innerHTML = '<span>0' + level.id + '</span><strong>' + level.title + '</strong><small>'
      + levelStatusLabel(level) + "</small>";
    levelTabs.append(button);
  });
  renderRouteStrip();
}

function renderProjectList() {
  const level = getActiveLevel();
  projectList.innerHTML = "";
  level.projects.forEach((project) => {
    const button = document.createElement("button");
    const isComplete = completedProjects.has(project.id);
    button.type = "button";
    button.className = "project-index-button";
    button.dataset.project = String(project.id);
    button.setAttribute("aria-current", project.id === activeProjectId ? "step" : "false");
    button.innerHTML = '<span>' + String(project.id).padStart(2, "0") + '</span><div><strong>'
      + project.shortTitle + '</strong><small>' + project.duration + '</small></div><i>'
      + (isComplete ? "✓" : "→") + "</i>";
    projectList.append(button);
  });
}

function renderHints() {
  const project = getActiveProject();
  const visibleCount = revealedHints.get(project.id) || 0;
  hintsList.innerHTML = "";
  project.hints.slice(0, visibleCount).forEach((hint) => {
    const item = document.createElement("li");
    item.textContent = hint;
    hintsList.append(item);
  });
  hintButton.disabled = visibleCount >= project.hints.length;
  hintButton.textContent = visibleCount >= project.hints.length ? "Todas las pistas visibles" : "Ver pista " + (visibleCount + 1);
}

function renderValidations(results = null, executionError = false) {
  const project = getActiveProject();
  validationList.innerHTML = "";
  project.checks.forEach((label, index) => {
    const item = document.createElement("li");
    const state = results === null ? "pending" : results[index] ? "passed" : "failed";
    item.className = "validation-" + state;
    item.innerHTML = '<span aria-hidden="true">' + (state === "passed" ? "✓" : state === "failed" ? "×" : "·")
      + "</span><span>" + label + "</span>";
    validationList.append(item);
  });
  const coaching = document.querySelector("#python-coaching");
  if (coaching) {
    const failed = results?.findIndex(passed => !passed) ?? -1;
    coaching.hidden = !project.lesson || failed < 0;
    coaching.textContent = coaching.hidden ? "" : executionError
      ? "El programa se detuvo antes de completar las comprobaciones. Lee el error del resultado y revisa las comillas, los paréntesis y los nombres de las variables antes de volver a ejecutar."
      : project.lesson.feedback[failed];
  }
}

function renderFoundationLesson(project) {
  const support = document.querySelector("#python-lesson-support");
  const extra = document.querySelector("#python-lesson-extra");
  if (!support || !extra) return;
  support.hidden = extra.hidden = !project.lesson;
  extra.open = false;
  document.querySelector("#python-prediction-answer").open = false;
  document.querySelector("#python-walkthrough").open = project.id === 1;
  if (!project.lesson) return;
  const steps = document.querySelector("#python-example-steps");
  steps.replaceChildren();
  project.lesson.walkthrough.forEach(text => {
    const item = document.createElement("li");
    item.textContent = text;
    steps.append(item);
  });
  for (const [id, field] of [["python-prediction", "prediction"], ["python-prediction-explanation", "answer"], ["python-reflection", "reflection"], ["python-extension", "extension"]]) {
    document.querySelector("#" + id).textContent = project.lesson[field];
  }
}

function renderProgress() {
  const completed = completedProjects.size;
  routeProgressText.textContent = completed + " de " + TOTAL_PROJECTS;
  routeProgressFill.style.width = (completed / TOTAL_PROJECTS * 100) + "%";
  const approvedAll = COURSE_LEVELS.every((level) => approvedExams.has(level.id));
  courseFinish.hidden = !(completed === TOTAL_PROJECTS && approvedAll);
}

function renderProject() {
  projectOpenedAt = Date.now();
  const project = getActiveProject();
  const level = getActiveLevel();
  document.querySelector("#course-project-kicker").textContent = "Nivel 0" + level.id + " · Proyecto "
    + String(project.id).padStart(2, "0") + " · " + project.duration;
  document.querySelector("#course-project-title").textContent = project.title;
  document.querySelector("#course-project-summary").textContent = project.summary;
  document.querySelector("#course-project-example").textContent = project.example;
  document.querySelector("#course-project-explanation").textContent = project.explanation;
  document.querySelector("#course-project-concepts").innerHTML = project.concepts.map((concept) => "<li>" + concept + "</li>").join("");
  document.querySelector("#course-project-goal").textContent = project.goal;
  renderFoundationLesson(project);
  document.querySelector("#course-lab-title").textContent = project.shortTitle;
  document.querySelector("#course-project-difficulty").textContent = project.difficulty;
  document.querySelector("#course-project-file").textContent = project.file;
  document.querySelector("#course-project-success-copy").textContent = project.success;
  const scopeNote = document.querySelector("#python-lab-scope");
  if (scopeNote) {
    scopeNote.textContent = "Intérprete de Python del laboratorio: ejecuta variables, operaciones, f-strings, condiciones, ciclos, listas, diccionarios, funciones, comprensiones y try/except. Escribe tu propia solución: la salida se calcula de verdad. No incluye módulos externos (import) ni input().";
  }
  document.querySelector("#course-project").setAttribute("aria-labelledby", "level-tab-" + level.id + " course-project-title");

  projectCode.value = drafts.has(project.id) ? drafts.get(project.id) : project.starter;
  const lineCount = Math.max(7, projectCode.value.split(/\r?\n/).length);
  document.querySelector("#course-code-lines").innerHTML = Array.from({ length: lineCount }, (_, index) => index + 1).join("<br>");
  projectOutput.textContent = "Tu resultado aparecerá aquí.";
  projectOutput.classList.remove("is-error");
  successPanel.hidden = true;
  renderHints();
  renderValidations();

  const isComplete = completedProjects.has(project.id);
  completeButton.disabled = true;
  completeButton.classList.toggle("is-complete", isComplete);
  completeButton.textContent = isComplete ? "Proyecto completado ✓" : "Completar proyecto";

  const available = allProjects();
  const projectIndex = available.findIndex((item) => item.id === project.id);
  const nextProject = available[projectIndex + 1];
  previousButton.disabled = projectIndex <= 0;
  nextButton.disabled = !nextProject || !isLevelUnlocked(levelOfProject(nextProject.id).id);
  positionText.textContent = "Proyecto " + project.id + " de " + TOTAL_PROJECTS;
  renderProjectList();
  renderCheckpoint();
  globalThis.LearningState?.save("python", project.id - 1, projectCode.value);
}

function activateLevel(levelId, scroll = false) {
  const level = COURSE_LEVELS.find((item) => item.id === Number(levelId));
  if (!level || level.locked || !isLevelUnlocked(level.id) || level.projects.length === 0) return;
  saveCurrentDraft();
  activeLevelId = level.id;
  activeProjectId = level.projects[0].id;
  renderLevelTabs();
  renderProject();
  if (scroll) document.querySelector("#proyectos").scrollIntoView({ behavior: "smooth", block: "start" });
}

function activateProject(projectId, scroll = false) {
  const project = allProjects().find((item) => item.id === Number(projectId));
  if (!project) return;
  const owner = levelOfProject(project.id);
  if (!owner || !isLevelUnlocked(owner.id)) return;
  saveCurrentDraft();
  activeProjectId = project.id;
  activeLevelId = COURSE_LEVELS.find((level) => level.projects.some((item) => item.id === project.id)).id;
  renderLevelTabs();
  renderProject();
  if (scroll) document.querySelector("#proyectos").scrollIntoView({ behavior: "smooth", block: "start" });
}

function runHeroExample() {
  try {
    const result = runPython(heroCode.value);
    heroOutput.textContent = "› " + result.output.join("\n");
    heroOutput.classList.remove("is-error");
  } catch (error) {
    heroOutput.textContent = error.message;
    heroOutput.classList.add("is-error");
  }
}

function runActiveProject() {
  const project = getActiveProject();
  drafts.set(project.id, projectCode.value);
  globalThis.LearningState?.save("python", project.id - 1, projectCode.value);
  let validationResults = project.checks.map(() => false);
  let isValid = false;
  let executionError = false;
  try {
    const result = runPython(projectCode.value);
    projectOutput.textContent = result.output.join("\n");
    projectOutput.classList.remove("is-error");
    validationResults = project.validate(result, projectCode.value);
    isValid = validationResults.every(Boolean);
    validRuns.set(project.id, isValid);
    if (isValid) validatedSources.set(project.id, projectCode.value);
    else validatedSources.delete(project.id);
    renderValidations(validationResults);
    successPanel.hidden = !isValid;
    if (!completedProjects.has(project.id)) completeButton.disabled = !isValid;
    if (!isValid) {
      projectOutput.textContent += "\n\nEl programa se ejecutó, pero todavía falta cumplir toda la misión.";
    }
  } catch (error) {
    executionError = true;
    isValid = false;
    validationResults = project.checks.map(() => false);
    validRuns.set(project.id, false);
    validatedSources.delete(project.id);
    projectOutput.textContent = error.message;
    projectOutput.classList.add("is-error");
    successPanel.hidden = true;
    completeButton.disabled = true;
    renderValidations(validationResults, true);
  }
  /* Los intentos usan índices desde cero, igual que las otras rutas.
     El tiempo transcurre desde la última apertura; no mide trabajo activo. */
  globalThis.LearningState?.registrarIntento("python", project.id - 1, {
    validaciones: validationResults,
    aprobado: isValid,
    error: executionError,
    ms: Date.now() - projectOpenedAt
  });
}

function resetActiveProject() {
  const project = getActiveProject();
  drafts.delete(project.id);
  globalThis.LearningState?.removeDraft("python", project.id - 1);
  validatedSources.delete(project.id);
  validRuns.set(project.id, false);
  renderProject();
  projectCode.focus();
}

levelTabs.addEventListener("click", (event) => {
  const button = event.target.closest("[data-level]");
  if (button) activateLevel(button.dataset.level);
});

levelTabs.addEventListener("keydown", (event) => {
  if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
  const tabs = [...levelTabs.querySelectorAll(".level-tab:not(:disabled)")];
  const currentIndex = tabs.indexOf(event.target.closest(".level-tab"));
  if (currentIndex < 0) return;
  event.preventDefault();
  const direction = event.key === "ArrowRight" ? 1 : -1;
  const target = tabs[(currentIndex + direction + tabs.length) % tabs.length];
  const targetLevel = target.dataset.level;
  activateLevel(targetLevel);
  levelTabs.querySelector('[data-level="' + targetLevel + '"]').focus();
});

projectList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-project]");
  if (button) activateProject(button.dataset.project);
});

document.querySelectorAll("[data-level-target]").forEach((button) => {
  button.addEventListener("click", () => activateLevel(button.dataset.levelTarget, true));
});

heroRun.addEventListener("click", runHeroExample);
heroCode.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") runHeroExample();
});

document.querySelector("#run-course-project").addEventListener("click", runActiveProject);
document.querySelector("#reset-course-project").addEventListener("click", resetActiveProject);
projectCode.addEventListener("input", () => {
  validRuns.set(activeProjectId, false);
  validatedSources.delete(activeProjectId);
  completeButton.disabled = true;
  successPanel.hidden = true;
  renderValidations();
  saveCurrentDraft();
  document.querySelector("#course-code-lines").innerHTML = Array.from(
    { length: Math.max(7, projectCode.value.split(/\r?\n/).length) },
    (_, index) => index + 1,
  ).join("<br>");
});
projectCode.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") runActiveProject();
});

hintButton.addEventListener("click", () => {
  const project = getActiveProject();
  const current = revealedHints.get(project.id) || 0;
  revealedHints.set(project.id, Math.min(project.hints.length, current + 1));
  renderHints();
});

completeButton.addEventListener("click", () => {
  const project = getActiveProject();
  if (completeButton.disabled || !validRuns.get(project.id) || validatedSources.get(project.id) !== projectCode.value) return;
  completedProjects.add(project.id);
  saveProgress();
  renderProgress();
  renderLevelTabs();
  renderProject();
});

previousButton.addEventListener("click", () => {
  const projects = allProjects();
  const index = projects.findIndex((project) => project.id === activeProjectId);
  if (index > 0) activateProject(projects[index - 1].id);
});

nextButton.addEventListener("click", () => {
  const projects = allProjects();
  const index = projects.findIndex((project) => project.id === activeProjectId);
  if (index < projects.length - 1) activateProject(projects[index + 1].id);
});

if (checkpointExam) {
  checkpointExam.addEventListener("click", () => openExam(getActiveLevel().id));
}

if (checkpointNext) {
  checkpointNext.addEventListener("click", () => {
    const next = COURSE_LEVELS.find((item) => item.id === getActiveLevel().id + 1);
    if (!next) return;
    closeExam();
    activateLevel(next.id, true);
  });
}

if (examQuestions) {
  examQuestions.addEventListener("click", (event) => {
    const button = event.target.closest("[data-option]");
    if (!button || examReviewed) return;
    examAnswers.set(Number(button.dataset.question), Number(button.dataset.option));
    examQuestions.querySelectorAll('[data-question="' + button.dataset.question + '"]').forEach((option) => {
      const selected = option.dataset.option === button.dataset.option;
      option.classList.toggle("is-selected", selected);
      option.setAttribute("aria-pressed", String(selected));
    });
  });
}

if (examSubmit) examSubmit.addEventListener("click", submitExam);
if (examRetry) examRetry.addEventListener("click", retryExam);
if (examClose) examClose.addEventListener("click", () => closeExam(true));

const resumePythonId = (globalThis.LearningState?.resumeIndex("python") ?? 0) + 1;
const resumePythonLevel = levelOfProject(resumePythonId);
if (resumePythonLevel && isLevelUnlocked(resumePythonLevel.id)) {
  activeProjectId = resumePythonId;
  activeLevelId = resumePythonLevel.id;
}
renderLevelTabs();
renderProgress();
renderProject();
