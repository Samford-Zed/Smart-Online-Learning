-- Migration: Convert UUID to BIGINT for all tables
-- This migration converts existing UUID primary keys to BIGSERIAL (auto-incrementing integers)
-- and updates all foreign key references accordingly

-- IMPORTANT: Backup your database before running this migration!

-- Start transaction
BEGIN;

-- =============================================
-- Step 1: Create mapping tables for UUID -> BIGINT conversion
-- =============================================

-- Users mapping table
CREATE TABLE IF NOT EXISTS _migration_users_map (
    old_uuid UUID PRIMARY KEY,
    new_id BIGINT
);

-- Subjects mapping table
CREATE TABLE IF NOT EXISTS _migration_subjects_map (
    old_uuid UUID PRIMARY KEY,
    new_id BIGINT
);

-- Modules mapping table
CREATE TABLE IF NOT EXISTS _migration_modules_map (
    old_uuid UUID PRIMARY KEY,
    new_id BIGINT
);

-- Lessons mapping table
CREATE TABLE IF NOT EXISTS _migration_lessons_map (
    old_uuid UUID PRIMARY KEY,
    new_id BIGINT
);

-- Quizzes mapping table
CREATE TABLE IF NOT EXISTS _migration_quizzes_map (
    old_uuid UUID PRIMARY KEY,
    new_id BIGINT
);

-- Questions mapping table
CREATE TABLE IF NOT EXISTS _migration_questions_map (
    old_uuid UUID PRIMARY KEY,
    new_id BIGINT
);

-- Assignments mapping table
CREATE TABLE IF NOT EXISTS _migration_assignments_map (
    old_uuid UUID PRIMARY KEY,
    new_id BIGINT
);

-- Videos mapping table
CREATE TABLE IF NOT EXISTS _migration_videos_map (
    old_uuid UUID PRIMARY KEY,
    new_id BIGINT
);

-- PDFs mapping table
CREATE TABLE IF NOT EXISTS _migration_pdfs_map (
    old_uuid UUID PRIMARY KEY,
    new_id BIGINT
);

-- Assessments mapping table
CREATE TABLE IF NOT EXISTS _migration_assessments_map (
    old_uuid UUID PRIMARY KEY,
    new_id BIGINT
);

-- Assessment Questions mapping table
CREATE TABLE IF NOT EXISTS _migration_assessment_questions_map (
    old_uuid UUID PRIMARY KEY,
    new_id BIGINT
);

-- Resources mapping table
CREATE TABLE IF NOT EXISTS _migration_resources_map (
    old_uuid UUID PRIMARY KEY,
    new_id BIGINT
);

-- Notifications mapping table
CREATE TABLE IF NOT EXISTS _migration_notifications_map (
    old_uuid UUID PRIMARY KEY,
    new_id BIGINT
);

-- Discussions mapping table
CREATE TABLE IF NOT EXISTS _migration_discussions_map (
    old_uuid UUID PRIMARY KEY,
    new_id BIGINT
);

-- Events mapping table
CREATE TABLE IF NOT EXISTS _migration_events_map (
    old_uuid UUID PRIMARY KEY,
    new_id BIGINT
);

-- Sessions mapping table
CREATE TABLE IF NOT EXISTS _migration_sessions_map (
    old_uuid UUID PRIMARY KEY,
    new_id BIGINT
);

-- Messages mapping table
CREATE TABLE IF NOT EXISTS _migration_messages_map (
    old_uuid UUID PRIMARY KEY,
    new_id BIGINT
);

-- Parent-Student Links mapping table
CREATE TABLE IF NOT EXISTS _migration_parent_student_links_map (
    old_uuid UUID PRIMARY KEY,
    new_id BIGINT
);

-- Student Profiles mapping table
CREATE TABLE IF NOT EXISTS _migration_student_profiles_map (
    old_uuid UUID PRIMARY KEY,
    new_id BIGINT
);

-- Lesson Completion mapping table
CREATE TABLE IF NOT EXISTS _migration_lesson_completion_map (
    old_uuid UUID PRIMARY KEY,
    new_id BIGINT
);

-- Quiz Submissions mapping table
CREATE TABLE IF NOT EXISTS _migration_quiz_submissions_map (
    old_uuid UUID PRIMARY KEY,
    new_id BIGINT
);

-- User Answers mapping table
CREATE TABLE IF NOT EXISTS _migration_user_answers_map (
    old_uuid UUID PRIMARY KEY,
    new_id BIGINT
);

-- Assignment Submissions mapping table
CREATE TABLE IF NOT EXISTS _migration_assignment_submissions_map (
    old_uuid UUID PRIMARY KEY,
    new_id BIGINT
);

-- Video Progress mapping table
CREATE TABLE IF NOT EXISTS _migration_video_progress_map (
    old_uuid UUID PRIMARY KEY,
    new_id BIGINT
);

-- Assessment Submissions mapping table
CREATE TABLE IF NOT EXISTS _migration_assessment_submissions_map (
    old_uuid UUID PRIMARY KEY,
    new_id BIGINT
);

-- Assessment Answers mapping table
CREATE TABLE IF NOT EXISTS _migration_assessment_answers_map (
    old_uuid UUID PRIMARY KEY,
    new_id BIGINT
);

-- Resource Views mapping table
CREATE TABLE IF NOT EXISTS _migration_resource_views_map (
    old_uuid UUID PRIMARY KEY,
    new_id BIGINT
);

-- Resource Requests mapping table
CREATE TABLE IF NOT EXISTS _migration_resource_requests_map (
    old_uuid UUID PRIMARY KEY,
    new_id BIGINT
);

-- =============================================
-- Step 2: Create sequences for new IDs
-- =============================================

-- Create sequences starting from 1 for each table
CREATE SEQUENCE IF NOT EXISTS users_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS subjects_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS modules_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS lessons_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS quizzes_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS questions_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS assignments_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS videos_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS pdfs_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS assessments_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS assessment_questions_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS resources_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS notifications_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS discussions_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS events_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS sessions_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS messages_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS parent_student_links_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS student_profiles_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS lesson_completion_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS quiz_submissions_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS user_answers_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS assignment_submissions_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS video_progress_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS assessment_submissions_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS assessment_answers_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS resource_views_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS resource_requests_id_seq START 1;

-- =============================================
-- Step 3: Populate mapping tables
-- =============================================

-- Users mapping
INSERT INTO _migration_users_map (old_uuid, new_id)
SELECT id, nextval('users_id_seq')
FROM users;

-- Subjects mapping
INSERT INTO _migration_subjects_map (old_uuid, new_id)
SELECT id, nextval('subjects_id_seq')
FROM subjects;

-- Modules mapping
INSERT INTO _migration_modules_map (old_uuid, new_id)
SELECT id, nextval('modules_id_seq')
FROM modules;

-- Lessons mapping
INSERT INTO _migration_lessons_map (old_uuid, new_id)
SELECT id, nextval('lessons_id_seq')
FROM lessons;

-- Quizzes mapping
INSERT INTO _migration_quizzes_map (old_uuid, new_id)
SELECT id, nextval('quizzes_id_seq')
FROM quizzes;

-- Questions mapping
INSERT INTO _migration_questions_map (old_uuid, new_id)
SELECT id, nextval('questions_id_seq')
FROM questions;

-- Assignments mapping
INSERT INTO _migration_assignments_map (old_uuid, new_id)
SELECT id, nextval('assignments_id_seq')
FROM assignments;

-- Videos mapping
INSERT INTO _migration_videos_map (old_uuid, new_id)
SELECT id, nextval('videos_id_seq')
FROM videos;

-- PDFs mapping
INSERT INTO _migration_pdfs_map (old_uuid, new_id)
SELECT id, nextval('pdfs_id_seq')
FROM pdfs;

-- Assessments mapping
INSERT INTO _migration_assessments_map (old_uuid, new_id)
SELECT id, nextval('assessments_id_seq')
FROM assessments;

-- Assessment Questions mapping
INSERT INTO _migration_assessment_questions_map (old_uuid, new_id)
SELECT id, nextval('assessment_questions_id_seq')
FROM assessment_questions;

-- Resources mapping
INSERT INTO _migration_resources_map (old_uuid, new_id)
SELECT id, nextval('resources_id_seq')
FROM resources;

-- Notifications mapping
INSERT INTO _migration_notifications_map (old_uuid, new_id)
SELECT id, nextval('notifications_id_seq')
FROM notifications;

-- Discussions mapping
INSERT INTO _migration_discussions_map (old_uuid, new_id)
SELECT id, nextval('discussions_id_seq')
FROM discussions;

-- Events mapping
INSERT INTO _migration_events_map (old_uuid, new_id)
SELECT id, nextval('events_id_seq')
FROM events;

-- Sessions mapping
INSERT INTO _migration_sessions_map (old_uuid, new_id)
SELECT id, nextval('sessions_id_seq')
FROM sessions;

-- Messages mapping
INSERT INTO _migration_messages_map (old_uuid, new_id)
SELECT id, nextval('messages_id_seq')
FROM messages;

-- Parent-Student Links mapping
INSERT INTO _migration_parent_student_links_map (old_uuid, new_id)
SELECT id, nextval('parent_student_links_id_seq')
FROM parent_student_links;

-- Student Profiles mapping
INSERT INTO _migration_student_profiles_map (old_uuid, new_id)
SELECT id, nextval('student_profiles_id_seq')
FROM student_profiles;

-- Lesson Completion mapping
INSERT INTO _migration_lesson_completion_map (old_uuid, new_id)
SELECT id, nextval('lesson_completion_id_seq')
FROM lesson_completion;

-- Quiz Submissions mapping
INSERT INTO _migration_quiz_submissions_map (old_uuid, new_id)
SELECT id, nextval('quiz_submissions_id_seq')
FROM quiz_submissions;

-- User Answers mapping
INSERT INTO _migration_user_answers_map (old_uuid, new_id)
SELECT id, nextval('user_answers_id_seq')
FROM user_answers;

-- Assignment Submissions mapping
INSERT INTO _migration_assignment_submissions_map (old_uuid, new_id)
SELECT id, nextval('assignment_submissions_id_seq')
FROM assignment_submissions;

-- Video Progress mapping
INSERT INTO _migration_video_progress_map (old_uuid, new_id)
SELECT id, nextval('video_progress_id_seq')
FROM video_progress;

-- Assessment Submissions mapping
INSERT INTO _migration_assessment_submissions_map (old_uuid, new_id)
SELECT id, nextval('assessment_submissions_id_seq')
FROM assessment_submissions;

-- Assessment Answers mapping
INSERT INTO _migration_assessment_answers_map (old_uuid, new_id)
SELECT id, nextval('assessment_answers_id_seq')
FROM assessment_answers;

-- Resource Views mapping
INSERT INTO _migration_resource_views_map (old_uuid, new_id)
SELECT id, nextval('resource_views_id_seq')
FROM resource_views;

-- Resource Requests mapping
INSERT INTO _migration_resource_requests_map (old_uuid, new_id)
SELECT id, nextval('resource_requests_id_seq')
FROM resource_requests;

-- =============================================
-- Step 4: Create new tables with BIGINT IDs
-- =============================================

-- Create new users table
CREATE TABLE _new_users (
    id BIGINT PRIMARY KEY DEFAULT nextval('users_id_seq'),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    grade_level VARCHAR(50)
);

-- Copy data with new IDs
INSERT INTO _new_users (id, full_name, email, password, role, grade_level)
SELECT m.new_id, u.full_name, u.email, u.password, u.role, u.grade_level
FROM users u
JOIN _migration_users_map m ON u.id = m.old_uuid;

-- Create new subjects table
CREATE TABLE _new_subjects (
    id BIGINT PRIMARY KEY DEFAULT nextval('subjects_id_seq'),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    grade VARCHAR(50) NOT NULL,
    instructor VARCHAR(255)
);

INSERT INTO _new_subjects (id, name, slug, description, grade, instructor)
SELECT m.new_id, s.name, s.slug, s.description, s.grade, s.instructor
FROM subjects s
JOIN _migration_subjects_map m ON s.id = m.old_uuid;

-- Create new modules table
CREATE TABLE _new_modules (
    id BIGINT PRIMARY KEY DEFAULT nextval('modules_id_seq'),
    subject_id BIGINT REFERENCES _new_subjects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    order_no INTEGER NOT NULL
);

INSERT INTO _new_modules (id, subject_id, title, order_no)
SELECT m.new_id, sm.new_id, mo.title, mo.order_no
FROM modules mo
JOIN _migration_modules_map m ON mo.id = m.old_uuid
JOIN _migration_subjects_map sm ON mo.subject_id = sm.old_uuid;

-- Create new lessons table
CREATE TABLE _new_lessons (
    id BIGINT PRIMARY KEY DEFAULT nextval('lessons_id_seq'),
    subject_id BIGINT REFERENCES _new_subjects(id) ON DELETE CASCADE,
    module_id BIGINT REFERENCES _new_modules(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_no INTEGER NOT NULL
);

INSERT INTO _new_lessons (id, subject_id, module_id, title, description, order_no)
SELECT m.new_id, sm.new_id, mm.new_id, l.title, l.description, l.order_no
FROM lessons l
JOIN _migration_lessons_map m ON l.id = m.old_uuid
JOIN _migration_subjects_map sm ON l.subject_id = sm.old_uuid
LEFT JOIN _migration_modules_map mm ON l.module_id = mm.old_uuid;

-- Create new parent_student_links table
CREATE TABLE _new_parent_student_links (
    id BIGINT PRIMARY KEY DEFAULT nextval('parent_student_links_id_seq'),
    parent_id BIGINT REFERENCES _new_users(id) ON DELETE CASCADE,
    student_email VARCHAR(255) NOT NULL,
    student_id BIGINT REFERENCES _new_users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO _new_parent_student_links (id, parent_id, student_email, student_id, created_at)
SELECT m.new_id, pm.new_id, psl.student_email, sm.new_id, psl.created_at
FROM parent_student_links psl
JOIN _migration_parent_student_links_map m ON psl.id = m.old_uuid
JOIN _migration_users_map pm ON psl.parent_id = pm.old_uuid
LEFT JOIN _migration_users_map sm ON psl.student_id = sm.old_uuid;

-- Create new student_profiles table
CREATE TABLE _new_student_profiles (
    id BIGINT PRIMARY KEY DEFAULT nextval('student_profiles_id_seq'),
    user_id BIGINT REFERENCES _new_users(id) ON DELETE CASCADE,
    student_info JSONB,
    parent_info JSONB,
    school_preference JSONB
);

INSERT INTO _new_student_profiles (id, user_id, student_info, parent_info, school_preference)
SELECT m.new_id, um.new_id, sp.student_info, sp.parent_info, sp.school_preference
FROM student_profiles sp
JOIN _migration_student_profiles_map m ON sp.id = m.old_uuid
JOIN _migration_users_map um ON sp.user_id = um.old_uuid;

-- Create new lesson_completion table
CREATE TABLE _new_lesson_completion (
    id BIGINT PRIMARY KEY DEFAULT nextval('lesson_completion_id_seq'),
    user_id BIGINT REFERENCES _new_users(id) ON DELETE CASCADE,
    lesson_id BIGINT REFERENCES _new_lessons(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, lesson_id)
);

INSERT INTO _new_lesson_completion (id, user_id, lesson_id, is_completed, completed_at)
SELECT m.new_id, um.new_id, lm.new_id, lc.is_completed, lc.completed_at
FROM lesson_completion lc
JOIN _migration_lesson_completion_map m ON lc.id = m.old_uuid
JOIN _migration_users_map um ON lc.user_id = um.old_uuid
JOIN _migration_lessons_map lm ON lc.lesson_id = lm.old_uuid;

-- Create new videos table
CREATE TABLE _new_videos (
    id BIGINT PRIMARY KEY DEFAULT nextval('videos_id_seq'),
    lesson_id BIGINT REFERENCES _new_lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    url TEXT NOT NULL
);

INSERT INTO _new_videos (id, lesson_id, title, url)
SELECT m.new_id, lm.new_id, v.title, v.url
FROM videos v
JOIN _migration_videos_map m ON v.id = m.old_uuid
JOIN _migration_lessons_map lm ON v.lesson_id = lm.old_uuid;

-- Create new pdfs table
CREATE TABLE _new_pdfs (
    id BIGINT PRIMARY KEY DEFAULT nextval('pdfs_id_seq'),
    lesson_id BIGINT REFERENCES _new_lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    url TEXT NOT NULL
);

INSERT INTO _new_pdfs (id, lesson_id, title, url)
SELECT m.new_id, lm.new_id, p.title, p.url
FROM pdfs p
JOIN _migration_pdfs_map m ON p.id = m.old_uuid
JOIN _migration_lessons_map lm ON p.lesson_id = lm.old_uuid;

-- Create new quizzes table
CREATE TABLE _new_quizzes (
    id BIGINT PRIMARY KEY DEFAULT nextval('quizzes_id_seq'),
    lesson_id BIGINT REFERENCES _new_lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    max_attempts INTEGER DEFAULT 1
);

INSERT INTO _new_quizzes (id, lesson_id, title, description, max_attempts)
SELECT m.new_id, lm.new_id, q.title, q.description, q.max_attempts
FROM quizzes q
JOIN _migration_quizzes_map m ON q.id = m.old_uuid
JOIN _migration_lessons_map lm ON q.lesson_id = lm.old_uuid;

-- Create new questions table
CREATE TABLE _new_questions (
    id BIGINT PRIMARY KEY DEFAULT nextval('questions_id_seq'),
    quiz_id BIGINT REFERENCES _new_quizzes(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_option VARCHAR(255) NOT NULL
);

INSERT INTO _new_questions (id, quiz_id, text, options, correct_option)
SELECT m.new_id, qm.new_id, qu.text, qu.options, qu.correct_option
FROM questions qu
JOIN _migration_questions_map m ON qu.id = m.old_uuid
JOIN _migration_quizzes_map qm ON qu.quiz_id = qm.old_uuid;

-- Create new quiz_submissions table
CREATE TABLE _new_quiz_submissions (
    id BIGINT PRIMARY KEY DEFAULT nextval('quiz_submissions_id_seq'),
    user_id BIGINT REFERENCES _new_users(id) ON DELETE CASCADE,
    quiz_id BIGINT REFERENCES _new_quizzes(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO _new_quiz_submissions (id, user_id, quiz_id, score, total_questions, submitted_at)
SELECT m.new_id, um.new_id, qm.new_id, qs.score, qs.total_questions, qs.submitted_at
FROM quiz_submissions qs
JOIN _migration_quiz_submissions_map m ON qs.id = m.old_uuid
JOIN _migration_users_map um ON qs.user_id = um.old_uuid
JOIN _migration_quizzes_map qm ON qs.quiz_id = qm.old_uuid;

-- Create new user_answers table
CREATE TABLE _new_user_answers (
    id BIGINT PRIMARY KEY DEFAULT nextval('user_answers_id_seq'),
    submission_id BIGINT REFERENCES _new_quiz_submissions(id) ON DELETE CASCADE,
    question_id BIGINT REFERENCES _new_questions(id) ON DELETE CASCADE,
    selected_option VARCHAR(255) NOT NULL,
    is_correct BOOLEAN NOT NULL
);

INSERT INTO _new_user_answers (id, submission_id, question_id, selected_option, is_correct)
SELECT m.new_id, sm.new_id, qm.new_id, ua.selected_option, ua.is_correct
FROM user_answers ua
JOIN _migration_user_answers_map m ON ua.id = m.old_uuid
JOIN _migration_quiz_submissions_map sm ON ua.submission_id = sm.old_uuid
JOIN _migration_questions_map qm ON ua.question_id = qm.old_uuid;

-- Create new assignments table
CREATE TABLE _new_assignments (
    id BIGINT PRIMARY KEY DEFAULT nextval('assignments_id_seq'),
    lesson_id BIGINT REFERENCES _new_lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    requirements TEXT[],
    due_date TIMESTAMP
);

INSERT INTO _new_assignments (id, lesson_id, title, description, requirements, due_date)
SELECT m.new_id, lm.new_id, a.title, a.description, a.requirements, a.due_date
FROM assignments a
JOIN _migration_assignments_map m ON a.id = m.old_uuid
JOIN _migration_lessons_map lm ON a.lesson_id = lm.old_uuid;

-- Create new assignment_submissions table
CREATE TABLE _new_assignment_submissions (
    id BIGINT PRIMARY KEY DEFAULT nextval('assignment_submissions_id_seq'),
    user_id BIGINT REFERENCES _new_users(id) ON DELETE CASCADE,
    assignment_id BIGINT REFERENCES _new_assignments(id) ON DELETE CASCADE,
    file_url TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    score INTEGER,
    feedback TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO _new_assignment_submissions (id, user_id, assignment_id, file_url, status, score, feedback, submitted_at)
SELECT m.new_id, um.new_id, am.new_id, asub.file_url, asub.status, asub.score, asub.feedback, asub.submitted_at
FROM assignment_submissions asub
JOIN _migration_assignment_submissions_map m ON asub.id = m.old_uuid
JOIN _migration_users_map um ON asub.user_id = um.old_uuid
JOIN _migration_assignments_map am ON asub.assignment_id = am.old_uuid;

-- Create new video_progress table
CREATE TABLE _new_video_progress (
    id BIGINT PRIMARY KEY DEFAULT nextval('video_progress_id_seq'),
    user_id BIGINT REFERENCES _new_users(id) ON DELETE CASCADE,
    video_id BIGINT REFERENCES _new_videos(id) ON DELETE CASCADE,
    watched_duration INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, video_id)
);

INSERT INTO _new_video_progress (id, user_id, video_id, watched_duration, is_completed, last_updated)
SELECT m.new_id, um.new_id, vm.new_id, vp.watched_duration, vp.is_completed, vp.last_updated
FROM video_progress vp
JOIN _migration_video_progress_map m ON vp.id = m.old_uuid
JOIN _migration_users_map um ON vp.user_id = um.old_uuid
JOIN _migration_videos_map vm ON vp.video_id = vm.old_uuid;

-- Create new notifications table
CREATE TABLE _new_notifications (
    id BIGINT PRIMARY KEY DEFAULT nextval('notifications_id_seq'),
    user_id BIGINT REFERENCES _new_users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    type VARCHAR(50),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO _new_notifications (id, user_id, message, type, is_read, created_at)
SELECT m.new_id, um.new_id, n.message, n.type, n.is_read, n.created_at
FROM notifications n
JOIN _migration_notifications_map m ON n.id = m.old_uuid
JOIN _migration_users_map um ON n.user_id = um.old_uuid;

-- Create new discussions table
CREATE TABLE _new_discussions (
    id BIGINT PRIMARY KEY DEFAULT nextval('discussions_id_seq'),
    lesson_id BIGINT REFERENCES _new_lessons(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES _new_users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO _new_discussions (id, lesson_id, user_id, message, created_at)
SELECT m.new_id, lm.new_id, um.new_id, d.message, d.created_at
FROM discussions d
JOIN _migration_discussions_map m ON d.id = m.old_uuid
JOIN _migration_lessons_map lm ON d.lesson_id = lm.old_uuid
JOIN _migration_users_map um ON d.user_id = um.old_uuid;

-- Create new assessments table
CREATE TABLE _new_assessments (
    id BIGINT PRIMARY KEY DEFAULT nextval('assessments_id_seq'),
    subject_id BIGINT REFERENCES _new_subjects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    scheduled_for TIMESTAMP NOT NULL,
    instructions TEXT,
    status VARCHAR(50) DEFAULT 'upcoming'
);

INSERT INTO _new_assessments (id, subject_id, title, duration_minutes, scheduled_for, instructions, status)
SELECT m.new_id, sm.new_id, a.title, a.duration_minutes, a.scheduled_for, a.instructions, a.status
FROM assessments a
JOIN _migration_assessments_map m ON a.id = m.old_uuid
JOIN _migration_subjects_map sm ON a.subject_id = sm.old_uuid;

-- Create new assessment_questions table
CREATE TABLE _new_assessment_questions (
    id BIGINT PRIMARY KEY DEFAULT nextval('assessment_questions_id_seq'),
    assessment_id BIGINT REFERENCES _new_assessments(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_index INTEGER NOT NULL
);

INSERT INTO _new_assessment_questions (id, assessment_id, prompt, options, correct_index)
SELECT m.new_id, am.new_id, aq.prompt, aq.options, aq.correct_index
FROM assessment_questions aq
JOIN _migration_assessment_questions_map m ON aq.id = m.old_uuid
JOIN _migration_assessments_map am ON aq.assessment_id = am.old_uuid;

-- Create new assessment_submissions table
CREATE TABLE _new_assessment_submissions (
    id BIGINT PRIMARY KEY DEFAULT nextval('assessment_submissions_id_seq'),
    user_id BIGINT REFERENCES _new_users(id) ON DELETE CASCADE,
    assessment_id BIGINT REFERENCES _new_assessments(id) ON DELETE CASCADE,
    score INTEGER,
    correct_count INTEGER,
    total_questions INTEGER,
    time_taken_seconds INTEGER,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO _new_assessment_submissions (id, user_id, assessment_id, score, correct_count, total_questions, time_taken_seconds, submitted_at)
SELECT m.new_id, um.new_id, am.new_id, asub.score, asub.correct_count, asub.total_questions, asub.time_taken_seconds, asub.submitted_at
FROM assessment_submissions asub
JOIN _migration_assessment_submissions_map m ON asub.id = m.old_uuid
JOIN _migration_users_map um ON asub.user_id = um.old_uuid
JOIN _migration_assessments_map am ON asub.assessment_id = am.old_uuid;

-- Create new assessment_answers table
CREATE TABLE _new_assessment_answers (
    id BIGINT PRIMARY KEY DEFAULT nextval('assessment_answers_id_seq'),
    submission_id BIGINT REFERENCES _new_assessment_submissions(id) ON DELETE CASCADE,
    question_id BIGINT REFERENCES _new_assessment_questions(id) ON DELETE CASCADE,
    selected_index INTEGER NOT NULL,
    is_correct BOOLEAN NOT NULL
);

INSERT INTO _new_assessment_answers (id, submission_id, question_id, selected_index, is_correct)
SELECT m.new_id, sm.new_id, qm.new_id, aa.selected_index, aa.is_correct
FROM assessment_answers aa
JOIN _migration_assessment_answers_map m ON aa.id = m.old_uuid
JOIN _migration_assessment_submissions_map sm ON aa.submission_id = sm.old_uuid
JOIN _migration_assessment_questions_map qm ON aa.question_id = qm.old_uuid;

-- Create new resources table
CREATE TABLE _new_resources (
    id BIGINT PRIMARY KEY DEFAULT nextval('resources_id_seq'),
    subject_id BIGINT REFERENCES _new_subjects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    kind VARCHAR(50) NOT NULL,
    size VARCHAR(50),
    duration VARCHAR(50),
    download_url TEXT,
    view_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO _new_resources (id, subject_id, title, kind, size, duration, download_url, view_url, created_at)
SELECT m.new_id, sm.new_id, r.title, r.kind, r.size, r.duration, r.download_url, r.view_url, r.created_at
FROM resources r
JOIN _migration_resources_map m ON r.id = m.old_uuid
JOIN _migration_subjects_map sm ON r.subject_id = sm.old_uuid;

-- Create new resource_views table
CREATE TABLE _new_resource_views (
    id BIGINT PRIMARY KEY DEFAULT nextval('resource_views_id_seq'),
    user_id BIGINT REFERENCES _new_users(id) ON DELETE CASCADE,
    resource_id BIGINT REFERENCES _new_resources(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    progress INTEGER DEFAULT 0
);

INSERT INTO _new_resource_views (id, user_id, resource_id, viewed_at, progress)
SELECT m.new_id, um.new_id, rm.new_id, rv.viewed_at, rv.progress
FROM resource_views rv
JOIN _migration_resource_views_map m ON rv.id = m.old_uuid
JOIN _migration_users_map um ON rv.user_id = um.old_uuid
JOIN _migration_resources_map rm ON rv.resource_id = rm.old_uuid;

-- Create new resource_requests table
CREATE TABLE _new_resource_requests (
    id BIGINT PRIMARY KEY DEFAULT nextval('resource_requests_id_seq'),
    user_id BIGINT REFERENCES _new_users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO _new_resource_requests (id, user_id, title, subject, description, created_at)
SELECT m.new_id, um.new_id, rr.title, rr.subject, rr.description, rr.created_at
FROM resource_requests rr
JOIN _migration_resource_requests_map m ON rr.id = m.old_uuid
JOIN _migration_users_map um ON rr.user_id = um.old_uuid;

-- Create new events table
CREATE TABLE _new_events (
    id BIGINT PRIMARY KEY DEFAULT nextval('events_id_seq'),
    user_id BIGINT REFERENCES _new_users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    type VARCHAR(50) NOT NULL,
    location TEXT,
    description TEXT,
    color_class VARCHAR(50)
);

INSERT INTO _new_events (id, user_id, title, start_time, end_time, type, location, description, color_class)
SELECT m.new_id, um.new_id, e.title, e.start_time, e.end_time, e.type, e.location, e.description, e.color_class
FROM events e
JOIN _migration_events_map m ON e.id = m.old_uuid
JOIN _migration_users_map um ON e.user_id = um.old_uuid;

-- Create new user_settings table
CREATE TABLE _new_user_settings (
    user_id BIGINT PRIMARY KEY REFERENCES _new_users(id) ON DELETE CASCADE,
    theme VARCHAR(20) DEFAULT 'system',
    font_size VARCHAR(10) DEFAULT 'md',
    high_contrast BOOLEAN DEFAULT false,
    language VARCHAR(10) DEFAULT 'en',
    notifications JSONB DEFAULT '{"email": true, "push": true, "sms": false}'::JSONB,
    school VARCHAR(255),
    goals TEXT
);

INSERT INTO _new_user_settings (user_id, theme, font_size, high_contrast, language, notifications, school, goals)
SELECT um.new_id, us.theme, us.font_size, us.high_contrast, us.language, us.notifications, us.school, us.goals
FROM user_settings us
JOIN _migration_users_map um ON us.user_id = um.old_uuid;

-- Create new sessions table
CREATE TABLE _new_sessions (
    id BIGINT PRIMARY KEY DEFAULT nextval('sessions_id_seq'),
    user_id BIGINT REFERENCES _new_users(id) ON DELETE CASCADE,
    device VARCHAR(255),
    location VARCHAR(255),
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO _new_sessions (id, user_id, device, location, last_active)
SELECT m.new_id, um.new_id, s.device, s.location, s.last_active
FROM sessions s
JOIN _migration_sessions_map m ON s.id = m.old_uuid
JOIN _migration_users_map um ON s.user_id = um.old_uuid;

-- Create new messages table
CREATE TABLE _new_messages (
    id BIGINT PRIMARY KEY DEFAULT nextval('messages_id_seq'),
    sender_id BIGINT REFERENCES _new_users(id) ON DELETE CASCADE,
    recipient_id BIGINT REFERENCES _new_users(id) ON DELETE CASCADE,
    course_slug VARCHAR(255),
    subject VARCHAR(255),
    body TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO _new_messages (id, sender_id, recipient_id, course_slug, subject, body, created_at)
SELECT m.new_id, sm.new_id, rm.new_id, msg.course_slug, msg.subject, msg.body, msg.created_at
FROM messages msg
JOIN _migration_messages_map m ON msg.id = m.old_uuid
JOIN _migration_users_map sm ON msg.sender_id = sm.old_uuid
JOIN _migration_users_map rm ON msg.recipient_id = rm.old_uuid;

-- =============================================
-- Step 5: Drop old tables and rename new tables
-- =============================================

-- Drop old tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS resource_requests CASCADE;
DROP TABLE IF EXISTS resource_views CASCADE;
DROP TABLE IF EXISTS resources CASCADE;
DROP TABLE IF EXISTS assessment_answers CASCADE;
DROP TABLE IF EXISTS assessment_submissions CASCADE;
DROP TABLE IF EXISTS assessment_questions CASCADE;
DROP TABLE IF EXISTS assessments CASCADE;
DROP TABLE IF EXISTS discussions CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS video_progress CASCADE;
DROP TABLE IF EXISTS assignment_submissions CASCADE;
DROP TABLE IF EXISTS user_answers CASCADE;
DROP TABLE IF EXISTS quiz_submissions CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;
DROP TABLE IF EXISTS pdfs CASCADE;
DROP TABLE IF EXISTS videos CASCADE;
DROP TABLE IF EXISTS lesson_completion CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS modules CASCADE;
DROP TABLE IF EXISTS student_profiles CASCADE;
DROP TABLE IF EXISTS parent_student_links CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Rename new tables
ALTER TABLE _new_users RENAME TO users;
ALTER TABLE _new_subjects RENAME TO subjects;
ALTER TABLE _new_modules RENAME TO modules;
ALTER TABLE _new_lessons RENAME TO lessons;
ALTER TABLE _new_parent_student_links RENAME TO parent_student_links;
ALTER TABLE _new_student_profiles RENAME TO student_profiles;
ALTER TABLE _new_lesson_completion RENAME TO lesson_completion;
ALTER TABLE _new_videos RENAME TO videos;
ALTER TABLE _new_pdfs RENAME TO pdfs;
ALTER TABLE _new_quizzes RENAME TO quizzes;
ALTER TABLE _new_questions RENAME TO questions;
ALTER TABLE _new_quiz_submissions RENAME TO quiz_submissions;
ALTER TABLE _new_user_answers RENAME TO user_answers;
ALTER TABLE _new_assignments RENAME TO assignments;
ALTER TABLE _new_assignment_submissions RENAME TO assignment_submissions;
ALTER TABLE _new_video_progress RENAME TO video_progress;
ALTER TABLE _new_notifications RENAME TO notifications;
ALTER TABLE _new_discussions RENAME TO discussions;
ALTER TABLE _new_assessments RENAME TO assessments;
ALTER TABLE _new_assessment_questions RENAME TO assessment_questions;
ALTER TABLE _new_assessment_submissions RENAME TO assessment_submissions;
ALTER TABLE _new_assessment_answers RENAME TO assessment_answers;
ALTER TABLE _new_resources RENAME TO resources;
ALTER TABLE _new_resource_views RENAME TO resource_views;
ALTER TABLE _new_resource_requests RENAME TO resource_requests;
ALTER TABLE _new_events RENAME TO events;
ALTER TABLE _new_user_settings RENAME TO user_settings;
ALTER TABLE _new_sessions RENAME TO sessions;
ALTER TABLE _new_messages RENAME TO messages;

-- =============================================
-- Step 6: Update sequences to use correct starting values
-- =============================================

SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 0) + 1);
SELECT setval('subjects_id_seq', COALESCE((SELECT MAX(id) FROM subjects), 0) + 1);
SELECT setval('modules_id_seq', COALESCE((SELECT MAX(id) FROM modules), 0) + 1);
SELECT setval('lessons_id_seq', COALESCE((SELECT MAX(id) FROM lessons), 0) + 1);
SELECT setval('quizzes_id_seq', COALESCE((SELECT MAX(id) FROM quizzes), 0) + 1);
SELECT setval('questions_id_seq', COALESCE((SELECT MAX(id) FROM questions), 0) + 1);
SELECT setval('assignments_id_seq', COALESCE((SELECT MAX(id) FROM assignments), 0) + 1);
SELECT setval('videos_id_seq', COALESCE((SELECT MAX(id) FROM videos), 0) + 1);
SELECT setval('pdfs_id_seq', COALESCE((SELECT MAX(id) FROM pdfs), 0) + 1);
SELECT setval('assessments_id_seq', COALESCE((SELECT MAX(id) FROM assessments), 0) + 1);
SELECT setval('assessment_questions_id_seq', COALESCE((SELECT MAX(id) FROM assessment_questions), 0) + 1);
SELECT setval('resources_id_seq', COALESCE((SELECT MAX(id) FROM resources), 0) + 1);
SELECT setval('notifications_id_seq', COALESCE((SELECT MAX(id) FROM notifications), 0) + 1);
SELECT setval('discussions_id_seq', COALESCE((SELECT MAX(id) FROM discussions), 0) + 1);
SELECT setval('events_id_seq', COALESCE((SELECT MAX(id) FROM events), 0) + 1);
SELECT setval('sessions_id_seq', COALESCE((SELECT MAX(id) FROM sessions), 0) + 1);
SELECT setval('messages_id_seq', COALESCE((SELECT MAX(id) FROM messages), 0) + 1);
SELECT setval('parent_student_links_id_seq', COALESCE((SELECT MAX(id) FROM parent_student_links), 0) + 1);
SELECT setval('student_profiles_id_seq', COALESCE((SELECT MAX(id) FROM student_profiles), 0) + 1);
SELECT setval('lesson_completion_id_seq', COALESCE((SELECT MAX(id) FROM lesson_completion), 0) + 1);
SELECT setval('quiz_submissions_id_seq', COALESCE((SELECT MAX(id) FROM quiz_submissions), 0) + 1);
SELECT setval('user_answers_id_seq', COALESCE((SELECT MAX(id) FROM user_answers), 0) + 1);
SELECT setval('assignment_submissions_id_seq', COALESCE((SELECT MAX(id) FROM assignment_submissions), 0) + 1);
SELECT setval('video_progress_id_seq', COALESCE((SELECT MAX(id) FROM video_progress), 0) + 1);
SELECT setval('assessment_submissions_id_seq', COALESCE((SELECT MAX(id) FROM assessment_submissions), 0) + 1);
SELECT setval('assessment_answers_id_seq', COALESCE((SELECT MAX(id) FROM assessment_answers), 0) + 1);
SELECT setval('resource_views_id_seq', COALESCE((SELECT MAX(id) FROM resource_views), 0) + 1);
SELECT setval('resource_requests_id_seq', COALESCE((SELECT MAX(id) FROM resource_requests), 0) + 1);

-- =============================================
-- Step 7: Alter tables to use BIGSERIAL (auto-increment) instead of BIGINT
-- =============================================

-- Alter users table
ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');
ALTER SEQUENCE users_id_seq OWNED BY users.id;

-- Alter subjects table
ALTER TABLE subjects ALTER COLUMN id SET DEFAULT nextval('subjects_id_seq');
ALTER SEQUENCE subjects_id_seq OWNED BY subjects.id;

-- Alter modules table
ALTER TABLE modules ALTER COLUMN id SET DEFAULT nextval('modules_id_seq');
ALTER SEQUENCE modules_id_seq OWNED BY modules.id;

-- Alter lessons table
ALTER TABLE lessons ALTER COLUMN id SET DEFAULT nextval('lessons_id_seq');
ALTER SEQUENCE lessons_id_seq OWNED BY lessons.id;

-- Alter parent_student_links table
ALTER TABLE parent_student_links ALTER COLUMN id SET DEFAULT nextval('parent_student_links_id_seq');
ALTER SEQUENCE parent_student_links_id_seq OWNED BY parent_student_links.id;

-- Alter student_profiles table
ALTER TABLE student_profiles ALTER COLUMN id SET DEFAULT nextval('student_profiles_id_seq');
ALTER SEQUENCE student_profiles_id_seq OWNED BY student_profiles.id;

-- Alter lesson_completion table
ALTER TABLE lesson_completion ALTER COLUMN id SET DEFAULT nextval('lesson_completion_id_seq');
ALTER SEQUENCE lesson_completion_id_seq OWNED BY lesson_completion.id;

-- Alter videos table
ALTER TABLE videos ALTER COLUMN id SET DEFAULT nextval('videos_id_seq');
ALTER SEQUENCE videos_id_seq OWNED BY videos.id;

-- Alter pdfs table
ALTER TABLE pdfs ALTER COLUMN id SET DEFAULT nextval('pdfs_id_seq');
ALTER SEQUENCE pdfs_id_seq OWNED BY pdfs.id;

-- Alter quizzes table
ALTER TABLE quizzes ALTER COLUMN id SET DEFAULT nextval('quizzes_id_seq');
ALTER SEQUENCE quizzes_id_seq OWNED BY quizzes.id;

-- Alter questions table
ALTER TABLE questions ALTER COLUMN id SET DEFAULT nextval('questions_id_seq');
ALTER SEQUENCE questions_id_seq OWNED BY questions.id;

-- Alter quiz_submissions table
ALTER TABLE quiz_submissions ALTER COLUMN id SET DEFAULT nextval('quiz_submissions_id_seq');
ALTER SEQUENCE quiz_submissions_id_seq OWNED BY quiz_submissions.id;

-- Alter user_answers table
ALTER TABLE user_answers ALTER COLUMN id SET DEFAULT nextval('user_answers_id_seq');
ALTER SEQUENCE user_answers_id_seq OWNED BY user_answers.id;

-- Alter assignments table
ALTER TABLE assignments ALTER COLUMN id SET DEFAULT nextval('assignments_id_seq');
ALTER SEQUENCE assignments_id_seq OWNED BY assignments.id;

-- Alter assignment_submissions table
ALTER TABLE assignment_submissions ALTER COLUMN id SET DEFAULT nextval('assignment_submissions_id_seq');
ALTER SEQUENCE assignment_submissions_id_seq OWNED BY assignment_submissions.id;

-- Alter video_progress table
ALTER TABLE video_progress ALTER COLUMN id SET DEFAULT nextval('video_progress_id_seq');
ALTER SEQUENCE video_progress_id_seq OWNED BY video_progress.id;

-- Alter notifications table
ALTER TABLE notifications ALTER COLUMN id SET DEFAULT nextval('notifications_id_seq');
ALTER SEQUENCE notifications_id_seq OWNED BY notifications.id;

-- Alter discussions table
ALTER TABLE discussions ALTER COLUMN id SET DEFAULT nextval('discussions_id_seq');
ALTER SEQUENCE discussions_id_seq OWNED BY discussions.id;

-- Alter assessments table
ALTER TABLE assessments ALTER COLUMN id SET DEFAULT nextval('assessments_id_seq');
ALTER SEQUENCE assessments_id_seq OWNED BY assessments.id;

-- Alter assessment_questions table
ALTER TABLE assessment_questions ALTER COLUMN id SET DEFAULT nextval('assessment_questions_id_seq');
ALTER SEQUENCE assessment_questions_id_seq OWNED BY assessment_questions.id;

-- Alter assessment_submissions table
ALTER TABLE assessment_submissions ALTER COLUMN id SET DEFAULT nextval('assessment_submissions_id_seq');
ALTER SEQUENCE assessment_submissions_id_seq OWNED BY assessment_submissions.id;

-- Alter assessment_answers table
ALTER TABLE assessment_answers ALTER COLUMN id SET DEFAULT nextval('assessment_answers_id_seq');
ALTER SEQUENCE assessment_answers_id_seq OWNED BY assessment_answers.id;

-- Alter resources table
ALTER TABLE resources ALTER COLUMN id SET DEFAULT nextval('resources_id_seq');
ALTER SEQUENCE resources_id_seq OWNED BY resources.id;

-- Alter resource_views table
ALTER TABLE resource_views ALTER COLUMN id SET DEFAULT nextval('resource_views_id_seq');
ALTER SEQUENCE resource_views_id_seq OWNED BY resource_views.id;

-- Alter resource_requests table
ALTER TABLE resource_requests ALTER COLUMN id SET DEFAULT nextval('resource_requests_id_seq');
ALTER SEQUENCE resource_requests_id_seq OWNED BY resource_requests.id;

-- Alter events table
ALTER TABLE events ALTER COLUMN id SET DEFAULT nextval('events_id_seq');
ALTER SEQUENCE events_id_seq OWNED BY events.id;

-- Alter sessions table
ALTER TABLE sessions ALTER COLUMN id SET DEFAULT nextval('sessions_id_seq');
ALTER SEQUENCE sessions_id_seq OWNED BY sessions.id;

-- Alter messages table
ALTER TABLE messages ALTER COLUMN id SET DEFAULT nextval('messages_id_seq');
ALTER SEQUENCE messages_id_seq OWNED BY messages.id;

-- =============================================
-- Step 8: Clean up mapping tables
-- =============================================

DROP TABLE IF EXISTS _migration_users_map CASCADE;
DROP TABLE IF EXISTS _migration_subjects_map CASCADE;
DROP TABLE IF EXISTS _migration_modules_map CASCADE;
DROP TABLE IF EXISTS _migration_lessons_map CASCADE;
DROP TABLE IF EXISTS _migration_quizzes_map CASCADE;
DROP TABLE IF EXISTS _migration_questions_map CASCADE;
DROP TABLE IF EXISTS _migration_assignments_map CASCADE;
DROP TABLE IF EXISTS _migration_videos_map CASCADE;
DROP TABLE IF EXISTS _migration_pdfs_map CASCADE;
DROP TABLE IF EXISTS _migration_assessments_map CASCADE;
DROP TABLE IF EXISTS _migration_assessment_questions_map CASCADE;
DROP TABLE IF EXISTS _migration_resources_map CASCADE;
DROP TABLE IF EXISTS _migration_notifications_map CASCADE;
DROP TABLE IF EXISTS _migration_discussions_map CASCADE;
DROP TABLE IF EXISTS _migration_events_map CASCADE;
DROP TABLE IF EXISTS _migration_sessions_map CASCADE;
DROP TABLE IF EXISTS _migration_messages_map CASCADE;
DROP TABLE IF EXISTS _migration_parent_student_links_map CASCADE;
DROP TABLE IF EXISTS _migration_student_profiles_map CASCADE;
DROP TABLE IF EXISTS _migration_lesson_completion_map CASCADE;
DROP TABLE IF EXISTS _migration_quiz_submissions_map CASCADE;
DROP TABLE IF EXISTS _migration_user_answers_map CASCADE;
DROP TABLE IF EXISTS _migration_assignment_submissions_map CASCADE;
DROP TABLE IF EXISTS _migration_video_progress_map CASCADE;
DROP TABLE IF EXISTS _migration_assessment_submissions_map CASCADE;
DROP TABLE IF EXISTS _migration_assessment_answers_map CASCADE;
DROP TABLE IF EXISTS _migration_resource_views_map CASCADE;
DROP TABLE IF EXISTS _migration_resource_requests_map CASCADE;

-- Commit transaction
COMMIT;

-- =============================================
-- Migration Complete!
-- =============================================
-- All tables have been converted from UUID to BIGSERIAL
-- Foreign key relationships have been preserved
-- Data has been migrated successfully
