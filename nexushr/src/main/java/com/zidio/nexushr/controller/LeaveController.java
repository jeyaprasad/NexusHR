package com.zidio.nexushr.controller;

import com.zidio.nexushr.dto.LeaveBalanceDTO;
import com.zidio.nexushr.dto.LeaveRequestDTO;
import com.zidio.nexushr.service.LeaveService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
@RequiredArgsConstructor
public class LeaveController {

    private final LeaveService leaveService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','HR','MANAGER')")
    public ResponseEntity<List<LeaveRequestDTO>> getAll() {
        return ResponseEntity.ok(leaveService.getAllRequests());
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<LeaveRequestDTO>> getByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(leaveService.getRequestsByEmployee(employeeId));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<List<LeaveRequestDTO>> getByStatus(@PathVariable String status) {
        return ResponseEntity.ok(leaveService.getRequestsByStatus(status));
    }

    @PostMapping
    public ResponseEntity<LeaveRequestDTO> create(@RequestBody LeaveRequestDTO dto) {
        return ResponseEntity.ok(leaveService.createRequest(dto));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN','HR','MANAGER')")
    public ResponseEntity<LeaveRequestDTO> approve(@PathVariable Long id, @RequestParam Long approverId) {
        return ResponseEntity.ok(leaveService.approveRequest(id, approverId));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN','HR','MANAGER')")
    public ResponseEntity<LeaveRequestDTO> reject(@PathVariable Long id, @RequestParam Long approverId) {
        return ResponseEntity.ok(leaveService.rejectRequest(id, approverId));
    }

    @GetMapping("/balances/{employeeId}")
    public ResponseEntity<List<LeaveBalanceDTO>> getBalances(@PathVariable Long employeeId, @RequestParam(defaultValue = "2026") int year) {
        return ResponseEntity.ok(leaveService.getBalances(employeeId, year));
    }
}