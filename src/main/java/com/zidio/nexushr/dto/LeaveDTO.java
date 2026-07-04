package com.zidio.nexushr.dto;

import com.zidio.nexushr.entity.Leave;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveDTO {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private LocalDate startDate;
    private LocalDate endDate;
    private String leaveType;
    private String status;
    private String reason;
    private Double duration;
    private Boolean halfDay;

    public static LeaveDTO fromEntity(Leave leave) {
        double durationDays = leave.getHalfDay() != null && leave.getHalfDay() 
                ? 0.5 
                : (java.time.temporal.ChronoUnit.DAYS.between(leave.getStartDate(), leave.getEndDate()) + 1);
        return LeaveDTO.builder()
                .id(leave.getId())
                .employeeId(leave.getEmployee().getId())
                .employeeName(leave.getEmployee().getFirstName() + " " + leave.getEmployee().getLastName())
                .startDate(leave.getStartDate())
                .endDate(leave.getEndDate())
                .leaveType(leave.getLeaveType())
                .status(leave.getStatus().name())
                .reason(leave.getReason())
                .duration(durationDays)
                .halfDay(leave.getHalfDay() != null ? leave.getHalfDay() : false)
                .build();
    }
}
