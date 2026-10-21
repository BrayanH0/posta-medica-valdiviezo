package com.centro_valdiviezo.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "Evolucion_Clinica")
public class Evolucion_Clinica {

    @Id
    private Integer idEvolucion_Clinica;

    private Integer id_historia;
    private Integer id_medico;
    private String fecha_evolucion;
    private String anotaciones;
    private Integer id_cie;

    public Integer getIdEvolucion_Clinica() { return idEvolucion_Clinica; }
    public void setIdEvolucion_Clinica(Integer idEvolucion_Clinica) { this.idEvolucion_Clinica = idEvolucion_Clinica; }

    public Integer getId_historia() { return id_historia; }
    public void setId_historia(Integer id_historia) { this.id_historia = id_historia; }

    public Integer getId_medico() { return id_medico; }
    public void setId_medico(Integer id_medico) { this.id_medico = id_medico; }

    public String getFecha_evolucion() { return fecha_evolucion; }
    public void setFecha_evolucion(String fecha_evolucion) { this.fecha_evolucion = fecha_evolucion; }

    public String getAnotaciones() { return anotaciones; }
    public void setAnotaciones(String anotaciones) { this.anotaciones = anotaciones; }

    public Integer getId_cie() { return id_cie; }
    public void setId_cie(Integer id_cie) { this.id_cie = id_cie; }
}
