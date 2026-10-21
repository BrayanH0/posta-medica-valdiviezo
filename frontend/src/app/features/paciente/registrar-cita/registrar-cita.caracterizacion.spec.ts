// Pruebas unitarias de caracterización (tarea 9) de generarSlots(): comprueban el comportamiento ACTUAL.
// HttpClient y Router son dobles de prueba; no se ejecuta ngOnInit ni se llama al backend.
import { RegistrarCitaComponent } from './registrar-cita.component';

describe('RegistrarCitaComponent.generarSlots (caracterización)', () => {
  let component: RegistrarCitaComponent;
  // 2026-10-26 es lunes y 2026-10-24 es sábado
  const LUNES = '2026-10-26';
  const SABADO = '2026-10-24';
  const horarioLunes = [{ dia_semana: 'Lunes', hora_inicio: '08:00:00', hora_fin: '10:00:00' }];

  // Bloques de 20 minutos desde inicio (incluido) mientras inicio + 20 <= fin
  function bloques(desde: string, hasta: string): string[] {
    const r: string[] = [];
    let [h, m] = desde.split(':').map(Number);
    let min = h * 60 + m;
    const [hf, mf] = hasta.split(':').map(Number);
    while (min + 20 <= hf * 60 + mf) {
      r.push(`${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`);
      min += 20;
    }
    return r;
  }

  beforeEach(() => {
    const http = jasmine.createSpyObj('HttpClient', ['get', 'post']);
    const router = jasmine.createSpyObj('Router', ['navigate']);
    component = new RegistrarCitaComponent(http, router);
  });

  it('U19 con horario del médico ese día: bloques de 20 minutos entre inicio y fin', () => {
    component.cita.fecha_cita = LUNES;

    component.generarSlots(horarioLunes, []);

    expect(component.horariosDisponibles).toEqual(['08:00', '08:20', '08:40', '09:00', '09:20', '09:40']);
  });

  it('U20 descarta las horas ya ocupadas', () => {
    component.cita.fecha_cita = LUNES;

    component.generarSlots(horarioLunes, [{ hora_cita: '08:20:00' }, { hora_cita: '09:40:00' }]);

    expect(component.horariosDisponibles).toEqual(['08:00', '08:40', '09:00', '09:20']);
  });

  it('U21 sin horario ese día: ofrece 08:00 a 20:00 (comportamiento actual, H-022)', () => {
    component.cita.fecha_cita = SABADO;

    component.generarSlots(horarioLunes, []);

    expect(component.horariosDisponibles).toEqual(bloques('08:00', '20:00'));
    expect(component.horariosDisponibles.length).toBe(36);
    expect(component.horariosDisponibles[0]).toBe('08:00');
    expect(component.horariosDisponibles[35]).toBe('19:40');
  });

  it('U22 sin horario ese día: el horario por defecto también descarta las horas ocupadas (comportamiento actual, H-022)', () => {
    component.cita.fecha_cita = SABADO;

    component.generarSlots([], [{ hora_cita: '10:00:00' }]);

    expect(component.horariosDisponibles.length).toBe(35);
    expect(component.horariosDisponibles).not.toContain('10:00');
  });

  it('U23 con horario pero todas las horas ocupadas: ofrece 08:00 a 20:00 menos las ocupadas (comportamiento actual, H-022)', () => {
    component.cita.fecha_cita = LUNES;
    const ocupadas = bloques('08:00', '10:00').map(h => ({ hora_cita: h + ':00' }));

    component.generarSlots(horarioLunes, ocupadas);

    expect(component.horariosDisponibles).toEqual(bloques('10:00', '20:00'));
  });
});
