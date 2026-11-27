// RFC-019 (Parte 2, corrección de la revisión): la tecla Escape cierra el menú del celular.
// Router y AuthService son dobles de prueba; la conexión del evento "keydown.escape" se comprueba en E06 (navegador).
import { PacienteLayoutComponent } from './paciente-layout.component';

describe('PacienteLayoutComponent (Escape)', () => {
  let layout: PacienteLayoutComponent;

  beforeEach(() => {
    layout = new PacienteLayoutComponent(jasmine.createSpyObj('Router', ['navigate']), jasmine.createSpyObj('AuthService', ['logout']));
  });

  it('U103 alPulsarEscape cierra el menú abierto y no hace nada con el menú cerrado', () => {
    layout.alternarMenu();
    expect(layout.menuAbierto).toBeTrue();
    layout.alPulsarEscape();
    expect(layout.menuAbierto).toBeFalse();
    layout.alPulsarEscape();
    expect(layout.menuAbierto).toBeFalse();
  });
});
