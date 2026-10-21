import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth';

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
    // DNI peruano: 8 dígitos numéricos
    const dniRegex = /^\d{8}$/;
    return dniRegex.test(dni);
  }

  login() {
    this.error = '';

    // Validar DNI
    if (!this.validarDniPeruano(this.dni)) {
      this.error = 'DNI inválido. Debe contener 8 dígitos numéricos.';
      return;
    }

    if (!this.clave) {
      this.error = 'Por favor ingrese su contraseña.';
      return;
    }

    if (this.dni && this.clave) {
        console.log('Intentando login medico:', this.dni);
        this.authService.login(this.dni, this.clave).subscribe({
            next: (res: any) => {
                console.log('Login exitoso', res);
                if (res && res.success) {
                    // La sesión se guarda solo si el usuario es médico
                    if (res.tipo === 'medico') {
                        if (res.id) localStorage.setItem('userId', res.id.toString());
                        if (res.nombres) localStorage.setItem('userName', `${res.nombres} ${res.apellidos}`);
                        if (res.tipo) localStorage.setItem('userType', res.tipo);
                        this.router.navigate(['/medico-dashboard']);
                    } else {
                        this.error = 'Este usuario no es un médico. Use el login que le corresponde.';
                    }
                } else {
                    this.error = 'Respuesta inesperada del servidor';
                }
            },
            error: (err: any) => {
                console.error('Error login', err);
                if (err.status === 401) {
                    this.error = 'Credenciales inválidas';
                } else {
                    this.error = 'No se pudo conectar con el servidor. Intente nuevamente.';
                }
            }
        });
    }
  }
}
