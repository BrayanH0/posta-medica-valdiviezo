import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

// Nombres de estado tal como están en la tabla Estado_Cita
export type EstadoCita = 'Pendiente' | 'Confirmada' | 'Cancelada';

export interface Cita {
  idCita: number;
  fecha: string;
  hora: string;
  motivo: string;
  estado: string;
  idPaciente: number;
  pacienteNombres: string;
  pacienteApellidos: string;
  pacienteDni: string;
}

export interface PacienteMedico {
  idPaciente: number;
  nombres: string;
  apellidos: string;
  dni: string;
  fechaNacimiento: string;
  sexo: string;
  telefono: string;
  estadoPaciente: string;
  departamento: string;
  distrito: string;
}

export const MENSAJE_SIN_CONEXION = 'No se pudo conectar con el servidor. Intente nuevamente.';

@Injectable({
  providedIn: 'root'
})
export class MedicoService {
  private apiUrl = 'http://localhost:8080/api/citas/medico';

  constructor(private http: HttpClient) {}

  // El médico de la sesión es el userId que guarda el login
  private idMedico(): string | null {
    return localStorage.getItem('userId');
  }

  private sinSesion<T>(): Observable<T> {
    return throwError(() => new Error('No hay sesión de médico.'));
  }

  getCitasByStatus(estado: EstadoCita): Observable<Cita[]> {
    const id = this.idMedico();
    if (!id) return this.sinSesion();
    return this.http.get<Cita[]>(`${this.apiUrl}/${id}`, { params: { estado } });
  }

  updateCitaStatus(idCita: number, estado: EstadoCita): Observable<Cita> {
    const id = this.idMedico();
    if (!id) return this.sinSesion();
    return this.http.put<Cita>(`${this.apiUrl}/${id}/${idCita}/estado`, { estado });
  }

  getPacientes(): Observable<PacienteMedico[]> {
    const id = this.idMedico();
    if (!id) return this.sinSesion();
    return this.http.get<PacienteMedico[]>(`${this.apiUrl}/${id}/pacientes`);
  }
}
