package com.centro_valdiviezo.backend.controller;

import com.centro_valdiviezo.backend.model.Especialidad;
import com.centro_valdiviezo.backend.repository.EspecialidadRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/api/especialidad")
@CrossOrigin(origins = "*")
public class EspecialidadController {

    @Autowired
    EspecialidadRepository especialidadRepository;

    public EspecialidadController(EspecialidadRepository repository) {
        this.especialidadRepository = repository;
    }

    @GetMapping
    public List<Especialidad> obtenerTodos() {
        return especialidadRepository.findAll();
    }

    @PostMapping
    public Especialidad crear(@RequestBody Especialidad item) {
        return especialidadRepository.save(item);
    }

    @GetMapping("/{id}")
    public Especialidad obtenerPorId(@PathVariable Integer id) {
        return especialidadRepository.findById(id).orElse(null);
    }

    @PutMapping("/{id}")
    public Especialidad actualizar(@PathVariable Integer id, @RequestBody Especialidad nuevo) {
        return especialidadRepository.findById(id)
                .map(e -> {
                    e.setNombre_especialidad(nuevo.getNombre_especialidad());
                    e.setDescripcion(nuevo.getDescripcion());
                    return especialidadRepository.save(e);
                })
                .orElse(null);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id) {
        especialidadRepository.deleteById(id);
    }

    @GetMapping("/especialidad")
    public List<Especialidad> listarEspecialidades() {
        return especialidadRepository.findAll();
    }

}
