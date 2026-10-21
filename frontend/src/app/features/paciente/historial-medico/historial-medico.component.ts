import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-historial-medico',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './historial-medico.component.html'
})
export class HistorialMedicoComponent implements OnInit {
  historia: any = null;
  evoluciones: any[] = [];
  userId: number | null = null;
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    const uid = localStorage.getItem('userId');
    if (uid) {
        this.userId = +uid;
        this.cargarHistorial();
    } else {
        alert('Sesión no válida.');
        this.router.navigate(['/login-paciente']);
    }
  }

  cargarHistorial() {
      if (!this.userId) return;

      this.http.get<any[]>(`${this.apiUrl}/historia_clinica`).subscribe(historias => {
          const h = historias.find(x => x.id_paciente === this.userId);
          if (h) {
              this.historia = h;
              this.cargarEvoluciones(h.idhistoria_Clinica);
          } else {
              this.historia = null;
          }
      });
  }

  cargarEvoluciones(historiaId: number) {
      this.http.get<any[]>(`${this.apiUrl}/evolucion_clinica`).subscribe(evos => {
          const myEvos = evos.filter(e => e.id_historia === historiaId);

          // Ordenar por fecha descendente (lo más nuevo primero)
          myEvos.sort((a, b) => new Date(b.fecha_evolucion).getTime() - new Date(a.fecha_evolucion).getTime());

          myEvos.forEach(evo => {
              evo.isOpen = false;
              this.http.get<any>(`${this.apiUrl}/medico/codigo/${evo.id_medico}`).subscribe(m => {
                  evo.medico = `${m.nombres} ${m.apellidos}`;
              });
              this.http.get<any>(`${this.apiUrl}/cie/${evo.id_cie}`).subscribe(c => {
                  evo.codigo_cie = c.codigo;
                  evo.diagnostico = c.descripcion;
              });
          });
          this.evoluciones = myEvos;
      });
  }

  toggleEvolucion(evo: any) {
      evo.isOpen = !evo.isOpen;
  }
}
