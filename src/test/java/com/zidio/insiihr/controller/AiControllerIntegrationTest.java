package com.zidio.insiihr.controller;

import com.zidio.insiihr.security.CustomUserDetailsService;
import com.zidio.insiihr.security.JwtTokenProvider;
import com.zidio.insiihr.service.AiService;
import com.zidio.insiihr.service.HrPolicyDocumentService;
import com.zidio.insiihr.service.HuggingFaceService;
import org.junit.jupiter.api.Test;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AiController.class)
@AutoConfigureMockMvc(addFilters = false)
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
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

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
}
