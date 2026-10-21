package com.centro_valdiviezo.backend.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import com.centro_valdiviezo.backend.autenticacion.AutenticadorAdministrador;
import com.centro_valdiviezo.backend.autenticacion.AutenticadorMedico;
import com.centro_valdiviezo.backend.autenticacion.AutenticadorPaciente;
import com.centro_valdiviezo.backend.autenticacion.AutenticadorRol;
import com.centro_valdiviezo.backend.repository.MedicoRepository;
import com.centro_valdiviezo.backend.repository.PacienteRepository;
import com.centro_valdiviezo.backend.repository.UsuarioRepository;

// RFC-007 (LB-7). Abierto/Cerrado: un rol nuevo se agrega con una clase nueva y AuthController
// no se modifica. El cuarto rol es inventado aquí; no existe en la aplicación.
@ExtendWith(MockitoExtension.class)
class AuthControllerExtensionTest {

    @Mock
    private PacienteRepository pacienteRepository;

    @Mock
    private MedicoRepository medicoRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    // Rol de ejemplo: reconoce un único DNI y clave
    static class AutenticadorRolDeEjemplo implements AutenticadorRol {
        @Override
        public Optional<Map<String, Object>> autenticar(String dni, String clave) {
            if (!"55556666".equals(dni) || !"clave-r".equals(clave)) {
                return Optional.empty();
            }
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("tipo", "recepcionista");
            return Optional.of(response);
        }
    }

    // U81
    @Test
    void unRolNuevoSeAgregaSinModificarElControlador() {
        when(pacienteRepository.findByDni(anyString())).thenReturn(Optional.empty());
        when(medicoRepository.findByDni(anyString())).thenReturn(Optional.empty());
        when(usuarioRepository.findByDni(anyString())).thenReturn(Optional.empty());
        AuthController controller = new AuthController(List.of(
                new AutenticadorPaciente(pacienteRepository),
                new AutenticadorMedico(medicoRepository),
                new AutenticadorAdministrador(usuarioRepository),
                new AutenticadorRolDeEjemplo()));

        Map<String, String> credenciales = new HashMap<>();
        credenciales.put("dni", "55556666");
        credenciales.put("clave", "clave-r");
        ResponseEntity<?> r = controller.login(credenciales);

        assertEquals(200, r.getStatusCode().value());
        assertEquals(Map.of("success", true, "tipo", "recepcionista"), r.getBody());
        // Se buscó antes en los 3 roles existentes, en su orden
        var orden = inOrder(pacienteRepository, medicoRepository, usuarioRepository);
        orden.verify(pacienteRepository).findByDni("55556666");
        orden.verify(medicoRepository).findByDni("55556666");
        orden.verify(usuarioRepository).findByDni("55556666");
    }
}
