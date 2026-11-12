package com.centro_valdiviezo.backend.seguridad;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Optional;

import org.junit.jupiter.api.Test;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

// U93 (RFC-011, tarea 26): emisión y validación del JWT, sin Spring ni BD.
class TokenUtilsTest {

    private final TokenUtils tokenUtils = TokensDePrueba.tokenUtils();

    private static String tokenFirmado(String secreto, String sujeto, String rol, long expiraEnMs) {
        return Jwts.builder().setSubject(sujeto).claim("rol", rol)
                .setExpiration(new Date(System.currentTimeMillis() + expiraEnMs))
                .signWith(Keys.hmacShaKeyFor(secreto.getBytes(StandardCharsets.UTF_8)))
                .compact();
    }

    @Test
    void elTokenLlevaElIdYElRolYVenceALasDosHoras() {
        String token = tokenUtils.generarToken(7, "medico");

        assertEquals(Optional.of(new UsuarioAutenticado(7, "medico")), tokenUtils.validarToken(token));
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(TokensDePrueba.secreto().getBytes(StandardCharsets.UTF_8)).build()
                .parseClaimsJws(token).getBody();
        assertEquals(2 * 60 * 60 * 1000L, claims.getExpiration().getTime() - claims.getIssuedAt().getTime());
    }

    @Test
    void unTokenVencidoNoEsValido() {
        String vencido = tokenFirmado(TokensDePrueba.secreto(), "1", "paciente", -1000);
        assertTrue(tokenUtils.validarToken(vencido).isEmpty());
    }

    @Test
    void unTokenFirmadoConOtraClaveNoEsValido() {
        String ajeno = tokenFirmado("otra-clave-distinta-de-la-del-servidor-1234567890", "1", "administrador", 60_000);
        assertTrue(tokenUtils.validarToken(ajeno).isEmpty());
    }

    @Test
    void unTokenManipuladoNoEsValido() {
        String token = tokenUtils.generarToken(1, "paciente");
        String[] partes = token.split("\\.");
        // Se cambia el contenido (rol administrador) y se conserva la firma original
        String contenido = java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(
                "{\"sub\":\"1\",\"rol\":\"administrador\"}".getBytes(StandardCharsets.UTF_8));
        assertTrue(tokenUtils.validarToken(partes[0] + "." + contenido + "." + partes[2]).isEmpty());
    }

    @Test
    void basuraOTokenSinRolNoSonValidos() {
        assertTrue(tokenUtils.validarToken("no-es-un-token").isEmpty());
        assertTrue(tokenUtils.validarToken("").isEmpty());
        String sinRol = Jwts.builder().setSubject("1").setExpiration(new Date(System.currentTimeMillis() + 60_000))
                .signWith(Keys.hmacShaKeyFor(TokensDePrueba.secreto().getBytes(StandardCharsets.UTF_8))).compact();
        assertTrue(tokenUtils.validarToken(sinRol).isEmpty());
    }

    @Test
    void unSecretoCortoOAusenteNoArranca() {
        assertThrows(IllegalStateException.class, () -> new TokenUtils("corto"));
        assertThrows(IllegalStateException.class, () -> new TokenUtils(null));
    }

    @Test
    void laAutenticacionLlevaElRolComoAutoridad() {
        var a = TokenUtils.autenticacion(new UsuarioAutenticado(3, "administrador"));
        assertEquals("ROLE_ADMINISTRADOR", a.getAuthorities().iterator().next().getAuthority());
        assertEquals(new UsuarioAutenticado(3, "administrador"), a.getPrincipal());
    }
}
