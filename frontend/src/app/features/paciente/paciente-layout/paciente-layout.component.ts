import { Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

// RFC-019 (Parte 2): marco compartido de las pantallas del paciente. Menú lateral blanco con el
// ítem activo en azul claro y "Cerrar Sesión" al final (AUD-DIS-11). Es solo presentación: la
// navegación usa las mismas rutas y el cierre de sesión llama a AuthService.logout, igual que antes.
//
// En celular (≤ 900 px) el menú es un cajón que entra desde la izquierda sobre el contenido, con fondo oscuro,
// y la barra superior con el botón de menú queda fija al hacer scroll. No depende de nada del paciente: para
// reutilizarlo en los paneles del médico y del administrador basta cambiar el menú (los enlaces) de la plantilla.
@Component({
  selector: 'app-paciente-layout',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './paciente-layout.component.html',
  styleUrls: ['./paciente-layout.component.css']
})
export class PacienteLayoutComponent implements OnDestroy {
  /** En celular el cajón del menú está abierto; en pantalla ancha el menú siempre está visible. */
  menuAbierto = false;

  @ViewChild('cajon') cajon?: ElementRef<HTMLElement>;
  @ViewChild('botonMenu') botonMenu?: ElementRef<HTMLElement>;

  private temporizadorFoco?: ReturnType<typeof setTimeout>;

  constructor(private router: Router, private authService: AuthService) {}

  alternarMenu() {
    if (this.menuAbierto) {
      this.cerrarMenu();
    } else {
      this.abrirMenu();
    }
  }

  abrirMenu() {
    this.menuAbierto = true;
    this.bloquearScroll(true);
    // El cajón pasa a ser visible al terminar este ciclo; después se le da el foco
    this.temporizadorFoco = setTimeout(() => this.cajon?.nativeElement.focus());
  }

  cerrarMenu() {
    if (!this.menuAbierto) return;
    // Si se cierra antes de que el cajón llegue a tomar el foco, ese foco pendiente ya no debe aplicarse
    clearTimeout(this.temporizadorFoco);
    this.menuAbierto = false;
    this.bloquearScroll(false);
    this.botonMenu?.nativeElement.focus();
  }

  /** La tecla Escape cierra el cajón del celular. */
  @HostListener('document:keydown.escape')
  alPulsarEscape() {
    this.cerrarMenu();
  }

  /** Si la ventana pasa a ser ancha con el cajón abierto, el menú vuelve a ser el lateral y se suelta el scroll. */
  @HostListener('window:resize')
  alCambiarTamano() {
    if (this.menuAbierto && window.innerWidth > 900) {
      this.menuAbierto = false;
      this.bloquearScroll(false);
    }
  }

  ngOnDestroy() {
    // Cada pantalla del paciente crea su propio layout: al navegar con el cajón abierto no debe quedar el scroll bloqueado
    this.bloquearScroll(false);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login-selection']);
  }

  /** Con el cajón abierto la página de atrás no se desplaza (y conserva su posición). */
  private bloquearScroll(bloquear: boolean) {
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('ui-sin-scroll', bloquear);
    }
  }
}
