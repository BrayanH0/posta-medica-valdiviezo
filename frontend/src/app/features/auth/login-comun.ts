// Lógica común de los 3 logins (RFC-005, R1 DRY): validación, mensajes, decisión sobre la
// respuesta del servidor, guardado de la sesión y lectura del error. Funciones puras, sin Angular.

export const MENSAJES_LOGIN = {
  dniInvalido: 'DNI inválido. Debe contener 8 dígitos numéricos.',
  claveVacia: 'Por favor ingrese su contraseña.',
  credencialesInvalidas: 'Credenciales inválidas',
  sinConexion: 'No se pudo conectar con el servidor. Intente nuevamente.',
  respuestaInesperada: 'Respuesta inesperada del servidor',
};

export interface ConfigLogin {
  tipo: string;        // valor de `tipo` que devuelve el backend para este rol
  rutaInicio: string;  // pantalla a la que se entra tras el login
  nombreRol: string;   // para el mensaje "Este usuario no es {nombreRol}..."
  // true: cada clave se guarda solo si el campo tiene valor (paciente y médico).
  // false: se guardan siempre las 3 (admin). Difieren si `nombres` llega vacío (H-036).
  guardarSoloConValor: boolean;
}

export const LOGIN_PACIENTE: ConfigLogin = { tipo: 'paciente', rutaInicio: '/welcome', nombreRol: 'un paciente', guardarSoloConValor: true };
export const LOGIN_MEDICO: ConfigLogin = { tipo: 'medico', rutaInicio: '/medico-dashboard', nombreRol: 'un médico', guardarSoloConValor: true };
export const LOGIN_ADMIN: ConfigLogin = { tipo: 'administrador', rutaInicio: '/admin', nombreRol: 'un administrador', guardarSoloConValor: false };

export type ResultadoLogin = { ruta: string } | { error: string };

export function validarDniPeruano(dni: string): boolean {
  // DNI peruano: 8 dígitos numéricos
  return /^\d{8}$/.test(dni);
}

// Devuelve el mensaje de error del formulario, o '' si se puede enviar
export function validarFormularioLogin(dni: string, clave: string): string {
  if (!validarDniPeruano(dni)) return MENSAJES_LOGIN.dniInvalido;
  if (!clave) return MENSAJES_LOGIN.claveVacia;
  return '';
}

export function mensajeRolEquivocado(config: ConfigLogin): string {
  return `Este usuario no es ${config.nombreRol}. Use el login que le corresponde.`;
}

// Respuesta 200 del backend: entra solo si el usuario es del rol de este login
export function resolverRespuestaLogin(res: any, config: ConfigLogin): ResultadoLogin {
  if (!res || !res.success) return { error: MENSAJES_LOGIN.respuestaInesperada };
  if (res.tipo !== config.tipo) return { error: mensajeRolEquivocado(config) };
  return { ruta: config.rutaInicio };
}

// Mismo esquema de sesión para los 3 roles: userId, userName y userType
export function guardarSesion(res: any, config: ConfigLogin): void {
  if (!config.guardarSoloConValor || res.id) localStorage.setItem('userId', res.id.toString());
  if (!config.guardarSoloConValor || res.nombres) localStorage.setItem('userName', `${res.nombres} ${res.apellidos}`);
  if (!config.guardarSoloConValor || res.tipo) localStorage.setItem('userType', res.tipo);
}

// Error HTTP del login: 401 son credenciales inválidas; todo lo demás se informa como falta de conexión (H-029)
export function mensajeErrorLogin(err: any): string {
  return err.status === 401 ? MENSAJES_LOGIN.credencialesInvalidas : MENSAJES_LOGIN.sinConexion;
}
