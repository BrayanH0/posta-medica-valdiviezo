package com.centro_valdiviezo.backend.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.centro_valdiviezo.backend.model.Paciente;
import com.centro_valdiviezo.backend.repository.PacienteRepository;

// Pruebas unitarias de caracterización (tarea 9) de PacienteService, con el repositorio simulado.
@ExtendWith(MockitoExtension.class)
class PacienteServiceCaracterizacionTest {

    @Mock
    private PacienteRepository pacienteRepository;

    @InjectMocks
    private PacienteService service;

    private static Paciente paciente(int id, String nombres, String telefono) {
        Paciente p = new Paciente();
        p.setIdPaciente(id);
        p.setNombres(nombres);
        p.setApellidos("Apellido " + id);
        p.setDni("0000000" + id);
        p.setClave("clave-" + id);
        p.setFecha_nacimiento("1990-01-0" + id);
        p.setSexo("F");
        p.setTelefono(telefono);
        p.setId_estado_paciente(1);
        p.setId_ubigeo(1);
        return p;
    }

    // U47
    @Test
    void listarPacientesDevuelveLoDelRepositorio() {
        ArrayList<Paciente> todos = new ArrayList<>(List.of(paciente(1, "Ana", "900"), paciente(2, "Eva", "901")));
        when(pacienteRepository.findAll()).thenReturn(todos);

        assertSame(todos, service.listarPacientes());
    }

    // U48
    @Test
    void listarPorIdDevuelveElOptionalDelRepositorio() {
        Paciente p = paciente(1, "Ana", "900");
        when(pacienteRepository.findById(1)).thenReturn(Optional.of(p));
        when(pacienteRepository.findById(2)).thenReturn(Optional.empty());

        assertSame(p, service.listarPorId(1).get());
        assertTrue(service.listarPorId(2).isEmpty());
    }

    // U49: guarda la clave tal como llega, sin cifrar (comportamiento actual, H-007)
    @Test
    void crearPacienteGuardaLaClaveEnTextoPlanoComportamientoActualH007() {
        Paciente p = paciente(1, "Ana", "900");
        when(pacienteRepository.save(p)).thenReturn(p);

        Paciente r = service.crearPaciente(p);

        verify(pacienteRepository).save(p);
        assertEquals("clave-1", r.getClave());
    }

    // U50: devuelve true siempre, exista o no el paciente
    @Test
    void eliminarPacienteLlamaADeleteByIdYDevuelveTrue() {
        assertTrue(service.eliminarPaciente(5));
        verify(pacienteRepository).deleteById(5);
    }

    // U51
    @Test
    void existePacienteConsultaAlRepositorio() {
        when(pacienteRepository.existsById(1)).thenReturn(true);
        when(pacienteRepository.existsById(2)).thenReturn(false);

        assertTrue(service.existePaciente(1));
        assertFalse(service.existePaciente(2));
    }

    // U52: copia nombres, apellidos, dni, fecha, sexo, estado y ubigeo; NO copia telefono ni clave
    // (comportamiento actual, H-032)
    @Test
    void actualizarPacienteNoCopiaTelefonoNiClaveComportamientoActualH032() {
        Paciente guardado = paciente(1, "Ana", "900");
        Paciente cambios = paciente(2, "Eva", "999");
        cambios.setId_estado_paciente(2);
        cambios.setId_ubigeo(3);
        when(pacienteRepository.findById(1)).thenReturn(Optional.of(guardado));

        Paciente r = service.actualizarPaciente(cambios, 1);

        verify(pacienteRepository).save(guardado);
        assertSame(guardado, r);
        assertEquals(1, r.getIdPaciente());
        assertEquals("Eva", r.getNombres());
        assertEquals("Apellido 2", r.getApellidos());
        assertEquals("00000002", r.getDni());
        assertEquals("1990-01-02", r.getFecha_nacimiento());
        assertEquals(2, r.getId_estado_paciente());
        assertEquals(3, r.getId_ubigeo());
        assertEquals("900", r.getTelefono());
        assertEquals("clave-1", r.getClave());
    }

    // U53
    @Test
    void actualizarPacienteInexistenteLanzaNoSuchElementException() {
        when(pacienteRepository.findById(9)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> service.actualizarPaciente(paciente(2, "Eva", "999"), 9));
        verify(pacienteRepository, never()).save(any());
    }
}
