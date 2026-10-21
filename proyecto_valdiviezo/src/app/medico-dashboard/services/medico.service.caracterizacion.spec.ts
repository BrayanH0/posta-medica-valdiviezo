// Pruebas unitarias de caracterización (tarea 9) de MedicoService: comprueban el comportamiento ACTUAL.
// HttpClient es un doble de prueba: no se llama al backend.
import { of } from 'rxjs';
import { MedicoService } from './medico.service';

describe('MedicoService (caracterización)', () => {
  const BASE = 'http://localhost:8080/api/citas/medico';
  let http: jasmine.SpyObj<any>;
  let service: MedicoService;

  beforeEach(() => {
    localStorage.clear();
    http = jasmine.createSpyObj('HttpClient', ['get', 'put']);
    http.get.and.returnValue(of([]));
    http.put.and.returnValue(of({}));
    service = new MedicoService(http);
  });

  afterEach(() => localStorage.clear());

  it('U28 getCitasByStatus: GET a /api/citas/medico/{userId} con el estado como parámetro', () => {
    localStorage.setItem('userId', '4');

    service.getCitasByStatus('Pendiente').subscribe();

    expect(http.get).toHaveBeenCalledOnceWith(`${BASE}/4`, { params: { estado: 'Pendiente' } });
  });

  it('U29 updateCitaStatus: PUT a /api/citas/medico/{userId}/{idCita}/estado con el nombre del estado', () => {
    localStorage.setItem('userId', '4');

    service.updateCitaStatus(31, 'Confirmada').subscribe();

    expect(http.put).toHaveBeenCalledOnceWith(`${BASE}/4/31/estado`, { estado: 'Confirmada' });
  });

  it('U30 getPacientes: GET a /api/citas/medico/{userId}/pacientes', () => {
    localStorage.setItem('userId', '4');

    service.getPacientes().subscribe();

    expect(http.get).toHaveBeenCalledOnceWith(`${BASE}/4/pacientes`);
  });

  it('U31 usa el userId que está en la sesión en el momento de la llamada', () => {
    localStorage.setItem('userId', '4');
    service.getPacientes().subscribe();
    localStorage.setItem('userId', '9');
    service.getPacientes().subscribe();

    expect(http.get.calls.argsFor(0)).toEqual([`${BASE}/4/pacientes`]);
    expect(http.get.calls.argsFor(1)).toEqual([`${BASE}/9/pacientes`]);
  });

  it('U32 sin sesión: los 3 métodos fallan con "No hay sesión de médico." y no llaman al servidor', () => {
    const errores: string[] = [];
    const guardar = { error: (e: Error) => errores.push(e.message) };

    service.getCitasByStatus('Pendiente').subscribe(guardar);
    service.updateCitaStatus(31, 'Cancelada').subscribe(guardar);
    service.getPacientes().subscribe(guardar);

    expect(errores).toEqual(['No hay sesión de médico.', 'No hay sesión de médico.', 'No hay sesión de médico.']);
    expect(http.get).not.toHaveBeenCalled();
    expect(http.put).not.toHaveBeenCalled();
  });
});
