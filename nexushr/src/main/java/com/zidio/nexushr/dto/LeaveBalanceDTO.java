package com.zidio.nexushr.dto;

import com.zidio.nexushr.entity.LeaveBalance;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveBalanceDTO {
    private Long id;
    private Long employeeId;
    private String leaveType;
    private int year;
    private double total;
    private double used;
    private double remaining;

    public static LeaveBalanceDTO fromEntity(LeaveBalance lb) {
        return LeaveBalanceDTO.builder()
                .id(lb.getId())
                .employeeId(lb.getEmployee().getId())
                .leaveType(lb.getLeaveType().name())
                .year(lb.getYear())
                .total(lb.getTotal())
                .used(lb.getUsed())
                .remaining(lb.getRemaining())
                .build();
    }
}