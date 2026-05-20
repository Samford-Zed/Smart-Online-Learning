-- ============================================
-- ADMIN DASHBOARD TABLES
-- Phase 1: Foundation & Database Setup
-- ============================================

-- 1. Admin Settings Table
CREATE TABLE IF NOT EXISTS admin_settings (
    id BIGSERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. System Activity Logs
CREATE TABLE IF NOT EXISTS system_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    details JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Teacher-Subject Assignments
CREATE TABLE IF NOT EXISTS teacher_subjects (
    id BIGSERIAL PRIMARY KEY,
    teacher_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id BIGINT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(teacher_id, subject_id)
);

-- 4. System Announcements
CREATE TABLE IF NOT EXISTS announcements (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    target_roles VARCHAR(50)[], -- ['student', 'teacher', 'parent']
    target_grades INTEGER[],
    is_active BOOLEAN DEFAULT true,
    published_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Backup Records
CREATE TABLE IF NOT EXISTS backups (
    id BIGSERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    size_bytes BIGINT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_teacher_subjects_teacher ON teacher_subjects(teacher_id);
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active, published_at);

-- Insert default admin settings
INSERT INTO admin_settings (key, value) VALUES
    ('school_name', 'EduSmart K-12'),
    ('school_email', 'admin@edusmart.edu'),
    ('academic_year', '2025-2026'),
    ('semester', 'Spring'),
    ('grading_scale', '{"A": 90, "B": 80, "C": 70, "D": 60, "F": 0}'),
    ('maintenance_mode', 'false'),
    ('allow_registration', 'true')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- SEED ADMIN USER (if not exists)
-- ============================================
DO $$
DECLARE
    admin_id BIGINT;
BEGIN
    -- Check if admin exists
    SELECT id INTO admin_id FROM users WHERE email = 'admin@sols.edu' AND role = 'admin';
    
    IF admin_id IS NULL THEN
        -- Create admin user (password: Admin123!)
        INSERT INTO users (name, email, password, role, created_at)
        VALUES (
            'System Administrator', 
            'admin@sols.edu', 
            '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Admin123! hashed
            'admin', 
            NOW()
        )
        ON CONFLICT (email) DO UPDATE SET role = 'admin'
        RETURNING id INTO admin_id;
        
        RAISE NOTICE 'Created admin user with ID: %', admin_id;
    ELSE
        RAISE NOTICE 'Admin user already exists with ID: %', admin_id;
    END IF;
END $$;

-- Log the migration
INSERT INTO system_logs (action, details, created_at)
VALUES ('migration', '{"name": "003_admin_tables", "phase": "1"}', NOW());
