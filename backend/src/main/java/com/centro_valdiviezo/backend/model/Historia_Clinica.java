package com.centro_valdiviezo.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "Historia_Clinica")
public class Historia_Clinica {

    @Id
    private Integer idhistoria_Clinica;

    private Integer id_paciente;
    private String fecha_creacion;
    private String observaciones;
    private String tipo_sangre;
    private String alergias;

    public Integer getIdhistoria_Clinica() { return idhistoria_Clinica; }
    public void setIdhistoria_Clinica(Integer idhistoria_Clinica) { this.idhistoria_Clinica = idhistoria_Clinica; }

    public Integer getId_paciente() { return id_paciente; }
    public void setId_paciente(Integer id_paciente) { this.id_paciente = id_paciente; }

    public String getFecha_creacion() { return fecha_creacion; }
    public void setFecha_creacion(String fecha_creacion) { this.fecha_creacion = fecha_creacion; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public String getTipo_sangre() { return tipo_sangre; }
    public void setTipo_sangre(String tipo_sangre) { this.tipo_sangre = tipo_sangre; }

    public String getAlergias() { return alergias; }
    public void setAlergias(String alergias) { this.alergias = alergias; }
}
