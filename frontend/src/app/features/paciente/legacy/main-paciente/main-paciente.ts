import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistroCitaComponent } from '../registro-cita/registro-cita';

@Component({
  selector: 'app-main-paciente',
  standalone: true,
  imports: [CommonModule, RegistroCitaComponent],
  templateUrl: './main-paciente.html',
  styleUrls: ['./main-paciente.css']
})
export class MainPaciente {
  // Lógica del dashboard del paciente
}
