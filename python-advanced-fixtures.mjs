export const ADVANCED_SOLUTIONS = {
  21: `intentos = 4
while intentos > 0:
    print(f"Intento {intentos}")
    intentos -= 1
print("Sin intentos")`,
  22: `pasos = ["Elegir lugar", "Confirmar hora", "Preparar mochila"]
for numero, paso in enumerate(pasos, 1):
    print(f"{numero}. {paso}")`,
  23: `personas = ["Ana", "Luis", "Zoe"]
opciones = ["parque", "museo", "café"]
for persona, opcion in zip(personas, opciones):
    print(f"{persona}: {opcion}")`,
  24: `invitados = set(["Ana", "Luis", "Ana", "Zoe"])
confirmados = set(["Ana", "Zoe"])
pendientes = invitados.difference(confirmados)
print(f"Total únicos: {len(invitados)}")
print(f"Pendientes: {sorted(pendientes)}")`,
  25: `precios = [1000, 2000, 3000]
con_impuesto = [int(precio * 1.19) for precio in precios]
print(con_impuesto)
print(f"Total: {sum(con_impuesto)}")`,
  26: `nombres = ["Python", "SQL", "React"]
longitudes = {nombre: len(nombre) for nombre in nombres}
for nombre in nombres:
    print(f"{nombre}: {longitudes[nombre]}")`,
  27: `equipos = [
    {"nombre": "Sol", "puntos": 72},
    {"nombre": "Luna", "puntos": 95},
    {"nombre": "Río", "puntos": 81}
]
ranking = sorted(equipos, key=lambda equipo: equipo["puntos"], reverse=True)
for equipo in ranking:
    print(equipo["nombre"], equipo["puntos"])`,
  28: `duraciones = [45, 60, 30]
todos_validos = all([minutos > 0 for minutos in duraciones])
hay_sesion_larga = any([minutos > 45 for minutos in duraciones])
print(f"Todos válidos: {todos_validos}")
print(f"Hay sesión larga: {hay_sesion_larga}")`,
  29: `def sumar_hasta(n):
    if n == 0:
        return 0
    return n + sumar_hasta(n - 1)

print(sumar_hasta(5))`,
  30: `def validar_cupo(cupos):
    if cupos < 0:
        raise ValueError("Cupo negativo")
    return cupos

try:
    validar_cupo(-2)
except ValueError:
    print("Cupo inválido")

print(validar_cupo(3))`,
  31: `datos = ["12", "hola", "30"]

def convertir(texto):
    try:
        return int(texto)
    except ValueError:
        return 0
    finally:
        print("Revisado:", texto)

valores = [convertir(dato) for dato in datos]
print(f"Total: {sum(valores)}")`,
  32: `nombres = ["  ana", "LUIS  ", "  maría  "]

def limpiar(texto):
    return texto.strip().lower().title()

def preparar(items):
    return [limpiar(item) for item in items]

limpios = preparar(nombres)
print(limpios)
print(", ".join(limpios))`,
  33: `texto = "Python, datos python código datos python"
palabras = texto.lower().replace(",", "").split()
conteo = {}
for palabra in palabras:
    conteo[palabra] = conteo.get(palabra, 0) + 1
print(f"Python: {conteo['python']}")
print(f"datos: {conteo['datos']}")
print(f"código: {conteo['código']}")`,
  34: `registros = [("Ana", "Datos"), ("Luis", "Datos"), ("Zoe", "Web"), ("Mara", "Web")]
grupos = {}
for nombre, area in registros:
    grupos.setdefault(area, []).append(nombre)
for area in sorted(grupos):
    print(f"{area}: {', '.join(grupos[area])}")`,
  35: `texto = "nombre,curso\\nAna,Python\\nLuis,SQL"
lineas = texto.split("\\n")
cabecera = lineas[0].split(",")
filas = [dict(zip(cabecera, linea.split(","))) for linea in lineas[1:]]
print(f"{filas[0]['nombre']} estudia {filas[0]['curso']}")
print(f"Registros: {len(filas)}")`,
  36: `ventas = [
    {"curso": "SQL", "total": 40},
    {"curso": "Python", "total": 120},
    {"curso": "Git", "total": 75}
]
ordenadas = sorted(ventas, key=lambda fila: fila["total"], reverse=True)
for posicion, fila in enumerate(ordenadas, 1):
    print(f"{posicion}. {fila['curso']}: {fila['total']}")`,
  37: `personas = [
    {"nombre": "Ana", "correo": "Ana@MAIL.cl"},
    {"nombre": "Luis", "correo": "luis@mail.cl"},
    {"nombre": "Ana repetida", "correo": "ana@mail.cl"},
    {"nombre": "Zoe", "correo": "zoe@mail.cl"}
]
vistos = set()
unicas = []
for persona in personas:
    correo = persona["correo"].lower()
    if correo not in vistos:
        vistos.add(correo)
        unicas.append(persona)
print(f"Únicos: {len(unicas)}")
for persona in unicas:
    print(persona["correo"].lower())`,
  38: `grupos = {"Python": [5, 6], "SQL": [6], "Diseño": []}

def promedio(valores):
    if len(valores) == 0:
        return 0
    return sum(valores) / len(valores)

for nombre, notas in grupos.items():
    print(f"{nombre}: {promedio(notas):.2f}")`,
  39: `registros = [
    {"nombre": "Python", "horas": 8},
    {"nombre": "", "horas": 4},
    {"nombre": "SQL", "horas": 0},
    {"nombre": "React", "horas": 6}
]

def es_valido(fila):
    return fila.get("nombre", "") != "" and fila.get("horas", 0) > 0

validos = [fila for fila in registros if es_valido(fila)]
nombres = [fila["nombre"] for fila in validos]
print(f"Válidos: {', '.join(nombres)}")
print(f"Rechazados: {len(registros) - len(validos)}")`,
  40: `actividades = [
    {"nombre": "Parque", "inscritos": 20, "cupo": 20},
    {"nombre": "Museo", "inscritos": 12, "cupo": 15},
    {"nombre": "Café", "inscritos": 8, "cupo": 10}
]

def ocupacion(item):
    return int(item["inscritos"] / item["cupo"] * 100)

def reporte(items):
    ordenadas = sorted(items, key=lambda item: ocupacion(item), reverse=True)
    libres = 0
    for item in ordenadas:
        disponibles = item["cupo"] - item["inscritos"]
        libres += disponibles
        print(f"{item['nombre']}: {ocupacion(item)}% · {disponibles} cupos")
    print(f"Cupos disponibles: {libres}")

reporte(actividades)`
};
