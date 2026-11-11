package com.centro_valdiviezo.backend.seguridad;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

// RFC-016 (P5): los orígenes CORS salen de la propiedad app.cors.allowed-origins (variable CORS_ORIGINS)
class WebSecurityConfigCorsTest {

    private CorsConfiguration configuracionPara(String... origenes) {
        WebSecurityConfig config = new WebSecurityConfig(null, null);
        CorsConfigurationSource fuente = config.corsConfigurationSource(origenes);
        return fuente.getCorsConfiguration(new MockHttpServletRequest("GET", "/api/especialidad"));
    }

    @Test
    void conElValorPorDefectoSoloAceptaLocalhost4200ComoAntes() {
        CorsConfiguration cors = configuracionPara("http://localhost:4200");

        assertEquals(List.of("http://localhost:4200"), cors.getAllowedOrigins());
        assertEquals("http://localhost:4200", cors.checkOrigin("http://localhost:4200"));
        assertEquals(null, cors.checkOrigin("http://otro-origen.example"));
        assertEquals(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"), cors.getAllowedMethods());
        assertEquals(List.of("Authorization", "Content-Type"), cors.getAllowedHeaders());
        assertTrue(cors.getAllowCredentials());
    }

    @Test
    void aceptaVariosOrigenesSeparadosPorComas() {
        CorsConfiguration cors = configuracionPara("http://localhost:4200", "https://posta.example.app");

        assertEquals("https://posta.example.app", cors.checkOrigin("https://posta.example.app"));
        assertEquals("http://localhost:4200", cors.checkOrigin("http://localhost:4200"));
        assertEquals(null, cors.checkOrigin("http://otro-origen.example"));
    }
}
