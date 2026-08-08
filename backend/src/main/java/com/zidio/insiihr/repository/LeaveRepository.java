package com.zidio.insiihr.repository;

import com.zidio.insiihr.entity.Employee;
import com.zidio.insiihr.entity.Leave;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LeaveRepository extends JpaRepository<Leave, Long> {
    List<Leave> findByEmployee(Employee employee);
    long countByStatus(Leave.LeaveStatus status);
}
