package com.centro_valdiviezo.backend;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

// U108 y U109 (RFC-020, H-005, P04): GET /api/medico/resumenMedico con el contexto completo de Spring y la BD real
// (necesita MySQL con database/BDPostaMedica.sql cargada, igual que U89, U91 y U94). Antes de RFC-020 respondía 500
// ("Cannot instantiate query result type ...ResumenMedico... exactly 2 parameters") porque ResumenMedico no tenía
// un constructor de 2 parámetros.
//  - U108: responde 200 y cada fila trae la cantidad de médicos por especialidad que hay en la BD.
//  - U109: un médico sin especialidad (id_especialidad NULL) no vuelve a provocar el error: responde 200 y esa fila trae
//    id_especialidad null. El médico se inserta dentro de una transacción de la prueba que se deshace al terminar, así que
//    la BD no queda con datos de más (solo avanza el contador AUTO_INCREMENT de la tabla, que no se revierte).
@SpringBootTest
@AutoConfigureMockMvc
class ResumenMedicoIntegracionTest {

    private static final String CLAVE = "123456";
    private static final String DNI_ADMIN = "87654321";
    private static final String RUTA = "/api/medico/resumenMedico";

    @Autowired
    private MockMvc mvc;

    @Autowired
    private JdbcTemplate jdbc;

    private final ObjectMapper json = new ObjectMapper();

    private String tokenAdmin() throws Exception {
        String cuerpo = mvc.perform(post("/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"dni\":\"" + DNI_ADMIN + "\",\"clave\":\"" + CLAVE + "\"}"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        return json.readTree(cuerpo).get("token").asText();
    }

    private JsonNode resumen() throws Exception {
        String cuerpo = mvc.perform(get(RUTA).header("Authorization", "Bearer " + tokenAdmin()))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        JsonNode filas = json.readTree(cuerpo);
        assertTrue(filas.isArray(), "se esperaba una lista: " + cuerpo);
        return filas;
    }

    @Test
    void elResumenDeMedicosPorEspecialidadResponde200ConLosConteosDeLaBd() throws Exception {
        JsonNode filas = resumen();
        assertTrue(filas.size() > 0, "la BD de prueba tiene médicos con especialidad");

        Map<Integer, Long> esperado = new HashMap<>();
        for (Map<String, Object> fila : jdbc.queryForList(
                "select id_especialidad, count(*) as cantidad from medico where id_especialidad is not null group by id_especialidad")) {
            esperado.put(((Number) fila.get("id_especialidad")).intValue(), ((Number) fila.get("cantidad")).longValue());
        }

        Map<Integer, Long> recibido = new HashMap<>();
        for (JsonNode f : filas) {
            assertFalse(f.get("id_especialidad").isNull(), "en la BD de prueba todos los médicos tienen especialidad");
            recibido.put(f.get("id_especialidad").asInt(), f.get("cantidad_medicos").asLong());
        }
        assertEquals(esperado, recibido);
    }

    @Test
    @Transactional
    void unMedicoSinEspecialidadNoProvocaElError() throws Exception {
        // La transacción de la prueba se deshace al terminar: este médico nunca queda en la BD
        jdbc.update("insert into medico (nombres, apellidos, cmp, dni, clave, id_especialidad) values (?, ?, ?, ?, ?, null)",
                "Prueba", "SinEspecialidad", "CMP-RFC020", "00000020", "sin-clave");
        Integer antes = jdbc.queryForObject("select count(*) from medico where id_especialidad is null", Integer.class);
        assertEquals(1, antes, "dentro de la transacción hay un médico sin especialidad");

        JsonNode filas = resumen();

        JsonNode sinEspecialidad = null;
        int conEspecialidad = 0;
        for (JsonNode f : filas) {
            if (f.get("id_especialidad").isNull()) {
                sinEspecialidad = f;
            } else {
                conEspecialidad++;
            }
        }
        assertNotNull(sinEspecialidad, "debe aparecer la fila de los médicos sin especialidad: " + filas);
        assertEquals(1, sinEspecialidad.get("cantidad_medicos").asLong());
        assertTrue(conEspecialidad > 0, "las filas con especialidad siguen apareciendo");
    }
}
