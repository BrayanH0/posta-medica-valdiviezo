package com.centro_valdiviezo.backend.controller;

import com.centro_valdiviezo.backend.dto.EspecialidadCitaCantDTO;
import com.centro_valdiviezo.backend.dto.EstadoCitaCantDTO;
import com.centro_valdiviezo.backend.model.Cita;
import com.centro_valdiviezo.backend.repository.CitaRepository;
import com.centro_valdiviezo.backend.services.CitaService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/cita")
@CrossOrigin(origins = "*")
public class CitaController {

    @Autowired
    CitaService citaService;

    private final CitaRepository repository;

    public CitaController(CitaRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Cita> obtenerTodos() {
        return repository.findAll();
    }

    @PostMapping
    public Cita crear(@RequestBody Cita item) {
        return repository.save(item);
    }

    @GetMapping("/{id}")
    public Cita obtenerPorId(@PathVariable Integer id) {
        return repository.findById(id).orElse(null);
    }

    @PutMapping("/{id}")
    public Cita actualizar(@PathVariable Integer id, @RequestBody Cita nuevo) {
        return repository.findById(id)
                .map(e -> {
                    e.setId_paciente(nuevo.getId_paciente());
                    e.setId_medico(nuevo.getId_medico());
                    e.setFecha_cita(nuevo.getFecha_cita());
                    e.setHora_cita(nuevo.getHora_cita());
                    e.setMotivo(nuevo.getMotivo());
                    e.setEstado_cita(nuevo.getEstado_cita());
                    return repository.save(e);
                })
                .orElse(null);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id) {
        repository.deleteById(id);
    }

    @GetMapping("/porEstado")
    public ResponseEntity<List<EstadoCitaCantDTO>> obtenerCitasPorEstado() {
        List<EstadoCitaCantDTO> data = citaService.obtenerCitasPorEstado();
        return ResponseEntity.ok(data);
    }

    @GetMapping("/porEspecialidad")
    public ResponseEntity<List<EspecialidadCitaCantDTO>> obtenerCitasPorEspecialidad() {
        return ResponseEntity.ok(citaService.obtenerCitasPorEspecialidad());
    }

}
