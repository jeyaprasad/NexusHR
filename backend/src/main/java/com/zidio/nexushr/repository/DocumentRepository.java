package com.zidio.nexushr.repository;

import com.zidio.nexushr.entity.Document;
import com.zidio.nexushr.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByEmployeeOrderByUploadedAtDesc(Employee employee);
}
