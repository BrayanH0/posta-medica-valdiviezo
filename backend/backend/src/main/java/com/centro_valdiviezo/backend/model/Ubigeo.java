package com.centro_valdiviezo.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "Ubigeo")
public class Ubigeo {

    @Id
    private Integer idubigeo;

    private String departamento;
    private String distrito;

    public Integer getIdubigeo() { return idubigeo; }
    public void setIdubigeo(Integer idubigeo) { this.idubigeo = idubigeo; }

    public String getDepartamento() { return departamento; }
    public void setDepartamento(String departamento) { this.departamento = departamento; }

    public String getDistrito() { return distrito; }
    public void setDistrito(String distrito) { this.distrito = distrito; }
}
