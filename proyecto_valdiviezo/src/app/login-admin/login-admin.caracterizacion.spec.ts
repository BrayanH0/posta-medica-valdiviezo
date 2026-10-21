// Pruebas unitarias de caracterización (tarea 9): comprueban el comportamiento ACTUAL.
// AuthService y Router son dobles de prueba: no se llama al backend.
import { of, throwError } from 'rxjs';
import { LoginAdminComponent } from './login-admin.component';

describe('LoginAdminComponent (caracterización)', () => {
  let auth: jasmine.SpyObj<any>;
  let router: jasmine.SpyObj<any>;
  let component: LoginAdminComponent;

  beforeEach(() => {
    localStorage.clear();
    auth = jasmine.createSpyObj('AuthService', ['login']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    component = new LoginAdminComponent(auth, router);
    component.usuario = '11112222';
    component.clave = 'clave-prueba';
  });

  afterEach(() => localStorage.clear());

  it('U13 login de administrador: guarda userId, userName y userType y navega a /admin', () => {
    auth.login.and.returnValue(of({ success: true, tipo: 'administrador', id: 2, nombres: 'Rosa', apellidos: 'Leon', rol: 'ADMIN' }));

    component.login();

    expect(auth.login).toHaveBeenCalledWith('11112222', 'clave-prueba');
    expect(localStorage.getItem('userId')).toBe('2');
    expect(localStorage.getItem('userName')).toBe('Rosa Leon');
    expect(localStorage.getItem('userType')).toBe('administrador');
    expect(localStorage.length).toBe(3);
    expect(router.navigate).toHaveBeenCalledWith(['/admin']);
    expect(component.error).toBe('');
  });

  it('U14 usuario de otro rol: no guarda nada y muestra el mensaje de rol', () => {
    auth.login.and.returnValue(of({ success: true, tipo: 'medico', id: 3, nombres: 'Luis', apellidos: 'Paz' }));

    component.login();

    expect(localStorage.length).toBe(0);
    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.error).toBe('Este usuario no es un administrador. Use el login que le corresponde.');
  });

  it('U15 error 401: "Credenciales inválidas" y no guarda nada', () => {
    auth.login.and.returnValue(throwError(() => ({ status: 401 })));

    component.login();

    expect(localStorage.length).toBe(0);
    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.error).toBe('Credenciales inválidas');
  });

  it('U16 error de conexión (status 0): mensaje de conexión y no guarda nada', () => {
    auth.login.and.returnValue(throwError(() => ({ status: 0 })));

    component.login();

    expect(localStorage.length).toBe(0);
    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.error).toBe('No se pudo conectar con el servidor. Intente nuevamente.');
  });

  it('U17 error 500: muestra el mensaje de conexión aunque el servidor respondió (comportamiento actual, H-029)', () => {
    auth.login.and.returnValue(throwError(() => ({ status: 500 })));

    component.login();

    expect(localStorage.length).toBe(0);
    expect(component.error).toBe('No se pudo conectar con el servidor. Intente nuevamente.');
  });

  it('U18 DNI con formato inválido: no llama al servidor', () => {
    for (const dni of ['1234567', '123456789', '1234567a', '']) {
      component.usuario = dni;
      component.login();
      expect(component.error).toBe('DNI inválido. Debe contener 8 dígitos numéricos.');
    }
    expect(auth.login).not.toHaveBeenCalled();
    expect(localStorage.length).toBe(0);
  });
});
