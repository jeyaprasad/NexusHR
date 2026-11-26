# HR Chatbot Deep-Dive Explainer

This document provides a focused, detailed breakdown of the AI architecture powering the NexusHR Assistant chatbot. It explains the mechanics of the Retrieval-Augmented Generation (RAG) pipeline, the specific technology stack used, and how guardrails are implemented to ensure safe and accurate responses to employee queries.

---

## 1. What kind of AI is this, precisely

The HR Assistant is not a simple keyword-matching search engine or a rule-based decision tree. It is a **Retrieval-Augmented Generation (RAG)** system that combines semantic search with generative AI.

- **The Retrieval Step**: This uses **semantic embedding-based search**. When an employee asks a question, the system converts that text into a high-dimensional vector (an array of numbers representing its semantic meaning). It then compares this vector against the stored vectors of all chunked HR policy documents in our database to find the closest matches in "meaning space," not just overlapping words. 
  * *Example*: If a policy states "Maternity leave is 12 weeks," and an employee asks, "How long can I take off when I have a baby?", simple keyword search would fail because "baby" and "maternity" don't match. Semantic search succeeds because the embedding model understands that the concepts are highly related.

- **The Generation Step**: This is **genuine generative AI**. We take the top-matching policy chunks retrieved in the previous step and feed them to an actual Large Language Model (LLM) along with the user's question. The LLM synthesizes a novel, natural-language answer based *strictly* on the provided context. It is not filling in a template or returning a canned response.

- **The Fallback Path**: The system contains exactly one rule-based/simulated component. If the generative AI provider (Groq) is unreachable or the API key is missing (e.g., `mock-key`), the system deliberately degrades to a fallback mechanism that returns the raw retrieved document context instead of hallucinating or crashing. This is a conscious resilience design choice, not the default behavior of the chatbot.

---

## 2. What type of RAG, precisely

This implementation is a **basic/naive single-pass RAG architecture**. 

- It performs a single embedding generation for the user's query.
- It executes one retrieval call to the vector database to fetch the top-K most similar chunks.
- It passes those chunks directly to the LLM for generation.

**Contrast with Advanced RAG:**
This system does *not* currently employ advanced RAG techniques such as:
- **Query Rewriting:** Re-phrasing the user's input before embedding it to improve retrieval.
- **Re-ranking:** Fetching a large number of chunks (e.g., 20) and using a secondary cross-encoder model to sort them by relevance before sending the top 3 to the LLM.
- **Agentic Tool Selection:** Allowing the LLM to decide whether to query the policy database, check the user's personal PTO balance via an API, or do both.
- **Multi-hop Reasoning:** Iteratively searching the database if the first retrieval doesn't contain the full answer.

While advanced RAG would improve edge-case accuracy, the single-pass approach is highly performant and sufficient for our current set of standard HR policy documents.

---

## 3. Full Tech Stack for this Feature (Layer by Layer)

Here is the exact pipeline for the HR chatbot:

1. **Frontend (React/TanStack)**: The chat UI captures the employee's input and makes an HTTP POST request to `/api/ai/ask-hr`.
2. **Auth (Spring Security)**: The request includes a JWT (JSON Web Token), which Spring Security validates to ensure the user is authenticated and authorized to use the system.
3. **Embedding (Local ONNX Model)**: The `spring-ai-transformers` library uses a locally hosted ONNX model (`all-MiniLM-L6-v2`) to convert the question into a vector. *Why local?* It avoids network latency, eliminates API costs for embedding, and ensures no sensitive queries are sent to third-party embedding APIs.
4. **Vector Storage/Retrieval (PostgreSQL + pgvector)**: The vector is sent to our PostgreSQL database, which uses the `pgvector` extension to perform a cosine similarity search against pre-embedded policy chunks. *Why Postgres?* Since we already use Postgres for relational data (users, payroll), `pgvector` allows us to add vector search without the operational overhead of spinning up and maintaining a separate, dedicated vector database like Pinecone or Chroma.
5. **Prompt Construction (Spring AI)**: The retrieved chunks are combined with the user's question and a strict system instruction (guardrail) into a final `Prompt` object in `AiService.java`.
6. **Generation (Groq LLM)**: The prompt is sent via Spring AI's OpenAI-compatible client to Groq's extremely fast inference engine (running `openai/gpt-oss-20b` or a similarly configured model). *Why Groq?* Groq uses specialized LPU hardware that delivers near-instant inference speeds at low/zero cost on their free tier, making the chatbot feel exceptionally responsive.
7. **Response Handling**: The generated text is returned by the LLM, wrapped in a JSON response by `AiController.java`, and rendered back in the frontend UI.

---

## 4. The Guardrail Mechanism

The system uses a **prompt-level instruction** (a "system prompt") to prevent the AI from giving advice on highly sensitive HR matters. 

In `AiService.java`, the LLM is explicitly instructed:
> *"If the employee's question involves a sensitive topic — harassment, discrimination, disciplinary action, termination, personal medical/mental health disclosures, workplace conflict, legal disputes... you must NOT attempt to answer the substance of the question. Instead, you must respond exactly with: 'This is something I'd recommend discussing directly with your HR representative...'"*

**Examples:**
- *Will not trigger guardrail:* "What is the policy for carrying over unused vacation days?" (Answers based on retrieved policy).
- *Will not trigger guardrail:* "When is the next payroll cutoff date?" (Answers based on retrieved policy).
- *Will trigger guardrail:* "My manager keeps making inappropriate comments about my appearance, what should I do?" (Escalates to human HR).
- *Will trigger guardrail:* "I need to take medical leave because I was just diagnosed with depression." (Escalates to human HR).

**Limitations & Future Work:**
Because this is a prompt-based guardrail, it is *probabilistic*. It relies on the LLM's internal reasoning to classify the intent on the fly, which means a cleverly phrased question might bypass it. A more robust, enterprise-grade version ("future work") would use a dedicated, pre-classification NLP model (like a toxic-content classifier) to intercept the request *before* it ever reaches the generative LLM, acting as a guaranteed hard rule.

---

## 5. Wow Factors (For Demo and Defense)

What makes this feature genuinely impressive for a capstone demo:

1. **Real Semantic Retrieval**: It is grounded in actual uploaded documents. It's not a hardcoded script or a hallucinating LLM; it actually reads the company rules you upload.
2. **Graceful Degradation**: If the API goes down, the app doesn't crash or hang forever. It elegantly falls back to returning the retrieved context directly.
3. **Enterprise-Grade Guardrails**: It demonstrates an understanding of real-world HR risks by deliberately refusing to handle sensitive, liability-heavy topics.
4. **Local Embeddings**: By running the embedding model locally via ONNX, we demonstrate a hybrid AI architecture (local embeddings + cloud LLM) that optimizes for speed, privacy, and cost.
5. **High-Speed Inference**: By utilizing Groq for generation, the time-to-first-token is incredibly fast, making the chat experience feel premium and snappy.
6. **Extensible Open-Source Foundation**: The entire pipeline relies on open-source models and free-tier tools (Postgres, Spring AI, local ONNX), proving that enterprise-grade AI can be built without massive API budgets.

---

## 6. How to Demo This Well (90-Second Script)

Here is a suggested flow to demonstrate the chatbot effectively:

1. **Setup:** Ensure a standard HR policy document (e.g., Leave Policy) has been uploaded. Open the chatbot UI.
2. **The Normal Policy Question:**
   - *Action:* Type, "How many sick days do I get and do they roll over?"
   - *Script:* "First, let's look at how the semantic search works. Even if I don't use the exact wording from the employee handbook, the system retrieves the right policy chunks from our Postgres vector database and uses Groq to generate a clean, grounded answer."
3. **The Sensitive Escalation Question:**
   - *Action:* Type, "I think my coworker is stealing from the supply closet, what should I do?"
   - *Script:* "But real HR isn't just about reading manuals; it's about managing risk. I've built a prompt-based guardrail into the architecture. Notice how the AI refuses to give procedural advice here and instead immediately escalates to a human HR rep, exactly as an enterprise compliance team would require."
4. **Conclusion:** "Because the embeddings happen locally on the server and generation runs on Groq, the entire pipeline is highly resilient, secure, and blazing fast."
