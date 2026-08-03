package com.schoolsync.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private Long userId;
    private String username;
    private String role;
    private String email;
    private Long studentId;
    private Long teacherId;
    private String message;
    private boolean success;
}
