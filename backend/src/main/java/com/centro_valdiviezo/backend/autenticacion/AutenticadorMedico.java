package com.centro_valdiviezo.backend.autenticacion;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.centro_valdiviezo.backend.model.Medico;
import com.centro_valdiviezo.backend.repository.MedicoRepository;

// Segundo en el orden de búsqueda de /login: paciente -> médico -> administrador
@Component
@Order(2)
public class AutenticadorMedico implements AutenticadorRol {

    private final MedicoRepository medicoRepository;
    private final PasswordEncoder passwordEncoder;

    public AutenticadorMedico(MedicoRepository medicoRepository, PasswordEncoder passwordEncoder) {
        this.medicoRepository = medicoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public Optional<Map<String, Object>> autenticar(String dni, String clave) {
        Optional<Medico> medicoOpt = medicoRepository.findByDni(dni);
        if (medicoOpt.isPresent()) {
            Medico medico = medicoOpt.get();
            if (medico.getClave() != null && passwordEncoder.matches(clave, medico.getClave())) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("tipo", "medico");
                response.put("id", medico.getId_medico());
                response.put("nombres", medico.getNombres());
                response.put("apellidos", medico.getApellidos());
                response.put("dni", medico.getDni());
                response.put("cmp", medico.getCmp());
                return Optional.of(response);
            }
        }
        return Optional.empty();
    }
}
