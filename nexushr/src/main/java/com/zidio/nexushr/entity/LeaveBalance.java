package com.zidio.nexushr.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "leave_balances")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveBalance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LeaveRequest.LeaveType leaveType;

    @Column(nullable = false)
    private int year;

    @Column(nullable = false)
    private double total;

    @Column(nullable = false)
    private double used;

    public double getRemaining() { return total - used; }
}