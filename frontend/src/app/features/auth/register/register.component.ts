import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSelectModule,
    MatProgressSpinnerModule, MatSnackBarModule
  ],
  template: `
    <div class="auth-container">
      <div class="auth-card glass-card fade-in">
        <div class="auth-header">
          <span class="auth-logo">🔧</span>
          <h1>Create Account</h1>
          <p>Join TelecomIQ Platform</p>
        </div>

        <form (ngSubmit)="onRegister()" class="auth-form">
          <mat-form-field appearance="outline">
            <mat-label>Full Name</mat-label>
            <input matInput [(ngModel)]="name" name="name" required id="register-name">
            <mat-icon matPrefix>person</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput type="email" [(ngModel)]="email" name="email" required id="register-email">
            <mat-icon matPrefix>email</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Password</mat-label>
            <input matInput [type]="hidePassword ? 'password' : 'text'" [(ngModel)]="password" name="password" required minlength="6" id="register-password">
            <mat-icon matPrefix>lock</mat-icon>
            <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword">
              <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Role</mat-label>
            <mat-select [(ngModel)]="role" name="role" id="register-role">
              <mat-option value="CUSTOMER">Customer</mat-option>
              <mat-option value="ENGINEER">Support Engineer</mat-option>
              <mat-option value="ADMIN">Admin</mat-option>
            </mat-select>
            <mat-icon matPrefix>badge</mat-icon>
          </mat-form-field>

          <button mat-raised-button color="primary" type="submit" [disabled]="loading" class="submit-btn" id="register-submit">
            <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
            <span *ngIf="!loading">Create Account</span>
          </button>
        </form>

        <div class="auth-footer">
          <span>Already have an account?</span>
          <a routerLink="/login">Sign In</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: var(--bg-primary);
      background-image:
        radial-gradient(ellipse at 20% 50%, rgba(30, 58, 95, 0.3) 0%, transparent 60%),
        radial-gradient(ellipse at 80% 20%, rgba(0, 188, 212, 0.1) 0%, transparent 50%);
      padding: 20px;
    }
    .auth-card { width: 100%; max-width: 420px; padding: 40px; }
    .auth-header { text-align: center; margin-bottom: 32px; }
    .auth-logo { font-size: 48px; }
    .auth-header h1 { font-size: 1.8rem; margin: 12px 0 4px; color: var(--text-primary); }
    .auth-header p { color: var(--text-muted); font-size: 0.85rem; }
    .auth-form { display: flex; flex-direction: column; gap: 8px; }
    .submit-btn { height: 48px; font-size: 1rem; margin-top: 8px; }
    .auth-footer { text-align: center; margin-top: 24px; font-size: 0.85rem; color: var(--text-muted); }
    .auth-footer a { margin-left: 6px; font-weight: 600; }
  `]
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  role = 'CUSTOMER';
  hidePassword = true;
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  onRegister(): void {
    if (!this.name || !this.email || !this.password) return;
    this.loading = true;

    this.authService.register({
      name: this.name,
      email: this.email,
      password: this.password,
      role: this.role
    }).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open(
          err.error?.details || 'Registration failed',
          'Close',
          { duration: 4000 }
        );
      }
    });
  }
}
