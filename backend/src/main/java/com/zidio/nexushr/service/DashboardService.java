package com.zidio.nexushr.service;

import com.zidio.nexushr.entity.Attendance;
import com.zidio.nexushr.entity.Employee;
import com.zidio.nexushr.entity.Leave;
import com.zidio.nexushr.entity.AuditLog;
import com.zidio.nexushr.repository.AttendanceRepository;
import com.zidio.nexushr.repository.EmployeeRepository;
import com.zidio.nexushr.repository.LeaveRepository;
import com.zidio.nexushr.repository.PerformanceReviewRepository;
import com.zidio.nexushr.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRepository leaveRepository;
    private final PerformanceReviewRepository performanceReviewRepository;
    private final AuditLogRepository auditLogRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardStats() {
        long totalEmployees = employeeRepository.count();
        long activeEmployees = employeeRepository.countByStatus(Employee.EmploymentStatus.ACTIVE);
        
        long pendingLeaveRequests = leaveRepository.countByStatus(Leave.LeaveStatus.PENDING);
        long onLeaveToday = attendanceRepository.countByDateAndStatus(LocalDate.now(), Attendance.AttendanceStatus.ON_LEAVE);

        double averageSalary = employeeRepository.findAll().stream()
                .mapToDouble(e -> e.getSalary() == null ? 0 : e.getSalary().doubleValue())
                .average().orElse(0.0);

        double averagePerformanceRating = performanceReviewRepository.findAll().stream()
                .mapToDouble(r -> r.getRating() == null ? 0 : r.getRating())
                .average().orElse(0.0);

        List<Map<String, Object>> headcountHistory = new ArrayList<>();
        for (int i = 13; i >= 0; i--) {
            LocalDate d = LocalDate.now().minusDays(i);
            long active = attendanceRepository.countByDateAndStatus(d, Attendance.AttendanceStatus.PRESENT) +
                          attendanceRepository.countByDateAndStatus(d, Attendance.AttendanceStatus.LATE);
            long onLeave = attendanceRepository.countByDateAndStatus(d, Attendance.AttendanceStatus.ON_LEAVE);
            Map<String, Object> hMap = new HashMap<>();
            hMap.put("date", d.toString());
            hMap.put("active", active);
            hMap.put("onLeave", onLeave);
            headcountHistory.add(hMap);
        }

        List<Map<String, Object>> departmentDistribution = employeeRepository.findAll().stream()
                .collect(Collectors.groupingBy(e -> e.getDepartment() != null ? e.getDepartment() : "Unassigned", Collectors.counting()))
                .entrySet().stream()
                .map(e -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("department", e.getKey());
                    m.put("count", e.getValue());
                    return m;
                })
                .collect(Collectors.toList());

        List<Map<String, Object>> leaveTypeBreakdown = leaveRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                        l -> YearMonth.from(l.getStartDate()).toString() + "|" + l.getLeaveType(),
                        Collectors.counting()
                ))
                .entrySet().stream()
                .map(e -> {
                    String[] parts = e.getKey().split("\\|");
                    Map<String, Object> m = new HashMap<>();
                    m.put("month", parts[0]);
                    m.put("type", parts[1]);
                    m.put("count", e.getValue());
                    return m;
                })
                .collect(Collectors.toList());

        List<AuditLog> recentActivity = auditLogRepository.findTop5ByOrderByTimestampDesc();

        Map<String, Object> result = new HashMap<>();
        result.put("totalEmployees", totalEmployees);
        result.put("activeEmployees", activeEmployees);
        result.put("pendingLeaveRequests", pendingLeaveRequests);
        result.put("onLeaveToday", onLeaveToday);
        result.put("averageSalary", averageSalary);
        result.put("averagePerformanceRating", averagePerformanceRating);
        result.put("headcountHistory", headcountHistory);
        result.put("departmentDistribution", departmentDistribution);
        result.put("leaveTypeBreakdown", leaveTypeBreakdown);
        result.put("recentActivity", recentActivity);

        return result;
    }
}
