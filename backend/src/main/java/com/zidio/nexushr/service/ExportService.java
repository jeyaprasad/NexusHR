package com.zidio.nexushr.service;

import com.zidio.nexushr.entity.*;
import com.zidio.nexushr.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExportService {

    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final PayrollRepository payrollRepository;
    private final PerformanceReviewRepository performanceReviewRepository;
    private final LeaveRepository leaveRepository;

    public byte[] exportCsv(String type) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PrintWriter pw = new PrintWriter(new OutputStreamWriter(baos, StandardCharsets.UTF_8));

        switch (type.toLowerCase()) {
            case "employees" -> exportEmployees(pw);
            case "attendance" -> exportAttendance(pw);
            case "payroll" -> exportPayroll(pw);
            case "performance" -> exportPerformance(pw);
            case "leaves" -> exportLeaves(pw);
            default -> pw.println("Unknown type: " + type);
        }

        pw.flush();
        return baos.toByteArray();
    }

    private void exportEmployees(PrintWriter pw) {
        pw.println("ID,Employee ID,First Name,Last Name,Email,Department,Position,Hire Date,Salary,Status");
        List<Employee> employees = employeeRepository.findAll();
        for (Employee e : employees) {
            pw.printf("%d,%s,%s,%s,%s,%s,%s,%s,%.2f,%s%n",
                    e.getId(),
                    e.getEmployeeId(),
                    escapeCsv(e.getFirstName()),
                    escapeCsv(e.getLastName()),
                    escapeCsv(e.getEmail()),
                    escapeCsv(e.getDepartment()),
                    escapeCsv(e.getPosition()),
                    e.getHireDate(),
                    e.getSalary() != null ? e.getSalary().doubleValue() : 0.0,
                    e.getStatus());
        }
    }

    private void exportAttendance(PrintWriter pw) {
        pw.println("ID,Employee,Date,Check In,Check Out,Status,Notes");
        List<Attendance> list = attendanceRepository.findAll();
        for (Attendance a : list) {
            String empName = a.getEmployee() != null ? a.getEmployee().getFirstName() + " " + a.getEmployee().getLastName() : "Unknown";
            pw.printf("%d,%s,%s,%s,%s,%s,%s%n",
                    a.getId(),
                    escapeCsv(empName),
                    a.getDate(),
                    a.getCheckIn() != null ? a.getCheckIn().toString() : "",
                    a.getCheckOut() != null ? a.getCheckOut().toString() : "",
                    a.getStatus(),
                    escapeCsv(a.getNotes() != null ? a.getNotes() : ""));
        }
    }

    private void exportPayroll(PrintWriter pw) {
        pw.println("ID,Employee,Period,Basic Salary,Allowances,Deductions,Net Salary,Status");
        List<Payroll> list = payrollRepository.findAll();
        for (Payroll p : list) {
            String empName = p.getEmployee() != null ? p.getEmployee().getFirstName() + " " + p.getEmployee().getLastName() : "Unknown";
            pw.printf("%d,%s,%s,%.2f,%.2f,%.2f,%.2f,%s%n",
                    p.getId(),
                    escapeCsv(empName),
                    p.getPayPeriod(),
                    p.getBasicSalary() != null ? p.getBasicSalary().doubleValue() : 0.0,
                    p.getAllowances() != null ? p.getAllowances().doubleValue() : 0.0,
                    p.getDeductions() != null ? p.getDeductions().doubleValue() : 0.0,
                    p.getNetSalary() != null ? p.getNetSalary().doubleValue() : 0.0,
                    p.getStatus());
        }
    }

    private void exportPerformance(PrintWriter pw) {
        pw.println("ID,Employee,Reviewer,Date,Rating,Feedback,Goals,Status,Sentiment");
        List<PerformanceReview> list = performanceReviewRepository.findAll();
        for (PerformanceReview r : list) {
            String empName = r.getEmployee() != null ? r.getEmployee().getFirstName() + " " + r.getEmployee().getLastName() : "Unknown";
            String revName = r.getReviewer() != null ? r.getReviewer().getFirstName() + " " + r.getReviewer().getLastName() : "Unknown";
            pw.printf("%d,%s,%s,%s,%d,%s,%s,%s,%s%n",
                    r.getId(),
                    escapeCsv(empName),
                    escapeCsv(revName),
                    r.getReviewDate(),
                    r.getRating(),
                    escapeCsv(r.getFeedback() != null ? r.getFeedback() : ""),
                    escapeCsv(r.getGoals() != null ? r.getGoals() : ""),
                    r.getStatus(),
                    r.getSentiment() != null ? r.getSentiment() : "");
        }
    }

    private void exportLeaves(PrintWriter pw) {
        pw.println("ID,Employee,Type,Start Date,End Date,Half Day,Reason,Status");
        List<Leave> list = leaveRepository.findAll();
        for (Leave l : list) {
            String empName = l.getEmployee() != null ? l.getEmployee().getFirstName() + " " + l.getEmployee().getLastName() : "Unknown";
            pw.printf("%d,%s,%s,%s,%s,%s,%s,%s%n",
                    l.getId(),
                    escapeCsv(empName),
                    l.getLeaveType(),
                    l.getStartDate(),
                    l.getEndDate(),
                    Boolean.TRUE.equals(l.getHalfDay()) ? "Yes" : "No",
                    escapeCsv(l.getReason() != null ? l.getReason() : ""),
                    l.getStatus());
        }
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
