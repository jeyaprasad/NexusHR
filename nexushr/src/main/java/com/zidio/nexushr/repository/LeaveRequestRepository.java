package com.zidio.nexushr.repository;

import com.zidio.nexushr.entity.Employee;
import com.zidio.nexushr.entity.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByEmployeeOrderByCreatedAtDesc(Employee employee);
    List<LeaveRequest> findByEmployeeAndStatusOrderByCreatedAtDesc(Employee employee, LeaveRequest.LeaveStatus status);
    List<LeaveRequest> findByStatusOrderByCreatedAtDesc(LeaveRequest.LeaveStatus status);
    List<LeaveRequest> findByStartDateBetween(LocalDate start, LocalDate end);
    long countByEmployeeAndLeaveTypeAndStatus(Employee employee, LeaveRequest.LeaveType type, LeaveRequest.LeaveStatus status);
}