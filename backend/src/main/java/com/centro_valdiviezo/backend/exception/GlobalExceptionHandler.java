package com.centro_valdiviezo.backend.exception;

import org.hibernate.exception.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // RFC-012: restricción de database/BDPostaMedica.sql (y de database/migraciones/RFC-012-slot-activo.sql)
    static final String RESTRICCION_HORARIO_CITA = "uq_cita_medico_fecha_hora";
    static final String MENSAJE_HORARIO_OCUPADO = "Ese horario ya fue reservado. Elija otra hora.";

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        // Deja rastro en el log del servidor; la respuesta al cliente no cambia
        log.error("Error no controlado en la API", ex);
        Map<String, String> error = new HashMap<>();
        error.put("message", ex.getMessage());
        error.put("status", "error");
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // RFC-012: la BD rechazó una segunda cita activa en el mismo horario -> 409 con un mensaje propio, sin texto SQL.
    // Cualquier otra violación de integridad sigue igual que antes (500, por handleRuntimeException).
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        if (!esHorarioOcupado(ex)) {
            return handleRuntimeException(ex);
        }
        log.warn("Reserva rechazada: el horario ya tiene una cita activa ({})", RESTRICCION_HORARIO_CITA);
        Map<String, String> error = new HashMap<>();
        error.put("message", MENSAJE_HORARIO_OCUPADO);
        error.put("status", "error");
        return new ResponseEntity<>(error, HttpStatus.CONFLICT);
    }

    // Busca el nombre de la restricción en la cadena de causas (Hibernate lo expone como constraintName;
    // MySQL lo escribe en el mensaje: "Duplicate entry '…' for key 'cita.uq_cita_medico_fecha_hora'")
    static boolean esHorarioOcupado(Throwable ex) {
        for (Throwable t = ex; t != null; t = (t.getCause() == t ? null : t.getCause())) {
            if (t instanceof ConstraintViolationException cve && contieneRestriccion(cve.getConstraintName())) {
                return true;
            }
            if (contieneRestriccion(t.getMessage())) {
                return true;
            }
        }
        return false;
    }

    private static boolean contieneRestriccion(String texto) {
        return texto != null && texto.contains(RESTRICCION_HORARIO_CITA);
    }
}
