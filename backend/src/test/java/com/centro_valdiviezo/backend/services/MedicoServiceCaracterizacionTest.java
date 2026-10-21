package com.centro_valdiviezo.backend.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.centro_valdiviezo.backend.dto.MedicoEspecialidadDTO;
import com.centro_valdiviezo.backend.model.Medico;
import com.centro_valdiviezo.backend.repository.MedicoRepository;

// Pruebas unitarias de caracterización (tarea 9) de MedicoService, con el repositorio simulado.
@ExtendWith(MockitoExtension.class)
class MedicoServiceCaracterizacionTest {

    @Mock
    private MedicoRepository medicoRepository;

    @InjectMocks
    private MedicoService service;

    private static Medico medico(int id, String nombres) {
        Medico m = new Medico();
        m.setId_medico(id);
        m.setNombres(nombres);
        m.setApellidos("Apellido " + id);
        m.setCmp("CMP" + id);
        m.setDni("1000000" + id);
        m.setClave("clave-" + id);
        m.setId_especialidad(1);
        return m;
    }

    // U54
    @Test
    void listarMedicosYPorIdDevuelvenLoDelRepositorio() {
        ArrayList<Medico> todos = new ArrayList<>(List.of(medico(1, "Luis"), medico(2, "Rosa")));
        when(medicoRepository.findAll()).thenReturn(todos);
        when(medicoRepository.findById(2)).thenReturn(Optional.of(todos.get(1)));

        assertSame(todos, service.listarMedicos());
        assertSame(todos.get(1), service.listarPorId(2).get());
    }

    // U55
    @Test
    void crearYEliminarMedico() {
        Medico m = medico(1, "Luis");
        when(medicoRepository.save(m)).thenReturn(m);

        assertSame(m, service.crearMedico(m));
        assertTrue(service.eliminarMedico(4));
        verify(medicoRepository).deleteById(4);
    }

    // U56: copia nombres, apellidos, cmp y especialidad; no copia dni ni clave
    @Test
    void actualizarMedicoCopiaSoloNombresApellidosCmpYEspecialidad() {
        Medico guardado = medico(1, "Luis");
        Medico cambios = medico(2, "Rosa");
        cambios.setId_especialidad(5);
        when(medicoRepository.findById(1)).thenReturn(Optional.of(guardado));

        Medico r = service.actualizarMedico(cambios, 1);

        verify(medicoRepository).save(guardado);
        assertEquals(1, r.getId_medico());
        assertEquals("Rosa", r.getNombres());
        assertEquals("Apellido 2", r.getApellidos());
        assertEquals("CMP2", r.getCmp());
        assertEquals(5, r.getId_especialidad());
        assertEquals("10000001", r.getDni());
        assertEquals("clave-1", r.getClave());
    }

    // U57
    @Test
    void actualizarMedicoInexistenteLanzaNoSuchElementException() {
        when(medicoRepository.findById(9)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> service.actualizarMedico(medico(2, "Rosa"), 9));
        verify(medicoRepository, never()).save(any());
    }

    // U58
    @Test
    void busquedasDelegadasAlRepositorio() {
        ArrayList<Medico> porApellido = new ArrayList<>(List.of(medico(1, "Luis")));
        ArrayList<Medico> porNombre = new ArrayList<>(List.of(medico(2, "Rosa")));
        List<Medico> porEspecialidad = List.of(medico(3, "Ivan"));
        when(medicoRepository.findByApellidosContaining("Paz")).thenReturn(porApellido);
        when(medicoRepository.findByNombresContaining("Ro")).thenReturn(porNombre);
        when(medicoRepository.findByIdEspecialidad(2)).thenReturn(porEspecialidad);

        assertSame(porApellido, service.buscaPorApellido("Paz"));
        assertSame(porNombre, service.buscaporNombre("Ro"));
        assertSame(porEspecialidad, service.listarPorEspecialidad(2));
    }

    // U59
    @Test
    void getMedicosConEspecialidadConvierteCadaFilaEnDTO() {
        List<Object[]> filas = new ArrayList<>();
        filas.add(new Object[] { 1, "Luis", "Paz", "CMP1", "Cardiologia", "Corazon" });
        filas.add(new Object[] { 2, "Rosa", "Leon", "CMP2", "Pediatria", "Ninos" });
        when(medicoRepository.obtenerMedicosConEspecialidad()).thenReturn(filas);

        List<MedicoEspecialidadDTO> r = service.getMedicosConEspecialidad();

        assertEquals(2, r.size());
        MedicoEspecialidadDTO d = r.get(1);
        assertEquals(2, d.getId_medico());
        assertEquals("Rosa", d.getNombre_medico());
        assertEquals("Leon", d.getApellido_medico());
        assertEquals("CMP2", d.getCmp());
        assertEquals("Pediatria", d.getNombre_especialidad());
        assertEquals("Ninos", d.getDescripcion());
    }
}
