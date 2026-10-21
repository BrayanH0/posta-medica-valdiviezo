package com.centro_valdiviezo.backend.controller;

import com.centro_valdiviezo.backend.model.Cita;
import com.centro_valdiviezo.backend.repository.CitaRepository;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/citas")
@CrossOrigin(origins = "*")
public class CitaConsultaController {

    private final CitaRepository repository;

    public CitaConsultaController(CitaRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/medico/{idMedico}/fecha/{fecha}")
    public List<Cita> getCitasPorMedicoYFecha(@PathVariable Integer idMedico, @PathVariable String fecha) {
        // Pass string directly to repository
        return repository.findByMedicoIdAndFecha(idMedico, fecha);
    }
}
