package com.zidio.insiihr.repository;

import com.zidio.insiihr.entity.Employee;
import com.zidio.insiihr.entity.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PayrollRepository extends JpaRepository<Payroll, Long> {
    List<Payroll> findByEmployee(Employee employee);
    List<Payroll> findByEmployeeAndPayPeriod(Employee employee, String payPeriod);
    List<Payroll> findByPayPeriod(String payPeriod);
}
