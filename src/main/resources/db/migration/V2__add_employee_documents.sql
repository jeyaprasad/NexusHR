-- =============================================================================
-- NexusHR — V2: Add Employee Documents
-- Adds support for experience letters and graduation certificates
-- =============================================================================

ALTER TABLE employees 
ADD COLUMN experience_letter_data BYTEA,
ADD COLUMN experience_letter_name VARCHAR(255),
ADD COLUMN experience_letter_content_type VARCHAR(100),
ADD COLUMN graduation_certificate_data BYTEA,
ADD COLUMN graduation_certificate_name VARCHAR(255),
ADD COLUMN graduation_certificate_content_type VARCHAR(100);
