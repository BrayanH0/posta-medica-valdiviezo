package com.centro_valdiviezo.backend.autenticacion;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import com.centro_valdiviezo.backend.model.UsuarioModel;
import com.centro_valdiviezo.backend.repository.UsuarioRepository;

// Tercero en el orden de búsqueda de /login: paciente -> médico -> administrador
@Component
@Order(3)
public class AutenticadorAdministrador implements AutenticadorRol {

    private final UsuarioRepository usuarioRepository;

    public AutenticadorAdministrador(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public Optional<Map<String, Object>> autenticar(String dni, String clave) {
        Optional<UsuarioModel> adminOpt = usuarioRepository.findByDni(dni);
        if (adminOpt.isPresent()) {
            UsuarioModel admin = adminOpt.get();
            if (admin.getClave() != null && admin.getClave().equals(clave)) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("tipo", "administrador");
                response.put("id", admin.getId());
                response.put("nombres", admin.getNombre());
                response.put("apellidos", admin.getApellidos());
                response.put("dni", admin.getDni());
                response.put("rol", admin.getRol());
                return Optional.of(response);
            }
        }
        return Optional.empty();
    }
}
