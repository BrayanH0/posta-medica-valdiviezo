package com.centro_valdiviezo.backend.model;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.ObjectMapper;

// U86 (RFC-010, LB-10): @JsonProperty(WRITE_ONLY) en clave. Al serializar Paciente, Medico y
// UsuarioModel el JSON no trae "clave"; al deserializar (registro, alta) la clave sí se acepta.
class ClaveNoSeSerializaTest {

    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    void pacienteNoSerializaLaClaveYLaAceptaAlLeer() throws Exception {
        Paciente p = new Paciente();
        p.setIdPaciente(1);
        p.setDni("71112222");
        p.setClave("hash-de-prueba");

        String json = mapper.writeValueAsString(p);

        assertFalse(json.contains("clave"), json);
        assertFalse(json.contains("hash-de-prueba"), json);
        assertTrue(json.contains("\"dni\":\"71112222\""), json);
        Paciente leido = mapper.readValue("{\"dni\":\"71112222\",\"clave\":\"nueva\"}", Paciente.class);
        assertEquals("nueva", leido.getClave());
    }

    @Test
    void medicoNoSerializaLaClaveYLaAceptaAlLeer() throws Exception {
        Medico m = new Medico();
        m.setId_medico(1);
        m.setCmp("CMP000");
        m.setClave("hash-de-prueba");

        String json = mapper.writeValueAsString(m);

        assertFalse(json.contains("clave"), json);
        assertFalse(json.contains("hash-de-prueba"), json);
        assertTrue(json.contains("\"cmp\":\"CMP000\""), json);
        assertEquals("nueva", mapper.readValue("{\"clave\":\"nueva\"}", Medico.class).getClave());
    }

    @Test
    void usuarioNoSerializaLaClaveYLaAceptaAlLeer() throws Exception {
        UsuarioModel u = new UsuarioModel();
        u.setId(1);
        u.setRol("ADMIN");
        u.setClave("hash-de-prueba");

        String json = mapper.writeValueAsString(u);

        assertFalse(json.contains("clave"), json);
        assertFalse(json.contains("hash-de-prueba"), json);
        assertTrue(json.contains("\"rol\":\"ADMIN\""), json);
        assertEquals("nueva", mapper.readValue("{\"clave\":\"nueva\"}", UsuarioModel.class).getClave());
    }
}
