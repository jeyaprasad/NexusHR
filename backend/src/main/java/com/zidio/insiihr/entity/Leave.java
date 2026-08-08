package com.zidio.insiihr.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "leaves", indexes = {
    @Index(name = "idx_leave_employee_id", columnList = "employee_id"),
    @Index(name = "idx_leave_status", columnList = "status"),
    @Index(name = "idx_leave_type", columnList = "leave_type"),
    @Index(name = "idx_leave_dates", columnList = "start_date,end_date")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Leave {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private String leaveType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LeaveStatus status;

    private String reason;

    @Builder.Default
    @Column(name = "half_day", nullable = false)
    private Boolean halfDay = false;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = LeaveStatus.PENDING;
        if (halfDay == null) halfDay = false;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum LeaveStatus {
        PENDING, APPROVED, REJECTED, CANCELLED
    }
}
