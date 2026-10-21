package com.centro_valdiviezo.backend.services;

import java.util.ArrayList;
import java.util.Optional;

import com.centro_valdiviezo.backend.model.Paciente;

public interface IPacienteService {

    ArrayList<Paciente> listarPacientes();

    Optional<Paciente> listarPorId(Integer id);

    Paciente crearPaciente(Paciente paciente);

    boolean eliminarPaciente(Integer id);

    boolean existePaciente(Integer id);

    Paciente actualizarPaciente(Paciente p, Integer id);
}
