// RFC-019 (Parte 2, cajón del menú): el cajón bloquea el scroll de la página mientras está abierto y lo suelta al cerrarse,
// al destruirse el componente o al ensancharse la ventana. Router y AuthService son dobles de prueba; el foco, la posición
// y la animación se prueban en E08 (navegador).
import { PacienteLayoutComponent } from './paciente-layout.component';

describe('PacienteLayoutComponent (cajón del menú)', () => {
  let layout: PacienteLayoutComponent;
  const bloqueado = () => document.body.classList.contains('ui-sin-scroll');

  beforeEach(() => {
    layout = new PacienteLayoutComponent(jasmine.createSpyObj('Router', ['navigate']), jasmine.createSpyObj('AuthService', ['logout']));
  });

  afterEach(() => document.body.classList.remove('ui-sin-scroll'));

  it('U104 abrir bloquea el scroll de la página y cerrar lo suelta', () => {
    layout.abrirMenu();
    expect(layout.menuAbierto).toBeTrue();
    expect(bloqueado()).toBeTrue();
    layout.cerrarMenu();
    expect(layout.menuAbierto).toBeFalse();
    expect(bloqueado()).toBeFalse();
  });

  it('U105 destruir el componente con el cajón abierto suelta el scroll (cada pantalla crea su propio layout)', () => {
    layout.abrirMenu();
    layout.ngOnDestroy();
    expect(bloqueado()).toBeFalse();
  });

  it('U106 cerrar el cajón con el menú ya cerrado no cambia nada', () => {
    layout.cerrarMenu();
    expect(layout.menuAbierto).toBeFalse();
    expect(bloqueado()).toBeFalse();
  });

  it('U107 al ensanchar la ventana con el cajón abierto, el cajón se cierra y se suelta el scroll', () => {
    layout.abrirMenu();
    spyOnProperty(window, 'innerWidth').and.returnValue(1280);
    layout.alCambiarTamano();
    expect(layout.menuAbierto).toBeFalse();
    expect(bloqueado()).toBeFalse();
  });
});
