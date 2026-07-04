package com.zidio.nexushr.repository;

import com.zidio.nexushr.entity.Employee;
import com.zidio.nexushr.entity.FeedbackRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeedbackRequestRepository extends JpaRepository<FeedbackRequest, Long> {
    List<FeedbackRequest> findByEmployeeOrderByCreatedAtDesc(Employee employee);
    List<FeedbackRequest> findByReviewerAndStatus(Employee reviewer, FeedbackRequest.FeedbackStatus status);
    List<FeedbackRequest> findByStatus(FeedbackRequest.FeedbackStatus status);
}