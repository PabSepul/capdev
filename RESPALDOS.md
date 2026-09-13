# Respaldos operativos de CápsulasDev

El respaldo externo incluye los esquemas `public` y `auth` de Supabase, se verifica con
`pg_restore`, se cifra como 7z con encabezados ocultos y se guarda en una carpeta de
OneDrive. Los archivos con más de 30 días se retiran al finalizar una ejecución correcta.
El dump sin cifrar se crea en `%LOCALAPPDATA%\CapsulasDev\backup-work`, fuera de
OneDrive, y se elimina después de verificar el archivo cifrado.

Las contraseñas no se guardan en este repositorio. La configuración usa DPAPI de Windows y
queda en `%LOCALAPPDATA%\CapsulasDev\backup-secrets.json`; solo el mismo usuario de Windows
en el mismo equipo puede descifrarla.

## Configuración inicial

Desde PowerShell, en la raíz del repositorio:

```powershell
.\scripts\Configurar-Respaldo.ps1
.\scripts\Respaldar-Supabase.ps1
.\scripts\Programar-Respaldo.ps1 -At "03:00"
```

El primer comando solicita la contraseña actual de PostgreSQL y una contraseña de cifrado
de al menos 14 caracteres. El segundo crea y verifica un respaldo inmediatamente. Solo se
debe programar la tarea después de comprobar que el archivo `.7z` apareció en OneDrive.

La tarea se llama `CapsulasDev - Respaldo diario`, se ejecuta una vez al día y usa
`StartWhenAvailable`: si el equipo estaba apagado, Windows intenta ejecutarla cuando vuelva
a estar disponible. El archivo `backup-history.log` registra fecha, ruta y tamaño de cada
resultado correcto.

Estado comprobado el 13 de septiembre de 2026: tarea activa a las 03:00, ejecución
manual desde el Programador terminada con código `0` y archivo cifrado nuevo en OneDrive.

## Panel privado de feedback

Para actualizar el informe de calidad desde producción:

```powershell
.\scripts\Generar-Panel-Feedback.ps1
```

El comando reutiliza la conexión protegida con DPAPI y crea un HTML autocontenido
en `%LOCALAPPDATA%\CapsulasDev\reports`. La consulta agrupa por ruta, cápsula,
respuesta y área; el informe no contiene correos, identificadores, borradores ni
código. Muestra claridad general, área más señalada, filtros por ruta y una tabla
ordenada por porcentaje de solicitudes de mejora. Cada ejecución crea una copia
con fecha para que un informe anterior no se sobrescriba.

## Comprobación periódica

Descarga un archivo desde OneDrive y comprueba su cifrado:

```powershell
.\scripts\Verificar-Respaldo.ps1 -ArchivePath "C:\ruta\capsulasdev-fecha.7z"
```

Cada mes conviene repetir una restauración en un proyecto Supabase separado, comprobar los
recuentos y verificar que no existan referencias huérfanas. No se restaura sobre producción
para hacer esta prueba.

## Alcance y limitación

El respaldo cubre PostgreSQL en `public` y `auth`. La configuración de Auth, las Edge
Functions, las plantillas de correo, las claves y los ajustes de Resend se conservan en sus
respectivos servicios y en la documentación operativa; no viajan dentro del dump.

Eliminar una cuenta del servicio activo no modifica respaldos anteriores. Antes de poner en
servicio una restauración hay que aplicar las eliminaciones posteriores a la fecha de esa
copia. La automatización cifra, comprueba y aplica la retención, pero no sustituye ese
registro operativo.
