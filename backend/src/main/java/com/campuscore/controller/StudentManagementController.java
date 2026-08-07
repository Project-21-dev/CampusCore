package com.campuscore.controller;

import com.campuscore.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/studentmanagement")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('Admin', 'Teacher', 'Student', 'Parent')")
public class StudentManagementController {

    private final StudentService studentService;

    @GetMapping("/profile/{id}")
    public ResponseEntity<?> getStudentProfile(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(studentService.getStudentProfile(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
