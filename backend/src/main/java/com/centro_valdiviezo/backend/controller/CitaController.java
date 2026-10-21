package com.centro_valdiviezo.backend.controller;

import com.centro_valdiviezo.backend.dto.EspecialidadCitaCantDTO;
import com.centro_valdiviezo.backend.dto.EstadoCitaCantDTO;
import com.centro_valdiviezo.backend.model.Cita;
import com.centro_valdiviezo.backend.services.ICitaService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/api/cita")
public class CitaController {

    private final ICitaService citaService;

    public CitaController(ICitaService citaService) {
        this.citaService = citaService;
    }

    @GetMapping
    public List<Cita> obtenerTodos() {
        return citaService.listarCitas();
    }

    @PostMapping
    public Cita crear(@RequestBody Cita item) {
        return citaService.crearCita(item);
    }

    @GetMapping("/{id}")
    public Cita obtenerPorId(@PathVariable Integer id) {
        return citaService.obtenerCitaPorId(id).orElse(null);
    }

    @PutMapping("/{id}")
    public Cita actualizar(@PathVariable Integer id, @RequestBody Cita nuevo) {
        return citaService.actualizarCita(id, nuevo).orElse(null);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id) {
        citaService.eliminarCita(id);
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
