package com.centro_valdiviezo.backend.repository;

import com.centro_valdiviezo.backend.model.Evolucion_Clinica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface Evolucion_ClinicaRepository extends JpaRepository<Evolucion_Clinica, Integer> {

    // RFC-011: evoluciones de las historias del paciente del token
    @Query("SELECT e FROM Evolucion_Clinica e WHERE e.id_historia IN "
            + "(SELECT h.idhistoria_Clinica FROM Historia_Clinica h WHERE h.id_paciente = ?1)")
    List<Evolucion_Clinica> findByIdPaciente(Integer idPaciente);
}
