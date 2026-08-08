package com.campuscore.controller;

import org.springframework.security.access.prepost.PreAuthorize;

import com.campuscore.dto.ChildSummaryDTO;
import com.campuscore.service.ParentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/parent")
@RequiredArgsConstructor
public class ParentController {

    private final ParentService parentService;

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<?> getAllParentsForAdmin() {
        return ResponseEntity.ok(parentService.getAllParentsForAdmin());
    }

    @DeleteMapping("/admin/{parentUserId}/links/{linkId}")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<?> unlinkChildByAdmin(
            @PathVariable Long parentUserId,
            @PathVariable Long linkId) {
        try {
            parentService.unlinkChildByAdmin(parentUserId, linkId);
            return ResponseEntity.ok(Map.of("message", "Parent-child link removed successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/admin/{parentUserId}")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<?> deleteParentByAdmin(@PathVariable Long parentUserId) {
        try {
            parentService.deleteParentByAdmin(parentUserId);
            return ResponseEntity.ok(Map.of(
                    "message",
                    "Parent account deleted successfully. Linked students were not deleted."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{parentUserId}/children")
    @PreAuthorize("@securityAccess.canAccessParent(authentication, #parentUserId)")
    public ResponseEntity<List<ChildSummaryDTO>> getChildren(@PathVariable Long parentUserId) {
        return ResponseEntity.ok(parentService.getChildrenForParent(parentUserId));
    }

    @GetMapping("/{parentUserId}/children/{studentId}")
    @PreAuthorize("@securityAccess.canAccessParent(authentication, #parentUserId)")
    public ResponseEntity<?> getChildDetail(@PathVariable Long parentUserId, @PathVariable Long studentId) {
        try {
            return ResponseEntity.ok(parentService.getChildDetail(parentUserId, studentId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{parentUserId}/link")
    @PreAuthorize("@securityAccess.canAccessParent(authentication, #parentUserId)")
    public ResponseEntity<?> linkChild(@PathVariable Long parentUserId, @RequestBody Map<String, String> request) {
        try {
            parentService.linkChild(parentUserId, request.get("childRollNo"), request.get("relation"));
            return ResponseEntity.ok(Map.of("message", "Child linked successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{parentUserId}/link/{linkId}")
    @PreAuthorize("@securityAccess.canAccessParent(authentication, #parentUserId)")
    public ResponseEntity<?> unlinkChild(@PathVariable Long parentUserId, @PathVariable Long linkId) {
        try {
            parentService.unlinkChild(parentUserId, linkId);
            return ResponseEntity.ok(Map.of("message", "Child unlinked successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
