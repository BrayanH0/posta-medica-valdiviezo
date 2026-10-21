import { Routes } from '@angular/router';
import { LoginSelectionComponent } from './features/auth/login-selection/login-selection.component';
import { LoginPacienteComponent } from './features/auth/login-paciente/login-paciente.component';
import { LoginMedicoComponent } from './features/auth/login-medico/login-medico.component';
import { LoginAdminComponent } from './features/auth/login-admin/login-admin.component';
import { RegistroComponent } from './features/auth/registro/registro.component';
import { WelcomeComponent } from './features/paciente/welcome/welcome.component';
import { MedicoDashboardComponent } from './features/medico/medico-dashboard.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login-selection', pathMatch: 'full' },
    { path: 'login-selection', component: LoginSelectionComponent },
    { path: 'login-paciente', component: LoginPacienteComponent },
    { path: 'login-medico', component: LoginMedicoComponent },
    { path: 'login-admin', component: LoginAdminComponent },
    { path: 'registro', component: RegistroComponent },
    { path: 'welcome', component: WelcomeComponent },
    {
        path: 'medico-dashboard',
        component: MedicoDashboardComponent,
        children: [
            { path: '', loadComponent: () => import('./features/medico/medico-inicio/medico-inicio.component').then(m => m.MedicoInicioComponent) },
            { path: 'pacientes', loadComponent: () => import('./features/medico/medico-pacientes/medico-pacientes.component').then(m => m.MedicoPacientesComponent) },
            { path: 'citas-pendientes', loadComponent: () => import('./features/medico/medico-citas-pendientes/medico-citas-pendientes.component').then(m => m.MedicoCitasPendientesComponent) },
            { path: 'citas-aprobadas', loadComponent: () => import('./features/medico/medico-citas-aprobadas/medico-citas-aprobadas.component').then(m => m.MedicoCitasAprobadasComponent) },
            { path: 'citas-canceladas', loadComponent: () => import('./features/medico/medico-citas-canceladas/medico-citas-canceladas.component').then(m => m.MedicoCitasCanceladasComponent) }
        ]
    },

    // Patient Routes
    { path: 'paciente/registrar-cita', loadComponent: () => import('./features/paciente/registrar-cita/registrar-cita.component').then(m => m.RegistrarCitaComponent) },
    { path: 'paciente/mis-citas', loadComponent: () => import('./features/paciente/mis-citas/mis-citas.component').then(m => m.MisCitasComponent) },
    { path: 'paciente/historial-medico', loadComponent: () => import('./features/paciente/historial-medico/historial-medico.component').then(m => m.HistorialMedicoComponent) },

    // Old routes kept if needed, but 'paciente' might conflict if not careful.
    {
        path: 'medico',
        loadComponent: () =>
            import('./features/admin/legacy/main-medico/main-medico')
                .then(m => m.MainMedico)
    },
    {
        path: 'gestion-pacientes-legacy', // Renamed to avoid conflict if user meant admin management
        loadComponent: () =>
            import('./features/paciente/legacy/main-paciente/main-paciente')
                .then(m => m.MainPaciente)
    },

    // Admin Routes
    {
        path: 'admin',
        loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
        children: [
            { path: '', pathMatch: 'full', redirectTo: 'inicio' },
            { path: 'inicio', loadComponent: () => import('./features/admin/inicio/admin-inicio.component').then(m => m.AdminInicioComponent) },
            { path: 'pacientes', loadComponent: () => import('./features/admin/pacientes/admin-pacientes.component').then(m => m.AdminPacientesComponent) },
            { path: 'medicos', loadComponent: () => import('./features/admin/medicos/admin-medicos.component').then(m => m.AdminMedicosComponent) },
            { path: 'reportes', loadComponent: () => import('./features/admin/reportes/admin-reportes.component').then(m => m.AdminReportesComponent) },
            { path: 'cant-estado-cita', loadComponent: () => import('./features/admin/cant-estado-cita/cant-estado-cita').then(m => m.CantEstadoCita) }

        ]
    }
];
