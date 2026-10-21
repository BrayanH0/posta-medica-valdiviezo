import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedicoService, Cita } from '../services/medico.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-medico-citas-pendientes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './medico-citas-pendientes.component.html',
  styleUrls: ['./medico-citas-pendientes.component.css']
})
export class MedicoCitasPendientesComponent implements OnInit {

  citas$: Observable<Cita[]> | undefined;
  selectedCita: Cita | null = null;
  actionType: 'aceptar' | 'cancelar' | null = null;

  constructor(private medicoService: MedicoService) {}

  ngOnInit() {
    this.citas$ = this.medicoService.getCitasByStatus('Pendiente');
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
      const newStatus = this.actionType === 'aceptar' ? 'Aprobada' : 'Cancelada';
      this.medicoService.updateCitaStatus(this.selectedCita.id, newStatus);
      this.closeModal();
    }
  }
}
