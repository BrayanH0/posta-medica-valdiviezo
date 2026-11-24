import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

// RFC-019 (Parte 2): marco compartido de las pantallas del paciente. Menú lateral blanco con el
// ítem activo en azul claro y "Cerrar Sesión" al final (AUD-DIS-11). Es solo presentación: la
// navegación usa las mismas rutas y el cierre de sesión llama a AuthService.logout, igual que antes.
@Component({
  selector: 'app-paciente-layout',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './paciente-layout.component.html',
  styleUrls: ['./paciente-layout.component.css']
})
export class PacienteLayoutComponent {
  /** En celular el menú se despliega con un botón; en pantalla ancha siempre está visible. */
  menuAbierto = false;

  constructor(private router: Router, private authService: AuthService) {}

  alternarMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  cerrarMenu() {
    this.menuAbierto = false;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login-selection']);
  }
}
