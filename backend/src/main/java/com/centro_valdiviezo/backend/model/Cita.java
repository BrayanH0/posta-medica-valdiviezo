package com.centro_valdiviezo.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "Cita")
public class Cita {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idCita;

    private Integer id_paciente;
    private Integer id_medico;
    private String fecha_cita;
    private String hora_cita;
    private String motivo;
    private Integer estado_cita;

    public Integer getIdCita() { return idCita; }
    public void setIdCita(Integer idCita) { this.idCita = idCita; }

    public Integer getId_paciente() { return id_paciente; }
    public void setId_paciente(Integer id_paciente) { this.id_paciente = id_paciente; }

    public Integer getId_medico() { return id_medico; }
    public void setId_medico(Integer id_medico) { this.id_medico = id_medico; }

    public String getFecha_cita() { return fecha_cita; }
    public void setFecha_cita(String fecha_cita) { this.fecha_cita = fecha_cita; }

    public String getHora_cita() { return hora_cita; }
    public void setHora_cita(String hora_cita) { this.hora_cita = hora_cita; }

    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }

    public Integer getEstado_cita() { return estado_cita; }
    public void setEstado_cita(Integer estado_cita) { this.estado_cita = estado_cita; }
}
