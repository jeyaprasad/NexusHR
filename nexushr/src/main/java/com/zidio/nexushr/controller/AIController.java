package com.zidio.nexushr.controller;

import com.zidio.nexushr.service.AIService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIController {

    private final AIService aiService;

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN','HR','MANAGER')")
    public ResponseEntity<Map<String, Object>> getEmployeeInsights(@PathVariable Long employeeId) {
        return ResponseEntity.ok(aiService.getEmployeeInsights(employeeId));
    }

    @GetMapping("/workforce")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<Map<String, Object>> getWorkforceInsights() {
        return ResponseEntity.ok(aiService.getWorkforceInsights());
    }
}