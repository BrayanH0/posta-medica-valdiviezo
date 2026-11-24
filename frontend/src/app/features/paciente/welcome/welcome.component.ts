import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { PacienteLayoutComponent } from '../paciente-layout/paciente-layout.component';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, RouterModule, PacienteLayoutComponent],
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent {
  // RFC-019: solo presentación. Primer nombre de "userName", que el login ya guarda (no se guarda nada nuevo).
  nombre: string = (localStorage.getItem('userName') || '').trim().split(/\s+/)[0] || 'paciente';

  constructor(private router: Router, private authService: AuthService) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/login-selection']);
  }
}
