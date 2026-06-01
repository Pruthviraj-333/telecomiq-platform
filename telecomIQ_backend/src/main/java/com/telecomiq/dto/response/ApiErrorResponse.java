package com.telecomiq.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiErrorResponse {

    private int status;
    private String message;
    private String details;
    private LocalDateTime timestamp;

    public static ApiErrorResponse of(int status, String message, String details) {
        return ApiErrorResponse.builder()
                .status(status)
                .message(message)
                .details(details)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
