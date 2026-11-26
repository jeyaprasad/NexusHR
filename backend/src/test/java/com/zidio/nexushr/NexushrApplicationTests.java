package com.zidio.nexushr;

import org.junit.jupiter.api.Test;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class NexushrApplicationTests {

    @MockBean
    private VectorStore vectorStore;

    @MockBean
    private EmbeddingModel embeddingModel;

    @MockBean
    private ChatModel chatModel;

	@Test
	void contextLoads() {
	}

}
