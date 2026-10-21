// Regla de negocio de horarios de cita (RFC-006, R2 SRP), separada de la pantalla.
// Funciones puras: reciben la fecha, la disponibilidad del médico y sus citas, y devuelven los horarios.

// En el orden de Date.getDay()
export const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export const MINUTOS_POR_BLOQUE = 20;

// Se ofrece si el médico no tiene horario ese día o si su horario está todo ocupado (H-022, abierto)
export const HORARIO_POR_DEFECTO = { inicio: '08:00', fin: '20:00' };

export interface ResultadoHorarios {
  horarios: string[];   // 'HH:MM' libres
  porDefecto: boolean;  // true si se usó HORARIO_POR_DEFECTO
}

export function diaDeLaSemana(fecha: string): string {
  // Con T00:00:00 la fecha se toma en hora local; '2025-11-25' solo se interpretaría en UTC
  return DIAS_SEMANA[new Date(fecha + 'T00:00:00').getDay()];
}

export function horaAMinutos(hora: string): number {
  if (!hora) return 0;
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

export function minutosAHora(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function calcularHorariosDisponibles(fecha: string, disponibilidad: any[], citasOcupadas: any[]): ResultadoHorarios {
  const dia = diaDeLaSemana(fecha);
  const regla = disponibilidad.find(a => a.dia_semana === dia);
  const horarios: string[] = [];

  if (regla) {
    // Sin comprobar hora_cita nula: una cita sin hora lanza TypeError (comportamiento actual, H-037)
    bloquesLibres(regla.hora_inicio, regla.hora_fin, hora => !citasOcupadas.find(c => c.hora_cita.substring(0, 5) === hora), horarios);
  }

  if (horarios.length > 0) return { horarios, porDefecto: false };

  bloquesLibres(HORARIO_POR_DEFECTO.inicio, HORARIO_POR_DEFECTO.fin, hora => !citasOcupadas.find(c => c.hora_cita && c.hora_cita.substring(0, 5) === hora), horarios);
  return { horarios, porDefecto: true };
}

// Agrega a `destino` los bloques de MINUTOS_POR_BLOQUE que entran completos entre inicio y fin y están libres
function bloquesLibres(inicio: string, fin: string, libre: (hora: string) => boolean, destino: string[]): void {
  const finMin = horaAMinutos(fin);
  for (let min = horaAMinutos(inicio); min + MINUTOS_POR_BLOQUE <= finMin; min += MINUTOS_POR_BLOQUE) {
    const hora = minutosAHora(min);
    if (libre(hora)) destino.push(hora);
  }
}
