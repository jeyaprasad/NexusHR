package com.zidio.nexushr.controller;

import com.zidio.nexushr.entity.Document;
import com.zidio.nexushr.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping("/upload/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<Document> upload(@PathVariable Long employeeId,
                                           @RequestParam("file") MultipartFile file,
                                           @RequestParam(defaultValue = "OTHER") String category) throws IOException {
        return ResponseEntity.ok(documentService.uploadDocument(employeeId, file, category));
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN','HR') or @employeeService.getEmployeeEntity(#employeeId).email == authentication.name")
    public ResponseEntity<List<Document>> getDocuments(@PathVariable Long employeeId) {
        return ResponseEntity.ok(documentService.getEmployeeDocuments(employeeId));
    }

    @GetMapping("/download/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','HR') or @documentService.isOwner(#id, authentication.name)")
    public ResponseEntity<Resource> download(@PathVariable Long id) throws IOException {
        Resource resource = documentService.downloadDocument(id);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<Void> delete(@PathVariable Long id) throws IOException {
        documentService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }
}
