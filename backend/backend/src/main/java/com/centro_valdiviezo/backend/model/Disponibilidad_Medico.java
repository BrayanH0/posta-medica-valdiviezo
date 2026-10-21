package com.centro_valdiviezo.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "Disponibilidad_Medico")
public class Disponibilidad_Medico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idDisponibilidad_Medico;

    private Integer id_medico;
    private String dia_semana;
    private String hora_inicio;
    private String hora_fin;

    public Integer getIdDisponibilidad_Medico() { return idDisponibilidad_Medico; }
    public void setIdDisponibilidad_Medico(Integer idDisponibilidad_Medico) { this.idDisponibilidad_Medico = idDisponibilidad_Medico; }

    public Integer getId_medico() { return id_medico; }
    public void setId_medico(Integer id_medico) { this.id_medico = id_medico; }

    public String getDia_semana() { return dia_semana; }
    public void setDia_semana(String dia_semana) { this.dia_semana = dia_semana; }

    public String getHora_inicio() { return hora_inicio; }
    public void setHora_inicio(String hora_inicio) { this.hora_inicio = hora_inicio; }

    public String getHora_fin() { return hora_fin; }
    public void setHora_fin(String hora_fin) { this.hora_fin = hora_fin; }
}
