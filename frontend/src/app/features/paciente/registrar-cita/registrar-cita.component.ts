import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

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

  generarSlots(availability: any[], existingCitas: any[]) {
      const date = new Date(this.cita.fecha_cita + 'T00:00:00'); // Force local time handling or ensure date part only
      // Note: new Date('2025-11-25') in JS often defaults to UTC, which might be previous day in local.
      // Append T00:00:00 to try to keep it local or use manual parsing.
      const dayMap = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const dayName = dayMap[date.getDay()];

      console.log('Checking availability for:', dayName);

      const rule = availability.find(a => a.dia_semana === dayName);
      this.horariosDisponibles = [];

      if (rule) {
          let start = this.timeToMinutes(rule.hora_inicio);
          let end = this.timeToMinutes(rule.hora_fin);

          while (start + 20 <= end) {
              const timeStr = this.minutesToTime(start);
              if (!existingCitas.find(c => c.hora_cita.substring(0,5) === timeStr)) {
                  this.horariosDisponibles.push(timeStr);
              }
              start += 20;
          }
      }

      // Fallback if no specific rule or empty (Constraint: "any date is available")
      if (this.horariosDisponibles.length === 0) {
          console.log('Using fallback availability.');
          let start = 8 * 60; // 08:00
          let end = 20 * 60;  // 20:00
          while (start + 20 <= end) {
              const timeStr = this.minutesToTime(start);
              if (!existingCitas.find(c => c.hora_cita && c.hora_cita.substring(0,5) === timeStr)) {
                  this.horariosDisponibles.push(timeStr);
              }
              start += 20;
          }
      }
  }

  timeToMinutes(time: string): number {
      if(!time) return 0;
      const [h, m] = time.split(':').map(Number);
      return h * 60 + m;
  }

  minutesToTime(mins: number): string {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
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
