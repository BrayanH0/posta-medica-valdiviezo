package com.centro_valdiviezo.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "CIE")
public class CIE {

    @Id
    private Integer idCIE;

    private String codigo;
    private String descripcion;

    public Integer getIdCIE() { return idCIE; }
    public void setIdCIE(Integer idCIE) { this.idCIE = idCIE; }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
}
