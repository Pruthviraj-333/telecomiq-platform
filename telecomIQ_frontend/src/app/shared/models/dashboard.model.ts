export interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  escalatedTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  criticalTickets: number;
  inProgressTickets: number;
  escalationRate: number;
  resolutionRate: number;
  ticketsByCategory: { [key: string]: number };
  ticketsByPriority: { [key: string]: number };
  ticketsByStatus: { [key: string]: number };
}
