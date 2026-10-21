import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-admin',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login-admin.html'
})
export class LoginAdminComponent {
  dni = '';
  clave = '';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.authService.login(this.dni, this.clave).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('role', 'ADMIN');
        this.router.navigate(['/medico']); // Dashboard admin/medico
      },
      error: (err) => {
        alert('Credenciales incorrectas');
      }
    });
  }
}