import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { ServicePaciente } from '../../services/service-paciente';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { paciente } from '../../../../models/model-paciente';

@Component({
  selector: 'app-detalle-paciente',
  imports: [CommonModule],
  templateUrl: './detalle-paciente.html',
  styleUrl: './detalle-paciente.css',
})
export class DetallePaciente {
  @Input('id') id!: number
  private pacienteservice = inject(ServicePaciente)

  constructor(public router: Router, private activeModal: NgbActiveModal) {

  }

  ngOnInit(): void {
    if (this.id != 0) {
      this.obtener(this.id);
    }
  }

  cerrar() {
    this.activeModal.close('');
  }

  guardar() {
    const obj: paciente = {
      nombres: String($('#txt_nombres').val()),
      apellidos: String($('#txt_apellidos').val()),
      dni: String($('#txt_dni').val()),
      fecha_nacimiento: String($('#txt_fecha_nacimiento').val()),
      sexo: String($('#txt_sexo').val()),
      id_estado_paciente: Number($('#txt_id_estado_paciente').val()),
      id_ubigeo: Number($('#txt_ubigeo').val())
    };
    if (this.id === 0) {
      this.pacienteservice.crearPaciente(obj).subscribe({
        next: () => {
          this.cerrar();
        }
      });
    } else {
      this.pacienteservice.actualizarPaciente(obj, this.id).subscribe({
        next: () => {
          this.cerrar();
        }
      });
    }
  }


  obtener(id: number) {
    this.pacienteservice.obtenerPaciente(id).subscribe({
      next: (data) => {
        $("#txt_nombres").val(data.nombres);
        $("#txt_apellidos").val(data.apellidos);
        $("#txt_dni").val(data.dni);
        $("#txt_fecha_nacimiento").val(data.fecha_nacimiento);
        $("#txt_sexo").val(data.sexo);
        $("#txt_id_estado_paciente").val(data.id_estado_paciente);
        $("#txt_ubigeo").val(data.id_ubigeo);
      },
    });
  }
}
