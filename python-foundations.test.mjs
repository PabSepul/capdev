import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
const {JSDOM} = require(path.join(process.env.CONTENT_QA_MODULES || path.join(os.tmpdir(), 'capsulasdev-content-qa', 'node_modules'), 'jsdom'));
const read = file => fs.readFileSync(new URL(file, import.meta.url), 'utf8');
const w = new JSDOM(read('python.html'), {url:'http://localhost/python.html', runScripts:'outside-only'}).window;
for (const file of ['learning-state.js', 'python-runtime.js', 'python-advanced-course.js', 'python-mastery-course.js', 'python.js']) w.eval(read(file));
const doc = w.document;
const output = () => doc.querySelector('#course-project-output').textContent;
const coaching = () => doc.querySelector('#python-coaching');
const run = code => {
  doc.querySelector('#course-project-code').value = code;
  doc.querySelector('#course-project-code').dispatchEvent(new w.Event('input'));
  doc.querySelector('#run-course-project').click();
};
const activate = id => w.eval('activateProject(' + id + ')');
// Cada inicio exige intervenir, pero se ejecuta sin un error de sintaxis artificial.
for (let id=1; id<=4; id++) {
  activate(id);
  run(w.eval('getActiveProject().starter'));
  assert.equal(doc.querySelector('#course-project-output').classList.contains('is-error'), false, `Proyecto ${id}: ${output()}`);
  assert.equal(doc.querySelector('#complete-course-project').disabled, true);
  assert.equal(coaching().hidden, false);
}
activate(1);
run('print("Vamos al parque")');
assert.equal(output(), 'Vamos al parque');
assert.equal(coaching().hidden, true);
assert.equal(doc.querySelector('#complete-course-project').disabled, false);
run('print("")');
assert.match(coaching().textContent, /tres caracteres/);
doc.querySelector('#python-prediction-answer').open = true;
activate(2);
assert.equal(doc.querySelector('#python-prediction-answer').open, false);
run('nombre = "Luna"\nedad = 24\nprint("Soy {nombre} y tengo {edad} años")');
assert.match(coaching().textContent, /f justo antes/);
run('nombre = "Luna"\nedad = 24\nprint(f"Soy {nombre} y tengo {edad} años")');
assert.equal(output(), 'Soy Luna y tengo 24 años');
assert.equal(coaching().hidden, true);
// No diagnosticar criterios de la misión si el intérprete no pudo terminar.
run('print(persona_sin_definir)');
assert.match(coaching().textContent, /programa se detuvo/);
assert.equal(doc.querySelector('#complete-course-project').disabled, true);
activate(3);
for (const porcentaje of [0,15]) {
  run(`cuenta = 20000\nporcentaje = ${porcentaje}\npropina = cuenta * porcentaje / 100\ntotal = cuenta + propina\nprint(propina)\nprint(total)`);
  assert.equal(doc.querySelector('#complete-course-project').disabled, false);
}
activate(4);
for (const minutos of [59,60,61,135]) {
  run(`minutos = ${minutos}\nhoras = minutos // 60\nresto = minutos % 60\nprint(f"{horas} h y {resto} min")`);
  assert.equal(output(), `${Math.floor(minutos/60)} h y ${minutos%60} min`);
  assert.equal(doc.querySelector('#complete-course-project').disabled, false);
}
// Los ejemplos mostrados también son programas ejecutables con salidas correctas.
const expected = ['Hoy vamos al parque','Soy Luna y tengo 24 años','1000.0\n11000.0','1 h y 35 min'];
for (let id=1;id<=4;id++) {
  activate(id);
  const result = w.PythonRuntime.run(doc.querySelector('#course-project-example').textContent);
  assert.equal(result.text, expected[id-1]);
  run(doc.querySelector('#course-project-example').textContent);
  doc.querySelector('#complete-course-project').click();
}
// El segundo nivel explica cada ejemplo y comprueba sus límites y errores habituales.
const decisions = [
  {id:5, expected:'Tienes 18 años: mayor de edad', solution:'edad = 20\nif edad >= 18:\n    print(f"Tienes {edad} años: mayor de edad")\nelse:\n    print(f"Tienes {edad} años: menor de edad")', feedback:/edad debe valer 20/},
  {id:6, expected:'Clima agradable', solution:'temperatura = 30\nif temperatura < 10:\n    print("Hace frío")\nelif temperatura < 25:\n    print("Clima agradable")\nelse:\n    print("Hace calor")', feedback:/categoría intermedia/},
  {id:7, expected:'Vuelta 1\nVuelta 2\nVuelta 3', solution:'for numero in range(1, 6):\n    print(f"Vuelta {numero}")', feedback:/necesitas cinco/},
  {id:8, expected:'- Elegir el lugar\n- Acordar la hora\nTotal: 2 tareas', solution:'tareas = ["Elegir el lugar", "Acordar la hora", "Preparar agua"]\nfor tarea in tareas:\n    print("-", tarea)\nprint(f"Total: {len(tareas)} tareas")', feedback:/al menos tres/}
];
for (const project of decisions) {
  activate(project.id);
  assert.equal(w.eval('getActiveProject().id'), project.id);
  assert.equal(doc.querySelector('#python-lesson-support').hidden, false);
  assert.equal(doc.querySelector('#python-lesson-extra').hidden, false);
  assert.equal(doc.querySelector('#python-prediction-answer').open, false);
  const example = doc.querySelector('#course-project-example').textContent;
  assert.equal(w.PythonRuntime.run(example).text, project.expected);
  run(w.eval('getActiveProject().starter'));
  assert.equal(doc.querySelector('#course-project-output').classList.contains('is-error'), false, output());
  assert.equal(doc.querySelector('#complete-course-project').disabled, true);
  assert.match(coaching().textContent, project.feedback);
  run(project.solution);
  assert.equal(doc.querySelector('#complete-course-project').disabled, false, output());
  assert.equal(coaching().hidden, true);
  doc.querySelector('#complete-course-project').click();
  doc.querySelector('#python-prediction-answer').open = true;
}
const execute = code => w.PythonRuntime.run(code).text;
const age = decisions[0].solution;
for (const [value, category] of [[17,'menor'],[18,'mayor'],[19,'mayor']]) {
  assert.equal(execute(age.replace('edad = 20', `edad = ${value}`)), `Tienes ${value} años: ${category} de edad`);
}
const temperature = decisions[1].solution;
for (const [value, message] of [[9,'Hace frío'],[10,'Clima agradable'],[24,'Clima agradable'],[25,'Hace calor'],[30,'Hace calor']]) {
  assert.equal(execute(temperature.replace('temperatura = 30', `temperatura = ${value}`)), message);
}
assert.equal(execute(decisions[2].solution.replace('range(1, 6)', 'range(1, 1)')), '');
assert.equal(execute(decisions[2].solution.replace('range(1, 6)', 'range(1, 5)')), 'Vuelta 1\nVuelta 2\nVuelta 3\nVuelta 4');
const extraTask = decisions[3].solution.replace('"Preparar agua"]', '"Preparar agua", "Llevar fruta"]');
assert.equal(execute(extraTask), '- Elegir el lugar\n- Acordar la hora\n- Preparar agua\n- Llevar fruta\nTotal: 4 tareas');
// La ayuda identifica el criterio pendiente después de corregir el anterior.
activate(5);
run(age.replace('print(f"Tienes {edad} años: mayor de edad")', 'print("Mayor de edad")'));
assert.match(coaching().textContent, /valor 20 y la palabra mayor/);
activate(6);
run(temperature.replace('temperatura = 30', 'temperatura = 18'));
assert.match(coaching().textContent, /temperatura en 30/);
activate(7);
run('for numero in range(1, 6):\n    print(numero)');
assert.match(coaching().textContent, /palabra Vuelta/);
activate(8);
run(decisions[3].solution.replace('print("-", tarea)', 'print(tarea)'));
assert.match(coaching().textContent, /guion al comienzo/);
run(decisions[3].solution.replace('print(f"Total: {len(tareas)} tareas")', 'print("Total: 3 tareas")'));
assert.match(coaching().textContent, /Usa len/);
// El tercer nivel aplica la misma estructura a listas y diccionarios.
const collections = [
  {id:9, expected:"['pan', 'fruta']\n2", solution:'compras = ["pan", "leche"]\ncompras.append("huevos")\ncompras.remove("leche")\nprint(compras)\nprint(len(compras))', feedback:/añadir huevos/},
  {id:10, expected:'[700, 1100, 1500]\n700 1500\nPromedio: 1100.00', solution:'precios = [1200, 890, 2300, 450]\nordenados = sorted(precios)\npromedio = sum(precios) / len(precios)\nprint(ordenados)\nprint(min(precios), max(precios))\nprint(f"Promedio: {promedio:.2f}")', feedback:/sorted/},
  {id:11, expected:"{'nombre': 'Python', 'horas': 12, 'nivel': 'inicial'}\nsin datos", solution:'curso = {"nombre": "Python", "horas": 12}\ncurso["nivel"] = "inicial"\nprint(curso)\nprint(curso.get("profesor", "sin datos"))', feedback:/clave nivel/},
  {id:12, expected:'teclado 2\nmouse agotado\nTotal: 2 unidades', solution:'stock = {"teclado": 3, "mouse": 0, "monitor": 5}\ntotal = 0\nfor producto, cantidad in stock.items():\n    if cantidad == 0:\n        print(producto, "agotado")\n    else:\n        print(producto, cantidad)\n    total += cantidad\nprint(f"Total: {total} unidades")', feedback:/items/}
];
for (const project of collections) {
  activate(project.id);
  assert.equal(w.eval('getActiveProject().id'), project.id);
  assert.equal(doc.querySelector('#python-lesson-support').hidden, false);
  assert.equal(doc.querySelector('#python-lesson-extra').hidden, false);
  assert.equal(doc.querySelector('#python-prediction-answer').open, false);
  assert.equal(w.PythonRuntime.run(doc.querySelector('#course-project-example').textContent).text, project.expected);
  run(w.eval('getActiveProject().starter'));
  assert.equal(doc.querySelector('#course-project-output').classList.contains('is-error'), false, output());
  assert.equal(doc.querySelector('#complete-course-project').disabled, true);
  assert.match(coaching().textContent, project.feedback);
  run(project.solution);
  assert.equal(doc.querySelector('#complete-course-project').disabled, false, output());
  assert.equal(coaching().hidden, true);
  doc.querySelector('#complete-course-project').click();
  doc.querySelector('#python-prediction-answer').open = true;
}
// Casos que muestran que los cálculos se adaptan al contenido de cada colección.
assert.equal(execute('compras = ["fruta", "fruta"]\ncompras.remove("fruta")\nprint(compras)\nprint(len(compras))'), "['fruta']\n1");
assert.equal(execute('precios = [1500, 700, 1100, 2100]\npromedio = sum(precios) / len(precios)\nprint(f"{promedio:.2f}")'), '1350.00');
assert.equal(execute('curso = {"profesor": "Luna"}\nprint(curso.get("profesor", "sin datos"))'), 'Luna');
assert.equal(execute(collections[3].solution.replace('"mouse": 0', '"mouse": 4')), 'teclado 3\nmouse 4\nmonitor 5\nTotal: 12 unidades');
// La orientación avanza al siguiente criterio cuando se corrige el anterior.
activate(9);
run(collections[0].solution.replace('compras.remove("leche")\n', ''));
assert.match(coaching().textContent, /leche sigue/);
run(collections[0].solution.replace('print(len(compras))', 'print("Lista lista")'));
assert.match(coaching().textContent, /tamaño calculado/);
activate(10);
run(collections[1].solution.replace('print(f"Promedio: {promedio:.2f}")', 'print(promedio)'));
assert.match(coaching().textContent, /dos decimales/);
activate(11);
run(collections[2].solution.replace('print(curso)\n', ''));
assert.match(coaching().textContent, /curso completo/);
run(collections[2].solution.replace('print(curso.get("profesor", "sin datos"))', 'print("sin datos")'));
assert.match(coaching().textContent, /get\(\)/);
activate(12);
run(collections[3].solution.replace('print(producto, "agotado")', 'print("agotado")'));
assert.match(coaching().textContent, /nombre mouse/);
run(collections[3].solution.replace('print(f"Total: {total} unidades")', 'print("Terminado")'));
assert.match(coaching().textContent, /suma 8/);
// El cuarto nivel reutiliza funciones con argumentos, valores predeterminados y colecciones.
const functionsLevel = [
  {id:13, expected:'Hola, Luna\nHola, Nico', solution:'def saludar(nombre):\n    return f"Hola, {nombre}"\n\nprint(saludar("Ada"))\nprint(saludar("Grace"))', feedback:/salida debe comenzar/},
  {id:14, expected:'1800.0\n1500.0', solution:'def precio_final(precio, descuento=10):\n    return precio - precio * descuento / 100\n\nprint(precio_final(1000))\nprint(precio_final(1000, 50))', feedback:/valor predeterminado/},
  {id:15, expected:'6.00\n5.00', solution:'def promedio(notas):\n    return sum(notas) / len(notas)\n\nprint(f"{promedio([4, 5, 6, 7]):.2f}")\nprint(f"{promedio([6, 7]):.2f}")', feedback:/sum\(\).*len\(\)/},
  {id:16, expected:'4\nLA SALIDA COMIENZA TEMPRANO', solution:'frase = "aprender python abre puertas"\n\ndef contar_palabras(texto):\n    return len(texto.split())\n\nprint(contar_palabras(frase))\nprint(frase.upper())', feedback:/split\(\)/}
];
for (const project of functionsLevel) {
  activate(project.id);
  assert.equal(w.eval('getActiveProject().id'), project.id);
  assert.equal(doc.querySelector('#python-lesson-support').hidden, false);
  assert.equal(doc.querySelector('#python-lesson-extra').hidden, false);
  assert.equal(doc.querySelector('#python-prediction-answer').open, false);
  assert.equal(w.PythonRuntime.run(doc.querySelector('#course-project-example').textContent).text, project.expected);
  run(w.eval('getActiveProject().starter'));
  assert.equal(doc.querySelector('#course-project-output').classList.contains('is-error'), false, output());
  assert.equal(doc.querySelector('#complete-course-project').disabled, true);
  assert.match(coaching().textContent, project.feedback);
  run(project.solution);
  assert.equal(doc.querySelector('#complete-course-project').disabled, false, output());
  assert.equal(coaching().hidden, true);
  doc.querySelector('#complete-course-project').click();
}
assert.equal(execute('def saludar(nombre):\n    return f"Hola, {nombre}"\nprint(saludar("Luna"))'), 'Hola, Luna');
assert.equal(execute('def precio_final(precio, descuento=10):\n    return precio - precio * descuento / 100\nprint(precio_final(2000, 0))\nprint(precio_final(2000, 100))'), '2000.0\n0.0');
assert.equal(execute('def promedio(valores):\n    return sum(valores) / len(valores)\nprint(f"{promedio([8]):.2f}")'), '8.00');
assert.equal(execute('def contar_palabras(texto):\n    return len(texto.split())\nprint(contar_palabras("hola    mundo"))'), '2');
activate(13);
run(functionsLevel[0].solution.replace('\nprint(saludar("Grace"))', ''));
assert.match(coaching().textContent, /dos veces/);
activate(14);
run(functionsLevel[1].solution.replace('\nprint(precio_final(1000, 50))', ''));
assert.match(coaching().textContent, /segunda llamada/);
activate(15);
run(functionsLevel[2].solution.replace('\nprint(f"{promedio([6, 7]):.2f}")', ''));
assert.match(coaching().textContent, /\[6, 7\]/);
activate(16);
run(functionsLevel[3].solution.replace('\nprint(frase.upper())', ''));
assert.match(coaching().textContent, /mayúsculas/);
// La integración final combina los conceptos y mantiene inicios ejecutables.
const integration = [
  {id:17, expected:'[12, 20]\n2', solution:'numeros = [12, 7, 30, 4, 18]\ngrandes = [n for n in numeros if n > 10]\nprint(grandes)\nprint(len(grandes))', feedback:/comprensión/},
  {id:18, expected:'Dato inválido: error\n10', solution:'datos = ["12", "hola", "30"]\ntotal = 0\n\nfor dato in datos:\n    try:\n        total += int(dato)\n    except ValueError:\n        print("Dato inválido:", dato)\n\nprint(total)', feedback:/valor hola/},
  {id:19, expected:'El mejor día fue martes con 90\n140', solution:'ventas = {"lunes": 120, "martes": 340, "miercoles": 90}\n\ndef mejor_dia(datos):\n    dia = ""\n    monto = 0\n    for clave, valor in datos.items():\n        if valor > monto:\n            monto = valor\n            dia = clave\n    return f"El mejor día fue {dia} con {monto}"\n\nprint(mejor_dia(ventas))\nprint(sum(ventas.values()))', feedback:/mensaje debe incluir martes/},
  {id:20, expected:'Completadas 1 de 2 (50%)\n- Confirmar hora', solution:'tareas = [\n    {"nombre": "Leer la guía", "hecha": True},\n    {"nombre": "Practicar", "hecha": False},\n    {"nombre": "Repasar", "hecha": False}\n]\n\ndef resumen(items):\n    hechas = 0\n    for tarea in items:\n        if tarea["hecha"]:\n            hechas += 1\n    porcentaje = int(hechas / len(items) * 100)\n    print(f"Completadas {hechas} de {len(items)} ({porcentaje}%)")\n    for tarea in items:\n        if not tarea["hecha"]:\n            print("-", tarea["nombre"])\n\nresumen(tareas)', feedback:/Cuenta las tareas/}
];
for (const project of integration) {
  activate(project.id);
  assert.equal(w.eval('getActiveProject().id'), project.id);
  assert.equal(doc.querySelector('#python-lesson-support').hidden, false);
  assert.equal(doc.querySelector('#python-lesson-extra').hidden, false);
  assert.equal(doc.querySelector('#python-prediction-answer').open, false);
  assert.equal(w.PythonRuntime.run(doc.querySelector('#course-project-example').textContent).text, project.expected);
  run(w.eval('getActiveProject().starter'));
  assert.equal(doc.querySelector('#course-project-output').classList.contains('is-error'), false, `Proyecto ${project.id}: ${output()}`);
  assert.equal(doc.querySelector('#complete-course-project').disabled, true);
  assert.match(coaching().textContent, project.feedback);
  run(project.solution);
  assert.equal(doc.querySelector('#complete-course-project').disabled, false, output());
  assert.equal(coaching().hidden, true);
  doc.querySelector('#complete-course-project').click();
}
assert.equal(execute('numeros = [9, 10, 11]\nprint([n for n in numeros if n > 10])'), '[11]');
assert.equal(execute('datos = ["1", "x", "y", "2"]\nerrores = 0\ntotal = 0\nfor dato in datos:\n    try:\n        total += int(dato)\n    except ValueError:\n        errores += 1\nprint(total, errores)'), '3 2');
assert.equal(execute(integration[2].solution.replace('"lunes": 120', '"lunes": 400')), 'El mejor día fue lunes con 400\n830');
assert.equal(execute(integration[3].solution.replace('{"nombre": "Practicar", "hecha": False}', '{"nombre": "Practicar", "hecha": True}')), 'Completadas 2 de 3 (66%)\n- Repasar');
activate(18);
run(integration[1].solution.replace('print("Dato inválido:", dato)', 'print("Dato inválido")'));
assert.match(coaching().textContent, /valor hola/);
activate(19);
run(integration[2].solution.replace('\nprint(sum(ventas.values()))', ''));
assert.match(coaching().textContent, /total 550/);
activate(20);
run(integration[3].solution.replace('print("-", tarea["nombre"])', 'print(tarea["nombre"])'));
assert.match(coaching().textContent, /con un guion/);
w.close();
console.log('Python 1–20: ejemplos completos, inicios ejecutables, orientación por criterio y casos alternativos de los cinco niveles: OK');
