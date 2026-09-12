# Cuentas y dominio de CápsulasDev

Implementación del 7 de septiembre de 2026. Destino: capsulasdev.com, GitHub Pages
sobre el repositorio PabSepul/capdev. Público inicial: mayores de 18 años.
La pantalla de mantenimiento se conserva hasta la apertura expresa del sitio.

Actualización posterior del 9 de septiembre, confirmada por el usuario: despliegue
`d39b981` funcionando, eliminación y cero filas restantes en las cinco tablas,
reenvío de privacidad recibido, registro OTP correcto, progreso recuperado en otro
navegador y segunda cuenta sin progreso ajeno. El usuario volvió a desactivar
las altas en Auth tras probarlas. Estas confirmaciones sustituyen los pendientes
equivalentes de las notas históricas de este documento.

## Respaldos y retención acordados

El usuario aprobó esta política el 9 de septiembre de 2026:

- Durante las pruebas: un respaldo semanal y otro antes de cambios importantes.
- Al abrir el registro: un respaldo diario.
- Conservar los respaldos durante 30 días y retirar los que superen ese plazo,
  incluyendo copias locales, archivos de restauración y copias en OneDrive.
  Contar desde la creación del respaldo, no desde su descarga o restauración.
  Revisar también las copias de prueba y las papeleras al retirar archivos: mover
  un archivo a la papelera no completa su eliminación. No se ha ejecutado limpieza.
- El responsable del sitio realiza el proceso manualmente. No hay tareas
  automáticas de respaldo ni de eliminación configuradas.
- Subir únicamente el archivo `.7z` cifrado a OneDrive personal, carpeta
  `CapsulasDev-Respaldos`. Guardar la contraseña por separado en el gestor de
  contraseñas. No subir el `.dump` ni el SQL de restauración sin cifrar.

Primer respaldo: `capsulasdev-20260909-171944.dump`, 124800 bytes, generado con
PostgreSQL 18.6 mediante pg_dump en formato custom, esquemas public y auth.
Carpeta local: `CapsulasDev-Respaldos` dentro del perfil de Windows, fuera del
repositorio y de la carpeta sincronizada. El archivo cifrado del mismo nombre
con extensión `.7z` ocupa 19298 bytes y usa 7zAES con cabeceras cifradas.
El usuario confirmó `Everything is Ok` y código 0 al comprobar el archivo local
y posteriormente la copia descargada de OneDrive. Para probarlo se utiliza
`7z t ruta-del-archivo.7z`, dejando que solicite la contraseña; no pasarla como
argumento ni usar `-p` vacío en esa comprobación.

Restauración de ensayo confirmada por el usuario en el proyecto separado
`capsulasdev-prueba-restauracion`: migración del repositorio aplicada primero;
datos de auth.users, auth.identities y las cinco tablas learning_* extraídos con
pg_restore, sin propietarios ni privilegios. Carga con psql, transacción única,
ON_ERROR_STOP y session_replication_role=replica limitado a la transacción.
Resultado: 2 usuarios, 2 identidades, 2 perfiles, 1 ruta, 8 operaciones,
3 borradores, 0 conflictos y 0 referencias huérfanas. La carga terminó con
código 0. No se ha probado iniciar sesión en la aplicación contra este proyecto
restaurado; el proyecto de ensayo y los archivos locales aún existen.

Este respaldo cubre los esquemas public y auth; no es una copia completa de la
configuración del proyecto Supabase, funciones Edge, secretos, roles globales ni
objetos de Storage. Conservar por separado el código y la migración del
repositorio y la configuración privada necesaria para reconstruir el servicio.

La eliminación de una cuenta activa no reescribe respaldos ya creados. Antes de
restaurar hacia producción, reconciliar las bajas posteriores a la fecha de la
copia para evitar reactivar cuentas eliminadas. El aviso de privacidad incorpora
la retención acordada, el proceso manual, OneDrive cifrado y la diferencia entre
borrado activo y caducidad de respaldos. Falta concretar el registro operativo de
bajas antes de una restauración en producción; no hay reconciliación automática.
El usuario autorizó publicar esta actualización del aviso el 9 de septiembre.

La documentación de Resend consultada el 9 de septiembre aclara que São Paulo es
la región de envío: mensajes y registros se almacenan en Estados Unidos. Declara
30 días para mensajes/registros del plan Free y 7 días para sus respaldos. El
aviso distingue estos plazos de los respaldos propios del responsable.

## Notas históricas de configuración

Estado externo al 9 de septiembre: proyecto Supabase `neofezxmcrmrijzxuqjo`
creado en São Paulo, migración SQL instalada, URL principal y retornos guardados.
Registro público todavía desactivado en Auth; la API de perfiles rechaza acceso
anónimo. El código queda preparado para altas, pero Auth debe habilitar el
registro por correo antes de quitar mantenimiento.
DNS raíz y www guardados y propagados; capsulasdev.com verificado en GitHub.
SMTP y ambas plantillas OTP guardados. Invitación y códigos entregados; acceso,
perfil y recuperación de progreso probados en el dominio real. El usuario confirmó
la eliminación desde Mi cuenta; quedan la verificación posterior de la cascada
y las pruebas entre navegadores independientes.
La clave de `account-config.js` es publicable, no permite saltarse los permisos.
Publicación `a690dad` completada. HTTPS obligatorio activado: raíz 200, HTTP y
www 301 a https://capsulasdev.com/. Navegador público muestra mantenimiento.
Función delete-account desplegada; peticiones sin sesión o con token inválido
devuelven 401. El usuario completó y confirmó el borrado de la cuenta de prueba.

## Qué hay en el código

- `cuenta.html`: acceso con código por correo, perfil, progreso, importación del
  invitado, conflictos de borrador, exportación y eliminación de cuenta.
- `account-config.js`: URL del proyecto y clave **publicable**, nunca una clave
  secret/service_role. La interfaz está preparada para crear perfiles al abrir
  el registro por correo en Auth.
- `account.js`: SDK oficial de Supabase, sesión y sincronización en las 20 páginas.
- `learning-sync.js`: cola por cuenta y por operación; los borradores se agrupan
  por pestaña y ejercicio. Solo se retira un cambio cuando el servidor confirma
  exactamente su identificador. No aplica el límite de 400 eventos de la bitácora.
- `learning-state.js`: invitado y cuentas usan espacios de almacenamiento distintos.
  El motor conserva compatibilidad con respaldos antiguos, pero la interfaz actual
  exige perfil y no ofrece importación ni guardado de nuevos avances de invitado.
- `supabase/migrations/202609070001_accounts.sql`: tablas, RLS y funciones de base
  de datos; escrituras autenticadas, idempotencia y versiones de borradores.
- `supabase/functions/delete-account/index.ts`: verifica el token con Auth y elimina
  exclusivamente al usuario verificado. Las relaciones borran sus datos en cascada.

El modelo de progreso sigue siendo de aprendizaje personal: los resultados vienen
del navegador y no acreditan identidad en un examen ni justifican certificados.
Los intentos históricos importados conservan contadores; no se inventan eventos
que la bitácora local ya no contiene. Los contadores importados usan el mayor
valor conocido, no una suma que duplicaría respaldos del mismo aprendizaje.

## Configuración de Supabase

1. Crear el proyecto `capsulasdev` en la organización `CapsulasDev`, región São
   Paulo (`sa-east-1`). Guardar la contraseña en un gestor de contraseñas.
   Mantener Data API habilitada, desactivar la exposición automática de tablas y
   activar RLS automático. No conectar el repositorio público como base de datos
   de usuarios ni guardar credenciales privadas en sus archivos.
2. Ejecutar la migración completa en SQL Editor. Está probada contra PostgreSQL
   embebido con usuarios y roles separados; todavía hay que verificarla en el
   proyecto real y confirmar que no quedan avisos de seguridad sobre estas tablas.
3. En Authentication → URL Configuration: Site URL `https://capsulasdev.com`.
   Admitir únicamente las URL exactas de retorno necesarias:
   `https://capsulasdev.com/cuenta.html` y
   `https://www.capsulasdev.com/cuenta.html`. Usar un proyecto de pruebas para localhost.
4. Authentication → Email: habilitar correo verificado. Personalizar las plantillas
   de confirmación y Magic Link para mostrar `{{ .Token }}`: la interfaz utiliza
   un código, no un enlace. No eliminar confirmación de correo para sortear un fallo.
   Usar `supabase/templates/access-code.html` para ambas y el asunto
   «Tu código de acceso a CápsulasDev». Ambas plantillas ya están aplicadas y
   el código de acceso entregado se utilizó correctamente en la plataforma.
5. Configurar SMTP con un proveedor de correo transaccional y verificar su dominio
   de envío, SPF y DKIM. Mantener los registros de recepción de correo existentes.
   El SMTP predeterminado de Supabase no sirve para el lanzamiento a destinatarios
   externos. Probar el envío con el correo que el usuario autorice.
6. Antes de abrir el registro, completar contacto de privacidad, región, proveedor
   de correo y retención de respaldos; después habilitar los registros por correo
   en el proveedor.
7. Copiar la URL pública del proyecto y la clave `sb_publishable_...` en
   `account-config.js`. `registrationEnabled: true` habilita la creación desde la
   interfaz; Supabase Auth también debe permitir registros por correo para que el
   alta funcione.
8. Desplegar `delete-account`. El entorno de Supabase proporciona sus secretos de
   servidor. `verify_jwt = false` evita la validación heredada de la pasarela:
   **la función exige y verifica el token con `auth.getUser` antes de borrar**.
   No quitar esa comprobación. La función acepta solo los orígenes HTTPS del sitio.
9. Verificar con dos cuentas de prueba: acceso propio, rechazo del ajeno, sincronía
   en dos navegadores, desconexión y reintento, conflictos, exportación y borrado.

## Namecheap y GitHub Pages

El DNS observado inicialmente usa Namecheap BasicDNS y una redirección de la raíz
a `http://www.capsulasdev.com/`, con www apuntando al estacionamiento de Namecheap.
Los cambios se hacen en Domain List → Manage → Advanced DNS, sin cambiar nameservers.

Registros de destino (confirmados contra la documentación de GitHub):

| Tipo | Host | Valor |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | PabSepul.github.io |

Sustituir el estacionamiento y la redirección anteriores; preservar los registros
MX, SPF, DKIM y otros TXT. No usar un CNAME en la raíz ni un registro comodín.
Verificar propiedad en GitHub → Settings → Pages, mediante el TXT que GitHub
genere; no se puede inventar su valor. Después configurar el repositorio con
`capsulasdev.com`, esperar la emisión del certificado y activar Enforce HTTPS.

`CNAME` y los metadatos del código ya están preparados para capsulasdev.com.
Las pruebas de mantenimiento cubren el dominio nuevo y el antiguo, con y sin JS.

El usuario confirmó que no tiene progreso de intenta.cl que conservar. No se
requiere migración de su navegador. Para otros usuarios con avance anterior,
exportar desde el dominio antiguo y restaurar el JSON en el nuevo: una
redirección no traslada el almacenamiento local.

## Verificación local

Las 19 suites anteriores se conservan y se agregan dos: `accounts.test.mjs` y
`accounts-ui.test.mjs`. Son 21 en total. Las herramientas de prueba se instalan
en carpetas temporales, sin dependencias npm para servir las páginas:

```powershell
$accountQaDir = Join-Path ([IO.Path]::GetTempPath()) 'capsulasdev-account-qa'
npm install --prefix $accountQaDir --ignore-scripts --no-audit --no-fund @electric-sql/pglite@0.3.14
node accounts.test.mjs
node accounts-ui.test.mjs
```

`accounts-ui.test.mjs` usa el jsdom de `capsulasdev-content-qa` descrito en README.
`ACCOUNT_QA_MODULES` y `CONTENT_QA_MODULES` permiten indicar otras ubicaciones.
PGlite ejecuta PostgreSQL real dentro de WebAssembly; verifica RLS, permisos,
transacciones, repetición de eventos, conflictos, exportación y cascadas. La
prueba de interfaz usa el HTML real y dobles del proveedor para reproducir fallos
de conexión y respuestas tardías al cambiar de cuenta. Eso no reemplaza una
prueba de correo y autenticación contra Supabase desplegado.

## Límites de esta primera integración

- Se combina el progreso automáticamente. Para cargar borradores de otro equipo,
  entrar en Mi cuenta antes de continuar: no se reemplaza un editor mientras se usa.
- Corrección local del 9 de septiembre: tras verificar un perfil en este navegador,
  una marca por cuenta permite conservar cambios locales durante fallos de conexión
  y recargas. Al reconectar, se verifican de nuevo Auth y el perfil antes de enviar.
  La marca no concede permisos en Supabase. Al actualizar desde la versión anterior
  hay que verificar el perfil una vez con red; no hay caché offline de páginas.
- El navegador necesita almacenamiento para conservar una cola entre recargas.
  Si la cuota se agota, se mantiene una copia en memoria y se avisa para exportar.
- El historial completo queda en la plataforma; la bitácora local sigue mostrando
  hasta 400 intentos. El tiempo registrado incluye pausas.
- El exportador completo de cuenta entrega los datos del servidor y los cambios
  pendientes; el panel de respaldo anterior ya no aparece en la portada.
- No hay roles de docentes, grupos, analítica de terceros ni perfiles públicos.
- El registro por correo requiere que Supabase Auth permanezca habilitado; una
  prueba real de alta y sincronización sigue siendo obligatoria antes de abrir el sitio.

## Próximo paso de correo

El usuario creó su cuenta de Resend. El plan gratuito consultado admite 3.000
mensajes por mes y 100 por día; no se contrató un plan de pago. El dominio está
verificado y SMTP conectado. Las dos plantillas están aplicadas; acceso OTP,
perfil, intento Python, borrador y recuperación de progreso comprobados.

El usuario confirmó privacidad@capsulasdev.com como contacto público y su destino
privado. El reenvío está guardado en Namecheap; su entrega aún no se ha probado.
El usuario autorizó códigos de prueba al mismo destino. El reenvío recibe mensajes; no sustituye
al proveedor SMTP para enviar códigos. No publicar la dirección privada de
destino en HTML, configuración pública, documentación ni commits.

### Resend verificado y SMTP conectado

Dominio `capsulasdev.com`, región São Paulo, ID
`02251202-8e9b-4615-8a08-87e7aad89615`. Los cuatro registros están guardados y
comprobados mediante DNS público. Dominio y registros con estado Verified.
Valores copiados del panel de Resend (no sustituir por ejemplos de tutoriales):

| Tipo | Host | Valor |
| --- | --- | --- |
| TXT | resend._domainkey | p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC5e/jOCnaXZT8+RVwfwui0T+Soc7hINYKookbBUgxQXHFW+vhr6PUFLZpfbgDl+7lZK6wkI240zAn8vgbmxMYI7pOAebXSlcc8Ps1ckdv1HS8/VOdx8/aFMoqC8tOLY4Q8E0gkUCNvsJR/LoEHEZVgwsVIGhQ8kzqEoGyxfqD2yQIDAQAB |
| CNAME | rsend | rsend-sae1.forge.rmta.net |
| CNAME | send | send.forge.rmta.net |
| TXT | _dmarc | v=DMARC1; p=none; |

TTL automático. Conservar recepción de Namecheap, SPF raíz y DNS del sitio.
Receiving de Resend permanece apagado. Clave creada con Sending access restringido
a capsulasdev.com, guardada únicamente como contraseña SMTP en Supabase.
Remitente: acceso@capsulasdev.com, nombre CápsulasDev. Servidor smtp.resend.com,
puerto 465, usuario resend, intervalo 60 segundos. SMTP y plantillas guardados.
TLS Enforced guardado en Resend: un destinatario sin TLS no recibirá códigos.
No se configuró seguimiento de aperturas ni enlaces.

Prueba del 8 de septiembre: una invitación y dos códigos figuran Delivered en
Resend. Se activó el perfil «Prueba de integración», se completó el primer proyecto
Python y se comprobó en PostgreSQL un intento, la aprobación y el código del
borrador. Tras cerrar sesión, otro código recuperó el perfil y el proyecto.
Una transacción revertida comprobó RLS con dos identidades y rol authenticated:
datos propios visibles, cero filas ajenas en las cinco tablas y sin escritura
directa de perfiles/rutas. No equivale a dos sesiones reales independientes.
La exportación se pulsó sin error visible; falta inspeccionar el archivo.
La eliminación quedó inicialmente sin confirmar. El 9 de septiembre una consulta
de solo lectura confirmó entonces que seguían existiendo la cuenta, perfil y ruta.
Después el usuario completó la eliminación desde Mi cuenta y confirmó el resultado.
Falta una consulta posterior para comprobar la cascada de datos en el servidor.
Antes de abrir el sitio, habilitar el registro por correo en Auth y repetir la
prueba con una cuenta nueva y dos navegadores independientes.

Antes de abrir registros: definir respaldos y retención operativa. El plan Free
de Supabase no ofrece las mismas garantías de respaldos diarios accesibles que
Pro; su documentación recomienda exportaciones externas. No prometer recuperación
automática aún. Resend declara 30 días de retención de mensajes y registros en
Free, Pro y Scale. Estos datos no se eliminan mediante la función delete-account.

La integración OAuth automática fue cancelada después de que revisión automática
rechazara permisos Auth y Projects READ+WRITE de toda la organización. SMTP
manual evita conceder esos permisos; no reintentar OAuth sin autorización
específica para ese alcance.

## Fuentes de configuración

- [Dominio personalizado de GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
- [Namecheap: GitHub Pages](https://www.namecheap.com/support/knowledgebase/article.aspx/9645/2208/how-do-i-link-my-domain-to-github-pages/)
- [Supabase: códigos por correo](https://supabase.com/docs/guides/auth/auth-email-passwordless)
- [Supabase: SMTP](https://supabase.com/docs/guides/auth/auth-smtp)
- [Supabase: RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase: respaldos](https://supabase.com/docs/guides/platform/backups)
- [Resend: retención](https://resend.com/security/gdpr)
- [Resend: verificación DNS](https://resend.com/docs/knowledge-base/what-if-my-domain-is-not-verifying)
- [Ley 21.719, entrada en vigor el 1 de diciembre de 2026](https://www.bcn.cl/leychile/Navegar?idNorma=1209272&idParte=10527471&idVersion=2026-12-01)
