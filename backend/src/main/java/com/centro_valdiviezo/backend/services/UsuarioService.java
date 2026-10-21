package com.centro_valdiviezo.backend.services;

import java.util.ArrayList;

import org.springframework.stereotype.Service;

import com.centro_valdiviezo.backend.model.UsuarioModel;
import com.centro_valdiviezo.backend.repository.UsuarioRepository;

@Service
public class UsuarioService implements IUsuarioService {
    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

        public UsuarioModel crear(UsuarioModel um){
        // String pwd = new BCryptPasswordEncoder().encode(um.getClave());
        // um.setClave(pwd);
        return usuarioRepository.save(um);

    }
    public ArrayList<UsuarioModel>listar(){
        return(ArrayList<UsuarioModel>) usuarioRepository.findAll();
    }
}
