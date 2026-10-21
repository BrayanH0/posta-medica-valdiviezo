import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth';

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
    // DNI peruano: 8 dígitos numéricos
    const dniRegex = /^\d{8}$/;
    return dniRegex.test(dni);
  }

  login() {
    this.error = '';
    
    // Validar DNI
    if (!this.validarDniPeruano(this.usuario)) {
      this.error = 'DNI inválido. Debe contener 8 dígitos numéricos.';
      return;
    }
    
    if (!this.clave) {
      this.error = 'Por favor ingrese su contraseña.';
      return;
    }
    
    if (this.usuario && this.clave) {
        this.authService.login(this.usuario, this.clave).subscribe({
          next: (response) => {
            if (response.success && response.tipo === 'administrador') {
              // Guardar la sesión con el mismo esquema que paciente y médico
              localStorage.setItem('userId', response.id.toString());
              localStorage.setItem('userName', `${response.nombres} ${response.apellidos}`);
              localStorage.setItem('userType', response.tipo);

              this.router.navigate(['/admin']);
            } else if (response.success) {
              // Usuario válido pero de otro rol (paciente o médico)
              this.error = 'Este usuario no es un administrador. Use el login que le corresponde.';
            } else {
              this.error = 'Credenciales incorrectas';
            }
          },
          error: (error) => {
            console.error('Error en login:', error);
            if (error.status === 401) {
              this.error = 'Credenciales inválidas';
            } else {
              this.error = 'No se pudo conectar con el servidor. Intente nuevamente.';
            }
          }
        });
    }
  }
}
