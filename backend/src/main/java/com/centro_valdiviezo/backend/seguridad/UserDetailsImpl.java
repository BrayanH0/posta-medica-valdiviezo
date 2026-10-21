package com.centro_valdiviezo.backend.seguridad;

import java.util.Collection;
import java.util.Collections;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.centro_valdiviezo.backend.model.Paciente;
import com.centro_valdiviezo.backend.model.UsuarioModel;

public class UserDetailsImpl implements UserDetails {
    private UsuarioModel usuario;
    private Paciente paciente;
    private boolean isPaciente;

    public UserDetailsImpl(UsuarioModel usuario) {
        this.usuario = usuario;
        this.isPaciente = false;
    }

    public UserDetailsImpl(Paciente paciente) {
        this.paciente = paciente;
        this.isPaciente = true;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        String role = isPaciente ? "ROLE_PACIENTE" : (usuario.getRol() != null ? usuario.getRol() : "ROLE_ADMIN");
        return Collections.singletonList(() -> role);
    }

    @Override
    public String getPassword() {
        return isPaciente ? paciente.getClave() : usuario.getClave();
    }

    @Override
    public String getUsername() {
        return isPaciente ? paciente.getDni() : usuario.getDni();
    }

    public String getNombre() {
        return isPaciente ? paciente.getNombres() : usuario.getNombre();
    }

    @Override
    public boolean isAccountNonExpired() { return true; }
    @Override
    public boolean isAccountNonLocked() { return true; }
    @Override
    public boolean isCredentialsNonExpired() { return true; }
    @Override
    public boolean isEnabled() { return true; }
}
