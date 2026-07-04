package com.zidio.nexushr.dto;

import com.zidio.nexushr.entity.LeaveRequest;
import lombok.*;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveRequestDTO {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String leaveType;
    private LocalDate startDate;
    private LocalDate endDate;
    private String reason;
    private String status;
    private Long approvedById;
    private String approvedByName;

    public static LeaveRequestDTO fromEntity(LeaveRequest lr) {
        return LeaveRequestDTO.builder()
                .id(lr.getId())
                .employeeId(lr.getEmployee().getId())
                .employeeName(lr.getEmployee().getFirstName() + " " + lr.getEmployee().getLastName())
                .leaveType(lr.getLeaveType().name())
                .startDate(lr.getStartDate())
                .endDate(lr.getEndDate())
                .reason(lr.getReason())
                .status(lr.getStatus().name())
                .approvedById(lr.getApprovedBy() != null ? lr.getApprovedBy().getId() : null)
                .approvedByName(lr.getApprovedBy() != null ? lr.getApprovedBy().getFirstName() + " " + lr.getApprovedBy().getLastName() : null)
                .build();
    }
}