package com.centro_valdiviezo.backend.dto;

public class IngresosMensualesDTO {
    private String mesAno;
    private double total;

    public IngresosMensualesDTO(String mesAno, double total) {
        this.mesAno = mesAno;
        this.total = total;
    }

    public String getMesAno() {
        return mesAno;
    }

    public void setMesAno(String mesAno) {
        this.mesAno = mesAno;
    }

    public double getTotal() {
        return total;
    }

    public void setTotal(double total) {
        this.total = total;
    }    
}
