import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TicketService } from '../../../core/services/ticket.service';
import { AuthService } from '../../../core/services/auth.service';
import { Ticket } from '../../../shared/models/ticket.model';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatChipsModule,
    MatProgressSpinnerModule, MatTooltipModule
  ],
  template: `
    <div class="ticket-list-container fade-in">
      <div class="page-header">
        <div>
          <h1>Tickets</h1>
          <p>{{ authService.isCustomer() ? 'Your support tickets' : 'All assigned tickets' }}</p>
        </div>
        <button mat-raised-button color="primary" (click)="router.navigate(['/tickets/create'])"
                *ngIf="authService.isCustomer() || authService.isAdmin()" id="create-ticket-btn">
          <mat-icon>add</mat-icon> Create Ticket
        </button>
      </div>

      <!-- Filters -->
      <div class="filters-bar glass-card" *ngIf="authService.isAdmin()">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search tickets</mat-label>
          <input matInput [(ngModel)]="searchQuery" (ngModelChange)="onSearch($event)" placeholder="Search by title..." id="ticket-search">
          <mat-icon matPrefix>search</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Status</mat-label>
          <mat-select [(ngModel)]="statusFilter" (ngModelChange)="applyFilters()">
            <mat-option [value]="null">All</mat-option>
            <mat-option value="OPEN">Open</mat-option>
            <mat-option value="AI_SUGGESTED">AI Suggested</mat-option>
            <mat-option value="ESCALATED">Escalated</mat-option>
            <mat-option value="IN_PROGRESS">In Progress</mat-option>
            <mat-option value="RESOLVED">Resolved</mat-option>
            <mat-option value="CLOSED">Closed</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Priority</mat-label>
          <mat-select [(ngModel)]="priorityFilter" (ngModelChange)="applyFilters()">
            <mat-option [value]="null">All</mat-option>
            <mat-option value="LOW">Low</mat-option>
            <mat-option value="MEDIUM">Medium</mat-option>
            <mat-option value="HIGH">High</mat-option>
            <mat-option value="CRITICAL">Critical</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="loading-container">
        <mat-spinner diameter="48"></mat-spinner>
      </div>

      <!-- Table -->
      <div class="table-container glass-card" *ngIf="!loading">
        <table mat-table [dataSource]="tickets" matSort (matSortChange)="onSort($event)">
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
            <td mat-cell *matCellDef="let t">#{{ t.id }}</td>
          </ng-container>

          <ng-container matColumnDef="title">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Title</th>
            <td mat-cell *matCellDef="let t" class="title-cell">{{ t.title }}</td>
          </ng-container>

          <ng-container matColumnDef="category">
            <th mat-header-cell *matHeaderCellDef>Category</th>
            <td mat-cell *matCellDef="let t">
              <span class="category-chip" *ngIf="t.category">{{ t.category.replace('_', ' ') }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="priority">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Priority</th>
            <td mat-cell *matCellDef="let t">
              <span class="priority-badge" [ngClass]="t.priority?.toLowerCase()" *ngIf="t.priority">{{ t.priority }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
            <td mat-cell *matCellDef="let t">
              <span class="status-badge" [ngClass]="t.status?.toLowerCase()">{{ t.status?.replace('_', ' ') }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="confidence">
            <th mat-header-cell *matHeaderCellDef>AI Score</th>
            <td mat-cell *matCellDef="let t">
              <span class="confidence-badge" *ngIf="t.aiConfidenceScore"
                    [class.low]="t.aiConfidenceScore < 70"
                    [class.high]="t.aiConfidenceScore >= 70">
                {{ t.aiConfidenceScore }}%
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="assignedEngineer">
            <th mat-header-cell *matHeaderCellDef>Assignee</th>
            <td mat-cell *matCellDef="let t">
              <span class="assignee-text" *ngIf="t.assignedEngineerName">{{ t.assignedEngineerName }}</span>
              <span class="assignee-empty" *ngIf="!t.assignedEngineerName">Unassigned</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="createdAt">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Created</th>
            <td mat-cell *matCellDef="let t" class="date-cell">{{ t.createdAt | date:'MMM d, y' }}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"
              (click)="router.navigate(['/tickets', row.id])"
              class="clickable-row"></tr>
        </table>

        <div *ngIf="tickets.length === 0" class="empty-table">
          <mat-icon>inbox</mat-icon>
          <p>No tickets found</p>
        </div>

        <mat-paginator
          [length]="totalElements"
          [pageSize]="pageSize"
          [pageSizeOptions]="[5, 10, 20, 50]"
          (page)="onPage($event)"
          showFirstLastButtons>
        </mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .ticket-list-container { max-width: 1400px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { font-size: 1.8rem; color: var(--text-primary); margin-bottom: 4px; }
    .page-header p { color: var(--text-muted); font-size: 0.9rem; }

    .filters-bar { display: flex; gap: 12px; padding: 16px 20px; margin-bottom: 16px; align-items: center; flex-wrap: wrap; }
    .search-field { flex: 1; min-width: 200px; }
    .filter-field { width: 160px; }

    .loading-container { display: flex; justify-content: center; padding: 80px; }

    .table-container { overflow: hidden; }
    table { width: 100%; }

    .title-cell { max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 500; }
    .date-cell { color: var(--text-muted); font-size: 0.85rem; }

    .category-chip {
      display: inline-block; padding: 4px 10px; border-radius: 16px;
      font-size: 0.7rem; font-weight: 600; text-transform: uppercase;
      background: rgba(99, 102, 241, 0.12); color: #818cf8;
    }

    .confidence-badge {
      font-weight: 700; font-size: 0.85rem; padding: 4px 10px; border-radius: 12px;
    }
    .confidence-badge.high { background: rgba(16,185,129,0.12); color: #10b981; }
    .confidence-badge.low { background: rgba(239,68,68,0.12); color: #ef4444; }

    .assignee-text { font-weight: 500; color: var(--text-primary); }
    .assignee-empty { color: var(--text-muted); font-style: italic; font-size: 0.85rem; }

    .clickable-row { cursor: pointer; transition: background var(--transition-fast); }
    .clickable-row:hover { background: rgba(255,255,255,0.03) !important; }

    .empty-table { text-align: center; padding: 60px; color: var(--text-muted); }
    .empty-table mat-icon { font-size: 48px; width: 48px; height: 48px; opacity: 0.3; }

    @media (max-width: 768px) { .filters-bar { flex-direction: column; } .filter-field { width: 100%; } }
  `]
})
export class TicketListComponent implements OnInit {
  tickets: Ticket[] = [];
  displayedColumns = ['id', 'title', 'category', 'priority', 'status', 'confidence', 'assignedEngineer', 'createdAt'];
  loading = true;
  totalElements = 0;
  pageSize = 10;
  currentPage = 0;
  sortBy = 'createdAt';
  sortDir = 'desc';

  searchQuery = '';
  statusFilter: string | null = null;
  priorityFilter: string | null = null;

  private searchSubject = new Subject<string>();

  constructor(
    private ticketService: TicketService,
    public authService: AuthService,
    public router: Router
  ) {
    this.searchSubject.pipe(debounceTime(400), distinctUntilChanged()).subscribe(() => this.loadTickets());
  }

  ngOnInit(): void { this.loadTickets(); }

  loadTickets(): void {
    this.loading = true;
    this.ticketService.getTickets(
      this.currentPage, this.pageSize, this.sortBy, this.sortDir,
      this.statusFilter || undefined, undefined,
      this.priorityFilter || undefined, this.searchQuery || undefined
    ).subscribe({
      next: (page) => {
        this.tickets = page.content;
        this.totalElements = page.totalElements;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onSearch(value: string): void { this.searchSubject.next(value); }
  onPage(event: PageEvent): void { this.currentPage = event.pageIndex; this.pageSize = event.pageSize; this.loadTickets(); }
  onSort(sort: Sort): void { this.sortBy = sort.active; this.sortDir = sort.direction || 'desc'; this.loadTickets(); }
  applyFilters(): void { this.currentPage = 0; this.loadTickets(); }
}
