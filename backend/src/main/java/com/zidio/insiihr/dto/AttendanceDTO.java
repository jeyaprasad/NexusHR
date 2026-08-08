package com.zidio.insiihr.dto;

import com.zidio.insiihr.entity.Attendance;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceDTO {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private LocalDate date;
    private LocalTime checkIn;
    private LocalTime checkOut;
    private Double hoursWorked;
    private Double overtimeHours;
    private Integer lateMinutes;
    private String status;
    private String notes;

    public static AttendanceDTO fromEntity(Attendance att) {
        return AttendanceDTO.builder()
                .id(att.getId())
                .employeeId(att.getEmployee().getId())
                .employeeName(att.getEmployee().getFirstName() + " " + att.getEmployee().getLastName())
                .date(att.getDate())
                .checkIn(att.getCheckIn())
                .checkOut(att.getCheckOut())
                .hoursWorked(att.getHoursWorked())
                .overtimeHours(att.getOvertimeHours())
                .lateMinutes(att.getLateMinutes())
                .status(att.getStatus().name())
                .notes(att.getNotes())
                .build();
    }
}
