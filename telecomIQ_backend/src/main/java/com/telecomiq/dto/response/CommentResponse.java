package com.telecomiq.dto.response;

import com.telecomiq.entity.TicketComment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponse {

    private Long id;
    private String comment;
    private String userName;
    private String userRole;
    private Long userId;
    private LocalDateTime createdAt;

    public static CommentResponse fromEntity(TicketComment entity) {
        return CommentResponse.builder()
                .id(entity.getId())
                .comment(entity.getComment())
                .userName(entity.getUser() != null ? entity.getUser().getName() : null)
                .userRole(entity.getUser() != null ? entity.getUser().getRole().name() : null)
                .userId(entity.getUser() != null ? entity.getUser().getId() : null)
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
