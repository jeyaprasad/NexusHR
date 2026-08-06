package com.zidio.nexushr.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiService {

    private final ChatModel chatModel;
    private final org.springframework.ai.vectorstore.VectorStore vectorStore;

    @org.springframework.beans.factory.annotation.Value("${spring.ai.openai.api-key:mock-key}")
    private String apiKey;

    // ─── F-05: Predictive Attrition ──────────────────────────────────────────
    public String predictAttrition(String employeeData) {
        String instruction = "You are an HR AI expert. Analyze the following employee metrics for attrition risk. "
                + "Respond with: 1) Risk Level: Low/Medium/High, 2) Key Risk Factors (3 bullets), "
                + "3) Recommended Retention Actions (3 bullets). "
                + "Be specific and actionable. Employee Data: " + employeeData;
        return callAi(instruction, "attrition", employeeData);
    }

    // ─── F-05: Skill Gap Analysis ─────────────────────────────────────────────
    public String analyzeSkillGap(String employeeData) {
        String instruction = "You are an HR talent development AI. Analyze the following employee profile and role requirements. "
                + "Identify: 1) Current Skills, 2) Required Skills for role advancement (3 skills), "
                + "3) Skill Gaps (missing or weak areas), 4) Recommended Learning Resources or Certifications. "
                + "Employee and Role Data: " + employeeData;
        return callAi(instruction, "skill-gap", employeeData);
    }

    // ─── F-05: Engagement Scoring ─────────────────────────────────────────────
    public String scoreEngagement(String employeeData) {
        String instruction = "You are an employee engagement specialist AI. Based on the following employee activity data "
                + "(attendance rate, performance review scores, leave usage, tenure, feedback sentiment), "
                + "provide: 1) Engagement Score (0-100), 2) Engagement Level: Disengaged/Neutral/Engaged/Highly Engaged, "
                + "3) Top 3 Engagement Drivers, 4) Top 3 Engagement Risks, 5) Recommended Actions. "
                + "Employee Data: " + employeeData;
        return callAi(instruction, "engagement", employeeData);
    }

    // ─── RAG: HR Policy Q&A ───────────────────────────────────────────────────
    public String askHrPolicy(String question) {
        try {
            java.util.List<org.springframework.ai.document.Document> topMatches = vectorStore.similaritySearch(
                    org.springframework.ai.vectorstore.SearchRequest.builder().query(question).topK(3).build());
            
            if (topMatches.isEmpty()) {
                return "I couldn't find any relevant information in the uploaded HR policies.";
            }
            
            String context = topMatches.stream()
                    .map(org.springframework.ai.document.Document::getText)
                    .collect(java.util.stream.Collectors.joining("\n\n"));
            
            if ("mock-key".equals(apiKey)) {
                log.warn("AI running in fallback mode — returning retrieved context instead of LLM inference.");
                return "[Fallback Mock Response] Based on the policy context retrieved:\n" + context;
            }

            String promptString = "You are a helpful HR assistant. Answer the employee's question based ONLY on the following policy documents.\n\n"
                    + "Policies:\n" + context + "\n\n"
                    + "Question: " + question;
            
            return chatModel.call(new Prompt(promptString)).getResult().getOutput().getText();
        } catch (Exception e) {
            log.warn("RAG query failed ({}).", e.getMessage());
            return "I couldn't find that in the policy documents, please contact HR.";
        }
    }

    private String callAi(String instruction, String type, String employeeData) {
        if ("mock-key".equals(apiKey)) {
            log.warn("AI running in fallback mode — no GROQ_API_KEY set.");
            return generateSimulatedResponse(type, employeeData);
        }
        try {
            return chatModel.call(new Prompt(instruction))
                    .getResult()
                    .getOutput()
                    .getText();
        } catch (Exception e) {
            log.warn("AI Inference call failed ({}). Using local simulated fallback.", e.getMessage());
            return generateSimulatedResponse(type, employeeData);
        }
    }

    private String generateSimulatedResponse(String type, String employeeData) {
        String data = employeeData != null ? employeeData.toLowerCase() : "";
        Map<String, String> fields = parseInputFields(employeeData);

        if ("attrition".equals(type)) {
            return generateAttritionResponse(data, fields);
        } else if ("skill-gap".equals(type)) {
            return generateSkillGapResponse(data, fields);
        } else {
            return generateEngagementResponse(data, fields);
        }
    }

    private Map<String, String> parseInputFields(String raw) {
        Map<String, String> map = new java.util.HashMap<>();
        if (raw == null) return map;
        for (String line : raw.split("\n")) {
            int colon = line.indexOf(':');
            if (colon > 0 && colon < line.length() - 1) {
                String key = line.substring(0, colon).trim().toLowerCase();
                String val = line.substring(colon + 1).trim();
                map.put(key, val);
            }
        }
        return map;
    }

    private String generateAttritionResponse(String data, Map<String, String> fields) {
        double rating = 4.0;
        try { rating = Double.parseDouble(fields.getOrDefault("last review rating", "4.0").replaceAll("/.*", "")); } catch (Exception e) {}
        double absences = 0;
        try { absences = Double.parseDouble(fields.getOrDefault("recent absences", "0").replaceAll("[^0-9.]", "")); } catch (Exception e) {}
        double leaveUsed = 0;
        try { leaveUsed = Double.parseDouble(fields.getOrDefault("leave days used", "5").replaceAll("/.*", "").trim()); } catch (Exception e) {}
        double leaveTotal = 30;
        try { leaveTotal = Double.parseDouble(fields.getOrDefault("leave days used", "5/30").replaceAll(".*/", "").trim()); } catch (Exception e) {}
        double leavePct = leaveTotal > 0 ? leaveUsed / leaveTotal : 0;
        double tenure = 3;
        try { tenure = Double.parseDouble(fields.getOrDefault("tenure", "3").replaceAll("[^0-9.]", "")); } catch (Exception e) {}
        double salaryChange = 5;
        try { salaryChange = Double.parseDouble(fields.getOrDefault("salary change last year", "5%").replaceAll("[^0-9.-]", "")); } catch (Exception e) {}

        String riskLevel;
        java.util.List<String> riskFactors = new java.util.ArrayList<>();
        java.util.List<String> actions = new java.util.ArrayList<>();

        if (rating <= 2.5 || absences >= 5 || leavePct >= 0.85 || salaryChange <= 0) {
            riskLevel = "High";
        } else if (rating <= 3.5 || absences >= 3 || leavePct >= 0.6 || salaryChange < 3) {
            riskLevel = "Medium";
        } else {
            riskLevel = "Low";
        }

        if (rating <= 2.5) riskFactors.add("Critically low performance rating (" + rating + "/5) signals disengagement or burnout risk.");
        else if (rating <= 3.5) riskFactors.add("Below-average performance rating (" + rating + "/5) warrants closer attention.");
        else riskFactors.add("Strong performance rating (" + rating + "/5) is a positive retention signal.");

        if (absences >= 5) riskFactors.add("Frequent recent absences (" + (int)absences + " in last month) indicate potential personal or health challenges.");
        else if (absences >= 3) riskFactors.add("Moderate absenteeism (" + (int)absences + " recent absences) needs monitoring.");
        else if (absences > 0) riskFactors.add("Good attendance record with only " + (int)absences + " recent absence(s).");

        if (leavePct >= 0.85) riskFactors.add("Very high leave utilisation (" + (int)leaveUsed + "/" + (int)leaveTotal + " days used) suggests burnout risk.");
        else if (leavePct >= 0.6) riskFactors.add("Moderate leave usage (" + (int)leaveUsed + "/" + (int)leaveTotal + " days used).");
        else riskFactors.add("Healthy leave balance with " + (int)(leaveTotal - leaveUsed) + " days remaining.");

        if (salaryChange <= 0) riskFactors.add("No salary adjustment in the last 12 months — a leading driver of voluntary turnover.");
        else if (salaryChange < 3) riskFactors.add("Minimal salary growth (" + (int)salaryChange + "%) may not keep pace with market rates.");
        else riskFactors.add("Salary increased by " + (int)salaryChange + "% in the last year, which is competitive.");

        if (tenure < 1) riskFactors.add("Tenure under 1 year (" + tenure + " yrs) — early-stage employees have higher attrition risk.");
        else if (tenure < 2) riskFactors.add("Tenure of " + tenure + " years is in a moderate risk window.");
        else riskFactors.add("Tenure of " + tenure + " years provides stability.");

        if (riskLevel.equals("High")) {
            actions.add("Schedule an immediate 1-on-1 career intervention meeting within 48 hours.");
            actions.add("Review total compensation package and benchmark against market — prepare a retention offer if needed.");
            actions.add("Assign a mentor or wellness resource to address burnout signals.");
            actions.add("Consider a role rotation or adjusted responsibilities to re-engage the employee.");
        } else if (riskLevel.equals("Medium")) {
            actions.add("Conduct a skip-level check-in within the next 2 weeks to surface any concerns.");
            actions.add("Develop a personalised growth plan with clear milestones and timeline.");
            actions.add("Monitor attendance and leave patterns over the next 30 days.");
        } else {
            actions.add("Continue regular check-ins to maintain engagement.");
            actions.add("Recognise contributions publicly to reinforce positive sentiment.");
            actions.add("Explore stretch assignments or leadership opportunities to aid retention.");
        }

        return "1) Risk Level: " + riskLevel + "\n\n"
                + "2) Key Risk Factors:\n"
                + riskFactors.stream().map(f -> "- " + f).collect(java.util.stream.Collectors.joining("\n")) + "\n\n"
                + "3) Recommended Retention Actions:\n"
                + actions.stream().map(a -> "- " + a).collect(java.util.stream.Collectors.joining("\n"));
    }

    private String generateSkillGapResponse(String data, Map<String, String> fields) {
        String currentRole = fields.getOrDefault("current role", fields.getOrDefault("current skills", "Unknown"));
        String targetRole = fields.getOrDefault("target role", "Senior " + currentRole);
        String yearsExp = fields.getOrDefault("years experience", fields.getOrDefault("years experience", "3"));
        double yrs = 3;
        try { yrs = Double.parseDouble(yearsExp.replaceAll("[^0-9.]", "")); } catch (Exception e) {}
        String lastTraining = fields.getOrDefault("last training", "Unknown");

        java.util.List<String> currentSkills = new java.util.ArrayList<>();
        String skillsRaw = fields.getOrDefault("current skills", "");
        if (!skillsRaw.isEmpty()) {
            for (String s : skillsRaw.split(",")) {
                currentSkills.add(s.trim());
            }
        }
        if (currentSkills.isEmpty()) {
            currentSkills.add("Core development skills");
            currentSkills.add("Team collaboration");
        }

        java.util.List<String> requiredSkills;
        java.util.List<String> gaps;
        java.util.List<String> resources;

        if (yrs < 2) {
            requiredSkills = java.util.List.of("Deep proficiency in current tech stack", "Software design patterns & architecture", "Code review & quality processes");
            gaps = java.util.List.of("Limited depth in current technologies", "Minimal exposure to system design", "Needs mentorship experience");
            resources = java.util.List.of("Course: 'Clean Code' by Robert C. Martin", "Pair programming with senior team members", "Internal knowledge-sharing sessions");
        } else if (yrs < 5) {
            requiredSkills = java.util.List.of("System Design & Cloud Architecture (AWS/GCP)", "Cross-team collaboration & stakeholder management", "CI/CD Pipeline & DevOps Automation");
            gaps = java.util.List.of("Limited experience in large-scale system design", "Needs exposure to cloud-native deployments and Kubernetes", "Opportunity to lead technical initiatives");
            resources = java.util.List.of("Course: 'Designing Data-Intensive Applications' by Martin Kleppmann", "Certification: AWS Certified Solutions Architect - Associate", "Action: Lead a medium-sized cross-team project");
        } else {
            requiredSkills = java.util.List.of("Enterprise architecture & technology strategy", "Executive communication & influence", "Organisational design & team building");
            gaps = java.util.List.of("Strategic thinking at org level needs development", "Executive presence and stakeholder management", "Mentoring and growing other senior engineers");
            resources = java.util.List.of("Executive leadership program (e.g., Stanford LEAD)", "Book: 'The Manager's Path' by Camille Fournier", "Action: Shadow VP/Director in strategic planning");
        }

        return "1) Current Skills:\n"
                + currentSkills.stream().map(s -> "- " + s).collect(java.util.stream.Collectors.joining("\n")) + "\n\n"
                + "2) Target Role: " + targetRole + "\n\n"
                + "3) Required Skills for Advancement:\n"
                + requiredSkills.stream().map(s -> "- " + s).collect(java.util.stream.Collectors.joining("\n")) + "\n\n"
                + "4) Skill Gaps:\n"
                + gaps.stream().map(g -> "- " + g).collect(java.util.stream.Collectors.joining("\n")) + "\n\n"
                + "5) Recommended Learning Resources:\n"
                + resources.stream().map(r -> "- " + r).collect(java.util.stream.Collectors.joining("\n"));
    }

    private String generateEngagementResponse(String data, Map<String, String> fields) {
        double attendanceRate = 90;
        try { attendanceRate = Double.parseDouble(fields.getOrDefault("attendance rate", "90%").replaceAll("[^0-9.]", "")); } catch (Exception e) {}
        double avgRating = 3.5;
        try { avgRating = Double.parseDouble(fields.getOrDefault("avg performance rating", fields.getOrDefault("tenure", "3.5")).replaceAll("/.*", "")); } catch (Exception e) {}
        String sentiment = fields.getOrDefault("feedback sentiment", "neutral").toLowerCase();
        double tenure = 2.5;
        try { tenure = Double.parseDouble(fields.getOrDefault("tenure", "2.5").replaceAll("[^0-9.]", "")); } catch (Exception e) {}
        double leaveUsed = 12;
        try { leaveUsed = Double.parseDouble(fields.getOrDefault("leave utilisation", fields.getOrDefault("leave days used", "12").replaceAll("/.*", "").trim())); } catch (Exception e) {}
        double leaveTotal = 30;
        try { leaveTotal = Double.parseDouble(fields.getOrDefault("leave utilisation", fields.getOrDefault("leave days used", "12/30")).replaceAll(".*/", "").trim()); } catch (Exception e) {}
        double leavePct = leaveTotal > 0 ? leaveUsed / leaveTotal : 0;

        int score;
        String level;
        java.util.List<String> drivers = new java.util.ArrayList<>();
        java.util.List<String> risks = new java.util.ArrayList<>();
        java.util.List<String> actions = new java.util.ArrayList<>();

        if (attendanceRate < 80 || avgRating <= 2.5 || sentiment.contains("neg") || leavePct > 0.85) {
            score = 42;
            level = "Disengaged";
        } else if (attendanceRate < 90 || avgRating <= 3.5 || sentiment.contains("neutral") || leavePct > 0.6) {
            score = 61;
            level = "Neutral";
        } else if (avgRating >= 4.5 && attendanceRate >= 95 && sentiment.contains("pos")) {
            score = 92;
            level = "Highly Engaged";
        } else {
            score = 78;
            level = "Engaged";
        }

        if (attendanceRate >= 95) drivers.add("Excellent attendance rate (" + (int)attendanceRate + "%) reflects strong commitment.");
        else if (attendanceRate >= 85) drivers.add("Good attendance rate (" + (int)attendanceRate + "%).");
        else risks.add("Low attendance rate (" + (int)attendanceRate + "%) is a concern.");

        if (avgRating >= 4.0) drivers.add("Consistently high performance rating (" + avgRating + "/5).");
        else if (avgRating >= 3.0) drivers.add("Satisfactory performance rating (" + avgRating + "/5).");
        else risks.add("Low performance rating (" + avgRating + "/5) signals potential disengagement.");

        if (sentiment.contains("pos")) drivers.add("Positive feedback sentiment indicates healthy workplace relationships.");
        else if (sentiment.contains("neg")) risks.add("Negative feedback sentiment needs immediate investigation.");

        if (leavePct <= 0.4) drivers.add("Low leave utilisation (" + (int)leaveUsed + "/" + (int)leaveTotal + ") suggests high commitment.");
        else if (leavePct > 0.85) risks.add("High leave utilisation (" + (int)leaveUsed + "/" + (int)leaveTotal + ") may indicate burnout.");

        if (tenure < 1) risks.add("Short tenure (" + tenure + " yrs) — early employee experience needs nurturing.");
        else if (tenure > 3) drivers.add("Long tenure (" + tenure + " yrs) indicates organisational loyalty.");

        if (drivers.size() < 2) {
            drivers.add("Good technical autonomy in daily tasks.");
            drivers.add("Strong alignment with team objectives.");
        }
        if (risks.size() < 2) {
            risks.add("Lack of clear visibility into promotion criteria.");
            risks.add("Potential fatigue — monitor workload distribution.");
        }
        if (actions.isEmpty()) {
            if (level.equals("Disengaged")) {
                actions.add("Schedule urgent wellness and career check-in within 3 days.");
                actions.add("Consider adjusted responsibilities or temporary workload reduction.");
                actions.add("Engage HR business partner for personalised support plan.");
            } else if (level.equals("Neutral")) {
                actions.add("Schedule a skip-level meeting to uncover hidden concerns.");
                actions.add("Set up a 30-day engagement improvement plan with clear milestones.");
                actions.add("Recognise recent contributions to boost morale.");
            } else {
                actions.add("Continue regular feedback loops to sustain engagement.");
                actions.add("Assign stretch assignments or leadership opportunities.");
                actions.add("Recognise recent milestones publicly in team syncs.");
            }
        }

        return "1) Engagement Score: " + score + "/100\n\n"
                + "2) Engagement Level: " + level + "\n\n"
                + "3) Top Engagement Drivers:\n"
                + drivers.stream().map(d -> "- " + d).collect(java.util.stream.Collectors.joining("\n")) + "\n\n"
                + "4) Top Engagement Risks:\n"
                + risks.stream().map(r -> "- " + r).collect(java.util.stream.Collectors.joining("\n")) + "\n\n"
                + "5) Recommended Actions:\n"
                + actions.stream().map(a -> "- " + a).collect(java.util.stream.Collectors.joining("\n"));
    }
}
