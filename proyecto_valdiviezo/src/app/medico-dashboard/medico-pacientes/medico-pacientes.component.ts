import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface MockPaciente {
  id: number;
  nombres: string;
  apellidos: string;
  dni: string;
  fechaNacimiento: string;
  sexo: string;
  estado: number;
  ubigeo: string;
  direccion: string;
  telefono: string;
  email: string;
  historial: { titulo: string; fecha: string; estado: string }[];
}

@Component({
  selector: 'app-medico-pacientes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './medico-pacientes.component.html',
  styleUrls: ['./medico-pacientes.component.css']
})
export class MedicoPacientesComponent {

  selectedPaciente: MockPaciente | null = null;

  pacientes: MockPaciente[] = [
    {
      id: 1,
      nombres: 'Juan',
      apellidos: 'Perez Gomez',
      dni: '12345678',
      fechaNacimiento: '1990-05-10',
      sexo: 'M',
      estado: 1,
      ubigeo: 'Lima - San Juan de Lurigancho',
      direccion: 'Av. Siempre Viva 123',
      telefono: '999888777',
      email: 'juan.perez@email.com',
      historial: [
        { titulo: 'Cita General', fecha: '20/11/2023', estado: 'Atendido' },
        { titulo: 'Examen de Sangre', fecha: '15/10/2023', estado: 'Completado' }
      ]
    },
    {
      id: 2,
      nombres: 'Maria',
      apellidos: 'Lopez Quispe',
      dni: '23456789',
      fechaNacimiento: '1985-02-14',
      sexo: 'F',
      estado: 3,
      ubigeo: 'Cusco - Cusco',
      direccion: 'Jr. Los Olivos 456',
      telefono: '999111222',
      email: 'maria.lopez@email.com',
      historial: [
        { titulo: 'Control Mensual', fecha: '18/11/2023', estado: 'Pendiente' }
      ]
    },
    {
      id: 3,
      nombres: 'Carlos',
      apellidos: 'Gomez Soto',
      dni: '34567890',
      fechaNacimiento: '1988-08-20',
      sexo: 'M',
      estado: 1,
      ubigeo: 'Arequipa - Cercado',
      direccion: 'Av. Peru 789',
      telefono: '999333444',
      email: 'carlos.gomez@email.com',
      historial: []
    },
    {
        id: 4,
        nombres: 'Luis',
        apellidos: 'Torres Paz',
        dni: '45678901',
        fechaNacimiento: '1982-03-25',
        sexo: 'M',
        estado: 2,
        ubigeo: 'Piura - Castilla',
        direccion: 'Calle Lima 101',
        telefono: '999555666',
        email: 'luis.torres@email.com',
        historial: [
            { titulo: 'Urgencia', fecha: '01/11/2023', estado: 'Atendido' }
        ]
    },
    {
        id: 5,
        nombres: 'Ana',
        apellidos: 'Diaz Ruiz',
        dni: '56789012',
        fechaNacimiento: '1995-12-12',
        sexo: 'F',
        estado: 1,
        ubigeo: 'Puno - Juliaca',
        direccion: 'Av. Arequipa 202',
        telefono: '999777888',
        email: 'ana.diaz@email.com',
        historial: []
    }
  ];

  openModal(paciente: MockPaciente) {
    this.selectedPaciente = paciente;
  }

  closeModal() {
    this.selectedPaciente = null;
  }
}
