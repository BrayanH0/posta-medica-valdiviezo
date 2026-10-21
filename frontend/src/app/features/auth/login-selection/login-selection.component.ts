import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-selection',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './login-selection.component.html',
  styleUrls: ['./login-selection.component.css']
})
export class LoginSelectionComponent {
  constructor(private router: Router) {}

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
