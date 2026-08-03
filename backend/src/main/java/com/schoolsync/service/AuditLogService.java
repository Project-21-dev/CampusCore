package com.schoolsync.service;

import com.schoolsync.entity.AuditLog;
import com.schoolsync.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public void log(String entityName, Long entityId, String action, String performedBy, String details) {
        try {
            AuditLog log = new AuditLog();
            log.setEntityName(entityName);
            log.setEntityId(entityId);
            log.setAction(action);
            log.setPerformedBy(performedBy != null && !performedBy.isBlank() ? performedBy : "System");
            log.setDetails(details);
            log.setTimestamp(LocalDateTime.now());
            auditLogRepository.save(log);
        } catch (Exception e) {
            // Audit logging must never break the primary operation
            System.err.println("Failed to write audit log: " + e.getMessage());
        }
    }

    public List<AuditLog> getAllLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }

    public List<AuditLog> getLogsForEntity(String entityName) {
        return auditLogRepository.findByEntityNameOrderByTimestampDesc(entityName);
    }
}
