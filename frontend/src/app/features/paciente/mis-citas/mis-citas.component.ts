import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-mis-citas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './mis-citas.component.html'
})
export class MisCitasComponent implements OnInit {
  citas: any[] = [];
  userId: number | null = null;
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    const uid = localStorage.getItem('userId');
    if (uid) {
        this.userId = +uid;
        this.cargarCitas();
    } else {
        alert('Sesión no válida. Por favor inicie sesión.');
        this.router.navigate(['/login-paciente']);
    }
  }

  cargarCitas() {
    if (!this.userId) return;

    this.http.get<any[]>(`${this.apiUrl}/cita`).subscribe(data => {
        // Strict filtering by ID
        const myCitas = data.filter(c => c.id_paciente === this.userId);

        myCitas.forEach(c => {
             // Fetch Doctor
             this.http.get<any>(`${this.apiUrl}/medico/codigo/${c.id_medico}`).subscribe(m => {
                 c.medico_nombre = `${m.nombres} ${m.apellidos}`;
                 c.id_especialidad = m.id_especialidad;
                 // Fetch Especialidad
                 this.http.get<any>(`${this.apiUrl}/especialidad/${m.id_especialidad}`).subscribe(e => {
                     c.especialidad = e.nombre_especialidad;
                 });
             });
        });
        this.citas = myCitas;
    });
  }

  eliminarCita(id: number) {
      if(confirm('¿Seguro que desea eliminar esta cita?')) {
          this.http.delete(`${this.apiUrl}/cita/${id}`).subscribe(() => {
              this.citas = this.citas.filter(c => c.idCita !== id);
          });
      }
  }

  getBadgeClass(estado: number) {
      switch(estado) {
          case 1: return 'bg-warning text-dark';
          case 2: return 'bg-primary';
          case 3: return 'bg-danger';
          case 4: return 'bg-success';
          default: return 'bg-secondary';
      }
  }

  getEstadoNombre(estado: number) {
       switch(estado) {
          case 1: return 'Pendiente';
          case 2: return 'Confirmada';
          case 3: return 'Cancelada';
          case 4: return 'Atendida';
          default: return 'Desconocido';
      }
  }
}
// Refactor: Edit logic removed
