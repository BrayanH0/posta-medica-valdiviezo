package com.centro_valdiviezo.backend.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class CitaResumenDTO {
    private String especialidad;
    private String pacienteNombre;
    private String medicoNombre;
    private LocalDate fecha;
    private LocalTime hora;

    public CitaResumenDTO(String especialidad, String pacienteNombre, String medicoNombre, LocalDate fecha, LocalTime hora) {
        this.especialidad = especialidad;
        this.pacienteNombre = pacienteNombre;
        this.medicoNombre = medicoNombre;
        this.fecha = fecha;
        this.hora = hora;
    }

    public String getEspecialidad() { return especialidad; }
    public String getPacienteNombre() { return pacienteNombre; }
    public String getMedicoNombre() { return medicoNombre; }
    public LocalDate getFecha() { return fecha; }
    public LocalTime getHora() { return hora; }
}
