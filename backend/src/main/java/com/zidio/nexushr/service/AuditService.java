package com.zidio.nexushr.service;

import com.zidio.nexushr.entity.AuditLog;
import com.zidio.nexushr.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public void log(String action, String entityType, Long entityId,
                    String oldValue, String newValue,
                    String performedBy, String userEmail, String ipAddress) {
        try {
            AuditLog audit = AuditLog.builder()
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .oldValue(oldValue)
                    .newValue(newValue)
                    .performedBy(performedBy)
                    .userEmail(userEmail)
                    .ipAddress(ipAddress)
                    .timestamp(LocalDateTime.now())
                    .build();
            auditLogRepository.save(audit);
        } catch (Exception e) {
            log.error("Failed to persist audit log: {}", e.getMessage());
        }
    }

    public void logSimple(String action, String entityType, Long entityId, String performedBy) {
        log(action, entityType, entityId, null, null, performedBy, null, null);
    }
}
