package com.zidio.nexushr.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.embedding.EmbeddingRequest;
import org.springframework.ai.embedding.EmbeddingResponse;
import org.springframework.ai.embedding.Embedding;
import org.springframework.ai.document.MetadataMode;

import java.util.List;
import java.util.stream.Collectors;

@Configuration
public class MockEmbeddingConfig {

    @Bean
    @Primary
    public EmbeddingModel mockEmbeddingModel() {
        return new EmbeddingModel() {
            private float[] generateVector(String text) {
                float[] v = new float[384];
                java.util.Arrays.fill(v, 0.05f);
                int hash = (text != null) ? text.hashCode() : 42;
                for (int i = 0; i < 384; i++) {
                    v[i] += (float) Math.sin(hash + i) * 0.01f;
                }
                return v;
            }

            @Override
            public float[] embed(org.springframework.ai.document.Document document) {
                return generateVector(document.getText());
            }

            @Override
            public EmbeddingResponse call(EmbeddingRequest request) {
                List<Embedding> embeddings = request.getInstructions().stream()
                        .map(instruction -> new Embedding(generateVector(instruction), 0))
                        .collect(Collectors.toList());
                return new EmbeddingResponse(embeddings);
            }

            @Override
            public int dimensions() {
                return 384;
            }
        };
    }

    @Bean
    @org.springframework.context.annotation.Profile("dev")
    public org.springframework.ai.vectorstore.VectorStore devVectorStore(EmbeddingModel embeddingModel) {
        return org.springframework.ai.vectorstore.SimpleVectorStore.builder(embeddingModel).build();
    }
}
