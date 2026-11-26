-- =============================================================================
-- NexusHR — V9: Add Documents, Goals, and Feedback Requests
-- Restores complete enterprise HR functionality from original platform
-- =============================================================================

CREATE TABLE IF NOT EXISTS documents (
    id            BIGSERIAL PRIMARY KEY,
    employee_id   BIGINT       NOT NULL REFERENCES employees (id) ON DELETE CASCADE,
    file_name     VARCHAR(255) NOT NULL,
    file_type     VARCHAR(100) NOT NULL,
    file_size     BIGINT       NOT NULL DEFAULT 0,
    storage_path  VARCHAR(500) NOT NULL,
    category      VARCHAR(50)  NOT NULL DEFAULT 'OTHER',
    uploaded_at   TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doc_employee_id ON documents (employee_id);

CREATE TABLE IF NOT EXISTS goals (
    id            BIGSERIAL PRIMARY KEY,
    employee_id   BIGINT           NOT NULL REFERENCES employees (id) ON DELETE CASCADE,
    title         VARCHAR(255)     NOT NULL,
    description   TEXT,
    target_value  DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    current_value DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    category      VARCHAR(50)      NOT NULL DEFAULT 'PROJECT',
    start_date    DATE,
    target_date   DATE,
    status        VARCHAR(50)      NOT NULL DEFAULT 'NOT_STARTED',
    created_at    TIMESTAMP        NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP        NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_goal_employee_id ON goals (employee_id);

CREATE TABLE IF NOT EXISTS feedback_requests (
    id            BIGSERIAL PRIMARY KEY,
    employee_id   BIGINT      NOT NULL REFERENCES employees (id) ON DELETE CASCADE,
    reviewer_id   BIGINT      NOT NULL REFERENCES employees (id) ON DELETE CASCADE,
    period        VARCHAR(50) NOT NULL,
    due_date      DATE,
    status        VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    relationship  VARCHAR(50) NOT NULL DEFAULT 'PEER',
    created_at    TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_employee_id ON feedback_requests (employee_id);
CREATE INDEX IF NOT EXISTS idx_feedback_reviewer_id ON feedback_requests (reviewer_id);
