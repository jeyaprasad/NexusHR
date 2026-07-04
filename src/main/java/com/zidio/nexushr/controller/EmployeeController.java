package com.zidio.nexushr.controller;

import com.zidio.nexushr.dto.EmployeeDTO;
import com.zidio.nexushr.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import org.springframework.web.multipart.MultipartFile;
import com.zidio.nexushr.entity.Employee;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping
    public ResponseEntity<Page<EmployeeDTO>> getAllEmployees(Pageable pageable) {
        return ResponseEntity.ok(employeeService.getAllEmployees(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmployeeDTO> getEmployeeById(@PathVariable Long id) {
        return ResponseEntity.ok(employeeService.getEmployeeById(id));
    }

    @GetMapping("/lookup/{employeeId}")
    public ResponseEntity<EmployeeDTO> getEmployeeByEmployeeId(@PathVariable String employeeId) {
        return ResponseEntity.ok(employeeService.getEmployeeByEmployeeId(employeeId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<EmployeeDTO> createEmployee(@RequestBody EmployeeDTO dto) {
        return ResponseEntity.ok(employeeService.createEmployee(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<EmployeeDTO> updateEmployee(@PathVariable Long id, @RequestBody EmployeeDTO dto) {
        return ResponseEntity.ok(employeeService.updateEmployee(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/department/{department}")
    public ResponseEntity<List<EmployeeDTO>> getByDepartment(@PathVariable String department) {
        return ResponseEntity.ok(employeeService.getEmployeesByDepartment(department));
    }

    @PostMapping("/import")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<EmployeeDTO>> importEmployees(@RequestParam("file") MultipartFile file) throws java.io.IOException {
        return ResponseEntity.ok(employeeService.importCsv(file));
    }

    @PostMapping("/{id}/documents")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<EmployeeDTO> uploadDocuments(
            @PathVariable Long id,
            @RequestParam(value = "experienceLetter", required = false) MultipartFile experienceLetter,
            @RequestParam(value = "graduationCertificate", required = false) MultipartFile graduationCertificate) throws java.io.IOException {
        return ResponseEntity.ok(employeeService.uploadDocuments(id, experienceLetter, graduationCertificate));
    }

    @GetMapping("/{id}/documents/experience-letter")
    public ResponseEntity<byte[]> downloadExperienceLetter(@PathVariable Long id) {
        Employee employee = employeeService.getEmployeeEntity(id);
        if (employee.getExperienceLetterData() == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.parseMediaType(employee.getExperienceLetterContentType() != null ? employee.getExperienceLetterContentType() : "application/pdf"))
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + employee.getExperienceLetterName() + "\"")
                .body(employee.getExperienceLetterData());
    }

    @GetMapping("/{id}/documents/graduation-certificate")
    public ResponseEntity<byte[]> downloadGraduationCertificate(@PathVariable Long id) {
        Employee employee = employeeService.getEmployeeEntity(id);
        if (employee.getGraduationCertificateData() == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.parseMediaType(employee.getGraduationCertificateContentType() != null ? employee.getGraduationCertificateContentType() : "application/pdf"))
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + employee.getGraduationCertificateName() + "\"")
                .body(employee.getGraduationCertificateData());
    }
}
