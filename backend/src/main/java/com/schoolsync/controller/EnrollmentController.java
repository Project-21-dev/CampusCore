package com.schoolsync.controller;

import com.schoolsync.dto.EnrollmentDTO;
import com.schoolsync.service.EnrollmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/studentmanagement/enrollment")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @PostMapping
    public ResponseEntity<?> createEnrollment(@RequestBody Map<String, Object> request) {
        try {
            enrollmentService.createEnrollment(request);
            return ResponseEntity.ok(Map.of("message", "Enrollment created successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<EnrollmentDTO>> getAllEnrollments() {
        return ResponseEntity.ok(enrollmentService.getAllEnrollments());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEnrollment(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        try {
            enrollmentService.updateEnrollment(id, request);
            return ResponseEntity.ok(Map.of("message", "Enrollment updated successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEnrollment(@PathVariable Long id) {
        enrollmentService.deleteEnrollment(id);
        return ResponseEntity.ok(Map.of("message", "Enrollment deleted successfully"));
    }
}
