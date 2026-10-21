package com.centro_valdiviezo.backend.repository;

import com.centro_valdiviezo.backend.model.Estado_Paciente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface Estado_PacienteRepository extends JpaRepository<Estado_Paciente, Integer> {
}
