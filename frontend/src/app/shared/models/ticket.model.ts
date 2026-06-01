export interface Ticket {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  aiConfidenceScore: number;
  aiResolution: string;
  escalated: boolean;
  escalationReason: string;
  customerName: string;
  customerEmail: string;
  customerId: number;
  assignedEngineerName: string;
  assignedEngineerId: number;
  resolvedBy: string;
  createdAt: string;
  updatedAt: string;
  comments: TicketComment[];
}

export interface TicketComment {
  id: number;
  comment: string;
  userName: string;
  userRole: string;
  userId: number;
  createdAt: string;
}

export interface TicketRequest {
  title: string;
  description: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
