package com.centro_valdiviezo.backend.controller;

import com.centro_valdiviezo.backend.model.Estado_Paciente;
import com.centro_valdiviezo.backend.repository.Estado_PacienteRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/estado_paciente")
@CrossOrigin(origins = "*")
public class Estado_PacienteController {

    private final Estado_PacienteRepository repository;

    public Estado_PacienteController(Estado_PacienteRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Estado_Paciente> obtenerTodos() {
        return repository.findAll();
    }

    @PostMapping
    public Estado_Paciente crear(@RequestBody Estado_Paciente item) {
        return repository.save(item);
    }

    @GetMapping("/{id}")
    public Estado_Paciente obtenerPorId(@PathVariable Integer id) {
        return repository.findById(id).orElse(null);
    }

    @PutMapping("/{id}")
    public Estado_Paciente actualizar(@PathVariable Integer id, @RequestBody Estado_Paciente nuevo) {
        return repository.findById(id)
                .map(e -> {
                    e.setNombre_estado(nuevo.getNombre_estado());
                    e.setDescripcion(nuevo.getDescripcion());
                    return repository.save(e);
                })
                .orElse(null);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id) {
        repository.deleteById(id);
    }
}
