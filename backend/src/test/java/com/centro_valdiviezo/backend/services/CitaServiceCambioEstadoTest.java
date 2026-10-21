package com.centro_valdiviezo.backend.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.centro_valdiviezo.backend.dto.CitaMedicoDTO;
import com.centro_valdiviezo.backend.model.Cita;
import com.centro_valdiviezo.backend.model.Estado_Cita;
import com.centro_valdiviezo.backend.repository.CitaRepository;
import com.centro_valdiviezo.backend.repository.Estado_CitaRepository;

// RFC-008 (LB-8), U82. Lógica de cambio de estado que pasó de CitaConsultaController a CitaService.
@ExtendWith(MockitoExtension.class)
class CitaServiceCambioEstadoTest {

    @Mock
    private CitaRepository citaRepository;

    @Mock
    private Estado_CitaRepository estadoCitaRepository;

    private CitaService service;

    @BeforeEach
    void crear() {
        service = new CitaService(citaRepository, estadoCitaRepository);
    }

    private static Cita cita(int idCita, int idMedico, int estado) {
        Cita c = new Cita();
        c.setIdCita(idCita);
        c.setId_medico(idMedico);
        c.setEstado_cita(estado);
        return c;
    }

    @Test
    void citaAjenaNoSeEncuentraYNoConsultaEstadosNiGuarda() {
        when(citaRepository.findById(50)).thenReturn(Optional.of(cita(50, 6, 1)));

        ResultadoCambioEstado r = service.cambiarEstadoDeCitaDeMedico(1, 50, "Confirmada");

        assertEquals(ResultadoCambioEstado.Tipo.CITA_NO_ENCONTRADA, r.tipo());
        assertTrue(r.cita().isEmpty());
        verify(citaRepository, never()).save(any());
        verifyNoInteractions(estadoCitaRepository);
    }

    @Test
    void citaInexistenteNoSeEncuentra() {
        when(citaRepository.findById(999)).thenReturn(Optional.empty());

        ResultadoCambioEstado r = service.cambiarEstadoDeCitaDeMedico(1, 999, "Confirmada");

        assertEquals(ResultadoCambioEstado.Tipo.CITA_NO_ENCONTRADA, r.tipo());
        verify(citaRepository, never()).save(any());
        verifyNoInteractions(estadoCitaRepository);
    }

    @Test
    void estadoInexistenteNoGuarda() {
        Cita c = cita(50, 1, 1);
        when(citaRepository.findById(50)).thenReturn(Optional.of(c));
        when(estadoCitaRepository.findByNombreEstado("Aprobada")).thenReturn(Optional.empty());

        ResultadoCambioEstado r = service.cambiarEstadoDeCitaDeMedico(1, 50, "Aprobada");

        assertEquals(ResultadoCambioEstado.Tipo.ESTADO_INEXISTENTE, r.tipo());
        assertEquals(1, c.getEstado_cita());
        verify(citaRepository, never()).save(any());
    }

    @Test
    void cambioValidoGuardaYDevuelveElDtoEnElMismoOrdenDeConsultas() {
        Cita c = cita(50, 1, 1);
        Estado_Cita confirmada = new Estado_Cita();
        confirmada.setId_estado_cita(2);
        confirmada.setNombre_estado("Confirmada");
        CitaMedicoDTO dto = new CitaMedicoDTO(50, "2026-10-26", "10:00:00", "m", "Confirmada", 1, "Ana", "Rojas", "11112222");
        when(citaRepository.findById(50)).thenReturn(Optional.of(c));
        when(estadoCitaRepository.findByNombreEstado("Confirmada")).thenReturn(Optional.of(confirmada));
        when(citaRepository.findCitaMedicoPorId(50)).thenReturn(Optional.of(dto));

        ResultadoCambioEstado r = service.cambiarEstadoDeCitaDeMedico(1, 50, "Confirmada");

        assertEquals(ResultadoCambioEstado.Tipo.CAMBIADO, r.tipo());
        assertSame(dto, r.cita().get());
        assertEquals(2, c.getEstado_cita());
        InOrder orden = inOrder(citaRepository, estadoCitaRepository);
        orden.verify(citaRepository).findById(50);
        orden.verify(estadoCitaRepository).findByNombreEstado("Confirmada");
        orden.verify(citaRepository).save(c);
        orden.verify(citaRepository).findCitaMedicoPorId(50);
    }
}
