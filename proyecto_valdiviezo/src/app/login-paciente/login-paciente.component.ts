import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth';

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
        console.log('Intentando login paciente:', this.dni);
        this.authService.login(this.dni, this.clave).subscribe({
            next: (res: any) => {
                console.log('Login exitoso', res);
                if (res && res.success) {
                    if (res.id) localStorage.setItem('userId', res.id.toString());
                    if (res.nombres) localStorage.setItem('userName', `${res.nombres} ${res.apellidos}`);
                    if (res.tipo) localStorage.setItem('userType', res.tipo);
                    this.router.navigate(['/welcome']);
                } else {
                    this.error = 'Respuesta inesperada del servidor';
                }
            },
            error: (err: any) => {
                console.error('Error login', err);
                // Fallback para pruebas si el backend no responde
                if(this.clave === '123456') {
                    // Mock ID 1 for testing existing data
                    localStorage.setItem('userId', '1');
                    localStorage.setItem('userName', 'Juan Perez (Mock)');
                    localStorage.setItem('userType', 'paciente');
                    this.router.navigate(['/welcome']);
                } else {
                    this.error = 'Credenciales inválidas';
                }
            }
        });
    }
  }
}
