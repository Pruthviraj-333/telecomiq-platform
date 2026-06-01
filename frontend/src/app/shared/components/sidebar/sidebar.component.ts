import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule],
  template: `
    <aside class="sidebar" [class.collapsed]="!isOpen">
      <nav class="sidebar-nav">
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
          <mat-icon>dashboard</mat-icon>
          <span class="nav-label" *ngIf="isOpen">Dashboard</span>
        </a>

        <a routerLink="/tickets" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
          <mat-icon>confirmation_number</mat-icon>
          <span class="nav-label" *ngIf="isOpen">Tickets</span>
        </a>

        <a routerLink="/tickets/create" routerLinkActive="active" class="nav-item" *ngIf="authService.isCustomer() || authService.isAdmin()">
          <mat-icon>add_circle</mat-icon>
          <span class="nav-label" *ngIf="isOpen">Create Ticket</span>
        </a>

        <a routerLink="/admin" routerLinkActive="active" class="nav-item" *ngIf="authService.isAdmin()">
          <mat-icon>admin_panel_settings</mat-icon>
          <span class="nav-label" *ngIf="isOpen">Admin Panel</span>
        </a>

        <div class="nav-divider" *ngIf="isOpen"></div>

        <div class="nav-section-title" *ngIf="isOpen">QUICK INFO</div>

        <div class="nav-info" *ngIf="isOpen">
          <div class="info-item">
            <span class="info-dot online"></span>
            <span>AI Service</span>
          </div>
          <div class="info-item">
            <span class="info-dot online"></span>
            <span>Backend API</span>
          </div>
        </div>
      </nav>
    </aside>
  `,
  styles: [`
    .sidebar {
      position: fixed;
      top: 64px;
      left: 0;
      bottom: 0;
      width: 260px;
      background: var(--bg-secondary);
      border-right: 1px solid var(--border-color);
      padding: 16px 12px;
      transition: width var(--transition-normal);
      overflow-x: hidden;
      z-index: 900;
    }

    .sidebar.collapsed {
      width: 72px;
    }

    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 12px 16px;
      border-radius: var(--border-radius-sm);
      color: var(--text-secondary);
      font-size: 0.9rem;
      font-weight: 500;
      transition: all var(--transition-fast);
      white-space: nowrap;
      text-decoration: none;
    }

    .nav-item:hover {
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-primary);
    }

    .nav-item.active {
      background: linear-gradient(135deg, rgba(30, 58, 95, 0.4), rgba(0, 188, 212, 0.1));
      color: var(--accent-400);
      border-left: 3px solid var(--accent-500);
    }

    .nav-item mat-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
    }

    .nav-divider {
      height: 1px;
      background: var(--border-color);
      margin: 16px 8px;
    }

    .nav-section-title {
      font-size: 0.65rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      padding: 0 16px;
      margin-bottom: 8px;
    }

    .nav-info {
      padding: 0 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .info-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .info-dot.online {
      background: var(--success);
      box-shadow: 0 0 6px rgba(16, 185, 129, 0.5);
    }

    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
      }
    }
  `]
})
export class SidebarComponent {
  @Input() isOpen = true;

  constructor(public authService: AuthService) {}
}
