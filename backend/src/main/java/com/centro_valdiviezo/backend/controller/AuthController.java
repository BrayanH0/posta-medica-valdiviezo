package com.centro_valdiviezo.backend.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.centro_valdiviezo.backend.autenticacion.AutenticadorRol;

@RestController
public class AuthController {

    // Spring la entrega ordenada por @Order: paciente -> médico -> administrador
    private final List<AutenticadorRol> autenticadores;

    public AuthController(List<AutenticadorRol> autenticadores) {
        this.autenticadores = autenticadores;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        try {
            String dni = credentials.get("dni");
            String clave = credentials.get("clave");

            if (dni == null || clave == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "DNI y contraseña son requeridos"));
            }

            // El primer rol que reconoce el DNI y la clave da la respuesta
            for (AutenticadorRol autenticador : autenticadores) {
                Optional<Map<String, Object>> response = autenticador.autenticar(dni, clave);
                if (response.isPresent()) {
                    return ResponseEntity.ok(response.get());
                }
            }

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Credenciales inválidas"));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error interno: " + e.getMessage()));
        }
    }
}
