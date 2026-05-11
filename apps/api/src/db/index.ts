import { Pool } from 'pg';

// Pass the raw string. To avoid SSL warnings, you can change 'sslmode=require' to 'sslmode=verify-full' in your .env
const connectionString = process.env.DATABASE_URL;

export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false // Often required for Neon DB
  }
});

// Auto-initialize tables
export const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGSERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        grade_level VARCHAR(50)
      );

      CREATE TABLE IF NOT EXISTS parent_student_links (
        id BIGSERIAL PRIMARY KEY,
        parent_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
        student_email VARCHAR(255) NOT NULL,
        student_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS student_profiles (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
        student_info JSONB,
        parent_info JSONB,
        school_preference JSONB
      );

      CREATE TABLE IF NOT EXISTS subjects (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE,
        description TEXT,
        grade VARCHAR(50) NOT NULL,
        instructor VARCHAR(255)
      );

      CREATE TABLE IF NOT EXISTS modules (
        id BIGSERIAL PRIMARY KEY,
        subject_id BIGINT REFERENCES subjects(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        order_no INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS lessons (
        id BIGSERIAL PRIMARY KEY,
        subject_id BIGINT REFERENCES subjects(id) ON DELETE CASCADE,
        module_id BIGINT REFERENCES modules(id) ON DELETE SET NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        order_no INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS lesson_completion (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
        lesson_id BIGINT REFERENCES lessons(id) ON DELETE CASCADE,
        is_completed BOOLEAN DEFAULT false,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, lesson_id)
      );

      CREATE TABLE IF NOT EXISTS videos (
        id BIGSERIAL PRIMARY KEY,
        lesson_id BIGINT REFERENCES lessons(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        url TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS pdfs (
        id BIGSERIAL PRIMARY KEY,
        lesson_id BIGINT REFERENCES lessons(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        url TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS quizzes (
        id BIGSERIAL PRIMARY KEY,
        lesson_id BIGINT REFERENCES lessons(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        max_attempts INTEGER DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS questions (
        id BIGSERIAL PRIMARY KEY,
        quiz_id BIGINT REFERENCES quizzes(id) ON DELETE CASCADE,
        text TEXT NOT NULL,
        options JSONB NOT NULL,
        correct_option VARCHAR(255) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS quiz_submissions (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
        quiz_id BIGINT REFERENCES quizzes(id) ON DELETE CASCADE,
        score INTEGER NOT NULL,
        total_questions INTEGER NOT NULL,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_answers (
        id BIGSERIAL PRIMARY KEY,
        submission_id BIGINT REFERENCES quiz_submissions(id) ON DELETE CASCADE,
        question_id BIGINT REFERENCES questions(id) ON DELETE CASCADE,
        selected_option VARCHAR(255) NOT NULL,
        is_correct BOOLEAN NOT NULL
      );

      CREATE TABLE IF NOT EXISTS assignments (
        id BIGSERIAL PRIMARY KEY,
        lesson_id BIGINT REFERENCES lessons(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        requirements TEXT[],
        due_date TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS assignment_submissions (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
        assignment_id BIGINT REFERENCES assignments(id) ON DELETE CASCADE,
        file_url TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        score INTEGER,
        feedback TEXT,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS video_progress (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
        video_id BIGINT REFERENCES videos(id) ON DELETE CASCADE,
        watched_duration INTEGER DEFAULT 0,
        is_completed BOOLEAN DEFAULT false,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, video_id)
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS assessments (
        id BIGSERIAL PRIMARY KEY,
        subject_id BIGINT REFERENCES subjects(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        duration_minutes INTEGER NOT NULL,
        scheduled_for TIMESTAMP NOT NULL,
        instructions TEXT,
        status VARCHAR(50) DEFAULT 'upcoming'
      );

      CREATE TABLE IF NOT EXISTS assessment_questions (
        id BIGSERIAL PRIMARY KEY,
        assessment_id BIGINT REFERENCES assessments(id) ON DELETE CASCADE,
        prompt TEXT NOT NULL,
        options JSONB NOT NULL,
        correct_index INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS assessment_submissions (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
        assessment_id BIGINT REFERENCES assessments(id) ON DELETE CASCADE,
        score INTEGER,
        correct_count INTEGER,
        total_questions INTEGER,
        time_taken_seconds INTEGER,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS assessment_answers (
        id BIGSERIAL PRIMARY KEY,
        submission_id BIGINT REFERENCES assessment_submissions(id) ON DELETE CASCADE,
        question_id BIGINT REFERENCES assessment_questions(id) ON DELETE CASCADE,
        selected_index INTEGER NOT NULL,
        is_correct BOOLEAN NOT NULL
      );

      CREATE TABLE IF NOT EXISTS resources (
        id BIGSERIAL PRIMARY KEY,
        subject_id BIGINT REFERENCES subjects(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        kind VARCHAR(50) NOT NULL,
        size VARCHAR(50),
        duration VARCHAR(50),
        download_url TEXT,
        view_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS resource_views (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
        resource_id BIGINT REFERENCES resources(id) ON DELETE CASCADE,
        viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        progress INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS resource_requests (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS events (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        type VARCHAR(50) NOT NULL,
        location TEXT,
        description TEXT,
        color_class VARCHAR(50)
      );

      CREATE TABLE IF NOT EXISTS user_settings (
        user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        theme VARCHAR(20) DEFAULT 'system',
        font_size VARCHAR(10) DEFAULT 'md',
        high_contrast BOOLEAN DEFAULT false,
        language VARCHAR(10) DEFAULT 'en',
        notifications JSONB DEFAULT '{"email": true, "push": true, "sms": false}'::JSONB,
        school VARCHAR(255),
        goals TEXT
      );

      CREATE TABLE IF NOT EXISTS sessions (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
        device VARCHAR(255),
        location VARCHAR(255),
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS messages (
        id BIGSERIAL PRIMARY KEY,
        sender_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
        recipient_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
        course_slug VARCHAR(255),
        subject VARCHAR(255),
        body TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        type VARCHAR(50),
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS discussions (
        id BIGSERIAL PRIMARY KEY,
        lesson_id BIGINT REFERENCES lessons(id) ON DELETE CASCADE,
        user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Migrations for existing tables
      DO $$
      BEGIN
        -- Add grade_level to users
        BEGIN
          ALTER TABLE users ADD COLUMN grade_level VARCHAR(50);
        EXCEPTION
          WHEN duplicate_column THEN null;
        END;

        -- Add full_name to users
        BEGIN
          ALTER TABLE users ADD COLUMN full_name VARCHAR(255);
        EXCEPTION
          WHEN duplicate_column THEN null;
        END;

        -- Add slug to subjects
        BEGIN
          ALTER TABLE subjects ADD COLUMN slug VARCHAR(255) UNIQUE;
        EXCEPTION
          WHEN duplicate_column THEN null;
        END;

        -- Add instructor to subjects
        BEGIN
          ALTER TABLE subjects ADD COLUMN instructor VARCHAR(255);
        EXCEPTION
          WHEN duplicate_column THEN null;
        END;

        -- Add module_id to lessons
        BEGIN
          ALTER TABLE lessons ADD COLUMN module_id BIGINT REFERENCES modules(id) ON DELETE SET NULL;
        EXCEPTION
          WHEN duplicate_column THEN null;
        END;

        -- Add status to assignment_submissions
        BEGIN
          ALTER TABLE assignment_submissions ADD COLUMN status VARCHAR(50) DEFAULT 'pending';
        EXCEPTION
          WHEN duplicate_column THEN null;
        END;

        -- Add score to assignment_submissions
        BEGIN
          ALTER TABLE assignment_submissions ADD COLUMN score INTEGER;
        EXCEPTION
          WHEN duplicate_column THEN null;
        END;

        -- Add feedback to assignment_submissions
        BEGIN
          ALTER TABLE assignment_submissions ADD COLUMN feedback TEXT;
        EXCEPTION
          WHEN duplicate_column THEN null;
        END;

        -- Add requirements to assignments
        BEGIN
          ALTER TABLE assignments ADD COLUMN requirements TEXT[];
        EXCEPTION
          WHEN duplicate_column THEN null;
        END;

        -- Add type to notifications
        BEGIN
          ALTER TABLE notifications ADD COLUMN type VARCHAR(50);
        EXCEPTION
          WHEN duplicate_column THEN null;
        END;

        -- Phase 3 Migrations
        BEGIN
          CREATE TABLE IF NOT EXISTS user_settings (
            user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
            theme VARCHAR(20) DEFAULT 'system',
            font_size VARCHAR(10) DEFAULT 'md',
            high_contrast BOOLEAN DEFAULT false,
            language VARCHAR(10) DEFAULT 'en',
            notifications JSONB DEFAULT '{"email": true, "push": true, "sms": false}'::JSONB,
            school VARCHAR(255),
            goals TEXT
          );
        EXCEPTION
          WHEN others THEN null;
        END;

        BEGIN
          CREATE TABLE IF NOT EXISTS sessions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            device VARCHAR(255),
            location VARCHAR(255),
            last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        EXCEPTION
          WHEN others THEN null;
        END;

        BEGIN
          CREATE TABLE IF NOT EXISTS messages (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
            recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
            course_slug VARCHAR(255),
            subject VARCHAR(255),
            body TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        EXCEPTION
          WHEN others THEN null;
        END;

        BEGIN
          CREATE TABLE IF NOT EXISTS notifications (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            message TEXT NOT NULL,
            type VARCHAR(50),
            is_read BOOLEAN DEFAULT false,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        EXCEPTION
          WHEN others THEN null;
        END;

        BEGIN
          CREATE TABLE IF NOT EXISTS discussions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        EXCEPTION
          WHEN others THEN null;
        END;
      END $$;
    `);
    console.log("Database initialized successfully!");
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }
};

// initDb();
