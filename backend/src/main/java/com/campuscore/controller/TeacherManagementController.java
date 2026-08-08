package com.campuscore.controller;

import org.springframework.security.access.prepost.PreAuthorize;

import com.campuscore.service.TeacherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/teachermanagement")
@RequiredArgsConstructor
public class TeacherManagementController {

    private final TeacherService teacherService;

    @GetMapping("/profile/{id}")
    @PreAuthorize("@securityAccess.canAccessTeacher(authentication, #id)")
    public ResponseEntity<?> getTeacherProfile(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(teacherService.getTeacherProfile(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
