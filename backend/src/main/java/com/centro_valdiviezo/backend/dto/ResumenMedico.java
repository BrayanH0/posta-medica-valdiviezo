package com.centro_valdiviezo.backend.dto;

public class ResumenMedico {
    // Integer (no int): la columna medico.id_especialidad admite NULL, y un médico sin especialidad no debe provocar un error
    private Integer id_especialidad;
    private Long cantidad_medicos;

    public Integer getId_especialidad() {
        return id_especialidad;
    }

    public void setId_especialidad(Integer id_especialidad) {
        this.id_especialidad = id_especialidad;
    }

    public Long getCantidad_medicos() {
        return cantidad_medicos;
    }

    public void setCantidad_medicos(Long cantidad_medicos) {
        this.cantidad_medicos = cantidad_medicos;
    }

    public ResumenMedico() {
    }

    // RFC-020 (H-005): la consulta nativa de MedicoRepository.getResumenMedicosPorEspecialidad devuelve 2 columnas y
    // Hibernate arma cada fila con el constructor que recibe exactamente 2 parámetros (id_especialidad, cantidad_medicos)
    public ResumenMedico(Integer id_especialidad, Long cantidad_medicos) {
        this.id_especialidad = id_especialidad;
        this.cantidad_medicos = cantidad_medicos;
    }
}
