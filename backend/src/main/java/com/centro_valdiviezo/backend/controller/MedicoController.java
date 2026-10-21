package com.centro_valdiviezo.backend.controller;

import com.centro_valdiviezo.backend.dto.MedicoEspecialidadDTO;
import com.centro_valdiviezo.backend.dto.ResumenMedico;
import com.centro_valdiviezo.backend.model.Medico;
import com.centro_valdiviezo.backend.services.MedicoService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/api/medico")
@CrossOrigin(origins = "*")
public class MedicoController {

    @Autowired
    private MedicoService medicoService;

    @GetMapping
    public ArrayList<Medico> listar() {
        return this.medicoService.listarMedicos();
    }

    @PostMapping(path = "/crear") // Ok
    public Medico crear(@RequestBody Medico medico) {
        return this.medicoService.crearMedico(medico);
    }

    @GetMapping(path = "/codigo/{id}")
    public Optional<Medico> obtenerMedicoId(@PathVariable("id") Integer id) {
        return this.medicoService.listarPorId(id);
    }

    @GetMapping(path = "/apellidos/{apellidos}")
    public ArrayList<Medico> obtenerMedicoPorApellido(@PathVariable("apellidos") String ap) {
        return this.medicoService.buscaporNombre(ap);
    }

    @GetMapping(path = "/nombres/{nombre}")
    public ArrayList<Medico> obtenerMedicoPorNombre(@PathVariable("nombre") String nom) {
        return this.medicoService.buscaPorApellido(nom);
    }

    @PutMapping(path = "/actualizar/{id}")
    public Medico actualizarMedico(@RequestBody Medico nom, @PathVariable Integer id) {
        return this.medicoService.actualizarMedico(nom, id);
    }

    @DeleteMapping(path = "/eliminar/{id}") // Ok
    public ResponseEntity<Void> eliminarMedico(@PathVariable("id") Integer id) {
        this.medicoService.eliminarMedico(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping(path = "/resumenMedico")
    public ArrayList<ResumenMedico> getResumen() {
        return medicoService.getResumenMedicoPorEspecialidad();
    }

    @GetMapping("/conEspecialidad")
    public List<MedicoEspecialidadDTO> getMedicosConEspecialidad() {
        return medicoService.getMedicosConEspecialidad();
    }

    @GetMapping("/especialidad/{idEspecialidad}")
    public List<Medico> getMedicosPorEspecialidad(@PathVariable Integer idEspecialidad) {
        return medicoService.listarPorEspecialidad(idEspecialidad);
    }
}
