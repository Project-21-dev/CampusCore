package com.campuscore.repository;

import com.campuscore.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findAllByOrderByTimestampDesc();

    List<AuditLog> findByEntityNameOrderByTimestampDesc(String entityName);
}
