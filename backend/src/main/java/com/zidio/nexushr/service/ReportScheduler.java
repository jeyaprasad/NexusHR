package com.zidio.nexushr.service;

import com.zidio.nexushr.entity.Employee;
import com.zidio.nexushr.repository.AttendanceRepository;
import com.zidio.nexushr.repository.EmployeeRepository;
import com.zidio.nexushr.repository.LeaveRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class ReportScheduler {

    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRepository leaveRepository;
    private final EmailService emailService;

    private static final List<String> HR_EMAILS = List.of("admin@NexusHR.com");

    @Scheduled(cron = "0 0 8 * * MON")
    public void sendWeeklySummary() {
        log.info("Generating weekly HR summary report...");
        LocalDate weekStart = LocalDate.now().minusDays(7);
        LocalDate weekEnd = LocalDate.now().minusDays(1);

        long totalEmployees = employeeRepository.count();
        long activeEmployees = employeeRepository.countByStatus(Employee.EmploymentStatus.ACTIVE);
        long presentToday = attendanceRepository.countByDateAndStatus(LocalDate.now(),
                com.zidio.nexushr.entity.Attendance.AttendanceStatus.PRESENT);
        long absentToday = attendanceRepository.countByDateAndStatus(LocalDate.now(),
                com.zidio.nexushr.entity.Attendance.AttendanceStatus.ABSENT);
        long pendingLeaves = leaveRepository.countByStatus(com.zidio.nexushr.entity.Leave.LeaveStatus.PENDING);

        String htmlBody = """
            <h3>Weekly HR Summary</h3>
            <table style="width:100%%; border-collapse:collapse;">
              <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Total Employees</strong></td><td style="padding:8px;border:1px solid #ddd;">%d</td></tr>
              <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Active Employees</strong></td><td style="padding:8px;border:1px solid #ddd;">%d</td></tr>
              <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Present Today</strong></td><td style="padding:8px;border:1px solid #ddd;">%d</td></tr>
              <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Absent Today</strong></td><td style="padding:8px;border:1px solid #ddd;">%d</td></tr>
              <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Pending Leave Requests</strong></td><td style="padding:8px;border:1px solid #ddd;">%d</td></tr>
            </table>
            <p style="margin-top:16px;">Period: %s to %s</p>
            """.formatted(totalEmployees, activeEmployees, presentToday, absentToday, pendingLeaves, weekStart, weekEnd);

        for (String email : HR_EMAILS) {
            emailService.sendHtmlEmail(email, "NexusHR Weekly Summary", emailService.wrapHtmlTemplate("Weekly HR Report", htmlBody));
        }
        log.info("Weekly summary sent to {} HR recipients.", HR_EMAILS.size());
    }

    @Scheduled(cron = "0 0 9 1 * ?")
    public void sendMonthlyReport() {
        log.info("Generating monthly HR report...");
        LocalDate monthStart = LocalDate.now().minusMonths(1).withDayOfMonth(1);
        LocalDate monthEnd = monthStart.withDayOfMonth(monthStart.lengthOfMonth());

        long totalEmployees = employeeRepository.count();
        long activeEmployees = employeeRepository.countByStatus(Employee.EmploymentStatus.ACTIVE);
        long terminatedEmployees = employeeRepository.countByStatus(Employee.EmploymentStatus.TERMINATED);

        String htmlBody = """
            <h3>Monthly HR Report</h3>
            <table style="width:100%%; border-collapse:collapse;">
              <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Total Employees</strong></td><td style="padding:8px;border:1px solid #ddd;">%d</td></tr>
              <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Active Employees</strong></td><td style="padding:8px;border:1px solid #ddd;">%d</td></tr>
              <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Terminated</strong></td><td style="padding:8px;border:1px solid #ddd;">%d</td></tr>
            </table>
            <p style="margin-top:16px;">Period: %s to %s</p>
            """.formatted(totalEmployees, activeEmployees, terminatedEmployees, monthStart, monthEnd);

        for (String email : HR_EMAILS) {
            emailService.sendHtmlEmail(email, "NexusHR Monthly Report", emailService.wrapHtmlTemplate("Monthly HR Report", htmlBody));
        }
        log.info("Monthly report sent to {} HR recipients.", HR_EMAILS.size());
    }
}
