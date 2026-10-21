package com.centro_valdiviezo.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "Estado_Paciente")
public class Estado_Paciente {

    @Id
    private Integer id_estado_paciente;

    private String nombre_estado;
    private String descripcion;

    public Integer getId_estado_paciente() { return id_estado_paciente; }
    public void setId_estado_paciente(Integer id_estado_paciente) { this.id_estado_paciente = id_estado_paciente; }

    public String getNombre_estado() { return nombre_estado; }
    public void setNombre_estado(String nombre_estado) { this.nombre_estado = nombre_estado; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
}
