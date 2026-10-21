import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth';
import { LOGIN_PACIENTE, guardarSesion, mensajeErrorLogin, resolverRespuestaLogin, validarDniPeruano, validarFormularioLogin } from '../login-comun';

@Component({
  selector: 'app-login-paciente',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './login-paciente.component.html',
  styleUrls: ['./login-paciente.component.css']
})
export class LoginPacienteComponent {
  dni = '';
  clave = '';
  mostrarClave = false;
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  toggleMostrarClave() {
    this.mostrarClave = !this.mostrarClave;
  }

  validarDniPeruano(dni: string): boolean {
    return validarDniPeruano(dni);
  }

  login() {
    this.error = validarFormularioLogin(this.dni, this.clave);
    if (this.error) return;

    console.log('Intentando login paciente:', this.dni);
    this.authService.login(this.dni, this.clave).subscribe({
        next: (res: any) => {
            console.log('Login exitoso', res);
            const resultado = resolverRespuestaLogin(res, LOGIN_PACIENTE);
            if ('ruta' in resultado) {
                // La sesión se guarda solo si el usuario es paciente
                guardarSesion(res, LOGIN_PACIENTE);
                this.router.navigate([resultado.ruta]);
            } else {
                this.error = resultado.error;
            }
        },
        error: (err: any) => {
            console.error('Error login', err);
            // Si el login falla no se guarda sesión ni se entra al sistema
            this.error = mensajeErrorLogin(err);
        }
    });
  }
}
