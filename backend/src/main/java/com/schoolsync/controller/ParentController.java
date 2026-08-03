package com.schoolsync.controller;

import com.schoolsync.dto.ChildSummaryDTO;
import com.schoolsync.service.ParentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/parent")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ParentController {

    private final ParentService parentService;

    @GetMapping("/{parentUserId}/children")
    public ResponseEntity<List<ChildSummaryDTO>> getChildren(@PathVariable Long parentUserId) {
        return ResponseEntity.ok(parentService.getChildrenForParent(parentUserId));
    }

    @GetMapping("/{parentUserId}/children/{studentId}")
    public ResponseEntity<?> getChildDetail(@PathVariable Long parentUserId, @PathVariable Long studentId) {
        try {
            return ResponseEntity.ok(parentService.getChildDetail(parentUserId, studentId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{parentUserId}/link")
    public ResponseEntity<?> linkChild(@PathVariable Long parentUserId, @RequestBody Map<String, String> request) {
        try {
            parentService.linkChild(parentUserId, request.get("childRollNo"), request.get("relation"));
            return ResponseEntity.ok(Map.of("message", "Child linked successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{parentUserId}/link/{linkId}")
    public ResponseEntity<?> unlinkChild(@PathVariable Long parentUserId, @PathVariable Long linkId) {
        try {
            parentService.unlinkChild(parentUserId, linkId);
            return ResponseEntity.ok(Map.of("message", "Child unlinked successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
