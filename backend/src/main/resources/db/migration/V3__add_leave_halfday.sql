-- =============================================================================
-- NexusHR — V3: Add Leave Halfday
-- Support decimal leave balance and half-day flag
-- =============================================================================

ALTER TABLE employees ALTER COLUMN leave_balance TYPE DOUBLE PRECISION;
ALTER TABLE leaves ADD COLUMN half_day BOOLEAN NOT NULL DEFAULT FALSE;
