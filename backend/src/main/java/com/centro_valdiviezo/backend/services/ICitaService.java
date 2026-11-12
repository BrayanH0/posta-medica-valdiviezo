package com.centro_valdiviezo.backend.services;

import java.util.List;
import java.util.Optional;

import com.centro_valdiviezo.backend.dto.CitaMedicoDTO;
import com.centro_valdiviezo.backend.dto.EspecialidadCitaCantDTO;
import com.centro_valdiviezo.backend.dto.EstadoCitaCantDTO;
import com.centro_valdiviezo.backend.dto.IngresosMensualesDTO;
import com.centro_valdiviezo.backend.dto.PacienteMedicoDTO;
import com.centro_valdiviezo.backend.model.Cita;

public interface ICitaService {

    List<Cita> listarCitas();

    // RFC-011: citas de un paciente / de un médico (el id sale del token)
    List<Cita> citasDePaciente(Integer idPaciente);

    List<Cita> citasDeMedico(Integer idMedico);

    Cita crearCita(Cita cita);

    Optional<Cita> obtenerCitaPorId(Integer id);

    Optional<Cita> actualizarCita(Integer id, Cita nuevo);

    void eliminarCita(Integer id);

    List<EstadoCitaCantDTO> obtenerCitasPorEstado();

    List<EspecialidadCitaCantDTO> obtenerCitasPorEspecialidad();

    List<IngresosMensualesDTO> obtenerIngresosMensuales();

    List<Cita> citasDeMedicoEnFecha(Integer idMedico, String fecha);

    List<CitaMedicoDTO> citasDeMedicoPorEstado(Integer idMedico, String estado);

    List<PacienteMedicoDTO> pacientesDeMedico(Integer idMedico);

    ResultadoCambioEstado cambiarEstadoDeCitaDeMedico(Integer idMedico, Integer idCita, String nombreEstado);
}
