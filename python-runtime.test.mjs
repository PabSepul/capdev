import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import { execFileSync } from "node:child_process";

/*
  Cada salida esperada de esta lista fue generada ejecutando el mismo programa en
  CPython 3.12. La prueba corre sin Python instalado; si lo encuentra, además
  vuelve a contrastar todo contra el intérprete real.
*/

const source = fs.readFileSync(new URL("./python-runtime.js", import.meta.url), "utf8");
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(source, sandbox);
const runtime = sandbox.PythonRuntime;

const CASES = [
  {
    "program": "print(\"Hola, Python\")",
    "expected": "Hola, Python"
  },
  {
    "program": "print()\nprint(\"después de una línea vacía\")",
    "expected": "\ndespués de una línea vacía"
  },
  {
    "program": "nombre = \"Ada\"\nedad = 28\nprint(f\"Soy {nombre} y tengo {edad} años\")",
    "expected": "Soy Ada y tengo 28 años"
  },
  {
    "program": "cuenta = 20000\nporcentaje = 10\npropina = cuenta * porcentaje / 100\ntotal = cuenta + propina\nprint(f\"Propina: {propina}\")\nprint(f\"Total: {total}\")",
    "expected": "Propina: 2000.0\nTotal: 22000.0"
  },
  {
    "program": "minutos = 135\nhoras = minutos // 60\nresto = minutos % 60\nprint(f\"{horas} h y {resto} min\")",
    "expected": "2 h y 15 min"
  },
  {
    "program": "print(7 // 2, 7 / 2, 7 % 2, 2 ** 10, -2 ** 2)",
    "expected": "3 3.5 1 1024 -4"
  },
  {
    "program": "print(10 / 5)\nprint(int(10 / 5))\nprint(round(2.5), round(3.5), round(2.675, 2), round(1.005, 2))",
    "expected": "2.0\n2\n2 4 2.67 1.0"
  },
  {
    "program": "print(0.1 + 0.2)\nprint(round(0.1 + 0.2, 2))",
    "expected": "0.30000000000000004\n0.3"
  },
  {
    "program": "edad = 15\nif edad >= 18:\n    print(\"Mayor de edad\")\nelse:\n    print(\"Menor de edad\")",
    "expected": "Menor de edad"
  },
  {
    "program": "nota = 5\nif nota >= 6:\n    print(\"Excelente\")\nelif nota >= 4:\n    print(\"Aprobado\")\nelse:\n    print(\"A reforzar\")",
    "expected": "Aprobado"
  },
  {
    "program": "temperatura = 30\nif temperatura < 10:\n    print(\"Hace frío\")\nelif temperatura < 25:\n    print(\"Clima agradable\")\nelse:\n    print(\"Hace calor\")",
    "expected": "Hace calor"
  },
  {
    "program": "for numero in range(1, 5):\n    print(numero)",
    "expected": "1\n2\n3\n4"
  },
  {
    "program": "for i in range(3):\n    for j in range(2):\n        print(i, j)",
    "expected": "0 0\n0 1\n1 0\n1 1\n2 0\n2 1"
  },
  {
    "program": "for n in range(10, 0, -3):\n    print(n)",
    "expected": "10\n7\n4\n1"
  },
  {
    "program": "tareas = [\"Leer\", \"Practicar\", \"Repetir\"]\nfor tarea in tareas:\n    print(\"-\", tarea)\nprint(len(tareas))",
    "expected": "- Leer\n- Practicar\n- Repetir\n3"
  },
  {
    "program": "total = 0\nfor n in [12, 6, 8, 5, 14]:\n    total += n\nprint(total)",
    "expected": "45"
  },
  {
    "program": "contador = 0\nwhile contador < 3:\n    print(contador)\n    contador += 1",
    "expected": "0\n1\n2"
  },
  {
    "program": "saldo = 100\nwhile saldo > 0:\n    saldo -= 40\n    if saldo < 0:\n        saldo = 0\n    print(saldo)",
    "expected": "60\n20\n0"
  },
  {
    "program": "def saludar(nombre):\n    return \"Hola, \" + nombre\nprint(saludar(\"Ada\"))",
    "expected": "Hola, Ada"
  },
  {
    "program": "def precio_final(precio, descuento=10):\n    return precio - precio * descuento / 100\nprint(precio_final(1000))\nprint(precio_final(1000, 50))\nprint(precio_final(precio=200, descuento=25))",
    "expected": "900.0\n500.0\n150.0"
  },
  {
    "program": "def describir(nombre, edad):\n    return f\"{nombre} tiene {edad} años\"\nprint(describir(\"Ada\", 36))",
    "expected": "Ada tiene 36 años"
  },
  {
    "program": "def sin_return():\n    x = 1\nprint(sin_return())",
    "expected": "None"
  },
  {
    "program": "notas = [4, 5, 6, 7]\npromedio = sum(notas) / len(notas)\nprint(f\"Promedio: {promedio}\")\nprint(f\"Promedio: {promedio:.2f}\")",
    "expected": "Promedio: 5.5\nPromedio: 5.50"
  },
  {
    "program": "palabra = \"programacion\"\nprint(palabra.upper())\nprint(palabra[0], palabra[-1])\nprint(palabra[0:4])\nprint(len(palabra))",
    "expected": "PROGRAMACION\np n\nprog\n12"
  },
  {
    "program": "frase = \"  hola mundo  \"\nprint(frase.strip().title())\nprint(\"mundo\" in frase)\nprint(frase.strip().split(\" \"))",
    "expected": "Hola Mundo\nTrue\n['hola', 'mundo']"
  },
  {
    "program": "texto = \"banana\"\nprint(texto.count(\"a\"), texto.find(\"n\"), texto.replace(\"a\", \"o\"))\nprint(texto.startswith(\"ba\"), texto.endswith(\"na\"))",
    "expected": "3 2 bonono\nTrue True"
  },
  {
    "program": "print(\"42\".isdigit(), \"abc\".isalpha(), \"ABC\".isupper(), \"abc\".islower())",
    "expected": "True True True True"
  },
  {
    "program": "cursos = [\"python\", \"sql\"]\ncursos.append(\"react\")\ncursos.sort()\nprint(cursos)\nprint(cursos.index(\"react\"))\ncursos.remove(\"sql\")\nprint(cursos)",
    "expected": "['python', 'react', 'sql']\n1\n['python', 'react']"
  },
  {
    "program": "numeros = [5, 3, 9, 1]\nprint(sorted(numeros))\nprint(sorted(numeros, reverse=True))\nprint(max(numeros), min(numeros), sum(numeros))",
    "expected": "[1, 3, 5, 9]\n[9, 5, 3, 1]\n9 1 18"
  },
  {
    "program": "palabras = [\"kiwi\", \"banana\", \"uva\"]\nprint(sorted(palabras, key=len))",
    "expected": "['uva', 'kiwi', 'banana']"
  },
  {
    "program": "pila = [1, 2, 3]\nprint(pila.pop())\npila.insert(0, 0)\nprint(pila)\npila.extend([7, 8])\nprint(pila, pila.count(0))",
    "expected": "3\n[0, 1, 2]\n[0, 1, 2, 7, 8] 1"
  },
  {
    "program": "persona = {\"nombre\": \"Ada\", \"edad\": 36}\nprint(persona[\"nombre\"])\nprint(persona.get(\"ciudad\", \"sin datos\"))\npersona[\"ciudad\"] = \"Londres\"\nprint(persona)\nprint(len(persona))",
    "expected": "Ada\nsin datos\n{'nombre': 'Ada', 'edad': 36, 'ciudad': 'Londres'}\n3"
  },
  {
    "program": "stock = {\"teclado\": 3, \"mouse\": 0}\nfor producto, cantidad in stock.items():\n    if cantidad == 0:\n        print(producto, \"agotado\")\n    else:\n        print(producto, cantidad)",
    "expected": "teclado 3\nmouse agotado"
  },
  {
    "program": "precios = {\"a\": 10, \"b\": 20}\nprint(list(precios.keys()))\nprint(list(precios.values()))\nprint(sum(precios.values()))",
    "expected": "['a', 'b']\n[10, 20]\n30"
  },
  {
    "program": "inventario = {\"lapiz\": 2}\ninventario[\"goma\"] = 5\ndel inventario[\"lapiz\"]\nprint(inventario)\nprint(\"goma\" in inventario)",
    "expected": "{'goma': 5}\nTrue"
  },
  {
    "program": "for indice, letra in enumerate(\"abc\"):\n    print(indice, letra)",
    "expected": "0 a\n1 b\n2 c"
  },
  {
    "program": "a = [1, 2, 3]\nb = [\"x\", \"y\", \"z\"]\nfor par in zip(a, b):\n    print(par)",
    "expected": "(1, 'x')\n(2, 'y')\n(3, 'z')"
  },
  {
    "program": "print([1, 2] + [3])\nprint([0] * 3)\nprint(\"ab\" * 2)\nprint(\"a\" + \"b\")",
    "expected": "[1, 2, 3]\n[0, 0, 0]\nabab\nab"
  },
  {
    "program": "print(True and False, True or False, not True)\nprint(1 == 1.0, \"a\" != \"b\", 3 < 5 <= 5)",
    "expected": "False True False\nTrue True True"
  },
  {
    "program": "try:\n    numero = int(\"hola\")\nexcept ValueError:\n    print(\"No es un número\")",
    "expected": "No es un número"
  },
  {
    "program": "try:\n    print(10 / 0)\nexcept ZeroDivisionError:\n    print(\"No se puede dividir por cero\")",
    "expected": "No se puede dividir por cero"
  },
  {
    "program": "try:\n    datos = [1]\n    print(datos[5])\nexcept IndexError:\n    print(\"Posición inválida\")\nfinally:\n    print(\"Listo\")",
    "expected": "Posición inválida\nListo"
  },
  {
    "program": "def dividir(a, b):\n    try:\n        return a / b\n    except ZeroDivisionError:\n        return 0\nprint(dividir(10, 2))\nprint(dividir(10, 0))",
    "expected": "5.0\n0"
  },
  {
    "program": "def validar(edad):\n    if edad < 0:\n        raise ValueError(\"La edad no puede ser negativa\")\n    return edad\ntry:\n    validar(-1)\nexcept ValueError:\n    print(\"Dato inválido\")",
    "expected": "Dato inválido"
  },
  {
    "program": "def acumular(items):\n    total = 0\n    for item in items:\n        total = total + item\n    return total\nprint(acumular([1, 2, 3]))\nprint(acumular([]))",
    "expected": "6\n0"
  },
  {
    "program": "def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\nprint(factorial(5))",
    "expected": "120"
  },
  {
    "program": "x = 5\nx += 3\nx -= 1\nx *= 2\nprint(x)\ny = 7\ny //= 2\nprint(y)",
    "expected": "14\n3"
  },
  {
    "program": "print(str(5) + \"!\", int(\"42\") + 1, float(\"2.5\") * 2, bool(\"\"), bool(\"a\"))",
    "expected": "5! 43 5.0 False True"
  },
  {
    "program": "datos = [10, 20, 30]\nprint(datos[1:], datos[:2], datos[::-1], datos[-1])",
    "expected": "[20, 30] [10, 20] [30, 20, 10] 30"
  },
  {
    "program": "print(f\"{3.14159:.2f}\")\nprint(f\"{10:.1f}\")\nprint(f\"{2 + 3} y {'texto'.upper()}\")",
    "expected": "3.14\n10.0\n5 y TEXTO"
  },
  {
    "program": "nombres = [\"ana\", \"luis\"]\nprint(\", \".join(nombres))\nprint(\", \".join([n.upper() for n in nombres]))",
    "expected": "ana, luis\nANA, LUIS"
  },
  {
    "program": "numeros = [1, 2, 3, 4, 5, 6]\npares = [n for n in numeros if n % 2 == 0]\nprint(pares)\nprint([n * n for n in pares])",
    "expected": "[2, 4, 6]\n[4, 16, 36]"
  },
  {
    "program": "edad = 20\nprint(\"mayor\" if edad >= 18 else \"menor\")\nestado = \"activo\" if True else \"inactivo\"\nprint(estado)",
    "expected": "mayor\nactivo"
  },
  {
    "program": "contador = 0\nfor n in range(10):\n    if n % 2 == 0:\n        continue\n    if n > 7:\n        break\n    contador += n\nprint(contador)",
    "expected": "16"
  },
  {
    "program": "print(abs(-4), abs(-4.5), max(1, 9), min([3, 2]))",
    "expected": "4 4.5 9 2"
  },
  {
    "program": "libro = {\"titulo\": \"Python\", \"paginas\": 300}\nfor clave in libro:\n    print(clave, libro[clave])",
    "expected": "titulo Python\npaginas 300"
  },
  {
    "program": "print(list(range(3)), list(\"abc\"), tuple([1, 2]))",
    "expected": "[0, 1, 2] ['a', 'b', 'c'] (1, 2)"
  },
  {
    "program": "valores = [1, 2, 3]\nvalores[0] = 99\nprint(valores)\ndel valores[1]\nprint(valores)",
    "expected": "[99, 2, 3]\n[99, 3]"
  },
  {
    "program": "a, b = 1, 2\na, b = b, a\nprint(a, b)",
    "expected": "2 1"
  },
  {
    "program": "carrito = [{\"producto\": \"teclado\", \"precio\": 25990, \"cantidad\": 1}, {\"producto\": \"mouse\", \"precio\": 12990, \"cantidad\": 2}]\ntotal = 0\nfor item in carrito:\n    total += item[\"precio\"] * item[\"cantidad\"]\nprint(f\"Total: ${total}\")",
    "expected": "Total: $51970"
  },
  {
    "program": "ventas = {\"lunes\": 120, \"martes\": 340, \"miercoles\": 90}\nmejor = \"\"\nmayor = 0\nfor dia, monto in ventas.items():\n    if monto > mayor:\n        mayor = monto\n        mejor = dia\nprint(f\"El mejor día fue {mejor} con {mayor}\")",
    "expected": "El mejor día fue martes con 340"
  },
  {
    "program": "def contar_palabras(frase):\n    palabras = frase.split()\n    conteo = {}\n    for palabra in palabras:\n        clave = palabra.lower()\n        conteo[clave] = conteo.get(clave, 0) + 1\n    return conteo\nprint(contar_palabras(\"uno dos Uno\"))",
    "expected": "{'uno': 2, 'dos': 1}"
  },
  {
    "program": "def es_par(n):\n    return n % 2 == 0\nnumeros = [1, 2, 3, 4]\nprint([n for n in numeros if es_par(n)])\nprint(len([n for n in numeros if not es_par(n)]))",
    "expected": "[2, 4]\n2"
  },
  {
    "program": "matriz = [[1, 2], [3, 4]]\nfor fila in matriz:\n    for valor in fila:\n        print(valor, end=\" \")\nprint()",
    "expected": "1 2 3 4 "
  },
  {
    "program": "print(\"a\", \"b\", sep=\"-\")\nprint(\"sin salto\", end=\"\")\nprint(\"|fin\")",
    "expected": "a-b\nsin salto|fin"
  },
  {
    "program": "ventas = [{\"curso\": \"SQL\", \"total\": 40}, {\"curso\": \"Python\", \"total\": 120}, {\"curso\": \"Git\", \"total\": 75}]\nordenadas = sorted(ventas, key=lambda fila: fila[\"total\"], reverse=True)\nfor fila in ordenadas:\n    print(fila[\"curso\"], fila[\"total\"])",
    "expected": "Python 120\nGit 75\nSQL 40"
  },
  {
    "program": "nombres = [\"ana\", \"Bruno\", \"carla\"]\nprint(sorted(nombres, key=lambda texto: texto.lower()))",
    "expected": "['ana', 'Bruno', 'carla']"
  },
  {
    "program": "datos = [{\"n\": \"a\", \"v\": 3}, {\"n\": \"b\", \"v\": 9}]\nprint(max(datos, key=lambda f: f[\"v\"])[\"n\"])\nprint(min(datos, key=lambda f: f[\"v\"])[\"n\"])",
    "expected": "b\na"
  },
  {
    "program": "doble = lambda n: n * 2\nprint(doble(21))",
    "expected": "42"
  },
  {
    "program": "sumar = lambda a, b=10: a + b\nprint(sumar(5), sumar(5, 1))",
    "expected": "15 6"
  },
  {
    "program": "print(sorted([(2, \"b\"), (1, \"c\"), (1, \"a\")]))",
    "expected": "[(1, 'a'), (1, 'c'), (2, 'b')]"
  },
  {
    "program": "inventario = {\"sql\": 4, \"python\": 9, \"git\": 2}\nprint(sorted(inventario.items(), key=lambda par: par[1]))",
    "expected": "[('git', 2), ('sql', 4), ('python', 9)]"
  },
  {
    "program": "print([1, 2] < [1, 3], [1, 2] < [1, 2, 0], (1, 2) >= (1, 2))",
    "expected": "True True True"
  },
  {
    "program": "print(sorted([[2, 1], [1, 9], [1, 2]]))",
    "expected": "[[1, 2], [1, 9], [2, 1]]"
  },
  {
    "program": "etiquetas = [\"web\", \"datos\", \"web\", \"ia\", \"datos\"]\nunicas = set(etiquetas)\nprint(len(unicas))\nprint(sorted(unicas))",
    "expected": "3\n['datos', 'ia', 'web']"
  },
  {
    "program": "a = set([1, 2, 3])\nb = set([2, 3, 4])\nprint(sorted(a.intersection(b)))\nprint(sorted(a.difference(b)))\nprint(sorted(a.union(b)))",
    "expected": "[2, 3]\n[1]\n[1, 2, 3, 4]"
  },
  {
    "program": "vistos = set()\nfor n in [3, 1, 3, 2, 1]:\n    vistos.add(n)\nprint(sorted(vistos))\nprint(2 in vistos, 9 in vistos)",
    "expected": "[1, 2, 3]\nTrue False"
  },
  {
    "program": "print(sorted({n % 3 for n in range(10)}))",
    "expected": "[0, 1, 2]"
  },
  {
    "program": "c = set([1, 2])\nc.discard(1)\nc.discard(99)\nprint(sorted(c), len(c))",
    "expected": "[2] 1"
  },
  {
    "program": "print(set() == set(), len(set()))",
    "expected": "True 0"
  },
  {
    "program": "precios = {\"a\": 1000, \"b\": 2500}\ncon_iva = {clave: round(valor * 1.19) for clave, valor in precios.items()}\nprint(con_iva)",
    "expected": "{'a': 1190, 'b': 2975}"
  },
  {
    "program": "print({n: n * n for n in range(1, 5)})",
    "expected": "{1: 1, 2: 4, 3: 9, 4: 16}"
  },
  {
    "program": "texto = \"casa arbol casa sol\"\nconteo = {}\nfor palabra in texto.split(\" \"):\n    conteo[palabra] = conteo.get(palabra, 0) + 1\nprint(sorted(conteo.items(), key=lambda par: (-par[1], par[0])))",
    "expected": "[('casa', 2), ('arbol', 1), ('sol', 1)]"
  },
  {
    "program": "largos = {p: len(p) for p in [\"sol\", \"arbol\"] if len(p) > 3}\nprint(largos)",
    "expected": "{'arbol': 5}"
  },
  {
    "program": "notas = [4, 5, 3]\nprint(any([n < 4 for n in notas]))\nprint(all([n > 0 for n in notas]))",
    "expected": "True\nTrue"
  },
  {
    "program": "print(isinstance(3, int), isinstance(3.5, float), isinstance(\"a\", str), isinstance(True, int), isinstance([], list))",
    "expected": "True True True True True"
  },
  {
    "program": "valores = [\"4\", 7, \"no\", 2.5]\nnumeros = [v for v in valores if isinstance(v, int) or isinstance(v, float)]\nprint(numeros)",
    "expected": "[7, 2.5]"
  },
  {
    "program": "grupos = {}\nfor curso, area in [(\"SQL\", \"datos\"), (\"Python\", \"datos\"), (\"CSS\", \"web\")]:\n    grupos.setdefault(area, []).append(curso)\nprint(grupos)",
    "expected": "{'datos': ['SQL', 'Python'], 'web': ['CSS']}"
  },
  {
    "program": "filas = [(\"Python\", 120), (\"SQL\", 40)]\nfor nombre, total in filas:\n    print(f\"{nombre:<10}{total:>6}\")",
    "expected": "Python       120\nSQL           40"
  },
  {
    "program": "print(f\"{3.14159:8.2f}|\")\nprint(f\"{42:05d}|\")\nprint(f\"{-42:05d}|\")",
    "expected": "    3.14|\n00042|\n-0042|"
  },
  {
    "program": "print(f\"{1234567:,}\")\nprint(f\"{1234567.891:,.2f}\")",
    "expected": "1,234,567\n1,234,567.89"
  },
  {
    "program": "print(f\"{'centro':^11}|\")\nprint(f\"{'x':-<5}|\")",
    "expected": "  centro   |\nx----|"
  },
  {
    "program": "total = 1999.5\nprint(f\"Total: ${total:,.0f}\")",
    "expected": "Total: $2,000"
  },
  {
    "program": "registros = [\n    {\"alumno\": \"Ana\", \"curso\": \"Python\", \"nota\": 6.5},\n    {\"alumno\": \"Beto\", \"curso\": \"Python\", \"nota\": 4.0},\n    {\"alumno\": \"Ana\", \"curso\": \"SQL\", \"nota\": 5.5},\n]\npor_curso = {}\nfor fila in registros:\n    por_curso.setdefault(fila[\"curso\"], []).append(fila[\"nota\"])\nfor curso in sorted(por_curso):\n    notas = por_curso[curso]\n    print(f\"{curso:<8}{sum(notas) / len(notas):>6.2f}\")",
    "expected": "Python    5.25\nSQL       5.50"
  },
  {
    "program": "lineas = \"id,curso\\n1,Python\\n2,SQL\".split(\"\\n\")\ncabecera = lineas[0].split(\",\")\nfilas = [dict(zip(cabecera, linea.split(\",\"))) for linea in lineas[1:]]\nprint(filas)",
    "expected": "[{'id': '1', 'curso': 'Python'}, {'id': '2', 'curso': 'SQL'}]"
  }
];

const ERRORS = [
  "print(desconocida)",
  "print(10 / 0)",
  "numero = int(\"hola\")",
  "datos = [1, 2]\nprint(datos[9])",
  "persona = {\"a\": 1}\nprint(persona[\"b\"])",
  "print(\"texto\" + 5)",
  "while True:\n    pass",
  "def f():\nprint(1)",
  "import os",
  "print(input(\"dame un dato\"))"
];

for (const { program, expected } of CASES) {
  const result = runtime.run(program);
  const actual = result.error ? "ERROR: " + result.error : result.text;
  assert.equal(actual, expected, "salida distinta a CPython para:\n" + program);
}

ERRORS.push(
  "print(sum(n for n in [1, 2]))",
  "print(f\"{1:zz}\")",
  "print(isinstance(1, print))",
  "c = set([1])\nc.remove(9)"
);

for (const program of ERRORS) {
  const result = runtime.run(program);
  assert.ok(result.error, "este programa debía fallar:\n" + program);
  assert.ok(/[a-záéíóúñ]/i.test(result.error), "el error debe explicarse en palabras: " + result.error);
}

const guarded = runtime.run("x = 0\nwhile True:\n    x += 1");
assert.match(guarded.error, /ciclo|operaciones/i, "un ciclo infinito debe detenerse solo");

/* El límite de palabra importa: sin él, `new PyFunction("<lambda>"` daba un falso
   positivo. Se comprueba antes que el patrón siga detectando lo que debe detectar. */
const PROHIBIDO = /\beval\s*\(|\bnew Function\b|\bFunction\s*\(\s*["'`]/;
for (const trampa of ['eval("1+1")', 'new Function("return 1")', 'Function("a", "return a")', 'window.eval ("x")']) {
  assert.ok(PROHIBIDO.test(trampa), "el guardia debe detectar: " + trampa);
}
for (const inocente of ['new PyFunction("<lambda>", params)', 'callValue(keyFunction, [item])', 'evaluate(node, scope)']) {
  assert.equal(PROHIBIDO.test(inocente), false, "el guardia no debe marcar: " + inocente);
}
assert.equal(PROHIBIDO.test(source), false, "el intérprete no puede usar eval ni Function");

const entorno = runtime.run("nombre = \"Ada\"\nedad = 36\nnotas = [4, 5]\ndatos = {\"a\": 1}");
assert.deepEqual(JSON.parse(JSON.stringify(entorno.environment)), { nombre: "Ada", edad: 36, notas: [4, 5], datos: { a: 1 } });

let contrastados = 0;
try {
  const file = path.join(os.tmpdir(), "codigo-cero-python.py");
  for (const { program, expected } of CASES) {
    fs.writeFileSync(file, program, "utf8");
    const real = execFileSync("python", [file], {
      encoding: "utf8",
      env: { ...process.env, PYTHONIOENCODING: "utf-8" }
    }).replace(/\r\n/g, "\n").replace(/\n$/, "");
    assert.equal(real, expected, "CPython cambió el resultado esperado de:\n" + program);
    contrastados += 1;
  }
} catch (error) {
  if (error instanceof assert.AssertionError) throw error;
  contrastados = -1;
}

const detalle = contrastados >= 0
  ? contrastados + " contrastados en vivo con CPython"
  : "CPython no disponible: se usaron las salidas registradas";
console.log(`Python: ${CASES.length} programas iguales a CPython y ${ERRORS.length} errores explicados (${detalle})`);
