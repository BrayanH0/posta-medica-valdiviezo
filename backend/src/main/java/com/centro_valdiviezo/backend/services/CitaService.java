package com.centro_valdiviezo.backend.services;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.centro_valdiviezo.backend.dto.CitaMedicoDTO;
import com.centro_valdiviezo.backend.dto.EspecialidadCitaCantDTO;
import com.centro_valdiviezo.backend.dto.EstadoCitaCantDTO;
import com.centro_valdiviezo.backend.dto.IngresosMensualesDTO;
import com.centro_valdiviezo.backend.dto.PacienteMedicoDTO;
import com.centro_valdiviezo.backend.model.Cita;
import com.centro_valdiviezo.backend.model.Estado_Cita;
import com.centro_valdiviezo.backend.repository.CitaRepository;
import com.centro_valdiviezo.backend.repository.Estado_CitaRepository;

@Service
public class CitaService implements ICitaService {

    private final CitaRepository citaRepository;
    private final Estado_CitaRepository estadoCitaRepository;

    public CitaService(CitaRepository citaRepository, Estado_CitaRepository estadoCitaRepository) {
        this.citaRepository = citaRepository;
        this.estadoCitaRepository = estadoCitaRepository;
    }

    @Override
    public List<Cita> listarCitas() {
        return citaRepository.findAll();
    }

    @Override
    public Cita crearCita(Cita cita) {
        return citaRepository.save(cita);
    }

    @Override
    public Optional<Cita> obtenerCitaPorId(Integer id) {
        return citaRepository.findById(id);
    }

    @Override
    public Optional<Cita> actualizarCita(Integer id, Cita nuevo) {
        return citaRepository.findById(id)
                .map(e -> {
                    e.setId_paciente(nuevo.getId_paciente());
                    e.setId_medico(nuevo.getId_medico());
                    e.setFecha_cita(nuevo.getFecha_cita());
                    e.setHora_cita(nuevo.getHora_cita());
                    e.setMotivo(nuevo.getMotivo());
                    e.setEstado_cita(nuevo.getEstado_cita());
                    return citaRepository.save(e);
                });
    }

    @Override
    public void eliminarCita(Integer id) {
        citaRepository.deleteById(id);
    }

    @Override
    public List<EstadoCitaCantDTO> obtenerCitasPorEstado() {
        return citaRepository.cantCitasPorEstado();
    }

    @Override
    public List<EspecialidadCitaCantDTO> obtenerCitasPorEspecialidad() {
        return citaRepository.cantCitasPorEspecialidad();
    }

    @Override
    public List<IngresosMensualesDTO> obtenerIngresosMensuales() {
        return citaRepository.ingresosMensuales()
                .stream()
                .map(row -> new IngresosMensualesDTO(
                        (String) row[0],
                        ((Number) row[1]).doubleValue()))
                .collect(Collectors.toList());
    }

    @Override
    public List<Cita> citasDeMedicoEnFecha(Integer idMedico, String fecha) {
        // Pass string directly to repository
        return citaRepository.findByMedicoIdAndFecha(idMedico, fecha);
    }

    // Citas del médico en un estado (nombre de Estado_Cita), filtradas en el servidor
    @Override
    public List<CitaMedicoDTO> citasDeMedicoPorEstado(Integer idMedico, String estado) {
        return citaRepository.findCitasDeMedicoPorEstado(idMedico, estado);
    }

    // Pacientes con al menos una cita con el médico
    @Override
    public List<PacienteMedicoDTO> pacientesDeMedico(Integer idMedico) {
        return citaRepository.findPacientesDeMedico(idMedico);
    }

    // Cambia solo el estado de una cita del médico; el estado se recibe por nombre
    @Override
    public ResultadoCambioEstado cambiarEstadoDeCitaDeMedico(Integer idMedico, Integer idCita, String nombreEstado) {
        Optional<Cita> cita = citaRepository.findById(idCita);
        if (cita.isEmpty() || !idMedico.equals(cita.get().getId_medico())) {
            return new ResultadoCambioEstado(ResultadoCambioEstado.Tipo.CITA_NO_ENCONTRADA, Optional.empty());
        }

        Optional<Estado_Cita> estado = estadoCitaRepository.findByNombreEstado(nombreEstado);
        if (estado.isEmpty()) {
            return new ResultadoCambioEstado(ResultadoCambioEstado.Tipo.ESTADO_INEXISTENTE, Optional.empty());
        }

        cita.get().setEstado_cita(estado.get().getId_estado_cita());
        citaRepository.save(cita.get());
        return new ResultadoCambioEstado(ResultadoCambioEstado.Tipo.CAMBIADO, citaRepository.findCitaMedicoPorId(idCita));
    }
}
