import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-paciente',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login-paciente.html'
})
export class LoginPacienteComponent {
  dni = '';
  clave = '';
  mostrarClave = false;

  constructor(private authService: AuthService, private router: Router) {}

  toggleMostrarClave() {
    this.mostrarClave = !this.mostrarClave;
  }

  login() {
    this.authService.login(this.dni, this.clave).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('role', 'PACIENTE');
        this.router.navigate(['/welcome']); // Dashboard paciente
      },
      error: (err) => {
        alert('Credenciales incorrectas');
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/registro']);
  }
}