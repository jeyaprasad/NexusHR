CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(255) NOT NULL,
    entity_id BIGINT,
    old_value TEXT,
    new_value TEXT,
    performed_by VARCHAR(255),
    user_email VARCHAR(255),
    ip_address VARCHAR(255),
    timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);
