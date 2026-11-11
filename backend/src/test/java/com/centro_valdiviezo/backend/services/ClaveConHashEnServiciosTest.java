package com.centro_valdiviezo.backend.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

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

// U88 (RFC-010, LB-10): al crear paciente, médico o administrador la clave se guarda como hash BCrypt
// que verifica con la clave original; actualizarPaciente (PUT de "Gestión de Pacientes", que desde
// RFC-010 llega sin clave) conserva el hash guardado (H-032: no copia la clave).
@ExtendWith(MockitoExtension.class)
class ClaveConHashEnServiciosTest {

    private final PasswordEncoder encoder = new BCryptPasswordEncoder(4);

    @Mock
    private PacienteRepository pacienteRepository;
    @Mock
    private MedicoRepository medicoRepository;
    @Mock
    private UsuarioRepository usuarioRepository;

    @Test
    void crearPacienteMedicoYUsuarioGuardanElHash() {
        when(pacienteRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(medicoRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(usuarioRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        Paciente p = new Paciente();
        p.setClave("nueva-p");
        Medico m = new Medico();
        m.setClave("nueva-m");
        UsuarioModel u = new UsuarioModel();
        u.setClave("nueva-a");

        String hp = new PacienteService(pacienteRepository, encoder).crearPaciente(p).getClave();
        String hm = new MedicoService(medicoRepository, encoder).crearMedico(m).getClave();
        String ha = new UsuarioService(usuarioRepository, encoder).crear(u).getClave();

        for (String[] par : new String[][] { { "nueva-p", hp }, { "nueva-m", hm }, { "nueva-a", ha } }) {
            assertNotEquals(par[0], par[1]);
            assertTrue(par[1].startsWith("$2a$"), par[1]);
            assertTrue(encoder.matches(par[0], par[1]));
        }
    }

    @Test
    void crearSinClaveNoLlamaAlEncoder() {
        PasswordEncoder espia = spy(encoder);
        when(medicoRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        assertNull(new MedicoService(medicoRepository, espia).crearMedico(new Medico()).getClave());
        verify(espia, never()).encode(any());
    }

    @Test
    void actualizarPacienteSinClaveConservaElHashGuardado() {
        String hash = encoder.encode("vigente");
        Paciente guardado = new Paciente();
        guardado.setIdPaciente(4);
        guardado.setClave(hash);
        Paciente cambios = new Paciente(); // como llega del PUT: sin clave (WRITE_ONLY)
        cambios.setNombres("Nuevo");
        when(pacienteRepository.findById(4)).thenReturn(Optional.of(guardado));

        Paciente r = new PacienteService(pacienteRepository, encoder).actualizarPaciente(cambios, 4);

        assertEquals("Nuevo", r.getNombres());
        assertEquals(hash, r.getClave());
        verify(pacienteRepository).save(guardado);
    }
}
