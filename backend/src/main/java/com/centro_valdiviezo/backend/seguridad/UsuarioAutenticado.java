package com.centro_valdiviezo.backend.seguridad;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

// Usuario que hace la petición, tal como viene en su token (RFC-011): id en su tabla y rol
// ("paciente", "medico" o "administrador"). Los controladores lo usan en lugar del id de la URL.
public record UsuarioAutenticado(Integer id, String rol) {

    public static final String PACIENTE = "paciente";
    public static final String MEDICO = "medico";
    public static final String ADMINISTRADOR = "administrador";

    public boolean esPaciente() { return PACIENTE.equals(rol); }
    public boolean esMedico() { return MEDICO.equals(rol); }
    public boolean esAdministrador() { return ADMINISTRADOR.equals(rol); }

    // Usuario de la petición en curso. Los endpoints que lo llaman exigen token en WebSecurityConfig;
    // si aun así no hay usuario, se niega el acceso.
    public static UsuarioAutenticado actual() {
        Authentication a = SecurityContextHolder.getContext().getAuthentication();
        if (a != null && a.getPrincipal() instanceof UsuarioAutenticado u) {
            return u;
        }
        throw new AccessDeniedException("Sin usuario autenticado");
    }

    // 403 si el recurso no es del usuario (RFC-011, tarea 26)
    public static void exigirPropietario(boolean esSuyo) {
        if (!esSuyo) {
            throw new AccessDeniedException("El recurso no pertenece al usuario");
        }
    }
}
