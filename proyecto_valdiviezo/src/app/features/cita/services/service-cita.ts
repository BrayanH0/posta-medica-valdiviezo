import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { appsettings } from '../../../config/appsettings';
import { Cita, EstadisticasCitas, CitasPorEspecialidad } from '../../../models/model-cita';
import { EstadoCitaCant } from '../../../models/model-cant-estado-cita';
import { IngresoMensual } from '../../../models/model-ingresos-mensuales';

@Injectable({
  providedIn: 'root',
})
export class ServiceCita {
  private http = inject(HttpClient);
  private urlService = appsettings.apiUrl + "api/cita";

  listarCitas(): Observable<Cita[]> {
    return this.http.get<Cita[]>(this.urlService);
  }

  obtenerEstadisticas(): Observable<EstadisticasCitas> {
    return this.http.get<EstadisticasCitas>(`${this.urlService}/estadisticas`);
  }

  obtenerCitasPorEspecialidad(): Observable<CitasPorEspecialidad[]> {
    return this.http.get<CitasPorEspecialidad[]>(`${this.urlService}/por-especialidad`);
  }

  obtenerCitasPorEstado(): Observable<EstadoCitaCant[]> {
    return this.http.get<EstadoCitaCant[]>(`${this.urlService}/porEstado`)
  }

  obtenerCantCitasPorEspecialidad(): Observable<CitasPorEspecialidad[]> {
    return this.http.get<CitasPorEspecialidad[]>(`${this.urlService}/porEspecialidad`);
  }

  obtenerIngresosMensuales(): Observable<IngresoMensual[]> {
    return this.http.get<IngresoMensual[]>(`http://localhost:8080/api/reportes/ingresosMensuales`);
  }
}
