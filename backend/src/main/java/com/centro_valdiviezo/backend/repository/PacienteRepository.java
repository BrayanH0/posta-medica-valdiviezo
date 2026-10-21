package com.centro_valdiviezo.backend.repository;

import com.centro_valdiviezo.backend.model.Medico;
import com.centro_valdiviezo.backend.model.Paciente;

import java.util.ArrayList;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PacienteRepository extends JpaRepository<Paciente, Integer> {

    ArrayList<Medico> findByApellidosContaining(String apellidos);

    ArrayList<Medico> findByNombresContaining(String nombres);

    Optional<Paciente> findByDni(String dni);
}
