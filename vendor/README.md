# CommonMark local

## Autenticación

`supabase-2.116.0.js` es la distribución UMD sin modificaciones del paquete oficial
`@supabase/supabase-js@2.116.0`, obtenida de npm. Se conserva localmente con
`supabase-LICENSE.txt`. La autenticación, verificación de códigos y renovación
de sesión quedan a cargo de este SDK. No se usa un mecanismo de acceso propio.
La URL del proyecto y la clave publicable se configuran en `account-config.js`;
las claves de servicio nunca se incluyen en el sitio.

## Markdown

`commonmark-0.31.2.min.js` es una copia sin modificaciones de `dist/commonmark.min.js` del paquete
`commonmark@0.31.2` obtenido del registro npm. Se sirve desde este repositorio para no depender de un CDN.
La licencia original y sus avisos están en `commonmark-LICENSE.txt`.

Proyecto: https://github.com/commonmark/commonmark.js

Para actualizarlo, elige una versión concreta, conserva su licencia y ejecuta `route-markdown.test.mjs`.
El laboratorio activa `safe: true` y la vista previa aplica una política restrictiva dentro de un iframe
con `sandbox=""`. No habilites HTML crudo ni scripts al actualizar la biblioteca.
