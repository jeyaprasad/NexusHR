package com.zidio.nexushr.controller;

import com.zidio.nexushr.dto.FeedbackRequestDTO;
import com.zidio.nexushr.dto.GoalDTO;
import com.zidio.nexushr.service.DocumentService;
import com.zidio.nexushr.service.ExportService;
import com.zidio.nexushr.service.FeedbackService;
import com.zidio.nexushr.service.GoalService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class RbacSecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DocumentService documentService;

    @MockBean
    private ExportService exportService;

    @MockBean
    private GoalService goalService;

    @MockBean
    private FeedbackService feedbackService;

    @MockBean
    private VectorStore vectorStore;

    @MockBean
    private EmbeddingModel embeddingModel;

    @MockBean
    private ChatModel chatModel;

    @MockBean
    private JavaMailSender javaMailSender;

    // =========================================================================
    // DocumentController RBAC Tests
    // =========================================================================

    @Test
    @DisplayName("GET /api/documents/download/{id} with no auth token returns 401 Unauthorized")
    void downloadDocument_unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/api/documents/download/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/documents/download/{id} as EMPLOYEE for another employee's document returns 403 Forbidden")
    @WithMockUser(username = "other.employee@nexushr.com", roles = {"EMPLOYEE"})
    void downloadDocument_asUnauthorizedEmployee_returns403() throws Exception {
        when(documentService.isOwner(eq(1L), eq("other.employee@nexushr.com"))).thenReturn(false);

        mockMvc.perform(get("/api/documents/download/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/documents/download/{id} as owning EMPLOYEE returns 200 OK")
    @WithMockUser(username = "owner.employee@nexushr.com", roles = {"EMPLOYEE"})
    void downloadDocument_asOwningEmployee_returns200() throws Exception {
        when(documentService.isOwner(eq(1L), eq("owner.employee@nexushr.com"))).thenReturn(true);
        ByteArrayResource resource = new ByteArrayResource("dummy document content".getBytes()) {
            @Override
            public String getFilename() {
                return "offer_letter.pdf";
            }
        };
        when(documentService.downloadDocument(1L)).thenReturn(resource);

        mockMvc.perform(get("/api/documents/download/1"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_OCTET_STREAM));
    }

    @Test
    @DisplayName("GET /api/documents/download/{id} as ADMIN bypasses ownership and returns 200 OK")
    @WithMockUser(username = "admin@nexushr.com", roles = {"ADMIN"})
    void downloadDocument_asAdmin_returns200() throws Exception {
        ByteArrayResource resource = new ByteArrayResource("admin document".getBytes()) {
            @Override
            public String getFilename() {
                return "admin_doc.pdf";
            }
        };
        when(documentService.downloadDocument(1L)).thenReturn(resource);

        mockMvc.perform(get("/api/documents/download/1"))
                .andExpect(status().isOk());
    }

    // =========================================================================
    // ExportController RBAC Tests
    // =========================================================================

    @Test
    @DisplayName("GET /api/export/employees as EMPLOYEE returns 403 Forbidden")
    @WithMockUser(username = "employee@nexushr.com", roles = {"EMPLOYEE"})
    void exportEmployees_asEmployee_returns403() throws Exception {
        mockMvc.perform(get("/api/export/employees"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/export/employees as HR returns 200 OK")
    @WithMockUser(username = "hr@nexushr.com", roles = {"HR"})
    void exportEmployees_asHr_returns200() throws Exception {
        when(exportService.exportCsv("employees")).thenReturn("id,name\n1,Test".getBytes());

        mockMvc.perform(get("/api/export/employees"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("text/csv"));
    }

    // =========================================================================
    // GoalController RBAC Tests
    // =========================================================================

    @Test
    @DisplayName("POST /api/goals as EMPLOYEE returns 403 Forbidden")
    @WithMockUser(username = "employee@nexushr.com", roles = {"EMPLOYEE"})
    void createGoal_asEmployee_returns403() throws Exception {
        String goalJson = "{\"title\":\"Ship feature\",\"targetValue\":100.0,\"currentValue\":0.0}";

        mockMvc.perform(post("/api/goals")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(goalJson))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("POST /api/goals as ADMIN returns 200 OK")
    @WithMockUser(username = "admin@nexushr.com", roles = {"ADMIN"})
    void createGoal_asAdmin_returns200() throws Exception {
        String goalJson = "{\"title\":\"Ship feature\",\"targetValue\":100.0,\"currentValue\":0.0}";
        GoalDTO result = GoalDTO.builder().id(1L).title("Ship feature").build();
        when(goalService.createGoal(any())).thenReturn(result);

        mockMvc.perform(post("/api/goals")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(goalJson))
                .andExpect(status().isOk());
    }

    // =========================================================================
    // FeedbackController RBAC Tests
    // =========================================================================

    @Test
    @DisplayName("GET /api/feedback as EMPLOYEE returns 403 Forbidden")
    @WithMockUser(username = "employee@nexushr.com", roles = {"EMPLOYEE"})
    void getAllFeedback_asEmployee_returns403() throws Exception {
        mockMvc.perform(get("/api/feedback"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("POST /api/feedback as EMPLOYEE returns 403 Forbidden")
    @WithMockUser(username = "employee@nexushr.com", roles = {"EMPLOYEE"})
    void createFeedback_asEmployee_returns403() throws Exception {
        String feedbackJson = "{\"employeeId\":1,\"reviewerId\":2,\"period\":\"Q1-2026\"}";

        mockMvc.perform(post("/api/feedback")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(feedbackJson))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/feedback as HR returns 200 OK")
    @WithMockUser(username = "hr@nexushr.com", roles = {"HR"})
    void getAllFeedback_asHr_returns200() throws Exception {
        when(feedbackService.getAllRequests()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/feedback"))
                .andExpect(status().isOk());
    }
}
