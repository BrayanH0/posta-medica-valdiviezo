package com.centro_valdiviezo.backend.seguridad;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.util.Properties;

// RFC-011 (tarea 26): TokenUtils con el secreto solo de prueba de src/test/resources/config/application.properties,
// para las pruebas que crean AuthController sin el contexto de Spring.
public final class TokensDePrueba {

    private TokensDePrueba() {
    }

    public static String secreto() {
        try (InputStream in = TokensDePrueba.class.getResourceAsStream("/config/application.properties")) {
            Properties p = new Properties();
            p.load(in);
            return p.getProperty("app.jwt.secret");
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    public static TokenUtils tokenUtils() {
        return new TokenUtils(secreto());
    }
}
