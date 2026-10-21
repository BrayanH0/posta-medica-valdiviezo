package com.centro_valdiviezo.backend.controller;

import com.centro_valdiviezo.backend.model.Paciente;
import com.centro_valdiviezo.backend.services.PacienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/paciente")
@CrossOrigin(origins = "*")
public class PacienteController {

    @Autowired
    PacienteService pacienteService;

    @GetMapping
    public ArrayList<Paciente> listar() {
        return this.pacienteService.listarPacientes();
    }

    @GetMapping(path = "/codigo/{id}")
    public Optional<Paciente> obtenerPacienteId(@PathVariable("id") Integer id) {
        return this.pacienteService.listarPorId(id);
    }

    @PostMapping(path = "/crear")
    public Paciente crear(@RequestBody Paciente paciente) {
        return this.pacienteService.crearPaciente(paciente);
    }

    @PutMapping("/actualizar/{id}")
    public Paciente actualizarPaciente(@RequestBody Paciente paciente, @PathVariable Integer id) {
        return this.pacienteService.actualizarPaciente(paciente, id);
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<Map<String, Object>> eliminarPaciente(@PathVariable("id") Integer id) {
        if (!pacienteService.existePaciente(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("status", "error", "message", "Paciente no encontrado"));
        }
        try {
            pacienteService.eliminarPaciente(id);
            return ResponseEntity.ok(Map.of("status", "success", "message", "Paciente eliminado correctamente"));
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("status", "error", "message", "No se puede eliminar el paciente porque tiene registros relacionados"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "error", "message", "Error interno al eliminar el paciente"));
        }
    }
}
