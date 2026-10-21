import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedicoService, Cita, MENSAJE_SIN_CONEXION } from '../services/medico.service';

@Component({
  selector: 'app-medico-citas-pendientes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './medico-citas-pendientes.component.html',
  styleUrls: ['./medico-citas-pendientes.component.css']
})
export class MedicoCitasPendientesComponent implements OnInit {

  citas: Cita[] | null = null;
  error = '';
  selectedCita: Cita | null = null;
  actionType: 'aceptar' | 'cancelar' | null = null;

  constructor(private medicoService: MedicoService) {}

  ngOnInit() {
    this.cargarCitas();
  }

  cargarCitas() {
    this.medicoService.getCitasByStatus('Pendiente').subscribe({
      next: (citas) => {
        this.citas = citas;
        this.error = '';
      },
      error: () => {
        this.citas = null;
        this.error = MENSAJE_SIN_CONEXION;
      }
    });
  }

  confirmAction(cita: Cita, action: 'aceptar' | 'cancelar') {
    this.selectedCita = cita;
    this.actionType = action;
  }

  closeModal() {
    this.selectedCita = null;
    this.actionType = null;
  }

  executeAction() {
    if (this.selectedCita && this.actionType) {
      const nuevoEstado = this.actionType === 'aceptar' ? 'Confirmada' : 'Cancelada';
      this.medicoService.updateCitaStatus(this.selectedCita.idCita, nuevoEstado).subscribe({
        next: () => {
          this.closeModal();
          this.cargarCitas();
        },
        error: () => {
          this.closeModal();
          this.citas = null;
          this.error = MENSAJE_SIN_CONEXION;
        }
      });
    }
  }
}
