# Ficha P3 — Médico: Aceptar/Cancelar sin doble envío y con confirmación visible

| Dato | Valor |
|---|---|
| RFC | RFC-015 (`docs/rfc/RFC-015.md`) |
| Hallazgo / issue | H-044 → issue **#44** (comprueba el número en GitHub antes de abrir el PR) |
| Rama que vas a crear | `feature/rfc-015-p3-medico-doble-envio` |
| Rama base | `develop` |
| Archivos | 2 que se modifican + 1 prueba nueva |

---

## 1. Qué arreglas y por qué (para la exposición)

1. En "Citas Pendientes" del médico, el botón "Confirmar" seguía activo mientras se esperaba al servidor: con doble clic se enviaban **2** peticiones, y con la red lenta el médico podía pulsar "Cancelar" sobre la misma cita y terminar con la cita **confirmada** sin saberlo (AUD-ROB-03).
2. Ahora, mientras se guarda, los botones se desactivan y "Confirmar" dice "Guardando...": sale **una sola** petición.
3. Al terminar aparece el mensaje "Cita N confirmada." o "Cita N cancelada." (antes la fila desaparecía sin aviso, AUD-DIS-12). El mensaje se anuncia a los lectores de pantalla (`role="status"`).

**Preguntas probables:**

- **¿Por qué no basta con validar en el servidor?** También hace falta (es la máquina de estados, H-031, que va en otra RFC). Pero sin la bandera en la pantalla, el médico puede mandar dos acciones contrarias y la última en llegar gana. Esta corrección evita que la pantalla las envíe.
- **¿Qué pasa si el servidor falla?** Los botones se vuelven a activar, el modal se cierra y se muestra el mensaje de error de conexión de siempre. No aparece el mensaje de éxito (está cubierto por una prueba unitaria).

---

## 2. Antes de empezar

- Necesitas permiso de escritura en `BrayanH0/posta-medica-valdiviezo` (pídeselo a Brayan).
- Todo se hace en la página web de GitHub.
- En este paquete **reemplazas los 2 archivos completos**: abre el archivo, haz clic dentro del editor, **Ctrl+A** (selecciona todo) y **Ctrl+V** con el contenido DESPUÉS. Copia los bloques con el botón de copiar de GitHub (ícono de dos hojas, arriba a la derecha del bloque).
- El bloque ANTES está plegado ("ANTES (archivo completo)"): ábrelo solo para comprobar que estás en el archivo correcto.

---

## 3. Paso a paso

### Paso 1 — Primer archivo: crea la rama y el pull request
1. Entra a `https://github.com/BrayanH0/posta-medica-valdiviezo`.
2. Botón de la rama (arriba a la izquierda, dice `master`) → elige **`develop`**.
3. Abre `frontend/src/app/features/medico/medico-citas-pendientes/medico-citas-pendientes.component.ts`.
4. Comprueba que arriba dice **develop** y haz clic en el **lápiz** ("Edit this file").
5. Ctrl+A y pega el DESPUÉS de la sección 4.1.
6. **"Commit changes..."**:
   - **Commit message:** `P3: bandera procesando y mensaje de confirmacion en citas pendientes (RFC-015)`
   - Elige **"Create a new branch for this commit and start a pull request"**.
   - Nombre de la rama, exactamente: `feature/rfc-015-p3-medico-doble-envio`
   - **"Propose changes"**.
7. En "Open a pull request" comprueba **`base: develop`** ← `compare: feature/rfc-015-p3-medico-doble-envio`. Si dice `master`, cámbialo a `develop`.
8. Título y descripción de la sección 6 → **"Create pull request"**.

### Paso 2 — El segundo archivo en la MISMA rama
1. Pestaña **Code** → botón de la rama → elige **`feature/rfc-015-p3-medico-doble-envio`**.
2. Abre `frontend/src/app/features/medico/medico-citas-pendientes/medico-citas-pendientes.component.html` → lápiz → Ctrl+A → pega el DESPUÉS de la sección 4.2.
3. **"Commit changes..."** → mensaje de la sección 4.2 → **"Commit directly to the `feature/rfc-015-p3-medico-doble-envio` branch"** → **"Commit changes"**.

### Paso 3 — La prueba nueva
1. En la rama `feature/rfc-015-p3-medico-doble-envio`, entra a la carpeta `frontend/src/app/features/medico/medico-citas-pendientes/`.
2. **"Add file" → "Create new file"**. Nombre: `medico-citas-pendientes.component.unitaria.spec.ts`
3. Pega el contenido de la sección 4.3.
4. **"Commit changes..."** → mensaje de la sección 4.3 → **"Commit directly to the `feature/rfc-015-p3-medico-doble-envio` branch"**.

Al final, el PR debe tener **3 commits** y 3 archivos en "Files changed".

---

## 4. Archivos

### 4.1 `frontend/src/app/features/medico/medico-citas-pendientes/medico-citas-pendientes.component.ts`
Commit: `P3: bandera procesando y mensaje de confirmacion en citas pendientes (RFC-015)`

<details><summary>ANTES (archivo completo, 64 líneas)</summary>

<!-- v:archivo-antes frontend/src/app/features/medico/medico-citas-pendientes/medico-citas-pendientes.component.ts -->
```ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedicoService, Cita, MENSAJE_SIN_CONEXION } from '../services/medico.service';

@Component({
  selector: 'app-medico-citas-pendientes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './medico-citas-pendientes.component.html',
  styleUrls: ['./medico-citas-pendientes.component.css']
})
export class MedicoCitasPendientesComponent implements OnInit {

  citas: Cita[] | null = null;
  error = '';
  selectedCita: Cita | null = null;
  actionType: 'aceptar' | 'cancelar' | null = null;

  constructor(private medicoService: MedicoService) {}

  ngOnInit() {
    this.cargarCitas();
  }

  cargarCitas() {
    this.medicoService.getCitasByStatus('Pendiente').subscribe({
      next: (citas) => {
        this.citas = citas;
        this.error = '';
      },
      error: () => {
        this.citas = null;
        this.error = MENSAJE_SIN_CONEXION;
      }
    });
  }

  confirmAction(cita: Cita, action: 'aceptar' | 'cancelar') {
    this.selectedCita = cita;
    this.actionType = action;
  }

  closeModal() {
    this.selectedCita = null;
    this.actionType = null;
  }

  executeAction() {
    if (this.selectedCita && this.actionType) {
      const nuevoEstado = this.actionType === 'aceptar' ? 'Confirmada' : 'Cancelada';
      this.medicoService.updateCitaStatus(this.selectedCita.idCita, nuevoEstado).subscribe({
        next: () => {
          this.closeModal();
          this.cargarCitas();
        },
        error: () => {
          this.closeModal();
          this.citas = null;
          this.error = MENSAJE_SIN_CONEXION;
        }
      });
    }
  }
}
```
</details>

DESPUÉS (archivo completo):
<!-- v:archivo-despues frontend/src/app/features/medico/medico-citas-pendientes/medico-citas-pendientes.component.ts -->
```ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedicoService, Cita, MENSAJE_SIN_CONEXION } from '../services/medico.service';

@Component({
  selector: 'app-medico-citas-pendientes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './medico-citas-pendientes.component.html',
  styleUrls: ['./medico-citas-pendientes.component.css']
})
export class MedicoCitasPendientesComponent implements OnInit {

  citas: Cita[] | null = null;
  error = '';
  selectedCita: Cita | null = null;
  actionType: 'aceptar' | 'cancelar' | null = null;
  // true mientras se espera la respuesta del servidor: evita el doble envío (RFC-015)
  procesando = false;
  // Mensaje que confirma al médico la acción guardada (RFC-015)
  mensaje = '';

  constructor(private medicoService: MedicoService) {}

  ngOnInit() {
    this.cargarCitas();
  }

  cargarCitas() {
    this.medicoService.getCitasByStatus('Pendiente').subscribe({
      next: (citas) => {
        this.citas = citas;
        this.error = '';
      },
      error: () => {
        this.citas = null;
        this.error = MENSAJE_SIN_CONEXION;
      }
    });
  }

  confirmAction(cita: Cita, action: 'aceptar' | 'cancelar') {
    if (this.procesando) return;
    this.mensaje = '';
    this.selectedCita = cita;
    this.actionType = action;
  }

  closeModal() {
    if (this.procesando) return;
    this.selectedCita = null;
    this.actionType = null;
  }

  executeAction() {
    if (this.procesando || !this.selectedCita || !this.actionType) return;
    const idCita = this.selectedCita.idCita;
    const nuevoEstado = this.actionType === 'aceptar' ? 'Confirmada' : 'Cancelada';
    this.procesando = true;
    this.medicoService.updateCitaStatus(idCita, nuevoEstado).subscribe({
      next: () => {
        this.procesando = false;
        this.closeModal();
        this.mensaje = `Cita ${idCita} ${nuevoEstado === 'Confirmada' ? 'confirmada' : 'cancelada'}.`;
        this.cargarCitas();
      },
      error: () => {
        this.procesando = false;
        this.closeModal();
        this.citas = null;
        this.error = MENSAJE_SIN_CONEXION;
      }
    });
  }
}
```

### 4.2 `frontend/src/app/features/medico/medico-citas-pendientes/medico-citas-pendientes.component.html`
Commit: `P3: desactivar botones mientras se guarda y mostrar el mensaje (RFC-015)`

<details><summary>ANTES (archivo completo, 62 líneas)</summary>

<!-- v:archivo-antes frontend/src/app/features/medico/medico-citas-pendientes/medico-citas-pendientes.component.html -->
```html
<div class="citas-container">
    <h2>Gestión de Citas Pendientes</h2>

    <div *ngIf="error" class="error-message">{{ error }}</div>

    <div class="table-container" *ngIf="citas">
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Paciente</th>
                    <th>DNI</th>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Motivo</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                <tr *ngFor="let cita of citas">
                    <td>{{ cita.idCita }}</td>
                    <td>{{ cita.pacienteNombres }} {{ cita.pacienteApellidos }}</td>
                    <td>{{ cita.pacienteDni }}</td>
                    <td>{{ cita.fecha }}</td>
                    <td>{{ cita.hora }}</td>
                    <td>{{ cita.motivo }}</td>
                    <td class="actions-cell">
                        <button class="btn-action btn-accept" (click)="confirmAction(cita, 'aceptar')">Aceptar</button>
                        <button class="btn-action btn-cancel" (click)="confirmAction(cita, 'cancelar')">Cancelar</button>
                    </td>
                </tr>
                <tr *ngIf="citas.length === 0">
                    <td colspan="7" class="empty-message">No hay citas pendientes.</td>
                </tr>
            </tbody>
        </table>
    </div>
</div>

<!-- Confirmation Modal -->
<div class="modal-overlay" *ngIf="selectedCita">
    <div class="modal-content">
        <div class="modal-header" [ngClass]="{'header-accept': actionType === 'aceptar', 'header-cancel': actionType === 'cancelar'}">
            <h3>{{ actionType === 'aceptar' ? 'Aceptar Cita' : 'Cancelar Cita' }}</h3>
            <button class="close-btn" (click)="closeModal()">×</button>
        </div>
        <div class="modal-body">
            <p>¿Estás seguro que deseas <strong>{{ actionType === 'aceptar' ? 'aceptar' : 'cancelar' }}</strong> la siguiente cita?</p>
            <div class="cita-summary">
                <p><strong>Paciente:</strong> {{ selectedCita.pacienteNombres }} {{ selectedCita.pacienteApellidos }}</p>
                <p><strong>Fecha:</strong> {{ selectedCita.fecha }} - {{ selectedCita.hora }}</p>
                <p><strong>Motivo:</strong> {{ selectedCita.motivo }}</p>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn-secondary" (click)="closeModal()">Volver</button>
            <button [class]="actionType === 'aceptar' ? 'btn-confirm-accept' : 'btn-confirm-cancel'" (click)="executeAction()">
                Confirmar {{ actionType === 'aceptar' ? 'Aceptación' : 'Cancelación' }}
            </button>
        </div>
    </div>
</div>
```
</details>

DESPUÉS (archivo completo):
<!-- v:archivo-despues frontend/src/app/features/medico/medico-citas-pendientes/medico-citas-pendientes.component.html -->
```html
<div class="citas-container">
    <h2>Gestión de Citas Pendientes</h2>

    <div *ngIf="error" class="error-message">{{ error }}</div>

    <div role="status" aria-live="polite">
        <div *ngIf="mensaje" class="alert alert-success">{{ mensaje }}</div>
    </div>

    <div class="table-container" *ngIf="citas">
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Paciente</th>
                    <th>DNI</th>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Motivo</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                <tr *ngFor="let cita of citas">
                    <td>{{ cita.idCita }}</td>
                    <td>{{ cita.pacienteNombres }} {{ cita.pacienteApellidos }}</td>
                    <td>{{ cita.pacienteDni }}</td>
                    <td>{{ cita.fecha }}</td>
                    <td>{{ cita.hora }}</td>
                    <td>{{ cita.motivo }}</td>
                    <td class="actions-cell">
                        <button class="btn-action btn-accept" [disabled]="procesando" (click)="confirmAction(cita, 'aceptar')">Aceptar</button>
                        <button class="btn-action btn-cancel" [disabled]="procesando" (click)="confirmAction(cita, 'cancelar')">Cancelar</button>
                    </td>
                </tr>
                <tr *ngIf="citas.length === 0">
                    <td colspan="7" class="empty-message">No hay citas pendientes.</td>
                </tr>
            </tbody>
        </table>
    </div>
</div>

<!-- Confirmation Modal -->
<div class="modal-overlay" *ngIf="selectedCita">
    <div class="modal-content">
        <div class="modal-header" [ngClass]="{'header-accept': actionType === 'aceptar', 'header-cancel': actionType === 'cancelar'}">
            <h3>{{ actionType === 'aceptar' ? 'Aceptar Cita' : 'Cancelar Cita' }}</h3>
            <button class="close-btn" [disabled]="procesando" (click)="closeModal()">×</button>
        </div>
        <div class="modal-body">
            <p>¿Estás seguro que deseas <strong>{{ actionType === 'aceptar' ? 'aceptar' : 'cancelar' }}</strong> la siguiente cita?</p>
            <div class="cita-summary">
                <p><strong>Paciente:</strong> {{ selectedCita.pacienteNombres }} {{ selectedCita.pacienteApellidos }}</p>
                <p><strong>Fecha:</strong> {{ selectedCita.fecha }} - {{ selectedCita.hora }}</p>
                <p><strong>Motivo:</strong> {{ selectedCita.motivo }}</p>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn-secondary" [disabled]="procesando" (click)="closeModal()">Volver</button>
            <button [class]="actionType === 'aceptar' ? 'btn-confirm-accept' : 'btn-confirm-cancel'" [disabled]="procesando" (click)="executeAction()">
                {{ procesando ? 'Guardando...' : 'Confirmar ' + (actionType === 'aceptar' ? 'Aceptación' : 'Cancelación') }}
            </button>
        </div>
    </div>
</div>
```

### 4.3 Archivo NUEVO: `frontend/src/app/features/medico/medico-citas-pendientes/medico-citas-pendientes.component.unitaria.spec.ts`
Commit: `P3: pruebas unitarias del doble envio y del mensaje (RFC-015)`

<!-- v:nuevo frontend/src/app/features/medico/medico-citas-pendientes/medico-citas-pendientes.component.unitaria.spec.ts -->
```ts
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
```

---

## 5. Mensajes de commit (en este orden)

1. `P3: bandera procesando y mensaje de confirmacion en citas pendientes (RFC-015)`
2. `P3: desactivar botones mientras se guarda y mostrar el mensaje (RFC-015)`
3. `P3: pruebas unitarias del doble envio y del mensaje (RFC-015)`

## 6. Pull request

**Título:** `P3 (RFC-015): Aceptar/Cancelar del médico sin doble envío y con confirmación visible`

**Descripción** (cópiala tal cual):

```text
Closes #44

Paquete P3 - RFC-015 (docs/rfc/RFC-015.md), hallazgo H-044.

Qué cambia:
- Bandera "procesando": mientras se espera al servidor, "Confirmar", "Volver", la X y los botones Aceptar/Cancelar de la tabla quedan desactivados, y "Confirmar" dice "Guardando...".
- Mensaje "Cita N confirmada." / "Cita N cancelada." en un contenedor role="status".
- 5 pruebas unitarias nuevas (medico-citas-pendientes.component.unitaria.spec.ts).

Cómo se verificó (en una copia de develop, antes de abrir este PR):
- ng build sin errores; unitarias del frontend 32/32 y 54/54 (49 de antes + 5 nuevas); Playwright 6/6 (incluye medico-citas-pendientes.spec.ts, sin modificarlo).
- Doble clic en "Confirmar Aceptación" con el PUT demorado 1500 ms: antes 2 PUT, ahora 1; se ve "Cita N confirmada.".
```

> **Importante:** GitHub cierra el issue #44 solo cuando el cambio llega a `master`. Al unir a `develop` el issue sigue abierto.

---

## 7. Errores comunes y qué hacer

| Qué pasa | Qué hacer |
|---|---|
| No aparece el lápiz o GitHub dice "fork this repository" | No tienes permiso de escritura. Pídeselo a Brayan; **no** hagas un fork. |
| Editaste estando en `master` | No confirmes. Cierra la pestaña sin hacer commit, cambia a `develop` y empieza de nuevo. |
| El PR dice `base: master` | En el PR, **Edit** junto al título → `base` = `develop` → "Change base". |
| Elegiste "Commit directly to the develop branch" | No hagas nada más y avísale a Brayan para que lo revierta. |
| El ANTES (plegado) no se parece a lo que ves en el editor | Estás en otro archivo o en otra rama, o alguien cambió el archivo. No pegues: avisa a Brayan. |
| Ctrl+A seleccionó toda la página y no el código | Primero haz clic **dentro** del editor de código y luego Ctrl+A. |
| Al pegar quedó texto viejo al final | Deshaz con Ctrl+Z y repite: clic dentro del editor, Ctrl+A, Ctrl+V. |
| El archivo nuevo quedó en otra carpeta | En "Files changed" revisa la ruta. Si está mal, bórralo (abre el archivo → menú `...` → "Delete file", commit en tu rama) y créalo otra vez en la carpeta correcta. |
| El issue no se cerró al unir el PR | Es normal: ver la nota de la sección 6. |
