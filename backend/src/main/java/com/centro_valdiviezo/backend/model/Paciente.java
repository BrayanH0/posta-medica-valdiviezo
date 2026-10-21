package com.centro_valdiviezo.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "Paciente")
public class Paciente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idPaciente")
    private Integer idPaciente;
    
    @Column(name = "nombres")
    private String nombres;
    
    @Column(name = "apellidos")
    private String apellidos;
    
    @Column(name = "dni")
    private String dni;
    
    @Column(name = "clave")
    private String clave;
    
    @Column(name = "fecha_nacimiento")
    private String fecha_nacimiento;
    
    @Column(name = "sexo")
    private String sexo;
    
    @Column(name = "telefono")
    private String telefono;
    
    @Column(name = "id_estado_paciente")
    private Integer id_estado_paciente;
    
    @Column(name = "id_ubigeo")
    private Integer id_ubigeo;

    public Integer getIdPaciente() {
        return idPaciente;
    }

    public void setIdPaciente(Integer idPaciente) {
        this.idPaciente = idPaciente;
    }

    public String getNombres() {
        return nombres;
    }

    public void setNombres(String nombres) {
        this.nombres = nombres;
    }

    public String getApellidos() {
        return apellidos;
    }

    public void setApellidos(String apellidos) {
        this.apellidos = apellidos;
    }

    public String getDni() {
        return dni;
    }

    public void setDni(String dni) {
        this.dni = dni;
    }

    public String getClave() {
        return clave;
    }

    public void setClave(String clave) {
        this.clave = clave;
    }

    public String getFecha_nacimiento() {
        return fecha_nacimiento;
    }

    public void setFecha_nacimiento(String fecha_nacimiento) {
        this.fecha_nacimiento = fecha_nacimiento;
    }

    public String getSexo() {
        return sexo;
    }

    public void setSexo(String sexo) {
        this.sexo = sexo;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public Integer getId_estado_paciente() {
        return id_estado_paciente;
    }

    public void setId_estado_paciente(Integer id_estado_paciente) {
        this.id_estado_paciente = id_estado_paciente;
    }

    public Integer getId_ubigeo() {
        return id_ubigeo;
    }

    public void setId_ubigeo(Integer id_ubigeo) {
        this.id_ubigeo = id_ubigeo;
    }
}
