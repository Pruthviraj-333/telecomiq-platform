import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { TicketService } from '../../../core/services/ticket.service';
import { AuthService } from '../../../core/services/auth.service';
import { Ticket, TicketComment } from '../../../shared/models/ticket.model';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatDividerModule, MatProgressSpinnerModule, MatSnackBarModule, MatChipsModule],
  templateUrl: './ticket-detail.component.html',
  styleUrl: './ticket-detail.component.css'
})
export class TicketDetailComponent implements OnInit {
  ticket: Ticket | null = null;
  comments: TicketComment[] = [];
  newComment = '';
  newStatus = '';
  loading = true;
  ticketId!: number;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private ticketService: TicketService,
    public authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.ticketId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadTicket();
    this.loadComments();
  }

  loadTicket(): void {
    this.ticketService.getTicketById(this.ticketId).subscribe({
      next: (t) => { this.ticket = t; this.newStatus = t.status; this.loading = false; },
      error: () => { this.loading = false; this.router.navigate(['/tickets']); }
    });
  }

  loadComments(): void {
    this.ticketService.getComments(this.ticketId).subscribe({ next: (c) => this.comments = c });
  }

  addComment(): void {
    if (!this.newComment.trim()) return;
    this.ticketService.addComment(this.ticketId, this.newComment).subscribe({
      next: (c) => { this.comments.unshift(c); this.newComment = ''; this.snackBar.open('Comment added', 'Close', { duration: 3000 }); },
      error: () => this.snackBar.open('Failed to add comment', 'Close', { duration: 3000 })
    });
  }

  updateStatus(): void {
    if (!this.newStatus || this.newStatus === this.ticket?.status) return;
    this.ticketService.updateTicket(this.ticketId, { status: this.newStatus }).subscribe({
      next: (t) => { this.ticket = t; this.snackBar.open('Status updated', 'Close', { duration: 3000 }); },
      error: () => this.snackBar.open('Failed to update', 'Close', { duration: 3000 })
    });
  }

  escalate(): void {
    this.ticketService.escalateTicket(this.ticketId, 'Customer: AI Solution Did Not Help').subscribe({
      next: (t) => { this.ticket = t; this.snackBar.open('Ticket escalated', 'Close', { duration: 3000 }); },
      error: () => this.snackBar.open('Failed to escalate', 'Close', { duration: 3000 })
    });
  }

  getTimeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return mins + 'm ago';
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + 'h ago';
    return Math.floor(hrs / 24) + 'd ago';
  }
}
