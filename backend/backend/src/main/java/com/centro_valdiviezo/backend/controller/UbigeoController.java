package com.centro_valdiviezo.backend.controller;

import com.centro_valdiviezo.backend.model.Ubigeo;
import com.centro_valdiviezo.backend.repository.UbigeoRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/ubigeo")
@CrossOrigin(origins = "*")
public class UbigeoController {

    private final UbigeoRepository repository;

    public UbigeoController(UbigeoRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Ubigeo> obtenerTodos() {
        return repository.findAll();
    }

    @PostMapping
    public Ubigeo crear(@RequestBody Ubigeo item) {
        return repository.save(item);
    }

    @GetMapping("/{id}")
    public Ubigeo obtenerPorId(@PathVariable Integer id) {
        return repository.findById(id).orElse(null);
    }

    @PutMapping("/{id}")
    public Ubigeo actualizar(@PathVariable Integer id, @RequestBody Ubigeo nuevo) {
        return repository.findById(id)
                .map(e -> {
                    e.setDepartamento(nuevo.getDepartamento());
                    e.setDistrito(nuevo.getDistrito());
                    return repository.save(e);
                })
                .orElse(null);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id) {
        repository.deleteById(id);
    }
}
