package com.centro_valdiviezo.backend.repository;

import com.centro_valdiviezo.backend.model.Historia_Clinica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface Historia_ClinicaRepository extends JpaRepository<Historia_Clinica, Integer> {
}
