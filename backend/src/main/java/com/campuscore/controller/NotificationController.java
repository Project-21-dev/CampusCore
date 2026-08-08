package com.campuscore.controller;

import org.springframework.security.access.prepost.PreAuthorize;

import com.campuscore.dto.NotificationDTO;
import com.campuscore.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/user/{userId}")
    @PreAuthorize("@securityAccess.canAccessUser(authentication, #userId)")
    public ResponseEntity<List<NotificationDTO>> getNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getNotifications(userId));
    }

    @GetMapping("/unread/{userId}")
    @PreAuthorize("@securityAccess.canAccessUser(authentication, #userId)")
    public ResponseEntity<List<NotificationDTO>> getUnreadNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getUnreadNotifications(userId));
    }

    @PutMapping("/read/{notificationId}")
    @PreAuthorize("@securityAccess.canAccessNotification(authentication, #notificationId)")
    public ResponseEntity<?> markAsRead(@PathVariable Long notificationId) {
        try {
            notificationService.markAsRead(notificationId);
            return ResponseEntity.ok(Map.of("message", "Notification marked as read"));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
