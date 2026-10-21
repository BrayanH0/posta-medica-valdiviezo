import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistroCitaComponent } from '../features/cita/components/registro-cita/registro-cita';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, RegistroCitaComponent],
  templateUrl: './welcome.html',
  styles: [`
    /* Estilos opcionales para el dashboard */
  `]
})
export class WelcomeComponent {
  // Lógica del dashboard del paciente
}