import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth';
import { LOGIN_ADMIN, guardarSesion, mensajeErrorLogin, resolverRespuestaLogin, validarDniPeruano, validarFormularioLogin } from '../login-comun';

@Component({
  selector: 'app-login-admin',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './login-admin.component.html',
  styleUrls: ['./login-admin.component.css']
})
export class LoginAdminComponent {
  usuario = '';
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
    this.error = validarFormularioLogin(this.usuario, this.clave);
    if (this.error) return;

    this.authService.login(this.usuario, this.clave).subscribe({
      next: (response) => {
        const resultado = resolverRespuestaLogin(response, LOGIN_ADMIN);
        if ('ruta' in resultado) {
          // Guardar la sesión con el mismo esquema que paciente y médico
          guardarSesion(response, LOGIN_ADMIN);
          this.router.navigate([resultado.ruta]);
        } else {
          this.error = resultado.error;
        }
      },
      error: (error) => {
        console.error('Error en login:', error);
        this.error = mensajeErrorLogin(error);
      }
    });
  }
}
