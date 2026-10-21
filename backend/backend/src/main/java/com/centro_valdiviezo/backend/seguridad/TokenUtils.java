package com.centro_valdiviezo.backend.seguridad;

import java.sql.Date;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

public class TokenUtils {
    private final static String ACCESS_TOKEN_SECRET = "4qhq8LrEBfYcaRHxhdb9zURb2rf8e7Ud";
    private final static Long ACCESS_TOKE_VALIDITY_SECONDS = 3_600L;

    // generar un token
    public static String generarToken(String nombre, String correo) {
        String res = "";
        long expirationTime = ACCESS_TOKE_VALIDITY_SECONDS * 1000;
        Date expirationDate = new Date(System.currentTimeMillis() + expirationTime);

        Map<String, Object> extra = new HashMap<>();
        extra.put("nombre", nombre);

        res = Jwts.builder().setSubject(correo).setExpiration(expirationDate).addClaims(extra)
                .signWith(Keys.hmacShaKeyFor(ACCESS_TOKEN_SECRET.getBytes()))
                .compact();

        return res;
    }

    // validar un token
    public static UsernamePasswordAuthenticationToken validarToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder().setSigningKey(ACCESS_TOKEN_SECRET.getBytes())
                    .build().parseClaimsJws(token).getBody();
            String correo = claims.getSubject();
            return new UsernamePasswordAuthenticationToken(
                    correo,
                    null,
                    Collections.singletonList(() -> "ROLE_USER"));

        } catch (Exception ex) {
            return null;
        }
    }

}
