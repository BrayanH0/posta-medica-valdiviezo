import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedicoService, Cita } from '../services/medico.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-medico-citas-aprobadas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './medico-citas-aprobadas.component.html',
  styleUrls: ['./medico-citas-aprobadas.component.css']
})
export class MedicoCitasAprobadasComponent implements OnInit {
  citas$: Observable<Cita[]> | undefined;

  constructor(private medicoService: MedicoService) {}

  ngOnInit() {
    this.citas$ = this.medicoService.getCitasByStatus('Aprobada');
  }
}
