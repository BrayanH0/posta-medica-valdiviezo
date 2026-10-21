package com.centro_valdiviezo.backend.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import com.centro_valdiviezo.backend.dto.CitaMedicoDTO;
import com.centro_valdiviezo.backend.model.Cita;
import com.centro_valdiviezo.backend.model.Estado_Cita;
import com.centro_valdiviezo.backend.repository.CitaRepository;
import com.centro_valdiviezo.backend.repository.Estado_CitaRepository;

// Pruebas unitarias de caracterización (tarea 9) de PUT /api/citas/medico/{idMedico}/{idCita}/estado.
// Los repositorios son simulados con Mockito: no se usa la base de datos.
@ExtendWith(MockitoExtension.class)
class CitaConsultaControllerCaracterizacionTest {

    @Mock
    private CitaRepository citaRepository;

    @Mock
    private Estado_CitaRepository estadoCitaRepository;

    private CitaConsultaController controller;

    @BeforeEach
    void crear() {
        controller = new CitaConsultaController(citaRepository, estadoCitaRepository);
    }

    private static Cita cita(int idCita, int idMedico, int estado) {
        Cita c = new Cita();
        c.setIdCita(idCita);
        c.setId_medico(idMedico);
        c.setId_paciente(1);
        c.setEstado_cita(estado);
        return c;
    }

    private static Estado_Cita estado(int id, String nombre) {
        Estado_Cita e = new Estado_Cita();
        e.setId_estado_cita(id);
        e.setNombre_estado(nombre);
        return e;
    }

    // U42
    @Test
    void citaDeOtroMedicoResponde404YNoGuarda() {
        when(citaRepository.findById(50)).thenReturn(Optional.of(cita(50, 6, 1)));

        ResponseEntity<?> r = controller.cambiarEstado(1, 50, Map.of("estado", "Confirmada"));

        assertEquals(404, r.getStatusCode().value());
        assertEquals(Map.of("error", "La cita no existe o no pertenece al médico"), r.getBody());
        verify(citaRepository, never()).save(any());
        verifyNoInteractions(estadoCitaRepository);
    }

    // U43
    @Test
    void citaInexistenteResponde404YNoGuarda() {
        when(citaRepository.findById(999)).thenReturn(Optional.empty());

        ResponseEntity<?> r = controller.cambiarEstado(1, 999, Map.of("estado", "Confirmada"));

        assertEquals(404, r.getStatusCode().value());
        verify(citaRepository, never()).save(any());
    }

    // U44
    @Test
    void estadoInexistenteResponde400YNoGuarda() {
        when(citaRepository.findById(50)).thenReturn(Optional.of(cita(50, 1, 1)));
        when(estadoCitaRepository.findByNombreEstado("Aprobada")).thenReturn(Optional.empty());

        ResponseEntity<?> r = controller.cambiarEstado(1, 50, Map.of("estado", "Aprobada"));

        assertEquals(400, r.getStatusCode().value());
        assertEquals(Map.of("error", "Estado de cita inexistente: Aprobada"), r.getBody());
        verify(citaRepository, never()).save(any());
    }

    // U45
    @Test
    void cambioValidoGuardaElIdDelEstadoYDevuelveLaCita() {
        Cita c = cita(50, 1, 1);
        CitaMedicoDTO dto = new CitaMedicoDTO(50, "2026-10-26", "10:00:00", "m", "Confirmada", 1, "Ana", "Rojas", "11112222");
        when(citaRepository.findById(50)).thenReturn(Optional.of(c));
        when(estadoCitaRepository.findByNombreEstado("Confirmada")).thenReturn(Optional.of(estado(2, "Confirmada")));
        when(citaRepository.findCitaMedicoPorId(50)).thenReturn(Optional.of(dto));

        ResponseEntity<?> r = controller.cambiarEstado(1, 50, Map.of("estado", "Confirmada"));

        ArgumentCaptor<Cita> guardada = ArgumentCaptor.forClass(Cita.class);
        verify(citaRepository).save(guardada.capture());
        assertEquals(2, guardada.getValue().getEstado_cita());
        assertEquals(50, guardada.getValue().getIdCita());
        assertEquals(200, r.getStatusCode().value());
        assertSame(dto, r.getBody());
    }

    // U46: acepta cualquier cambio de estado, sin máquina de estados (comportamiento actual, H-031)
    @ParameterizedTest(name = "{1} -> {3} (comportamiento actual, H-031)")
    @CsvSource({
            "3, Cancelada, 2, Confirmada",
            "1, Pendiente, 4, Atendida",
            "4, Atendida, 1, Pendiente",
            "3, Cancelada, 5, Reprogramada"
    })
    void aceptaCualquierCambioDeEstadoComportamientoActualH031(int idActual, String actual, int idNuevo, String nuevo) {
        Cita c = cita(50, 1, idActual);
        when(citaRepository.findById(50)).thenReturn(Optional.of(c));
        when(estadoCitaRepository.findByNombreEstado(nuevo)).thenReturn(Optional.of(estado(idNuevo, nuevo)));
        when(citaRepository.findCitaMedicoPorId(50)).thenReturn(
                Optional.of(new CitaMedicoDTO(50, "2026-10-26", "10:00:00", "m", nuevo, 1, "Ana", "Rojas", "11112222")));

        ResponseEntity<?> r = controller.cambiarEstado(1, 50, Map.of("estado", nuevo));

        assertEquals(200, r.getStatusCode().value());
        verify(citaRepository).save(c);
        assertEquals(idNuevo, c.getEstado_cita());
    }
}
