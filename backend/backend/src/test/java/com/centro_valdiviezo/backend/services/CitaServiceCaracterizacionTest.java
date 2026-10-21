package com.centro_valdiviezo.backend.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.centro_valdiviezo.backend.dto.EspecialidadCitaCantDTO;
import com.centro_valdiviezo.backend.dto.EstadoCitaCantDTO;
import com.centro_valdiviezo.backend.dto.IngresosMensualesDTO;
import com.centro_valdiviezo.backend.repository.CitaRepository;

// Pruebas unitarias de caracterización (tarea 9) de CitaService, con el repositorio simulado.
@ExtendWith(MockitoExtension.class)
class CitaServiceCaracterizacionTest {

    @Mock
    private CitaRepository citaRepository;

    @InjectMocks
    private CitaService service;

    // U60
    @Test
    void citasPorEstadoYPorEspecialidadDevuelvenLoDelRepositorio() {
        List<EstadoCitaCantDTO> porEstado = List.of(new EstadoCitaCantDTO("Pendiente", 2));
        List<EspecialidadCitaCantDTO> porEspecialidad = List.of(new EspecialidadCitaCantDTO("Cardiologia", 4));
        when(citaRepository.cantCitasPorEstado()).thenReturn(porEstado);
        when(citaRepository.cantCitasPorEspecialidad()).thenReturn(porEspecialidad);

        assertSame(porEstado, service.obtenerCitasPorEstado());
        assertSame(porEspecialidad, service.obtenerCitasPorEspecialidad());
    }

    // U61: convierte cada fila [mesAno, total] en DTO; el total puede venir como cualquier Number
    @Test
    void ingresosMensualesConvierteFilasEnDTO() {
        List<Object[]> filas = new ArrayList<>();
        filas.add(new Object[] { "2023-07", new BigDecimal("150.50") });
        filas.add(new Object[] { "2023-08", 80 });
        when(citaRepository.ingresosMensuales()).thenReturn(filas);

        List<IngresosMensualesDTO> r = service.obtenerIngresosMensuales();

        assertEquals(2, r.size());
        assertEquals("2023-07", r.get(0).getMesAno());
        assertEquals(150.50, r.get(0).getTotal(), 0.0001);
        assertEquals("2023-08", r.get(1).getMesAno());
        assertEquals(80.0, r.get(1).getTotal(), 0.0001);
    }

    // U62
    @Test
    void ingresosMensualesSinFilasDevuelveListaVacia() {
        when(citaRepository.ingresosMensuales()).thenReturn(new ArrayList<>());

        assertTrue(service.obtenerIngresosMensuales().isEmpty());
    }
}
