package com.centro_valdiviezo.backend;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.jdbc.core.JdbcTemplate;

// RFC-012: integración con el servidor real (puerto aleatorio) y la BD real (necesita MySQL con
// database/BDPostaMedica.sql cargada, igual que contextLoads y U89).
//  - 10 POST /api/cita simultáneos al mismo horario -> 1 se guarda (200) y 9 reciben 409 sin texto SQL.
//  - Cancelar la cita libera el horario: un POST nuevo al mismo horario se guarda.
// Usa una fecha propia (2099-12-28) y borra sus citas antes y después.
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class CitaDobleReservaIntegracionTest {

    private static final String FECHA = "2099-12-28";
    private static final String MOTIVO = "RFC-012 integracion";

    @LocalServerPort
    private int puerto;

    @Autowired
    private JdbcTemplate jdbc;

    private final HttpClient http = HttpClient.newHttpClient();

    @BeforeEach
    @AfterEach
    void limpiar() {
        jdbc.update("DELETE FROM Cita WHERE fecha_cita = ? AND motivo LIKE ?", FECHA, MOTIVO + "%");
    }

    // RFC-011 (tarea 26): cada petición lleva el token de quien la hace (paciente que reserva, médico 1 que cambia el estado)
    @Autowired
    private com.centro_valdiviezo.backend.seguridad.TokenUtils tokenUtils;

    private HttpResponse<String> enviar(String metodo, String ruta, String token, String json) throws Exception {
        HttpRequest req = HttpRequest.newBuilder(URI.create("http://localhost:" + puerto + ruta))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + token)
                .method(metodo, HttpRequest.BodyPublishers.ofString(json))
                .build();
        return http.send(req, HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> enviar(String metodo, String ruta, String json) throws Exception {
        return enviar(metodo, ruta, tokenUtils.generarToken(1, "medico"), json);
    }

    private HttpResponse<String> reservar(int idPaciente, String hora, String motivo) throws Exception {
        return enviar("POST", "/api/cita", tokenUtils.generarToken(idPaciente, "paciente"), "{\"id_paciente\":" + idPaciente + ",\"id_medico\":1,\"fecha_cita\":\"" + FECHA
                + "\",\"hora_cita\":\"" + hora + "\",\"motivo\":\"" + MOTIVO + " " + motivo + "\",\"estado_cita\":1}");
    }

    private int citas(String hora) {
        return jdbc.queryForObject("SELECT COUNT(*) FROM Cita WHERE id_medico = 1 AND fecha_cita = ? AND hora_cita = ?",
                Integer.class, FECHA, hora);
    }

    @Test
    void diezReservasSimultaneasAlMismoHorarioGuardanSoloUna() throws Exception {
        int n = 10;
        ExecutorService pool = Executors.newFixedThreadPool(n);
        CountDownLatch salida = new CountDownLatch(1);
        List<Future<HttpResponse<String>>> futuros = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            int idPaciente = 1 + (i % 5);
            int k = i;
            futuros.add(pool.submit(() -> {
                salida.await(); // todas salen a la vez
                return reservar(idPaciente, "10:00:00", "concurrencia " + k);
            }));
        }
        salida.countDown();
        int ok = 0, conflicto = 0;
        for (Future<HttpResponse<String>> f : futuros) {
            HttpResponse<String> r = f.get();
            if (r.statusCode() == 200) ok++;
            if (r.statusCode() == 409) {
                conflicto++;
                assertTrue(r.body().contains("Ese horario ya fue reservado. Elija otra hora."), r.body());
                String cuerpo = r.body().toLowerCase();
                assertFalse(cuerpo.contains("duplicate") || cuerpo.contains("sql") || cuerpo.contains("uq_cita"), r.body());
            }
        }
        pool.shutdown();

        assertEquals(1, ok);
        assertEquals(n - 1, conflicto);
        assertEquals(1, citas("10:00:00"));
    }

    @Test
    void cancelarUnaCitaLiberaElHorario() throws Exception {
        HttpResponse<String> primera = reservar(1, "10:20:00", "original");
        assertEquals(200, primera.statusCode());
        Matcher m = Pattern.compile("\"idCita\":(\\d+)").matcher(primera.body());
        assertTrue(m.find(), primera.body());
        String idCita = m.group(1);

        assertEquals(409, reservar(2, "10:20:00", "antes de cancelar").statusCode());

        HttpResponse<String> cancelar = enviar("PUT", "/api/citas/medico/1/" + idCita + "/estado", "{\"estado\":\"Cancelada\"}");
        assertEquals(200, cancelar.statusCode(), cancelar.body());

        assertEquals(200, reservar(2, "10:20:00", "despues de cancelar").statusCode());
        assertEquals(2, citas("10:20:00"));
        // Volver a activar la cancelada choca con la nueva
        assertEquals(409, enviar("PUT", "/api/citas/medico/1/" + idCita + "/estado", "{\"estado\":\"Pendiente\"}").statusCode());
    }
}
