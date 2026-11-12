package com.centro_valdiviezo.backend.seguridad;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

// Emite y valida los JWT de la API (RFC-011). El secreto llega de la variable de entorno JWT_SECRET
// (propiedad app.jwt.secret, sin valor por defecto): ya no está escrito en el código (H-025).
@Component
public class TokenUtils {

    // RFC-011 (tarea 26): el token vence a las 2 horas
    public static final long VALIDEZ_SEGUNDOS = 2 * 60 * 60L;
    // HS256 necesita una clave de al menos 256 bits
    static final int LARGO_MINIMO_SECRETO = 32;
    static final String CLAIM_ROL = "rol";

    private final SecretKey clave;

    public TokenUtils(@Value("${app.jwt.secret}") String secreto) {
        if (secreto == null || secreto.getBytes(StandardCharsets.UTF_8).length < LARGO_MINIMO_SECRETO) {
            throw new IllegalStateException(
                    "JWT_SECRET debe tener al menos " + LARGO_MINIMO_SECRETO + " bytes");
        }
        this.clave = Keys.hmacShaKeyFor(secreto.getBytes(StandardCharsets.UTF_8));
    }

    // El sujeto es el id del usuario en su tabla; el rol es el "tipo" de la respuesta de /login
    public String generarToken(Integer id, String rol) {
        long ahora = System.currentTimeMillis();
        return Jwts.builder()
                .setSubject(String.valueOf(id))
                .claim(CLAIM_ROL, rol)
                .setIssuedAt(new Date(ahora))
                .setExpiration(new Date(ahora + VALIDEZ_SEGUNDOS * 1000))
                .signWith(clave)
                .compact();
    }

    // Vacío si el token no tiene la firma correcta, está vencido o le faltan el id o el rol
    public Optional<UsuarioAutenticado> validarToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder().setSigningKey(clave).build().parseClaimsJws(token).getBody();
            String rol = claims.get(CLAIM_ROL, String.class);
            if (claims.getSubject() == null || rol == null) {
                return Optional.empty();
            }
            return Optional.of(new UsuarioAutenticado(Integer.valueOf(claims.getSubject()), rol));
        } catch (JwtException | IllegalArgumentException e) {
            return Optional.empty();
        }
    }

    public static UsernamePasswordAuthenticationToken autenticacion(UsuarioAutenticado usuario) {
        return new UsernamePasswordAuthenticationToken(usuario, null,
                List.of(new SimpleGrantedAuthority("ROLE_" + usuario.rol().toUpperCase())));
    }
}
