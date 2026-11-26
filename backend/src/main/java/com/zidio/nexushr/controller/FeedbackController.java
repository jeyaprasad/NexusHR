package com.zidio.nexushr.controller;

import com.zidio.nexushr.dto.FeedbackRequestDTO;
import com.zidio.nexushr.service.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<List<FeedbackRequestDTO>> getAll() {
        return ResponseEntity.ok(feedbackService.getAllRequests());
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN','HR') or @employeeService.getEmployeeEntity(#employeeId).email == authentication.name")
    public ResponseEntity<List<FeedbackRequestDTO>> getForEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(feedbackService.getRequestsForEmployee(employeeId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<FeedbackRequestDTO> create(@RequestBody FeedbackRequestDTO dto) {
        return ResponseEntity.ok(feedbackService.createRequest(dto));
    }

    @PatchMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('ADMIN','HR','EMPLOYEE')")
    public ResponseEntity<Void> complete(@PathVariable Long id) {
        feedbackService.completeRequest(id);
        return ResponseEntity.noContent().build();
    }
}
