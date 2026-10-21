import { Routes } from '@angular/router';
import { LoginSelectionComponent } from './login-selection/login-selection.component';
import { LoginPacienteComponent } from './login-paciente/login-paciente.component';
import { LoginMedicoComponent } from './login-medico/login-medico.component';
import { LoginAdminComponent } from './login-admin/login-admin.component';
import { RegistroComponent } from './registro/registro.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { MedicoDashboardComponent } from './medico-dashboard/medico-dashboard.component';

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
            { path: '', loadComponent: () => import('./medico-dashboard/medico-inicio/medico-inicio.component').then(m => m.MedicoInicioComponent) },
            { path: 'pacientes', loadComponent: () => import('./medico-dashboard/medico-pacientes/medico-pacientes.component').then(m => m.MedicoPacientesComponent) },
            { path: 'citas-pendientes', loadComponent: () => import('./medico-dashboard/medico-citas-pendientes/medico-citas-pendientes.component').then(m => m.MedicoCitasPendientesComponent) },
            { path: 'citas-aprobadas', loadComponent: () => import('./medico-dashboard/medico-citas-aprobadas/medico-citas-aprobadas.component').then(m => m.MedicoCitasAprobadasComponent) },
            { path: 'citas-canceladas', loadComponent: () => import('./medico-dashboard/medico-citas-canceladas/medico-citas-canceladas.component').then(m => m.MedicoCitasCanceladasComponent) }
        ]
    },

    // Patient Routes
    { path: 'paciente/registrar-cita', loadComponent: () => import('./paciente/registrar-cita/registrar-cita.component').then(m => m.RegistrarCitaComponent) },
    { path: 'paciente/mis-citas', loadComponent: () => import('./paciente/mis-citas/mis-citas.component').then(m => m.MisCitasComponent) },
    { path: 'paciente/historial-medico', loadComponent: () => import('./paciente/historial-medico/historial-medico.component').then(m => m.HistorialMedicoComponent) },

    // Old routes kept if needed, but 'paciente' might conflict if not careful.
    {
        path: 'medico',
        loadComponent: () =>
            import('./features/medico/components/main-medico/main-medico')
                .then(m => m.MainMedico)
    },
    {
        path: 'gestion-pacientes-legacy', // Renamed to avoid conflict if user meant admin management
        loadComponent: () =>
            import('./features/paciente/components/main-paciente/main-paciente')
                .then(m => m.MainPaciente)
    },

    // Admin Routes
    {
        path: 'admin',
        loadComponent: () => import('./admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
        children: [
            { path: '', pathMatch: 'full', redirectTo: 'inicio' },
            { path: 'inicio', loadComponent: () => import('./admin/inicio/admin-inicio.component').then(m => m.AdminInicioComponent) },
            { path: 'pacientes', loadComponent: () => import('./admin/pacientes/admin-pacientes.component').then(m => m.AdminPacientesComponent) },
            { path: 'medicos', loadComponent: () => import('./admin/medicos/admin-medicos.component').then(m => m.AdminMedicosComponent) },
            { path: 'reportes', loadComponent: () => import('./admin/reportes/admin-reportes.component').then(m => m.AdminReportesComponent) },
            { path: 'cant-estado-cita', loadComponent: () => import('./admin/cant-estado-cita/cant-estado-cita').then(m => m.CantEstadoCita) }

        ]
    }
];
