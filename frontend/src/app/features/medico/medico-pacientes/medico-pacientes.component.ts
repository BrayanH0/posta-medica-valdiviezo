import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedicoService, PacienteMedico, MENSAJE_SIN_CONEXION } from '../services/medico.service';

@Component({
  selector: 'app-medico-pacientes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './medico-pacientes.component.html',
  styleUrls: ['./medico-pacientes.component.css']
})
export class MedicoPacientesComponent implements OnInit {

  pacientes: PacienteMedico[] | null = null;
  error = '';
  selectedPaciente: PacienteMedico | null = null;

  constructor(private medicoService: MedicoService) {}

  ngOnInit() {
    // Solo los pacientes que tienen citas con el médico de la sesión
    this.medicoService.getPacientes().subscribe({
      next: (pacientes) => this.pacientes = pacientes,
      error: () => this.error = MENSAJE_SIN_CONEXION
    });
  }

  openModal(paciente: PacienteMedico) {
    this.selectedPaciente = paciente;
  }

  closeModal() {
    this.selectedPaciente = null;
  }
}
