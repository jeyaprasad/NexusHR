package com.zidio.nexushr.controller;

import com.zidio.nexushr.service.AiService;
import com.zidio.nexushr.service.HuggingFaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;
    private final HuggingFaceService huggingFaceService;
    private final com.zidio.nexushr.service.HrPolicyDocumentService hrPolicyDocumentService;

    @PostMapping("/ask-hr")
    public ResponseEntity<?> askHrPolicy(@RequestBody Map<String, String> request) {
        String question = request.getOrDefault("question", "");
        String answer = aiService.askHrPolicy(question);
        return ResponseEntity.ok(Map.of("answer", answer));
    }

    @PostMapping("/policy-upload")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> uploadHrPolicy(@RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            hrPolicyDocumentService.ingestDocument(file);
            return ResponseEntity.ok(Map.of("message", "Policy document ingested successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/attrition")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAttritionPrediction(@RequestBody Map<String, String> request) {
        String employeeData = request.getOrDefault("data", "");
        String prediction = aiService.predictAttrition(employeeData);
        return ResponseEntity.ok(Map.of("prediction", prediction));
    }

    @PostMapping("/skill-gap")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getSkillGapAnalysis(@RequestBody Map<String, String> request) {
        String employeeData = request.getOrDefault("data", "");
        String analysis = aiService.analyzeSkillGap(employeeData);
        return ResponseEntity.ok(Map.of("analysis", analysis));
    }

    @PostMapping("/engagement")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getEngagementScore(@RequestBody Map<String, String> request) {
        String employeeData = request.getOrDefault("data", "");
        String score = aiService.scoreEngagement(employeeData);
        return ResponseEntity.ok(Map.of("score", score));
    }

    @PostMapping("/sentiment")
    public String analyze(@RequestBody Map<String, String> request) {
        return huggingFaceService.analyzeSentiment(request.getOrDefault("text", ""));
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN','HR') or @employeeService.getEmployeeEntity(#employeeId).email == authentication.name")
    public ResponseEntity<Map<String, Object>> getEmployeeInsights(@PathVariable Long employeeId) {
        return ResponseEntity.ok(aiService.getEmployeeInsights(employeeId));
    }

    @GetMapping("/workforce")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<Map<String, Object>> getWorkforceInsights() {
        return ResponseEntity.ok(aiService.getWorkforceInsights());
    }
}
