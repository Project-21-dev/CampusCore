package com.campuscore.service;

import java.util.Arrays;

import org.springframework.stereotype.Service;

import com.campuscore.entity.Role;
import com.campuscore.entity.User;
import com.campuscore.repository.UserRepository;
import com.campuscore.util.JwtUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FaceAttendanceAuthService {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public User requireAuthenticatedUser(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Authentication is required.");
        }

        String token = authorizationHeader.substring(7);
        String username;
        try {
            username = jwtUtil.extractUsername(token);
        } catch (Exception e) {
            throw new RuntimeException("Invalid or expired authentication token.");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Authenticated user was not found."));

        if (!jwtUtil.validateToken(token, username)) {
            throw new RuntimeException("Invalid or expired authentication token.");
        }
        return user;
    }

    public User requireRole(String authorizationHeader, Role... allowedRoles) {
        User user = requireAuthenticatedUser(authorizationHeader);
        boolean allowed = Arrays.stream(allowedRoles).anyMatch(role -> role == user.getRole());
        if (!allowed) {
            throw new RuntimeException("You are not authorized for this attendance operation.");
        }
        return user;
    }

    public Long requireStudentId(String authorizationHeader) {
        User user = requireRole(authorizationHeader, Role.Student);
        if (user.getStudent() == null) {
            throw new RuntimeException("No student profile is linked to this account.");
        }
        return user.getStudent().getStudentId();
    }
}
