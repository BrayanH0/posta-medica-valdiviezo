package com.centro_valdiviezo.backend.model;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class EspecialidadTest {

    @Test
    public void testEspecialidadPrice() {
        Especialidad especialidad = new Especialidad();
        especialidad.setPrecio(100.0);
        assertEquals(100.0, especialidad.getPrecio());
    }

    @Test
    public void testEspecialidadAttributes() {
        Especialidad e = new Especialidad();
        e.setNombre_especialidad("Cardio");
        e.setDescripcion("Desc");

        assertEquals("Cardio", e.getNombre_especialidad());
        assertEquals("Desc", e.getDescripcion());
    }
}
