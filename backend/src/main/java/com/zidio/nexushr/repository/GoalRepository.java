package com.zidio.nexushr.repository;

import com.zidio.nexushr.entity.Employee;
import com.zidio.nexushr.entity.Goal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GoalRepository extends JpaRepository<Goal, Long> {
    List<Goal> findByEmployeeOrderByCreatedAtDesc(Employee employee);
    List<Goal> findByEmployeeAndStatus(Employee employee, Goal.GoalStatus status);
}
