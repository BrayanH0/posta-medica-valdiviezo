package com.centro_valdiviezo.backend.dto;

public class ReporteDashboardDTO {
    private long totalCitas;
    private long citasAtendidas;
    private long citasCanceladas;
    private double totalIngresos;

    public ReporteDashboardDTO(long totalCitas, long citasAtendidas, long citasCanceladas, double totalIngresos) {
        this.totalCitas = totalCitas;
        this.citasAtendidas = citasAtendidas;
        this.citasCanceladas = citasCanceladas;
        this.totalIngresos = totalIngresos;
    }

    public long getTotalCitas() { return totalCitas; }
    public void setTotalCitas(long totalCitas) { this.totalCitas = totalCitas; }

    public long getCitasAtendidas() { return citasAtendidas; }
    public void setCitasAtendidas(long citasAtendidas) { this.citasAtendidas = citasAtendidas; }

    public long getCitasCanceladas() { return citasCanceladas; }
    public void setCitasCanceladas(long citasCanceladas) { this.citasCanceladas = citasCanceladas; }

    public double getTotalIngresos() { return totalIngresos; }
    public void setTotalIngresos(double totalIngresos) { this.totalIngresos = totalIngresos; }
}
