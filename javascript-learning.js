/* Apoyos pedagógicos de JavaScript. Se aplican tras CourseExpansion para
   conservar los 16 índices, sus validadores y el progreso existente. */
(() => {
  "use strict";

  const guide = (prerequisites, example, walkthrough, prediction, answer, reflection, extension, hints, feedback, success) => ({
    prerequisites, example, walkthrough, prediction, answer, reflection, extension, hints, feedback, success
  });

  const lessons = [
    guide("Ninguno: este es el punto de partida.",
      'const puntoEncuentro = "Museo";\nconsole.log(puntoEncuentro);',
      ["const crea la variable puntoEncuentro y guarda en ella el texto Museo.", "console.log recibe la variable, consulta su valor y muestra Museo en la consola.", "El nombre permite reutilizar el dato sin volver a escribir el texto."],
      "Si cambias el valor a Parque, ¿qué mostrará la misma llamada a console.log?",
      "Mostrará Parque. La instrucción consulta el valor actual guardado en la variable.",
      "Cambia temporalmente el valor de lenguaje y predice la salida antes de ejecutar. Restaura JavaScript para completar.",
      "Después de completar, crea otra variable llamada version con un número y muéstrala en una segunda línea.",
      ["Compara el valor actual JS con el texto completo que pide la misión.", "const guarda el valor; console.log debe recibir el nombre de la variable sin comillas.", 'Usa const lenguaje = "JavaScript"; y luego console.log(lenguaje);.'],
      ["Declara lenguaje con const para que el programa pueda consultar ese dato.", "El valor de lenguaje debe ser el texto JavaScript, respetando mayúsculas y minúsculas.", "Pasa lenguaje a console.log para mostrar su valor en la consola."],
      "Guardaste y mostraste un dato. En el siguiente módulo usarás variables numéricas para calcular un total."),

    guide("Variables con const y salida con console.log.",
      "const precioEntrada = 3200;\nconst personas = 2;\nconst costo = precioEntrada * personas;\nconsole.log(costo);",
      ["precioEntrada y personas guardan los dos números de entrada.", "El operador * los multiplica y el resultado 6400 queda guardado en costo.", "console.log muestra el resultado calculado, no una cifra escrita aparte."],
      "Si personas cambia de 2 a 4, ¿qué valor tendrá costo?",
      "Tendrá 12800 porque la expresión se vuelve a calcular con el nuevo valor antes de guardarse.",
      "Prueba cantidad = 2 y anticipa el total. Después vuelve a 3 para cumplir la misión.",
      "Después de completar, añade una variable descuento = 1000 y muestra total - descuento.",
      ["Localiza cuál de los datos representa cuántas unidades se comprarán.", "El total debe seguir dependiendo de precio * cantidad; cambia el dato de entrada, no el resultado a mano.", "Establece cantidad en 3, conserva const total = precio * cantidad y muestra total."],
      ["Cambia cantidad para que su valor final sea 3.", "Conserva una multiplicación entre precio y cantidad para calcular total.", "Muestra el total calculado; con los datos de la misión debe aparecer 13500."],
      "Calculaste un total a partir de datos. Ahora combinarás valores dentro de un mensaje legible."),

    guide("Variables de texto y números; console.log.",
      'const persona = "luna";\nconst planes = 2;\nconsole.log(`Hola, ${persona.toUpperCase()}: tienes ${planes} planes`);',
      ["Los acentos graves delimitan una plantilla que puede mezclar texto y expresiones.", "persona.toUpperCase() devuelve LUNA sin modificar el texto original.", "Las dos expresiones ${} se sustituyen y la consola muestra una sola frase completa."],
      "Si planes vale 4, ¿necesitas cambiar el texto fijo de la plantilla?",
      "No. Solo cambia el valor de la variable y ${planes} inserta automáticamente 4.",
      "Cambia nombre a sol y explica qué parte del mensaje transforma toUpperCase(). Luego restaura ada.",
      "Después de completar, añade una variable ciudad y extiende el mensaje con otro ${}, trabajando sobre una copia.",
      ["Identifica los dos valores que deben aparecer dentro del texto y evita escribir sus resultados a mano.", "Una plantilla usa acentos graves; ${expresión} inserta valores y toUpperCase() transforma el nombre.", 'Muestra `Hola, ${nombre.toUpperCase()}: llevas ${modulos} módulos` con console.log.'],
      ["Usa al menos una plantilla con acentos graves y una expresión ${}.", "Llama toUpperCase() sobre nombre para obtener ADA.", "La salida debe contener la frase completa Hola, ADA: llevas 3 módulos."],
      "Construiste un mensaje dinámico. En el cierre del nivel guardarás el resultado verdadero o falso de una comparación."),

    guide("Variables numéricas, expresiones y salida.",
      "const horasEstudio = 6;\nconst objetivo = 8;\nconst alcanzado = horasEstudio >= objetivo;\nconsole.log(alcanzado);",
      ["La comparación pregunta si 6 es mayor o igual que 8.", "Como no se cumple, alcanzado guarda el booleano false.", "console.log muestra false sin comillas porque no es un texto."],
      "Si horasEstudio vale exactamente 8, ¿el resultado de >= es true o false?",
      "Es true: mayor o igual incluye el valor límite.",
      "Cambia temporalmente horas a 9 y a 10. Explica por qué ambos valores mantienen true antes de restaurar 12.",
      "Después de completar, crea falta = horas < meta y muestra también ese booleano.",
      ["Formula la pregunta que responde la misión: ¿las horas alcanzaron o superaron la meta?", "Una comparación produce un booleano que puede guardarse en const y mostrarse sin comillas.", "Añade const cumplio = horas >= meta; y console.log(cumplio);."],
      ["Crea una variable llamada cumplio para guardar el resultado.", "Asigna a cumplio una comparación con horas y meta que produzca true.", "Muestra cumplio con console.log; la consola debe contener true."],
      "Guardaste una respuesta booleana. El próximo nivel usará ese tipo de comparación para elegir entre distintos caminos."),

    guide("Comparaciones booleanas y bloques entre llaves.",
      'const temperatura = 12;\nif (temperatura >= 15) {\n  console.log("Salida al parque");\n} else {\n  console.log("Plan bajo techo");\n}',
      ["if evalúa si 12 es mayor o igual que 15.", "La comparación es falsa, así que se omite el primer bloque y se ejecuta else.", "La consola muestra una sola respuesta: Plan bajo techo."],
      "Si temperatura cambia a 15, ¿qué bloque se ejecuta?",
      "Se ejecuta el bloque de if porque >= incluye 15; else se omite.",
      "Prueba edad 17 y 18. Comprueba que el límite cambia de Aún no a Puede entrar y restaura 18.",
      "Después de completar, cambia los mensajes por opciones de una salida manteniendo la misma decisión.",
      ["Busca el dato que hace falsa la condición inicial y compáralo con el límite solicitado.", "if ejecuta el camino verdadero; else conserva una respuesta para el caso contrario.", 'Usa edad = 18, if (edad >= 18) y muestra "Puede entrar"; deja "Aún no" en else.'],
      ["La variable edad debe contener el valor 18.", "Comprueba edad >= 18 dentro de if y conserva un bloque else.", "El camino verdadero debe mostrar exactamente Puede entrar."],
      "Creaste una decisión con dos caminos. Ahora ordenarás tres respuestas posibles."),

    guide("Condiciones if/else y comparaciones numéricas.",
      'const presupuesto = 7000;\nif (presupuesto >= 10000) {\n  console.log("Plan completo");\n} else if (presupuesto >= 5000) {\n  console.log("Plan básico");\n} else {\n  console.log("Ajustar plan");\n}',
      ["La primera condición es falsa porque 7000 no alcanza 10000.", "La segunda es verdadera porque 7000 sí alcanza 5000, así que muestra Plan básico.", "Al encontrar un camino verdadero, JavaScript no evalúa el else final."],
      "¿Qué ocurriría si la condición >= 5000 apareciera antes que >= 10000?",
      "Un valor como 12000 entraría demasiado pronto en Plan básico. Conviene revisar primero el límite más exigente.",
      "Prueba nota 3, 5 y 6 y anota qué rama responde a cada valor. Restaura 5 para completar.",
      "Después de completar, añade una categoría para nota 7 antes de las condiciones existentes.",
      ["Ordena las categorías desde el límite más alto hasta el caso que cubre todo lo demás.", "else if agrega una comparación intermedia; el else final no necesita condición.", 'Después de Excelente añade else if (nota >= 4) con Aprobado y termina con else que muestre A reforzar.'],
      ["Añade al menos una rama else if.", "El código debe contener los tres mensajes: Excelente, Aprobado y A reforzar.", "Con nota 5 debe ejecutarse una sola rama y mostrar Aprobado."],
      "Ordenaste varias decisiones. En el siguiente módulo guardarás varios cursos en una colección."),

    guide("Variables, llamadas a métodos y posiciones que comienzan en cero.",
      'const lugares = ["Museo", "Parque"];\nlugares.push("Café");\nconsole.log(lugares.length);\nconsole.log(lugares[0]);',
      ["El arreglo comienza con dos textos ordenados.", "push añade Café al final y length pasa a valer 3.", "La posición [0] consulta el primer elemento, Museo."],
      "Después de push, ¿qué valor está en lugares[2]?",
      "Café, porque las posiciones son 0, 1 y 2 para los tres elementos.",
      "Añade temporalmente otro curso y comprueba que length cambia solo. Después vuelve a dejar SQL como cuarto elemento.",
      "Después de completar, muestra cursos[cursos.length - 1] para consultar el último curso sin escribir su posición fija.",
      ["Compara la lista inicial con el resultado pedido: falta un elemento y dos consultas.", "push modifica el arreglo; length cuenta su estado actual y [0] lee el primer valor.", 'Ejecuta cursos.push("SQL"), muestra cursos.length y luego cursos[0].'],
      ["Añade SQL mediante el método push y conserva el arreglo en cursos.", "Después de añadirlo, muestra cursos.length para obtener 4.", "Muestra también cursos[0]; el primer valor debe seguir siendo Python."],
      "Ampliaste y consultaste un arreglo. Ahora recorrerás una colección completa para obtener un total."),

    guide("Arreglos, variables con let y salida por consola.",
      "const trayectos = [15, 20, 10];\nlet minutos = 0;\nfor (const tramo of trayectos) {\n  minutos += tramo;\n}\nconsole.log(minutos);",
      ["minutos comienza en cero antes del recorrido.", "for...of entrega 15, 20 y 10; cada vuelta suma el tramo al acumulador.", "Al terminar, minutos vale 45 y se muestra una sola vez fuera del ciclo."],
      "Si añades un tramo de 5, ¿cuántas vueltas habrá y cuál será el total?",
      "Habrá cuatro vueltas y el total será 50. El ciclo se adapta al tamaño del arreglo.",
      "Cambia temporalmente una hora y predice cuánto varía total. Restaura la lista original para completar.",
      "Después de completar, añade un contador de elementos recorridos y compáralo con horas.length.",
      ["El acumulador ya existe; falta repetir la suma para cada número antes de mostrarlo.", "for...of recorre horas y total += hora actualiza la variable declarada con let.", "Antes de console.log escribe for (const hora of horas) { total += hora; }."],
      ["Usa un ciclo for para recorrer la colección.", "Suma cada hora dentro del ciclo hasta que total valga 45.", "Muestra total después del ciclo para que la consola incluya 45."],
      "Acumulaste una colección sin repetir instrucciones. En el próximo nivel encapsularás operaciones dentro de funciones reutilizables."),

    guide("Variables, operadores y llamadas con argumentos.",
      "function triplicar(numero) {\n  return numero * 3;\n}\nconsole.log(triplicar(4));",
      ["La definición guarda una operación bajo el nombre triplicar.", "La llamada envía 4 al parámetro numero y return entrega 12.", "console.log recibe el valor devuelto; definir la función por sí solo no muestra nada."],
      "Si llamas triplicar(0), ¿la función devuelve 0 o deja de ejecutarse?",
      "Devuelve 0. Es un número válido y la multiplicación sigue funcionando.",
      "Prueba doblar(3) y doblar(6). Comprueba que el cuerpo no cambia entre llamadas y restaura la prueba solicitada.",
      "Después de completar, llama doblar dos veces y suma sus resultados antes de mostrarlos.",
      ["Separa la operación reutilizable del valor concreto usado para probarla.", "El parámetro recibe cada número; return debe entregar numero * 2.", "Dentro de doblar usa return numero * 2; y muestra console.log(doblar(6));."],
      ["Conserva una función llamada doblar con un parámetro.", "El return debe multiplicar ese parámetro por 2.", "Llama doblar con 6 y muestra el valor devuelto; debe aparecer 12."],
      "Creaste una operación reutilizable. Ahora expresarás una función breve con un valor predeterminado."),

    guide("Funciones, parámetros, return y operaciones aritméticas.",
      "const precioConPropina = (precio, porcentaje = 10) => precio + (precio * porcentaje) / 100;\nconsole.log(precioConPropina(2000));\nconsole.log(precioConPropina(2000, 20));",
      ["La flecha recibe precio y un porcentaje cuyo valor habitual es 10.", "La primera llamada omite el segundo argumento y devuelve 2200.", "La segunda envía 20, reemplaza el valor predeterminado y devuelve 2400."],
      "¿precioConPropina(2000, 0) utiliza el 10 predeterminado?",
      "No. Cero fue enviado explícitamente, así que se usa 0 y el resultado es 2000.",
      "Prueba descuento(1000, 0) y explica por qué no aplica el 10 %. Después restaura las dos llamadas requeridas.",
      "Después de completar, llama descuento con otro precio sin enviar porcentaje y predice el resultado.",
      ["Identifica qué parte de la función debe cambiar de sintaxis y qué argumento puede omitirse.", "Una flecha de una sola expresión devuelve automáticamente; porcentaje = 10 define el valor por defecto.", "Usa const descuento = (precio, porcentaje = 10) => precio - (precio * porcentaje) / 100; y muestra las dos llamadas."],
      ["Declara descuento como función flecha usando =>.", "Define porcentaje = 10 en la lista de parámetros.", "Muestra descuento(1000) y descuento(1000, 50); deben aparecer 900 y 500."],
      "Usaste una función breve con un valor habitual y una excepción. Ahora encadenarás transformaciones sobre una colección."),

    guide("Arreglos de objetos y funciones flecha.",
      'const planes = [{ nombre: "Museo", horas: 3 }, { nombre: "Parque", horas: 1 }, { nombre: "Café", horas: 2 }];\nconst largos = planes.filter(plan => plan.horas >= 2);\nconsole.log(largos.map(plan => plan.nombre).join(", "));\nconsole.log(planes.reduce((total, plan) => total + plan.horas, 0));',
      ["filter conserva Museo y Café porque duran al menos dos horas.", "map transforma esos objetos en nombres y join los reúne como Museo, Café.", "reduce recorre todos los planes y acumula 3 + 1 + 2, por lo que muestra 6."],
      "¿El total sería 5 si reduce se aplicara sobre largos en vez de planes?",
      "Sí. largos contiene solo Museo y Café; el arreglo elegido determina qué datos se resumen.",
      "Cambia temporalmente el límite a 10 y predice el texto de nombres. Luego restaura >= 9.",
      "Después de completar, crea otro resumen con los nombres de los cursos de menos de 9 horas.",
      ["Divide el trabajo en seleccionar cursos, extraer nombres y sumar horas; identifica qué arreglo usa cada salida.", "filter selecciona, map transforma, join une texto y reduce acumula un número.", 'Filtra con curso.horas >= 9, encadena map(...nombre).join(", ") y reduce todos los cursos desde 0.'],
      ["Selecciona los cursos de 9 horas o más mediante filter.", "Usa map para obtener nombres y reduce para calcular las horas totales.", "La consola debe mostrar Python, APIs y, en otra línea, el total 26."],
      "Convertiste una colección en dos resúmenes. En el proyecto del nivel reunirás objetos, funciones y plantillas."),

    guide("Arreglos de objetos, funciones, reduce y plantillas.",
      'const reservas = [{ nombre: "Entrada", precio: 5000, cantidad: 2 }, { nombre: "Bus", precio: 1500, cantidad: 2 }];\nconst sumar = items => items.reduce((total, item) => total + item.precio * item.cantidad, 0);\nconst unidades = reservas.reduce((total, item) => total + item.cantidad, 0);\nconsole.log(`Reserva: ${unidades} unidades · Total: $${sumar(reservas)}`);',
      ["Cada objeto guarda nombre, precio y cantidad de un concepto.", "sumar multiplica precio por cantidad en cada vuelta y acumula 13000.", "Otro reduce cuenta cuatro unidades y la plantilla presenta ambos resultados en una sola línea."],
      "Si una cantidad cambia de 2 a 3, ¿qué partes del mensaje pueden cambiar?",
      "Cambian tanto las unidades como el total, porque ambos cálculos leen la cantidad actual de cada objeto.",
      "Modifica temporalmente la cantidad del Mouse y predice unidades y total. Restaura 2 para validar.",
      "Después de completar, añade un tercer objeto en una copia y comprueba que ambos acumuladores lo incluyen sin cambiar sus funciones.",
      ["Calcula por separado cuántas unidades hay y cuánto cuestan; después construye el mensaje exacto.", "reduce puede acumular cantidad o precio * cantidad. Una función concentra el cálculo monetario.", "Define una función para el total, calcula unidades recorriendo carrito y muestra la plantilla exacta con ambos valores."],
      ["Define una función tradicional o flecha que calcule a partir de los productos.", "Recorre carrito con reduce o un ciclo para acumular sus datos.", "Muestra exactamente Carrito: 3 productos · Total: $51970."],
      "Construiste un programa completo con datos, cálculos y presentación. El nivel final limpiará, buscará y resumirá información de un catálogo."),

    guide("Arreglos, funciones flecha y transformación con map.",
      'const ciudades = [" Santiago ", "VALPARAÍSO"];\nconst normalizadas = ciudades.map(ciudad => ciudad.trim().toLowerCase());\nconsole.log(normalizadas.join(", "));',
      ["map entrega cada texto a la función flecha sin modificar ciudades.", "trim quita los espacios exteriores y toLowerCase convierte las letras.", "normalizadas guarda santiago y valparaíso; join las muestra en una línea."],
      "¿trim elimina también el espacio interior de Viña del Mar?",
      "No. Solo elimina espacios al comienzo y al final; el espacio entre palabras se conserva.",
      "Añade temporalmente otra etiqueta con espacios y mayúsculas. Predice su forma limpia y luego restaura los datos.",
      "Después de completar, crea un segundo arreglo con las longitudes de las etiquetas limpias.",
      ["Observa qué diferencias impiden comparar las etiquetas: espacios exteriores y mayúsculas.", "map crea el nuevo arreglo; encadena trim() y toLowerCase() para cada texto.", 'Guarda etiquetas.map(etiqueta => etiqueta.trim().toLowerCase()) en limpias y muestra limpias.join(", ").'],
      ["Crea limpias con los tres textos normalizados en minúsculas y sin espacios exteriores.", "Conserva etiquetas exactamente como fue recibido para no perder el dato original.", "Muestra html, css, javascript separados por coma y espacio."],
      "Normalizaste datos sin alterar el origen. Ahora buscarás un elemento por su identificador."),

    guide("Arreglos de objetos, funciones, ciclos y condiciones.",
      'const lugares = [{ id: 1, nombre: "Museo" }, { id: 2, nombre: "Parque" }];\nfunction buscarLugar(lista, id) {\n  for (const lugar of lista) {\n    if (lugar.id === id) return lugar.nombre;\n  }\n  return "No encontrado";\n}\nconsole.log(buscarLugar(lugares, 2));\nconsole.log(buscarLugar(lugares, 99));',
      ["La función recibe una lista y un id, por lo que puede resolver distintas búsquedas.", "El ciclo compara cada lugar y return entrega Parque cuando encuentra el id 2.", "Para 99 el ciclo termina sin coincidencia y el return final entrega No encontrado."],
      "¿Qué falla si return No encontrado queda dentro del ciclo?",
      "La función abandonaría la búsqueda después del primer elemento que no coincide y podría ignorar una coincidencia posterior.",
      "Invierte temporalmente el orden de los cursos y comprueba que la función mantiene el resultado. Luego restaura el catálogo.",
      "Después de completar, añade otro curso y prueba su id sin cambiar el cuerpo de buscarNombre.",
      ["Sigue la búsqueda del id 2 elemento por elemento y localiza cuándo debería terminar la función.", "return de coincidencia va dentro de if; el mensaje de ausencia debe ejecutarse solo después de recorrer todo.", 'Recorre lista con for...of, usa if (curso.id === id) return curso.nombre; y deja return "No encontrado" después del ciclo.'],
      ["Define buscarNombre como una función que reciba lista e id.", "Conserva sin cambios los dos objetos originales del arreglo cursos.", "Las tres pruebas deben mostrar SQL, HTML y No encontrado, en ese orden."],
      "Creaste una búsqueda reutilizable con un caso de ausencia. A continuación calcularás dos indicadores en un mismo recorrido."),

    guide("Arreglos numéricos, ciclos, acumuladores y condiciones.",
      "const minutos = [30, 0, 45, 15];\nlet total = 0;\nlet dias = 0;\nfor (const valor of minutos) {\n  total += valor;\n  if (valor > 0) dias += 1;\n}\nconsole.log(total);\nconsole.log(dias);",
      ["total suma todos los valores, incluido el cero, y termina en 90.", "dias aumenta solamente cuando el valor es mayor que cero, por lo que termina en 3.", "Las dos variables responden preguntas distintas aunque se actualicen en el mismo ciclo."],
      "Si agregas otro cero, ¿cambian total, dias o ninguno?",
      "Ninguno cambia: sumar cero conserva el total y la condición no aumenta dias. El ciclo sí realiza una vuelta adicional.",
      "Cambia temporalmente un cero por 2 y predice ambos resultados. Restaura la lista antes de completar.",
      "Después de completar, añade inactivos y cuenta cuántos valores son exactamente cero.",
      ["Separa las dos preguntas: cuántas horas hubo en total y en cuántos días hubo actividad.", "Suma cada valor siempre; aumenta activos solo dentro de if (valor > 0).", "Recorre horas con for...of, usa total += valor y activos += 1 bajo la condición; muestra ambos al final."],
      ["Acumula todos los valores hasta que total sea 6.", "Cuenta solamente los valores mayores que cero hasta que activos sea 3.", "Muestra primero 6 y después 3 en dos líneas de la consola."],
      "Calculaste total y frecuencia en un recorrido. El último módulo integrará selección, transformación y resumen."),

    guide("Objetos, filter, map, reduce, ciclos y presentación por consola.",
      'const actividades = [{ nombre: "Museo", horas: 3 }, { nombre: "Parque", horas: 5 }, { nombre: "Excursión", horas: 8 }];\nconst breves = actividades.filter(actividad => actividad.horas <= 5);\nlet total = 0;\nfor (const actividad of breves) total += actividad.horas;\nconsole.log(breves.map(actividad => actividad.nombre).join(", "));\nconsole.log(total);',
      ["filter conserva Museo y Parque porque el límite <= 5 incluye ambos.", "El ciclo suma solo las actividades seleccionadas y total queda en 8.", "map extrae sus nombres y join construye Museo, Parque antes de mostrar el total."],
      "Si una actividad dura exactamente 5 horas, ¿pertenece a breves?",
      "Sí. El operador <= incluye el valor límite; con < 5 quedaría fuera.",
      "Cambia temporalmente SQL a 7 horas y anticipa nombres y total. Restaura 5 para completar.",
      "Después de completar, crea otro reporte para los cursos de más de seis horas sin modificar cursos.",
      ["Identifica primero qué cursos cumplen el límite y calcula el total solo a partir de ese resultado.", "filter selecciona con <= 6; map obtiene nombres y el ciclo puede sumar horas de breves.", 'Crea breves = cursos.filter(curso => curso.horas <= 6), acumula sus horas y muestra breves.map(...).join(", ") seguido de total.'],
      ["Selecciona exactamente HTML y SQL dentro de breves.", "Suma las horas de esos dos cursos hasta obtener total = 11.", "Muestra HTML, SQL en la primera línea y 11 en la segunda."],
      "Completaste la ruta transformando un catálogo en un reporte verificable. Ya puedes volver a cualquier nivel y combinar datos, decisiones y funciones en programas propios.")
  ];

  const levelCopy = [
    ["Finalizaste los datos y expresiones de JavaScript.", "Ya puedes guardar texto y números, calcular, construir mensajes y obtener booleanos. Antes del mini examen, cambia un dato en cada ejemplo y anticipa su salida. El siguiente nivel usará esas comparaciones para decidir y recorrer colecciones."],
    ["Finalizaste las decisiones y colecciones de JavaScript.", "Ya puedes elegir entre caminos, ampliar arreglos y acumular sus valores. Antes del mini examen, prueba un límite y explica qué rama o vuelta cambia. En el próximo nivel reunirás operaciones dentro de funciones."],
    ["Finalizaste las funciones y el proyecto integrado.", "Ya puedes definir funciones, usar valores predeterminados y transformar objetos con métodos de arreglos. Antes del mini examen, llama una función con otro dato y predice su resultado. El nivel final aplicará estas herramientas a datos recibidos."],
    ["Finalizaste la transformación de datos con JavaScript.", "Ya puedes normalizar textos, buscar objetos, calcular indicadores y construir reportes sin alterar el origen. Antes del mini examen, explica la entrada y salida de cada etapa del último reporte."]
  ];

  function apply(course) {
    if (!course?.levels) return;
    const modules = course.levels.flatMap(level => level.modules);
    if (modules.length !== lessons.length) return;
    modules.forEach((module, index) => {
      const content = lessons[index];
      module.example = content.example;
      module.hints = content.hints;
      module.success = content.success;
      module.lesson = {
        prerequisites: content.prerequisites,
        walkthrough: content.walkthrough,
        prediction: content.prediction,
        answer: content.answer,
        reflection: content.reflection,
        extension: content.extension,
        feedback: content.feedback
      };
    });
    course.levels.forEach((level, index) => {
      level.completionTitle = levelCopy[index][0];
      level.completionCopy = levelCopy[index][1];
      level.approvedCopy = `Aprobaste el mini examen de ${level.title.toLowerCase()}. Puedes repetirlo cuando quieras para repasar.`;
    });
  }

  globalThis.JavaScriptLearning = { apply, lessons };
})();
