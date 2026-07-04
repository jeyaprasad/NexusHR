package com.zidio.nexushr.service;

import com.zidio.nexushr.entity.Document;
import com.zidio.nexushr.entity.Employee;
import com.zidio.nexushr.exception.ResourceNotFoundException;
import com.zidio.nexushr.repository.DocumentRepository;
import com.zidio.nexushr.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final EmployeeRepository employeeRepository;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @PostConstruct
    public void init() throws IOException {
        Files.createDirectories(Paths.get(uploadDir));
    }

    public Document uploadDocument(Long employeeId, MultipartFile file, String category) throws IOException {
        Employee emp = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));

        String uniqueName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path targetPath = Paths.get(uploadDir, uniqueName);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        Document doc = Document.builder()
                .employee(emp)
                .fileName(file.getOriginalFilename())
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .storagePath(targetPath.toString())
                .category(category)
                .build();

        return documentRepository.save(doc);
    }

    public List<Document> getEmployeeDocuments(Long employeeId) {
        Employee emp = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));
        return documentRepository.findByEmployeeOrderByUploadedAtDesc(emp);
    }

    public Resource downloadDocument(Long id) throws MalformedURLException {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", id));
        Path path = Paths.get(doc.getStoragePath());
        Resource resource = new UrlResource(path.toUri());
        if (!resource.exists()) throw new ResourceNotFoundException("File", "path", doc.getStoragePath());
        return resource;
    }

    public void deleteDocument(Long id) throws IOException {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", id));
        Files.deleteIfExists(Paths.get(doc.getStoragePath()));
        documentRepository.delete(doc);
    }
}