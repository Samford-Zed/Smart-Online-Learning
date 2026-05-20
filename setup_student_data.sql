-- ============================================
-- SETUP SAMUEL'S STUDENT DATA
-- Run this in your PostgreSQL database
-- ============================================

-- 1. Find Samuel's user ID and store it in a variable
DO $$
DECLARE
    samuel_id INTEGER;
    math_subject_id INTEGER;
    bio_subject_id INTEGER;
    english_subject_id INTEGER;
BEGIN
    -- Get Samuel's user ID (correct email)
    SELECT id INTO samuel_id FROM users WHERE email = 'samizenebe508@gmail.com' LIMIT 1;
    
    -- If Samuel doesn't exist, create him first
    IF samuel_id IS NULL THEN
        INSERT INTO users (name, email, password, role, grade_level, created_at)
        VALUES ('Samuel Zenebe', 'samizenebe508@gmail.com', '$2b$10$7320sA4978Hashed', 'student', 1, NOW())
        RETURNING id INTO samuel_id;
        RAISE NOTICE 'Created Samuel with ID: %', samuel_id;
    ELSE
        RAISE NOTICE 'Found Samuel with ID: %', samuel_id;
    END IF;

    -- 2. Create subjects (courses) if they don't exist (grade 1 for Samuel)
    INSERT INTO subjects (name, slug, instructor, description, grade) 
    VALUES 
        ('Advanced Mathematics', 'advanced-mathematics', 'Mr. Anderson', 'Algebra, Calculus, and Trigonometry', 1),
        ('Biology & Earth Science', 'biology-earth-science', 'Dr. Ramirez', 'Cell biology, ecology, and geology', 1),
        ('English Literature', 'english-literature', 'Ms. Johnson', 'Classic and modern literature', 1),
        ('Physics', 'physics-101', 'Dr. Smith', 'Mechanics, waves, and thermodynamics', 1),
        ('Chemistry', 'chemistry-101', 'Dr. Brown', 'Organic and inorganic chemistry', 1)
    ON CONFLICT (slug) DO UPDATE 
    SET instructor = EXCLUDED.instructor, description = EXCLUDED.description, grade = EXCLUDED.grade;

    -- 3. Get subject IDs
    SELECT id INTO math_subject_id FROM subjects WHERE slug = 'advanced-mathematics';
    SELECT id INTO bio_subject_id FROM subjects WHERE slug = 'biology-earth-science';
    SELECT id INTO english_subject_id FROM subjects WHERE slug = 'english-literature';

    RAISE NOTICE 'Subject IDs - Math: %, Bio: %, English: %', math_subject_id, bio_subject_id, english_subject_id;

    -- 4. Create modules for Advanced Mathematics
    INSERT INTO modules (subject_id, title, order_no) VALUES
        (math_subject_id, 'Module 1: Algebra Basics', 1),
        (math_subject_id, 'Module 2: Linear Equations', 2),
        (math_subject_id, 'Module 3: Quadratic Functions', 3)
    ON CONFLICT DO NOTHING;

    -- 5. Create lessons for Math Module 1
    INSERT INTO lessons (module_id, subject_id, title, description, order_no) 
    SELECT m.id, math_subject_id, 'Lesson 1.1: Introduction to Variables', 'Learn about x and y variables', 1
    FROM modules m WHERE m.subject_id = math_subject_id AND m.order_no = 1;

    INSERT INTO lessons (module_id, subject_id, title, description, order_no)
    SELECT m.id, math_subject_id, 'Lesson 1.2: Solving Simple Equations', 'How to solve basic equations', 2
    FROM modules m WHERE m.subject_id = math_subject_id AND m.order_no = 1;

    INSERT INTO lessons (module_id, subject_id, title, description, order_no)
    SELECT m.id, math_subject_id, 'Lesson 1.3: Practice Quiz', 'Test your algebra knowledge', 3
    FROM modules m WHERE m.subject_id = math_subject_id AND m.order_no = 1;

    -- Add videos and PDFs to math lessons
    INSERT INTO videos (lesson_id, title, url)
    SELECT l.id, 'Introduction Video', 'https://example.com/math/video1.mp4'
    FROM lessons l
    JOIN modules m ON l.module_id = m.id
    WHERE m.subject_id = math_subject_id AND l.title LIKE '%Introduction%';

    INSERT INTO pdfs (lesson_id, title, url)
    SELECT l.id, 'Practice Worksheet', 'https://example.com/math/worksheet1.pdf'
    FROM lessons l
    JOIN modules m ON l.module_id = m.id
    WHERE m.subject_id = math_subject_id AND l.title LIKE '%Solving%';

    -- 6. Create modules for Biology
    INSERT INTO modules (subject_id, title, order_no) VALUES
        (bio_subject_id, 'Module 1: Cell Structure', 1),
        (bio_subject_id, 'Module 2: Ecosystems', 2)
    ON CONFLICT DO NOTHING;

    -- 7. Create lessons for Biology Module 1
    INSERT INTO lessons (module_id, subject_id, title, description, order_no)
    SELECT m.id, bio_subject_id, 'Lesson 1.1: Cell Theory', 'The foundation of cell biology', 1
    FROM modules m WHERE m.subject_id = bio_subject_id AND m.order_no = 1;

    INSERT INTO lessons (module_id, subject_id, title, description, order_no)
    SELECT m.id, bio_subject_id, 'Lesson 1.2: Prokaryotes vs Eukaryotes', 'Compare cell types', 2
    FROM modules m WHERE m.subject_id = bio_subject_id AND m.order_no = 1;

    -- Add video for biology
    INSERT INTO videos (lesson_id, title, url)
    SELECT l.id, 'Cell Theory Video', 'https://example.com/biology/cells.mp4'
    FROM lessons l
    JOIN modules m ON l.module_id = m.id
    WHERE m.subject_id = bio_subject_id AND l.title LIKE '%Cell Theory%';

    -- 8. Create modules for English
    INSERT INTO modules (subject_id, title, order_no) VALUES
        (english_subject_id, 'Module 1: Shakespeare', 1),
        (english_subject_id, 'Module 2: Modern Poetry', 2)
    ON CONFLICT DO NOTHING;

    -- 9. Create lessons for English Module 1
    INSERT INTO lessons (module_id, subject_id, title, description, order_no)
    SELECT m.id, english_subject_id, 'Lesson 1.1: Romeo and Juliet', 'Introduction to the play', 1
    FROM modules m WHERE m.subject_id = english_subject_id AND m.order_no = 1;

    INSERT INTO pdfs (lesson_id, title, url)
    SELECT l.id, 'Romeo and Juliet Script', 'https://example.com/english/rj-script.pdf'
    FROM lessons l
    JOIN modules m ON l.module_id = m.id
    WHERE m.subject_id = english_subject_id AND l.title LIKE '%Romeo%';

    -- 10. Create assignments for the subjects (linked to lessons)
    INSERT INTO assignments (lesson_id, title, description, requirements, due_date)
    SELECT l.id, 'Algebra Homework #1', 'Complete problems 1-20 on page 45', ARRAY['Show all work', 'Submit by Friday'], NOW() + INTERVAL '7 days'
    FROM lessons l
    JOIN modules m ON l.module_id = m.id
    WHERE m.subject_id = math_subject_id AND l.title LIKE '%Introduction%';

    INSERT INTO assignments (lesson_id, title, description, requirements, due_date)
    SELECT l.id, 'Biology Lab Report', 'Write a report on cell observation', ARRAY['Include diagrams', 'Minimum 500 words'], NOW() + INTERVAL '5 days'
    FROM lessons l
    JOIN modules m ON l.module_id = m.id
    WHERE m.subject_id = bio_subject_id AND l.title LIKE '%Cell Theory%';

    -- 11. Create assignment submissions for Samuel (to simulate grades)
    INSERT INTO assignment_submissions (user_id, assignment_id, status, score, feedback, submitted_at)
    SELECT samuel_id, a.id, 'graded', 85, 'Good work on the equations!', NOW()
    FROM assignments a
    JOIN lessons l ON a.lesson_id = l.id
    JOIN modules m ON l.module_id = m.id
    WHERE m.subject_id = math_subject_id
    ON CONFLICT DO NOTHING;

    INSERT INTO assignment_submissions (user_id, assignment_id, status, score, feedback, submitted_at)
    SELECT samuel_id, a.id, 'graded', 92, 'Excellent lab report!', NOW()
    FROM assignments a
    JOIN lessons l ON a.lesson_id = l.id
    JOIN modules m ON l.module_id = m.id
    WHERE m.subject_id = bio_subject_id
    ON CONFLICT DO NOTHING;

    -- 12. Create events (schedule) for Samuel
    INSERT INTO events (user_id, title, start_time, end_time, type, location, description, color_class) VALUES
        (samuel_id, 'Advanced Mathematics Class', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 1 hour', 'class', 'Room 101', 'Algebra lecture', 'blue'),
        (samuel_id, 'Biology Lab', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 2 hours', 'lab', 'Lab 3B', 'Cell observation lab', 'green'),
        (samuel_id, 'Assignment Due: Algebra', NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days', 'assignment', 'Online', 'Submit homework', 'red'),
        (samuel_id, 'Study Group', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days 1 hour', 'study', 'Library', 'Group study session', 'purple');

    -- 13. Create notifications for Samuel
    INSERT INTO notifications (user_id, message, type, is_read, created_at) VALUES
        (samuel_id, 'Welcome to Advanced Mathematics! Your first lesson is ready.', 'welcome', false, NOW()),
        (samuel_id, 'Assignment due in 5 days: Biology Lab Report', 'deadline', false, NOW()),
        (samuel_id, 'New video available: Introduction to Variables', 'content', false, NOW());

    -- 14. Create resources for the subjects
    INSERT INTO resources (subject_id, title, kind, size, download_url, view_url) VALUES
        (math_subject_id, 'Algebra Formula Sheet', 'pdf', '2MB', 'https://example.com/formulas.pdf', 'https://example.com/formulas.pdf'),
        (math_subject_id, 'Practice Problems Video', 'video', '45MB', null, 'https://example.com/practice.mp4'),
        (bio_subject_id, 'Cell Structure Diagram', 'pdf', '5MB', 'https://example.com/cell-diagram.pdf', 'https://example.com/cell-diagram.pdf'),
        (english_subject_id, 'Romeo and Juliet Study Guide', 'pdf', '3MB', 'https://example.com/rj-guide.pdf', 'https://example.com/rj-guide.pdf');

    -- 15. Mark some lessons as completed by Samuel (for progress tracking)
    INSERT INTO lesson_completion (user_id, lesson_id, is_completed, completed_at)
    SELECT samuel_id, l.id, true, NOW() - INTERVAL '2 days'
    FROM lessons l
    JOIN modules m ON l.module_id = m.id
    WHERE m.subject_id = math_subject_id AND l.title LIKE '%Introduction%'
    ON CONFLICT DO NOTHING;

    INSERT INTO lesson_completion (user_id, lesson_id, is_completed, completed_at)
    SELECT samuel_id, l.id, true, NOW() - INTERVAL '1 day'
    FROM lessons l
    JOIN modules m ON l.module_id = m.id
    WHERE m.subject_id = bio_subject_id AND l.title LIKE '%Cell Theory%'
    ON CONFLICT DO NOTHING;

    RAISE NOTICE '===============================================';
    RAISE NOTICE 'Setup complete for Samuel (ID: %)', samuel_id;
    RAISE NOTICE 'Enrolled in 3 subjects with modules and lessons';
    RAISE NOTICE 'Created assignments, grades, and schedule events';
    RAISE NOTICE '===============================================';

END $$;

-- ============================================
-- VERIFY THE DATA
-- ============================================

-- Check all subjects available (no enrollment table - all subjects visible)
SELECT u.name, s.name as subject, s.instructor
FROM users u, subjects s
WHERE u.email = 'samizenebe508@gmail.com';

-- Check all lessons for Advanced Mathematics
SELECT s.name as subject, m.title as module, l.title as lesson, l.type, l.duration
FROM subjects s
JOIN modules m ON s.id = m.subject_id
JOIN lessons l ON m.id = l.module_id
WHERE s.slug = 'advanced-mathematics'
ORDER BY m.order_no, l.order_no;

-- Check Samuel's assignment submissions (grades)
SELECT a.title, a.description, ass.score, ass.feedback, ass.status
FROM assignment_submissions ass
JOIN assignments a ON ass.assignment_id = a.id
WHERE ass.user_id = (SELECT id FROM users WHERE email = 'samizenebe508@gmail.com');
