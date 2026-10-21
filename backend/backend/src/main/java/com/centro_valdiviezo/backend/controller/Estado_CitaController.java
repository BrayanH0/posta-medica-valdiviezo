package com.centro_valdiviezo.backend.controller;

import com.centro_valdiviezo.backend.model.Estado_Cita;
import com.centro_valdiviezo.backend.repository.Estado_CitaRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/estado_cita")
@CrossOrigin(origins = "*")
public class Estado_CitaController {

    private final Estado_CitaRepository repository;

    public Estado_CitaController(Estado_CitaRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Estado_Cita> obtenerTodos() {
        return repository.findAll();
    }

    @PostMapping
    public Estado_Cita crear(@RequestBody Estado_Cita item) {
        return repository.save(item);
    }

    @GetMapping("/{id}")
    public Estado_Cita obtenerPorId(@PathVariable Integer id) {
        return repository.findById(id).orElse(null);
    }

    @PutMapping("/{id}")
    public Estado_Cita actualizar(@PathVariable Integer id, @RequestBody Estado_Cita nuevo) {
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
