package com.schoolsync.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NotificationDTO {
    private Long notificationId;
    private String message;
    private String type;
    private LocalDateTime createdAt;
    private boolean isRead;
}
