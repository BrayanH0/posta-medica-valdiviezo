package com.centro_valdiviezo.backend.autenticacion;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import com.centro_valdiviezo.backend.model.Paciente;
import com.centro_valdiviezo.backend.repository.PacienteRepository;

// Primero en el orden de búsqueda de /login: paciente -> médico -> administrador
@Component
@Order(1)
public class AutenticadorPaciente implements AutenticadorRol {

    private final PacienteRepository pacienteRepository;

    public AutenticadorPaciente(PacienteRepository pacienteRepository) {
        this.pacienteRepository = pacienteRepository;
    }

    @Override
    public Optional<Map<String, Object>> autenticar(String dni, String clave) {
        Optional<Paciente> pacienteOpt = pacienteRepository.findByDni(dni);
        if (pacienteOpt.isPresent()) {
            Paciente paciente = pacienteOpt.get();
            if (paciente.getClave() != null && paciente.getClave().equals(clave)) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("tipo", "paciente");
                response.put("id", paciente.getIdPaciente());
                response.put("nombres", paciente.getNombres());
                response.put("apellidos", paciente.getApellidos());
                response.put("dni", paciente.getDni());
                return Optional.of(response);
            }
        }
        return Optional.empty();
    }
}
