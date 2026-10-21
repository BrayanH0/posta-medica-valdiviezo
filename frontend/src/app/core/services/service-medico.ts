import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { appsettings } from '../config/appsettings';
import { medico } from '../../shared/models/model-medico';
import { Observable } from 'rxjs';
import { MedicoEspecialidad } from '../../shared/models/model-medico-especialidad';
import { Especialidad } from '../../shared/models/model-especialidad';

@Injectable({
  providedIn: 'root',
})
export class ServiceMedico {
  private htpp = inject(HttpClient);
  private urlservice = appsettings.apiUrl + "api/medico";
  private urlespecialidad = appsettings.apiUrl + "api/especialidad";

  constructor() { }

  listarmedicos() {
    return this.htpp.get<medico[]>(this.urlservice);
  }

  crear(objeto: medico) {
    return this.htpp.post<medico>(this.urlservice + "/crear", objeto);
  }

  obtener(id: number) {
    return this.htpp.get<medico>(`${this.urlservice}/codigo/${id}`);
  }

  actualizar(obj: medico, id: number) {
    return this.htpp.put<medico>(`${this.urlservice}/actualizar/${id}`, obj);
  }

  eliminar(id: number) {
    return this.htpp.delete<medico>(`${this.urlservice}/eliminar/${id}`);
  }

  getMedicosConEspecialidad(): Observable<MedicoEspecialidad[]> {
    return this.htpp.get<MedicoEspecialidad[]>(`${this.urlservice}/conEspecialidad`);
  }

  getEspecialidades(): Observable<Especialidad[]> {
    return this.htpp.get<Especialidad[]>(`${this.urlespecialidad}/especialidad`);
  }
}
