package com.zidio.nexushr.service;

import com.zidio.nexushr.entity.*;
import com.zidio.nexushr.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AIService {

    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final PerformanceReviewRepository performanceReviewRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final GoalRepository goalRepository;

    public Map<String, Object> getEmployeeInsights(Long employeeId) {
        Employee emp = employeeRepository.findById(employeeId).orElse(null);
        if (emp == null) return Map.of("error", "Employee not found");

        double attritionRisk = calculateAttritionRisk(emp);
        double engagementScore = calculateEngagement(emp);
        List<String> skillGaps = analyzeSkillGaps(emp);

        return Map.of(
                "employeeId", employeeId,
                "employeeName", emp.getFirstName() + " " + emp.getLastName(),
                "attritionRisk", Math.round(attritionRisk * 100) / 100.0,
                "attritionLevel", riskLevel(attritionRisk),
                "engagementScore", Math.round(engagementScore * 100) / 100.0,
                "engagementLevel", engagementLevel(engagementScore),
                "skillGaps", skillGaps,
                "recommendations", generateRecommendations(attritionRisk, engagementScore, skillGaps)
        );
    }

    public Map<String, Object> getWorkforceInsights() {
        List<Employee> all = employeeRepository.findAll();
        double avgRisk = 0, avgEngagement = 0;
        int highRisk = 0;
        for (Employee e : all) {
            double risk = calculateAttritionRisk(e);
            double eng = calculateEngagement(e);
            avgRisk += risk;
            avgEngagement += eng;
            if (risk > 0.6) highRisk++;
        }
        int n = Math.max(all.size(), 1);
        return Map.of(
                "totalEmployees", all.size(),
                "avgAttritionRisk", Math.round(avgRisk / n * 100) / 100.0,
                "avgEngagement", Math.round(avgEngagement / n * 100) / 100.0,
                "highRiskCount", highRisk,
                "departmentBreakdown", getDepartmentBreakdown(all)
        );
    }

    private double calculateAttritionRisk(Employee emp) {
        double risk = 0.2;

        long daysSinceHire = ChronoUnit.DAYS.between(emp.getHireDate(), LocalDate.now());
        if (daysSinceHire < 90) risk += 0.15;
        else if (daysSinceHire < 365) risk += 0.05;

        List<LeaveRequest> leaves = leaveRequestRepository
                .findByEmployeeAndStatusOrderByCreatedAtDesc(emp, LeaveRequest.LeaveStatus.APPROVED);
        if (leaves.size() > 10) risk += 0.1;
        if (leaves.size() > 20) risk += 0.15;

        List<PerformanceReview> reviews = performanceReviewRepository
                .findByEmployee(emp);
        if (!reviews.isEmpty()) {
            double avgRating = reviews.stream().mapToInt(PerformanceReview::getRating).average().orElse(5);
            if (avgRating <= 2) risk += 0.25;
            else if (avgRating <= 3) risk += 0.1;
            else if (avgRating >= 4) risk -= 0.1;
        }

        return Math.max(0, Math.min(1, risk));
    }

    private double calculateEngagement(Employee emp) {
        double score = 0.5;

        List<PerformanceReview> reviews = performanceReviewRepository
                .findByEmployee(emp);
        if (!reviews.isEmpty()) {
            double avgRating = reviews.stream().mapToInt(PerformanceReview::getRating).average().orElse(3);
            score += (avgRating - 3) * 0.15;
        }

        long presentDays = attendanceRepository.findByEmployeeAndDateBetween(emp, LocalDate.now().minusDays(30), LocalDate.now()).size();
        if (presentDays > 20) score += 0.15;
        else if (presentDays < 10) score -= 0.15;

        return Math.max(0, Math.min(1, score));
    }

    private List<String> analyzeSkillGaps(Employee emp) {
        List<String> gaps = new ArrayList<>();
        String dept = emp.getDepartment() != null ? emp.getDepartment().toLowerCase() : "";
        if (dept.contains("engineer") || dept.contains("tech")) {
            gaps.add("Cloud Computing (AWS/Azure)");
            gaps.add("System Design");
        } else if (dept.contains("market")) {
            gaps.add("Digital Marketing Analytics");
            gaps.add("CRM Tools");
        } else if (dept.contains("fin") || dept.contains("account")) {
            gaps.add("Financial Reporting Standards");
            gaps.add("ERP Systems");
        } else if (dept.contains("hr")) {
            gaps.add("HR Analytics");
            gaps.add("Employment Law Updates");
        } else {
            gaps.add("Communication Skills");
            gaps.add("Project Management");
        }
        return gaps;
    }

    private List<String> generateRecommendations(double risk, double engagement, List<String> gaps) {
        List<String> recs = new ArrayList<>();
        if (risk > 0.6) recs.add("Schedule check-in with manager - high attrition risk");
        else if (risk > 0.3) recs.add("Consider mentorship program to improve retention");
        if (engagement < 0.4) recs.add("Assign engaging projects to boost engagement score");
        if (!gaps.isEmpty()) recs.add("Enroll in training: " + String.join(", ", gaps));
        if (recs.isEmpty()) recs.add("Employee is on track - continue current development plan");
        return recs;
    }

    private List<Map<String, Object>> getDepartmentBreakdown(List<Employee> all) {
        Map<String, Integer> deptCount = new HashMap<>();
        for (Employee e : all) {
            String d = e.getDepartment() != null ? e.getDepartment() : "Unassigned";
            deptCount.merge(d, 1, Integer::sum);
        }
        List<Map<String, Object>> result = new ArrayList<>();
        for (var entry : deptCount.entrySet()) {
            Map<String, Object> m = new HashMap<>();
            m.put("department", entry.getKey());
            m.put("count", entry.getValue());
            result.add(m);
        }
        return result;
    }

    private String riskLevel(double risk) {
        if (risk > 0.6) return "HIGH";
        if (risk > 0.3) return "MEDIUM";
        return "LOW";
    }

    private String engagementLevel(double score) {
        if (score > 0.7) return "HIGH";
        if (score > 0.4) return "MEDIUM";
        return "LOW";
    }
}