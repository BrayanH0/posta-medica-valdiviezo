import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ServicePaciente } from '../features/paciente/services/service-paciente';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './registro.html'
})
export class RegistroComponent {
  paciente: any = {
    nombres: '',
    apellidos: '',
    dni: '',
    clave: '',
    fecha_nacimiento: '',
    sexo: '',
    telefono: '',
    id_estado_paciente: 1, // Activo por defecto
    id_ubigeo: 1 // Default por ahora
  };

  constructor(private pacienteService: ServicePaciente, private router: Router) {}

  registrar() {
    this.pacienteService.crearPaciente(this.paciente).subscribe({
      next: (res) => {
        alert('Registro exitoso. Por favor inicie sesión.');
        this.router.navigate(['/login-paciente']);
      },
      error: (err) => {
        console.error(err);
        alert('Error al registrar');
      }
    });
  }
}