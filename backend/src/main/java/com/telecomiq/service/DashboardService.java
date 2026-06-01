package com.telecomiq.service;

import com.telecomiq.dto.response.DashboardStatsResponse;
import com.telecomiq.enums.TicketPriority;
import com.telecomiq.enums.TicketStatus;
import com.telecomiq.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TicketRepository ticketRepository;

    public DashboardStatsResponse getStats() {
        long total = ticketRepository.count();
        long open = ticketRepository.countByStatus(TicketStatus.OPEN);
        long aiAnalyzed = ticketRepository.countByStatus(TicketStatus.AI_ANALYZED);
        long aiSuggested = ticketRepository.countByStatus(TicketStatus.AI_SUGGESTED);
        long escalated = ticketRepository.countByStatus(TicketStatus.ESCALATED);
        long inProgress = ticketRepository.countByStatus(TicketStatus.IN_PROGRESS);
        long resolved = ticketRepository.countByStatus(TicketStatus.RESOLVED);
        long closed = ticketRepository.countByStatus(TicketStatus.CLOSED);
        long critical = ticketRepository.countByPriority(TicketPriority.CRITICAL);
        long totalEscalated = ticketRepository.countByEscalated(true);

        double escalationRate = total > 0 ? (double) totalEscalated / total * 100 : 0;
        double resolutionRate = total > 0 ? (double) (resolved + closed) / total * 100 : 0;

        // Tickets by category
        Map<String, Long> byCategory = new LinkedHashMap<>();
        List<Object[]> categoryData = ticketRepository.countByGroupCategory();
        for (Object[] row : categoryData) {
            byCategory.put(row[0].toString(), (Long) row[1]);
        }

        // Tickets by priority
        Map<String, Long> byPriority = new LinkedHashMap<>();
        List<Object[]> priorityData = ticketRepository.countByGroupPriority();
        for (Object[] row : priorityData) {
            byPriority.put(row[0].toString(), (Long) row[1]);
        }

        // Tickets by status
        Map<String, Long> byStatus = new LinkedHashMap<>();
        List<Object[]> statusData = ticketRepository.countByGroupStatus();
        for (Object[] row : statusData) {
            byStatus.put(row[0].toString(), (Long) row[1]);
        }

        return DashboardStatsResponse.builder()
                .totalTickets(total)
                .openTickets(open + aiAnalyzed + aiSuggested)
                .escalatedTickets(escalated)
                .resolvedTickets(resolved)
                .closedTickets(closed)
                .criticalTickets(critical)
                .inProgressTickets(inProgress)
                .escalationRate(Math.round(escalationRate * 100.0) / 100.0)
                .resolutionRate(Math.round(resolutionRate * 100.0) / 100.0)
                .ticketsByCategory(byCategory)
                .ticketsByPriority(byPriority)
                .ticketsByStatus(byStatus)
                .build();
    }
}
