package com.centro_valdiviezo.backend.controller;

import com.centro_valdiviezo.backend.dto.CitaResumenDTO;
import com.centro_valdiviezo.backend.dto.IngresosMensualesDTO;
import com.centro_valdiviezo.backend.dto.ReporteDashboardDTO;
import com.centro_valdiviezo.backend.repository.CitaRepository;
import com.centro_valdiviezo.backend.services.CitaService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reportes")
public class ReporteController {

    @Autowired
    CitaService citaService;

    private final CitaRepository citaRepository;

    public ReporteController(CitaRepository citaRepository) {
        this.citaRepository = citaRepository;
    }

    @GetMapping("/dashboard")
    public ReporteDashboardDTO getDashboardStats() {
        long totalCitas = citaRepository.count();
        // Assuming Estado_Cita id 4 is 'Atendida', 3 is 'Cancelada' based on INSERTs
        long citasAtendidas = citaRepository.countByEstadoCita(4);
        long citasCanceladas = citaRepository.countByEstadoCita(3);

        // Sum price from Especialidad linked to Medico linked to Cita (only for
        // attended)
        Double totalIngresos = citaRepository.sumTotalIngresos();

        return new ReporteDashboardDTO(
                totalCitas,
                citasAtendidas,
                citasCanceladas,
                totalIngresos != null ? totalIngresos : 0.0);
    }

    @GetMapping("/resumen")
    public List<CitaResumenDTO> getResumenCitas() {
        // This should return last 5 appointments for EACH specialty.
        // For simplicity and standard JPA, we might fetch all recent and filter, or use
        // a complex query.
        // Or if the request allows, just the last 5 overall, but user said "last 5 of
        // EACH specialty".
        // That is a bit complex for a single standard JPA query without native SQL or
        // multiple queries.
        // I will implement a native query in the repository.
        return citaRepository.findResumenCitasPorEspecialidad().stream()
                .map(obj -> {
                    // Handle Date conversion
                    LocalDate fecha;
                    if (obj[3] instanceof java.sql.Date) {
                        fecha = ((java.sql.Date) obj[3]).toLocalDate();
                    } else {
                        // Fallback or assuming it might be Date or similar
                        fecha = java.sql.Date.valueOf(obj[3].toString()).toLocalDate();
                    }

                    // Handle Time conversion
                    LocalTime hora;
                    if (obj[4] instanceof java.sql.Time) {
                        hora = ((java.sql.Time) obj[4]).toLocalTime();
                    } else {
                        hora = java.sql.Time.valueOf(obj[4].toString()).toLocalTime();
                    }

                    return new CitaResumenDTO(
                            (String) obj[0], // Especialidad
                            (String) obj[1], // Paciente Nombre
                            (String) obj[2], // Medico Nombre
                            fecha,
                            hora);
                })
                .collect(Collectors.toList());
    }

    @GetMapping("/ingresosMensuales")
    public List<IngresosMensualesDTO> ingresosMensuales() {
        return citaService.obtenerIngresosMensuales();
    }
}
