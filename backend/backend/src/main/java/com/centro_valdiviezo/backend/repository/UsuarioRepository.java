package com.centro_valdiviezo.backend.repository;

import java.util.ArrayList;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.centro_valdiviezo.backend.model.UsuarioModel;

@Repository
public interface UsuarioRepository extends JpaRepository<UsuarioModel, Integer> {
    Optional<UsuarioModel> findByDni(String dni);

    @Query("select u from UsuarioModel u where nombres = :nom")
    ArrayList<UsuarioModel> listaUsuario(@Param("nom") String nom);

}
