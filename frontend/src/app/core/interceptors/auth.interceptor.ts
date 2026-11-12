import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { appsettings } from '../config/appsettings';
import { CLAVE_TOKEN } from '../../features/auth/login-comun';

// Parámetro con el que se llega a /login-selection cuando la API respondió 401
export const PARAM_SESION_EXPIRADA = 'sesion';

// RFC-011: agrega "Authorization: Bearer <token>" a cada petición a la API y, ante un 401 de la API
// (token vencido, inválido o ausente), borra la sesión y vuelve a la selección de login con un aviso.
// El 401 de POST /login no cuenta: son credenciales inválidas y lo muestra el formulario de login.
// Es un interceptor de clase (HTTP_INTERCEPTORS) para que también lo usen las pantallas que importan
// HttpClientModule en sus propios imports (mis-citas, historial-medico, registrar-cita).
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const esDeLaApi = req.url.startsWith(appsettings.apiUrl);
    const token = localStorage.getItem(CLAVE_TOKEN);
    const peticion = esDeLaApi && token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

    return next.handle(peticion).pipe(
      catchError((err: unknown) => {
        if (esDeLaApi && err instanceof HttpErrorResponse && err.status === 401 && !esLogin(req.url)) {
          localStorage.clear();
          this.router.navigate(['/login-selection'], { queryParams: { [PARAM_SESION_EXPIRADA]: 'expirada' } });
        }
        return throwError(() => err);
      })
    );
  }
}

function esLogin(url: string): boolean {
  return url === `${appsettings.apiUrl}login`;
}
