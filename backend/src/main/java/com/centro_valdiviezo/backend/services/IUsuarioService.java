package com.centro_valdiviezo.backend.services;

import java.util.ArrayList;

import com.centro_valdiviezo.backend.model.UsuarioModel;

public interface IUsuarioService {

    UsuarioModel crear(UsuarioModel um);

    ArrayList<UsuarioModel> listar();
}
