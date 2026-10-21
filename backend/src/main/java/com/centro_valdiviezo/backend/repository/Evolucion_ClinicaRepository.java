package com.centro_valdiviezo.backend.repository;

import com.centro_valdiviezo.backend.model.Evolucion_Clinica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface Evolucion_ClinicaRepository extends JpaRepository<Evolucion_Clinica, Integer> {
}
