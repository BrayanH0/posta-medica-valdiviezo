import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { paciente } from '../../../models/model-paciente';
import { appsettings } from '../../../config/appsettings';

@Injectable({
  providedIn: 'root',
})
export class ServicePaciente {
  private htpp = inject(HttpClient);
  private urlService = appsettings.apiUrl + "api/paciente"

  constructor() { }

  listarPacientes() {
    return this.htpp.get<paciente[]>(this.urlService);
  }

  crearPaciente(obj: paciente) {
    return this.htpp.post<paciente>(this.urlService + "/crear", obj);
  }

  obtenerPaciente(id: number) {
    return this.htpp.get<paciente>(`${this.urlService}/codigo/${id}`);
  }

  actualizarPaciente(obj: paciente, id: number) {
    return this.htpp.put<paciente>(`${this.urlService}/actualizar/${id}`, obj);
  }

  eliminarPaciente(id: number) {
    // Backend ahora devuelve JSON con {status, message}
    return this.htpp.delete<{status: string, message: string}>(`${this.urlService}/eliminar/${id}`);
  }
}
