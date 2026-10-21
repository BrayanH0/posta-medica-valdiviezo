package com.centro_valdiviezo.backend.controller;

import com.centro_valdiviezo.backend.model.Evolucion_Clinica;
import com.centro_valdiviezo.backend.repository.Evolucion_ClinicaRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/evolucion_clinica")
@CrossOrigin(origins = "*")
public class Evolucion_ClinicaController {

    private final Evolucion_ClinicaRepository repository;

    public Evolucion_ClinicaController(Evolucion_ClinicaRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Evolucion_Clinica> obtenerTodos() {
        return repository.findAll();
    }

    @PostMapping
    public Evolucion_Clinica crear(@RequestBody Evolucion_Clinica item) {
        return repository.save(item);
    }

    @GetMapping("/{id}")
    public Evolucion_Clinica obtenerPorId(@PathVariable Integer id) {
        return repository.findById(id).orElse(null);
    }

    @PutMapping("/{id}")
    public Evolucion_Clinica actualizar(@PathVariable Integer id, @RequestBody Evolucion_Clinica nuevo) {
        return repository.findById(id)
                .map(e -> {
                    e.setId_historia(nuevo.getId_historia());
                    e.setId_medico(nuevo.getId_medico());
                    e.setFecha_evolucion(nuevo.getFecha_evolucion());
                    e.setAnotaciones(nuevo.getAnotaciones());
                    e.setId_cie(nuevo.getId_cie());
                    return repository.save(e);
                })
                .orElse(null);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id) {
        repository.deleteById(id);
    }
}
