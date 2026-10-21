import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { calcularHorariosDisponibles, diaDeLaSemana, horaAMinutos, minutosAHora } from './horarios-cita';

@Component({
  selector: 'app-registrar-cita',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './registrar-cita.component.html'
})
export class RegistrarCitaComponent implements OnInit {
  especialidades: any[] = [];
  medicos: any[] = [];
  horariosDisponibles: string[] = [];
  minDate: string = new Date().toISOString().split('T')[0];

  cita: any = {
    id_especialidad: null,
    id_medico: null,
    fecha_cita: '',
    hora_cita: '',
    motivo: '',
    id_paciente: null
  };

  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.cargarEspecialidades();
    const userId = localStorage.getItem('userId');
    if (userId) {
        this.cita.id_paciente = +userId;
    } else {
        alert('Debe iniciar sesión para registrar una cita.');
        this.router.navigate(['/login-paciente']);
    }
  }

  cargarEspecialidades() {
    this.http.get<any[]>(`${this.apiUrl}/especialidad`).subscribe(data => {
      this.especialidades = data;
    });
  }

  cargarMedicos() {
    if (this.cita.id_especialidad) {
      this.http.get<any[]>(`${this.apiUrl}/medico/especialidad/${this.cita.id_especialidad}`).subscribe(data => {
        this.medicos = data;
        this.cita.id_medico = null;
        this.horariosDisponibles = [];
      });
    }
  }

  cargarHorarios() {
    if (this.cita.id_medico && this.cita.fecha_cita) {
        // 1. Get availability
        this.http.get<any[]>(`${this.apiUrl}/disponibilidad_medico/medico/${this.cita.id_medico}`).subscribe(avail => {
            // 2. Get existing appointments
            this.http.get<any[]>(`${this.apiUrl}/citas/medico/${this.cita.id_medico}/fecha/${this.cita.fecha_cita}`).subscribe(citas => {
                 this.generarSlots(avail, citas);
            });
        });
    }
  }

  // La regla de horarios vive en horarios-cita.ts (RFC-006); aquí solo se muestra el resultado
  generarSlots(availability: any[], existingCitas: any[]) {
      console.log('Checking availability for:', diaDeLaSemana(this.cita.fecha_cita));

      // Si el cálculo lanza un error, la lista queda vacía, como antes
      this.horariosDisponibles = [];
      const resultado = calcularHorariosDisponibles(this.cita.fecha_cita, availability, existingCitas);
      if (resultado.porDefecto) {
          console.log('Using fallback availability.');
      }
      this.horariosDisponibles = resultado.horarios;
  }

  timeToMinutes(time: string): number {
      return horaAMinutos(time);
  }

  minutesToTime(mins: number): string {
      return minutosAHora(mins);
  }

  isValid() {
    return this.cita.id_especialidad && this.cita.id_medico && this.cita.fecha_cita && this.cita.hora_cita && this.cita.motivo;
  }

  registrarCita() {
    const payload = {
        id_paciente: this.cita.id_paciente,
        id_medico: this.cita.id_medico,
        fecha_cita: this.cita.fecha_cita,
        hora_cita: this.cita.hora_cita + ':00',
        motivo: this.cita.motivo,
        estado_cita: 1 // Pendiente
    };

    this.http.post(`${this.apiUrl}/cita`, payload).subscribe({
        next: () => {
            alert('Cita registrada con éxito');
            this.router.navigate(['/welcome']);
        },
        error: (err) => {
             console.error(err);
             alert('Error al registrar cita');
        }
    });
  }
}
