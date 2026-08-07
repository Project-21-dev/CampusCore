package com.campuscore.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.campuscore.dto.AttendanceSessionDTO;
import com.campuscore.dto.FaceVerificationResponse;
import com.campuscore.entity.Role;
import com.campuscore.service.FaceAttendanceAuthService;
import com.campuscore.service.FaceAttendanceService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/attendance/face")
@RequiredArgsConstructor
public class FaceAttendanceController {

    private final FaceAttendanceService faceAttendanceService;
    private final FaceAttendanceAuthService authService;

    @PostMapping("/session")
    public ResponseEntity<?> createSession(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam String className,
            @RequestParam(defaultValue = "10") Integer durationMinutes) {
        try {
            authService.requireRole(authorization, Role.Teacher, Role.Admin);
            return ResponseEntity.ok(faceAttendanceService.createSession(className, durationMinutes));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/session/class/{className}")
    public ResponseEntity<?> getActiveSessionForClass(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable String className) {
        try {
            authService.requireRole(authorization, Role.Teacher, Role.Admin);
            AttendanceSessionDTO session = faceAttendanceService.getActiveSessionForClass(className);
            if (session == null) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.ok(session);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/session/student")
    public ResponseEntity<?> getActiveSessionForStudent(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        try {
            Long studentId = authService.requireStudentId(authorization);
            AttendanceSessionDTO session = faceAttendanceService.getActiveSessionForStudent(studentId);
            if (session == null) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.ok(session);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/session/{sessionId}/close")
    public ResponseEntity<?> closeSession(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long sessionId) {
        try {
            authService.requireRole(authorization, Role.Teacher, Role.Admin);
            return ResponseEntity.ok(faceAttendanceService.closeSession(sessionId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping(value = "/enroll", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> enrollFace(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestPart("images") List<MultipartFile> images) {
        try {
            Long studentId = authService.requireStudentId(authorization);
            FaceVerificationResponse response = faceAttendanceService.enrollFace(studentId, images);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/enrollment")
    public ResponseEntity<?> enrollmentStatus(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        try {
            Long studentId = authService.requireStudentId(authorization);
            return ResponseEntity.ok(faceAttendanceService.enrollmentStatus(studentId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping(value = "/check-in", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> checkIn(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam String sessionToken,
            @RequestPart("image") MultipartFile image) {
        try {
            Long studentId = authService.requireStudentId(authorization);
            return ResponseEntity.ok(faceAttendanceService.checkIn(studentId, sessionToken, image));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
