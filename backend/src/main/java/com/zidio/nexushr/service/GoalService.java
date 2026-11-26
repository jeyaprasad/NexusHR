package com.zidio.nexushr.service;

import com.zidio.nexushr.dto.GoalDTO;
import com.zidio.nexushr.entity.Employee;
import com.zidio.nexushr.entity.Goal;
import com.zidio.nexushr.exception.ResourceNotFoundException;
import com.zidio.nexushr.repository.EmployeeRepository;
import com.zidio.nexushr.repository.GoalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalRepository goalRepository;
    private final EmployeeRepository employeeRepository;

    public List<GoalDTO> getEmployeeGoals(Long employeeId) {
        Employee emp = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));
        return goalRepository.findByEmployeeOrderByCreatedAtDesc(emp).stream()
                .map(GoalDTO::fromEntity).toList();
    }

    public GoalDTO createGoal(GoalDTO dto) {
        Employee emp = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", dto.getEmployeeId()));
        Goal goal = Goal.builder()
                .employee(emp)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .targetValue(dto.getTargetValue())
                .currentValue(dto.getCurrentValue())
                .category(dto.getCategory() != null ? Goal.GoalCategory.valueOf(dto.getCategory().toUpperCase()) : Goal.GoalCategory.PROJECT)
                .startDate(dto.getStartDate())
                .targetDate(dto.getTargetDate())
                .status(Goal.GoalStatus.NOT_STARTED)
                .build();
        return GoalDTO.fromEntity(goalRepository.save(goal));
    }

    public GoalDTO updateProgress(Long id, double currentValue) {
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Goal", "id", id));
        goal.setCurrentValue(currentValue);
        if (currentValue >= goal.getTargetValue()) {
            goal.setStatus(Goal.GoalStatus.ACHIEVED);
        } else if (currentValue > 0) {
            goal.setStatus(Goal.GoalStatus.IN_PROGRESS);
        }
        return GoalDTO.fromEntity(goalRepository.save(goal));
    }
}
