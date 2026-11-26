package com.zidio.nexushr.repository;

import com.zidio.nexushr.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByEntityTypeOrderByTimestampDesc(String entityType);
    Page<AuditLog> findByPerformedBy(String performedBy, Pageable pageable);
    List<AuditLog> findByTimestampBetween(LocalDateTime start, LocalDateTime end);
    List<AuditLog> findTop5ByOrderByTimestampDesc();
}
