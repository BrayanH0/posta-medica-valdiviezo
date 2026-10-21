package com.centro_valdiviezo.backend.controller;

import com.centro_valdiviezo.backend.model.Historia_Clinica;
import com.centro_valdiviezo.backend.repository.Historia_ClinicaRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/historia_clinica")
@CrossOrigin(origins = "*")
public class Historia_ClinicaController {

    private final Historia_ClinicaRepository repository;

    public Historia_ClinicaController(Historia_ClinicaRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Historia_Clinica> obtenerTodos() {
        return repository.findAll();
    }

    @PostMapping
    public Historia_Clinica crear(@RequestBody Historia_Clinica item) {
        return repository.save(item);
    }

    @GetMapping("/{id}")
    public Historia_Clinica obtenerPorId(@PathVariable Integer id) {
        return repository.findById(id).orElse(null);
    }

    @PutMapping("/{id}")
    public Historia_Clinica actualizar(@PathVariable Integer id, @RequestBody Historia_Clinica nuevo) {
        return repository.findById(id)
                .map(e -> {
                    e.setId_paciente(nuevo.getId_paciente());
                    e.setFecha_creacion(nuevo.getFecha_creacion());
                    e.setObservaciones(nuevo.getObservaciones());
                    e.setTipo_sangre(nuevo.getTipo_sangre());
                    e.setAlergias(nuevo.getAlergias());
                    return repository.save(e);
                })
                .orElse(null);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id) {
        repository.deleteById(id);
    }
}
