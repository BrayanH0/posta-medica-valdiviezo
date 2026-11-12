import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

// Login de cada rol (el valor de userType que guarda login-comun.ts)
const LOGIN_DEL_ROL: Record<string, string> = {
  paciente: '/login-paciente',
  medico: '/login-medico',
  administrador: '/login-admin',
};

// RFC-011 (AUD-DIS-14, AUD-PRI-05): solo entra a las pantallas de un rol quien tiene una sesión de ese rol.
// Es una ayuda de navegación: la protección real está en la API (el token se valida en el backend y,
// si vence, el interceptor cierra la sesión). Sin sesión del rol, se va al login de ese rol.
export function rolGuard(tipo: string): CanActivateFn {
  return () => {
    if (localStorage.getItem('userType') === tipo) {
      return true;
    }
    return inject(Router).parseUrl(LOGIN_DEL_ROL[tipo] ?? '/login-selection');
  };
}
