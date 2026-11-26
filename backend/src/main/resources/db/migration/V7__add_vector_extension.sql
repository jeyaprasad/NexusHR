CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS vector_store (
	id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
	content text,
	metadata jsonb,
	embedding vector(384) -- 384 dimensions for all-MiniLM-L6-v2 which is default for ONNX transformers
);

CREATE INDEX ON vector_store USING HNSW (embedding vector_cosine_ops);
