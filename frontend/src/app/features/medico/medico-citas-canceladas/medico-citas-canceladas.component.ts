import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedicoService, Cita, MENSAJE_SIN_CONEXION } from '../services/medico.service';

@Component({
  selector: 'app-medico-citas-canceladas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './medico-citas-canceladas.component.html',
  styleUrls: ['./medico-citas-canceladas.component.css']
})
export class MedicoCitasCanceladasComponent implements OnInit {
  citas: Cita[] | null = null;
  error = '';

  constructor(private medicoService: MedicoService) {}

  ngOnInit() {
    this.medicoService.getCitasByStatus('Cancelada').subscribe({
      next: (citas) => this.citas = citas,
      error: () => this.error = MENSAJE_SIN_CONEXION
    });
  }
}
