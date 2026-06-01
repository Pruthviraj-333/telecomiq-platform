import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ticket, TicketRequest, PageResponse } from '../../shared/models/ticket.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private apiUrl = environment.apiUrl + '/tickets';

  constructor(private http: HttpClient) {}

  createTicket(request: TicketRequest): Observable<Ticket> {
    return this.http.post<Ticket>(this.apiUrl, request);
  }

  getTickets(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'createdAt',
    sortDir: string = 'desc',
    status?: string,
    category?: string,
    priority?: string,
    search?: string
  ): Observable<PageResponse<Ticket>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    if (status) params = params.set('status', status);
    if (category) params = params.set('category', category);
    if (priority) params = params.set('priority', priority);
    if (search) params = params.set('search', search);

    return this.http.get<PageResponse<Ticket>>(this.apiUrl, { params });
  }

  getTicketById(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiUrl}/${id}`);
  }

  updateTicket(id: number, update: { status?: string; resolvedBy?: string; assignedEngineerId?: number | null }): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.apiUrl}/${id}`, update);
  }

  escalateTicket(id: number, reason?: string): Observable<Ticket> {
    return this.http.post<Ticket>(`${this.apiUrl}/${id}/escalate`, { reason });
  }

  deleteTicket(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  addComment(ticketId: number, comment: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/comments`, { ticketId, comment });
  }

  getComments(ticketId: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/comments/${ticketId}`);
  }
}
