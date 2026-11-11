package com.centro_valdiviezo.backend.services;

import java.util.ArrayList;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.centro_valdiviezo.backend.model.UsuarioModel;
import com.centro_valdiviezo.backend.repository.UsuarioRepository;

@Service
public class UsuarioService implements IUsuarioService {
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

        public UsuarioModel crear(UsuarioModel um){
        if (um.getClave() != null) {
            um.setClave(passwordEncoder.encode(um.getClave()));
        }
        return usuarioRepository.save(um);

    }
    public ArrayList<UsuarioModel>listar(){
        return(ArrayList<UsuarioModel>) usuarioRepository.findAll();
    }
}
