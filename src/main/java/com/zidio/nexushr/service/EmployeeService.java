package com.zidio.nexushr.service;

import com.zidio.nexushr.dto.EmployeeDTO;
import com.zidio.nexushr.entity.Employee;
import com.zidio.nexushr.exception.DuplicateResourceException;
import com.zidio.nexushr.exception.ResourceNotFoundException;
import com.zidio.nexushr.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;

    @Cacheable(value = "employees", key = "'all_' + #pageable.pageSize + '_' + #pageable.pageNumber")
    public Page<EmployeeDTO> getAllEmployees(Pageable pageable) {
        return employeeRepository.findAll(pageable).map(EmployeeDTO::fromEntity);
    }

    @Cacheable(value = "employeeById", key = "#id")
    public EmployeeDTO getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
        return EmployeeDTO.fromEntity(employee);
    }

    @Cacheable(value = "employees", key = "'byEmployeeId_' + #employeeId")
    public EmployeeDTO getEmployeeByEmployeeId(String employeeId) {
        Employee employee = employeeRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "employeeId", employeeId));
        return EmployeeDTO.fromEntity(employee);
    }

    @CacheEvict(value = {"employees", "employeeById", "employeeByDept", "dashboard"}, allEntries = true)
    public EmployeeDTO createEmployee(EmployeeDTO dto) {
        if (employeeRepository.findByEmployeeId(dto.getEmployeeId()).isPresent()) {
            throw new DuplicateResourceException("Employee ID already exists: " + dto.getEmployeeId());
        }
        if (employeeRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new DuplicateResourceException("Email already exists: " + dto.getEmail());
        }

        Employee employee = Employee.builder()
                .employeeId(dto.getEmployeeId())
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .department(dto.getDepartment())
                .position(dto.getPosition())
                .hireDate(dto.getHireDate() != null ? dto.getHireDate() : java.time.LocalDate.now())
                .salary(dto.getSalary())
                .status(dto.getStatus() != null
                        ? Employee.EmploymentStatus.valueOf(dto.getStatus())
                        : Employee.EmploymentStatus.ACTIVE)
                .build();

        return EmployeeDTO.fromEntity(employeeRepository.save(employee));
    }

    @CacheEvict(value = {"employees", "employeeById", "employeeByDept", "dashboard"}, allEntries = true)
    public EmployeeDTO updateEmployee(Long id, EmployeeDTO dto) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));

        employee.setFirstName(dto.getFirstName());
        employee.setLastName(dto.getLastName());
        employee.setPhone(dto.getPhone());
        employee.setDepartment(dto.getDepartment());
        employee.setPosition(dto.getPosition());
        employee.setSalary(dto.getSalary());
        if (dto.getStatus() != null) {
            employee.setStatus(Employee.EmploymentStatus.valueOf(dto.getStatus()));
        }

        return EmployeeDTO.fromEntity(employeeRepository.save(employee));
    }

    @CacheEvict(value = {"employees", "employeeById", "employeeByDept", "dashboard"}, allEntries = true)
    public void deleteEmployee(Long id) {
        if (!employeeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Employee", "id", id);
        }
        employeeRepository.deleteById(id);
    }

    public List<EmployeeDTO> getEmployeesByDepartment(String department) {
        return employeeRepository.findByDepartment(department).stream()
                .map(EmployeeDTO::fromEntity)
                .toList();
    }

    public EmployeeDTO uploadDocuments(Long id, MultipartFile experienceLetter, MultipartFile graduationCertificate) throws IOException {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));

        if (experienceLetter != null && !experienceLetter.isEmpty()) {
            employee.setExperienceLetterData(experienceLetter.getBytes());
            employee.setExperienceLetterName(experienceLetter.getOriginalFilename());
            employee.setExperienceLetterContentType(experienceLetter.getContentType());
        }

        if (graduationCertificate != null && !graduationCertificate.isEmpty()) {
            employee.setGraduationCertificateData(graduationCertificate.getBytes());
            employee.setGraduationCertificateName(graduationCertificate.getOriginalFilename());
            employee.setGraduationCertificateContentType(graduationCertificate.getContentType());
        }

        return EmployeeDTO.fromEntity(employeeRepository.save(employee));
    }

    public Employee getEmployeeEntity(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
    }

    @Transactional
    public List<EmployeeDTO> importCsv(MultipartFile file) throws IOException {
        List<EmployeeDTO> results = new java.util.ArrayList<>();
        List<String> errors = new java.util.ArrayList<>();
        String content = new String(file.getBytes());
        String[] lines = content.split("\n");
        
        if (lines.length < 2) {
            throw new IllegalArgumentException("CSV file must have a header row and at least one data row");
        }
        
        String header = lines[0].trim().toLowerCase();
        if (!header.contains("employeeid") || !header.contains("email")) {
            throw new IllegalArgumentException("CSV must contain at least 'employeeId' and 'email' columns");
        }
        
        for (int i = 1; i < lines.length; i++) {
            String line = lines[i].trim();
            if (line.isEmpty()) continue;
            
            try {
                String[] fields = parseCsvLine(line);
                EmployeeDTO dto = new EmployeeDTO();
                dto.setEmployeeId(fields.length > 0 ? fields[0].trim() : "");
                dto.setFirstName(fields.length > 1 ? fields[1].trim() : "");
                dto.setLastName(fields.length > 2 ? fields[2].trim() : "");
                dto.setEmail(fields.length > 3 ? fields[3].trim() : "");
                dto.setPhone(fields.length > 4 ? fields[4].trim() : "");
                dto.setDepartment(fields.length > 5 ? fields[5].trim() : "");
                dto.setPosition(fields.length > 6 ? fields[6].trim() : "");
                dto.setSalary(fields.length > 7 && !fields[7].trim().isEmpty() ? new java.math.BigDecimal(fields[7].trim()) : null);
                dto.setStatus(fields.length > 8 ? fields[8].trim().toUpperCase() : "ACTIVE");
                dto.setHireDate(java.time.LocalDate.now());
                
                results.add(createEmployee(dto));
            } catch (Exception e) {
                errors.add("Row " + (i + 1) + ": " + e.getMessage());
            }
        }
        
        if (!errors.isEmpty()) {
            throw new RuntimeException("Import completed with " + errors.size() + " error(s): " + String.join("; ", errors));
        }
        
        return results;
    }
    
    private String[] parseCsvLine(String line) {
        java.util.List<String> fields = new java.util.ArrayList<>();
        boolean inQuotes = false;
        StringBuilder current = new StringBuilder();
        
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '"') {
                if (inQuotes && i + 1 < line.length() && line.charAt(i + 1) == '"') {
                    current.append('"');
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (c == ',' && !inQuotes) {
                fields.add(current.toString());
                current = new StringBuilder();
            } else {
                current.append(c);
            }
        }
        fields.add(current.toString());
        return fields.toArray(new String[0]);
    }
}
