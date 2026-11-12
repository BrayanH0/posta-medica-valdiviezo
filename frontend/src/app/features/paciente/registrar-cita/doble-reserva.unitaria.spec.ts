// RFC-012 (tarea 24B): las citas canceladas liberan su horario y el 409 del backend se muestra al paciente.
// HttpClient y Router son dobles de prueba; no se ejecuta ngOnInit ni se llama al backend.
import { of, throwError } from 'rxjs';
import { calcularHorariosDisponibles, ESTADO_CITA_CANCELADA } from './horarios-cita';
import { RegistrarCitaComponent, MENSAJE_HORARIO_OCUPADO } from './registrar-cita.component';

describe('RFC-012 doble reserva (unitarias)', () => {
  // 2026-10-26 es lunes
  const LUNES = '2026-10-26';
  const horarioLunes = [{ dia_semana: 'Lunes', hora_inicio: '08:00:00', hora_fin: '09:00:00' }];

  describe('calcularHorariosDisponibles', () => {
    it('una cita Cancelada (estado 3) no ocupa su horario', () => {
      expect(ESTADO_CITA_CANCELADA).toBe(3);
      const r = calcularHorariosDisponibles(LUNES, horarioLunes, [{ hora_cita: '08:20:00', estado_cita: 3 }]);
      expect(r.horarios).toEqual(['08:00', '08:20', '08:40']);
      expect(r.porDefecto).toBeFalse();
    });

    it('Pendiente, Confirmada, Atendida y Reprogramada sí ocupan su horario', () => {
      for (const estado of [1, 2, 4, 5]) {
        const r = calcularHorariosDisponibles(LUNES, horarioLunes, [{ hora_cita: '08:20:00', estado_cita: estado }]);
        expect(r.horarios).withContext(`estado ${estado}`).toEqual(['08:00', '08:40']);
      }
    });

    it('cancelada y activa en el mismo horario: la activa lo sigue ocupando', () => {
      const r = calcularHorariosDisponibles(LUNES, horarioLunes, [
        { hora_cita: '08:40:00', estado_cita: 3 },
        { hora_cita: '08:40:00', estado_cita: 1 }
      ]);
      expect(r.horarios).toEqual(['08:00', '08:20']);
    });

    it('en el horario por defecto la cancelada tampoco ocupa', () => {
      const SABADO = '2026-10-24';
      const r = calcularHorariosDisponibles(SABADO, horarioLunes, [{ hora_cita: '10:00:00', estado_cita: 3 }]);
      expect(r.porDefecto).toBeTrue();
      expect(r.horarios).toContain('10:00');
      expect(r.horarios.length).toBe(36);
    });
  });

  describe('RegistrarCitaComponent.registrarCita ante un error', () => {
    let http: jasmine.SpyObj<any>;
    let router: jasmine.SpyObj<any>;
    let component: RegistrarCitaComponent;

    beforeEach(() => {
      http = jasmine.createSpyObj('HttpClient', ['get', 'post']);
      router = jasmine.createSpyObj('Router', ['navigate']);
      component = new RegistrarCitaComponent(http, router);
      component.cita = { id_especialidad: 1, id_medico: 1, fecha_cita: LUNES, hora_cita: '10:00', motivo: 'm', id_paciente: 1 };
      spyOn(window, 'alert');
      spyOn(console, 'error');
    });

    it('409: muestra el mensaje del servidor, borra la hora elegida y recarga las horas', () => {
      http.post.and.returnValue(throwError(() => ({ status: 409, error: { message: 'Mensaje del servidor', status: 'error' } })));
      http.get.and.returnValue(of([]));

      component.registrarCita();

      expect(window.alert).toHaveBeenCalledWith('Mensaje del servidor');
      expect(component.cita.hora_cita).toBe('');
      expect(http.get).toHaveBeenCalledWith('http://localhost:8080/api/disponibilidad_medico/medico/1');
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('409 sin cuerpo: muestra el mensaje por defecto', () => {
      http.post.and.returnValue(throwError(() => ({ status: 409, error: null })));
      http.get.and.returnValue(of([]));

      component.registrarCita();

      expect(window.alert).toHaveBeenCalledWith(MENSAJE_HORARIO_OCUPADO);
    });

    it('otro error (500): mismo mensaje de siempre y no recarga las horas', () => {
      http.post.and.returnValue(throwError(() => ({ status: 500, error: { message: 'x' } })));

      component.registrarCita();

      expect(window.alert).toHaveBeenCalledWith('Error al registrar cita');
      expect(component.cita.hora_cita).toBe('10:00');
      expect(http.get).not.toHaveBeenCalled();
    });
  });
});
