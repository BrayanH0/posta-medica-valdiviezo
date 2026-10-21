import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedicoService, Cita, MENSAJE_SIN_CONEXION } from '../services/medico.service';

// Citas en estado "Confirmada" (la ruta y el archivo conservan el nombre "aprobadas"; ver RFC-003)
@Component({
  selector: 'app-medico-citas-aprobadas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './medico-citas-aprobadas.component.html',
  styleUrls: ['./medico-citas-aprobadas.component.css']
})
export class MedicoCitasAprobadasComponent implements OnInit {
  citas: Cita[] | null = null;
  error = '';

  constructor(private medicoService: MedicoService) {}

  ngOnInit() {
    this.medicoService.getCitasByStatus('Confirmada').subscribe({
      next: (citas) => this.citas = citas,
      error: () => this.error = MENSAJE_SIN_CONEXION
    });
  }
}
