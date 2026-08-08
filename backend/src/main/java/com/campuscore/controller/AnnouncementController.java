package com.campuscore.controller;

import com.campuscore.entity.Announcement;
import com.campuscore.security.CustomUserDetails;
import com.campuscore.service.AnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @PostMapping
    @PreAuthorize("hasAnyRole('Admin', 'Teacher')")
    public ResponseEntity<?> create(@RequestBody Map<String, Object> request) {
        try {
            return ResponseEntity.ok(announcementService.createAnnouncement(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('Admin', 'Teacher')")
    public ResponseEntity<List<Announcement>> getAll() {
        return ResponseEntity.ok(announcementService.getAllAnnouncements());
    }

    // Feed for a logged-in user: role now comes from the authenticated
    // principal (server-trusted), not a client-supplied query parameter.
    // className is still accepted as-is (class-based scoping, not a role
    // trust issue), so the existing frontend call keeps working unchanged.
    @GetMapping("/feed")
    @PreAuthorize("hasAnyRole('Admin', 'Teacher', 'Student', 'Parent')")
    public ResponseEntity<List<Announcement>> getFeed(Authentication authentication,
            @RequestParam(required = false) String className) {
        CustomUserDetails principal = (CustomUserDetails) authentication.getPrincipal();
        String role = principal.getUser().getRole().name();
        return ResponseEntity.ok(announcementService.getAnnouncementsFor(role, className));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        announcementService.deleteAnnouncement(id);
        return ResponseEntity.ok(Map.of("message", "Announcement deleted successfully"));
    }
}
