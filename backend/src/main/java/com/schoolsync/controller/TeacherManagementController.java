package com.schoolsync.controller;

import com.schoolsync.service.TeacherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/teachermanagement")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TeacherManagementController {

    private final TeacherService teacherService;

    @GetMapping("/profile/{id}")
    public ResponseEntity<?> getTeacherProfile(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(teacherService.getTeacherProfile(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
