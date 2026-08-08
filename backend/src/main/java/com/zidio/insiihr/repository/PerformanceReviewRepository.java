package com.zidio.insiihr.repository;

import com.zidio.insiihr.entity.Employee;
import com.zidio.insiihr.entity.PerformanceReview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PerformanceReviewRepository extends JpaRepository<PerformanceReview, Long> {
    List<PerformanceReview> findByEmployee(Employee employee);
    List<PerformanceReview> findByReviewer(Employee reviewer);
}
