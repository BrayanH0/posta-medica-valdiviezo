package com.centro_valdiviezo.backend.exception;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.sql.SQLIntegrityConstraintViolationException;
import java.util.Map;

import org.hibernate.exception.ConstraintViolationException;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

// RFC-012: la violación de uq_cita_medico_fecha_hora se responde con 409 y un mensaje propio;
// las demás violaciones de integridad siguen con la respuesta 500 de RFC-014 (P1).
class GlobalExceptionHandlerDobleReservaTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    // Misma forma que la excepción que lanza Spring Data con MySQL 8 (mensaje real del driver)
    private static DataIntegrityViolationException violacion(String mensajeMysql, String restriccion) {
        SQLIntegrityConstraintViolationException sql = new SQLIntegrityConstraintViolationException(mensajeMysql, "23000", 1062);
        ConstraintViolationException hibernate = new ConstraintViolationException(
                "could not execute statement [" + mensajeMysql + "]", sql, "insert into Cita (...) values (...)", restriccion);
        return new DataIntegrityViolationException("could not execute statement; SQL [n/a]; constraint [" + restriccion + "]", hibernate);
    }

    @Test
    void dobleReservaResponde409ConMensajeSinTextoSql() {
        DataIntegrityViolationException ex = violacion(
                "Duplicate entry '1-2026-11-30-11:00:00-1' for key 'cita.uq_cita_medico_fecha_hora'",
                "cita.uq_cita_medico_fecha_hora");

        ResponseEntity<Map<String, String>> r = handler.handleDataIntegrityViolation(ex);

        assertEquals(HttpStatus.CONFLICT, r.getStatusCode());
        assertEquals(Map.of("message", "Ese horario ya fue reservado. Elija otra hora.", "status", "error"), r.getBody());
        String cuerpo = r.getBody().toString().toLowerCase();
        assertFalse(cuerpo.contains("duplicate") || cuerpo.contains("sql") || cuerpo.contains("insert"));
    }

    @Test
    void reconoceLaRestriccionAunqueHibernateNoDeElNombre() {
        DataIntegrityViolationException ex = violacion(
                "Duplicate entry '1-2026-11-30-11:00:00-1' for key 'cita.uq_cita_medico_fecha_hora'", null);

        assertEquals(HttpStatus.CONFLICT, handler.handleDataIntegrityViolation(ex).getStatusCode());
    }

    @Test
    void otraViolacionDeIntegridadSigueComoAntes() {
        DataIntegrityViolationException ex = violacion(
                "Cannot add or update a child row: a foreign key constraint fails (`cita_ibfk_3`)", "cita_ibfk_3");

        ResponseEntity<Map<String, String>> r = handler.handleDataIntegrityViolation(ex);

        // Igual que handleRuntimeException con la misma excepción (comportamiento de RFC-014)
        assertEquals(handler.handleRuntimeException(ex).getStatusCode(), r.getStatusCode());
        assertEquals(handler.handleRuntimeException(ex).getBody(), r.getBody());
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, r.getStatusCode());
    }

    @Test
    void esHorarioOcupadoSoloConLaRestriccionDelHorario() {
        assertTrue(GlobalExceptionHandler.esHorarioOcupado(new RuntimeException("x", new RuntimeException("for key 'cita.uq_cita_medico_fecha_hora'"))));
        assertFalse(GlobalExceptionHandler.esHorarioOcupado(new RuntimeException("Duplicate entry for key 'PRIMARY'")));
        assertFalse(GlobalExceptionHandler.esHorarioOcupado(new RuntimeException((String) null)));
    }
}
