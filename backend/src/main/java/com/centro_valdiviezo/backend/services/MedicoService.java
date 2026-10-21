package com.centro_valdiviezo.backend.services;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.centro_valdiviezo.backend.repository.MedicoRepository;
import com.centro_valdiviezo.backend.dto.MedicoEspecialidadDTO;
import com.centro_valdiviezo.backend.dto.ResumenMedico;
import com.centro_valdiviezo.backend.model.Medico;

@Service
public class MedicoService {

    @Autowired
    MedicoRepository medicoRepository;

    public ArrayList<Medico> listarMedicos() {
        return (ArrayList<Medico>) medicoRepository.findAll();
    }

    public Optional<Medico> listarPorId(Integer id) {
        return medicoRepository.findById(id);
    }

    public Medico crearMedico(Medico medico) {
        return medicoRepository.save(medico);
    }

    public boolean eliminarMedico(Integer id) {
        medicoRepository.deleteById(id);
        return true;
    }

    public Medico actualizarMedico(Medico m, Integer id) {
        Medico e = medicoRepository.findById(id).get();
        e.setNombres(m.getNombres());
        e.setApellidos(m.getApellidos());
        e.setCmp(m.getCmp());
        e.setId_especialidad(m.getId_especialidad());
        medicoRepository.save(e);
        return e;
    }

    public ArrayList<Medico> buscaPorApellido(String ap) {
        return medicoRepository.findByApellidosContaining(ap);
    }

    public ArrayList<Medico> buscaporNombre(String nom) {
        return medicoRepository.findByNombresContaining(nom);
    }

    public List<Medico> listarPorEspecialidad(Integer idEspecialidad) {
        return medicoRepository.findByIdEspecialidad(idEspecialidad);
    }

    public ArrayList<ResumenMedico> getResumenMedicoPorEspecialidad() {
        return medicoRepository.getResumenMedicosPorEspecialidad();
    }

    public ArrayList<Medico> getMedico() {
        return medicoRepository.getMedicoJPQL();
    }

    public List<MedicoEspecialidadDTO> getMedicosConEspecialidad() {
        List<Object[]> resultados = medicoRepository.obtenerMedicosConEspecialidad();
        List<MedicoEspecialidadDTO> listaDTO = new ArrayList<>();

        for (Object[] fila : resultados) {
            MedicoEspecialidadDTO dto = new MedicoEspecialidadDTO(
                    (int) fila[0],
                    (String) fila[1],
                    (String) fila[2],
                    (String) fila[3],
                    (String) fila[4],
                    (String) fila[5]);

            listaDTO.add(dto);
        }
        return listaDTO;
    }
}
