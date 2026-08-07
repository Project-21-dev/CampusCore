package com.campuscore.controller;

import com.campuscore.service.TeacherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/teachermanagement")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('Teacher')")
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
