import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedicoService, Cita } from '../services/medico.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-medico-citas-canceladas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './medico-citas-canceladas.component.html',
  styleUrls: ['./medico-citas-canceladas.component.css']
})
export class MedicoCitasCanceladasComponent implements OnInit {
  citas$: Observable<Cita[]> | undefined;

  constructor(private medicoService: MedicoService) {}

  ngOnInit() {
    this.citas$ = this.medicoService.getCitasByStatus('Cancelada');
  }
}
