package com.centro_valdiviezo.backend.repository;

import com.centro_valdiviezo.backend.model.Disponibilidad_Medico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface Disponibilidad_MedicoRepository extends JpaRepository<Disponibilidad_Medico, Integer> {

    @Query(value = "SELECT * FROM Disponibilidad_Medico WHERE id_medico = ?1", nativeQuery = true)
    List<Disponibilidad_Medico> findByIdMedico(Integer idMedico);
}
