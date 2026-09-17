(() => {
  "use strict";

  const exact = expected => (code, result) => result.text === expected;
  const check = (label, test) => ({ label, test });

  const levelSpecs = [
    {
      title: "Decisiones declarativas", description: "Transformar, filtrar y comprobar colecciones", modules: [
        {
          id: 17, title: "Calcula precios con map", short: "map y Math.round", topic: "Transformar",
          explanation: "map crea un arreglo nuevo aplicando la misma operación a cada valor. Math.round evita conservar decimales en este cálculo de precios.",
          concepts: ["map conserva la cantidad de elementos", "El callback recibe cada precio", "Math.round redondea el resultado"],
          example: 'const numeros = [2, 4, 6];\nconst dobles = numeros.map((numero) => numero * 2);\nconsole.log(dobles.join(", "));',
          goal: "A partir de 1000, 2500 y 4000, crea finales con map y el precio multiplicado por 1.19, redondeado con Math.round. Muestra los tres valores separados por coma.",
          starter: 'const precios = [1000, 2500, 4000];\nconst finales = precios;\nconsole.log(finales.join(", "));',
          solution: 'const precios = [1000, 2500, 4000];\nconst finales = precios.map((precio) => Math.round(precio * 1.19));\nconsole.log(finales.join(", "));',
          expected: "1190, 2975, 4760", patterns: [["Transforma con map", /\.map\s*\(/], ["Redondea cada precio", /Math\.round\s*\(/]],
          hints: ["Crea finales desde precios.map(...).", "El callback recibe precio y devuelve precio * 1.19.", "Rodea el cálculo con Math.round y une finales con coma."]
        },
        {
          id: 18, title: "Filtra cursos disponibles", short: "filter", topic: "Seleccionar",
          explanation: "filter conserva los objetos cuyo callback devuelve true. El arreglo original mantiene todos sus elementos.",
          concepts: ["filter selecciona sin modificar el origen", "Una propiedad booleana puede ser la condición", "map extrae los nombres elegidos"],
          example: 'const edades = [16, 21, 18];\nconst adultas = edades.filter((edad) => edad >= 18);\nconsole.log(adultas.join(", "));',
          goal: "Filtra los cursos con disponible igual a true, transforma el resultado a sus nombres y muestra HTML, JavaScript.",
          starter: 'const cursos = [{ nombre: "HTML", disponible: true }, { nombre: "CSS", disponible: false }, { nombre: "JavaScript", disponible: true }];\nconsole.log(cursos.length);',
          solution: 'const cursos = [{ nombre: "HTML", disponible: true }, { nombre: "CSS", disponible: false }, { nombre: "JavaScript", disponible: true }];\nconst disponibles = cursos.filter((curso) => curso.disponible === true);\nconsole.log(disponibles.map((curso) => curso.nombre).join(", "));',
          expected: "HTML, JavaScript", patterns: [["Selecciona con filter", /\.filter\s*\(/], ["Comprueba la propiedad disponible", /\.disponible\s*===\s*true/]],
          hints: ["Crea disponibles con cursos.filter(...).", "Devuelve curso.disponible === true en el callback.", "Usa map para obtener nombres y join para mostrarlos."]
        },
        {
          id: 19, title: "Encuentra un curso por id", short: "find", topic: "Buscar",
          explanation: "find devuelve el primer elemento que cumple la condición. Es adecuado cuando necesitas un objeto concreto en lugar de otra lista.",
          concepts: ["find devuelve un elemento", "La igualdad estricta evita conversiones", "El resultado permite leer sus propiedades"],
          example: 'const personas = [{ id: 1, nombre: "Ada" }, { id: 2, nombre: "Lin" }];\nconst persona = personas.find((item) => item.id === 2);\nconsole.log(persona.nombre);',
          goal: "Busca el curso con id 3 mediante find y muestra su nombre: APIs.",
          starter: 'const cursos = [{ id: 1, nombre: "HTML" }, { id: 2, nombre: "SQL" }, { id: 3, nombre: "APIs" }];\nconst encontrado = cursos[0];\nconsole.log(encontrado.nombre);',
          solution: 'const cursos = [{ id: 1, nombre: "HTML" }, { id: 2, nombre: "SQL" }, { id: 3, nombre: "APIs" }];\nconst encontrado = cursos.find((curso) => curso.id === 3);\nconsole.log(encontrado.nombre);',
          expected: "APIs", patterns: [["Busca con find", /\.find\s*\(/], ["Compara el id con 3", /\.id\s*===\s*3/]],
          hints: ["Crea encontrado desde cursos.find(...).", "El callback compara curso.id === 3.", "Muestra encontrado.nombre después de la búsqueda."]
        },
        {
          id: 20, title: "Comprueba reglas del grupo", short: "some y every", topic: "Comprobar",
          explanation: "every exige que todos cumplan una regla; some solo necesita un caso. Ambos devuelven booleanos y dejan intacto el arreglo.",
          concepts: ["every verifica todos los elementos", "some busca al menos uno", "Los resultados son booleanos"],
          example: 'const valores = [2, 4, 8];\nconsole.log(valores.every((valor) => valor > 0));\nconsole.log(valores.some((valor) => valor > 5));',
          goal: "Con notas 7, 5 y 6, guarda aprobadas usando every con mínimo 4 y destacada usando some con mínimo 7. Muestra ambos booleanos.",
          starter: 'const notas = [7, 5, 6];\nconst aprobadas = false;\nconst destacada = false;\nconsole.log(aprobadas);\nconsole.log(destacada);',
          solution: 'const notas = [7, 5, 6];\nconst aprobadas = notas.every((nota) => nota >= 4);\nconst destacada = notas.some((nota) => nota >= 7);\nconsole.log(aprobadas);\nconsole.log(destacada);',
          expected: "true\ntrue", patterns: [["Comprueba a todo el grupo con every", /\.every\s*\(/], ["Busca un caso con some", /\.some\s*\(/]],
          hints: ["aprobadas nace de notas.every(...).", "La regla general es nota >= 4.", "destacada usa some con nota >= 7; muestra las dos variables."]
        }
      ]
    },
    {
      title: "Reducciones y reportes", description: "Acumular, contar, elegir y encadenar", modules: [
        {
          id: 21, title: "Calcula el total del carrito", short: "reduce con objetos", topic: "Acumular",
          explanation: "reduce transporta un acumulador entre elementos. Un valor inicial numérico deja claro que el resultado será un total.",
          concepts: ["reduce combina una colección", "El acumulador empieza en cero", "Cada objeto aporta precio por cantidad"],
          example: 'const importes = [1200, 800, 500];\nconst total = importes.reduce((suma, importe) => suma + importe, 0);\nconsole.log(total);',
          goal: "Calcula con reduce el total del carrito y muestra 51970.",
          starter: 'const carrito = [{ precio: 25990, cantidad: 1 }, { precio: 12990, cantidad: 2 }];\nconst total = 0;\nconsole.log(total);',
          solution: 'const carrito = [{ precio: 25990, cantidad: 1 }, { precio: 12990, cantidad: 2 }];\nconst total = carrito.reduce((suma, item) => suma + item.precio * item.cantidad, 0);\nconsole.log(total);',
          expected: "51970", patterns: [["Resume con reduce", /\.reduce\s*\(/], ["Multiplica precio por cantidad", /\.precio\s*\*\s*item\.cantidad|item\.precio\s*\*\s*item\.cantidad/]],
          hints: ["Crea total desde carrito.reduce(..., 0).", "El callback recibe suma e item.", "Devuelve suma + item.precio * item.cantidad."]
        },
        {
          id: 22, title: "Cuenta elementos por categoría", short: "Contador por clave", topic: "Agrupar",
          explanation: "Un objeto puede funcionar como tabla de conteos. Cada categoría se usa como clave y su valor aumenta durante el recorrido.",
          concepts: ["Las claves representan categorías", "|| 0 inicia un contador ausente", "for...of recorre cada dato"],
          example: 'const colores = ["azul", "verde", "azul"];\nconst conteo = {};\nfor (const color of colores) { conteo[color] = (conteo[color] || 0) + 1; }\nconsole.log(conteo.azul);',
          goal: "Cuenta web y datos en web, datos, web, web, datos. Muestra web: 3 y datos: 2.",
          starter: 'const categorias = ["web", "datos", "web", "web", "datos"];\nconst conteo = {};\nconsole.log("web:", 0);\nconsole.log("datos:", 0);',
          solution: 'const categorias = ["web", "datos", "web", "web", "datos"];\nconst conteo = {};\nfor (const categoria of categorias) { conteo[categoria] = (conteo[categoria] || 0) + 1; }\nconsole.log("web:", conteo.web);\nconsole.log("datos:", conteo.datos);',
          expected: "web: 3\ndatos: 2", patterns: [["Recorre las categorías", /for\s*\(\s*const\s+categoria\s+of\s+categorias\s*\)/], ["Incrementa una clave dinámica", /conteo\s*\[\s*categoria\s*\]\s*=/]],
          hints: ["Recorre categorias con for...of.", "Usa conteo[categoria] como clave dinámica.", "Asigna (conteo[categoria] || 0) + 1 y muestra ambas propiedades."]
        },
        {
          id: 23, title: "Elige el mejor resultado", short: "reduce comparador", topic: "Comparar",
          explanation: "reduce también puede conservar un objeto. En cada vuelta compara el candidato con el mejor conocido y devuelve uno de los dos.",
          concepts: ["El acumulador puede ser un objeto", "La comparación decide qué objeto continúa", "El primer elemento sirve como valor inicial"],
          example: 'const personas = [{ nombre: "Ana", puntos: 8 }, { nombre: "Leo", puntos: 11 }];\nconst mejor = personas.reduce((actual, persona) => persona.puntos > actual.puntos ? persona : actual);\nconsole.log(mejor.nombre);',
          goal: "Encuentra con reduce el curso de mayor puntaje y muestra CSS 94.",
          starter: 'const cursos = [{ nombre: "HTML", puntaje: 88 }, { nombre: "CSS", puntaje: 94 }, { nombre: "JS", puntaje: 91 }];\nconst mejor = cursos[0];\nconsole.log(mejor.nombre, mejor.puntaje);',
          solution: 'const cursos = [{ nombre: "HTML", puntaje: 88 }, { nombre: "CSS", puntaje: 94 }, { nombre: "JS", puntaje: 91 }];\nconst mejor = cursos.reduce((actual, curso) => curso.puntaje > actual.puntaje ? curso : actual);\nconsole.log(mejor.nombre, mejor.puntaje);',
          expected: "CSS 94", patterns: [["Compara mediante reduce", /\.reduce\s*\(/], ["Decide usando puntaje", /\.puntaje\s*>\s*\w+\.puntaje/]],
          hints: ["Reduce cursos conservando un objeto.", "Compara curso.puntaje con actual.puntaje.", "Devuelve curso si gana y actual en el caso contrario."]
        },
        {
          id: 24, title: "Construye un pipeline legible", short: "Funciones por etapa", topic: "Componer",
          explanation: "Separar normalización, selección y presentación permite comprobar cada etapa. La función principal conecta salidas y entradas con nombres claros.",
          concepts: ["Cada función cumple una tarea", "Una salida alimenta la etapa siguiente", "Los nombres hacen visible el flujo"],
          example: 'function limpiar(textos) { return textos.map((texto) => texto.trim()); }\nfunction largos(textos) { return textos.filter((texto) => texto.length >= 4); }\nconsole.log(largos(limpiar([" sol ", "luna"])).join(", "));',
          goal: "Define normalizar para trim y mayúsculas, y seleccionar para textos de 3 caracteres o más. Procesa html, espacio vacío y css; muestra HTML, CSS.",
          starter: 'const temas = [" html ", "  ", " css "];\nconsole.log(temas.join(", "));',
          solution: 'const temas = [" html ", "  ", " css "];\nfunction normalizar(lista) { return lista.map((texto) => texto.trim().toUpperCase()); }\nfunction seleccionar(lista) { return lista.filter((texto) => texto.length >= 3); }\nconst resultado = seleccionar(normalizar(temas));\nconsole.log(resultado.join(", "));',
          expected: "HTML, CSS", patterns: [["Define las dos etapas", /function\s+normalizar\s*\([\s\S]*function\s+seleccionar\s*\(/], ["Usa map y filter", /\.map\s*\([\s\S]*\.filter\s*\(/]],
          hints: ["Crea normalizar(lista) con map.", "En el callback encadena trim y toUpperCase.", "Crea seleccionar(lista) con filter por length >= 3 y conecta ambas."]
        }
      ]
    },
    {
      title: "Texto y validación", description: "Normalizar entradas, analizar palabras y devolver contratos", modules: [
        {
          id: 25, title: "Crea identificadores legibles", short: "Normalización de texto", topic: "Texto",
          explanation: "trim retira bordes, toLowerCase unifica mayúsculas y replaceAll sustituye cada separador conocido. El orden forma un pipeline pequeño.",
          concepts: ["trim limpia los extremos", "toLowerCase normaliza letras", "replaceAll sustituye todas las coincidencias"],
          example: 'const titulo = "  Mi Curso Web  ";\nconst slug = titulo.trim().toLowerCase().replaceAll(" ", "-");\nconsole.log(slug);',
          goal: "Convierte Ruta de JavaScript en ruta-de-javascript usando trim, toLowerCase y replaceAll.",
          starter: 'const titulo = "  Ruta de JavaScript  ";\nconst slug = titulo;\nconsole.log(slug);',
          solution: 'const titulo = "  Ruta de JavaScript  ";\nconst slug = titulo.trim().toLowerCase().replaceAll(" ", "-");\nconsole.log(slug);',
          expected: "ruta-de-javascript", patterns: [["Limpia y normaliza las letras", /\.trim\s*\(\s*\)\.toLowerCase\s*\(\s*\)/], ["Reemplaza todos los espacios", /\.replaceAll\s*\(\s*["'] ["']\s*,\s*["']-["']\s*\)/]],
          hints: ["Empieza con titulo.trim().", "Encadena toLowerCase().", "Termina con replaceAll(\" \", \"-\")."]
        },
        {
          id: 26, title: "Cuenta palabras relevantes", short: "Frecuencias", topic: "Analizar",
          explanation: "split transforma una frase en palabras y un objeto acumula frecuencias. Normalizar antes de contar evita separar mayúsculas equivalentes.",
          concepts: ["split crea una colección de palabras", "Una clave dinámica identifica cada palabra", "El contador crece durante el ciclo"],
          example: 'const frase = "sol luna sol";\nconst palabras = frase.split(" ");\nconst conteo = {};\nfor (const palabra of palabras) { conteo[palabra] = (conteo[palabra] || 0) + 1; }\nconsole.log(conteo.sol);',
          goal: "Cuenta las palabras de practicar ayuda a practicar y practicar. Muestra practicar: 3.",
          starter: 'const frase = "practicar ayuda a practicar y practicar";\nconsole.log(frase.length);',
          solution: 'const frase = "practicar ayuda a practicar y practicar";\nconst palabras = frase.split(" ");\nconst conteo = {};\nfor (const palabra of palabras) { conteo[palabra] = (conteo[palabra] || 0) + 1; }\nconsole.log("practicar:", conteo.practicar);',
          expected: "practicar: 3", patterns: [["Divide la frase con split", /\.split\s*\(\s*["'] ["']\s*\)/], ["Cuenta cada palabra", /conteo\s*\[\s*palabra\s*\]\s*=/]],
          hints: ["Crea palabras con frase.split(\" \" ).", "Prepara conteo como objeto vacío.", "Recorre palabras e incrementa conteo[palabra]."]
        },
        {
          id: 27, title: "Valida datos con un resultado claro", short: "Contrato de validación", topic: "Validar",
          explanation: "Una validación reutilizable devuelve siempre la misma forma. ok comunica el estado y mensaje explica qué debe corregirse.",
          concepts: ["El retorno conserva una forma estable", "Las guardas resuelven errores primero", "El mensaje acompaña el booleano"],
          example: 'function validarEdad(edad) {\n  if (edad < 18) return { ok: false, mensaje: "Debes ser mayor" };\n  return { ok: true, mensaje: "Edad válida" };\n}\nconsole.log(validarEdad(20).ok);',
          goal: "Crea validarNombre: devuelve ok false si el dato no es texto o tiene menos de 3 caracteres tras trim; en otro caso ok true. Muestra false y true para Jo y Ada.",
          starter: 'function validarNombre(nombre) { return { ok: true, mensaje: "válido" }; }\nconsole.log(validarNombre("Jo").ok);\nconsole.log(validarNombre("Ada").ok);',
          solution: 'function validarNombre(nombre) {\n  if (typeof nombre !== "string") return { ok: false, mensaje: "Debe ser texto" };\n  if (nombre.trim().length < 3) return { ok: false, mensaje: "Mínimo 3 caracteres" };\n  return { ok: true, mensaje: "Nombre válido" };\n}\nconsole.log(validarNombre("Jo").ok);\nconsole.log(validarNombre("Ada").ok);',
          expected: "false\ntrue", patterns: [["Define una guarda de tipo", /typeof\s+nombre\s*!==\s*["']string["']/], ["Comprueba la longitud limpia", /nombre\.trim\s*\(\s*\)\.length\s*<\s*3/]],
          hints: ["Primero comprueba typeof nombre.", "Después compara nombre.trim().length con 3.", "Devuelve objetos con ok false en las guardas y ok true al final."]
        },
        {
          id: 28, title: "Formatea códigos consistentes", short: "padStart", topic: "Presentar",
          explanation: "padStart completa un texto hasta una longitud mínima. Convertir el número antes de rellenar separa el valor del formato visible.",
          concepts: ["toString convierte el número", "padStart completa por la izquierda", "map aplica el formato a todos"],
          example: 'const numeros = [4, 28];\nconst codigos = numeros.map((numero) => numero.toString().padStart(3, "0"));\nconsole.log(codigos.join(", "));',
          goal: "Formatea 3, 27 y 145 con cuatro dígitos. Muestra 0003, 0027, 0145.",
          starter: 'const ids = [3, 27, 145];\nconsole.log(ids.join(", "));',
          solution: 'const ids = [3, 27, 145];\nconst codigos = ids.map((id) => id.toString().padStart(4, "0"));\nconsole.log(codigos.join(", "));',
          expected: "0003, 0027, 0145", patterns: [["Transforma todos los ids", /\.map\s*\(/], ["Completa cuatro posiciones", /\.padStart\s*\(\s*4\s*,\s*["']0["']\s*\)/]],
          hints: ["Crea codigos con ids.map(...).", "Convierte id mediante toString().", "Encadena padStart(4, \"0\") y une el resultado."]
        }
      ]
    },
    {
      title: "Transformaciones de objetos", description: "Entradas, copias, actualizaciones y combinaciones", modules: [
        {
          id: 29, title: "Lee una configuración", short: "Object.entries", topic: "Objetos",
          explanation: "Object.entries convierte un objeto en pares clave y valor. Después puedes aplicar los métodos de arreglos conocidos.",
          concepts: ["entries produce pares", "La posición cero es la clave", "La posición uno es el valor"],
          example: 'const opciones = { oscuro: true, sonido: false };\nconst activas = Object.entries(opciones).filter((par) => par[1] === true);\nconsole.log(activas.map((par) => par[0]).join(", "));',
          goal: "Obtén con Object.entries las funciones activas de chat true, pagos false y reportes true. Muestra chat, reportes.",
          starter: 'const funciones = { chat: true, pagos: false, reportes: true };\nconsole.log(Object.keys(funciones).join(", "));',
          solution: 'const funciones = { chat: true, pagos: false, reportes: true };\nconst activas = Object.entries(funciones).filter((par) => par[1] === true).map((par) => par[0]);\nconsole.log(activas.join(", "));',
          expected: "chat, reportes", patterns: [["Convierte con Object.entries", /Object\.entries\s*\(/], ["Filtra por el valor del par", /par\s*\[\s*1\s*\]\s*===\s*true/]],
          hints: ["Parte con Object.entries(funciones).", "Cada par guarda valor en par[1].", "Filtra true, transforma a par[0] y une."]
        },
        {
          id: 30, title: "Crea una vista derivada", short: "map de objetos", topic: "Derivar",
          explanation: "map puede devolver objetos con otra forma. El origen conserva sus datos y la vista contiene solo lo que necesita la presentación.",
          concepts: ["map puede devolver objetos", "Cada propiedad se decide explícitamente", "El origen permanece disponible"],
          example: 'const personas = [{ nombre: "Ada", edad: 30 }];\nconst tarjetas = personas.map((persona) => ({ nombre: persona.nombre, texto: persona.edad + " años" }));\nconsole.log(tarjetas[0].texto);',
          goal: "Crea ampliados sumando 2 horas a HTML 8 y CSS 10. Muestra HTML: 10, CSS: 12.",
          starter: 'const cursos = [{ nombre: "HTML", horas: 8 }, { nombre: "CSS", horas: 10 }];\nconsole.log(cursos.length);',
          solution: 'const cursos = [{ nombre: "HTML", horas: 8 }, { nombre: "CSS", horas: 10 }];\nconst ampliados = cursos.map((curso) => ({ nombre: curso.nombre, horas: curso.horas + 2 }));\nconsole.log(ampliados.map((curso) => `${curso.nombre}: ${curso.horas}`).join(", "));',
          expected: "HTML: 10, CSS: 12", patterns: [["Deriva objetos con map", /\.map\s*\(/], ["Crea nombre y horas nuevas", /nombre\s*:\s*curso\.nombre[\s\S]*horas\s*:\s*curso\.horas\s*\+\s*2/]],
          hints: ["Crea ampliados desde cursos.map(...).", "Devuelve un objeto entre paréntesis.", "Copia nombre y calcula horas + 2; luego construye el mensaje."]
        },
        {
          id: 31, title: "Actualiza un elemento sin tocar el origen", short: "Actualización con map", topic: "Actualizar",
          explanation: "Una actualización inmutable construye una colección nueva. El callback devuelve un objeto distinto solo para el id buscado.",
          concepts: ["map crea otra colección", "La condición localiza el id", "Los demás objetos se devuelven sin cambios"],
          example: 'const tareas = [{ id: 1, hecha: false }, { id: 2, hecha: false }];\nconst nuevas = tareas.map((tarea) => tarea.id === 2 ? { id: tarea.id, hecha: true } : tarea);\nconsole.log(nuevas[1].hecha);',
          goal: "Cambia SQL id 2 a nivel avanzado dentro de actualizados y demuestra que cursos conserva inicial. Muestra avanzado y luego inicial.",
          starter: 'const cursos = [{ id: 1, nombre: "HTML", nivel: "inicial" }, { id: 2, nombre: "SQL", nivel: "inicial" }];\nconst actualizados = cursos;\nconsole.log(actualizados[1].nivel);\nconsole.log(cursos[1].nivel);',
          solution: 'const cursos = [{ id: 1, nombre: "HTML", nivel: "inicial" }, { id: 2, nombre: "SQL", nivel: "inicial" }];\nconst actualizados = cursos.map((curso) => curso.id === 2 ? { id: curso.id, nombre: curso.nombre, nivel: "avanzado" } : curso);\nconsole.log(actualizados[1].nivel);\nconsole.log(cursos[1].nivel);',
          expected: "avanzado\ninicial", patterns: [["Construye la colección con map", /cursos\.map\s*\(/], ["Decide por el id 2", /curso\.id\s*===\s*2\s*\?/]],
          hints: ["Crea actualizados desde cursos.map(...).", "Usa una condición ternaria con curso.id === 2.", "Devuelve un objeto nuevo para SQL y curso para los demás."]
        },
        {
          id: 32, title: "Combina fuentes ordenadas", short: "concat y sort", topic: "Combinar",
          explanation: "concat produce un arreglo combinado y sort ordena su copia. slice antes de sort evita cambiar una referencia que debas conservar.",
          concepts: ["concat une arreglos", "sort ordena texto", "Una variable nombra el resultado combinado"],
          example: 'const uno = ["CSS", "HTML"];\nconst dos = ["APIs"];\nconst todos = uno.concat(dos).sort();\nconsole.log(todos.join(", "));',
          goal: "Combina pendientes HTML y JavaScript con completados CSS y SQL; ordena y muestra CSS, HTML, JavaScript, SQL.",
          starter: 'const pendientes = ["HTML", "JavaScript"];\nconst completados = ["CSS", "SQL"];\nconsole.log(pendientes.join(", "));',
          solution: 'const pendientes = ["HTML", "JavaScript"];\nconst completados = ["CSS", "SQL"];\nconst todos = pendientes.concat(completados).sort();\nconsole.log(todos.join(", "));',
          expected: "CSS, HTML, JavaScript, SQL", patterns: [["Une mediante concat", /\.concat\s*\(/], ["Ordena el resultado", /\.sort\s*\(\s*\)/]],
          hints: ["Crea todos desde pendientes.concat(completados).", "Encadena sort() al arreglo combinado.", "Muestra todos.join(\", \")."]
        }
      ]
    },
    {
      title: "Algoritmos sobre colecciones", description: "Eliminar duplicados, ordenar, agrupar y paginar", modules: [
        {
          id: 33, title: "Elimina duplicados conservando orden", short: "includes", topic: "Algoritmos",
          explanation: "Un acumulador de únicos pregunta con includes si ya recibió cada valor. Solo agrega el primer encuentro y mantiene el orden original.",
          concepts: ["includes detecta repetidos", "push agrega solo valores nuevos", "El recorrido conserva el orden"],
          example: 'const letras = ["a", "b", "a"];\nconst unicas = [];\nfor (const letra of letras) { if (!unicas.includes(letra)) unicas.push(letra); }\nconsole.log(unicas.join(", "));',
          goal: "Elimina duplicados de HTML, CSS, HTML, JavaScript, CSS y muestra HTML, CSS, JavaScript.",
          starter: 'const tecnologias = ["HTML", "CSS", "HTML", "JavaScript", "CSS"];\nconsole.log(tecnologias.join(", "));',
          solution: 'const tecnologias = ["HTML", "CSS", "HTML", "JavaScript", "CSS"];\nconst unicas = [];\nfor (const tecnologia of tecnologias) { if (!unicas.includes(tecnologia)) unicas.push(tecnologia); }\nconsole.log(unicas.join(", "));',
          expected: "HTML, CSS, JavaScript", patterns: [["Comprueba repetidos con includes", /unicas\.includes\s*\(/], ["Agrega los valores nuevos", /unicas\.push\s*\(/]],
          hints: ["Prepara unicas como arreglo vacío.", "Recorre tecnologias con for...of.", "Si unicas no incluye tecnologia, agrégala con push."]
        },
        {
          id: 34, title: "Ordena un ranking sin tocar el origen", short: "slice y sort", topic: "Ordenar",
          explanation: "slice crea una copia y sort recibe un comparador numérico. Cuando dos puntajes empatan, el orden relativo se conserva.",
          concepts: ["slice copia el arreglo", "El comparador descendente resta puntajes", "map extrae el orden final"],
          example: 'const valores = [3, 9, 5];\nconst ordenados = valores.slice().sort((a, b) => b - a);\nconsole.log(ordenados.join(", "));',
          goal: "Ordena por puntos descendentes a Ana 90, Luis 90 y Marta 75. Muestra Ana, Luis, Marta y no alteres participantes.",
          starter: 'const participantes = [{ nombre: "Ana", puntos: 90 }, { nombre: "Luis", puntos: 90 }, { nombre: "Marta", puntos: 75 }];\nconsole.log(participantes.map((persona) => persona.nombre).join(", "));',
          solution: 'const participantes = [{ nombre: "Ana", puntos: 90 }, { nombre: "Luis", puntos: 90 }, { nombre: "Marta", puntos: 75 }];\nconst ranking = participantes.slice().sort((a, b) => b.puntos - a.puntos);\nconsole.log(ranking.map((persona) => persona.nombre).join(", "));',
          expected: "Ana, Luis, Marta", patterns: [["Copia antes de ordenar", /participantes\.slice\s*\(\s*\)\.sort\s*\(/], ["Compara puntos en orden descendente", /b\.puntos\s*-\s*a\.puntos/]],
          hints: ["Empieza con participantes.slice().", "Encadena sort((a, b) => ...).", "Resta b.puntos - a.puntos y muestra nombres."]
        },
        {
          id: 35, title: "Agrupa cursos por nivel", short: "reduce y grupos", topic: "Agrupar",
          explanation: "El acumulador crea una lista por cada nivel. Antes de push comprueba si la clave existe y la inicia cuando sea necesario.",
          concepts: ["El acumulador es un objeto de listas", "Cada clave se inicia una sola vez", "push conserva los nombres del grupo"],
          example: 'const datos = [{ grupo: "a", nombre: "Uno" }, { grupo: "a", nombre: "Dos" }];\nconst grupos = datos.reduce((acc, item) => { if (!acc[item.grupo]) acc[item.grupo] = []; acc[item.grupo].push(item.nombre); return acc; }, {});\nconsole.log(grupos.a.join(", "));',
          goal: "Agrupa HTML y SQL como Inicial y JavaScript como Intermedio. Muestra Inicial: HTML, SQL e Intermedio: JavaScript.",
          starter: 'const cursos = [{ nombre: "HTML", nivel: "Inicial" }, { nombre: "JavaScript", nivel: "Intermedio" }, { nombre: "SQL", nivel: "Inicial" }];\nconsole.log(cursos.length);',
          solution: 'const cursos = [{ nombre: "HTML", nivel: "Inicial" }, { nombre: "JavaScript", nivel: "Intermedio" }, { nombre: "SQL", nivel: "Inicial" }];\nconst grupos = cursos.reduce((acc, curso) => { if (!acc[curso.nivel]) acc[curso.nivel] = []; acc[curso.nivel].push(curso.nombre); return acc; }, {});\nconsole.log("Inicial:", grupos.Inicial.join(", "));\nconsole.log("Intermedio:", grupos.Intermedio.join(", "));',
          expected: "Inicial: HTML, SQL\nIntermedio: JavaScript", patterns: [["Agrupa con reduce", /\.reduce\s*\(/], ["Agrega nombres a la clave de nivel", /acc\s*\[\s*curso\.nivel\s*\]\.push\s*\(/]],
          hints: ["Reduce cursos sobre un objeto vacío.", "Inicia acc[curso.nivel] como [] si falta.", "Haz push de curso.nombre y devuelve acc en cada vuelta."]
        },
        {
          id: 36, title: "Divide resultados en páginas", short: "Paginación con slice", topic: "Paginar",
          explanation: "Una página se traduce a un índice inicial. slice devuelve desde ese índice hasta el límite sin modificar la colección completa.",
          concepts: ["El inicio depende de página y tamaño", "slice excluye el límite final", "La función reutiliza el cálculo"],
          example: 'function pagina(lista, numero, tamano) { const inicio = (numero - 1) * tamano; return lista.slice(inicio, inicio + tamano); }\nconsole.log(pagina([1, 2, 3, 4], 2, 2).join(", "));',
          goal: "Define pagina y obtén la página 2 de tamaño 2 para HTML, CSS, APIs, Git, SQL. Muestra APIs, Git.",
          starter: 'const cursos = ["HTML", "CSS", "APIs", "Git", "SQL"];\nfunction pagina(lista, numero, tamano) { return lista; }\nconsole.log(pagina(cursos, 2, 2).join(", "));',
          solution: 'const cursos = ["HTML", "CSS", "APIs", "Git", "SQL"];\nfunction pagina(lista, numero, tamano) { const inicio = (numero - 1) * tamano; return lista.slice(inicio, inicio + tamano); }\nconsole.log(pagina(cursos, 2, 2).join(", "));',
          expected: "APIs, Git", patterns: [["Calcula el índice inicial", /\(\s*numero\s*-\s*1\s*\)\s*\*\s*tamano/], ["Extrae con slice", /lista\.slice\s*\(\s*inicio\s*,\s*inicio\s*\+\s*tamano\s*\)/]],
          hints: ["Calcula inicio = (numero - 1) * tamano.", "El final es inicio + tamano.", "Devuelve lista.slice(inicio, inicio + tamano)."]
        }
      ]
    },
    {
      title: "Reglas de dominio", description: "Guardas, disponibilidad, permisos y transiciones", modules: [
        {
          id: 37, title: "Protege un cálculo con guardas", short: "Retornos tempranos", topic: "Funciones",
          explanation: "Una guarda resuelve primero una entrada inválida y permite que el camino principal quede sin niveles extra de anidación.",
          concepts: ["El retorno temprano detiene la función", "null representa ausencia controlada", "El camino válido queda directo"],
          example: 'function mitad(numero) { if (numero < 0) return null; return numero / 2; }\nconsole.log(mitad(8));\nconsole.log(mitad(-1));',
          goal: "Crea precioFinal: si precio es negativo devuelve null; si es válido aplica el porcentaje. Muestra 900 para 1000 y 10, y null para -5.",
          starter: 'function precioFinal(precio, descuento) { return precio; }\nconsole.log(precioFinal(1000, 10));\nconsole.log(precioFinal(-5, 10));',
          solution: 'function precioFinal(precio, descuento) { if (precio < 0) return null; return precio - precio * descuento / 100; }\nconsole.log(precioFinal(1000, 10));\nconsole.log(precioFinal(-5, 10));',
          expected: "900\nnull", patterns: [["Detiene precios negativos", /if\s*\(\s*precio\s*<\s*0\s*\)\s*return\s+null/], ["Calcula el descuento", /precio\s*-\s*precio\s*\*\s*descuento\s*\/\s*100/]],
          hints: ["Comienza la función con una guarda.", "Si precio < 0 retorna null.", "Después retorna precio - precio * descuento / 100."]
        },
        {
          id: 38, title: "Busca horarios disponibles", short: "filter e includes", topic: "Disponibilidad",
          explanation: "La función filtra el catálogo de horas preguntando si cada valor no aparece en ocupadas. El resultado contiene solo alternativas disponibles.",
          concepts: ["includes consulta ocupación", "La negación conserva horas libres", "La función recibe todos sus datos"],
          example: 'function libres(horas, ocupadas) { return horas.filter((hora) => !ocupadas.includes(hora)); }\nconsole.log(libres([9, 10, 11], [9, 11]).join(", "));',
          goal: "Con horas 9, 10, 12, 14 y ocupadas 9, 12, devuelve y muestra 10, 14.",
          starter: 'const horas = [9, 10, 12, 14];\nconst ocupadas = [9, 12];\nfunction disponibles(todas, usadas) { return todas; }\nconsole.log(disponibles(horas, ocupadas).join(", "));',
          solution: 'const horas = [9, 10, 12, 14];\nconst ocupadas = [9, 12];\nfunction disponibles(todas, usadas) { return todas.filter((hora) => !usadas.includes(hora)); }\nconsole.log(disponibles(horas, ocupadas).join(", "));',
          expected: "10, 14", patterns: [["Filtra las horas", /todas\.filter\s*\(/], ["Excluye las ocupadas con includes", /!\s*usadas\.includes\s*\(\s*hora\s*\)/]],
          hints: ["Devuelve todas.filter(...).", "Pregunta usadas.includes(hora).", "Niega esa pregunta para conservar solo horas libres."]
        },
        {
          id: 39, title: "Resuelve permisos por rol", short: "Regla de permisos", topic: "Permisos",
          explanation: "Una función de permisos recibe roles y una acción. Las reglas se expresan con booleanos y mantienen la decisión en un solo lugar.",
          concepts: ["includes comprueba pertenencia", "La acción forma parte de la regla", "La función devuelve un booleano"],
          example: 'function puedePublicar(roles) { return roles.includes("editor"); }\nconsole.log(puedePublicar(["lector"]));\nconsole.log(puedePublicar(["editor"]));',
          goal: "Crea puedeEditar: solo permite editar si roles incluye editor o admin. Muestra false para lector y true para lector, editor.",
          starter: 'function puedeEditar(roles) { return true; }\nconsole.log(puedeEditar(["lector"]));\nconsole.log(puedeEditar(["lector", "editor"]));',
          solution: 'function puedeEditar(roles) { return roles.includes("editor") || roles.includes("admin"); }\nconsole.log(puedeEditar(["lector"]));\nconsole.log(puedeEditar(["lector", "editor"]));',
          expected: "false\ntrue", patterns: [["Comprueba el rol editor", /roles\.includes\s*\(\s*["']editor["']\s*\)/], ["Admite también admin", /\|\|\s*roles\.includes\s*\(\s*["']admin["']\s*\)/]],
          hints: ["Devuelve una expresión booleana.", "La primera opción es roles.includes(\"editor\").", "Une con || la comprobación de admin."]
        },
        {
          id: 40, title: "Modela transiciones de estado", short: "Máquina de estados", topic: "Estados",
          explanation: "Una transición válida depende del estado actual y la acción. La función devuelve el siguiente estado o un resultado controlado cuando no existe camino.",
          concepts: ["Estado y acción determinan el resultado", "Cada transición es explícita", "Un valor estable cubre acciones inválidas"],
          example: 'function avanzar(estado, accion) { if (estado === "nuevo" && accion === "iniciar") return "activo"; return "sin cambio"; }\nconsole.log(avanzar("nuevo", "iniciar"));',
          goal: "Desde pendiente + iniciar devuelve iniciado; desde iniciado + finalizar devuelve finalizado; cualquier otra combinación devuelve no permitido. Muestra los tres casos.",
          starter: 'function transicion(estado, accion) { return estado; }\nconsole.log(transicion("pendiente", "iniciar"));\nconsole.log(transicion("iniciado", "finalizar"));\nconsole.log(transicion("finalizado", "iniciar"));',
          solution: 'function transicion(estado, accion) {\n  if (estado === "pendiente" && accion === "iniciar") return "iniciado";\n  if (estado === "iniciado" && accion === "finalizar") return "finalizado";\n  return "no permitido";\n}\nconsole.log(transicion("pendiente", "iniciar"));\nconsole.log(transicion("iniciado", "finalizar"));\nconsole.log(transicion("finalizado", "iniciar"));',
          expected: "iniciado\nfinalizado\nno permitido", patterns: [["Declara las dos transiciones", /pendiente[\s\S]*iniciar[\s\S]*iniciado[\s\S]*finalizar/], ["Cubre combinaciones inválidas", /return\s+["']no permitido["']/]],
          hints: ["Compara estado y accion con &&.", "Escribe una guarda para cada transición permitida.", "Termina con return \"no permitido\"."]
        }
      ]
    },
    {
      title: "Calidad verificable", description: "Funciones puras, entradas seguras, resultados y casos", modules: [
        {
          id: 41, title: "Conserva una función pura", short: "Datos sin mutar", topic: "Calidad",
          explanation: "Una función pura calcula desde sus argumentos y no modifica el arreglo recibido. Repetir la llamada con la misma entrada produce el mismo resultado.",
          concepts: ["Los argumentos son la única entrada", "reduce calcula sin push ni asignaciones", "El arreglo conserva su longitud"],
          example: 'function sumar(valores) { return valores.reduce((total, valor) => total + valor, 0); }\nconst numeros = [2, 3];\nconsole.log(sumar(numeros));\nconsole.log(numeros.length);',
          goal: "Crea totalPrecios como función pura para 2500 y 3500. Muestra 6000 y confirma que precios conserva longitud 2.",
          starter: 'const precios = [2500, 3500];\nfunction totalPrecios(lista) { lista.push(0); return 0; }\nconsole.log(totalPrecios(precios));\nconsole.log(precios.length);',
          solution: 'const precios = [2500, 3500];\nfunction totalPrecios(lista) { return lista.reduce((total, precio) => total + precio, 0); }\nconsole.log(totalPrecios(precios));\nconsole.log(precios.length);',
          expected: "6000\n2", patterns: [["Calcula dentro de una función", /function\s+totalPrecios\s*\(/], ["Resume sin modificar mediante reduce", /lista\.reduce\s*\(/]],
          hints: ["La función solo necesita lista.", "Retorna lista.reduce(..., 0).", "No uses push ni reasignes precios."]
        },
        {
          id: 42, title: "Controla colecciones vacías", short: "Guardas de entrada", topic: "Robustez",
          explanation: "Array.isArray confirma el tipo y length detecta el caso vacío. La guarda evita dividir por cero o ejecutar métodos sobre otro tipo.",
          concepts: ["Array.isArray comprueba el tipo", "length identifica el vacío", "null comunica que no hay promedio"],
          example: 'function primero(lista) { if (!Array.isArray(lista) || lista.length === 0) return null; return lista[0]; }\nconsole.log(primero([]));',
          goal: "Crea promedio: devuelve null si no recibe un arreglo o está vacío; si es válido calcula el promedio. Muestra null y 6 para [] y [5,6,7].",
          starter: 'function promedio(notas) { return 0; }\nconsole.log(promedio([]));\nconsole.log(promedio([5, 6, 7]));',
          solution: 'function promedio(notas) { if (!Array.isArray(notas) || notas.length === 0) return null; return notas.reduce((total, nota) => total + nota, 0) / notas.length; }\nconsole.log(promedio([]));\nconsole.log(promedio([5, 6, 7]));',
          expected: "null\n6", patterns: [["Comprueba que sea un arreglo", /Array\.isArray\s*\(\s*notas\s*\)/], ["Controla el arreglo vacío", /notas\.length\s*===\s*0/]],
          hints: ["Empieza con una guarda que combine dos condiciones.", "Usa !Array.isArray(notas) || notas.length === 0.", "Después suma con reduce y divide por notas.length."]
        },
        {
          id: 43, title: "Devuelve resultados consistentes", short: "Objeto resultado", topic: "Contratos",
          explanation: "Un objeto resultado evita mezclar errores con valores normales. ok determina qué propiedad debe leer quien llama a la función.",
          concepts: ["ok diferencia éxito y fallo", "error explica el caso inválido", "valor existe en el camino correcto"],
          example: 'function raiz(numero) { if (numero < 0) return { ok: false, error: "Negativo" }; return { ok: true, valor: Math.sqrt(numero) }; }\nconsole.log(raiz(9).valor);',
          goal: "Crea dividir: si b es 0 devuelve ok false y error División por cero; si no, ok true y valor a / b. Muestra el error y luego 2.",
          starter: 'function dividir(a, b) { return a / b; }\nconsole.log(dividir(8, 0));\nconsole.log(dividir(8, 4));',
          solution: 'function dividir(a, b) { if (b === 0) return { ok: false, error: "División por cero" }; return { ok: true, valor: a / b }; }\nconst fallo = dividir(8, 0);\nconst exito = dividir(8, 4);\nconsole.log(fallo.error);\nconsole.log(exito.valor);',
          expected: "División por cero\n2", patterns: [["Devuelve ok false en división por cero", /b\s*===\s*0[\s\S]*ok\s*:\s*false/], ["Devuelve ok true y valor", /ok\s*:\s*true[\s\S]*valor\s*:\s*a\s*\/\s*b/]],
          hints: ["La primera guarda comprueba b === 0.", "Retorna un objeto con ok false y error.", "En el camino válido retorna ok true y valor; luego lee cada propiedad."]
        },
        {
          id: 44, title: "Comprueba varios casos", short: "Tabla de casos", topic: "Pruebas",
          explanation: "Una tabla de casos separa entradas y resultados esperados de la función probada. El ciclo aplica la misma comprobación de forma repetible.",
          concepts: ["Cada caso declara entrada y esperado", "La función se invoca dentro del ciclo", "La comparación produce evidencia booleana"],
          example: 'function cuadrado(numero) { return numero * numero; }\nconst casos = [{ entrada: 2, esperado: 4 }, { entrada: 3, esperado: 9 }];\nfor (const caso of casos) console.log(cuadrado(caso.entrada) === caso.esperado);',
          goal: "Crea doble y una tabla con 0→0, 2→4 y -3→-6. Recorre los casos y muestra true tres veces.",
          starter: 'function doble(numero) { return numero; }\nconst casos = [{ entrada: 0, esperado: 0 }];\nfor (const caso of casos) console.log(doble(caso.entrada) === caso.esperado);',
          solution: 'function doble(numero) { return numero * 2; }\nconst casos = [{ entrada: 0, esperado: 0 }, { entrada: 2, esperado: 4 }, { entrada: -3, esperado: -6 }];\nfor (const caso of casos) console.log(doble(caso.entrada) === caso.esperado);',
          expected: "true\ntrue\ntrue", patterns: [["Incluye tres casos", /entrada\s*:\s*0[\s\S]*entrada\s*:\s*2[\s\S]*entrada\s*:\s*-3/], ["Compara actual con esperado", /doble\s*\(\s*caso\.entrada\s*\)\s*===\s*caso\.esperado/]],
          hints: ["doble debe retornar numero * 2.", "Completa tres objetos con entrada y esperado.", "Dentro de for...of compara doble(caso.entrada) con caso.esperado."]
        }
      ]
    },
    {
      title: "Pipelines de datos", description: "Limpiar, medir, relacionar y resumir", modules: [
        {
          id: 45, title: "Limpia una lista por etapas", short: "Pipeline de texto", topic: "Pipeline",
          explanation: "Encadenar map, filter y map convierte datos crudos en un resultado listo para usar. Cada etapa tiene una intención observable.",
          concepts: ["El primer map normaliza", "filter retira valores vacíos", "El último map presenta"],
          example: 'const datos = [" sol ", " ", " luna "];\nconst resultado = datos.map((dato) => dato.trim()).filter((dato) => dato.length > 0).map((dato) => dato.toUpperCase());\nconsole.log(resultado.join(", "));',
          goal: "Procesa html, vacío y css: trim, conserva textos de 3 o más caracteres y convierte a mayúsculas. Muestra HTML, CSS.",
          starter: 'const datos = [" html ", " ", " css "];\nconsole.log(datos.join(", "));',
          solution: 'const datos = [" html ", " ", " css "];\nconst resultado = datos.map((dato) => dato.trim()).filter((dato) => dato.length >= 3).map((dato) => dato.toUpperCase());\nconsole.log(resultado.join(", "));',
          expected: "HTML, CSS", patterns: [["Encadena map y filter", /\.map\s*\([\s\S]*\.filter\s*\(/], ["Normaliza y convierte a mayúsculas", /\.trim\s*\([\s\S]*\.toUpperCase\s*\(/]],
          hints: ["Comienza con datos.map para trim.", "Encadena filter por length >= 3.", "Termina con map a toUpperCase y join."]
        },
        {
          id: 46, title: "Calcula una métrica válida", short: "Filtrar y promediar", topic: "Métricas",
          explanation: "La métrica primero excluye registros inválidos y después reduce solo el conjunto aceptado. toFixed entrega una presentación consistente.",
          concepts: ["filter define el conjunto válido", "reduce calcula el total", "toFixed controla la salida"],
          example: 'const tiempos = [20, -1, 40];\nconst validos = tiempos.filter((tiempo) => tiempo > 0);\nconst promedio = validos.reduce((total, tiempo) => total + tiempo, 0) / validos.length;\nconsole.log(promedio.toFixed(1));',
          goal: "De duraciones 30, 0, 45 y 60 conserva solo mayores que 0 y muestra el promedio 45.00.",
          starter: 'const duraciones = [30, 0, 45, 60];\nconsole.log(duraciones.length);',
          solution: 'const duraciones = [30, 0, 45, 60];\nconst validas = duraciones.filter((duracion) => duracion > 0);\nconst promedio = validas.reduce((total, duracion) => total + duracion, 0) / validas.length;\nconsole.log(promedio.toFixed(2));',
          expected: "45.00", patterns: [["Excluye duraciones inválidas", /\.filter\s*\(\s*\([^)]*\)\s*=>\s*\w+\s*>\s*0/], ["Reduce y formatea dos decimales", /\.reduce\s*\([\s\S]*\.toFixed\s*\(\s*2\s*\)/]],
          hints: ["Crea validas con filter > 0.", "Suma validas con reduce y divide por validas.length.", "Muestra promedio.toFixed(2)."]
        },
        {
          id: 47, title: "Relaciona dos colecciones", short: "Join con find", topic: "Relacionar",
          explanation: "map recorre la colección principal y find localiza el registro relacionado por id. El resultado puede presentar datos de ambas fuentes.",
          concepts: ["map recorre la tabla principal", "find busca la clave relacionada", "El objeto derivado combina ambas fuentes"],
          example: 'const personas = [{ nombre: "Ada", ciudadId: 2 }];\nconst ciudades = [{ id: 2, nombre: "Santiago" }];\nconst salida = personas.map((persona) => `${persona.nombre}: ${ciudades.find((ciudad) => ciudad.id === persona.ciudadId).nombre}`);\nconsole.log(salida.join(", "));',
          goal: "Relaciona Ada curso 1 y Lin curso 2 con Python id 1 y SQL id 2. Muestra Ada: Python, Lin: SQL.",
          starter: 'const estudiantes = [{ nombre: "Ada", cursoId: 1 }, { nombre: "Lin", cursoId: 2 }];\nconst cursos = [{ id: 1, nombre: "Python" }, { id: 2, nombre: "SQL" }];\nconsole.log(estudiantes.length);',
          solution: 'const estudiantes = [{ nombre: "Ada", cursoId: 1 }, { nombre: "Lin", cursoId: 2 }];\nconst cursos = [{ id: 1, nombre: "Python" }, { id: 2, nombre: "SQL" }];\nconst resumen = estudiantes.map((estudiante) => { const curso = cursos.find((item) => item.id === estudiante.cursoId); return `${estudiante.nombre}: ${curso.nombre}`; });\nconsole.log(resumen.join(", "));',
          expected: "Ada: Python, Lin: SQL", patterns: [["Recorre estudiantes con map", /estudiantes\.map\s*\(/], ["Busca la relación con find", /cursos\.find\s*\(/]],
          hints: ["Crea resumen con estudiantes.map(...).", "Dentro busca cursos.find por id y cursoId.", "Retorna una plantilla nombre: curso y une el resultado."]
        },
        {
          id: 48, title: "Genera un reporte reutilizable", short: "Funciones de reporte", topic: "Reportar",
          explanation: "Un reporte separa selección y resumen en funciones. Esta composición permite reutilizar reglas sin mezclar cálculo con presentación.",
          concepts: ["Una función selecciona registros", "Otra resume el conjunto", "La salida comunica indicadores concretos"],
          example: 'function activos(items) { return items.filter((item) => item.activo); }\nfunction total(items) { return items.reduce((suma, item) => suma + item.horas, 0); }\nconst datos = [{ activo: true, horas: 5 }, { activo: false, horas: 9 }];\nconsole.log(total(activos(datos)));',
          goal: "Con HTML activo 8 horas, CSS inactivo 10 y JavaScript activo 12, crea seleccionarActivos y sumarHoras. Muestra Activos: 2 · Horas: 20.",
          starter: 'const cursos = [{ nombre: "HTML", activo: true, horas: 8 }, { nombre: "CSS", activo: false, horas: 10 }, { nombre: "JavaScript", activo: true, horas: 12 }];\nconsole.log(cursos.length);',
          solution: 'const cursos = [{ nombre: "HTML", activo: true, horas: 8 }, { nombre: "CSS", activo: false, horas: 10 }, { nombre: "JavaScript", activo: true, horas: 12 }];\nfunction seleccionarActivos(lista) { return lista.filter((curso) => curso.activo === true); }\nfunction sumarHoras(lista) { return lista.reduce((total, curso) => total + curso.horas, 0); }\nconst activos = seleccionarActivos(cursos);\nconsole.log(`Activos: ${activos.length} · Horas: ${sumarHoras(activos)}`);',
          expected: "Activos: 2 · Horas: 20", patterns: [["Separa selección y suma en funciones", /function\s+seleccionarActivos[\s\S]*function\s+sumarHoras/], ["Usa filter y reduce", /\.filter\s*\([\s\S]*\.reduce\s*\(/]],
          hints: ["seleccionarActivos devuelve filter por activo.", "sumarHoras devuelve reduce de curso.horas.", "Guarda activos y usa su length junto con sumarHoras(activos)."]
        }
      ]
    },
    {
      title: "Proyecto profesional integrado", description: "Recomendación explicable y panel de avance", modules: [
        {
          id: 49, title: "Recomienda una ruta explicable", short: "Motor de recomendación", topic: "Proyecto", duration: "32 min", difficulty: "Proyecto",
          explanation: "Una recomendación pequeña puede ser transparente: filtra por restricciones, ordena por puntuación y presenta el primer resultado junto con su regla.",
          concepts: ["filter aplica requisitos explícitos", "sort prioriza candidatos", "El resultado conserva una explicación"],
          example: 'const opciones = [{ nombre: "A", horas: 4, puntos: 80 }, { nombre: "B", horas: 8, puntos: 95 }];\nconst posibles = opciones.filter((opcion) => opcion.horas <= 6).sort((a, b) => b.puntos - a.puntos);\nconsole.log(posibles[0].nombre);',
          goal: "Para nivel inicial y 8 horas, filtra cursos compatibles y ordénalos por puntuación: HTML 80, JavaScript 95, React intermedio 99. Muestra Recomendación: JavaScript.",
          starter: 'const perfil = { nivel: "inicial", horas: 8 };\nconst cursos = [{ nombre: "HTML", nivel: "inicial", horas: 4, puntos: 80 }, { nombre: "JavaScript", nivel: "inicial", horas: 8, puntos: 95 }, { nombre: "React", nivel: "intermedio", horas: 8, puntos: 99 }];\nconsole.log(cursos[0].nombre);',
          solution: 'const perfil = { nivel: "inicial", horas: 8 };\nconst cursos = [{ nombre: "HTML", nivel: "inicial", horas: 4, puntos: 80 }, { nombre: "JavaScript", nivel: "inicial", horas: 8, puntos: 95 }, { nombre: "React", nivel: "intermedio", horas: 8, puntos: 99 }];\nconst compatibles = cursos.filter((curso) => curso.nivel === perfil.nivel && curso.horas <= perfil.horas).sort((a, b) => b.puntos - a.puntos);\nconsole.log(`Recomendación: ${compatibles[0].nombre}`);',
          expected: "Recomendación: JavaScript", patterns: [["Filtra las dos restricciones", /curso\.nivel\s*===\s*perfil\.nivel\s*&&\s*curso\.horas\s*<=\s*perfil\.horas/], ["Ordena por puntuación descendente", /\.sort\s*\([\s\S]*b\.puntos\s*-\s*a\.puntos/]],
          hints: ["Crea compatibles desde cursos.filter(...).", "Combina igualdad de nivel y límite de horas con &&.", "Encadena sort descendente y presenta compatibles[0].nombre."]
        },
        {
          id: 50, title: "Entrega un panel de aprendizaje", short: "Proyecto 50", topic: "Proyecto final", duration: "38 min", difficulty: "Proyecto final",
          explanation: "El cierre reúne funciones puras, filtros, reducciones y presentación. El resumen calcula indicadores y la colección pendiente decide el siguiente paso.",
          concepts: ["El resumen deriva métricas", "filter separa completados y pendientes", "Math.round presenta el porcentaje"],
          example: 'function resumen(items) { const hechas = items.filter((item) => item.hecha); return { hechas: hechas.length, total: items.length }; }\nconst datos = [{ hecha: true }, { hecha: false }];\nconsole.log(resumen(datos).hechas);',
          goal: "Con HTML hecho 30 min, CSS hecho 45 y APIs pendiente 60, crea resumen y muestra Avance: 2 de 3 (67%), Minutos: 75 y Siguiente: APIs.",
          starter: 'const modulos = [{ nombre: "HTML", hecho: true, minutos: 30 }, { nombre: "CSS", hecho: true, minutos: 45 }, { nombre: "APIs", hecho: false, minutos: 60 }];\nconsole.log(modulos.length);',
          solution: 'const modulos = [{ nombre: "HTML", hecho: true, minutos: 30 }, { nombre: "CSS", hecho: true, minutos: 45 }, { nombre: "APIs", hecho: false, minutos: 60 }];\nfunction resumen(lista) {\n  const hechos = lista.filter((modulo) => modulo.hecho === true);\n  const minutos = hechos.reduce((total, modulo) => total + modulo.minutos, 0);\n  const porcentaje = Math.round(hechos.length / lista.length * 100);\n  return { hechos: hechos.length, total: lista.length, minutos: minutos, porcentaje: porcentaje };\n}\nconst datos = resumen(modulos);\nconst pendientes = modulos.filter((modulo) => modulo.hecho === false);\nconsole.log(`Avance: ${datos.hechos} de ${datos.total} (${datos.porcentaje}%)`);\nconsole.log(`Minutos: ${datos.minutos}`);\nconsole.log(`Siguiente: ${pendientes[0].nombre}`);',
          expected: "Avance: 2 de 3 (67%)\nMinutos: 75\nSiguiente: APIs", patterns: [["Resume con filter y reduce", /function\s+resumen[\s\S]*\.filter\s*\([\s\S]*\.reduce\s*\(/], ["Calcula el porcentaje redondeado", /Math\.round\s*\(\s*hechos\.length\s*\/\s*lista\.length\s*\*\s*100\s*\)/]],
          hints: ["Dentro de resumen filtra los módulos hechos.", "Reduce sus minutos y calcula Math.round(hechos.length / lista.length * 100).", "Devuelve las métricas, busca pendientes y construye las tres líneas."]
        }
      ]
    }
  ];

  const flatSpecs = levelSpecs.flatMap(level => level.modules);
  const modules = flatSpecs.map((spec, index) => ({
    id: spec.id,
    kicker: `Módulo ${String(spec.id).padStart(2, "0")} · ${spec.topic}`,
    title: spec.title,
    shortTitle: spec.short,
    duration: spec.duration || "18 min",
    difficulty: spec.difficulty || "Avanzado",
    intro: `En este módulo usarás ${spec.short.toLowerCase()} para resolver una tarea concreta con datos que puedes inspeccionar antes y después.`,
    example: spec.example,
    explanation: spec.explanation,
    concepts: spec.concepts,
    goal: spec.goal,
    hints: spec.hints,
    file: `modulo_${spec.id}.js`,
    starter: spec.starter,
    solution: spec.solution,
    checks: [
      check(spec.patterns[0][0], code => spec.patterns[0][1].test(String(code))),
      check(spec.patterns[1][0], code => spec.patterns[1][1].test(String(code))),
      check(`La consola muestra el resultado esperado`, exact(spec.expected))
    ],
    success: "Resolves la misión con una transformación que puede comprobarse desde la entrada hasta la salida.",
    lesson: {
      prerequisites: index === 0 ? "Haber completado los dieciséis módulos iniciales de JavaScript." : `Haber completado el módulo anterior: ${flatSpecs[index - 1].title}.`,
      walkthrough: [
        `Primero, identifica la colección o valor de entrada y el método principal: ${spec.concepts[0].toLowerCase()}.`,
        `Después, sigue el callback o la condición: ${spec.concepts[1].toLowerCase()}.`,
        `Al terminar, comprueba la salida: ${spec.concepts[2].toLowerCase()}.`
      ],
      prediction: `Antes de ejecutar el ejemplo de «${spec.short}», ¿qué mostrará la consola y qué operación determina ese resultado?`,
      answer: `La salida observable del ejemplo se obtiene siguiendo la colección de izquierda a derecha y aplicando ${spec.concepts[0].toLowerCase()}.`,
      reflection: `Cambia un dato de entrada en «${spec.short}» y anticipa qué parte de la salida debería variar antes de ejecutar.`,
      extension: spec.extension || "Agrega un caso límite coherente con la misión y explica por qué el programa lo resuelve sin cambiar el resultado principal.",
      feedback: spec.patterns.map((item, position) => `Revisa «${item[0]}». ${spec.hints[position]}`).concat(`Revisa la salida completa. ${spec.hints[2]}`)
    }
  }));

  const levels = levelSpecs.map((level, levelIndex) => {
    const levelModules = modules.filter(module => level.modules.some(spec => spec.id === module.id));
    return {
      title: level.title,
      description: level.description,
      modules: levelModules,
      completionTitle: `Finalizaste ${level.title.toLowerCase()} de JavaScript.`,
      completionCopy: levelIndex < levelSpecs.length - 1
        ? `Completaste ${levelModules.length} módulos conectados. Rinde el mini examen; el siguiente nivel ya está disponible.`
        : "Completaste los dos proyectos integradores. Rinde el mini examen final y repasa cualquier transformación que todavía no puedas explicar.",
      approvedCopy: levelIndex < levelSpecs.length - 1
        ? `Aprobaste ${level.title.toLowerCase()}. Puedes continuar y volver cuando quieras para repasar.`
        : "Aprobaste el nivel final. Completaste cincuenta módulos de JavaScript desde variables hasta pipelines y proyectos verificables."
    };
  });

  const rotatedOptions = (correct, index) => {
    const options = ["Modificar datos sin comprobar el resultado", "Depender de un valor aleatorio", "Ocultar la salida del programa"];
    options.splice(index % 4, 0, correct);
    return { options, answer: index % 4 };
  };
  const exams = levels.map((level, levelIndex) => {
    const specs = levelSpecs[levelIndex].modules;
    const questions = Array.from({ length: 5 }, (_, index) => {
      if (index === 4) return {
        question: `¿Qué evidencia permite revisar los ejercicios de ${level.title.toLowerCase()}?`,
        options: ["Comparar la salida y las tres comprobaciones", "Contar líneas sin ejecutar", "Cambiar datos al azar", "Ocultar los casos que fallan"],
        answer: 0,
        explanation: "La salida observable y las comprobaciones conectan el código con los requisitos concretos de la misión."
      };
      const spec = specs[index % specs.length];
      const correct = spec.concepts[0];
      const choice = rotatedOptions(correct, index);
      return {
        question: `¿Qué idea es central en «${spec.short}»?`,
        options: choice.options,
        answer: choice.answer,
        explanation: `${correct}. ${spec.explanation}`
      };
    });
    return {
      levelId: levelIndex + 5,
      title: `Mini examen: ${level.title}`,
      passing: 4,
      intro: `Repasa ${level.title.toLowerCase()}. Necesitas cuatro respuestas correctas de cinco.`,
      questions
    };
  });

  function apply() {
    const course = globalThis.JavaScriptCourse;
    if (!course) return;
    if (course.levels.length === 3) globalThis.CourseExpansion?.apply({ javascript: course });
    if (course.levels.length === 4) globalThis.JavaScriptLearning?.apply(course);
    if (course.levels.length !== 4) return;
    course.levels.push(...levels);
    course.stages = [...(course.stages || []), ...levels.map(level => level.title)];
    const bank = globalThis.StarterExams?.LEVEL_EXAMS?.javascript;
    if (bank) for (const exam of exams) if (!bank.some(item => item.levelId === exam.levelId)) bank.push(exam);
    const allModules = course.levels.flatMap(level => level.modules);
    allModules.forEach((item, index) => {
      if (index < 16) return;
      const next = allModules[index + 1];
      item.success += next
        ? ` En el siguiente módulo aplicarás esta base para ${next.title.toLowerCase()}.`
        : " Completaste cincuenta módulos; revisa el proyecto y rinde el último mini examen.";
    });
  }

  apply();
  globalThis.JavaScriptFiftyCourse = Object.freeze({ levels, exams, apply });
})();
