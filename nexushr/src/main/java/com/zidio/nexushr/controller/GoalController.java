package com.zidio.nexushr.controller;

import com.zidio.nexushr.dto.GoalDTO;
import com.zidio.nexushr.service.GoalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<GoalDTO>> getEmployeeGoals(@PathVariable Long employeeId) {
        return ResponseEntity.ok(goalService.getEmployeeGoals(employeeId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','HR','MANAGER')")
    public ResponseEntity<GoalDTO> create(@RequestBody GoalDTO dto) {
        return ResponseEntity.ok(goalService.createGoal(dto));
    }

    @PatchMapping("/{id}/progress")
    @PreAuthorize("hasAnyRole('ADMIN','HR','MANAGER')")
    public ResponseEntity<GoalDTO> updateProgress(@PathVariable Long id, @RequestBody Map<String, Double> body) {
        return ResponseEntity.ok(goalService.updateProgress(id, body.get("currentValue")));
    }
}