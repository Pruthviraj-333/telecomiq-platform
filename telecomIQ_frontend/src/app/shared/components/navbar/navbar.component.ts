import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatIconModule, MatButtonModule, MatMenuModule],
  template: `
    <mat-toolbar class="navbar">
      <div class="navbar-left">
        <button mat-icon-button (click)="toggleSidebar.emit()" class="menu-btn">
          <mat-icon>menu</mat-icon>
        </button>
        <div class="brand">
          <span class="brand-icon">🔧</span>
          <span class="brand-name">Telecom<span class="brand-accent">IQ</span></span>
        </div>
      </div>

      <div class="navbar-right">
        <div class="user-info" [matMenuTriggerFor]="userMenu">
          <div class="user-avatar">{{ getUserInitials() }}</div>
          <div class="user-details">
            <span class="user-name">{{ authService.getCurrentUser()?.name }}</span>
            <span class="user-role">{{ authService.getUserRole() }}</span>
          </div>
          <mat-icon class="dropdown-icon">keyboard_arrow_down</mat-icon>
        </div>

        <mat-menu #userMenu="matMenu" class="user-menu">
          <button mat-menu-item disabled>
            <mat-icon>person</mat-icon>
            <span>{{ authService.getCurrentUser()?.email }}</span>
          </button>
          <button mat-menu-item (click)="authService.logout()">
            <mat-icon>logout</mat-icon>
            <span>Logout</span>
          </button>
        </mat-menu>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      height: 64px;
      background: var(--bg-secondary) !important;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 16px;
      backdrop-filter: blur(12px);
    }

    .navbar-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .menu-btn {
      color: var(--text-secondary) !important;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .brand-icon {
      font-size: 24px;
    }

    .brand-name {
      font-family: 'Outfit', sans-serif;
      font-size: 1.3rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .brand-accent {
      background: linear-gradient(135deg, var(--accent-400), var(--primary-300));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .navbar-right {
      display: flex;
      align-items: center;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 12px;
      border-radius: var(--border-radius-sm);
      cursor: pointer;
      transition: background var(--transition-fast);
    }

    .user-info:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary-500), var(--accent-500));
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.85rem;
      color: white;
    }

    .user-details {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-weight: 600;
      font-size: 0.85rem;
      color: var(--text-primary);
    }

    .user-role {
      font-size: 0.7rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .dropdown-icon {
      color: var(--text-muted);
      font-size: 20px !important;
    }
  `]
})
export class NavbarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  constructor(public authService: AuthService) {}

  getUserInitials(): string {
    const name = this.authService.getCurrentUser()?.name || '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }
}
