export interface paciente {
    idPaciente?: number,
    nombres: string,
    apellidos: string,
    dni: string,
    clave?: string,
    fecha_nacimiento: string,
    sexo: string,
    telefono?: string,
    id_estado_paciente: number,
    id_ubigeo: number
}