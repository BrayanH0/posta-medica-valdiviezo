import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServicePaciente } from '../../../core/services/service-paciente';
import { paciente } from '../../../shared/models/model-paciente';

@Component({
  selector: 'app-admin-pacientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-pacientes.component.html',
  styleUrls: ['./admin-pacientes.component.css']
})
export class AdminPacientesComponent implements OnInit {
  pacientes: paciente[] = [];
  pacienteSeleccionado: paciente | null = null;
  modoEdicion = false;

  constructor(private servicePaciente: ServicePaciente) {}

  ngOnInit() {
    this.cargarPacientes();
  }

  cargarPacientes() {
    this.servicePaciente.listarPacientes().subscribe({
      next: (data) => {
        this.pacientes = data;
      },
      error: (err) => {
        console.error('Error al cargar pacientes:', err);
      }
    });
  }

  editarPaciente(paciente: paciente) {
    this.pacienteSeleccionado = { ...paciente };
    this.modoEdicion = true;
  }

  guardarCambios() {
    if (this.pacienteSeleccionado && this.pacienteSeleccionado.idPaciente) {
      this.servicePaciente.actualizarPaciente(
        this.pacienteSeleccionado,
        this.pacienteSeleccionado.idPaciente
      ).subscribe({
        next: () => {
          this.cargarPacientes();
          this.cancelarEdicion();
          alert('Paciente actualizado correctamente');
        },
        error: (err) => {
          console.error('Error al actualizar:', err);
          alert('Error al actualizar paciente');
        }
      });
    }
  }

  eliminarPaciente(id: number | undefined) {
    if (!id) return;

    const confirmar = confirm('Este paciente y todas sus citas e historia clínica se eliminarán de forma permanente. ¿Desea continuar?');
    if (!confirmar) return;

    this.servicePaciente.eliminarPaciente(id).subscribe({
      next: (resp) => {
        // resp será {status, message}
        this.cargarPacientes();
        const mensaje = (resp as any)?.message || 'Paciente eliminado correctamente';
        alert(mensaje);
      },
      error: (err) => {
        console.error('Error al eliminar:', err);
        let mensaje = 'Error al eliminar paciente';
        if (err.error?.message) {
          mensaje = err.error.message;
        } else if (err.status === 409) {
          mensaje = 'No se puede eliminar: registros relacionados.';
        } else if (err.status === 404) {
          mensaje = 'Paciente no encontrado.';
        } else if (err.status === 500) {
          mensaje = 'Error interno en el servidor al eliminar.';
        } else if (err.message) {
          mensaje = err.message;
        }
        alert(mensaje);
      }
    });
  }

  cancelarEdicion() {
    this.pacienteSeleccionado = null;
    this.modoEdicion = false;
  }
}
