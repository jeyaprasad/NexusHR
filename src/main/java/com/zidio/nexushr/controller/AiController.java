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
}
