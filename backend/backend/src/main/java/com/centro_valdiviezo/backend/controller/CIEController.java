package com.centro_valdiviezo.backend.controller;

import com.centro_valdiviezo.backend.model.CIE;
import com.centro_valdiviezo.backend.repository.CIERepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cie")
@CrossOrigin(origins = "*")
public class CIEController {

    private final CIERepository repository;

    public CIEController(CIERepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<CIE> obtenerTodos() {
        return repository.findAll();
    }

    @PostMapping
    public CIE crear(@RequestBody CIE item) {
        return repository.save(item);
    }

    @GetMapping("/{id}")
    public CIE obtenerPorId(@PathVariable Integer id) {
        return repository.findById(id).orElse(null);
    }

    @PutMapping("/{id}")
    public CIE actualizar(@PathVariable Integer id, @RequestBody CIE nuevo) {
        return repository.findById(id)
                .map(e -> {
                    e.setCodigo(nuevo.getCodigo());
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
