package com.zidio.nexushr.service;

import com.zidio.nexushr.dto.AttendanceDTO;
import com.zidio.nexushr.entity.Attendance;
import com.zidio.nexushr.entity.Employee;
import com.zidio.nexushr.exception.ResourceNotFoundException;
import com.zidio.nexushr.repository.AttendanceRepository;
import com.zidio.nexushr.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    public Page<AttendanceDTO> getAllAttendance(Pageable pageable) {
        return attendanceRepository.findAll(pageable).map(AttendanceDTO::fromEntity);
    }

    public AttendanceDTO getAttendanceById(Long id) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance", "id", id));
        return AttendanceDTO.fromEntity(attendance);
    }

    public List<AttendanceDTO> getAttendanceByEmployee(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));
        return attendanceRepository.findByEmployee(employee).stream()
                .map(AttendanceDTO::fromEntity)
                .toList();
    }

    public List<AttendanceDTO> getAttendanceByDate(LocalDate date) {
        return attendanceRepository.findByDate(date).stream()
                .map(AttendanceDTO::fromEntity)
                .toList();
    }

    public AttendanceDTO markAttendance(AttendanceDTO dto) {
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", dto.getEmployeeId()));

        Attendance.AttendanceStatus status;
        if (dto.getStatus() != null) {
            status = Attendance.AttendanceStatus.valueOf(dto.getStatus());
        } else if (dto.getCheckIn() != null && dto.getCheckIn().isAfter(LocalTime.of(9, 0))) {
            status = Attendance.AttendanceStatus.LATE;
        } else if (dto.getCheckIn() != null) {
            status = Attendance.AttendanceStatus.PRESENT;
        } else {
            status = Attendance.AttendanceStatus.ABSENT;
        }

        Attendance attendance = Attendance.builder()
                .employee(employee)
                .date(dto.getDate() != null ? dto.getDate() : LocalDate.now())
                .checkIn(dto.getCheckIn())
                .checkOut(dto.getCheckOut())
                .status(status)
                .notes(dto.getNotes())
                .build();

        return AttendanceDTO.fromEntity(attendanceRepository.save(attendance));
    }

    public AttendanceDTO updateAttendance(Long id, AttendanceDTO dto) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance", "id", id));

        attendance.setCheckIn(dto.getCheckIn());
        attendance.setCheckOut(dto.getCheckOut());
        if (dto.getStatus() != null) {
            attendance.setStatus(Attendance.AttendanceStatus.valueOf(dto.getStatus()));
        }
        attendance.setNotes(dto.getNotes());

        return AttendanceDTO.fromEntity(attendanceRepository.save(attendance));
    }

    public void deleteAttendance(Long id) {
        if (!attendanceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Attendance", "id", id);
        }
        attendanceRepository.deleteById(id);
    }

    @Transactional
    public int autoProcessToday() {
        LocalDate today = LocalDate.now();
        List<Employee> activeEmployees = employeeRepository.findByStatus(Employee.EmploymentStatus.ACTIVE);
        int processed = 0;

        for (Employee employee : activeEmployees) {
            boolean alreadyExists = attendanceRepository.findByEmployeeAndDate(employee, today).isPresent();
            if (!alreadyExists) {
                Attendance attendance = Attendance.builder()
                        .employee(employee)
                        .date(today)
                        .status(Attendance.AttendanceStatus.ABSENT)
                        .notes("Auto-marked absent")
                        .build();
                attendanceRepository.save(attendance);
                processed++;
            }
        }
        return processed;
    }

    @Transactional
    public int autoProcessDate(LocalDate date) {
        List<Employee> activeEmployees = employeeRepository.findByStatus(Employee.EmploymentStatus.ACTIVE);
        int processed = 0;

        for (Employee employee : activeEmployees) {
            boolean alreadyExists = attendanceRepository.findByEmployeeAndDate(employee, date).isPresent();
            if (!alreadyExists) {
                Attendance attendance = Attendance.builder()
                        .employee(employee)
                        .date(date)
                        .status(Attendance.AttendanceStatus.ABSENT)
                        .notes("Auto-marked absent")
                        .build();
                attendanceRepository.save(attendance);
                processed++;
            }
        }
        return processed;
    }
}
