package com.centro_valdiviezo.backend.controller;

import com.centro_valdiviezo.backend.model.Disponibilidad_Medico;
import com.centro_valdiviezo.backend.repository.Disponibilidad_MedicoRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/disponibilidad_medico")
@CrossOrigin(origins = "*")
public class Disponibilidad_MedicoController {

    private final Disponibilidad_MedicoRepository repository;

    public Disponibilidad_MedicoController(Disponibilidad_MedicoRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Disponibilidad_Medico> obtenerTodos() {
        return repository.findAll();
    }

    @PostMapping
    public Disponibilidad_Medico crear(@RequestBody Disponibilidad_Medico item) {
        return repository.save(item);
    }

    @GetMapping("/{id}")
    public Disponibilidad_Medico obtenerPorId(@PathVariable Integer id) {
        return repository.findById(id).orElse(null);
    }

    @PutMapping("/{id}")
    public Disponibilidad_Medico actualizar(@PathVariable Integer id, @RequestBody Disponibilidad_Medico nuevo) {
        return repository.findById(id)
                .map(e -> {
                    e.setId_medico(nuevo.getId_medico());
                    e.setDia_semana(nuevo.getDia_semana());
                    e.setHora_inicio(nuevo.getHora_inicio());
                    e.setHora_fin(nuevo.getHora_fin());
                    return repository.save(e);
                })
                .orElse(null);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id) {
        repository.deleteById(id);
    }

    @GetMapping("/medico/{idMedico}")
    public List<Disponibilidad_Medico> obtenerPorMedico(@PathVariable Integer idMedico) {
        return repository.findByIdMedico(idMedico);
    }
}
