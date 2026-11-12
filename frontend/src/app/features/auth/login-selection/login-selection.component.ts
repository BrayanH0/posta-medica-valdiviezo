import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PARAM_SESION_EXPIRADA } from '../../../core/interceptors/auth.interceptor';

// RFC-011: aviso cuando AuthInterceptor cerró la sesión por un 401 de la API
export const MENSAJE_SESION_EXPIRADA = 'Su sesión expiró o no es válida. Inicie sesión nuevamente.';

@Component({
  selector: 'app-login-selection',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './login-selection.component.html',
  styleUrls: ['./login-selection.component.css']
})
export class LoginSelectionComponent {
  aviso = '';

  constructor(private router: Router, route: ActivatedRoute) {
    if (route.snapshot.queryParamMap.get(PARAM_SESION_EXPIRADA)) {
      this.aviso = MENSAJE_SESION_EXPIRADA;
    }
  }

  irALoginPaciente() {
    this.router.navigate(['/login-paciente']);
  }

  irALoginMedico() {
    this.router.navigate(['/login-medico']);
  }

  irALoginAdmin() {
    this.router.navigate(['/login-admin']);
  }
}
