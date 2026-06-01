package com.telecomiq.service;

import com.telecomiq.entity.Ticket;
import com.telecomiq.entity.User;
import com.telecomiq.enums.Role;
import com.telecomiq.enums.TicketPriority;
import com.telecomiq.enums.TicketStatus;
import com.telecomiq.repository.TicketRepository;
import com.telecomiq.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EscalationService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final AuditLogService auditLogService;

    /**
     * Auto-escalation triggered when AI confidence < 70 or priority is CRITICAL.
     */
    @Transactional
    public void checkAndAutoEscalate(Ticket ticket) {
        boolean shouldEscalate = false;
        String reason = "";

        // Rule 1: Low AI confidence
        if (ticket.getAiConfidenceScore() != null && ticket.getAiConfidenceScore() < 70) {
            shouldEscalate = true;
            reason = "Low AI Confidence (Score: " + ticket.getAiConfidenceScore() + "%)";
        }

        // Rule 2: Critical priority
        if (ticket.getPriority() == TicketPriority.CRITICAL) {
            shouldEscalate = true;
            reason = ticket.getAiConfidenceScore() != null && ticket.getAiConfidenceScore() < 70
                    ? "Critical Priority + Low AI Confidence"
                    : "Critical Priority - Automatic Escalation";
        }

        if (shouldEscalate) {
            escalateTicket(ticket, reason, "SYSTEM");
        }
    }

    /**
     * Manual escalation triggered by customer ("AI Solution Didn't Help" button).
     */
    @Transactional
    public void customerEscalate(Ticket ticket, String reason) {
        String escalationReason = reason != null && !reason.isBlank()
                ? reason
                : "Customer requested escalation - AI Solution Didn't Help";
        escalateTicket(ticket, escalationReason, ticket.getCustomer().getEmail());
    }

    @Transactional
    public void escalateTicket(Ticket ticket, String reason, String initiatedBy) {
        ticket.setStatus(TicketStatus.ESCALATED);
        ticket.setEscalated(true);
        ticket.setEscalationReason(reason);

        // Assign an engineer (round-robin: least assigned)
        User engineer = assignEngineer();
        if (engineer != null) {
            ticket.setAssignedEngineer(engineer);

            // Notify assigned engineer
            emailService.sendEngineerAssignedEmail(
                    engineer.getEmail(),
                    engineer.getName(),
                    ticket.getTitle(),
                    ticket.getId()
            );

            // Notify about escalation
            emailService.sendEscalationEmail(
                    engineer.getEmail(),
                    ticket.getTitle(),
                    ticket.getId(),
                    reason
            );
        }

        // If critical priority, also notify all admins
        if (ticket.getPriority() == TicketPriority.CRITICAL) {
            notifyAdmins(ticket);
        }

        ticketRepository.save(ticket);

        auditLogService.log(
                "TICKET_ESCALATED",
                initiatedBy,
                "Ticket #" + ticket.getId() + " escalated. Reason: " + reason
                        + (engineer != null ? ". Assigned to: " + engineer.getName() : "")
        );

        log.info("Ticket #{} escalated. Reason: {}. Assigned to: {}",
                ticket.getId(), reason,
                engineer != null ? engineer.getName() : "No engineer available");
    }

    private User assignEngineer() {
        List<User> engineers = userRepository.findByRole(Role.ENGINEER);
        if (engineers.isEmpty()) {
            log.warn("No engineers available for assignment");
            return null;
        }

        // Simple round-robin: find engineer with least assigned escalated tickets
        User leastLoaded = engineers.get(0);
        long minCount = Long.MAX_VALUE;

        for (User eng : engineers) {
            long count = ticketRepository.countByAssignedEngineerId(eng.getId());
            if (count < minCount) {
                minCount = count;
                leastLoaded = eng;
            }
        }

        return leastLoaded;
    }

    private void notifyAdmins(Ticket ticket) {
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        for (User admin : admins) {
            emailService.sendCriticalTicketEmail(
                    admin.getEmail(),
                    ticket.getTitle(),
                    ticket.getId()
            );
        }
    }
}
