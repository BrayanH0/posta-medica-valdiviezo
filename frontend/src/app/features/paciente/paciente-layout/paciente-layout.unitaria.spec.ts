// RFC-019 (Parte 2): pruebas unitarias del menú del paciente y del resumen de Registrar cita.
// Router, AuthService e HttpClient son dobles de prueba; no se renderiza nada ni se llama al backend.
import { PacienteLayoutComponent } from './paciente-layout.component';
import { RegistrarCitaComponent } from '../registrar-cita/registrar-cita.component';
import { MisCitasComponent } from '../mis-citas/mis-citas.component';

describe('PacienteLayoutComponent (menú del paciente)', () => {
  let router: jasmine.SpyObj<any>;
  let auth: jasmine.SpyObj<any>;
  let layout: PacienteLayoutComponent;

  beforeEach(() => {
    router = jasmine.createSpyObj('Router', ['navigate']);
    auth = jasmine.createSpyObj('AuthService', ['logout']);
    layout = new PacienteLayoutComponent(router, auth);
  });

  it('U98 el menú empieza cerrado y alternarMenu / cerrarMenu lo abren y lo cierran', () => {
    expect(layout.menuAbierto).toBeFalse();
    layout.alternarMenu();
    expect(layout.menuAbierto).toBeTrue();
    layout.cerrarMenu();
    expect(layout.menuAbierto).toBeFalse();
  });

  it('U99 logout llama a AuthService.logout y navega a /login-selection', () => {
    layout.logout();
    expect(auth.logout).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledWith(['/login-selection']);
  });
});

describe('RegistrarCitaComponent: nombres del resumen', () => {
  let c: RegistrarCitaComponent;

  beforeEach(() => {
    c = new RegistrarCitaComponent(jasmine.createSpyObj('HttpClient', ['get', 'post']), jasmine.createSpyObj('Router', ['navigate']));
    c.especialidades = [{ id_especialidad: 2, nombre_especialidad: 'Pediatría' }];
    c.medicos = [{ id_medico: 7, nombres: 'Ana', apellidos: 'Lira' }];
  });

  it('U100 con los ids elegidos (el select los entrega como texto) devuelve el nombre', () => {
    c.cita.id_especialidad = '2';
    c.cita.id_medico = '7';
    expect(c.nombreEspecialidad()).toBe('Pediatría');
    expect(c.nombreMedico()).toBe('Dr(a). Ana Lira');
  });

  it('U101 sin elección o con un id que no está en la lista devuelve vacío', () => {
    expect(c.nombreEspecialidad()).toBe('');
    expect(c.nombreMedico()).toBe('');
    c.cita.id_especialidad = '99';
    c.cita.id_medico = '99';
    expect(c.nombreEspecialidad()).toBe('');
    expect(c.nombreMedico()).toBe('');
  });
});

describe('MisCitasComponent: etiquetas de estado', () => {
  const m = new MisCitasComponent(jasmine.createSpyObj('HttpClient', ['get']), jasmine.createSpyObj('Router', ['navigate']));

  it('U102 cada estado tiene su nombre y su clase de etiqueta', () => {
    expect([1, 2, 3, 4].map((e) => m.getEstadoNombre(e))).toEqual(['Pendiente', 'Confirmada', 'Cancelada', 'Atendida']);
    expect([1, 2, 3, 4].map((e) => m.getBadgeClass(e))).toEqual([
      'ui-badge--pendiente', 'ui-badge--confirmada', 'ui-badge--cancelada', 'ui-badge--atendida'
    ]);
    expect(m.getEstadoNombre(9)).toBe('Desconocido');
    expect(m.getBadgeClass(9)).toBe('ui-badge--neutra');
  });
});
