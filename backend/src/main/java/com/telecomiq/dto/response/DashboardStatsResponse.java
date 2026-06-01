package com.telecomiq.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {

    private long totalTickets;
    private long openTickets;
    private long escalatedTickets;
    private long resolvedTickets;
    private long closedTickets;
    private long criticalTickets;
    private long inProgressTickets;

    private double escalationRate;
    private double resolutionRate;

    private Map<String, Long> ticketsByCategory;
    private Map<String, Long> ticketsByPriority;
    private Map<String, Long> ticketsByStatus;
}
