-- ============================================
-- PARENTS TABLE
-- For parent/guardian management
-- ============================================

-- 1. Parents Table
CREATE TABLE IF NOT EXISTS parents (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    occupation VARCHAR(100),
    address TEXT,
    status VARCHAR(20) DEFAULT 'Active',
    avatar TEXT
);

-- 2. Parent-Student Link Table
CREATE TABLE IF NOT EXISTS parent_student_links (
    id BIGSERIAL PRIMARY KEY,
    parent_id BIGINT NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(parent_id, student_id)
);

-- 3. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_parents_email ON parents(email);
CREATE INDEX IF NOT EXISTS idx_parents_status ON parents(status);
CREATE INDEX IF NOT EXISTS idx_parent_links_parent ON parent_student_links(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_links_student ON parent_student_links(student_id);
