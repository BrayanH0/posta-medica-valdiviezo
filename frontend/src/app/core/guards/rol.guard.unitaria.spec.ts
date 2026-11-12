// U96 (RFC-011, tarea 26, AUD-DIS-14): guarda de ruta por rol. Router real de Angular (sin rutas), sin backend.
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { rolGuard } from './rol.guard';

describe('rolGuard (RFC-011)', () => {
  const ruta = {} as ActivatedRouteSnapshot;
  const estado = {} as RouterStateSnapshot;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  afterEach(() => localStorage.clear());

  const evaluar = (tipo: string) => TestBed.runInInjectionContext(() => rolGuard(tipo)(ruta, estado));
  const destino = (r: unknown) => TestBed.inject(Router).serializeUrl(r as UrlTree);

  it('deja entrar a quien tiene sesión de ese rol', () => {
    localStorage.setItem('userType', 'medico');
    expect(evaluar('medico')).toBeTrue();
  });

  it('sin sesión manda al login del rol de la pantalla', () => {
    expect(destino(evaluar('paciente'))).toBe('/login-paciente');
    expect(destino(evaluar('medico'))).toBe('/login-medico');
    expect(destino(evaluar('administrador'))).toBe('/login-admin');
  });

  it('con sesión de otro rol tampoco entra', () => {
    localStorage.setItem('userType', 'paciente');
    expect(destino(evaluar('administrador'))).toBe('/login-admin');
    localStorage.setItem('userType', 'administrador');
    expect(destino(evaluar('medico'))).toBe('/login-medico');
  });
});
