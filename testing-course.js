/* Las pruebas del alumno se ejecutan sobre la función correcta y variantes con errores. */
(() => {
  "use strict";
  const mutant = (name, code) => ({ name, code });
  const scenarios = [
    { reference: "function sumar(a, b) { return a + b; }", mutants: [mutant("Resta en vez de sumar", "function sumar(a, b) { return a - b; }")] },
    { reference: 'function saludar(nombre) { return "Hola, " + nombre; }', mutants: [mutant("Falta el espacio del saludo", 'function saludar(nombre) { return "Hola," + nombre; }')] },
    { reference: "function esPar(n) { return n % 2 === 0; }", mutants: [mutant("Devuelve verdadero para todos", "function esPar(n) { return true; }")] },
    { reference: "function esMayor(edad) { return edad >= 18; }", mutants: [mutant("Excluye exactamente 18", "function esMayor(edad) { return edad > 18; }")] },
    { reference: "function total(valores) { let suma = 0; for (const valor of valores) { suma = suma + valor; } return suma; }", mutants: [mutant("Acumulador empieza en uno", "function total(valores) { let suma = 1; for (const valor of valores) { suma = suma + valor; } return suma; }")] },
    { reference: "function activos(cursos) { return cursos.filter(function (curso) { return curso.activo; }); }", mutants: [mutant("No filtra los cursos inactivos", "function activos(cursos) { return cursos; }")] },
    { reference: "function agregar(lista, valor) { const copia = lista.slice(); copia.push(valor); return copia; }", mutants: [mutant("Modifica la lista original", "function agregar(lista, valor) { lista.push(valor); return lista; }")] },
    { reference: "function normalizar(texto) { return texto.trim().toLowerCase(); }", mutants: [mutant("Conserva espacios exteriores", "function normalizar(texto) { return texto.toLowerCase(); }"), mutant("Conserva mayúsculas", "function normalizar(texto) { return texto.trim(); }")] },
    { reference: "function precio(cantidad) { if (cantidad >= 3) { return cantidad * 10; } return cantidad * 10 + 5; }", mutants: [mutant("Regala envío desde dos unidades", "function precio(cantidad) { if (cantidad >= 2) { return cantidad * 10; } return cantidad * 10 + 5; }"), mutant("Cobra envío en tres unidades", "function precio(cantidad) { if (cantidad > 3) { return cantidad * 10; } return cantidad * 10 + 5; }")] },
    { reference: "function buscar(cursos, id) { for (const curso of cursos) { if (curso.id === id) { return curso; } } return null; }", mutants: [mutant("La ausencia devuelve undefined", "function buscar(cursos, id) { for (const curso of cursos) { if (curso.id === id) { return curso; } } }"), mutant("Siempre devuelve el primer curso", "function buscar(cursos, id) { return cursos[0]; }")] },
    { reference: "function resumen(cursos) { let horas = 0; for (const curso of cursos) { horas = horas + curso.horas; } return { cantidad: cursos.length, horas: horas }; }", mutants: [mutant("Cuenta un curso de más", "function resumen(cursos) { let horas = 0; for (const curso of cursos) { horas = horas + curso.horas; } return { cantidad: cursos.length + 1, horas: horas }; }"), mutant("Ignora la suma de horas", "function resumen(cursos) { return { cantidad: cursos.length, horas: 0 }; }")] },
    { reference: "function carrito(precios) { let suma = 0; for (const precio of precios) { suma = suma + precio; } if (suma >= 100) { return suma * 0.9; } return suma; }", mutants: [
      mutant("Excluye el umbral de 100", "function carrito(precios) { let suma = 0; for (const precio of precios) { suma = suma + precio; } if (suma > 100) { return suma * 0.9; } return suma; }"),
      mutant("Aplica veinte por ciento", "function carrito(precios) { let suma = 0; for (const precio of precios) { suma = suma + precio; } if (suma >= 100) { return suma * 0.8; } return suma; }"),
      mutant("Solo suma el primer precio", "function carrito(precios) { if (precios.length === 0) { return 0; } if (precios[0] >= 100) { return precios[0] * 0.9; } return precios[0]; }"),
      mutant("Cobra un carrito vacío", "function carrito(precios) { if (precios.length === 0) { return 5; } let suma = 0; for (const precio of precios) { suma = suma + precio; } if (suma >= 100) { return suma * 0.9; } return suma; }")
    ] }
  ];
  const content = [
    {
      title: "Tu primera aserción con un resultado esperado", shortTitle: "Una aserción",
      intro: "Una prueba expresa una expectativa que una máquina puede comprobar. Su valor aparece cuando deja de pasar al introducir un error en el programa.",
      explanation: "test recibe un nombre y una función. Dentro, equal compara el resultado real con el esperado usando igualdad estricta de valores. sumar ya está disponible: escribe la prueba, no otra implementación. El laboratorio repite tus pruebas contra una versión que resta.",
      concepts: ["La prueba tiene un nombre que explica el caso.", "equal recibe primero lo real y después lo esperado.", "Una prueba útil falla cuando se rompe el comportamiento."],
      goal: "Escribe una prueba de sumar con una aserción que pase al sumar y falle si la función resta.",
      hints: ['Empieza con test("suma dos números", function () { ... });', "Llama a sumar con dos valores, por ejemplo 2 y 3.", "Comprueba con equal que el resultado sea 5."], minTests: 1, minAssertions: 1
    },
    {
      title: "Los espacios también son parte del contrato", shortTitle: "Comparar texto",
      intro: "Un resultado casi igual puede seguir siendo incorrecto. Una aserción exacta sobre texto detecta espacios y signos que se pierden en una revisión visual rápida.",
      explanation: "saludar devuelve Hola, seguido de un espacio y el nombre recibido. equal no recorta ni normaliza la salida. La variante defectuosa elimina el espacio, por lo que tu expectativa debe conservarlo.",
      concepts: ["La comparación exacta conserva espacios.", "El resultado esperado se escribe de forma independiente.", "Copiar el resultado real como esperado no verifica nada."],
      goal: "Comprueba el saludo de una persona y detecta la versión que omite el espacio después de la coma.",
      hints: ["Usa un nombre concreto como Ana.", 'El esperado es "Hola, Ana", con un espacio.', "No compares saludar con otra llamada idéntica a saludar."], minTests: 1, minAssertions: 1
    },
    {
      title: "Cubrir las dos respuestas de una condición", shortTitle: "Verdadero y falso",
      intro: "Probar solo un número par deja pasar una función que responde verdadero siempre. Necesitas casos que obliguen al programa a tomar decisiones diferentes.",
      explanation: "esPar debe devolver true para un número par y false para uno impar. Escribe dos pruebas con nombres distintos. Usa equal para exigir un booleano concreto; ok comprueba veracidad, pero por sí solo no comprueba el tipo exacto.",
      concepts: ["Un caso positivo no cubre la respuesta negativa.", "equal puede exigir exactamente true o false.", "ok acepta cualquier valor verdadero en una condición."],
      goal: "Escribe dos pruebas de esPar: una para un número par y otra para un impar, y detecta la respuesta constante.",
      hints: ["Prueba esPar(4) contra true.", "Prueba esPar(3) contra false.", "Pon cada caso dentro de su propio test con nombre."], minTests: 2, minAssertions: 2
    },
    {
      title: "Revisar exactamente el límite", shortTitle: "Casos de frontera",
      intro: "Los errores de comparación suelen vivir justo en el umbral. Probar valores muy alejados puede ocultar la diferencia entre mayor y mayor o igual.",
      explanation: "esMayor considera 18 como parte del grupo admitido. Prueba un valor inmediatamente inferior y el valor exacto. Estas fronteras se usan en edades, tamaños, cupos y descuentos; el contrato de este ejemplo es solo una regla didáctica.",
      concepts: ["> y >= difieren exactamente en el límite.", "Un caso debajo del límite comprueba el rechazo.", "La regla esperada se decide antes de escribir la prueba."],
      goal: "Crea dos pruebas para esMayor: 17 debe dar false y exactamente 18 debe dar true.",
      hints: ["El primer test cubre el caso 17.", "El segundo cubre 18, no 20.", "Usa equal con booleanos sin comillas."], minTests: 2, minAssertions: 2
    },
    {
      title: "No olvidar la colección vacía", shortTitle: "Listas vacías",
      intro: "Una colección vacía es una entrada normal en muchas aplicaciones. Probarla aclara cómo se inicializa el acumulador antes de recorrer elementos.",
      explanation: "total suma números y devuelve cero si no hay ninguno. Comprueba tanto una lista con datos como una vacía. El error introducido comienza la suma en uno, así que el caso vacío permite localizar la causa con claridad.",
      concepts: ["El acumulador tiene un valor inicial.", "Una lista vacía no ejecuta ninguna vuelta.", "Los nombres deben distinguir el caso vacío del caso con datos."],
      goal: "Escribe una prueba para total de una lista con números y otra para total de una lista vacía.",
      hints: ["Prueba total([2, 3]) contra 5.", "Prueba total([]) contra 0.", "Usa dos test con nombres que describan la entrada."], minTests: 2, minAssertions: 2
    },
    {
      title: "Comparar el contenido de una estructura", shortTitle: "Igualdad de estructuras",
      intro: "Dos listas con los mismos registros pueden ocupar lugares distintos en memoria. Para comprobar sus datos necesitas una comparación estructural.",
      explanation: "deepEqual compara recursivamente listas y objetos sencillos de este laboratorio. activos debe conservar solo los cursos cuyo campo activo sea verdadero. Usa un conjunto mixto para que omitir el filtro sea observable.",
      concepts: ["equal sobre objetos compara identidad.", "deepEqual compara el contenido de estructuras sencillas.", "Una lista mixta obliga a ejercer el filtro."],
      goal: "Prueba activos con un curso activo y uno inactivo, y compara la lista resultante con deepEqual.",
      hints: ["Crea dos objetos con nombre y activo.", "Llama a activos con ambos.", "El esperado contiene solamente el objeto activo."], minTests: 1, minAssertions: 1
    },
    {
      title: "Comprobar también lo que no debe cambiar", shortTitle: "Evitar mutaciones",
      intro: "Una función puede devolver el valor correcto y alterar datos que otra parte del programa necesita. La prueba debe observar el contrato completo.",
      explanation: "agregar devuelve una copia con un elemento nuevo y conserva la lista de entrada. Comprueba ambos resultados dentro del mismo caso. La versión defectuosa devuelve una lista correcta, pero modifica el argumento original.",
      concepts: ["El resultado no es el único efecto observable.", "Una copia puede proteger datos compartidos.", "Comprobar el original detecta una mutación accidental."],
      goal: "Prueba agregar con dos aserciones: verifica la lista devuelta y comprueba que la lista original no cambió.",
      hints: ["Guarda una lista original, por ejemplo [1].", "Comprueba que agregar(original, 2) produzca [1, 2].", "Después, usa deepEqual(original, [1])."], minTests: 1, minAssertions: 2
    },
    {
      title: "Separar responsabilidades en casos distintos", shortTitle: "Normalización",
      intro: "Cuando una función realiza dos transformaciones, una sola entrada puede dificultar saber cuál falló. Los casos enfocados producen diagnósticos más claros.",
      explanation: "normalizar quita espacios exteriores y convierte letras a minúsculas. Hay una variante que olvida cada operación. Escribe un caso para espacios y otro para mayúsculas; mira cuál nombre falla en cada variante.",
      concepts: ["Cada caso puede aislar una responsabilidad.", "Un nombre claro explica el defecto.", "Detectar dos variantes requiere entradas que las distingan."],
      goal: "Escribe al menos dos pruebas de normalizar que detecten espacios conservados y mayúsculas conservadas.",
      hints: ['Prueba " ana " contra "ana".', 'Prueba "ANA" contra "ana".', "Da un nombre diferente a cada transformación."], minTests: 2, minAssertions: 2
    },
    {
      title: "Probar ambos lados de una regla de negocio", shortTitle: "Envío y umbrales",
      intro: "Una regla con umbral puede adelantarse o retrasarse por un solo carácter. Probar ambos lados ayuda a detectar las dos direcciones del error.",
      explanation: "precio cobra diez por unidad y cinco de envío cuando compras menos de tres unidades. Desde tres el envío es gratis. La entrada de este ejercicio es una cantidad entera positiva. Comprueba dos y tres unidades para cubrir ambos lados.",
      concepts: ["El contrato define las entradas admitidas.", "Una prueba debajo del umbral detecta una activación temprana.", "Una prueba en el umbral detecta una activación tardía."],
      goal: "Escribe dos pruebas: dos unidades cuestan 25 y tres unidades cuestan 30, detectando ambos errores de envío.",
      hints: ["Llama a precio(2) en el primer test.", "Llama a precio(3) en el segundo.", "Escribe los esperados 25 y 30 de forma literal."], minTests: 2, minAssertions: 2
    },
    {
      title: "Distinguir un resultado de una ausencia", shortTitle: "Búsqueda y ausencia",
      intro: "Una búsqueda debe explicar qué sucede cuando no encuentra nada. Confundir una ausencia declarada con un retorno olvidado puede ocultar errores posteriores.",
      explanation: "buscar devuelve el registro cuyo id coincide o null cuando no existe. Prueba encontrar un registro que no sea el primero y también buscar uno ausente. Usa deepEqual para el registro y equal para null.",
      concepts: ["El contrato define cómo representa la ausencia.", "null y undefined son valores distintos.", "Buscar el segundo registro detecta un retorno constante del primero."],
      goal: "Escribe una prueba que encuentre el segundo curso de una lista y otra que exija null para un id inexistente.",
      hints: ["Crea dos cursos con ids 1 y 2.", "Busca el id 2 y compara su objeto completo.", "Busca el id 99 y exige exactamente null."], minTests: 2, minAssertions: 2
    },
    {
      title: "Proteger todas las partes de un resumen", shortTitle: "Contrato de un resultado",
      intro: "Una salida con varios campos puede estar parcialmente bien. Comprobar solo el contador dejaría sin protección la suma de horas.",
      explanation: "resumen devuelve cantidad y horas a partir de los cursos. Comprueba el objeto completo con datos y en el caso vacío. El comparador estructural no exige que las claves se escriban en el mismo orden, pero sí que existan los mismos campos y valores.",
      concepts: ["Una aserción estructural puede cubrir varios campos.", "El orden de las claves de un objeto no cambia sus datos.", "El caso vacío también debe cumplir el contrato."],
      goal: "Prueba resumen con dos cursos y con una lista vacía, exigiendo los campos cantidad y horas correctos.",
      hints: ["Usa cursos de 4 y 6 horas.", "El resumen debe ser { cantidad: 2, horas: 10 }.", "Para la lista vacía exige { cantidad: 0, horas: 0 }."], minTests: 2, minAssertions: 2
    },
    {
      title: "Una suite que resiste cuatro regresiones", shortTitle: "Proyecto: carrito",
      intro: "Una suite pequeña puede proteger comportamientos distintos si sus casos se eligen bien. Este cierre reúne acumulación, vacíos, umbrales y una regla de descuento.",
      explanation: "carrito suma los precios; desde un total de 100 aplica diez por ciento de descuento y un carrito vacío cuesta cero. Tus pruebas se repiten contra cuatro errores. Detectarlos demuestra cobertura de estos casos, no garantiza que no existan otros defectos.",
      concepts: ["Cada caso protege un comportamiento concreto.", "Una regresión rompe un comportamiento previamente esperado.", "La detección de variantes no equivale a cobertura completa."],
      goal: "Escribe al menos cuatro pruebas para carrito: vacío, bajo el umbral, exactamente 100 y por encima de 100; detecta las cuatro regresiones.",
      hints: ["Prueba [] y [10, 20] contra 0 y 30.", "Prueba [40, 60] contra 90 para cubrir el umbral y la suma.", "Prueba [100, 100] contra 180 y usa nombres descriptivos."], minTests: 4, minAssertions: 4
    }
  ];
  const lessons = content.map((m, i) => ({ ...m, scenario: scenarios[i],
    example: scenarios[i].reference + '\n\n// API del laboratorio:\n// test("nombre", function () { equal(real, esperado); });',
    starter: 'test("' + m.shortTitle + '", function () {\n  // Escribe aquí tus aserciones.\n});\n',
    checks: [
      { label: "Las pruebas pasan con la implementación correcta", test: (_, r) => r.reference.passed },
      { label: "Detecta todas las versiones con errores", test: (_, r) => r.mutants.length > 0 && r.mutants.every((v) => v.detected) },
      { label: "Incluye al menos " + m.minTests + (m.minTests === 1 ? " prueba" : " pruebas") + " y " + m.minAssertions + (m.minAssertions === 1 ? " aserción" : " aserciones"), test: (_, r) => r.reference.tests.length >= m.minTests && r.reference.assertions >= m.minAssertions }
    ]
  }));
  const questions = [
    [
      ["¿Qué expresa una aserción?", ["Una animación", "Una expectativa comprobable", "Una contraseña", "Un comentario opcional"], 1, "La aserción compara el comportamiento observado con el esperado."],
      ["¿Qué orden usa equal en este laboratorio?", ["Esperado, real", "Nombre, función", "Real, esperado", "Archivo, línea"], 2, "Se escribe primero el valor observado y después el esperado."],
      ["¿Por qué probar un número impar además de uno par?", ["Para detectar una respuesta siempre verdadera", "Para imprimir más", "Para cambiar el tipo", "Para evitar booleanos"], 0, "El caso negativo obliga a comprobar otra respuesta de la función."],
      ["¿Qué entrada distingue > 18 de >= 18?", ["100", "0", "17", "18"], 3, "La diferencia entre ambas comparaciones aparece exactamente en el umbral."],
      ["¿Comparar sumar(2,3) consigo mismo es una buena expectativa?", ["Sí, siempre", "No, reproduce el mismo resultado aunque esté mal", "Solo en móvil", "Solo con números grandes"], 1, "El esperado debe representar el contrato de forma independiente del resultado."]
    ],
    [
      ["¿Qué revela el caso de una lista vacía?", ["El color", "La red", "El valor inicial del acumulador", "La fecha"], 2, "Sin elementos no hay iteraciones; el resultado depende de la inicialización."],
      ["¿Para qué sirve deepEqual aquí?", ["Para comparar estructuras sencillas por contenido", "Para ordenar listas", "Para editar archivos", "Para descargar datos"], 0, "El comparador recorre listas y objetos en vez de comparar solo su identidad."],
      ["¿Qué detecta comprobar la lista original después de agregar?", ["Un cambio de idioma", "Un fallo de DNS", "Una diferencia de color", "Una mutación accidental"], 3, "El contrato puede exigir que el argumento original se conserve intacto."],
      ["¿Por qué separar espacios y mayúsculas en casos distintos?", ["Para duplicar errores", "Para identificar qué transformación falla", "Para evitar aserciones", "Para ordenar archivos"], 1, "Un caso enfocado permite relacionar el nombre fallido con una responsabilidad."],
      ["¿Un test sin aserciones aprueba este laboratorio?", ["Sí", "Solo si tiene nombre", "No", "Solo si es largo"], 2, "Cada prueba debe ejecutar al menos una comprobación efectiva."]
    ],
    [
      ["¿Qué casos cubren el umbral de envío gratis desde tres?", ["Dos y tres unidades", "Diez y veinte", "Solo una", "Solo cien"], 0, "Los casos adyacentes detectan activación temprana y tardía de la regla."],
      ["Si el contrato exige null al no encontrar, ¿sirve undefined?", ["Sí", "No, son valores distintos", "Solo con listas vacías", "Solo en producción"], 1, "Una ausencia declarada y un retorno olvidado no tienen el mismo valor."],
      ["¿Qué debe comprobarse en un resumen de cantidad y horas?", ["Solo la cantidad", "Solo el primer campo", "Solo el nombre", "Ambos campos y el caso vacío"], 3, "Comprobar la estructura completa protege todas las partes del contrato."],
      ["¿Qué es una regresión?", ["Un cambio de color", "Un examen aprobado", "Un comportamiento que deja de cumplir lo esperado", "Un archivo nuevo"], 2, "Una regresión rompe una expectativa que antes se cumplía."],
      ["¿Detectar cuatro variantes demuestra que no quedan errores?", ["Sí", "No, solo aporta evidencia sobre los casos probados", "Si son cuatro exactamente", "Si se usa deepEqual"], 1, "Las variantes ayudan a evaluar las pruebas, pero no cubren todos los programas posibles."]
    ]
  ];
  globalThis.CourseKit.define({ id: "testing", globalName: "TestingCourse", name: "Pruebas automatizadas", kind: "testing", file: "pruebas.js",
    levels: ["Expectativas y fronteras", "Colecciones y efectos", "Contratos y regresiones"], lessons, questions });
})();
