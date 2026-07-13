-- Initial database setup

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create default roles (tables are created by SQLAlchemy's create_all)
INSERT INTO roles (name, description, permissions, created_at)
VALUES
    ('admin', 'Administrator with full access', '["read", "write", "delete", "admin"]', NOW()),
    ('user', 'Regular user', '["read", "write"]', NOW()),
    ('readonly', 'Read-only user', '["read"]', NOW())
ON CONFLICT (name) DO NOTHING;

-- Create indexes for performance (only if tables exist)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'users') THEN
        CREATE INDEX IF NOT EXISTS idx_users_username_lower ON users(LOWER(username));
        CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users(LOWER(email));
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'audit_logs') THEN
        CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at_desc ON audit_logs(created_at DESC);
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'security_events') THEN
        CREATE INDEX IF NOT EXISTS idx_security_events_created_at_desc ON security_events(created_at DESC);
    END IF;
END $$;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO secure_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO secure_user;
