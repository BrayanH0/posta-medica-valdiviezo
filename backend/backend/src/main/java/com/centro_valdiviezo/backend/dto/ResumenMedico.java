package com.centro_valdiviezo.backend.dto;

public class ResumenMedico {
    private int id_especialidad;
    private Long cantidad_medicos;

    public int getId_especialidad() {
        return id_especialidad;
    }

    public void setId_especialidad(int id_especialidad) {
        this.id_especialidad = id_especialidad;
    }

    public Long getCantidad_medicos() {
        return cantidad_medicos;
    }

    public void setCantidad_medicos(Long cantidad_medicos) {
        this.cantidad_medicos = cantidad_medicos;
    }

    public ResumenMedico() {
    }
}
