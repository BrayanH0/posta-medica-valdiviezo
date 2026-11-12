// U95 (RFC-011, tarea 26): AuthInterceptor. HttpClient de prueba (sin backend) y Router simulado.
import { TestBed } from '@angular/core/testing';
import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthInterceptor, PARAM_SESION_EXPIRADA } from './auth.interceptor';
import { CLAVE_TOKEN } from '../../features/auth/login-comun';

describe('AuthInterceptor (RFC-011)', () => {
  const API = 'http://localhost:8080/';
  let http: HttpClient;
  let backend: HttpTestingController;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    localStorage.clear();
    router = jasmine.createSpyObj('Router', ['navigate']);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        { provide: Router, useValue: router },
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    backend.verify();
    localStorage.clear();
  });

  it('agrega Authorization: Bearer <token> a las peticiones a la API', () => {
    localStorage.setItem(CLAVE_TOKEN, 'abc.def.ghi');
    http.get(`${API}api/cita`).subscribe();
    const req = backend.expectOne(`${API}api/cita`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer abc.def.ghi');
    req.flush([]);
  });

  it('sin token no agrega la cabecera', () => {
    http.get(`${API}api/especialidad`).subscribe();
    const req = backend.expectOne(`${API}api/especialidad`);
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush([]);
  });

  it('no envía el token a otros sitios', () => {
    localStorage.setItem(CLAVE_TOKEN, 'abc.def.ghi');
    http.get('https://otro-sitio.example/datos').subscribe();
    const req = backend.expectOne('https://otro-sitio.example/datos');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('ante un 401 de la API borra la sesión y vuelve a la selección de login con el aviso', () => {
    localStorage.setItem(CLAVE_TOKEN, 'vencido');
    localStorage.setItem('userId', '1');
    localStorage.setItem('userType', 'paciente');
    let error: any;
    http.get(`${API}api/cita`).subscribe({ error: (e) => (error = e) });
    backend.expectOne(`${API}api/cita`).flush({ error: 'Debe iniciar sesión' }, { status: 401, statusText: 'Unauthorized' });

    expect(localStorage.length).toBe(0);
    expect(router.navigate).toHaveBeenCalledWith(['/login-selection'], { queryParams: { [PARAM_SESION_EXPIRADA]: 'expirada' } });
    expect(error.status).toBe(401); // el error sigue llegando a quien hizo la petición
  });

  it('el 401 de POST /login (credenciales inválidas) no cierra nada ni navega', () => {
    localStorage.setItem('otraClave', 'x');
    http.post(`${API}login`, {}).subscribe({ error: () => undefined });
    backend.expectOne(`${API}login`).flush({ error: 'Credenciales inválidas' }, { status: 401, statusText: 'Unauthorized' });

    expect(localStorage.getItem('otraClave')).toBe('x');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('un 403 no cierra la sesión', () => {
    localStorage.setItem(CLAVE_TOKEN, 't');
    http.get(`${API}usuarios`).subscribe({ error: () => undefined });
    backend.expectOne(`${API}usuarios`).flush({}, { status: 403, statusText: 'Forbidden' });

    expect(localStorage.getItem(CLAVE_TOKEN)).toBe('t');
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
