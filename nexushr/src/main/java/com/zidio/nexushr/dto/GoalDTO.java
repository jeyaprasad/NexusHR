package com.zidio.nexushr.dto;

import com.zidio.nexushr.entity.Goal;
import lombok.*;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalDTO {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String title;
    private String description;
    private double targetValue;
    private double currentValue;
    private String category;
    private LocalDate startDate;
    private LocalDate targetDate;
    private String status;
    private double progress;

    public static GoalDTO fromEntity(Goal g) {
        double progress = g.getTargetValue() > 0 ? (g.getCurrentValue() / g.getTargetValue()) * 100 : 0;
        return GoalDTO.builder()
                .id(g.getId())
                .employeeId(g.getEmployee().getId())
                .employeeName(g.getEmployee().getFirstName() + " " + g.getEmployee().getLastName())
                .title(g.getTitle())
                .description(g.getDescription())
                .targetValue(g.getTargetValue())
                .currentValue(g.getCurrentValue())
                .category(g.getCategory().name())
                .startDate(g.getStartDate())
                .targetDate(g.getTargetDate())
                .status(g.getStatus().name())
                .progress(Math.min(progress, 100))
                .build();
    }
}