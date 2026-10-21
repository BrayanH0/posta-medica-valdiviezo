import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth';
import { LOGIN_MEDICO, guardarSesion, mensajeErrorLogin, resolverRespuestaLogin, validarDniPeruano, validarFormularioLogin } from '../login-comun';

@Component({
  selector: 'app-login-medico',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './login-medico.component.html',
  styleUrls: ['./login-medico.component.css']
})
export class LoginMedicoComponent {
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

    console.log('Intentando login medico:', this.dni);
    this.authService.login(this.dni, this.clave).subscribe({
        next: (res: any) => {
            console.log('Login exitoso', res);
            const resultado = resolverRespuestaLogin(res, LOGIN_MEDICO);
            if ('ruta' in resultado) {
                // La sesión se guarda solo si el usuario es médico
                guardarSesion(res, LOGIN_MEDICO);
                this.router.navigate([resultado.ruta]);
            } else {
                this.error = resultado.error;
            }
        },
        error: (err: any) => {
            console.error('Error login', err);
            this.error = mensajeErrorLogin(err);
        }
    });
  }
}
