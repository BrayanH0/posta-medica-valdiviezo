import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServiceCita } from '../../services/service-cita';
import { ServiceMedico } from '../../../medico/services/service-medico';

@Component({
  selector: 'app-registro-cita',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro-cita.html'
})
export class RegistroCitaComponent implements OnInit {
  especialidades: any[] = [];
  medicos: any[] = [];
  medicosFiltrados: any[] = [];
  
  cita = {
    idEspecialidad: '',
    idMedico: '',
    fecha: '',
    hora: '',
    motivo: '',
    sintomas: ''
  };

  horariosDisponibles = ['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'];

  constructor(
    private medicoService: ServiceMedico,
    private citaService: ServiceCita
  ) {}

  ngOnInit() {
    this.cargarEspecialidades();
    this.cargarMedicos();
  }

  cargarEspecialidades() {
    this.medicoService.getEspecialidades().subscribe((res: any[]) => {
      this.especialidades = res;
    });
  }

  cargarMedicos() {
    this.medicoService.listarmedicos().subscribe((res: any[]) => {
      this.medicos = res;
    });
  }

  onEspecialidadChange() {
    if (this.cita.idEspecialidad) {
      this.medicosFiltrados = this.medicos.filter(m => m.id_especialidad == this.cita.idEspecialidad);
    } else {
      this.medicosFiltrados = [];
    }
  }

  registrarCita() {
    console.log('Registrando cita:', this.cita);
    alert('Cita registrada con éxito (Simulación)');
  }
}