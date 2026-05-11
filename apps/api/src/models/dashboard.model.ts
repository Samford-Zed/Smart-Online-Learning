import { pool } from '../db/index';

export const getProgressOverview = async (userId: number) => {
  const result = await pool.query(`
    SELECT 
      COALESCE(AVG(CASE WHEN is_completed = true THEN 100 ELSE 0 END), 0) as overall_percent
    FROM lesson_completion
    WHERE user_id = $1
  `, [userId]);

  const overallPercent = Math.round(result.rows[0].overall_percent);

  // Example segments based on categories or progress
  const segments = [
    { label: "Lessons", percent: overallPercent, color: "#4F46E5" },
    { label: "Quizzes", percent: 0, color: "#10B981" }, // Placeholder for now
    { label: "Assignments", percent: 0, color: "#F59E0B" } // Placeholder for now
  ];

  return {
    overallPercent,
    segments
  };
};

export const getCurrentCourses = async (userId: number) => {
  const result = await pool.query(`
    SELECT 
      s.id,
      s.slug,
      s.name as title,
      s.name as subject,
      s.instructor,
      COALESCE(
        (SELECT COUNT(*)::float / NULLIF((SELECT COUNT(*) FROM lessons WHERE subject_id = s.id), 0) * 100 
         FROM lesson_completion lc 
         JOIN lessons l ON lc.lesson_id = l.id
         WHERE lc.user_id = $1 AND l.subject_id = s.id AND lc.is_completed = true), 0
      ) as progress,
      (SELECT title FROM lessons WHERE subject_id = s.id AND id NOT IN (SELECT lesson_id FROM lesson_completion WHERE user_id = $1 AND is_completed = true) ORDER BY order_no ASC LIMIT 1) as "nextLesson"
    FROM subjects s
    LIMIT 3
  `, [userId]);
  return result.rows.map(row => ({
    ...row,
    progress: Math.round(row.progress)
  }));
};

export const getUpcomingTasks = async (userId: number) => {
  const assignmentsRes = await pool.query(`
    SELECT 
      a.id,
      a.title,
      s.name as subject,
      TO_CHAR(a.due_date, 'Mon DD, YYYY') as "dueLabel",
      'assignment' as type,
      CASE WHEN asub.id IS NULL THEN 'pending' ELSE 'in-progress' END as status
    FROM assignments a
    JOIN lessons l ON a.lesson_id = l.id
    JOIN subjects s ON l.subject_id = s.id
    LEFT JOIN assignment_submissions asub ON a.id = asub.assignment_id AND asub.user_id = $1
    WHERE a.due_date > NOW() AND (asub.status IS NULL OR asub.status = 'pending')
    ORDER BY a.due_date ASC
  `, [userId]);

  const quizzesRes = await pool.query(`
    SELECT 
      q.id,
      q.title,
      s.name as subject,
      'Today' as "dueLabel",
      'quiz' as type,
      'pending' as status
    FROM quizzes q
    JOIN lessons l ON q.lesson_id = l.id
    JOIN subjects s ON l.subject_id = s.id
    LEFT JOIN quiz_submissions qs ON q.id = qs.quiz_id AND qs.user_id = $1
    WHERE qs.id IS NULL
  `, [userId]);

  return [...assignmentsRes.rows, ...quizzesRes.rows];
};

export const getProgressSummary = async (userId: number) => {
  const result = await pool.query(`
    SELECT 
      COALESCE(AVG(CASE WHEN is_completed = true THEN 100 ELSE 0 END), 0) as overall_percent,
      COUNT(CASE WHEN is_completed = true THEN 1 END) as completed_lessons,
      COUNT(*) as total_lessons
    FROM lesson_completion lc
    JOIN lessons l ON lc.lesson_id = l.id
    WHERE lc.user_id = $1
  `, [userId]);

  const row = result.rows[0];
  return {
    overallPercent: Math.round(row.overall_percent),
    completedLessons: parseInt(row.completed_lessons) || 0,
    totalLessons: parseInt(row.total_lessons) || 0
  };
};

export const getProfile = async (userId: number) => {
  const userRes = await pool.query(`
    SELECT id, full_name as "fullName", email, role, grade_level as "gradeLevel"
    FROM users
    WHERE id = $1
  `, [userId]);

  if (userRes.rows.length === 0) return null;

  const profileRes = await pool.query(`
    SELECT student_info, school_preference
    FROM student_profiles
    WHERE user_id = $1
  `, [userId]);

  const user = userRes.rows[0];
  const profile = profileRes.rows[0];

  return {
    ...user,
    studentInfo: profile?.student_info || {},
    schoolPreference: profile?.school_preference || {}
  };
};

export const updateProfile = async (userId: number, studentInfo: any, schoolPreference: any) => {
  await pool.query(`
    INSERT INTO student_profiles (user_id, student_info, school_preference)
    VALUES ($1, $2, $3)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      student_info = COALESCE($2, student_profiles.student_info),
      school_preference = COALESCE($3, student_profiles.school_preference)
  `, [userId, JSON.stringify(studentInfo), JSON.stringify(schoolPreference)]);

  return getProfile(userId);
};

export const getRecentActivity = async (userId: number) => {
  const result = await pool.query(`
    SELECT 
      'lesson_completed' as type,
      l.title as "itemTitle",
      s.name as "subjectName",
      lc.completed_at as "completedAt"
    FROM lesson_completion lc
    JOIN lessons l ON lc.lesson_id = l.id
    JOIN subjects s ON l.subject_id = s.id
    WHERE lc.user_id = $1 AND lc.is_completed = true
    ORDER BY lc.completed_at DESC
    LIMIT 5
  `, [userId]);
  return result.rows;
};

export const getNotifications = async (userId: number) => {
  const result = await pool.query(`
    SELECT id, message, type, is_read as "isRead", created_at as "createdAt"
    FROM notifications
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT 20
  `, [userId]);
  return result.rows;
};

export const markNotificationRead = async (userId: number, notificationId: number) => {
  const result = await pool.query(`
    UPDATE notifications
    SET is_read = true
    WHERE id = $1 AND user_id = $2
    RETURNING id, message, type, is_read as "isRead", created_at as "createdAt"
  `, [notificationId, userId]);
  return result.rows[0];
};

export const linkParent = async (userId: number, parentEmail: string, parentName: string) => {
  // Check if parent exists
  const parentRes = await pool.query(`
    SELECT id FROM users WHERE email = $1 AND role = 'parent'
  `, [parentEmail]);
  
  const parentId = parentRes.rows[0]?.id;
  
  // Create or update parent-student link
  await pool.query(`
    INSERT INTO parent_student_links (parent_id, student_email, student_id)
    VALUES ($1, $2, $3)
    ON CONFLICT DO NOTHING
  `, [parentId, null, userId]);
  
  return getProfile(userId);
};
