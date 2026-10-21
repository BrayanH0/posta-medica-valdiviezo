import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Subscription, interval, startWith, switchMap } from 'rxjs';

@Component({
  selector: 'app-admin-reportes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-reportes.component.html',
  styleUrls: ['./admin-reportes.component.css']
})
export class AdminReportesComponent implements OnInit, OnDestroy {
  estadisticas: any = {
    totalCitas: 0,
    citasAtendidas: 0,
    citasCanceladas: 0,
    totalIngresos: 0
  };
  resumenCitas: any[] = [];
  private apiUrl = 'http://localhost:8080/api/reportes';
  private updateSubscription: Subscription | undefined;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    // Initial load and polling every 10 seconds
    this.updateSubscription = interval(10000)
      .pipe(startWith(0))
      .subscribe(() => {
        this.actualizarDatos();
      });
  }

  ngOnDestroy() {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  }

  actualizarDatos() {
    this.cargarEstadisticas();
    this.cargarResumen();
  }

  cargarEstadisticas() {
    this.http.get<any>(`${this.apiUrl}/dashboard`).subscribe({
      next: (data) => {
        this.estadisticas = data;
        console.log('Estadísticas actualizadas:', data);
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
      }
    });
  }

  cargarResumen() {
    this.http.get<any[]>(`${this.apiUrl}/resumen`).subscribe({
      next: (data) => {
        this.resumenCitas = data;
      },
      error: (error) => {
        console.error('Error al cargar resumen:', error);
      }
    });
  }
}
