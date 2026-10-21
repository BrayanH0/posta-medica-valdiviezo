// Pruebas unitarias de la regla de horarios extraída en RFC-006 (R2 SRP). Datos inventados.
import {
  DIAS_SEMANA, HORARIO_POR_DEFECTO, MINUTOS_POR_BLOQUE,
  calcularHorariosDisponibles, diaDeLaSemana, horaAMinutos, minutosAHora,
} from './horarios-cita';

// Copia literal del algoritmo de generarSlots() en LB-5 (antes de RFC-006), usada solo como referencia en U79
function generarSlotsLB5(fecha: string, availability: any[], existingCitas: any[]): string[] {
  const timeToMinutes = (time: string) => { if (!time) return 0; const [h, m] = time.split(':').map(Number); return h * 60 + m; };
  const minutesToTime = (mins: number) => `${Math.floor(mins / 60).toString().padStart(2, '0')}:${(mins % 60).toString().padStart(2, '0')}`;
  const dayMap = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const dayName = dayMap[new Date(fecha + 'T00:00:00').getDay()];
  const rule = availability.find(a => a.dia_semana === dayName);
  const out: string[] = [];
  if (rule) {
    let start = timeToMinutes(rule.hora_inicio);
    const end = timeToMinutes(rule.hora_fin);
    while (start + 20 <= end) {
      const t = minutesToTime(start);
      if (!existingCitas.find(c => c.hora_cita.substring(0, 5) === t)) out.push(t);
      start += 20;
    }
  }
  if (out.length === 0) {
    let start = 8 * 60;
    const end = 20 * 60;
    while (start + 20 <= end) {
      const t = minutesToTime(start);
      if (!existingCitas.find(c => c.hora_cita && c.hora_cita.substring(0, 5) === t)) out.push(t);
      start += 20;
    }
  }
  return out;
}

describe('horarios-cita (RFC-006)', () => {
  const MARTES = '2026-10-27';
  const DOMINGO = '2026-10-25';
  const horarioMartes = [{ dia_semana: 'Martes', hora_inicio: '14:00:00', hora_fin: '15:10:00' }];

  it('U72 diaDeLaSemana: nombre del día en hora local', () => {
    expect(diaDeLaSemana('2026-10-25')).toBe('Domingo');
    expect(diaDeLaSemana('2026-10-26')).toBe('Lunes');
    expect(diaDeLaSemana('2026-10-28')).toBe('Miércoles');
    expect(diaDeLaSemana('2026-10-31')).toBe('Sábado');
    expect(DIAS_SEMANA.length).toBe(7);
  });

  it('U73 horaAMinutos y minutosAHora', () => {
    expect(horaAMinutos('08:20:00')).toBe(500);
    expect(horaAMinutos('20:00')).toBe(1200);
    expect(horaAMinutos('')).toBe(0);
    expect(minutosAHora(500)).toBe('08:20');
    expect(minutosAHora(0)).toBe('00:00');
    expect(MINUTOS_POR_BLOQUE).toBe(20);
  });

  it('U74 con horario: bloques completos de 20 minutos (el último debe terminar antes del fin)', () => {
    expect(calcularHorariosDisponibles(MARTES, horarioMartes, [])).toEqual({ horarios: ['14:00', '14:20', '14:40'], porDefecto: false });
  });

  it('U75 con horario: descarta las ocupadas', () => {
    const r = calcularHorariosDisponibles(MARTES, horarioMartes, [{ hora_cita: '14:20:00' }]);
    expect(r).toEqual({ horarios: ['14:00', '14:40'], porDefecto: false });
  });

  it('U76 sin horario ese día: horario por defecto 08:00-20:00 menos las ocupadas (comportamiento actual, H-022)', () => {
    const r = calcularHorariosDisponibles(DOMINGO, horarioMartes, [{ hora_cita: '08:00:00' }]);
    expect(r.porDefecto).toBeTrue();
    expect(r.horarios.length).toBe(35);
    expect(r.horarios[0]).toBe('08:20');
    expect(r.horarios[34]).toBe('19:40');
    expect(HORARIO_POR_DEFECTO).toEqual({ inicio: '08:00', fin: '20:00' });
  });

  it('U77 con horario todo ocupado: cae al horario por defecto (comportamiento actual, H-022)', () => {
    const ocupadas = ['14:00:00', '14:20:00', '14:40:00'].map(h => ({ hora_cita: h }));
    const r = calcularHorariosDisponibles(MARTES, horarioMartes, ocupadas);
    expect(r.porDefecto).toBeTrue();
    expect(r.horarios.length).toBe(33);
    expect(r.horarios).not.toContain('14:20');
  });

  it('U78 cita con hora_cita nula: con horario lanza TypeError; en el horario por defecto se ignora (comportamiento actual, H-037)', () => {
    expect(() => calcularHorariosDisponibles(MARTES, horarioMartes, [{ hora_cita: null }])).toThrowError(TypeError);
    const r = calcularHorariosDisponibles(DOMINGO, horarioMartes, [{ hora_cita: null }]);
    expect(r).toEqual({ horarios: calcularHorariosDisponibles(DOMINGO, [], []).horarios, porDefecto: true });
    expect(r.horarios.length).toBe(36);
  });

  it('U79 da el mismo resultado que el algoritmo de LB-5 en 2000 entradas generadas', () => {
    // Generador determinista (sin Math.random) para que la prueba sea repetible
    let semilla = 12345;
    const azar = (n: number) => { semilla = (semilla * 1103515245 + 12345) % 2147483648; return semilla % n; };
    const hora = () => `${String(6 + azar(16)).padStart(2, '0')}:${['00', '10', '20', '30', '40', '50'][azar(6)]}:00`;
    for (let i = 0; i < 2000; i++) {
      const fecha = `2026-${String(1 + azar(12)).padStart(2, '0')}-${String(1 + azar(28)).padStart(2, '0')}`;
      const disponibilidad = Array.from({ length: azar(4) }, () => ({ dia_semana: DIAS_SEMANA[azar(7)], hora_inicio: hora(), hora_fin: hora() }));
      const citas = Array.from({ length: azar(12) }, () => ({ hora_cita: hora() }));
      expect(calcularHorariosDisponibles(fecha, disponibilidad, citas).horarios).toEqual(generarSlotsLB5(fecha, disponibilidad, citas));
    }
  });
});
