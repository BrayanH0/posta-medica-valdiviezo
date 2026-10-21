package com.centro_valdiviezo.backend.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import com.centro_valdiviezo.backend.autenticacion.AutenticadorAdministrador;
import com.centro_valdiviezo.backend.autenticacion.AutenticadorMedico;
import com.centro_valdiviezo.backend.autenticacion.AutenticadorPaciente;
import com.centro_valdiviezo.backend.model.Medico;
import com.centro_valdiviezo.backend.model.Paciente;
import com.centro_valdiviezo.backend.model.UsuarioModel;
import com.centro_valdiviezo.backend.repository.MedicoRepository;
import com.centro_valdiviezo.backend.repository.PacienteRepository;
import com.centro_valdiviezo.backend.repository.UsuarioRepository;

// Pruebas unitarias de caracterización (tarea 9): comprueban el comportamiento ACTUAL de POST /login.
// Los repositorios son simulados con Mockito: no se usa la base de datos.
@ExtendWith(MockitoExtension.class)
class AuthControllerCaracterizacionTest {

    @Mock
    private PacienteRepository pacienteRepository;

    @Mock
    private MedicoRepository medicoRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    private AuthController authController;

    @BeforeEach
    void construir() {
        authController = new AuthController(List.of(
                new AutenticadorPaciente(pacienteRepository),
                new AutenticadorMedico(medicoRepository),
                new AutenticadorAdministrador(usuarioRepository)));
    }

    private static Map<String, String> credenciales(String dni, String clave) {
        Map<String, String> c = new HashMap<>();
        c.put("dni", dni);
        c.put("clave", clave);
        return c;
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> cuerpo(ResponseEntity<?> r) {
        return (Map<String, Object>) r.getBody();
    }

    private static Paciente paciente(String dni, String clave) {
        Paciente p = new Paciente();
        p.setIdPaciente(7);
        p.setNombres("Ana");
        p.setApellidos("Rojas Diaz");
        p.setDni(dni);
        p.setClave(clave);
        return p;
    }

    private static Medico medico(String dni, String clave) {
        Medico m = new Medico();
        m.setId_medico(3);
        m.setNombres("Luis");
        m.setApellidos("Paz Soto");
        m.setDni(dni);
        m.setClave(clave);
        m.setCmp("CMP777");
        return m;
    }

    // U33
    @Test
    void loginPacienteCorrecto() {
        when(pacienteRepository.findByDni("11112222")).thenReturn(Optional.of(paciente("11112222", "clave-p")));

        ResponseEntity<?> r = authController.login(credenciales("11112222", "clave-p"));

        assertEquals(200, r.getStatusCode().value());
        Map<String, Object> b = cuerpo(r);
        assertEquals(true, b.get("success"));
        assertEquals("paciente", b.get("tipo"));
        assertEquals(7, b.get("id"));
        assertEquals("Ana", b.get("nombres"));
        assertEquals("Rojas Diaz", b.get("apellidos"));
        assertEquals("11112222", b.get("dni"));
        assertFalse(b.containsKey("clave"));
        verifyNoInteractions(medicoRepository, usuarioRepository);
    }

    // U34
    @Test
    void loginMedicoCorrecto() {
        when(pacienteRepository.findByDni("22223333")).thenReturn(Optional.empty());
        when(medicoRepository.findByDni("22223333")).thenReturn(Optional.of(medico("22223333", "clave-m")));

        ResponseEntity<?> r = authController.login(credenciales("22223333", "clave-m"));

        assertEquals(200, r.getStatusCode().value());
        Map<String, Object> b = cuerpo(r);
        assertEquals(true, b.get("success"));
        assertEquals("medico", b.get("tipo"));
        assertEquals(3, b.get("id"));
        assertEquals("Luis", b.get("nombres"));
        assertEquals("Paz Soto", b.get("apellidos"));
        assertEquals("CMP777", b.get("cmp"));
        assertFalse(b.containsKey("clave"));
        verifyNoInteractions(usuarioRepository);
    }

    // U35
    @Test
    void loginAdministradorCorrecto() {
        UsuarioModel admin = new UsuarioModel();
        admin.setId(2);
        admin.setNombre("Rosa");
        admin.setApellidos("Leon");
        admin.setDni("33334444");
        admin.setClave("clave-a");
        admin.setRol("ADMIN");
        when(pacienteRepository.findByDni("33334444")).thenReturn(Optional.empty());
        when(medicoRepository.findByDni("33334444")).thenReturn(Optional.empty());
        when(usuarioRepository.findByDni("33334444")).thenReturn(Optional.of(admin));

        ResponseEntity<?> r = authController.login(credenciales("33334444", "clave-a"));

        assertEquals(200, r.getStatusCode().value());
        Map<String, Object> b = cuerpo(r);
        assertEquals(true, b.get("success"));
        assertEquals("administrador", b.get("tipo"));
        assertEquals(2, b.get("id"));
        assertEquals("Rosa", b.get("nombres"));
        assertEquals("Leon", b.get("apellidos"));
        assertEquals("ADMIN", b.get("rol"));
        assertFalse(b.containsKey("clave"));
    }

    // U36
    @Test
    void claveIncorrectaResponde401() {
        when(pacienteRepository.findByDni("11112222")).thenReturn(Optional.of(paciente("11112222", "clave-p")));
        when(medicoRepository.findByDni("11112222")).thenReturn(Optional.empty());
        when(usuarioRepository.findByDni("11112222")).thenReturn(Optional.empty());

        ResponseEntity<?> r = authController.login(credenciales("11112222", "otra"));

        assertEquals(401, r.getStatusCode().value());
        assertEquals(Map.of("error", "Credenciales inválidas"), r.getBody());
    }

    // U37
    @Test
    void dniInexistenteResponde401() {
        when(pacienteRepository.findByDni(anyString())).thenReturn(Optional.empty());
        when(medicoRepository.findByDni(anyString())).thenReturn(Optional.empty());
        when(usuarioRepository.findByDni(anyString())).thenReturn(Optional.empty());

        ResponseEntity<?> r = authController.login(credenciales("99990000", "x"));

        assertEquals(401, r.getStatusCode().value());
        assertEquals(Map.of("error", "Credenciales inválidas"), r.getBody());
    }

    // U38
    @Test
    void dniFaltanteResponde400() {
        Map<String, String> c = new HashMap<>();
        c.put("clave", "x");

        ResponseEntity<?> r = authController.login(c);

        assertEquals(400, r.getStatusCode().value());
        assertEquals(Map.of("error", "DNI y contraseña son requeridos"), r.getBody());
        verifyNoInteractions(pacienteRepository, medicoRepository, usuarioRepository);
    }

    // U39
    @Test
    void claveFaltanteResponde400() {
        Map<String, String> c = new HashMap<>();
        c.put("dni", "11112222");

        ResponseEntity<?> r = authController.login(c);

        assertEquals(400, r.getStatusCode().value());
        assertEquals(Map.of("error", "DNI y contraseña son requeridos"), r.getBody());
        verifyNoInteractions(pacienteRepository, medicoRepository, usuarioRepository);
    }

    // U40: orden de búsqueda paciente -> médico -> administrador (H-019). Si el DNI es de un paciente
    // pero la clave no coincide, sigue buscando y entra como médico si la clave es la del médico.
    @Test
    void siLaClaveNoEsDelPacienteSigueBuscandoEnMedico() {
        when(pacienteRepository.findByDni("44445555")).thenReturn(Optional.of(paciente("44445555", "clave-p")));
        when(medicoRepository.findByDni("44445555")).thenReturn(Optional.of(medico("44445555", "clave-m")));

        ResponseEntity<?> r = authController.login(credenciales("44445555", "clave-m"));

        assertEquals(200, r.getStatusCode().value());
        assertEquals("medico", cuerpo(r).get("tipo"));
        verifyNoInteractions(usuarioRepository);
    }

    // U41: un error del repositorio se convierte en 500 con el mensaje de la excepción (comportamiento actual;
    // el frontend lo muestra como "No se pudo conectar con el servidor", H-029)
    @Test
    void errorDelRepositorioResponde500() {
        when(pacienteRepository.findByDni("11112222")).thenThrow(new RuntimeException("BD caida"));

        ResponseEntity<?> r = authController.login(credenciales("11112222", "x"));

        assertEquals(500, r.getStatusCode().value());
        assertEquals(Map.of("error", "Error interno: BD caida"), r.getBody());
    }
}
