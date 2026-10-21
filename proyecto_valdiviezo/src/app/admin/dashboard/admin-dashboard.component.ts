import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent {
  collapsed = false;
  constructor(private router: Router, private authService: AuthService) {}

  toggleSidebar() {
    this.collapsed = !this.collapsed;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login-selection']);
  }
}
