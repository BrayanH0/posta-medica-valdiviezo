package com.centro_valdiviezo.backend.autenticacion;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.centro_valdiviezo.backend.model.Medico;
import com.centro_valdiviezo.backend.model.Paciente;
import com.centro_valdiviezo.backend.model.UsuarioModel;
import com.centro_valdiviezo.backend.repository.MedicoRepository;
import com.centro_valdiviezo.backend.repository.PacienteRepository;
import com.centro_valdiviezo.backend.repository.UsuarioRepository;

// U85 (RFC-010, LB-10): los 3 autenticadores comparan con PasswordEncoder.matches contra el hash.
// Clave correcta -> entra; clave incorrecta -> vacío; clave guardada en texto plano -> vacío
// (con BCrypt, una clave sin migrar ya no coincide). Datos inventados.
@ExtendWith(MockitoExtension.class)
class AutenticadoresBCryptTest {

    private final PasswordEncoder encoder = new BCryptPasswordEncoder(4);

    @Mock
    private PacienteRepository pacienteRepository;
    @Mock
    private MedicoRepository medicoRepository;
    @Mock
    private UsuarioRepository usuarioRepository;

    private Paciente paciente(String clave) {
        Paciente p = new Paciente();
        p.setIdPaciente(5);
        p.setDni("71112222");
        p.setClave(clave);
        return p;
    }

    private Medico medico(String clave) {
        Medico m = new Medico();
        m.setId_medico(6);
        m.setDni("72223333");
        m.setClave(clave);
        return m;
    }

    private UsuarioModel admin(String clave) {
        UsuarioModel u = new UsuarioModel();
        u.setId(7);
        u.setDni("73334444");
        u.setClave(clave);
        u.setRol("ADMIN");
        return u;
    }

    @Test
    void pacienteConHashCorrectoEntraIncorrectoOTextoPlanoNo() {
        AutenticadorPaciente a = new AutenticadorPaciente(pacienteRepository, encoder);

        when(pacienteRepository.findByDni("71112222")).thenReturn(Optional.of(paciente(encoder.encode("secreta-p"))));
        assertEquals("paciente", a.autenticar("71112222", "secreta-p").orElseThrow().get("tipo"));
        assertTrue(a.autenticar("71112222", "otra").isEmpty());

        when(pacienteRepository.findByDni("71112222")).thenReturn(Optional.of(paciente("secreta-p")));
        assertTrue(a.autenticar("71112222", "secreta-p").isEmpty());
    }

    @Test
    void medicoConHashCorrectoEntraIncorrectoOTextoPlanoNo() {
        AutenticadorMedico a = new AutenticadorMedico(medicoRepository, encoder);

        when(medicoRepository.findByDni("72223333")).thenReturn(Optional.of(medico(encoder.encode("secreta-m"))));
        assertEquals("medico", a.autenticar("72223333", "secreta-m").orElseThrow().get("tipo"));
        assertTrue(a.autenticar("72223333", "otra").isEmpty());

        when(medicoRepository.findByDni("72223333")).thenReturn(Optional.of(medico("secreta-m")));
        assertTrue(a.autenticar("72223333", "secreta-m").isEmpty());
    }

    @Test
    void administradorConHashCorrectoEntraIncorrectoOTextoPlanoNo() {
        AutenticadorAdministrador a = new AutenticadorAdministrador(usuarioRepository, encoder);

        when(usuarioRepository.findByDni("73334444")).thenReturn(Optional.of(admin(encoder.encode("secreta-a"))));
        assertEquals("administrador", a.autenticar("73334444", "secreta-a").orElseThrow().get("tipo"));
        assertTrue(a.autenticar("73334444", "otra").isEmpty());

        when(usuarioRepository.findByDni("73334444")).thenReturn(Optional.of(admin("secreta-a")));
        assertTrue(a.autenticar("73334444", "secreta-a").isEmpty());
    }

    @Test
    void claveGuardadaNulaNoEntraNiLanzaExcepcion() {
        AutenticadorPaciente a = new AutenticadorPaciente(pacienteRepository, encoder);
        when(pacienteRepository.findByDni("71112222")).thenReturn(Optional.of(paciente(null)));

        assertTrue(a.autenticar("71112222", "secreta-p").isEmpty());
    }
}
