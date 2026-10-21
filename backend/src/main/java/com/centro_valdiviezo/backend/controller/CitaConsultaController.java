package com.centro_valdiviezo.backend.controller;

import com.centro_valdiviezo.backend.dto.CitaMedicoDTO;
import com.centro_valdiviezo.backend.dto.PacienteMedicoDTO;
import com.centro_valdiviezo.backend.model.Cita;
import com.centro_valdiviezo.backend.model.Estado_Cita;
import com.centro_valdiviezo.backend.repository.CitaRepository;
import com.centro_valdiviezo.backend.repository.Estado_CitaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/citas")
public class CitaConsultaController {

    private final CitaRepository repository;
    private final Estado_CitaRepository estadoCitaRepository;

    public CitaConsultaController(CitaRepository repository, Estado_CitaRepository estadoCitaRepository) {
        this.repository = repository;
        this.estadoCitaRepository = estadoCitaRepository;
    }

    @GetMapping("/medico/{idMedico}/fecha/{fecha}")
    public List<Cita> getCitasPorMedicoYFecha(@PathVariable Integer idMedico, @PathVariable String fecha) {
        // Pass string directly to repository
        return repository.findByMedicoIdAndFecha(idMedico, fecha);
    }

    // Citas del médico en un estado (nombre de Estado_Cita), filtradas en el servidor
    @GetMapping("/medico/{idMedico}")
    public List<CitaMedicoDTO> getCitasDeMedico(@PathVariable Integer idMedico, @RequestParam String estado) {
        return repository.findCitasDeMedicoPorEstado(idMedico, estado);
    }

    // Pacientes con al menos una cita con el médico
    @GetMapping("/medico/{idMedico}/pacientes")
    public List<PacienteMedicoDTO> getPacientesDeMedico(@PathVariable Integer idMedico) {
        return repository.findPacientesDeMedico(idMedico);
    }

    // Cambia solo el estado de una cita del médico; el estado se recibe por nombre
    @PutMapping("/medico/{idMedico}/{idCita}/estado")
    public ResponseEntity<?> cambiarEstado(@PathVariable Integer idMedico, @PathVariable Integer idCita,
            @RequestBody Map<String, String> cuerpo) {
        Optional<Cita> cita = repository.findById(idCita);
        if (cita.isEmpty() || !idMedico.equals(cita.get().getId_medico())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "La cita no existe o no pertenece al médico"));
        }

        Optional<Estado_Cita> estado = estadoCitaRepository.findByNombreEstado(cuerpo.get("estado"));
        if (estado.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Estado de cita inexistente: " + cuerpo.get("estado")));
        }

        cita.get().setEstado_cita(estado.get().getId_estado_cita());
        repository.save(cita.get());
        return ResponseEntity.of(repository.findCitaMedicoPorId(idCita));
    }
}
