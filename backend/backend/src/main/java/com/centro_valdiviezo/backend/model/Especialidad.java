package com.centro_valdiviezo.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "Especialidad")
public class Especialidad {

    @Id
    private Integer id_especialidad;

    private String nombre_especialidad;
    private String descripcion;
    private Double precio;

    public Integer getId_especialidad() { return id_especialidad; }
    public void setId_especialidad(Integer id_especialidad) { this.id_especialidad = id_especialidad; }

    public String getNombre_especialidad() { return nombre_especialidad; }
    public void setNombre_especialidad(String nombre_especialidad) { this.nombre_especialidad = nombre_especialidad; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public Double getPrecio() { return precio; }
    public void setPrecio(Double precio) { this.precio = precio; }
}
