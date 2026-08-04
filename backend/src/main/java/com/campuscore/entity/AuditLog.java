package com.campuscore.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long auditLogId;

    @Column(nullable = false)
    private String entityName; // e.g. "Admission", "Fee", "Result", "Student"

    private Long entityId;

    @Column(nullable = false)
    private String action; // CREATE, UPDATE, DELETE, PAY, APPROVE, REJECT

    @Column(nullable = false)
    private String performedBy;

    @Column(length = 1000)
    private String details;

    @Column(nullable = false)
    private LocalDateTime timestamp;
}
