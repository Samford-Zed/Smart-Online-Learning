-- ============================================
-- ENROLLMENTS TABLE
-- For student enrollment in subjects/courses
-- ============================================

-- 1. Enrollments Table
CREATE TABLE IF NOT EXISTS enrollments (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id BIGINT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, completed
    enrollment_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    approved_by BIGINT REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    notes TEXT,
    UNIQUE(student_id, subject_id)
);

-- 2. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_subject ON enrollments(subject_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);

-- 3. Add some sample enrollments (optional)
-- INSERT INTO enrollments (student_id, subject_id, status, enrollment_date)
-- SELECT u.id, s.id, 'approved', NOW()
-- FROM users u, subjects s
-- WHERE u.role = 'student' AND s.id = 1
-- LIMIT 1;
