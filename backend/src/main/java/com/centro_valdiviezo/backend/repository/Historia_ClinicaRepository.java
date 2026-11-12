package com.centro_valdiviezo.backend.repository;

import com.centro_valdiviezo.backend.model.Historia_Clinica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface Historia_ClinicaRepository extends JpaRepository<Historia_Clinica, Integer> {

    // RFC-011: historias del paciente del token
    @Query("SELECT h FROM Historia_Clinica h WHERE h.id_paciente = ?1")
    List<Historia_Clinica> findByIdPaciente(Integer idPaciente);
}
