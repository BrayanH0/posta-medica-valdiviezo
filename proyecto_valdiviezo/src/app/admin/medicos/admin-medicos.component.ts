import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServiceMedico } from '../../features/medico/services/service-medico';
import { MedicoEspecialidad } from '../../models/model-medico-especialidad';

@Component({
  selector: 'app-admin-medicos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-medicos.component.html',
  styleUrls: ['./admin-medicos.component.css']
})
export class AdminMedicosComponent implements OnInit {
  medicos: MedicoEspecialidad[] = [];

  constructor(private serviceMedico: ServiceMedico) {}

  ngOnInit() {
    this.cargarMedicos();
  }

  cargarMedicos() {
    this.serviceMedico.getMedicosConEspecialidad().subscribe({
      next: (data) => {
        this.medicos = data;
      },
      error: (err) => {
        console.error('Error al cargar médicos:', err);
      }
    });
  }
}
