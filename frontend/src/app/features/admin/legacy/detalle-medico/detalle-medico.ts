import { Component, inject, Input } from '@angular/core';
import { ServiceMedico } from '../../../../core/services/service-medico';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { medico } from '../../../../shared/models/model-medico';
import $ from 'jquery';
import { Especialidad } from '../../../../shared/models/model-especialidad';

@Component({
  selector: 'app-detalle-medico',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalle-medico.html',
  styleUrls: ['./detalle-medico.css']
})
export class DetalleMedico {
  @Input('id') id!: number
  public especialidades: Especialidad[] = [];
  private medicoservice = inject(ServiceMedico);

  constructor(public router: Router, private activeModal: NgbActiveModal) {

  }

  ngOnInit(): void {
    this.medicoservice.getEspecialidades().subscribe({
      next: (data) => {
        this.especialidades = data;
      }
    });

    if (this.id != 0) {
      this.obtener(this.id);
    }
  }

  cerrar() {
    this.activeModal.close('');
  }

  guardar() {
    const obj: medico = {
      nombres: String($('#txt_nombres').val()),
      apellidos: String($('#txt_apellidos').val()),
      cmp: String($('#txt_cmp').val()),
      id_especialidad: Number($('#combo_especialidad').val())
    };

    if (this.id === 0) {
      this.medicoservice.crear(obj).subscribe({
        next: () => {
          this.cerrar();
        }
      });
    } else {
      this.medicoservice.actualizar(obj, this.id).subscribe({
        next: () => {
          this.cerrar();
        }
      });
    }
  }

  obtener(id: number) {
    this.medicoservice.obtener(id).subscribe({
      next: (data) => {
        $("#txt_nombres").val(data.nombres);
        $("#txt_apellidos").val(data.apellidos);
        $("#txt_cmp").val(data.cmp);
        $("#combo_especialidad").val(data.id_especialidad);
      },
    });
  }

}
