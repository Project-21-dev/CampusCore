package com.campuscore.controller;

import com.campuscore.entity.Announcement;
import com.campuscore.service.AnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> request) {
        try {
            return ResponseEntity.ok(announcementService.createAnnouncement(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<Announcement>> getAll() {
        return ResponseEntity.ok(announcementService.getAllAnnouncements());
    }

    // Feed for a logged-in user: pass their role and (for students) their class
    @GetMapping("/feed")
    public ResponseEntity<List<Announcement>> getFeed(@RequestParam String role,
            @RequestParam(required = false) String className) {
        return ResponseEntity.ok(announcementService.getAnnouncementsFor(role, className));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        announcementService.deleteAnnouncement(id);
        return ResponseEntity.ok(Map.of("message", "Announcement deleted successfully"));
    }
}
