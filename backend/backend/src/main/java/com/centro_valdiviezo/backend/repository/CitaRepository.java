package com.centro_valdiviezo.backend.repository;

import com.centro_valdiviezo.backend.dto.EspecialidadCitaCantDTO;
import com.centro_valdiviezo.backend.dto.EstadoCitaCantDTO;
import com.centro_valdiviezo.backend.model.Cita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CitaRepository extends JpaRepository<Cita, Integer> {

        @Query(value = "SELECT COUNT(*) FROM Cita WHERE estado_cita = ?1", nativeQuery = true)
        long countByEstadoCita(int idEstado);

        @Query(value = "SELECT SUM(e.precio) " +
                        "FROM Cita c " +
                        "JOIN Medico m ON c.id_medico = m.id_medico " +
                        "JOIN Especialidad e ON m.id_especialidad = e.id_especialidad " +
                        "WHERE c.estado_cita = 4", nativeQuery = true)
        Double sumTotalIngresos();

        @Query(value = "SELECT * FROM (" +
                        "   SELECT e.nombre_especialidad, CONCAT(p.nombres, ' ', p.apellidos) as paciente, " +
                        "          CONCAT(m.nombres, ' ', m.apellidos) as medico, c.fecha_cita, c.hora_cita, " +
                        "          ROW_NUMBER() OVER (PARTITION BY e.id_especialidad ORDER BY c.fecha_cita DESC, c.hora_cita DESC) as rn "
                        +
                        "   FROM Cita c " +
                        "   JOIN Medico m ON c.id_medico = m.id_medico " +
                        "   JOIN Especialidad e ON m.id_especialidad = e.id_especialidad " +
                        "   JOIN Paciente p ON c.id_paciente = p.idPaciente " +
                        ") as rankeds " +
                        "WHERE rn <= 5", nativeQuery = true)
        List<Object[]> findResumenCitasPorEspecialidad();

        // For checking slots - Using String for fecha because Cita entity uses String
        @Query("SELECT c FROM Cita c WHERE c.id_medico = ?1 AND c.fecha_cita = ?2")
        List<Cita> findByMedicoIdAndFecha(Integer idMedico, String fecha);

        @Query(value = "SELECT ec.nombre_estado   AS estadoCita, COUNT(c.idCita) AS cantCita FROM Cita c JOIN Estado_Cita ec ON c.estado_cita = ec.id_estado_cita GROUP BY ec.id_estado_cita", nativeQuery = true)
        List<EstadoCitaCantDTO> cantCitasPorEstado();

        @Query(value = "SELECT e.nombre_especialidad, COUNT(c.idCita) FROM Cita c JOIN Medico m ON c.id_medico = m.id_medico JOIN Especialidad e ON m.id_especialidad = e.id_especialidad GROUP BY e.id_especialidad, e.nombre_especialidad ORDER BY COUNT(c.idCita) DESC", nativeQuery = true)
        List<EspecialidadCitaCantDTO> cantCitasPorEspecialidad();

        @Query(value = "SELECT DATE_FORMAT(c.fecha_cita, '%Y-%m') AS mesAno, SUM(e.precio) AS total FROM   Cita c JOIN   Medico m      ON c.id_medico = m.id_medico JOIN   Especialidad e ON m.id_especialidad = e.id_especialidad WHERE  c.estado_cita = 4 GROUP  BY mesAno ORDER  BY mesAno", nativeQuery = true)
        List<Object[]> ingresosMensuales();
}
