package com.centro_valdiviezo.backend.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.centro_valdiviezo.backend.dto.CitaMedicoDTO;
import com.centro_valdiviezo.backend.dto.PacienteMedicoDTO;
import com.centro_valdiviezo.backend.model.Cita;
import com.centro_valdiviezo.backend.repository.CitaRepository;
import com.centro_valdiviezo.backend.repository.Estado_CitaRepository;

// RFC-008 (LB-8), U83. CRUD y consultas que pasaron de CitaController y CitaConsultaController a CitaService.
@ExtendWith(MockitoExtension.class)
class CitaServiceCrudTest {

    @Mock
    private CitaRepository citaRepository;

    @Mock
    private Estado_CitaRepository estadoCitaRepository;

    private CitaService service;

    @BeforeEach
    void crear() {
        service = new CitaService(citaRepository, estadoCitaRepository);
    }

    private static Cita cita(int id, String motivo) {
        Cita c = new Cita();
        c.setIdCita(id);
        c.setId_paciente(1);
        c.setId_medico(2);
        c.setFecha_cita("2026-01-01");
        c.setHora_cita("08:00:00");
        c.setMotivo(motivo);
        c.setEstado_cita(1);
        return c;
    }

    @Test
    void listarCrearObtenerYEliminarDelegan() {
        List<Cita> todas = List.of(cita(1, "a"));
        Cita nueva = cita(0, "n");
        when(citaRepository.findAll()).thenReturn(todas);
        when(citaRepository.save(nueva)).thenReturn(nueva);
        when(citaRepository.findById(1)).thenReturn(Optional.of(todas.get(0)));

        assertSame(todas, service.listarCitas());
        assertSame(nueva, service.crearCita(nueva));
        assertSame(todas.get(0), service.obtenerCitaPorId(1).get());
        service.eliminarCita(3);
        verify(citaRepository).deleteById(3);
    }

    @Test
    void actualizarCopiaLosSeisCamposYGuarda() {
        Cita existente = cita(5, "vieja");
        Cita nuevo = new Cita();
        nuevo.setIdCita(99);
        nuevo.setId_paciente(7);
        nuevo.setId_medico(8);
        nuevo.setFecha_cita("2026-12-31");
        nuevo.setHora_cita("17:20:00");
        nuevo.setMotivo("nuevo");
        nuevo.setEstado_cita(3);
        when(citaRepository.findById(5)).thenReturn(Optional.of(existente));
        when(citaRepository.save(existente)).thenReturn(existente);

        Cita r = service.actualizarCita(5, nuevo).get();

        assertSame(existente, r);
        assertEquals(5, r.getIdCita());
        assertEquals(7, r.getId_paciente());
        assertEquals(8, r.getId_medico());
        assertEquals("2026-12-31", r.getFecha_cita());
        assertEquals("17:20:00", r.getHora_cita());
        assertEquals("nuevo", r.getMotivo());
        assertEquals(3, r.getEstado_cita());
    }

    @Test
    void actualizarInexistenteDevuelveVacioYNoGuarda() {
        when(citaRepository.findById(5)).thenReturn(Optional.empty());

        assertTrue(service.actualizarCita(5, new Cita()).isEmpty());
        verify(citaRepository, never()).save(any());
    }

    @Test
    void consultasDelMedicoDelegan() {
        List<Cita> enFecha = List.of(cita(1, "a"));
        List<CitaMedicoDTO> porEstado = List.of();
        List<PacienteMedicoDTO> pacientes = List.of();
        when(citaRepository.findByMedicoIdAndFecha(1, "2023-07-01")).thenReturn(enFecha);
        when(citaRepository.findCitasDeMedicoPorEstado(1, "Pendiente")).thenReturn(porEstado);
        when(citaRepository.findPacientesDeMedico(1)).thenReturn(pacientes);

        assertSame(enFecha, service.citasDeMedicoEnFecha(1, "2023-07-01"));
        assertSame(porEstado, service.citasDeMedicoPorEstado(1, "Pendiente"));
        assertSame(pacientes, service.pacientesDeMedico(1));
        verifyNoInteractions(estadoCitaRepository);
    }
}
