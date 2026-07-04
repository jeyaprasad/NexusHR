package com.zidio.nexushr.service;

import com.zidio.nexushr.dto.LeaveBalanceDTO;
import com.zidio.nexushr.dto.LeaveRequestDTO;
import com.zidio.nexushr.entity.Employee;
import com.zidio.nexushr.entity.LeaveBalance;
import com.zidio.nexushr.entity.LeaveRequest;
import com.zidio.nexushr.exception.ResourceNotFoundException;
import com.zidio.nexushr.repository.EmployeeRepository;
import com.zidio.nexushr.repository.LeaveBalanceRepository;
import com.zidio.nexushr.repository.LeaveRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaveService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final EmployeeRepository employeeRepository;

    public List<LeaveRequestDTO> getAllRequests() {
        return leaveRequestRepository.findAll().stream()
                .map(LeaveRequestDTO::fromEntity)
                .toList();
    }

    public List<LeaveRequestDTO> getRequestsByEmployee(Long employeeId) {
        Employee emp = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));
        return leaveRequestRepository.findByEmployeeOrderByCreatedAtDesc(emp).stream()
                .map(LeaveRequestDTO::fromEntity)
                .toList();
    }

    public List<LeaveRequestDTO> getRequestsByStatus(String status) {
        return leaveRequestRepository.findByStatusOrderByCreatedAtDesc(LeaveRequest.LeaveStatus.valueOf(status.toUpperCase()))
                .stream().map(LeaveRequestDTO::fromEntity).toList();
    }

    @Transactional
    public LeaveRequestDTO createRequest(LeaveRequestDTO dto) {
        Employee emp = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", dto.getEmployeeId()));

        LeaveRequest request = LeaveRequest.builder()
                .employee(emp)
                .leaveType(LeaveRequest.LeaveType.valueOf(dto.getLeaveType()))
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .reason(dto.getReason())
                .status(LeaveRequest.LeaveStatus.PENDING)
                .build();

        return LeaveRequestDTO.fromEntity(leaveRequestRepository.save(request));
    }

    @Transactional
    public LeaveRequestDTO approveRequest(Long id, Long approverId) {
        LeaveRequest request = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveRequest", "id", id));
        Employee approver = employeeRepository.findById(approverId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", approverId));

        request.setStatus(LeaveRequest.LeaveStatus.APPROVED);
        request.setApprovedBy(approver);
        LeaveRequestDTO result = LeaveRequestDTO.fromEntity(leaveRequestRepository.save(request));

        updateLeaveBalance(request.getEmployee(), request.getLeaveType(), request.getStartDate().getYear());
        return result;
    }

    @Transactional
    public LeaveRequestDTO rejectRequest(Long id, Long approverId) {
        LeaveRequest request = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveRequest", "id", id));
        Employee approver = employeeRepository.findById(approverId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", approverId));
        request.setStatus(LeaveRequest.LeaveStatus.REJECTED);
        request.setApprovedBy(approver);
        return LeaveRequestDTO.fromEntity(leaveRequestRepository.save(request));
    }

    public List<LeaveBalanceDTO> getBalances(Long employeeId, int year) {
        Employee emp = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));
        return leaveBalanceRepository.findByEmployeeAndYear(emp, year).stream()
                .map(LeaveBalanceDTO::fromEntity)
                .toList();
    }

    private void updateLeaveBalance(Employee emp, LeaveRequest.LeaveType type, int year) {
        LeaveBalance balance = leaveBalanceRepository
                .findByEmployeeAndLeaveTypeAndYear(emp, type, year)
                .orElseGet(() -> leaveBalanceRepository.save(LeaveBalance.builder()
                        .employee(emp).leaveType(type).year(year)
                        .total(getDefaultTotal(type)).used(0).build()));
        long approved = leaveRequestRepository
                .countByEmployeeAndLeaveTypeAndStatus(emp, type, LeaveRequest.LeaveStatus.APPROVED);
        balance.setUsed(approved);
        leaveBalanceRepository.save(balance);
    }

    private double getDefaultTotal(LeaveRequest.LeaveType type) {
        return switch (type) {
            case ANNUAL -> 20;
            case SICK -> 12;
            case PERSONAL -> 5;
            case MATERNITY -> 90;
            case PATERNITY -> 15;
            case UNPAID -> 0;
        };
    }
}