package com.centro_valdiviezo.backend.repository;

import com.centro_valdiviezo.backend.dto.CitaMedicoDTO;
import com.centro_valdiviezo.backend.dto.EspecialidadCitaCantDTO;
import com.centro_valdiviezo.backend.dto.EstadoCitaCantDTO;
import com.centro_valdiviezo.backend.dto.PacienteMedicoDTO;
import com.centro_valdiviezo.backend.model.Cita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

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

        // Citas de un médico en un estado, filtradas en la base (sin la clave del paciente)
        @Query("SELECT new com.centro_valdiviezo.backend.dto.CitaMedicoDTO(" +
                        "c.idCita, c.fecha_cita, c.hora_cita, c.motivo, e.nombre_estado, " +
                        "p.idPaciente, p.nombres, p.apellidos, p.dni) " +
                        "FROM Cita c " +
                        "JOIN Paciente p ON p.idPaciente = c.id_paciente " +
                        "JOIN Estado_Cita e ON e.id_estado_cita = c.estado_cita " +
                        "WHERE c.id_medico = ?1 AND e.nombre_estado = ?2 " +
                        "ORDER BY c.fecha_cita, c.hora_cita, c.idCita")
        List<CitaMedicoDTO> findCitasDeMedicoPorEstado(Integer idMedico, String estado);

        @Query("SELECT new com.centro_valdiviezo.backend.dto.CitaMedicoDTO(" +
                        "c.idCita, c.fecha_cita, c.hora_cita, c.motivo, e.nombre_estado, " +
                        "p.idPaciente, p.nombres, p.apellidos, p.dni) " +
                        "FROM Cita c " +
                        "JOIN Paciente p ON p.idPaciente = c.id_paciente " +
                        "JOIN Estado_Cita e ON e.id_estado_cita = c.estado_cita " +
                        "WHERE c.idCita = ?1")
        Optional<CitaMedicoDTO> findCitaMedicoPorId(Integer idCita);

        // Pacientes que tienen al menos una cita con el médico (sin la clave del paciente)
        @Query("SELECT DISTINCT new com.centro_valdiviezo.backend.dto.PacienteMedicoDTO(" +
                        "p.idPaciente, p.nombres, p.apellidos, p.dni, p.fecha_nacimiento, p.sexo, p.telefono, " +
                        "ep.nombre_estado, u.departamento, u.distrito) " +
                        "FROM Paciente p " +
                        "JOIN Cita c ON c.id_paciente = p.idPaciente " +
                        "LEFT JOIN Estado_Paciente ep ON ep.id_estado_paciente = p.id_estado_paciente " +
                        "LEFT JOIN Ubigeo u ON u.idubigeo = p.id_ubigeo " +
                        "WHERE c.id_medico = ?1 " +
                        "ORDER BY p.apellidos, p.nombres")
        List<PacienteMedicoDTO> findPacientesDeMedico(Integer idMedico);
}
