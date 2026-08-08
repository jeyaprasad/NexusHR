package com.zidio.insiihr.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "payrolls", indexes = {
    @Index(name = "idx_payroll_employee_id", columnList = "employee_id"),
    @Index(name = "idx_payroll_period", columnList = "pay_period"),
    @Index(name = "idx_payroll_status", columnList = "status"),
    @Index(name = "idx_payroll_employee_period", columnList = "employee_id,pay_period")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payroll {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false)
    private String payPeriod;

    private BigDecimal basicSalary;

    private BigDecimal allowances;

    private BigDecimal deductions;

    @Column(precision = 15, scale = 2)
    private BigDecimal taxAmount;

    @Column(nullable = false)
    private BigDecimal netSalary;

    private LocalDate payDate;

    @Enumerated(EnumType.STRING)
    private PayrollStatus status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = PayrollStatus.PENDING;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum PayrollStatus {
        PENDING, PROCESSED, PAID, CANCELLED
    }
}
