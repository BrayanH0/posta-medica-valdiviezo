package com.centro_valdiviezo.backend.dto;

// Cita vista por el médico: incluye nombre y DNI del paciente, nunca su clave
public class CitaMedicoDTO {
    private Integer idCita;
    private String fecha;
    private String hora;
    private String motivo;
    private String estado;
    private Integer idPaciente;
    private String pacienteNombres;
    private String pacienteApellidos;
    private String pacienteDni;

    public CitaMedicoDTO(Integer idCita, String fecha, String hora, String motivo, String estado,
            Integer idPaciente, String pacienteNombres, String pacienteApellidos, String pacienteDni) {
        this.idCita = idCita;
        this.fecha = fecha;
        this.hora = hora;
        this.motivo = motivo;
        this.estado = estado;
        this.idPaciente = idPaciente;
        this.pacienteNombres = pacienteNombres;
        this.pacienteApellidos = pacienteApellidos;
        this.pacienteDni = pacienteDni;
    }

    public Integer getIdCita() {
        return idCita;
    }

    public String getFecha() {
        return fecha;
    }

    public String getHora() {
        return hora;
    }

    public String getMotivo() {
        return motivo;
    }

    public String getEstado() {
        return estado;
    }

    public Integer getIdPaciente() {
        return idPaciente;
    }

    public String getPacienteNombres() {
        return pacienteNombres;
    }

    public String getPacienteApellidos() {
        return pacienteApellidos;
    }

    public String getPacienteDni() {
        return pacienteDni;
    }
}
