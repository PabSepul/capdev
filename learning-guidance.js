/* Objetivos observables: diferencia la salida esperada de una receta para copiar. */
(() => {
  "use strict";
  const guides = {
    javascript: [
      ["JavaScript", "Si escribes console.log('lenguaje'), se muestra el nombre literal, no el valor guardado."],
      ["13500", "Conserva precio = 4500: cambia cantidad a 3. Multiplicar calcula el total, sumar no."],
      ["Hola, ADA: llevas 3 módulos", "Los acentos graves permiten interpolar. Comillas simples o dobles no sustituyen las expresiones."],
      ["true", "true no lleva comillas: es un booleano, no el texto 'true'."],
      ["Puede entrar", "El valor 18 debe entrar en el primer caso: >= incluye la igualdad. Prueba también 17 y vuelve a 18 para la misión."],
      ["Aprobado", "Evalúa primero >= 6 y después >= 4; al invertirlos, una nota 7 quedaría clasificada antes de llegar a Excelente."],
      ["4\nPython", "length cuenta elementos; [0] lee el primero. No uses [1] para buscar la primera posición."],
      ["45", "Inicializa total una sola vez, antes del ciclo. Si lo reinicias dentro, pierdes lo acumulado."],
      ["12", "return entrega el valor a quien llamó; console.log solamente lo muestra."],
      ["900\n500", "El 10 por defecto se usa al omitir el segundo argumento. No conviertas el porcentaje en un descuento fijo."],
      ["Python, APIs\n26", "El total corresponde a todos los cursos, no solo a los filtrados. Guarda la selección sin reemplazar el arreglo original."],
      ["Carrito: 3 productos · Total: $51970", "Hay dos filas, pero tres unidades. Suma cantidad y, por separado, precio × cantidad."]
    ],
    "html-css": [
      ["Un título «Mi primera página» y un párrafo que incluya «aprender».", "Cierra cada etiqueta. El navegador puede reparar HTML incorrecto, pero eso no significa que esté bien estructurado."],
      ["Una lista de al menos tres pasos y un enlace con texto comprensible.", "Los li pertenecen al ul. En esta vista aislada, los enlaces no sirven para navegar fuera del ejercicio."],
      ["La imagen azul de práctica dentro de figure, un alt descriptivo y una leyenda visible.", "No reemplaces el recurso incluido por foto.png si no tienes ese archivo. Una imagen decorativa puede llevar alt vacío; esta misión practica una imagen informativa."],
      ["Un encabezado, un único contenido principal con h2 y p, y un pie de página.", "main identifica el contenido principal; no lo uses como envoltorio de cada bloque pequeño."],
      ["Un párrafo con color y espacio entre su contenido y sus bordes.", "El punto aparece en el selector .mensaje, no en class='mensaje'."],
      ["Texto de al menos 18px en body, fuente del sistema y párrafos con interlineado amplio.", "Define propiedades dentro del selector correcto. Una regla para otro elemento no modifica automáticamente body."],
      ["Una caja con espacio interior, separación exterior, borde y esquinas redondeadas.", "padding y margin resuelven espacios distintos. Mira ambos antes de dar por terminada la misión."],
      ["Un botón cuyo fondo cambia al pasar el cursor y hace una transición suave.", "En un teléfono no hay un cursor permanente. Añade también .accion:focus-visible para quienes navegan con teclado."],
      ["Tres bloques en fila, separados al menos 16px y distribuidos con justify-content.", "display: flex va en el contenedor .fila, no en cada hijo."],
      ["Tres columnas iguales separadas al menos 16px.", "grid-template-columns necesita display: grid para producir esa distribución."],
      ["Tres columnas en ancho grande y una sola hasta 600px de ancho de la vista previa.", "La media query se aplica al ancho del iframe, no necesariamente al de toda la ventana."],
      ["Una tarjeta de curso con título, descripción, botón, estilo hover y adaptación al ancho.", "Que una comprobación de código pase no garantiza buena lectura: revisa contraste, foco y espacios en la vista."]
    ]
  };
  function render(id, index) {
    const host = document.querySelector("#learning-guidance");
    const guide = guides[id]?.[index];
    if (!host) return;
    if (!guide) { host.replaceChildren(); return; }
    const title = document.createElement("h3");
    title.textContent = "Qué deberías obtener";
    const output = document.createElement("pre");
    output.textContent = guide[0];
    output.className = "guidance-output";
    const question = document.createElement("p");
    question.textContent = "Antes de ejecutar: ¿qué línea debes cambiar y por qué?";
    const mistake = document.createElement("p");
    mistake.textContent = guide[1];
    host.replaceChildren(title, output, question, mistake);
  }
  globalThis.LearningGuidance = { guides, render };
})();
