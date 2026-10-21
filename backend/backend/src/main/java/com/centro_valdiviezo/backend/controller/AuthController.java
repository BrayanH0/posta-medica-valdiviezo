package com.centro_valdiviezo.backend.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.centro_valdiviezo.backend.model.UsuarioModel;
import com.centro_valdiviezo.backend.model.Paciente;
import com.centro_valdiviezo.backend.model.Medico;
import com.centro_valdiviezo.backend.repository.UsuarioRepository;
import com.centro_valdiviezo.backend.repository.PacienteRepository;
import com.centro_valdiviezo.backend.repository.MedicoRepository;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    @Autowired
    private PacienteRepository pacienteRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private MedicoRepository medicoRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        try {
            String dni = credentials.get("dni");
            String clave = credentials.get("clave");

            if (dni == null || clave == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "DNI y contraseña son requeridos"));
            }

            // Buscar en Pacientes
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
                    return ResponseEntity.ok(response);
                }
            }

            // Buscar en Medicos
            Optional<Medico> medicoOpt = medicoRepository.findByDni(dni);
            if (medicoOpt.isPresent()) {
                Medico medico = medicoOpt.get();
                if (medico.getClave() != null && medico.getClave().equals(clave)) {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("tipo", "medico");
                    response.put("id", medico.getId_medico());
                    response.put("nombres", medico.getNombres());
                    response.put("apellidos", medico.getApellidos());
                    response.put("dni", medico.getDni());
                    response.put("cmp", medico.getCmp());
                    return ResponseEntity.ok(response);
                }
            }

            // Buscar en Administradores
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
                    return ResponseEntity.ok(response);
                }
            }

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Credenciales inválidas"));
                    
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error interno: " + e.getMessage()));
        }
    }
}
