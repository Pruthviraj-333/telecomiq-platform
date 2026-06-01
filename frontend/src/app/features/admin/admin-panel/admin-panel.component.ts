import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../shared/models/user.model';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatButtonModule, MatIconModule, MatTabsModule, MatChipsModule, MatSnackBarModule, MatProgressSpinnerModule],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.css'
})
export class AdminPanelComponent implements OnInit {
  users: User[] = [];
  engineers: User[] = [];
  customers: User[] = [];
  loading = true;
  userColumns = ['id', 'name', 'email', 'role', 'createdAt', 'actions'];

  constructor(private userService: UserService, private snackBar: MatSnackBar) {}

  ngOnInit(): void { this.loadData(); }

  loadData(): void {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.engineers = users.filter(u => u.role === 'ENGINEER');
        this.customers = users.filter(u => u.role === 'CUSTOMER');
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  deleteUser(id: number): void {
    if (!confirm('Are you sure you want to delete this user?')) return;
    this.userService.deleteUser(id).subscribe({
      next: () => { this.loadData(); this.snackBar.open('User deleted', 'Close', { duration: 3000 }); },
      error: () => this.snackBar.open('Failed to delete user', 'Close', { duration: 3000 })
    });
  }
}
