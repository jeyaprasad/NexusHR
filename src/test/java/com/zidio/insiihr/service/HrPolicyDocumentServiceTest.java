package com.zidio.insiihr.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;

import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class HrPolicyDocumentServiceTest {

    @Mock
    private VectorStore vectorStore;

    @InjectMocks
    private HrPolicyDocumentService hrPolicyDocumentService;

    @Test
    void testIngestTextDocument() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "policy.txt",
                "text/plain",
                "This is a sample HR policy about leave.".getBytes()
        );

        hrPolicyDocumentService.ingestDocument(file);

        verify(vectorStore).add(anyList());
    }
}
