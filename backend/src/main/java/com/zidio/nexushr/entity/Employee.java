package com.zidio.nexushr.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "employees", indexes = {
    @Index(name = "idx_emp_employee_id", columnList = "employeeId", unique = true),
    @Index(name = "idx_emp_email", columnList = "email", unique = true),
    @Index(name = "idx_emp_department", columnList = "department"),
    @Index(name = "idx_emp_status", columnList = "status"),
    @Index(name = "idx_emp_user_id", columnList = "user_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String employeeId;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(unique = true, nullable = false)
    private String email;

    private String phone;

    private String department;

    private String position;

    @Column(nullable = false)
    private LocalDate hireDate;

    private BigDecimal salary;

    private Double leaveBalance;

    @Enumerated(EnumType.STRING)
    private EmploymentStatus status;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @Column(name = "experience_letter_data", columnDefinition = "BYTEA")
    private byte[] experienceLetterData;

    @Column(name = "experience_letter_name")
    private String experienceLetterName;

    @Column(name = "experience_letter_content_type")
    private String experienceLetterContentType;

    @Column(name = "graduation_certificate_data", columnDefinition = "BYTEA")
    private byte[] graduationCertificateData;

    @Column(name = "graduation_certificate_name")
    private String graduationCertificateName;

    @Column(name = "graduation_certificate_content_type")
    private String graduationCertificateContentType;


    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (leaveBalance == null) {
            leaveBalance = 30.0;
        }
        if (hireDate == null) {
            hireDate = java.time.LocalDate.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum EmploymentStatus {
        ACTIVE, ON_LEAVE, TERMINATED, SUSPENDED
    }
}
