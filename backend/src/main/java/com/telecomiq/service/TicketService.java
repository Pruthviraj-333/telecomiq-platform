package com.telecomiq.service;

import com.telecomiq.dto.request.EscalationRequest;
import com.telecomiq.dto.request.TicketRequest;
import com.telecomiq.dto.request.TicketUpdateRequest;
import com.telecomiq.dto.response.*;
import com.telecomiq.entity.Ticket;
import com.telecomiq.entity.User;
import com.telecomiq.enums.TicketCategory;
import com.telecomiq.enums.TicketPriority;
import com.telecomiq.enums.TicketStatus;
import com.telecomiq.exception.BadRequestException;
import com.telecomiq.exception.ResourceNotFoundException;
import com.telecomiq.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class TicketService {

    private final TicketRepository ticketRepository;
    private final AiService aiService;
    private final EscalationService escalationService;
    private final EmailService emailService;
    private final AuditLogService auditLogService;

    /**
     * Full ticket creation flow:
     * 1. Save ticket as OPEN
     * 2. AI classify → update category
     * 3. AI predict priority → update priority
     * 4. AI generate resolution (RAG) → update resolution
     * 5. Update status to AI_SUGGESTED
     * 6. Check auto-escalation rules
     */
    @Transactional
    public TicketResponse createTicket(TicketRequest request, User customer) {
        // 1. Create and save ticket
        Ticket ticket = Ticket.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(TicketStatus.OPEN)
                .escalated(false)
                .customer(customer)
                .build();

        ticket = ticketRepository.save(ticket);
        log.info("Ticket #{} created by {}", ticket.getId(), customer.getEmail());

        // 2. AI Classification
        AiClassifyResponse classification = aiService.classify(
                request.getTitle(), request.getDescription());
        try {
            ticket.setCategory(TicketCategory.valueOf(
                    classification.getCategory().toUpperCase().replace(" ", "_")));
        } catch (IllegalArgumentException e) {
            ticket.setCategory(TicketCategory.NETWORK_ISSUE);
        }
        ticket.setStatus(TicketStatus.AI_ANALYZED);
        ticket = ticketRepository.save(ticket);

        // 3. AI Priority Prediction
        AiPriorityResponse priority = aiService.predictPriority(
                request.getTitle(), request.getDescription(),
                ticket.getCategory().name());
        try {
            ticket.setPriority(TicketPriority.valueOf(
                    priority.getPriority().toUpperCase()));
        } catch (IllegalArgumentException e) {
            ticket.setPriority(TicketPriority.MEDIUM);
        }

        // Use the minimum confidence score from both AI calls
        int minConfidence = Math.min(classification.getConfidence_score(), priority.getConfidence_score());
        ticket.setAiConfidenceScore(minConfidence);

        // 4. AI Resolution (RAG)
        AiResolveResponse resolution = aiService.generateResolution(
                request.getTitle(), request.getDescription(),
                ticket.getCategory().name());
        ticket.setAiResolution(resolution.getResolution());

        // 5. Update status to AI_SUGGESTED
        ticket.setStatus(TicketStatus.AI_SUGGESTED);
        ticket = ticketRepository.save(ticket);

        // 6. Check auto-escalation
        escalationService.checkAndAutoEscalate(ticket);

        // Refresh after potential escalation
        ticket = ticketRepository.findById(ticket.getId()).orElse(ticket);

        // Send creation email
        emailService.sendTicketCreatedEmail(
                customer.getEmail(), ticket.getTitle(), ticket.getId());

        auditLogService.log("TICKET_CREATED", customer.getEmail(),
                "Ticket #" + ticket.getId() + " created. Category: " + ticket.getCategory()
                        + ", Priority: " + ticket.getPriority()
                        + ", AI Confidence: " + ticket.getAiConfidenceScore() + "%");

        return TicketResponse.fromEntity(ticket);
    }

    public Page<TicketResponse> getAllTickets(Pageable pageable) {
        return ticketRepository.findAll(pageable).map(TicketResponse::fromEntitySummary);
    }

    public Page<TicketResponse> getTicketsByCustomer(Long customerId, Pageable pageable) {
        return ticketRepository.findByCustomerId(customerId, pageable)
                .map(TicketResponse::fromEntitySummary);
    }

    public Page<TicketResponse> getTicketsByEngineer(Long engineerId, Pageable pageable) {
        return ticketRepository.findByAssignedEngineerId(engineerId, pageable)
                .map(TicketResponse::fromEntitySummary);
    }

    public Page<TicketResponse> searchTickets(TicketStatus status, TicketCategory category,
                                               TicketPriority priority, String search, Pageable pageable) {
        return ticketRepository.findByFilters(status, category, priority, search, pageable)
                .map(TicketResponse::fromEntitySummary);
    }

    public TicketResponse getTicketById(Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", id));
        return TicketResponse.fromEntity(ticket);
    }

    @Transactional
    public TicketResponse updateTicket(Long id, TicketUpdateRequest request, User user) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", id));

        if (request.getStatus() != null) {
            try {
                TicketStatus newStatus = TicketStatus.valueOf(request.getStatus().toUpperCase());
                ticket.setStatus(newStatus);

                // If resolved, track who resolved it
                if (newStatus == TicketStatus.RESOLVED) {
                    ticket.setResolvedBy(user.getName());
                    emailService.sendTicketResolvedEmail(
                            ticket.getCustomer().getEmail(),
                            ticket.getTitle(),
                            ticket.getId()
                    );
                }
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid status: " + request.getStatus());
            }
        }

        if (request.getResolvedBy() != null) {
            ticket.setResolvedBy(request.getResolvedBy());
        }

        ticket = ticketRepository.save(ticket);

        auditLogService.log("TICKET_UPDATED", user.getEmail(),
                "Ticket #" + id + " updated. Status: " + ticket.getStatus());

        return TicketResponse.fromEntity(ticket);
    }

    @Transactional
    public TicketResponse escalateTicket(Long id, EscalationRequest request, User user) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", id));

        if (ticket.getEscalated()) {
            throw new BadRequestException("Ticket #" + id + " is already escalated");
        }

        escalationService.customerEscalate(ticket, request.getReason());

        ticket = ticketRepository.findById(id).orElse(ticket);
        return TicketResponse.fromEntity(ticket);
    }

    @Transactional
    public void deleteTicket(Long id) {
        if (!ticketRepository.existsById(id)) {
            throw new ResourceNotFoundException("Ticket", id);
        }
        ticketRepository.deleteById(id);
        auditLogService.log("TICKET_DELETED", "ADMIN", "Ticket #" + id + " deleted");
    }
}
