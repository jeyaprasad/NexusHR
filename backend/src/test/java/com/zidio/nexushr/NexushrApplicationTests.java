package com.zidio.nexushr;

import org.junit.jupiter.api.Test;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

@SpringBootTest
class NexushrApplicationTests {

    @MockBean
    private VectorStore vectorStore;

    @MockBean
    private EmbeddingModel embeddingModel;

	@Test
	void contextLoads() {
	}

}
