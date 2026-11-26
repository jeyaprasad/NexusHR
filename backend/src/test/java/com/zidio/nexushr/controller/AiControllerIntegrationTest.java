package com.zidio.nexushr.controller;

import com.zidio.nexushr.security.CustomUserDetailsService;
import com.zidio.nexushr.security.JwtTokenProvider;
import com.zidio.nexushr.service.AiService;
import com.zidio.nexushr.service.HrPolicyDocumentService;
import com.zidio.nexushr.service.HuggingFaceService;
import org.junit.jupiter.api.Test;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AiController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class AiControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AiService aiService;

    @MockBean
    private HuggingFaceService huggingFaceService;

    @MockBean
    private HrPolicyDocumentService hrPolicyDocumentService;

    @MockBean
    private VectorStore vectorStore;

    @MockBean
    private EmbeddingModel embeddingModel;

    @MockBean
    private ChatModel chatModel;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @MockBean
    private com.zidio.nexushr.service.EmployeeService employeeService;

    @Test
    @WithMockUser
    void testAskHrPolicy() throws Exception {
        when(aiService.askHrPolicy(anyString())).thenReturn("This is a mocked RAG answer.");

        mockMvc.perform(post("/api/ai/ask-hr")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"question\": \"What is the leave policy?\"}")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.answer").value("This is a mocked RAG answer."));
    }

    @Test
    @WithMockUser
    void testAskHrPolicySensitiveTopic() throws Exception {
        when(aiService.askHrPolicy(anyString())).thenReturn("This is something I'd recommend discussing directly with your HR representative, as it needs personal attention. Please reach out to hr@nexushr.com or your manager.");

        mockMvc.perform(post("/api/ai/ask-hr")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"question\": \"My manager has been harassing me, what should I do?\"}")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.answer").value("This is something I'd recommend discussing directly with your HR representative, as it needs personal attention. Please reach out to hr@nexushr.com or your manager."));
    }
}
