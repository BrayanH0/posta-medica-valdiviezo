export interface Cita {
  idCita?: number;
  fecha: string;
  hora: string;
  estado: string;
  id_paciente: number;
  id_medico: number;
  precio?: number;
}

export interface EstadisticasCitas {
  totalCitas: number;
  citasAtendidas: number;
  citasCanceladas: number;
  ingresoTotal: number;
}

export interface CitasPorEspecialidad {
  especialidad: string;
  totalCitas: number;
  atendidas: number;
  precio: number;
}
