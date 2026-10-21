import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';

export interface Cita {
  id: number;
  paciente: string;
  dni: string;
  fecha: string;
  hora: string;
  motivo: string;
  estado: 'Pendiente' | 'Aprobada' | 'Cancelada';
}

@Injectable({
  providedIn: 'root'
})
export class MedicoService {

  private initialCitas: Cita[] = [
    {
      id: 101,
      paciente: 'Maria Lopez Quispe',
      dni: '23456789',
      fecha: '2023-11-25',
      hora: '10:00',
      motivo: 'Dolor de cabeza persistente',
      estado: 'Pendiente'
    },
    {
      id: 102,
      paciente: 'Luis Torres Paz',
      dni: '45678901',
      fecha: '2023-11-25',
      hora: '11:30',
      motivo: 'Control de presión arterial',
      estado: 'Pendiente'
    },
    {
      id: 103,
      paciente: 'Ana Diaz Ruiz',
      dni: '56789012',
      fecha: '2023-11-26',
      hora: '09:00',
      motivo: 'Chequeo general',
      estado: 'Pendiente'
    },
    {
      id: 201,
      paciente: 'Carlos Gomez Soto',
      dni: '34567890',
      fecha: '2023-11-20',
      hora: '15:00',
      motivo: 'Dolor lumbar',
      estado: 'Aprobada'
    },
    {
      id: 301,
      paciente: 'Juan Perez Gomez',
      dni: '12345678',
      fecha: '2023-11-15',
      hora: '08:00',
      motivo: 'Gripe fuerte',
      estado: 'Cancelada'
    }
  ];

  private citasSubject = new BehaviorSubject<Cita[]>(this.initialCitas);
  citas$ = this.citasSubject.asObservable();

  constructor() {}

  getCitasByStatus(status: 'Pendiente' | 'Aprobada' | 'Cancelada'): Observable<Cita[]> {
    return this.citas$.pipe(
      map(citas => citas.filter(c => c.estado === status))
    );
  }

  updateCitaStatus(id: number, newStatus: 'Pendiente' | 'Aprobada' | 'Cancelada') {
    const currentCitas = this.citasSubject.getValue();
    const updatedCitas = currentCitas.map(cita => {
      if (cita.id === id) {
        return { ...cita, estado: newStatus };
      }
      return cita;
    });
    this.citasSubject.next(updatedCitas);
  }
}
