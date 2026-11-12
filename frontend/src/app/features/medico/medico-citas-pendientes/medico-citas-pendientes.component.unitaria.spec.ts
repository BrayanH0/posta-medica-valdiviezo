// Pruebas unitarias de RFC-015 (P3): sin doble envío y con mensaje de confirmación.
// MedicoService es un doble de prueba: no se llama al backend.
import { Subject, of, throwError } from 'rxjs';
import { MedicoCitasPendientesComponent } from './medico-citas-pendientes.component';
import { Cita, MENSAJE_SIN_CONEXION } from '../services/medico.service';

describe('MedicoCitasPendientesComponent (RFC-015)', () => {
  const cita: Cita = {
    idCita: 7, fecha: '2099-12-31', hora: '08:00:00', motivo: 'Control', estado: 'Pendiente',
    idPaciente: 3, pacienteNombres: 'Nombre', pacienteApellidos: 'Apellido', pacienteDni: '00000000'
  };
  let servicio: jasmine.SpyObj<any>;
  let respuesta: Subject<Cita>;
  let componente: MedicoCitasPendientesComponent;

  beforeEach(() => {
    servicio = jasmine.createSpyObj('MedicoService', ['getCitasByStatus', 'updateCitaStatus']);
    servicio.getCitasByStatus.and.returnValue(of([]));
    respuesta = new Subject<Cita>();
    servicio.updateCitaStatus.and.returnValue(respuesta);
    componente = new MedicoCitasPendientesComponent(servicio);
  });

  it('dos clics en Confirmar mientras se espera al servidor envían una sola petición', () => {
    componente.confirmAction(cita, 'aceptar');
    componente.executeAction();
    componente.executeAction();

    expect(servicio.updateCitaStatus).toHaveBeenCalledTimes(1);
    expect(servicio.updateCitaStatus).toHaveBeenCalledWith(7, 'Confirmada');
    expect(componente.procesando).toBeTrue();
  });

  it('mientras se procesa no se puede cerrar el modal ni elegir otra acción', () => {
    componente.confirmAction(cita, 'aceptar');
    componente.executeAction();

    componente.closeModal();
    componente.confirmAction(cita, 'cancelar');

    expect(componente.selectedCita).toBe(cita);
    expect(componente.actionType).toBe('aceptar');
  });

  it('al guardar muestra "Cita N confirmada.", cierra el modal y recarga la lista', () => {
    componente.confirmAction(cita, 'aceptar');
    componente.executeAction();
    respuesta.next(cita);
    respuesta.complete();

    expect(componente.procesando).toBeFalse();
    expect(componente.selectedCita).toBeNull();
    expect(componente.mensaje).toBe('Cita 7 confirmada.');
    expect(servicio.getCitasByStatus).toHaveBeenCalledWith('Pendiente');
  });

  it('al cancelar muestra "Cita N cancelada."', () => {
    componente.confirmAction(cita, 'cancelar');
    componente.executeAction();
    respuesta.next(cita);

    expect(servicio.updateCitaStatus).toHaveBeenCalledWith(7, 'Cancelada');
    expect(componente.mensaje).toBe('Cita 7 cancelada.');
  });

  it('si el servidor falla, libera los botones y muestra el error de conexión sin mensaje de éxito', () => {
    servicio.updateCitaStatus.and.returnValue(throwError(() => new Error('sin red')));
    componente.confirmAction(cita, 'aceptar');
    componente.executeAction();

    expect(componente.procesando).toBeFalse();
    expect(componente.selectedCita).toBeNull();
    expect(componente.error).toBe(MENSAJE_SIN_CONEXION);
    expect(componente.mensaje).toBe('');
  });
});
