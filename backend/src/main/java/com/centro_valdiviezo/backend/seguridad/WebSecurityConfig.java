package com.centro_valdiviezo.backend.seguridad;

import java.util.Arrays;
import java.util.function.BiPredicate;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.intercept.RequestAuthorizationContext;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;

// RFC-011: matriz de autorización aprobada en la tarea 26 (docs/rfc/RFC-011.md).
// Sin token o con token inválido/vencido -> 401; rol no permitido o id de otro usuario -> 403.
@Configuration
@AllArgsConstructor
public class WebSecurityConfig {
    private static final String PACIENTE = "PACIENTE";
    private static final String MEDICO = "MEDICO";
    private static final String ADMIN = "ADMINISTRADOR";

    static final String MENSAJE_401 = "Debe iniciar sesión";
    static final String MENSAJE_403 = "No tiene permiso para este recurso";

    private final UserDetailsService userDetailsService;
    // BCrypt de config/PasswordConfig (@Primary). H-048: ya no hay un NoOpPasswordEncoder propio.
    private final PasswordEncoder passwordEncoder;

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http, CorsConfigurationSource corsConfigurationSource,
            TokenUtils tokenUtils) throws Exception {

        String[] catalogos = { "/api/cie", "/api/cie/*", "/api/estado_cita", "/api/estado_cita/*",
                "/api/estado_paciente", "/api/estado_paciente/*", "/api/ubigeo", "/api/ubigeo/*",
                "/api/disponibilidad_medico", "/api/disponibilidad_medico/*", "/api/disponibilidad_medico/medico/*" };

        return http.csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .authorizeHttpRequests(auth -> auth
                        // Público
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/error").permitAll()
                        .requestMatchers(HttpMethod.POST, "/login", "/api/paciente/crear").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/especialidad", "/api/especialidad/*",
                                "/api/especialidad/especialidad").permitAll()
                        .requestMatchers("/api/especialidad/**").hasRole(ADMIN)

                        // Citas (la propiedad por id se comprueba en CitaController)
                        .requestMatchers(HttpMethod.GET, "/api/cita/porEstado", "/api/cita/porEspecialidad").hasRole(ADMIN)
                        .requestMatchers(HttpMethod.GET, "/api/cita", "/api/cita/*").hasAnyRole(PACIENTE, MEDICO, ADMIN)
                        .requestMatchers(HttpMethod.POST, "/api/cita").hasRole(PACIENTE)
                        .requestMatchers(HttpMethod.PUT, "/api/cita/*").hasRole(ADMIN)
                        .requestMatchers(HttpMethod.DELETE, "/api/cita/*").hasAnyRole(PACIENTE, ADMIN)

                        // Citas del médico: el {idMedico} de la URL tiene que ser el del token
                        .requestMatchers(HttpMethod.GET, "/api/citas/medico/{idMedico}/fecha/{fecha}")
                        .access(si((u, v) -> u.esPaciente() || (u.esMedico() && esElMismo(u, v.get("idMedico")))))
                        .requestMatchers("/api/citas/medico/{idMedico}", "/api/citas/medico/{idMedico}/**")
                        .access(si((u, v) -> u.esMedico() && esElMismo(u, v.get("idMedico"))))

                        // Historia clínica y evolución: solo el paciente, y solo lo suyo (controladores)
                        .requestMatchers(HttpMethod.GET, "/api/historia_clinica", "/api/historia_clinica/*",
                                "/api/evolucion_clinica", "/api/evolucion_clinica/*").hasRole(PACIENTE)
                        .requestMatchers("/api/historia_clinica/**", "/api/evolucion_clinica/**").hasRole(ADMIN)

                        // Médicos
                        .requestMatchers(HttpMethod.GET, "/api/medico/codigo/*", "/api/medico/especialidad/*").authenticated()
                        .requestMatchers("/api/medico/**").hasRole(ADMIN)

                        // Pacientes
                        .requestMatchers(HttpMethod.GET, "/api/paciente/codigo/{id}")
                        .access(si((u, v) -> u.esAdministrador() || (u.esPaciente() && esElMismo(u, v.get("id")))))
                        .requestMatchers("/api/paciente/**").hasRole(ADMIN)

                        // Catálogos
                        .requestMatchers(HttpMethod.GET, catalogos).authenticated()
                        .requestMatchers("/api/cie/**", "/api/estado_cita/**", "/api/estado_paciente/**",
                                "/api/ubigeo/**", "/api/disponibilidad_medico/**").hasRole(ADMIN)

                        // Reportes y administradores
                        .requestMatchers("/api/reportes/**", "/usuarios", "/usuarios/**").hasRole(ADMIN)

                        .anyRequest().authenticated())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(e -> e
                        .authenticationEntryPoint((req, res, ex) -> responderError(res, HttpStatus.UNAUTHORIZED, MENSAJE_401))
                        .accessDeniedHandler((req, res, ex) -> responderError(res, HttpStatus.FORBIDDEN, MENSAJE_403)))
                .addFilterBefore(new JWTAuthorizationFilter(tokenUtils), UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    // Regla con el usuario del token y las variables de la ruta; sin usuario del token -> denegado (401)
    private static AuthorizationManager<RequestAuthorizationContext> si(
            BiPredicate<UsuarioAutenticado, java.util.Map<String, String>> regla) {
        return (autenticacion, contexto) -> {
            Object principal = autenticacion.get() == null ? null : autenticacion.get().getPrincipal();
            boolean permitido = principal instanceof UsuarioAutenticado u && regla.test(u, contexto.getVariables());
            return new AuthorizationDecision(permitido);
        };
    }

    private static boolean esElMismo(UsuarioAutenticado u, String idDeLaRuta) {
        return String.valueOf(u.id()).equals(idDeLaRuta);
    }

    static void responderError(HttpServletResponse res, HttpStatus estado, String mensaje) throws java.io.IOException {
        res.setStatus(estado.value());
        res.setContentType(MediaType.APPLICATION_JSON_VALUE);
        res.setCharacterEncoding("UTF-8");
        res.getWriter().write("{\"error\":\"" + mensaje + "\"}");
    }

    // H-048: usa el PasswordEncoder inyectado (BCrypt), no un NoOpPasswordEncoder
    @Bean
    AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        AuthenticationManagerBuilder builder = http.getSharedObject(AuthenticationManagerBuilder.class);
        builder.userDetailsService(userDetailsService).passwordEncoder(passwordEncoder);
        return builder.build();
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
