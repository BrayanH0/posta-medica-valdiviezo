# Pantallas del sistema en LB-8 (punto 12)

Capturas tomadas el 2026-10-21 entre 16:37 y 16:41 con Playwright (ventana 1280×800, página completa), sobre el código de LB-8 (commit `5033c1b`). Antes se recargó la base de datos (`DROP DATABASE` + `database/BDPostaMedica.sql`, 16:37:02: 12 tablas, 21 citas), así que todos los datos que se ven son los del script, sin datos de pruebas anteriores. No se registró ninguna cita nueva.

Usuarios usados: paciente 1 (Juan Perez Gomez), médico 1 (Jorge Santos Ruiz) y el administrador. Para las 3 listas de citas del médico se entró con otros médicos de la base, porque en el script el médico 1 solo tiene citas **atendidas** y sus listas salían vacías: pendientes → médico 6 (Roberto Gomez Bolaños), confirmadas → médico 2 (Carla Paredes Luna), canceladas → médico 4 (Lucia Flores Huaman). Son los únicos médicos con citas en esos estados (`SELECT ... FROM Cita WHERE estado_cita IN (1,2,3)`).

## Acceso

![Selección de rol](pantallas/01-seleccion-rol.png)
**01 – Selección de rol** (`/login-selection`): primera pantalla; el usuario elige si es paciente, médico o administrador.

![Login paciente](pantallas/02-login-paciente.png)
**02 – Login de paciente** (`/login-paciente`): DNI y contraseña; desde aquí se puede ir al registro.

![Login médico](pantallas/03-login-medico.png)
**03 – Login de médico** (`/login-medico`): mismo formulario; desde RFC-005 los 3 logins comparten la misma lógica.

![Login administrador](pantallas/04-login-admin.png)
**04 – Login de administrador** (`/login-admin`).

![Registro](pantallas/05-registro.png)
**05 – Registro de paciente** (`/registro`): formulario para que un paciente nuevo cree su cuenta (`POST /api/paciente/crear`).

## Paciente

![Bienvenida](pantallas/06-paciente-bienvenida.png)
**06 – Bienvenida del paciente** (`/welcome`): menú con Registrar Cita, Mis Citas, Historial Médico y Cerrar Sesión.

![Registrar cita](pantallas/07-paciente-registrar-cita.png)
**07 – Registrar cita** (`/paciente/registrar-cita`): Pediatría, Dr(a). Sofia Vergara, lunes 26/10/2026; muestra los bloques de 20 minutos de 08:00 a 19:40 según su horario (lunes 08:00–20:00). La cita no se confirmó.

![Mis citas](pantallas/08-paciente-mis-citas.png)
**08 – Mis citas** (`/paciente/mis-citas`): las 2 citas del paciente 1 en el script (2023-07-01 Atendida con Jorge Santos Ruiz; 2023-07-06 Pendiente con Roberto Gomez Bolaños).

![Historial médico](pantallas/09-paciente-historial-medico.png)
**09 – Historial médico** (`/paciente/historial-medico`): tipo de sangre O+, alergias, y 3 evoluciones con diagnóstico CIE (Hipertensión esencial).

## Médico

![Inicio médico](pantallas/10-medico-inicio.png)
**10 – Panel médico, inicio** (`/medico-dashboard`), con el médico 1: menú lateral con Pacientes, Citas Pendientes, Confirmadas y Canceladas.

![Citas pendientes](pantallas/11-medico-citas-pendientes.png)
**11 – Citas pendientes** (médico 6): cita 6 de Juan Perez Gomez, 2023-07-06 09:00, "Dolor cabeza", con botones Aceptar y Cancelar.

![Citas confirmadas](pantallas/12-medico-citas-confirmadas.png)
**12 – Citas confirmadas** (médico 2, ruta `/medico-dashboard/citas-aprobadas`): cita 2 de Maria Lopez Quispe, 2023-07-02 10:00, "Consulta pediátrica".

![Citas canceladas](pantallas/13-medico-citas-canceladas.png)
**13 – Citas canceladas** (médico 4): cita 4 de Ana Torres Paz, 2023-07-04 12:00, "Problemas de piel".

![Pacientes del médico](pantallas/14-medico-pacientes.png)
**14 – Pacientes del médico** (médico 1, `/medico-dashboard/pacientes`): los 4 pacientes que tienen citas con él (Dina Boluarte, Pedro Castillo, Juan Perez Gomez, Alejandro Toledo).

## Administrador

![Inicio admin](pantallas/15-admin-inicio.png)
**15 – Panel admin, inicio** (`/admin/inicio`): bienvenida con accesos a Gestión y Reportes (texto fijo, no consulta el backend).

![Pacientes admin](pantallas/16-admin-pacientes.png)
**16 – Gestión de pacientes** (`/admin/pacientes`): los 15 pacientes con botones Editar y Eliminar. Las columnas Estado y Ubigeo muestran el número de ID, no el nombre.

![Médicos admin](pantallas/17-admin-medicos.png)
**17 – Gestión de médicos** (`/admin/medicos`): los 15 médicos con su CMP y especialidad.

![Reportes admin](pantallas/18-admin-reportes.png)
**18 – Reportes** (`/admin/reportes`, menú "Informes"): 21 citas, 17 atendidas, 1 cancelada, ingreso total S/ 1,135.00 (calculado con el precio actual de la especialidad, H-024) y el resumen por especialidad.

## Notas del procedimiento

- En el primer intento, los logins de médico y administrador no llegaron a enviarse porque se reutilizó la misma pestaña (el mismo problema que registra la bitácora el 2026-10-20 a las 19:26 y 20:07). Se repitieron en una pestaña nueva al frente, escribiendo tecla por tecla; las capturas 10 a 18 son de ese segundo intento.
- Las capturas 11 a 13 se tomaron primero con el médico 1 (listas vacías) y se reemplazaron por las de los médicos 6, 2 y 4.
