package com.zidio.nexushr.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "attendance", indexes = {
    @Index(name = "idx_att_employee_id", columnList = "employee_id"),
    @Index(name = "idx_att_date", columnList = "date"),
    @Index(name = "idx_att_employee_date", columnList = "employee_id,date", unique = true),
    @Index(name = "idx_att_status", columnList = "status")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false)
    private LocalDate date;

    private LocalTime checkIn;

    private LocalTime checkOut;

    private Double hoursWorked;

    private Double overtimeHours;

    private Integer lateMinutes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttendanceStatus status;

    private String notes;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (date == null) date = LocalDate.now();
        calculateWorkHours();
    }

    @PreUpdate
    protected void onUpdate() {
        calculateWorkHours();
    }

    public void calculateWorkHours() {
        if (checkIn != null && checkOut != null) {
            java.time.Duration duration = java.time.Duration.between(checkIn, checkOut);
            long totalMinutes = duration.toMinutes();
            long lunchBreak = 60;
            if (totalMinutes > 300) {
                totalMinutes -= lunchBreak;
            }
            this.hoursWorked = Math.round(totalMinutes / 6.0) / 10.0;
            double standardMinutes = 480;
            this.overtimeHours = totalMinutes > standardMinutes
                    ? Math.round((totalMinutes - standardMinutes) / 6.0) / 10.0
                    : 0.0;
            LocalTime standardStart = LocalTime.of(9, 0);
            if (checkIn.isAfter(standardStart)) {
                this.lateMinutes = (int) java.time.Duration.between(standardStart, checkIn).toMinutes();
            } else {
                this.lateMinutes = 0;
            }
        }
    }

    public enum AttendanceStatus {
        PRESENT, ABSENT, LATE, HALF_DAY, ON_LEAVE
    }
}
