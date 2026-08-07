package com.zidio.insiihr.service;

import com.zidio.insiihr.entity.Attendance;
import com.zidio.insiihr.entity.Employee;
import com.zidio.insiihr.repository.AttendanceRepository;
import com.zidio.insiihr.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardStats() {
        return Map.of(
                "totalEmployees", employeeRepository.count(),
                "activeEmployees", employeeRepository.countByStatus(Employee.EmploymentStatus.ACTIVE),
                "presentToday", attendanceRepository.countByDateAndStatus(LocalDate.now(), Attendance.AttendanceStatus.PRESENT),
                "absentToday", attendanceRepository.countByDateAndStatus(LocalDate.now(), Attendance.AttendanceStatus.ABSENT)
        );
    }
}
