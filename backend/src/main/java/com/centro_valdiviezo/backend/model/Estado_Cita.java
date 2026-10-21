package com.centro_valdiviezo.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "Estado_Cita")
public class Estado_Cita {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id_estado_cita;

    private String nombre_estado;
    private String descripcion;

    public Integer getId_estado_cita() {
        return id_estado_cita;
    }

    public void setId_estado_cita(Integer id_estado_cita) {
        this.id_estado_cita = id_estado_cita;
    }

    public String getNombre_estado() {
        return nombre_estado;
    }

    public void setNombre_estado(String nombre_estado) {
        this.nombre_estado = nombre_estado;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
}
