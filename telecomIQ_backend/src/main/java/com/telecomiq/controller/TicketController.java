package com.telecomiq.controller;

import com.telecomiq.dto.request.EscalationRequest;
import com.telecomiq.dto.request.TicketRequest;
import com.telecomiq.dto.request.TicketUpdateRequest;
import com.telecomiq.dto.response.TicketResponse;
import com.telecomiq.entity.User;
import com.telecomiq.enums.TicketCategory;
import com.telecomiq.enums.TicketPriority;
import com.telecomiq.enums.TicketStatus;
import com.telecomiq.service.TicketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@Tag(name = "Tickets", description = "Ticket management endpoints")
public class TicketController {

    private final TicketService ticketService;

    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Create a new ticket (triggers AI analysis)")
    public ResponseEntity<TicketResponse> createTicket(
            @Valid @RequestBody TicketRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ticketService.createTicket(request, user));
    }

    @GetMapping
    @Operation(summary = "Get all tickets (paginated, filtered)")
    public ResponseEntity<Page<TicketResponse>> getAllTickets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String search,
            @AuthenticationPrincipal User user) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        // Role-based filtering
        Page<TicketResponse> tickets;
        switch (user.getRole()) {
            case CUSTOMER:
                tickets = ticketService.getTicketsByCustomer(user.getId(), pageable);
                break;
            case ENGINEER:
                tickets = ticketService.getTicketsByEngineer(user.getId(), pageable);
                break;
            default: // ADMIN sees all with filters
                TicketStatus statusFilter = status != null ? TicketStatus.valueOf(status) : null;
                TicketCategory categoryFilter = category != null ? TicketCategory.valueOf(category) : null;
                TicketPriority priorityFilter = priority != null ? TicketPriority.valueOf(priority) : null;
                tickets = ticketService.searchTickets(statusFilter, categoryFilter, priorityFilter, search, pageable);
                break;
        }

        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get ticket by ID")
    public ResponseEntity<TicketResponse> getTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ENGINEER', 'ADMIN')")
    @Operation(summary = "Update ticket status")
    public ResponseEntity<TicketResponse> updateTicket(
            @PathVariable Long id,
            @RequestBody TicketUpdateRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ticketService.updateTicket(id, request, user));
    }

    @PostMapping("/{id}/escalate")
    @Operation(summary = "Escalate ticket (customer or admin)")
    public ResponseEntity<TicketResponse> escalateTicket(
            @PathVariable Long id,
            @RequestBody(required = false) EscalationRequest request,
            @AuthenticationPrincipal User user) {
        if (request == null) {
            request = new EscalationRequest();
        }
        return ResponseEntity.ok(ticketService.escalateTicket(id, request, user));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete ticket (Admin only)")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }
}
