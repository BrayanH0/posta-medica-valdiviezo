package com.centro_valdiviezo.backend;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import com.centro_valdiviezo.backend.seguridad.TokenUtils;
import com.centro_valdiviezo.backend.seguridad.TokensDePrueba;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

// U94 (RFC-011, tarea 26): autenticación y autorización con el contexto completo de Spring y la BD real
// (necesita MySQL con database/BDPostaMedica.sql cargada, igual que U89 y U91).
// Login de los 3 roles, 401 sin token / token inválido / vencido, 403 por rol, 403 por propietario (IDOR),
// listados filtrados por el token, respuesta reducida de /fecha para el paciente, alta pública sin
// mass assignment (AUD-SEG-04) y H-048 (AuthenticationManager con BCrypt, sin NoOpPasswordEncoder).
@SpringBootTest
@AutoConfigureMockMvc
class SeguridadApiIntegracionTest {

    private static final String CLAVE = "123456";
    private static final String DNI_PACIENTE = "12345678";
    private static final String DNI_MEDICO = "10000001";
    private static final String DNI_ADMIN = "87654321";

    @Autowired
    private MockMvc mvc;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private TokenUtils tokenUtils;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private ApplicationContext contexto;

    private final ObjectMapper json = new ObjectMapper();

    private JsonNode login(String dni) throws Exception {
        String cuerpo = mvc.perform(post("/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"dni\":\"" + dni + "\",\"clave\":\"" + CLAVE + "\"}"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        return json.readTree(cuerpo);
    }

    private String token(String dni) throws Exception {
        return login(dni).get("token").asText();
    }

    private static MockHttpServletRequestBuilder con(MockHttpServletRequestBuilder req, String token) {
        return req.header("Authorization", "Bearer " + token);
    }

    private JsonNode cuerpo(MockHttpServletRequestBuilder req) throws Exception {
        return json.readTree(mvc.perform(req).andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
    }

    // --- Login de los 3 roles ---

    @Test
    void elLoginDeLosTresRolesDevuelveUnTokenConSuIdYSuRol() throws Exception {
        for (String dni : List.of(DNI_PACIENTE, DNI_MEDICO, DNI_ADMIN)) {
            JsonNode r = login(dni);
            assertTrue(r.hasNonNull("token"), dni);
            var usuario = tokenUtils.validarToken(r.get("token").asText()).orElseThrow();
            assertEquals(r.get("id").asInt(), usuario.id(), dni);
            assertEquals(r.get("tipo").asText(), usuario.rol(), dni);
        }
    }

    @Test
    void elLoginFallidoNoDevuelveToken() throws Exception {
        String r = mvc.perform(post("/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"dni\":\"" + DNI_PACIENTE + "\",\"clave\":\"malaclave\"}"))
                .andExpect(status().isUnauthorized()).andReturn().getResponse().getContentAsString();
        assertFalse(r.contains("token"));
    }

    // --- 401 ---

    private static List<MockHttpServletRequestBuilder> protegidos() {
        return List.of(get("/api/cita"), get("/api/cita/1"), get("/api/historia_clinica"), get("/api/historia_clinica/1"),
                get("/api/evolucion_clinica"), get("/api/paciente"), get("/api/paciente/codigo/1"), get("/api/medico"),
                get("/api/medico/codigo/1"), get("/usuarios"), get("/api/reportes/dashboard"), get("/api/cie"),
                get("/api/citas/medico/1?estado=Pendiente"), get("/api/citas/medico/1/pacientes"),
                get("/api/citas/medico/1/fecha/2023-07-01"), get("/api/disponibilidad_medico/medico/1"),
                post("/api/cita").contentType(MediaType.APPLICATION_JSON).content("{}"),
                delete("/api/cita/999999"), put("/api/cita/999999").contentType(MediaType.APPLICATION_JSON).content("{}"),
                post("/usuarios/nuevo").contentType(MediaType.APPLICATION_JSON).content("{}"),
                put("/api/citas/medico/1/1/estado").contentType(MediaType.APPLICATION_JSON).content("{\"estado\":\"Cancelada\"}"));
    }

    @Test
    void sinTokenRespondeA401() throws Exception {
        for (MockHttpServletRequestBuilder req : protegidos()) {
            mvc.perform(req).andExpect(status().isUnauthorized())
                    .andExpect(content().json("{\"error\":\"Debe iniciar sesión\"}"));
        }
    }

    @Test
    void conTokenInvalidoRespondeA401() throws Exception {
        for (MockHttpServletRequestBuilder req : protegidos()) {
            mvc.perform(con(req, "esto-no-es-un-token")).andExpect(status().isUnauthorized());
        }
    }

    @Test
    void conTokenVencidoRespondeA401() throws Exception {
        String vencido = Jwts.builder().setSubject("1").claim("rol", "administrador")
                .setExpiration(new Date(System.currentTimeMillis() - 1000))
                .signWith(Keys.hmacShaKeyFor(TokensDePrueba.secreto().getBytes(StandardCharsets.UTF_8))).compact();
        for (MockHttpServletRequestBuilder req : protegidos()) {
            mvc.perform(con(req, vencido)).andExpect(status().isUnauthorized());
        }
    }

    @Test
    void losEndpointsPublicosNoPidenToken() throws Exception {
        mvc.perform(get("/api/especialidad")).andExpect(status().isOk());
        mvc.perform(get("/api/especialidad/1")).andExpect(status().isOk());
    }

    // --- 403 por rol ---

    @Test
    void conElRolEquivocadoRespondeA403() throws Exception {
        String paciente = token(DNI_PACIENTE);
        String medico = token(DNI_MEDICO);
        String admin = token(DNI_ADMIN);
        Map<String, List<MockHttpServletRequestBuilder>> casos = Map.of(
                paciente, List.of(get("/api/paciente"), get("/usuarios"), get("/api/reportes/dashboard"),
                        get("/api/cita/porEstado"), get("/api/medico"), get("/api/citas/medico/1/pacientes"),
                        put("/api/cita/1").contentType(MediaType.APPLICATION_JSON).content("{}"),
                        post("/usuarios/nuevo").contentType(MediaType.APPLICATION_JSON).content("{}")),
                medico, List.of(get("/api/historia_clinica"), get("/api/evolucion_clinica"), get("/api/paciente"),
                        get("/usuarios"), get("/api/reportes/resumen"),
                        post("/api/cita").contentType(MediaType.APPLICATION_JSON).content("{}")),
                admin, List.of(get("/api/historia_clinica"), get("/api/evolucion_clinica/1"),
                        get("/api/citas/medico/1?estado=Pendiente"),
                        post("/api/cita").contentType(MediaType.APPLICATION_JSON).content("{}")));
        for (var caso : casos.entrySet()) {
            for (MockHttpServletRequestBuilder req : caso.getValue()) {
                mvc.perform(con(req, caso.getKey())).andExpect(status().isForbidden())
                        .andExpect(content().json("{\"error\":\"No tiene permiso para este recurso\"}"));
            }
        }
    }

    // --- 403 por propietario (IDOR) ---

    @Test
    void unPacienteNoAccedeALoDeOtroPaciente() throws Exception {
        JsonNode sesion = login(DNI_PACIENTE);
        int yo = sesion.get("id").asInt();
        String t = sesion.get("token").asText();
        Integer citaAjena = jdbc.queryForObject("SELECT MIN(idCita) FROM Cita WHERE id_paciente <> ?", Integer.class, yo);
        Integer historiaAjena = jdbc.queryForObject(
                "SELECT MIN(idhistoria_Clinica) FROM Historia_Clinica WHERE id_paciente <> ?", Integer.class, yo);
        Integer evolucionAjena = jdbc.queryForObject("SELECT MIN(e.idEvolucion_Clinica) FROM Evolucion_Clinica e "
                + "JOIN Historia_Clinica h ON e.id_historia = h.idhistoria_Clinica WHERE h.id_paciente <> ?", Integer.class, yo);
        Integer otroPaciente = jdbc.queryForObject("SELECT MIN(idPaciente) FROM Paciente WHERE idPaciente <> ?", Integer.class, yo);

        mvc.perform(con(get("/api/cita/" + citaAjena), t)).andExpect(status().isForbidden());
        mvc.perform(con(get("/api/historia_clinica/" + historiaAjena), t)).andExpect(status().isForbidden());
        mvc.perform(con(get("/api/evolucion_clinica/" + evolucionAjena), t)).andExpect(status().isForbidden());
        mvc.perform(con(get("/api/paciente/codigo/" + otroPaciente), t)).andExpect(status().isForbidden());
        mvc.perform(con(get("/api/paciente/codigo/" + yo), t)).andExpect(status().isOk());

        // Borrar una cita ajena: 403 y la cita sigue en la BD
        mvc.perform(con(delete("/api/cita/" + citaAjena), t)).andExpect(status().isForbidden());
        assertEquals(1, jdbc.queryForObject("SELECT COUNT(*) FROM Cita WHERE idCita = ?", Integer.class, citaAjena));

        // Reservar a nombre de otro paciente: 403 y no se guarda
        int antes = jdbc.queryForObject("SELECT COUNT(*) FROM Cita", Integer.class);
        mvc.perform(con(post("/api/cita").contentType(MediaType.APPLICATION_JSON).content("{\"id_paciente\":" + otroPaciente
                + ",\"id_medico\":1,\"fecha_cita\":\"2099-12-27\",\"hora_cita\":\"08:00:00\",\"motivo\":\"U94 ajena\",\"estado_cita\":1}"), t))
                .andExpect(status().isForbidden());
        assertEquals(antes, jdbc.queryForObject("SELECT COUNT(*) FROM Cita", Integer.class));
    }

    @Test
    void unMedicoNoAccedeALoDeOtroMedico() throws Exception {
        JsonNode sesion = login(DNI_MEDICO);
        int yo = sesion.get("id").asInt();
        String t = sesion.get("token").asText();
        Integer otroMedico = jdbc.queryForObject("SELECT MIN(id_medico) FROM Medico WHERE id_medico <> ?", Integer.class, yo);
        Integer citaAjena = jdbc.queryForObject("SELECT MIN(idCita) FROM Cita WHERE id_medico <> ?", Integer.class, yo);

        mvc.perform(con(get("/api/citas/medico/" + otroMedico + "?estado=Atendida"), t)).andExpect(status().isForbidden());
        mvc.perform(con(get("/api/citas/medico/" + otroMedico + "/pacientes"), t)).andExpect(status().isForbidden());
        mvc.perform(con(get("/api/citas/medico/" + otroMedico + "/fecha/2023-07-01"), t)).andExpect(status().isForbidden());
        mvc.perform(con(put("/api/citas/medico/" + otroMedico + "/" + citaAjena + "/estado")
                .contentType(MediaType.APPLICATION_JSON).content("{\"estado\":\"Cancelada\"}"), t)).andExpect(status().isForbidden());
        mvc.perform(con(get("/api/cita/" + citaAjena), t)).andExpect(status().isForbidden());
        mvc.perform(con(get("/api/citas/medico/" + yo + "?estado=Atendida"), t)).andExpect(status().isOk());
    }

    // --- Listados filtrados por el token (H-013) ---

    @Test
    void losListadosDelPacienteTraenSoloLoSuyo() throws Exception {
        JsonNode sesion = login(DNI_PACIENTE);
        int yo = sesion.get("id").asInt();
        String t = sesion.get("token").asText();

        JsonNode citas = cuerpo(con(get("/api/cita"), t));
        assertEquals(jdbc.queryForObject("SELECT COUNT(*) FROM Cita WHERE id_paciente = ?", Integer.class, yo), citas.size());
        citas.forEach(c -> assertEquals(yo, c.get("id_paciente").asInt()));

        JsonNode historias = cuerpo(con(get("/api/historia_clinica"), t));
        assertEquals(jdbc.queryForObject("SELECT COUNT(*) FROM Historia_Clinica WHERE id_paciente = ?", Integer.class, yo),
                historias.size());
        historias.forEach(h -> assertEquals(yo, h.get("id_paciente").asInt()));

        Set<Integer> misHistorias = new HashSet<>(jdbc.queryForList(
                "SELECT idhistoria_Clinica FROM Historia_Clinica WHERE id_paciente = ?", Integer.class, yo));
        JsonNode evoluciones = cuerpo(con(get("/api/evolucion_clinica"), t));
        evoluciones.forEach(e -> assertTrue(misHistorias.contains(e.get("id_historia").asInt())));
    }

    @Test
    void elMedicoRecibeSoloSusCitasYElAdminTodas() throws Exception {
        JsonNode sesion = login(DNI_MEDICO);
        int yo = sesion.get("id").asInt();
        JsonNode delMedico = cuerpo(con(get("/api/cita"), sesion.get("token").asText()));
        delMedico.forEach(c -> assertEquals(yo, c.get("id_medico").asInt()));
        assertEquals(jdbc.queryForObject("SELECT COUNT(*) FROM Cita WHERE id_medico = ?", Integer.class, yo), delMedico.size());

        JsonNode todas = cuerpo(con(get("/api/cita"), token(DNI_ADMIN)));
        assertEquals(jdbc.queryForObject("SELECT COUNT(*) FROM Cita", Integer.class), todas.size());
    }

    // --- /fecha/{f}: el paciente recibe solo hora y estado (cambio de la tabla aprobada) ---

    @Test
    void elPacienteRecibeSoloHoraYEstadoDeLasCitasDeUnMedico() throws Exception {
        JsonNode sesion = login(DNI_PACIENTE);
        // Un día con citas de otro paciente: es el caso en que antes se filtraban sus datos (AUD-PRI-04)
        Map<String, Object> fila = jdbc.queryForMap("SELECT id_medico, fecha_cita FROM Cita WHERE id_paciente <> ? "
                + "ORDER BY idCita LIMIT 1", sesion.get("id").asInt());
        String ruta = "/api/citas/medico/" + fila.get("id_medico") + "/fecha/" + fila.get("fecha_cita");

        JsonNode paraPaciente = cuerpo(con(get(ruta), sesion.get("token").asText()));
        assertTrue(paraPaciente.size() > 0);
        paraPaciente.forEach(c -> {
            Set<String> campos = new HashSet<>();
            c.fieldNames().forEachRemaining(campos::add);
            assertEquals(Set.of("hora_cita", "estado_cita"), campos);
        });

        // El médico dueño recibe la respuesta de siempre (con motivo e id_paciente)
        int idMedico = ((Number) fila.get("id_medico")).intValue();
        String tokenMedico = tokenUtils.generarToken(idMedico, "medico");
        JsonNode paraMedico = cuerpo(con(get(ruta), tokenMedico));
        assertEquals(paraPaciente.size(), paraMedico.size());
        paraMedico.forEach(c -> {
            assertTrue(c.has("motivo"));
            assertTrue(c.has("id_paciente"));
            assertTrue(c.has("idCita"));
        });
    }

    // --- D3 / AUD-SEG-04: el alta pública ignora el idPaciente ---

    @Test
    void elAltaPublicaIgnoraElIdPacienteYNoSobrescribeOtraCuenta() throws Exception {
        Map<String, Object> existente = jdbc.queryForMap("SELECT idPaciente, clave, nombres FROM Paciente ORDER BY idPaciente LIMIT 1");
        Integer idExistente = (Integer) existente.get("idPaciente");
        String dniNuevo = "9" + String.format("%07d", System.currentTimeMillis() % 10_000_000);
        try {
            String r = mvc.perform(post("/api/paciente/crear").contentType(MediaType.APPLICATION_JSON)
                    .content("{\"idPaciente\":" + idExistente + ",\"nombres\":\"U94\",\"apellidos\":\"Alta publica\",\"dni\":\""
                            + dniNuevo + "\",\"clave\":\"clave-u94\",\"fecha_nacimiento\":\"2000-01-01\",\"sexo\":\"M\"}"))
                    .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
            int idCreado = json.readTree(r).get("idPaciente").asInt();
            assertNotEquals(idExistente.intValue(), idCreado);
            Map<String, Object> despues = jdbc.queryForMap("SELECT clave, nombres FROM Paciente WHERE idPaciente = ?", idExistente);
            assertEquals(existente.get("clave"), despues.get("clave"));
            assertEquals(existente.get("nombres"), despues.get("nombres"));
        } finally {
            jdbc.update("DELETE FROM Paciente WHERE dni = ?", dniNuevo);
        }
    }

    // --- H-048 ---

    @Test
    void elAuthenticationManagerCompruebaContraElHashBCrypt() {
        assertNotNull(authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(DNI_ADMIN, CLAVE)));
        assertThrows(BadCredentialsException.class,
                () -> authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(DNI_ADMIN, "malaclave")));
    }

    @Test
    void elUnicoPasswordEncoderEsBCrypt() {
        Map<String, PasswordEncoder> encoders = contexto.getBeansOfType(PasswordEncoder.class);
        assertEquals(1, encoders.size(), encoders.keySet().toString());
        assertInstanceOf(BCryptPasswordEncoder.class, encoders.values().iterator().next());
    }
}
