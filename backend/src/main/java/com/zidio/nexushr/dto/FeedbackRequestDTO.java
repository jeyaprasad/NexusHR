package com.zidio.nexushr.dto;

import com.zidio.nexushr.entity.FeedbackRequest;
import lombok.*;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackRequestDTO {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private Long reviewerId;
    private String reviewerName;
    private String period;
    private LocalDate dueDate;
    private String status;
    private String relationship;

    public static FeedbackRequestDTO fromEntity(FeedbackRequest fr) {
        return FeedbackRequestDTO.builder()
                .id(fr.getId())
                .employeeId(fr.getEmployee() != null ? fr.getEmployee().getId() : null)
                .employeeName(fr.getEmployee() != null ? fr.getEmployee().getFirstName() + " " + fr.getEmployee().getLastName() : "")
                .reviewerId(fr.getReviewer() != null ? fr.getReviewer().getId() : null)
                .reviewerName(fr.getReviewer() != null ? fr.getReviewer().getFirstName() + " " + fr.getReviewer().getLastName() : "")
                .period(fr.getPeriod())
                .dueDate(fr.getDueDate())
                .status(fr.getStatus() != null ? fr.getStatus().name() : "PENDING")
                .relationship(fr.getRelationship() != null ? fr.getRelationship().name() : "PEER")
                .build();
    }
}
