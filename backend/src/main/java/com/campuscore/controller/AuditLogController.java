package com.campuscore.controller;

import com.campuscore.entity.AuditLog;
import com.campuscore.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
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
