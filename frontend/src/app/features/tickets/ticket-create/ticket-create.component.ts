import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { TicketService } from '../../../core/services/ticket.service';
import { Ticket } from '../../../shared/models/ticket.model';

@Component({
  selector: 'app-ticket-create',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule, MatDividerModule],
  templateUrl: './ticket-create.component.html',
  styleUrl: './ticket-create.component.css'
})
export class TicketCreateComponent {
  title = '';
  description = '';
  submitting = false;
  createdTicket: Ticket | null = null;

  constructor(private ticketService: TicketService, public router: Router, private snackBar: MatSnackBar) {}

  onSubmit(): void {
    if (!this.title || !this.description) return;
    this.submitting = true;
    this.ticketService.createTicket({ title: this.title, description: this.description }).subscribe({
      next: (ticket) => { this.createdTicket = ticket; this.submitting = false; this.snackBar.open('Ticket created!', 'Close', { duration: 4000 }); },
      error: (err) => { this.submitting = false; this.snackBar.open(err.error?.details || 'Failed', 'Close', { duration: 4000 }); }
    });
  }

  escalateTicket(): void {
    if (!this.createdTicket) return;
    this.ticketService.escalateTicket(this.createdTicket.id, 'Customer: AI Solution Did Not Help').subscribe({
      next: (ticket) => { this.createdTicket = ticket; this.snackBar.open('Ticket escalated!', 'Close', { duration: 4000 }); },
      error: () => this.snackBar.open('Failed to escalate', 'Close', { duration: 4000 })
    });
  }

  createAnother(): void { this.createdTicket = null; this.title = ''; this.description = ''; }
}
