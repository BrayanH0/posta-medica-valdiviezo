package com.centro_valdiviezo.backend.dto;

public class EstadoCitaCantDTO {

    private String estadoCita;
    private long cantCita;

    public EstadoCitaCantDTO(String estadoCita, long cantCita) {
        this.estadoCita = estadoCita;
        this.cantCita = cantCita;
    }

    public String getEstadoCita() {
        return estadoCita;
    }

    public void setEstadoCita(String estadoCita) {
        this.estadoCita = estadoCita;
    }

    public long getCantCita() {
        return cantCita;
    }

    public void setCantCita(long cantCita) {
        this.cantCita = cantCita;
    }

}
