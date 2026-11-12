package com.centro_valdiviezo.backend.controller;

import com.centro_valdiviezo.backend.dto.EspecialidadCitaCantDTO;
import com.centro_valdiviezo.backend.dto.EstadoCitaCantDTO;
import com.centro_valdiviezo.backend.model.Cita;
import com.centro_valdiviezo.backend.seguridad.UsuarioAutenticado;
import com.centro_valdiviezo.backend.services.ICitaService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/api/cita")
public class CitaController {

    private final ICitaService citaService;

    public CitaController(ICitaService citaService) {
        this.citaService = citaService;
    }

    // RFC-011 (H-013): el paciente y el médico reciben solo sus citas; el administrador, todas
    @GetMapping
    public List<Cita> obtenerTodos() {
        UsuarioAutenticado u = UsuarioAutenticado.actual();
        if (u.esPaciente()) {
            return citaService.citasDePaciente(u.id());
        }
        if (u.esMedico()) {
            return citaService.citasDeMedico(u.id());
        }
        return citaService.listarCitas();
    }

    // Solo el paciente reserva, y solo a su nombre (WebSecurityConfig + esta comprobación)
    @PostMapping
    public Cita crear(@RequestBody Cita item) {
        UsuarioAutenticado u = UsuarioAutenticado.actual();
        UsuarioAutenticado.exigirPropietario(u.id().equals(item.getId_paciente()));
        return citaService.crearCita(item);
    }

    @GetMapping("/{id}")
    public Cita obtenerPorId(@PathVariable Integer id) {
        Optional<Cita> cita = citaService.obtenerCitaPorId(id);
        cita.ifPresent(c -> UsuarioAutenticado.exigirPropietario(esDelUsuario(c, UsuarioAutenticado.actual())));
        return cita.orElse(null);
    }

    private static boolean esDelUsuario(Cita c, UsuarioAutenticado u) {
        if (u.esPaciente()) {
            return u.id().equals(c.getId_paciente());
        }
        if (u.esMedico()) {
            return u.id().equals(c.getId_medico());
        }
        return u.esAdministrador();
    }

    @PutMapping("/{id}")
    public Cita actualizar(@PathVariable Integer id, @RequestBody Cita nuevo) {
        return citaService.actualizarCita(id, nuevo).orElse(null);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id) {
        citaService.obtenerCitaPorId(id)
                .ifPresent(c -> UsuarioAutenticado.exigirPropietario(esDelUsuario(c, UsuarioAutenticado.actual())));
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
