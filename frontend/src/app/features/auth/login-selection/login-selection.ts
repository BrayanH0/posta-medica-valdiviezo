import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-selection',
  standalone: true,
  templateUrl: './login-selection.html',
  styles: [`
    .welcome-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      background-color: #f0f2f5;
    }
    .card {
      padding: 2rem;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      background: white;
      text-align: center;
      max-width: 400px;
      width: 100%;
    }
    .btn-role {
      display: block;
      width: 100%;
      padding: 1rem;
      margin: 10px 0;
      font-size: 1.2rem;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .btn-role:hover {
      transform: scale(1.02);
    }
    .btn-paciente {
      background-color: #007bff;
      color: white;
    }
    .btn-admin {
      background-color: #28a745;
      color: white;
    }
  `]
})
export class LoginSelectionComponent {
  constructor(private router: Router) {}

  goToLogin(role: string) {
    if (role === 'paciente') {
      this.router.navigate(['/login-paciente']);
    } else {
      this.router.navigate(['/login-admin']);
    }
  }
}
