import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { DashboardStats } from '../../shared/models/dashboard.model';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="dashboard-container fade-in">
      <div class="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {{ authService.getCurrentUser()?.name }}</p>
      </div>

      <div *ngIf="loading" class="loading-container">
        <mat-spinner diameter="48"></mat-spinner>
      </div>

      <div *ngIf="!loading && stats" class="dashboard-content">
        <!-- Stat Cards -->
        <div class="stats-grid">
          <div class="stat-card glass-card total">
            <div class="stat-icon"><mat-icon>confirmation_number</mat-icon></div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.totalTickets }}</span>
              <span class="stat-label">Total Tickets</span>
            </div>
          </div>
          <div class="stat-card glass-card open">
            <div class="stat-icon"><mat-icon>folder_open</mat-icon></div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.openTickets }}</span>
              <span class="stat-label">Open Tickets</span>
            </div>
          </div>
          <div class="stat-card glass-card escalated">
            <div class="stat-icon"><mat-icon>warning</mat-icon></div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.escalatedTickets }}</span>
              <span class="stat-label">Escalated</span>
            </div>
          </div>
          <div class="stat-card glass-card resolved">
            <div class="stat-icon"><mat-icon>check_circle</mat-icon></div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.resolvedTickets }}</span>
              <span class="stat-label">Resolved</span>
            </div>
          </div>
          <div class="stat-card glass-card critical">
            <div class="stat-icon"><mat-icon>error</mat-icon></div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.criticalTickets }}</span>
              <span class="stat-label">Critical</span>
            </div>
          </div>
        </div>

        <!-- Rate Cards -->
        <div class="rates-grid">
          <div class="rate-card glass-card">
            <div class="rate-header">
              <mat-icon>trending_up</mat-icon>
              <span>Escalation Rate</span>
            </div>
            <div class="rate-value" [class.danger]="stats.escalationRate > 30">
              {{ stats.escalationRate | number:'1.1-1' }}%
            </div>
            <div class="rate-bar">
              <div class="rate-fill escalation" [style.width.%]="stats.escalationRate"></div>
            </div>
          </div>
          <div class="rate-card glass-card">
            <div class="rate-header">
              <mat-icon>task_alt</mat-icon>
              <span>Resolution Rate</span>
            </div>
            <div class="rate-value success">
              {{ stats.resolutionRate | number:'1.1-1' }}%
            </div>
            <div class="rate-bar">
              <div class="rate-fill resolution" [style.width.%]="stats.resolutionRate"></div>
            </div>
          </div>
        </div>

        <!-- Charts -->
        <div class="charts-grid">
          <div class="chart-card glass-card">
            <h3>Tickets by Category</h3>
            <div class="chart-wrapper">
              <canvas #categoryChart></canvas>
            </div>
          </div>
          <div class="chart-card glass-card">
            <h3>Tickets by Priority</h3>
            <div class="chart-wrapper">
              <canvas #priorityChart></canvas>
            </div>
          </div>
          <div class="chart-card glass-card">
            <h3>Tickets by Status</h3>
            <div class="chart-wrapper">
              <canvas #statusChart></canvas>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="!loading && !stats" class="empty-state">
        <mat-icon>analytics</mat-icon>
        <h3>No data available</h3>
        <p>Create tickets to see dashboard analytics</p>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { max-width: 1400px; margin: 0 auto; }
    .page-header { margin-bottom: 32px; }
    .page-header h1 { font-size: 1.8rem; color: var(--text-primary); margin-bottom: 4px; }
    .page-header p { color: var(--text-muted); font-size: 0.9rem; }

    .loading-container { display: flex; justify-content: center; padding: 80px; }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      width: 48px; height: 48px;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      background: rgba(255,255,255,0.05);
    }
    .stat-card.total .stat-icon { color: #3b82f6; }
    .stat-card.open .stat-icon { color: #f59e0b; }
    .stat-card.escalated .stat-icon { color: #ef4444; }
    .stat-card.resolved .stat-icon { color: #10b981; }
    .stat-card.critical .stat-icon { color: #ef4444; }

    .stat-value {
      font-family: 'Outfit', sans-serif;
      font-size: 1.8rem;
      font-weight: 700;
      color: var(--text-primary);
      display: block;
    }
    .stat-label { font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }

    .rates-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .rate-card { padding: 24px; }
    .rate-header { display: flex; align-items: center; gap: 8px; color: var(--text-secondary); margin-bottom: 12px; font-size: 0.9rem; }
    .rate-value { font-family: 'Outfit'; font-size: 2rem; font-weight: 700; color: var(--text-primary); margin-bottom: 12px; }
    .rate-value.danger { color: var(--danger); }
    .rate-value.success { color: var(--success); }
    .rate-bar { height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden; }
    .rate-fill { height: 100%; border-radius: 3px; transition: width 1s ease; }
    .rate-fill.escalation { background: linear-gradient(90deg, #f59e0b, #ef4444); }
    .rate-fill.resolution { background: linear-gradient(90deg, #10b981, #059669); }

    .charts-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
    .chart-card { padding: 24px; }
    .chart-card h3 { font-size: 0.95rem; color: var(--text-secondary); margin-bottom: 16px; }
    .chart-wrapper { position: relative; height: 260px; }

    .empty-state { text-align: center; padding: 80px 20px; color: var(--text-muted); }
    .empty-state mat-icon { font-size: 64px; width: 64px; height: 64px; margin-bottom: 16px; opacity: 0.3; }
    .empty-state h3 { font-size: 1.2rem; margin-bottom: 8px; }

    @media (max-width: 1200px) { .stats-grid { grid-template-columns: repeat(3, 1fr); } .charts-grid { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 768px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } .charts-grid { grid-template-columns: 1fr; } .rates-grid { grid-template-columns: 1fr; } }
  `]
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('categoryChart') categoryChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('priorityChart') priorityChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('statusChart') statusChartRef!: ElementRef<HTMLCanvasElement>;

  stats: DashboardStats | null = null;
  loading = true;

  constructor(
    public authService: AuthService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  ngAfterViewInit(): void {}

  loadStats(): void {
    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
        setTimeout(() => this.renderCharts(), 100);
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  renderCharts(): void {
    if (!this.stats) return;

    // Category Doughnut Chart
    if (this.categoryChartRef) {
      new Chart(this.categoryChartRef.nativeElement, {
        type: 'doughnut',
        data: {
          labels: Object.keys(this.stats.ticketsByCategory).map(k => k.replace('_', ' ')),
          datasets: [{
            data: Object.values(this.stats.ticketsByCategory),
            backgroundColor: ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 12, font: { size: 11 } } } },
          cutout: '65%'
        }
      });
    }

    // Priority Bar Chart
    if (this.priorityChartRef) {
      new Chart(this.priorityChartRef.nativeElement, {
        type: 'bar',
        data: {
          labels: Object.keys(this.stats.ticketsByPriority),
          datasets: [{
            label: 'Tickets',
            data: Object.values(this.stats.ticketsByPriority),
            backgroundColor: ['#10b981', '#f59e0b', '#f97316', '#ef4444'],
            borderRadius: 6,
            borderSkipped: false
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
            y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.08)' } }
          }
        }
      });
    }

    // Status Doughnut Chart
    if (this.statusChartRef) {
      const statusColors: { [key: string]: string } = {
        OPEN: '#3b82f6', AI_ANALYZED: '#8b5cf6', AI_SUGGESTED: '#6366f1',
        ESCALATED: '#ef4444', IN_PROGRESS: '#f59e0b', RESOLVED: '#10b981', CLOSED: '#6b7280'
      };
      new Chart(this.statusChartRef.nativeElement, {
        type: 'doughnut',
        data: {
          labels: Object.keys(this.stats.ticketsByStatus).map(k => k.replace('_', ' ')),
          datasets: [{
            data: Object.values(this.stats.ticketsByStatus),
            backgroundColor: Object.keys(this.stats.ticketsByStatus).map(k => statusColors[k] || '#6b7280'),
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 12, font: { size: 11 } } } },
          cutout: '65%'
        }
      });
    }
  }
}
