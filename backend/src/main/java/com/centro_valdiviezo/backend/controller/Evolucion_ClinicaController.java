package com.centro_valdiviezo.backend.controller;

import com.centro_valdiviezo.backend.model.Evolucion_Clinica;
import com.centro_valdiviezo.backend.repository.Evolucion_ClinicaRepository;
import com.centro_valdiviezo.backend.repository.Historia_ClinicaRepository;
import com.centro_valdiviezo.backend.seguridad.UsuarioAutenticado;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/evolucion_clinica")
public class Evolucion_ClinicaController {

    private final Evolucion_ClinicaRepository repository;
    private final Historia_ClinicaRepository historiaRepository;

    public Evolucion_ClinicaController(Evolucion_ClinicaRepository repository,
            Historia_ClinicaRepository historiaRepository) {
        this.repository = repository;
        this.historiaRepository = historiaRepository;
    }

    // RFC-011: los GET son solo del paciente (WebSecurityConfig) y devuelven solo sus evoluciones
    @GetMapping
    public List<Evolucion_Clinica> obtenerTodos() {
        return repository.findByIdPaciente(UsuarioAutenticado.actual().id());
    }

    @PostMapping
    public Evolucion_Clinica crear(@RequestBody Evolucion_Clinica item) {
        return repository.save(item);
    }

    @GetMapping("/{id}")
    public Evolucion_Clinica obtenerPorId(@PathVariable Integer id) {
        Optional<Evolucion_Clinica> evolucion = repository.findById(id);
        evolucion.ifPresent(e -> UsuarioAutenticado.exigirPropietario(historiaRepository.findById(e.getId_historia())
                .map(h -> UsuarioAutenticado.actual().id().equals(h.getId_paciente()))
                .orElse(false)));
        return evolucion.orElse(null);
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
