package com.centro_valdiviezo.backend.dto;

public class EspecialidadCitaCantDTO {

    private String especialidad;
    private long totalCitas;
    
    public EspecialidadCitaCantDTO(String especialidad, long totalCitas) {
        this.especialidad = especialidad;
        this.totalCitas = totalCitas;
    }

    public String getEspecialidad() {
        return especialidad;
    }

    public void setEspecialidad(String especialidad) {
        this.especialidad = especialidad;
    }

    public long getTotalCitas() {
        return totalCitas;
    }

    public void setTotalCitas(long totalCitas) {
        this.totalCitas = totalCitas;
    }

    
}
