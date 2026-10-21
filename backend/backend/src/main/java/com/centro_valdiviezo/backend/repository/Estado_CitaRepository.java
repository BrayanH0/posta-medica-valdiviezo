package com.centro_valdiviezo.backend.repository;

import com.centro_valdiviezo.backend.model.Estado_Cita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface Estado_CitaRepository extends JpaRepository<Estado_Cita, Integer> {
}
