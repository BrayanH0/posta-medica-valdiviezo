// Pruebas unitarias de caracterización (tarea 9) del cierre de sesión de welcome y admin-dashboard.
// Router es un doble de prueba. AuthService es un doble en las pruebas de llamada; en las de
// "borra la sesión" se usa el AuthService real con un HttpClient falso (logout no usa HTTP).
import { AuthService } from '../../../core/services/auth';
import { WelcomeComponent } from './welcome.component';
import { AdminDashboardComponent } from '../../admin/dashboard/admin-dashboard.component';

describe('Cierre de sesión (caracterización)', () => {
  let router: jasmine.SpyObj<any>;

  function sesionDePrueba() {
    localStorage.setItem('userId', '5');
    localStorage.setItem('userName', 'Nombre Prueba');
    localStorage.setItem('userType', 'paciente');
    localStorage.setItem('otraClave', 'x');
  }

  beforeEach(() => {
    localStorage.clear();
    router = jasmine.createSpyObj('Router', ['navigate']);
  });

  afterEach(() => localStorage.clear());

  it('U24 welcome: llama a AuthService.logout y navega a /login-selection', () => {
    const auth = jasmine.createSpyObj('AuthService', ['logout']);
    new WelcomeComponent(router, auth).logout();

    expect(auth.logout).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledWith(['/login-selection']);
  });

  it('U25 welcome: borra toda la sesión del navegador', () => {
    sesionDePrueba();
    new WelcomeComponent(router, new AuthService({} as any)).logout();

    expect(localStorage.length).toBe(0);
    expect(router.navigate).toHaveBeenCalledWith(['/login-selection']);
  });

  it('U26 admin-dashboard: llama a AuthService.logout y navega a /login-selection', () => {
    const auth = jasmine.createSpyObj('AuthService', ['logout']);
    new AdminDashboardComponent(router, auth).logout();

    expect(auth.logout).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledWith(['/login-selection']);
  });

  it('U27 admin-dashboard: borra toda la sesión del navegador', () => {
    sesionDePrueba();
    new AdminDashboardComponent(router, new AuthService({} as any)).logout();

    expect(localStorage.length).toBe(0);
    expect(router.navigate).toHaveBeenCalledWith(['/login-selection']);
  });
});
