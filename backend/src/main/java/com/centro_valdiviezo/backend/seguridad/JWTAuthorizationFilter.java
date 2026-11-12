package com.centro_valdiviezo.backend.seguridad;

import java.io.IOException;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

// Lee "Authorization: Bearer <token>" y, si el token es válido, deja al usuario en el contexto de seguridad.
// Si falta o no es válido, la petición sigue sin usuario y las reglas de WebSecurityConfig responden 401.
// No es un @Component: se crea en WebSecurityConfig para que corra solo dentro de la cadena de Spring Security
// (como bean, Spring Boot lo registraría además como filtro de servlet).
public class JWTAuthorizationFilter extends OncePerRequestFilter {

    private static final String PREFIJO = "Bearer ";

    private final TokenUtils tokenUtils;

    public JWTAuthorizationFilter(TokenUtils tokenUtils) {
        this.tokenUtils = tokenUtils;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String cabecera = request.getHeader("Authorization");
        if (cabecera != null && cabecera.startsWith(PREFIJO)) {
            tokenUtils.validarToken(cabecera.substring(PREFIJO.length()))
                    .ifPresent(u -> SecurityContextHolder.getContext().setAuthentication(TokenUtils.autenticacion(u)));
        }
        filterChain.doFilter(request, response);
    }
}
