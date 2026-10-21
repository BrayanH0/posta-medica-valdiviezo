// Pruebas unitarias de las funciones extraídas en RFC-005 (R1 DRY). Datos inventados.
import {
  LOGIN_ADMIN, LOGIN_MEDICO, LOGIN_PACIENTE, MENSAJES_LOGIN,
  guardarSesion, mensajeErrorLogin, mensajeRolEquivocado, resolverRespuestaLogin,
  validarDniPeruano, validarFormularioLogin,
} from './login-comun';

describe('login-comun (RFC-005)', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('U63 validarDniPeruano: solo 8 dígitos', () => {
    expect(validarDniPeruano('11112222')).toBeTrue();
    for (const dni of ['1111222', '111122223', '1111222a', '', ' 1111222', '1111 222']) {
      expect(validarDniPeruano(dni)).toBeFalse();
    }
  });

  it('U64 validarFormularioLogin: primero el DNI, después la contraseña', () => {
    expect(validarFormularioLogin('123', '')).toBe(MENSAJES_LOGIN.dniInvalido);
    expect(validarFormularioLogin('11112222', '')).toBe(MENSAJES_LOGIN.claveVacia);
    expect(validarFormularioLogin('11112222', 'clave-prueba')).toBe('');
  });

  it('U65 textos de los mensajes (los mismos que mostraban las 3 copias)', () => {
    expect(MENSAJES_LOGIN).toEqual({
      dniInvalido: 'DNI inválido. Debe contener 8 dígitos numéricos.',
      claveVacia: 'Por favor ingrese su contraseña.',
      credencialesInvalidas: 'Credenciales inválidas',
      sinConexion: 'No se pudo conectar con el servidor. Intente nuevamente.',
      respuestaInesperada: 'Respuesta inesperada del servidor',
    });
    expect(mensajeRolEquivocado(LOGIN_PACIENTE)).toBe('Este usuario no es un paciente. Use el login que le corresponde.');
    expect(mensajeRolEquivocado(LOGIN_MEDICO)).toBe('Este usuario no es un médico. Use el login que le corresponde.');
    expect(mensajeRolEquivocado(LOGIN_ADMIN)).toBe('Este usuario no es un administrador. Use el login que le corresponde.');
  });

  it('U66 resolverRespuestaLogin: rol correcto → ruta de inicio de ese rol', () => {
    expect(resolverRespuestaLogin({ success: true, tipo: 'paciente' }, LOGIN_PACIENTE)).toEqual({ ruta: '/welcome' });
    expect(resolverRespuestaLogin({ success: true, tipo: 'medico' }, LOGIN_MEDICO)).toEqual({ ruta: '/medico-dashboard' });
    expect(resolverRespuestaLogin({ success: true, tipo: 'administrador' }, LOGIN_ADMIN)).toEqual({ ruta: '/admin' });
  });

  it('U67 resolverRespuestaLogin: rol equivocado → mensaje de rol (las 6 combinaciones)', () => {
    const configs = [LOGIN_PACIENTE, LOGIN_MEDICO, LOGIN_ADMIN];
    for (const config of configs) {
      for (const otro of configs.filter((c) => c !== config)) {
        expect(resolverRespuestaLogin({ success: true, tipo: otro.tipo }, config)).toEqual({ error: mensajeRolEquivocado(config) });
      }
    }
  });

  it('U68 resolverRespuestaLogin: sin success o sin cuerpo → "Respuesta inesperada del servidor" en los 3 roles (H-030 unificado)', () => {
    for (const config of [LOGIN_PACIENTE, LOGIN_MEDICO, LOGIN_ADMIN]) {
      for (const res of [null, undefined, {}, { success: false, tipo: config.tipo }]) {
        expect(resolverRespuestaLogin(res, config)).toEqual({ error: MENSAJES_LOGIN.respuestaInesperada });
      }
    }
  });

  it('U69 guardarSesion: guarda userId, userName ("nombres apellidos") y userType', () => {
    guardarSesion({ success: true, tipo: 'medico', id: 5, nombres: 'Eva', apellidos: 'Sol Mar' }, LOGIN_MEDICO);
    expect(localStorage.getItem('userId')).toBe('5');
    expect(localStorage.getItem('userName')).toBe('Eva Sol Mar');
    expect(localStorage.getItem('userType')).toBe('medico');
    expect(localStorage.length).toBe(3);
  });

  it('U70 guardarSesion con nombres vacío: paciente y médico no guardan userName; admin guarda " apellidos" (comportamiento conservado, H-036)', () => {
    const res = (tipo: string) => ({ success: true, tipo, id: 5, nombres: '', apellidos: 'Sol' });
    guardarSesion(res('paciente'), LOGIN_PACIENTE);
    expect(localStorage.getItem('userName')).toBeNull();
    expect(localStorage.length).toBe(2);
    localStorage.clear();
    guardarSesion(res('medico'), LOGIN_MEDICO);
    expect(localStorage.getItem('userName')).toBeNull();
    expect(localStorage.length).toBe(2);
    localStorage.clear();
    guardarSesion(res('administrador'), LOGIN_ADMIN);
    expect(localStorage.getItem('userName')).toBe(' Sol');
    expect(localStorage.length).toBe(3);
  });

  it('U71 mensajeErrorLogin: 401 → credenciales inválidas; cualquier otro → mensaje de conexión (comportamiento actual, H-029)', () => {
    expect(mensajeErrorLogin({ status: 401 })).toBe(MENSAJES_LOGIN.credencialesInvalidas);
    for (const status of [0, 400, 403, 404, 500, 503]) {
      expect(mensajeErrorLogin({ status })).toBe(MENSAJES_LOGIN.sinConexion);
    }
  });
});
