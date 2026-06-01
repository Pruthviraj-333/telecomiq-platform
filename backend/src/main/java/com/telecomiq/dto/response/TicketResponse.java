package com.telecomiq.dto.response;

import com.telecomiq.entity.Ticket;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketResponse {

    private Long id;
    private String title;
    private String description;
    private String category;
    private String priority;
    private String status;
    private Integer aiConfidenceScore;
    private String aiResolution;
    private Boolean escalated;
    private String escalationReason;
    private String customerName;
    private String customerEmail;
    private Long customerId;
    private String assignedEngineerName;
    private Long assignedEngineerId;
    private String resolvedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<CommentResponse> comments;

    public static TicketResponse fromEntity(Ticket ticket) {
        TicketResponse.TicketResponseBuilder builder = TicketResponse.builder()
                .id(ticket.getId())
                .title(ticket.getTitle())
                .description(ticket.getDescription())
                .category(ticket.getCategory() != null ? ticket.getCategory().name() : null)
                .priority(ticket.getPriority() != null ? ticket.getPriority().name() : null)
                .status(ticket.getStatus().name())
                .aiConfidenceScore(ticket.getAiConfidenceScore())
                .aiResolution(ticket.getAiResolution())
                .escalated(ticket.getEscalated())
                .escalationReason(ticket.getEscalationReason())
                .resolvedBy(ticket.getResolvedBy())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt());

        if (ticket.getCustomer() != null) {
            builder.customerName(ticket.getCustomer().getName())
                   .customerEmail(ticket.getCustomer().getEmail())
                   .customerId(ticket.getCustomer().getId());
        }

        if (ticket.getAssignedEngineer() != null) {
            builder.assignedEngineerName(ticket.getAssignedEngineer().getName())
                   .assignedEngineerId(ticket.getAssignedEngineer().getId());
        }

        if (ticket.getComments() != null && !ticket.getComments().isEmpty()) {
            builder.comments(ticket.getComments().stream()
                    .map(CommentResponse::fromEntity)
                    .collect(Collectors.toList()));
        }

        return builder.build();
    }

    // Lightweight version without comments (for list views)
    public static TicketResponse fromEntitySummary(Ticket ticket) {
        TicketResponse.TicketResponseBuilder builder = TicketResponse.builder()
                .id(ticket.getId())
                .title(ticket.getTitle())
                .category(ticket.getCategory() != null ? ticket.getCategory().name() : null)
                .priority(ticket.getPriority() != null ? ticket.getPriority().name() : null)
                .status(ticket.getStatus().name())
                .aiConfidenceScore(ticket.getAiConfidenceScore())
                .escalated(ticket.getEscalated())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt());

        if (ticket.getCustomer() != null) {
            builder.customerName(ticket.getCustomer().getName())
                   .customerId(ticket.getCustomer().getId());
        }

        if (ticket.getAssignedEngineer() != null) {
            builder.assignedEngineerName(ticket.getAssignedEngineer().getName())
                   .assignedEngineerId(ticket.getAssignedEngineer().getId());
        }

        return builder.build();
    }
}
