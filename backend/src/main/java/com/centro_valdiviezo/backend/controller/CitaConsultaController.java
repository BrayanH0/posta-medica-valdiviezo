package com.centro_valdiviezo.backend.controller;

import com.centro_valdiviezo.backend.dto.CitaMedicoDTO;
import com.centro_valdiviezo.backend.dto.PacienteMedicoDTO;
import com.centro_valdiviezo.backend.model.Cita;
import com.centro_valdiviezo.backend.services.ICitaService;
import com.centro_valdiviezo.backend.services.ResultadoCambioEstado;
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

@RestController
@RequestMapping("/api/citas")
public class CitaConsultaController {

    private final ICitaService citaService;

    public CitaConsultaController(ICitaService citaService) {
        this.citaService = citaService;
    }

    @GetMapping("/medico/{idMedico}/fecha/{fecha}")
    public List<Cita> getCitasPorMedicoYFecha(@PathVariable Integer idMedico, @PathVariable String fecha) {
        return citaService.citasDeMedicoEnFecha(idMedico, fecha);
    }

    // Citas del médico en un estado (nombre de Estado_Cita), filtradas en el servidor
    @GetMapping("/medico/{idMedico}")
    public List<CitaMedicoDTO> getCitasDeMedico(@PathVariable Integer idMedico, @RequestParam String estado) {
        return citaService.citasDeMedicoPorEstado(idMedico, estado);
    }

    // Pacientes con al menos una cita con el médico
    @GetMapping("/medico/{idMedico}/pacientes")
    public List<PacienteMedicoDTO> getPacientesDeMedico(@PathVariable Integer idMedico) {
        return citaService.pacientesDeMedico(idMedico);
    }

    // Cambia solo el estado de una cita del médico; el estado se recibe por nombre
    @PutMapping("/medico/{idMedico}/{idCita}/estado")
    public ResponseEntity<?> cambiarEstado(@PathVariable Integer idMedico, @PathVariable Integer idCita,
            @RequestBody Map<String, String> cuerpo) {
        ResultadoCambioEstado resultado = citaService.cambiarEstadoDeCitaDeMedico(idMedico, idCita, cuerpo.get("estado"));
        switch (resultado.tipo()) {
            case CITA_NO_ENCONTRADA:
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "La cita no existe o no pertenece al médico"));
            case ESTADO_INEXISTENTE:
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Estado de cita inexistente: " + cuerpo.get("estado")));
            default:
                return ResponseEntity.of(resultado.cita());
        }
    }
}
