package com.centro_valdiviezo.backend.seguridad;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import lombok.AllArgsConstructor;

@Configuration
@AllArgsConstructor
public class WebSecurityConfig {
    private final UserDetailsService userDetailsService;
    private final JWTAuthorizationFilter jwtAuthorizationFilter;

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http, AuthenticationManager authManager,
            CorsConfigurationSource corsConfigurationSource) throws Exception {

        // JWTAuthenticationFilter jwtAuthenticationFilter = new JWTAuthenticationFilter();
        // jwtAuthenticationFilter.setAuthenticationManager(authManager);
        // jwtAuthenticationFilter.setFilterProcessesUrl("/login");

        return http.csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll()) // Permitir todo para pruebas
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                // .addFilterBefore(jwtAuthorizationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();

    }

    @SuppressWarnings("deprecation")
    @Bean
    PasswordEncoder passwordEncoder() {
        return org.springframework.security.crypto.password.NoOpPasswordEncoder.getInstance();
    }

    /*
     * @Bean
     * UserDetailsService userDetailsService() {
     * InMemoryUserDetailsManager iudm = new InMemoryUserDetailsManager();
     * iudm.createUser(User.withUsername("admin")
     * .password(passwordEncoder().encode("database"))
     * .roles()
     * .build());
     * return iudm;
     * }
     */
    /*
     * @Bean
     * UserDetailsService userDetailsService() {
     * InMemoryUserDetailsManager iudm = new InMemoryUserDetailsManager();
     * iudm.createUser(User.withUsername("grupo3@gmail.com")
     * .password(passwordEncoder().encode("123456"))
     * .roles("USER")
     * .build());
     * return iudm;
     * }
     */
    @Bean
    AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        return http.getSharedObject(AuthenticationManagerBuilder.class)
                .userDetailsService(userDetailsService)
                .passwordEncoder(passwordEncoder()).and().build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource(
            @Value("${app.cors.allowed-origins}") String[] origenesPermitidos) {
        CorsConfiguration configuration = new CorsConfiguration();
        // Orígenes del frontend, separados por comas (variable CORS_ORIGINS; por defecto http://localhost:4200)
        configuration.setAllowedOrigins(Arrays.asList(origenesPermitidos));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

}
