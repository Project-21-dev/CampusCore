package com.schoolsync.controller;

import com.schoolsync.entity.AuditLog;
import com.schoolsync.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping("/all")
    public ResponseEntity<List<AuditLog>> getAll() {
        return ResponseEntity.ok(auditLogService.getAllLogs());
    }

    @GetMapping("/entity/{entityName}")
    public ResponseEntity<List<AuditLog>> getForEntity(@PathVariable String entityName) {
        return ResponseEntity.ok(auditLogService.getLogsForEntity(entityName));
    }
}
