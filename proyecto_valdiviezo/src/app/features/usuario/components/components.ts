import { Component, OnInit } from '@angular/core';
import { UsuarioService } from '../../../services/usuario';

@Component({
  selector: 'app-usuarios',
  templateUrl: './components.html'
})
export class UsuariosComponent implements OnInit {
  usuarios: any[] = [];

  constructor(private usuarioService: UsuarioService) { }

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.usuarioService.listarUsuarios(token).subscribe(data => {
        this.usuarios = data;
        console.log(this.usuarios);
      });
    }
  }
}