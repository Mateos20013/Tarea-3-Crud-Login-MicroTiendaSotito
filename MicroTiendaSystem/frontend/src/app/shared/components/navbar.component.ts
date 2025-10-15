import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/services/auth.service';
import { Usuario } from '../../core/models';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule
  ],
  template: `
    <mat-toolbar color="primary" class="navbar">
      <div class="navbar-content">
        <!-- Logo y título -->
        <div class="navbar-brand">
          <mat-icon class="brand-icon">store</mat-icon>
          <span class="brand-title">MicroTienda</span>
        </div>

        <!-- Navegación principal -->
        <nav class="navbar-nav" *ngIf="currentUser">
          <a mat-button routerLink="/dashboard" routerLinkActive="active">
            <mat-icon>dashboard</mat-icon>
            Dashboard
          </a>
          <a mat-button routerLink="/productos" routerLinkActive="active">
            <mat-icon>inventory</mat-icon>
            Productos
          </a>
          <a mat-button routerLink="/ventas" routerLinkActive="active">
            <mat-icon>point_of_sale</mat-icon>
            Ventas
          </a>
        </nav>

        <!-- Menú de usuario -->
        <div class="navbar-user" *ngIf="currentUser">
          <button mat-button [matMenuTriggerFor]="userMenu" class="user-button">
            <mat-icon>account_circle</mat-icon>
            <span class="user-name">{{ currentUser.nombreCompleto }}</span>
            <mat-icon>arrow_drop_down</mat-icon>
          </button>
          
          <mat-menu #userMenu="matMenu">
            <div class="user-info">
              <div class="user-details">
                <strong>{{ currentUser.nombreCompleto }}</strong>
                <small>{{ currentUser.email }}</small>
                <span class="user-role" [class]="'role-' + currentUser.rol.toLowerCase()">
                  {{ currentUser.rol }}
                </span>
              </div>
            </div>
            
            <mat-divider></mat-divider>
            
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              <span>Cerrar Sesión</span>
            </button>
          </mat-menu>
        </div>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .navbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .navbar-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 16px;
    }

    .navbar-brand {
      display: flex;
      align-items: center;
      font-size: 20px;
      font-weight: 600;
      color: white;
      text-decoration: none;
    }

    .brand-icon {
      margin-right: 8px;
      font-size: 28px;
    }

    .brand-title {
      font-size: 20px;
    }

    .navbar-nav {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .navbar-nav a {
      color: white;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 4px;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    .navbar-nav a:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .navbar-nav a.active {
      background-color: rgba(255, 255, 255, 0.2);
    }

    .navbar-user {
      display: flex;
      align-items: center;
    }

    .user-button {
      color: white;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .user-name {
      max-width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .user-info {
      padding: 16px;
      min-width: 200px;
    }

    .user-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .user-details strong {
      font-size: 16px;
      color: #333;
    }

    .user-details small {
      color: #666;
      font-size: 12px;
    }

    .user-role {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 4px;
      width: fit-content;
    }

    .user-role.role-admin {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .user-role.role-vendedor {
      background-color: #f3e5f5;
      color: #7b1fa2;
    }

    @media (max-width: 768px) {
      .navbar-content {
        padding: 0 8px;
      }
      
      .brand-title {
        display: none;
      }
      
      .navbar-nav a span {
        display: none;
      }
      
      .user-name {
        display: none;
      }
    }
  `]
})
export class NavbarComponent {
  currentUser: Usuario | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Suscribirse a los cambios del usuario actual
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
