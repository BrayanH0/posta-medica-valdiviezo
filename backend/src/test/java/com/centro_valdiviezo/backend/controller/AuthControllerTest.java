package com.centro_valdiviezo.backend.controller;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import com.centro_valdiviezo.backend.autenticacion.AutenticadorAdministrador;
import com.centro_valdiviezo.backend.autenticacion.AutenticadorMedico;
import com.centro_valdiviezo.backend.autenticacion.AutenticadorPaciente;
import com.centro_valdiviezo.backend.model.Medico;
import com.centro_valdiviezo.backend.repository.MedicoRepository;
import com.centro_valdiviezo.backend.repository.PacienteRepository;
import com.centro_valdiviezo.backend.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public class AuthControllerTest {

    @Mock
    private MedicoRepository medicoRepository;

    @Mock
    private PacienteRepository pacienteRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    private AuthController authController;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
        authController = new AuthController(List.of(
                new AutenticadorPaciente(pacienteRepository),
                new AutenticadorMedico(medicoRepository),
                new AutenticadorAdministrador(usuarioRepository)));
    }

    @Test
    public void testLoginMedicoSuccess() {
        String dni = "10000001";
        String clave = "123456";

        Medico medico = new Medico();
        medico.setId_medico(1);
        medico.setDni(dni);
        medico.setClave(clave);
        medico.setNombres("Jorge");
        medico.setApellidos("Santos Ruiz");
        medico.setCmp("CMP12345");

        when(pacienteRepository.findByDni(dni)).thenReturn(Optional.empty());
        when(usuarioRepository.findByDni(dni)).thenReturn(Optional.empty());
        when(medicoRepository.findByDni(dni)).thenReturn(Optional.of(medico));

        Map<String, String> credentials = new HashMap<>();
        credentials.put("dni", dni);
        credentials.put("clave", clave);

        ResponseEntity<?> response = authController.login(credentials);
        assertEquals(200, response.getStatusCodeValue());

        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertEquals(true, body.get("success"));
        assertEquals("medico", body.get("tipo"));
        assertEquals("Jorge", body.get("nombres"));
    }
}
