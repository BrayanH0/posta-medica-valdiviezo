import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-inicio',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="welcome-container">
      <div class="hero">
        <h2>Bienvenido al Panel de Administración</h2>
        <p class="subtitle">Sistema de Gestión de Posta Médica Valdiviezo</p>
      </div>

      <div class="quick-stats">
         <div class="card">
            <h3>Gestión</h3>
            <p>Acceda a los módulos de Pacientes y Médicos para administrar el personal y usuarios.</p>
         </div>
         <div class="card">
            <h3>Reportes</h3>
            <p>Revise las estadísticas en tiempo real y el resumen de citas.</p>
         </div>
      </div>
    </div>
  `,
  styles: [`
    .welcome-container { padding: 2rem; }
    .hero { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 3rem; border-radius: 10px; margin-bottom: 2rem; text-align: center; }
    .subtitle { font-size: 1.2rem; opacity: 0.9; }
    .quick-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; }
    .card { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
  `]
})
export class AdminInicioComponent { }
