package com.centro_valdiviezo.backend.dto;

// Paciente visto por el médico: solo campos que existen en la base, nunca su clave
public class PacienteMedicoDTO {
    private Integer idPaciente;
    private String nombres;
    private String apellidos;
    private String dni;
    private String fechaNacimiento;
    private String sexo;
    private String telefono;
    private String estadoPaciente;
    private String departamento;
    private String distrito;

    public PacienteMedicoDTO(Integer idPaciente, String nombres, String apellidos, String dni,
            String fechaNacimiento, String sexo, String telefono, String estadoPaciente,
            String departamento, String distrito) {
        this.idPaciente = idPaciente;
        this.nombres = nombres;
        this.apellidos = apellidos;
        this.dni = dni;
        this.fechaNacimiento = fechaNacimiento;
        this.sexo = sexo;
        this.telefono = telefono;
        this.estadoPaciente = estadoPaciente;
        this.departamento = departamento;
        this.distrito = distrito;
    }

    public Integer getIdPaciente() {
        return idPaciente;
    }

    public String getNombres() {
        return nombres;
    }

    public String getApellidos() {
        return apellidos;
    }

    public String getDni() {
        return dni;
    }

    public String getFechaNacimiento() {
        return fechaNacimiento;
    }

    public String getSexo() {
        return sexo;
    }

    public String getTelefono() {
        return telefono;
    }

    public String getEstadoPaciente() {
        return estadoPaciente;
    }

    public String getDepartamento() {
        return departamento;
    }

    public String getDistrito() {
        return distrito;
    }
}
