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
  // true mientras se espera la respuesta del servidor: evita el doble envío (RFC-015)
  procesando = false;
  // Mensaje que confirma al médico la acción guardada (RFC-015)
  mensaje = '';

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
    if (this.procesando) return;
    this.mensaje = '';
    this.selectedCita = cita;
    this.actionType = action;
  }

  closeModal() {
    if (this.procesando) return;
    this.selectedCita = null;
    this.actionType = null;
  }

  executeAction() {
    if (this.procesando || !this.selectedCita || !this.actionType) return;
    const idCita = this.selectedCita.idCita;
    const nuevoEstado = this.actionType === 'aceptar' ? 'Confirmada' : 'Cancelada';
    this.procesando = true;
    this.medicoService.updateCitaStatus(idCita, nuevoEstado).subscribe({
      next: () => {
        this.procesando = false;
        this.closeModal();
        this.mensaje = `Cita ${idCita} ${nuevoEstado === 'Confirmada' ? 'confirmada' : 'cancelada'}.`;
        this.cargarCitas();
      },
      error: () => {
        this.procesando = false;
        this.closeModal();
        this.citas = null;
        this.error = MENSAJE_SIN_CONEXION;
      }
    });
  }
}
