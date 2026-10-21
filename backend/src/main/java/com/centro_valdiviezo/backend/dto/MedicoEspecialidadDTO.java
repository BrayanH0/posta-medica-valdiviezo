package com.centro_valdiviezo.backend.dto;

public class MedicoEspecialidadDTO {
    private int id_medico;
    private String nombre_medico;
    private String apellido_medico;
    private String cmp;
    private String nombre_especialidad;
    private String descripcion;

    public MedicoEspecialidadDTO(int id_medico, String nombre_medico, String apellido_medico, String cmp,
            String nombre_especialidad, String descripcion) {
        this.id_medico = id_medico;
        this.nombre_medico = nombre_medico;
        this.apellido_medico = apellido_medico;
        this.cmp = cmp;
        this.nombre_especialidad = nombre_especialidad;
        this.descripcion = descripcion;
    }

    public int getId_medico() {
        return id_medico;
    }

    public void setId_medico(int id_medico) {
        this.id_medico = id_medico;
    }

    public String getNombre_medico() {
        return nombre_medico;
    }

    public void setNombre_medico(String nombre_medico) {
        this.nombre_medico = nombre_medico;
    }

    public String getApellido_medico() {
        return apellido_medico;
    }

    public void setApellido_medico(String apellido_medico) {
        this.apellido_medico = apellido_medico;
    }

    public String getCmp() {
        return cmp;
    }

    public void setCmp(String cmp) {
        this.cmp = cmp;
    }

    public String getNombre_especialidad() {
        return nombre_especialidad;
    }

    public void setNombre_especialidad(String nombre_especialidad) {
        this.nombre_especialidad = nombre_especialidad;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

}
