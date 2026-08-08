package com.campuscore.controller;

import com.campuscore.dto.AuthResponse;
import com.campuscore.dto.ChangePasswordRequest;
import com.campuscore.dto.LoginRequest;
import com.campuscore.dto.RegisterRequest;
import com.campuscore.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody ChangePasswordRequest request) {
        return ResponseEntity.ok(authService.changePassword(authorization, request));
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Backend is running");
    }
}
