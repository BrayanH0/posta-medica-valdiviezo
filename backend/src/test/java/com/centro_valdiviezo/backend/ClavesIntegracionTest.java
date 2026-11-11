package com.centro_valdiviezo.backend;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

// U89 (RFC-010, LB-10): integración con el contexto completo de Spring y la BD real (necesita MySQL
// con database/BDPostaMedica.sql cargada, igual que contextLoads). Comprueba:
//  - el PasswordEncoder que recibe la aplicación es BCrypt (PasswordConfig, @Primary);
//  - las claves de las 3 tablas están en hash BCrypt;
//  - POST /login con las credenciales de prueba de docs/PRUEBAS.md da 200 en los 3 roles y 401 con otra clave;
//  - los listados GET /api/paciente, /api/medico y /usuarios no traen "clave".
@SpringBootTest
@AutoConfigureMockMvc
class ClavesIntegracionTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private static String cuerpoLogin(String dni, String clave) {
        return "{\"dni\":\"" + dni + "\",\"clave\":\"" + clave + "\"}";
    }

    @Test
    void elEncoderInyectadoEsBCrypt() {
        assertInstanceOf(BCryptPasswordEncoder.class, passwordEncoder);
    }

    @Test
    void lasClavesDeLaBdEstanEnHashBCrypt() {
        for (String tabla : List.of("Paciente", "medico", "Administrador")) {
            Integer total = jdbc.queryForObject("SELECT COUNT(*) FROM " + tabla, Integer.class);
            Integer conHash = jdbc.queryForObject(
                    "SELECT COUNT(*) FROM " + tabla + " WHERE clave REGEXP '^[$]2[aby][$][0-9]{2}[$].{53}$'", Integer.class);
            assertTrue(total > 0, tabla);
            assertEquals(total, conHash, tabla);
        }
    }

    @Test
    void loginConLasCredencialesDePruebaFuncionaEnLosTresRoles() throws Exception {
        for (String dni : List.of("12345678", "10000001", "87654321")) {
            mvc.perform(post("/login").contentType(MediaType.APPLICATION_JSON).content(cuerpoLogin(dni, "123456")))
                    .andExpect(status().isOk());
            mvc.perform(post("/login").contentType(MediaType.APPLICATION_JSON).content(cuerpoLogin(dni, "malaclave")))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Test
    void losListadosNoDevuelvenLaClave() throws Exception {
        for (String ruta : List.of("/api/paciente", "/api/medico", "/usuarios", "/api/paciente/codigo/1",
                "/api/medico/codigo/1")) {
            String cuerpo = mvc.perform(get(ruta)).andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
            assertFalse(cuerpo.contains("\"clave\""), ruta);
            assertFalse(cuerpo.contains("$2a$"), ruta);
        }
    }
}
