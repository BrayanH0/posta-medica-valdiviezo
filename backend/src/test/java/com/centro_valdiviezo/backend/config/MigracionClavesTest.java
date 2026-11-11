package com.centro_valdiviezo.backend.config;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
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

// U87 (RFC-010, LB-10): MigracionClaves convierte a BCrypt solo las claves que no lo son, guarda
// solo esas filas, y una segunda ejecución sobre el resultado no cambia nada (idempotente).
@ExtendWith(MockitoExtension.class)
class MigracionClavesTest {

    private final PasswordEncoder encoder = new BCryptPasswordEncoder(4);

    @Mock
    private PacienteRepository pacienteRepository;
    @Mock
    private MedicoRepository medicoRepository;
    @Mock
    private UsuarioRepository usuarioRepository;

    private static Paciente paciente(int id, String clave) {
        Paciente p = new Paciente();
        p.setIdPaciente(id);
        p.setClave(clave);
        return p;
    }

    @Test
    void esBCryptReconoceSoloElFormatoBCrypt() {
        assertTrue(MigracionClaves.esBCrypt(encoder.encode("x")));
        assertTrue(MigracionClaves.esBCrypt(new BCryptPasswordEncoder(BCryptPasswordEncoder.BCryptVersion.$2B, 4).encode("x")));
        assertFalse(MigracionClaves.esBCrypt("texto-plano"));
        assertFalse(MigracionClaves.esBCrypt("$2a$corta"));
        assertFalse(MigracionClaves.esBCrypt("$2xclave"));
        assertFalse(MigracionClaves.esBCrypt(""));
        assertFalse(MigracionClaves.esBCrypt(null));
    }

    @SuppressWarnings("unchecked")
    @Test
    void migraSoloLasClavesEnTextoPlanoYLaSegundaVezNoHaceNada() {
        String yaConHash = encoder.encode("vieja-2");
        Paciente plano = paciente(1, "clave-1");
        Paciente conHash = paciente(2, yaConHash);
        Medico medicoPlano = new Medico();
        medicoPlano.setClave("clave-m");
        UsuarioModel adminPlano = new UsuarioModel();
        adminPlano.setClave("clave-a");
        when(pacienteRepository.findAll()).thenReturn(List.of(plano, conHash));
        when(medicoRepository.findAll()).thenReturn(List.of(medicoPlano));
        when(usuarioRepository.findAll()).thenReturn(List.of(adminPlano));

        MigracionClaves migracion = new MigracionClaves(pacienteRepository, medicoRepository, usuarioRepository, encoder);
        migracion.afterSingletonsInstantiated();

        ArgumentCaptor<List<Paciente>> guardados = ArgumentCaptor.forClass(List.class);
        verify(pacienteRepository).saveAll(guardados.capture());
        assertEquals(List.of(plano), guardados.getValue());
        assertTrue(encoder.matches("clave-1", plano.getClave()));
        assertEquals(yaConHash, conHash.getClave());
        assertTrue(encoder.matches("clave-m", medicoPlano.getClave()));
        assertTrue(encoder.matches("clave-a", adminPlano.getClave()));
        verify(medicoRepository).saveAll(any());
        verify(usuarioRepository).saveAll(any());

        // Segunda ejecución: todo está en hash -> no guarda nada y no cambia ningún valor
        String h1 = plano.getClave(), hm = medicoPlano.getClave(), ha = adminPlano.getClave();
        clearInvocations(pacienteRepository, medicoRepository, usuarioRepository);
        migracion.afterSingletonsInstantiated();

        verify(pacienteRepository, never()).saveAll(any());
        verify(medicoRepository, never()).saveAll(any());
        verify(usuarioRepository, never()).saveAll(any());
        assertEquals(h1, plano.getClave());
        assertEquals(hm, medicoPlano.getClave());
        assertEquals(ha, adminPlano.getClave());
    }
}
