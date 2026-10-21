import { Component, inject } from '@angular/core';
import { medico } from '../../../../shared/models/model-medico';
import { Router, RouterModule } from '@angular/router';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ServiceMedico } from '../../../../core/services/service-medico';
import { CommonModule } from '@angular/common';
import { DetalleMedico } from '../detalle-medico/detalle-medico';
import { MedicoEspecialidad } from '../../../../shared/models/model-medico-especialidad';

@Component({
  selector: 'app-main-medico',
  standalone: true,
  imports: [CommonModule, RouterModule, NgbModule], // DetalleMedico
  templateUrl: './main-medico.html',
  styleUrls: ['./main-medico.css']
})
export class MainMedico {
  public listamedicos: MedicoEspecialidad[] = [];
  private medicoservice = inject(ServiceMedico);

  constructor(private router: Router, private modalService: NgbModal) {
    this.listar();
  }

  listar() {
    this.medicoservice.getMedicosConEspecialidad().subscribe({
      next: (data) => {
        this.listamedicos = data;
        console.log(this.listamedicos);
      },
      error: (err) => {
        console.log("No se recuperaron registros");
      }
    });
  }

  nuevo() {
    const modalRef = this.modalService.open(DetalleMedico);
    modalRef.componentInstance.id = 0;

    modalRef.closed.subscribe(() => {
      this.listar();
    });
  }

  editar(obj: MedicoEspecialidad) {
    const modalRef = this.modalService.open(DetalleMedico);
    modalRef.componentInstance.id = obj.id_medico;

    modalRef.closed.subscribe(() => {
      this.listar();
    });
  }

  eliminar(obj: MedicoEspecialidad) {
    const id = obj.id_medico;
    if (id == null) {
      console.error("Eliminar: medico.id_medico no encontrado")
      return;
    }

    if (confirm(`Seguro que deseas eliminar al medico ${obj.nombre_medico} ${obj.apellido_medico}?`)) {
      this.medicoservice.eliminar(id).subscribe({
        next: () => {
          console.log("Medico eliminado correctamente");
          this.listar();
        },
        error: (err) => {
          console.error("Error al eliminar medico", err);
        },
      })
    }
  }
}
