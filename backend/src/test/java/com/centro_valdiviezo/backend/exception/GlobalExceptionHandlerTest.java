package com.centro_valdiviezo.backend.exception;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Map;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

// RFC-014 (P1): el error queda en el log del servidor y la respuesta al cliente no cambia
@ExtendWith(OutputCaptureExtension.class)
class GlobalExceptionHandlerTest {

    @Test
    void respondeIgualQueAntesYDejaElErrorEnElLog(CapturedOutput salida) {
        GlobalExceptionHandler handler = new GlobalExceptionHandler();

        ResponseEntity<Map<String, String>> respuesta =
                handler.handleRuntimeException(new RuntimeException("falla de prueba"));

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, respuesta.getStatusCode());
        assertEquals(Map.of("message", "falla de prueba", "status", "error"), respuesta.getBody());
        assertTrue(salida.getAll().contains("Error no controlado en la API"));
        assertTrue(salida.getAll().contains("falla de prueba"));
    }
}
