package com.centro_valdiviezo.backend.services;

import java.util.ArrayList;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.centro_valdiviezo.backend.model.Paciente;
import com.centro_valdiviezo.backend.repository.PacienteRepository;

@Service
public class PacienteService {

    @Autowired
    PacienteRepository pacienteRepository;

    public ArrayList<Paciente> listarPacientes() {
        return (ArrayList<Paciente>) pacienteRepository.findAll();
    }

    public Optional<Paciente> listarPorId(Integer id) {
        return pacienteRepository.findById(id);
    }

    public Paciente crearPaciente(Paciente paciente) {
        if (paciente.getClave() != null) {
            // paciente.setClave(new BCryptPasswordEncoder().encode(paciente.getClave()));
        }
        return pacienteRepository.save(paciente);
    }

    public boolean eliminarPaciente(Integer id) {
        pacienteRepository.deleteById(id);
        return true;
    }

    public boolean existePaciente(Integer id) {
        return pacienteRepository.existsById(id);
    }

    public Paciente actualizarPaciente(Paciente p, Integer id) {
        Paciente e = pacienteRepository.findById(id).get();
        e.setNombres(p.getNombres());
        e.setApellidos(p.getApellidos());
        e.setDni(p.getDni());
        e.setFecha_nacimiento(p.getFecha_nacimiento());
        e.setSexo(p.getSexo());
        e.setId_estado_paciente(p.getId_estado_paciente());
        e.setId_ubigeo(p.getId_ubigeo());
        pacienteRepository.save(e);
        return e;
    }
}
