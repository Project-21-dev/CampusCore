package com.campuscore.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceSessionDTO {
    private Long sessionId;
    private String token;
    private String className;
    private LocalDate date;
    private LocalDateTime startedAt;
    private LocalDateTime expiresAt;
    private boolean active;
}
