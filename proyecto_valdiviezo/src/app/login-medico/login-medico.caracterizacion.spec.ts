// Pruebas unitarias de caracterización (tarea 9): comprueban el comportamiento ACTUAL.
// AuthService y Router son dobles de prueba: no se llama al backend.
import { of, throwError } from 'rxjs';
import { LoginMedicoComponent } from './login-medico.component';

describe('LoginMedicoComponent (caracterización)', () => {
  let auth: jasmine.SpyObj<any>;
  let router: jasmine.SpyObj<any>;
  let component: LoginMedicoComponent;

  beforeEach(() => {
    localStorage.clear();
    auth = jasmine.createSpyObj('AuthService', ['login']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    component = new LoginMedicoComponent(auth, router);
    component.dni = '11112222';
    component.clave = 'clave-prueba';
  });

  afterEach(() => localStorage.clear());

  it('U07 login de médico: guarda userId, userName y userType y navega a /medico-dashboard', () => {
    auth.login.and.returnValue(of({ success: true, tipo: 'medico', id: 3, nombres: 'Luis', apellidos: 'Paz Soto', cmp: 'CMP1' }));

    component.login();

    expect(auth.login).toHaveBeenCalledWith('11112222', 'clave-prueba');
    expect(localStorage.getItem('userId')).toBe('3');
    expect(localStorage.getItem('userName')).toBe('Luis Paz Soto');
    expect(localStorage.getItem('userType')).toBe('medico');
    expect(router.navigate).toHaveBeenCalledWith(['/medico-dashboard']);
    expect(component.error).toBe('');
  });

  it('U08 usuario de otro rol: no guarda nada y muestra el mensaje de rol', () => {
    auth.login.and.returnValue(of({ success: true, tipo: 'paciente', id: 7, nombres: 'Ana', apellidos: 'Rojas' }));

    component.login();

    expect(localStorage.length).toBe(0);
    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.error).toBe('Este usuario no es un médico. Use el login que le corresponde.');
  });

  it('U09 error 401: "Credenciales inválidas" y no guarda nada', () => {
    auth.login.and.returnValue(throwError(() => ({ status: 401 })));

    component.login();

    expect(localStorage.length).toBe(0);
    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.error).toBe('Credenciales inválidas');
  });

  it('U10 error de conexión (status 0): mensaje de conexión y no guarda nada', () => {
    auth.login.and.returnValue(throwError(() => ({ status: 0 })));

    component.login();

    expect(localStorage.length).toBe(0);
    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.error).toBe('No se pudo conectar con el servidor. Intente nuevamente.');
  });

  it('U11 error 500: muestra el mensaje de conexión aunque el servidor respondió (comportamiento actual, H-029)', () => {
    auth.login.and.returnValue(throwError(() => ({ status: 500 })));

    component.login();

    expect(localStorage.length).toBe(0);
    expect(component.error).toBe('No se pudo conectar con el servidor. Intente nuevamente.');
  });

  it('U12 DNI con formato inválido: no llama al servidor', () => {
    for (const dni of ['1234567', '123456789', '1234567a', '']) {
      component.dni = dni;
      component.login();
      expect(component.error).toBe('DNI inválido. Debe contener 8 dígitos numéricos.');
    }
    expect(auth.login).not.toHaveBeenCalled();
    expect(localStorage.length).toBe(0);
  });
});
