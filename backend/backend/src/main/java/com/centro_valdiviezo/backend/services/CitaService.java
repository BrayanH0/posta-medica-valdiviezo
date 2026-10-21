package com.centro_valdiviezo.backend.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.centro_valdiviezo.backend.dto.EspecialidadCitaCantDTO;
import com.centro_valdiviezo.backend.dto.EstadoCitaCantDTO;
import com.centro_valdiviezo.backend.dto.IngresosMensualesDTO;
import com.centro_valdiviezo.backend.repository.CitaRepository;

@Service
public class CitaService {

    @Autowired
    CitaRepository citaRepository;

    public List<EstadoCitaCantDTO> obtenerCitasPorEstado() {
        return citaRepository.cantCitasPorEstado();
    }

    public List<EspecialidadCitaCantDTO> obtenerCitasPorEspecialidad() {
        return citaRepository.cantCitasPorEspecialidad();
    }

    public List<IngresosMensualesDTO> obtenerIngresosMensuales() {
        return citaRepository.ingresosMensuales()
                .stream()
                .map(row -> new IngresosMensualesDTO(
                        (String) row[0],
                        ((Number) row[1]).doubleValue()))
                .collect(Collectors.toList());
    }
}
