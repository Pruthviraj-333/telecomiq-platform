package com.telecomiq.service;

import com.telecomiq.dto.request.CommentRequest;
import com.telecomiq.dto.response.CommentResponse;
import com.telecomiq.entity.Ticket;
import com.telecomiq.entity.TicketComment;
import com.telecomiq.entity.User;
import com.telecomiq.exception.ResourceNotFoundException;
import com.telecomiq.repository.TicketCommentRepository;
import com.telecomiq.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final TicketCommentRepository commentRepository;
    private final TicketRepository ticketRepository;
    private final AuditLogService auditLogService;

    public CommentResponse addComment(CommentRequest request, User user) {
        Ticket ticket = ticketRepository.findById(request.getTicketId())
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", request.getTicketId()));

        TicketComment comment = TicketComment.builder()
                .ticket(ticket)
                .user(user)
                .comment(request.getComment())
                .build();

        comment = commentRepository.save(comment);

        auditLogService.log("COMMENT_ADDED", user.getEmail(),
                "Comment added to Ticket #" + ticket.getId());

        return CommentResponse.fromEntity(comment);
    }

    public List<CommentResponse> getCommentsByTicket(Long ticketId) {
        if (!ticketRepository.existsById(ticketId)) {
            throw new ResourceNotFoundException("Ticket", ticketId);
        }
        return commentRepository.findByTicketIdOrderByCreatedAtDesc(ticketId).stream()
                .map(CommentResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
