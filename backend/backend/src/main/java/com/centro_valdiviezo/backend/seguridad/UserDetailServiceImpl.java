package com.centro_valdiviezo.backend.seguridad;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.centro_valdiviezo.backend.model.Paciente;
import com.centro_valdiviezo.backend.model.UsuarioModel;
import com.centro_valdiviezo.backend.repository.PacienteRepository;
import com.centro_valdiviezo.backend.repository.UsuarioRepository;

@Service
public class UserDetailServiceImpl implements UserDetailsService {
    @Autowired
    UsuarioRepository usuarioRepository;

    @Autowired
    PacienteRepository pacienteRepository;

    @Override
    public UserDetails loadUserByUsername(String dni) throws UsernameNotFoundException {
        // 1. Buscar en Usuarios (Admin)
        Optional<UsuarioModel> usuarioOpt = usuarioRepository.findByDni(dni);
        if (usuarioOpt.isPresent()) {
            return new UserDetailsImpl(usuarioOpt.get());
        }

        // 2. Buscar en Pacientes
        Optional<Paciente> pacienteOpt = pacienteRepository.findByDni(dni);
        if (pacienteOpt.isPresent()) {
            return new UserDetailsImpl(pacienteOpt.get());
        }

        throw new UsernameNotFoundException("Usuario no encontrado con DNI: " + dni);
    }
}
