import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ServicePaciente } from '../../../core/services/service-paciente';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent {
  paciente = {
    nombres: '',
    apellidos: '',
    dni: '',
    clave: '',
    fecha_nacimiento: '',
    sexo: 'M',
    telefono: '',
    id_estado_paciente: 1, // 1 = Activo (según el SQL)
    id_ubigeo: 1 // 1 = Lima, San Juan de Lurigancho (según el SQL)
  };
  
  error = '';
  minFechaNacimiento = '1900-01-01';
  maxFechaNacimiento = '';

  constructor(
    private router: Router,
    private servicePaciente: ServicePaciente
  ) {
    this.maxFechaNacimiento = this.calcularMaxFechaNacimiento();
  }

  validarDniPeruano(dni: string): boolean {
    // DNI peruano: 8 dígitos numéricos
    const dniRegex = /^\d{8}$/;
    return dniRegex.test(dni);
  }

  validarContrasenaFuerte(clave: string): boolean {
    // Al menos 6 caracteres, 1 mayúscula, 1 minúscula, 1 número, 1 caracter especial
    const tieneMinimo6 = clave.length >= 6;
    const tieneMayuscula = /[A-Z]/.test(clave);
    const tieneMinuscula = /[a-z]/.test(clave);
    const tieneNumero = /[0-9]/.test(clave);
    const tieneEspecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(clave);
    
    return tieneMinimo6 && tieneMayuscula && tieneMinuscula && tieneNumero && tieneEspecial;
  }

  private calcularMaxFechaNacimiento(): string {
    const hoy = new Date();
    // Un día antes de hoy (no permitir fecha de hoy ni futuras)
    hoy.setDate(hoy.getDate() - 1);
    const y = hoy.getFullYear();
    const m = String(hoy.getMonth() + 1).padStart(2, '0');
    const d = String(hoy.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  validarFechaNacimiento(fechaISO: string): boolean {
    if (!fechaISO) return false;
    const fecha = new Date(fechaISO);
    const min = new Date(this.minFechaNacimiento);
    const max = new Date(this.maxFechaNacimiento);
    // Validar rango [min, max]
    return fecha >= min && fecha <= max;
  }

  registrar() {
    this.error = '';
    
    // Validar campos obligatorios
    if (!this.paciente.nombres || !this.paciente.apellidos) {
      this.error = 'Nombres y apellidos son obligatorios.';
      return;
    }
    
    // Validar DNI
    if (!this.validarDniPeruano(this.paciente.dni)) {
      this.error = 'DNI inválido. Debe contener exactamente 8 dígitos numéricos.';
      return;
    }
    
    // Validar contraseña fuerte
    if (!this.validarContrasenaFuerte(this.paciente.clave)) {
      this.error = 'Contraseña débil. Debe tener al menos 6 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 caracter especial (!@#$%^&*...).';
      return;
    }
    
    // Validar fecha de nacimiento
    if (!this.validarFechaNacimiento(this.paciente.fecha_nacimiento)) {
      this.error = `Fecha de nacimiento inválida. Debe ser entre ${this.minFechaNacimiento} y ${this.maxFechaNacimiento} (no puede ser hoy ni futura).`;
      return;
    }
    
    // Validar sexo
    if (!this.paciente.sexo) {
      this.error = 'Por favor seleccione el sexo.';
      return;
    }
    
    console.log('Registrando paciente:', this.paciente);
    
    // Llamar al servicio para guardar en la base de datos
    this.servicePaciente.crearPaciente(this.paciente).subscribe({
      next: (response) => {
        console.log('Paciente registrado exitosamente:', response);
        alert('Registro exitoso. Ahora puede iniciar sesión con su DNI y contraseña.');
        this.router.navigate(['/login-paciente']);
      },
      error: (error) => {
        console.error('Error al registrar paciente:', error);
        if (error.status === 500 && error.error?.message?.includes('Duplicate entry')) {
          this.error = 'El DNI ya está registrado. Por favor use otro DNI o inicie sesión.';
        } else {
          this.error = 'Error al registrar. Por favor intente nuevamente.';
        }
      }
    });
  }
}
