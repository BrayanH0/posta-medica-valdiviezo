-- =======================================================
-- Migración RFC-012 (opción B): impedir la doble reserva en una BD ya cargada.
-- Para una BD nueva no hace falta: database/BDPostaMedica.sql ya crea la columna y la restricción.
-- Uso: mysql -uroot -p posta_medica_valdiviezo < database/migraciones/RFC-012-slot-activo.sql
-- Back-out: database/migraciones/RFC-012-slot-activo-revertir.sql
-- =======================================================
SET NAMES utf8mb4;

-- 1. Horarios con más de una cita no cancelada (estado 3 = Cancelada).
--    Si esta consulta devuelve filas, el ALTER del paso 2 falla con "Duplicate entry" y la tabla no cambia:
--    hay que decidir qué cita se conserva (o cancelarla) y volver a ejecutar el script.
SELECT id_medico, fecha_cita, hora_cita, COUNT(*) AS citas_activas,
       GROUP_CONCAT(idCita ORDER BY idCita) AS ids
FROM Cita
WHERE estado_cita IS NULL OR estado_cita <> 3
GROUP BY id_medico, fecha_cita, hora_cita
HAVING COUNT(*) > 1;

-- 2. Columna generada y restricción (las canceladas dan NULL y no ocupan el horario)
ALTER TABLE Cita
  ADD COLUMN slot_activo TINYINT GENERATED ALWAYS AS (IF(estado_cita = 3, NULL, 1)) STORED,
  ADD CONSTRAINT uq_cita_medico_fecha_hora UNIQUE (id_medico, fecha_cita, hora_cita, slot_activo);
