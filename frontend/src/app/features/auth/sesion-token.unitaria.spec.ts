// U97 (RFC-011, tarea 26): el login guarda el token, cerrar sesión lo borra y la selección de login
// muestra el aviso cuando el interceptor cerró la sesión. Sin backend.
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { CLAVE_TOKEN, LOGIN_ADMIN, LOGIN_MEDICO, LOGIN_PACIENTE, guardarSesion } from './login-comun';
import { AuthService } from '../../core/services/auth';
import { LoginSelectionComponent, MENSAJE_SESION_EXPIRADA } from './login-selection/login-selection.component';

describe('Token de sesión (RFC-011)', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('guardarSesion guarda el token de la respuesta de /login en los 3 roles', () => {
    for (const [config, tipo] of [[LOGIN_PACIENTE, 'paciente'], [LOGIN_MEDICO, 'medico'], [LOGIN_ADMIN, 'administrador']] as const) {
      localStorage.clear();
      guardarSesion({ success: true, tipo, id: 4, nombres: 'N', apellidos: 'A', token: `t-${tipo}` }, config);
      expect(localStorage.getItem(CLAVE_TOKEN)).toBe(`t-${tipo}`);
      expect(localStorage.getItem('userType')).toBe(tipo);
    }
  });

  it('cerrar sesión borra el token', () => {
    guardarSesion({ success: true, tipo: 'paciente', id: 1, nombres: 'N', apellidos: 'A', token: 't' }, LOGIN_PACIENTE);
    new AuthService({} as any).logout();
    expect(localStorage.getItem(CLAVE_TOKEN)).toBeNull();
    expect(localStorage.length).toBe(0);
  });

  const seleccion = (query: Record<string, string>) =>
    new LoginSelectionComponent({} as any, { snapshot: { queryParamMap: convertToParamMap(query) } } as unknown as ActivatedRoute);

  it('la selección de login muestra el aviso solo si llega desde un 401', () => {
    expect(seleccion({ sesion: 'expirada' }).aviso).toBe(MENSAJE_SESION_EXPIRADA);
    expect(seleccion({}).aviso).toBe('');
  });
});
