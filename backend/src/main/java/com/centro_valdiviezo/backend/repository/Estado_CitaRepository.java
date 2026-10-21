package com.centro_valdiviezo.backend.repository;

import com.centro_valdiviezo.backend.model.Estado_Cita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface Estado_CitaRepository extends JpaRepository<Estado_Cita, Integer> {

    @Query("SELECT e FROM Estado_Cita e WHERE e.nombre_estado = ?1")
    Optional<Estado_Cita> findByNombreEstado(String nombreEstado);
}
