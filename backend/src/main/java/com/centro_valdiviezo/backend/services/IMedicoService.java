package com.centro_valdiviezo.backend.services;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import com.centro_valdiviezo.backend.dto.MedicoEspecialidadDTO;
import com.centro_valdiviezo.backend.dto.ResumenMedico;
import com.centro_valdiviezo.backend.model.Medico;

public interface IMedicoService {

    ArrayList<Medico> listarMedicos();

    Optional<Medico> listarPorId(Integer id);

    Medico crearMedico(Medico medico);

    boolean eliminarMedico(Integer id);

    Medico actualizarMedico(Medico m, Integer id);

    ArrayList<Medico> buscaPorApellido(String ap);

    ArrayList<Medico> buscaporNombre(String nom);

    List<Medico> listarPorEspecialidad(Integer idEspecialidad);

    ArrayList<ResumenMedico> getResumenMedicoPorEspecialidad();

    ArrayList<Medico> getMedico();

    List<MedicoEspecialidadDTO> getMedicosConEspecialidad();
}
