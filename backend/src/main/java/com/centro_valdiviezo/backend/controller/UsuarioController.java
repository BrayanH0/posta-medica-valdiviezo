package com.centro_valdiviezo.backend.controller;

import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;

import com.centro_valdiviezo.backend.model.UsuarioModel;
import com.centro_valdiviezo.backend.services.UsuarioService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;



@RestController
@RequestMapping("/usuarios")
public class UsuarioController {
    @Autowired
    private UsuarioService usuarioService;

    @GetMapping
    public ArrayList <UsuarioModel>listar(){
        return usuarioService.listar();
    }
    @PostMapping("/nuevo")
    public UsuarioModel crear(@RequestBody UsuarioModel entity) {
        //TODO: process POST request
        
        return this.usuarioService.crear(entity);
    }
    
}
