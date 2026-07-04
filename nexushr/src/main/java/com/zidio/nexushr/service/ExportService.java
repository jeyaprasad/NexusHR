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
    private final LeaveRequestRepository leaveRequestRepository;

    public byte[] exportCsv(String type) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PrintWriter pw = new PrintWriter(new OutputStreamWriter(baos, StandardCharsets.UTF_8));

        switch (type) {
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
                    e.getId(), e.getEmployeeId(), e.getFirstName(), e.getLastName(),
                    e.getEmail(), e.getDepartment(), e.getPosition(),
                    e.getHireDate(), e.getSalary() != null ? e.getSalary() : 0,
                    e.getStatus());
        }
    }

    private void exportAttendance(PrintWriter pw) {
        pw.println("ID,Employee,Date,Check In,Check Out,Status");
        List<Attendance> list = attendanceRepository.findAll();
        for (Attendance a : list) {
            pw.printf("%d,%s %s,%s,%s,%s,%s%n",
                    a.getId(), a.getEmployee().getFirstName(), a.getEmployee().getLastName(),
                    a.getDate(), a.getCheckIn(), a.getCheckOut(), a.getStatus());
        }
    }

    private void exportPayroll(PrintWriter pw) {
        pw.println("ID,Employee,Period,Basic Salary,Allowances,Deductions,Net Salary,Status");
        List<Payroll> list = payrollRepository.findAll();
        for (Payroll p : list) {
            pw.printf("%d,%s %s,%s,%.2f,%.2f,%.2f,%.2f,%s%n",
                    p.getId(), p.getEmployee().getFirstName(), p.getEmployee().getLastName(),
                    p.getPayPeriod(), p.getBasicSalary(), p.getAllowances(),
                    p.getDeductions(), p.getNetSalary(), p.getStatus());
        }
    }

    private void exportPerformance(PrintWriter pw) {
        pw.println("ID,Employee,Reviewer,Date,Rating,Feedback,Goals,Status");
        List<PerformanceReview> list = performanceReviewRepository.findAll();
        for (PerformanceReview r : list) {
            pw.printf("%d,%s,%s,%s,%d,%s,%s,%s%n",
                    r.getId(), r.getEmployee().getFirstName() + " " + r.getEmployee().getLastName(),
                    r.getReviewer().getFirstName() + " " + r.getReviewer().getLastName(),
                    r.getReviewDate(), r.getRating(), r.getFeedback(), r.getGoals(), r.getStatus());
        }
    }

    private void exportLeaves(PrintWriter pw) {
        pw.println("ID,Employee,Type,Start Date,End Date,Reason,Status,Approved By");
        List<LeaveRequest> list = leaveRequestRepository.findAll();
        for (LeaveRequest l : list) {
            pw.printf("%d,%s,%s,%s,%s,%s,%s,%s%n",
                    l.getId(), l.getEmployee().getFirstName() + " " + l.getEmployee().getLastName(),
                    l.getLeaveType(), l.getStartDate(), l.getEndDate(),
                    l.getReason(), l.getStatus(),
                    l.getApprovedBy() != null ? l.getApprovedBy().getFirstName() : "");
        }
    }
}