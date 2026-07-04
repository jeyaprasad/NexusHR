package com.zidio.nexushr.service;

import com.zidio.nexushr.dto.FeedbackRequestDTO;
import com.zidio.nexushr.entity.Employee;
import com.zidio.nexushr.entity.FeedbackRequest;
import com.zidio.nexushr.exception.ResourceNotFoundException;
import com.zidio.nexushr.repository.EmployeeRepository;
import com.zidio.nexushr.repository.FeedbackRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRequestRepository feedbackRequestRepository;
    private final EmployeeRepository employeeRepository;

    public List<FeedbackRequestDTO> getAllRequests() {
        return feedbackRequestRepository.findAll().stream()
                .map(FeedbackRequestDTO::fromEntity).toList();
    }

    public List<FeedbackRequestDTO> getRequestsForEmployee(Long employeeId) {
        Employee emp = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));
        return feedbackRequestRepository.findByEmployeeOrderByCreatedAtDesc(emp).stream()
                .map(FeedbackRequestDTO::fromEntity).toList();
    }

    public FeedbackRequestDTO createRequest(FeedbackRequestDTO dto) {
        Employee emp = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", dto.getEmployeeId()));
        Employee reviewer = employeeRepository.findById(dto.getReviewerId())
                .orElseThrow(() -> new ResourceNotFoundException("Reviewer", "id", dto.getReviewerId()));

        FeedbackRequest fr = FeedbackRequest.builder()
                .employee(emp).reviewer(reviewer).period(dto.getPeriod())
                .dueDate(dto.getDueDate()).status(FeedbackRequest.FeedbackStatus.PENDING)
                .relationship(FeedbackRequest.ReviewRelationship.valueOf(dto.getRelationship()))
                .build();
        return FeedbackRequestDTO.fromEntity(feedbackRequestRepository.save(fr));
    }

    public void completeRequest(Long id) {
        FeedbackRequest fr = feedbackRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FeedbackRequest", "id", id));
        fr.setStatus(FeedbackRequest.FeedbackStatus.COMPLETED);
        feedbackRequestRepository.save(fr);
    }
}