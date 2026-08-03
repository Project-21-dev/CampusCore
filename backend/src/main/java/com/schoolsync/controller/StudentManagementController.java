package com.schoolsync.controller;

import com.schoolsync.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/studentmanagement")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
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
