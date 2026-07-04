package com.zidio.nexushr.repository;

import com.zidio.nexushr.entity.Employee;
import com.zidio.nexushr.entity.LeaveBalance;
import com.zidio.nexushr.entity.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, Long> {
    Optional<LeaveBalance> findByEmployeeAndLeaveTypeAndYear(Employee employee, LeaveRequest.LeaveType type, int year);
    List<LeaveBalance> findByEmployeeAndYear(Employee employee, int year);
}