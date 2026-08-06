package com.zidio.nexushr.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.ExtractedTextFormatter;
import org.springframework.ai.reader.pdf.PagePdfDocumentReader;
import org.springframework.ai.reader.pdf.config.PdfDocumentReaderConfig;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class HrPolicyDocumentService {

    private final VectorStore vectorStore;

    public void ingestDocument(MultipartFile file) throws IOException {
        String filename = file.getOriginalFilename();
        log.info("Starting ingestion for file: {}", filename);
        
        List<Document> documents;
        
        if (filename != null && filename.toLowerCase().endsWith(".pdf")) {
            Resource resource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return filename;
                }
            };
            
            PagePdfDocumentReader pdfReader = new PagePdfDocumentReader(
                resource,
                PdfDocumentReaderConfig.builder()
                    .withPageExtractedTextFormatter(ExtractedTextFormatter.builder()
                        .withNumberOfBottomTextLinesToDelete(0)
                        .withNumberOfTopPagesToSkipBeforeDelete(0)
                        .build())
                    .withPagesPerDocument(1)
                    .build()
            );
            
            documents = pdfReader.get();
        } else {
            // Treat as raw text
            String content = new String(file.getBytes());
            documents = List.of(new Document(content));
        }
        
        TokenTextSplitter splitter = new TokenTextSplitter();
        List<Document> splitDocuments = splitter.split(documents);
        
        log.info("Split document into {} chunks. Adding to VectorStore.", splitDocuments.size());
        vectorStore.add(splitDocuments);
        log.info("Successfully ingested file: {}", filename);
    }
}
