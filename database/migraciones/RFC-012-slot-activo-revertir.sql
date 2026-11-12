-- Back-out de RFC-012: quita la restricción y la columna generada. No modifica ninguna cita.
-- La FK de id_medico usa el índice UNIQUE (empieza por id_medico), así que antes de quitarlo
-- se recrea el índice propio de id_medico que tenía la tabla; si no, MySQL responde
-- "ERROR 1553: Cannot drop index 'uq_cita_medico_fecha_hora': needed in a foreign key constraint".
ALTER TABLE Cita
  ADD INDEX id_medico (id_medico),
  DROP INDEX uq_cita_medico_fecha_hora,
  DROP COLUMN slot_activo;
