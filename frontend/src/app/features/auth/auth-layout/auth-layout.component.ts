import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

// RFC-019: marco compartido de las pantallas de acceso (selección de rol, logins y registro).
// Panel azul a la izquierda y contenido a la derecha. El selector de rol es navegación real:
// cada opción lleva a la ruta de su login, no cambia el formulario en la misma página.
@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './auth-layout.component.html',
  styleUrls: ['./auth-layout.component.css']
})
export class AuthLayoutComponent {
  /** Muestra el selector de rol de 3 opciones sobre el contenido. */
  @Input() mostrarSelectorRol = false;
  /** Ancho máximo del contenido; el registro necesita más espacio que un login. */
  @Input() ancho: 'normal' | 'ancho' = 'normal';
}
