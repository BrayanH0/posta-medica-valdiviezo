import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../app/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],   // 🔑 habilita ngModel
  templateUrl: './login.html'
})
export class LoginComponent {
  correo = '';
  clave = '';

  constructor(private authService: AuthService) { }

  hacerLogin() {
    this.authService.login(this.correo, this.clave).subscribe(res => {
      localStorage.setItem('token', res.token);
      console.log('Token guardado:', res.token);
    });
  }
}