package com.campuscore.controller;

import org.springframework.security.access.prepost.PreAuthorize;

import com.campuscore.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/studentmanagement")
@RequiredArgsConstructor
public class StudentManagementController {

    private final StudentService studentService;

    @GetMapping("/profile/{id}")
    @PreAuthorize("@securityAccess.canAccessStudent(authentication, #id)")
    public ResponseEntity<?> getStudentProfile(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(studentService.getStudentProfile(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
