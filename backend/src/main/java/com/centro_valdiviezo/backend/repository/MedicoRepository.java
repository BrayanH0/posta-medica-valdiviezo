package com.centro_valdiviezo.backend.repository;

import com.centro_valdiviezo.backend.dto.ResumenMedico;
import com.centro_valdiviezo.backend.model.Medico;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface MedicoRepository extends JpaRepository<Medico, Integer> {

    ArrayList<Medico> findByApellidosContaining(String apellidos);

    ArrayList<Medico> findByNombresContaining(String nombres);

    Optional<Medico> findByDni(String dni);

    @Query(value = "SELECT * FROM Medico WHERE id_especialidad = ?1", nativeQuery = true)
    List<Medico> findByIdEspecialidad(Integer idEspecialidad);

    @Query(value = "select id_especialidad, count(*) AS cantidad_medicos from medico group by id_especialidad", nativeQuery = true)
    ArrayList<ResumenMedico> getResumenMedicosPorEspecialidad();

    @Query(value = "select p from Medico p")
    ArrayList<Medico> getMedicoJPQL();

    @Query(value = "select m.id_medico, m.nombres, m.apellidos, m.cmp, e.nombre_especialidad, e. descripcion from Medico m join Especialidad e ON m.id_especialidad = e.id_especialidad", nativeQuery = true)
    List<Object[]> obtenerMedicosConEspecialidad();
}
