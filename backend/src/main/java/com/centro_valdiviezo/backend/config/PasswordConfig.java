package com.centro_valdiviezo.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

// RFC-010: codificador de contraseñas de la aplicación (BCrypt).
// WebSecurityConfig todavía define un bean "passwordEncoder" (NoOp) que no se toca en este hotfix
// (lo modifica el paquete P5). Este bean tiene otro nombre y @Primary: todo PasswordEncoder que se
// inyecte por tipo (autenticadores, servicios, migración) recibe BCrypt.
@Configuration
public class PasswordConfig {

    @Bean
    @Primary
    PasswordEncoder bcryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
