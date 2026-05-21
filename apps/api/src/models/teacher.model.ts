import { pool } from '../db/index';

// 1. Get classes/subjects assigned to the teacher with real average progress
export const getTeacherClasses = async (teacherId: number) => {
  const res = await pool.query(`
    WITH student_lessons AS (
      SELECT subject_id, COUNT(id) as total_lessons
      FROM lessons
      GROUP BY subject_id
    ),
    student_completions AS (
      SELECT 
        l.subject_id,
        lc.user_id,
        COUNT(lc.id) as completed_lessons
      FROM lessons l
      JOIN lesson_completion lc ON l.id = lc.lesson_id
      WHERE lc.is_completed = true
      GROUP BY l.subject_id, lc.user_id
    ),
    student_progress AS (
      SELECT 
        u.id as student_id,
        s.id as subject_id,
        COALESCE(
          ROUND((COALESCE(sc.completed_lessons, 0) * 100.0) / NULLIF(sl.total_lessons, 0)),
          0
        ) as progress
      FROM users u
      JOIN subjects s ON s.grade = u.grade_level
      LEFT JOIN student_lessons sl ON sl.subject_id = s.id
      LEFT JOIN student_completions sc ON sc.subject_id = s.id AND sc.user_id = u.id
      WHERE u.role = 'student'
    )
    SELECT 
      s.id, 
      s.slug, 
      s.name, 
      s.grade,
      s.description,
      (SELECT COUNT(DISTINCT sp.user_id) 
       FROM student_profiles sp
       JOIN users u ON sp.user_id = u.id AND u.grade_level = s.grade) as "studentCount",
      COALESCE(
        ROUND(AVG(sp.progress)),
        0
      )::int as "progress"
    FROM subjects s
    JOIN teacher_subjects ts ON s.id = ts.subject_id
    LEFT JOIN student_progress sp ON sp.subject_id = s.id
    WHERE ts.teacher_id = $1
    GROUP BY s.id
  `, [teacherId]);
  return res.rows;
};

// 2. Get single class details
export const getClassDetails = async (slug: string) => {
  const res = await pool.query(`
    SELECT id, slug, name, grade, description, instructor
    FROM subjects
    WHERE slug = $1
  `, [slug]);
  return res.rows[0] || null;
};

// 3. Get students in a specific class with real calculated progress and grade
export const getClassStudents = async (slug: string) => {
  const result = await pool.query(`
    WITH student_scores AS (
      SELECT 
        qs.user_id,
        s.id as subject_id,
        (qs.score::float / qs.total_questions * 100) as percentage
      FROM quiz_submissions qs
      JOIN quizzes q ON qs.quiz_id = q.id
      JOIN lessons l ON q.lesson_id = l.id
      JOIN subjects s ON l.subject_id = s.id
      
      UNION ALL
      
      SELECT 
        asub.user_id,
        s.id as subject_id,
        asub.score::float as percentage
      FROM assignment_submissions asub
      JOIN assignments a ON asub.assignment_id = a.id
      JOIN lessons l ON a.lesson_id = l.id
      JOIN subjects s ON l.subject_id = s.id
      WHERE asub.status = 'graded'
    ),
    student_grades AS (
      SELECT 
        user_id,
        subject_id,
        AVG(percentage) as avg_score,
        CASE 
          WHEN AVG(percentage) >= 90 THEN 'A'
          WHEN AVG(percentage) >= 80 THEN 'B'
          WHEN AVG(percentage) >= 70 THEN 'C'
          WHEN AVG(percentage) >= 60 THEN 'D'
          ELSE 'F'
        END as grade
      FROM student_scores
      GROUP BY user_id, subject_id
    )
    SELECT 
      u.id, 
      u.full_name as name, 
      u.email,
      COALESCE(
        (
          SELECT ROUND((COUNT(lc.id) * 100.0) / NULLIF(COUNT(l.id), 0))
          FROM lessons l
          LEFT JOIN lesson_completion lc ON l.id = lc.lesson_id AND lc.user_id = u.id AND lc.is_completed = true
          WHERE l.subject_id = s.id
        ), 
        0
      )::int as progress,
      COALESCE(
        (SELECT last_active FROM sessions WHERE user_id = u.id ORDER BY last_active DESC LIMIT 1),
        NULL
      ) as "lastActive",
      COALESCE(sg.grade, 'N/A') as "overallGrade"
    FROM users u
    JOIN subjects s ON s.grade = u.grade_level
    LEFT JOIN student_grades sg ON sg.user_id = u.id AND sg.subject_id = s.id
    WHERE s.slug = $1 AND u.role = 'student'
  `, [slug]);
  return result.rows;
};

// 4. Get lessons in a class
export const getClassLessons = async (slug: string) => {
  const res = await pool.query(`
    SELECT l.*, m.title as "moduleTitle"
    FROM lessons l
    JOIN subjects s ON l.subject_id = s.id
    LEFT JOIN modules m ON l.module_id = m.id
    WHERE s.slug = $1
    ORDER BY l.order_no ASC
  `, [slug]);
  return res.rows;
};

// 5. Get assignments in a class with submission counts
export const getClassAssignments = async (slug: string) => {
  const res = await pool.query(`
    SELECT a.*, l.title as "lessonTitle",
      (SELECT COUNT(*)::int FROM assignment_submissions WHERE assignment_id = a.id) as "submissionCount",
      (SELECT COUNT(*)::int FROM assignment_submissions WHERE assignment_id = a.id AND status = 'pending') as "pendingCount"
    FROM assignments a
    JOIN lessons l ON a.lesson_id = l.id
    JOIN subjects s ON l.subject_id = s.id
    WHERE s.slug = $1
    ORDER BY a.due_date ASC
  `, [slug]);
  return res.rows;
};

// 6. Create a lesson in a course
export const createLesson = async (slug: string, data: any) => {
  const subjectRes = await pool.query('SELECT id FROM subjects WHERE slug = $1', [slug]);
  if (subjectRes.rows.length === 0) throw new Error('Subject not found');
  const subjectId = subjectRes.rows[0].id;
  
  // Try to find the first module or use null
  const moduleRes = await pool.query('SELECT id FROM modules WHERE subject_id = $1 ORDER BY order_no ASC LIMIT 1', [subjectId]);
  const moduleId = moduleRes.rows[0]?.id || null;

  const res = await pool.query(`
    INSERT INTO lessons (subject_id, module_id, title, description, order_no)
    VALUES ($1, $2, $3, $4, (SELECT COALESCE(MAX(order_no), 0) + 1 FROM lessons WHERE subject_id = $1))
    RETURNING *
  `, [subjectId, moduleId, data.title, data.description || '']);
  
  return res.rows[0];
};

// 7. Get assignments created by the teacher (global)
export const getTeacherAssignments = async (teacherId: number) => {
  const res = await pool.query(`
    SELECT a.*, s.name as "subjectName"
    FROM assignments a
    JOIN lessons l ON a.lesson_id = l.id
    JOIN subjects s ON l.subject_id = s.id
    JOIN teacher_subjects ts ON s.id = ts.subject_id
    WHERE ts.teacher_id = $1
  `, [teacherId]);
  return res.rows;
};

// 8. Create assignment for a lesson
export const createAssignment = async (data: any) => {
  const res = await pool.query(`
    INSERT INTO assignments (lesson_id, title, description, due_date)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `, [data.lessonId, data.title, data.description, data.dueDate ? new Date(data.dueDate) : null]);
  return res.rows[0];
};

// 9. Get submissions for an assignment
export const getSubmissions = async (assignmentId: string) => {
  const result = await pool.query(`
    SELECT 
      sb.id, 
      u.full_name as "studentName", 
      a.title as "assignmentTitle", 
      sb.submitted_at as "submittedAt", 
      sb.status, 
      sb.score,
      sb.feedback
    FROM assignment_submissions sb
    JOIN users u ON sb.user_id = u.id
    JOIN assignments a ON sb.assignment_id = a.id
    WHERE sb.assignment_id = $1
  `, [assignmentId]);
  return result.rows;
};

// 10. Grade submission
export const gradeSubmission = async (submissionId: string, score: number, feedback: string) => {
  await pool.query(`
    UPDATE assignment_submissions
    SET score = $1, feedback = $2, status = 'graded'
    WHERE id = $3
  `, [score, feedback, submissionId]);
};

// 11. Get teacher statistics
export const getTeacherStats = async (teacherId: number) => {
  // Pending Grades count
  const pendingRes = await pool.query(`
    SELECT COUNT(sb.id)::int as count
    FROM assignment_submissions sb
    JOIN assignments a ON sb.assignment_id = a.id
    JOIN lessons l ON a.lesson_id = l.id
    JOIN subjects s ON l.subject_id = s.id
    JOIN teacher_subjects ts ON s.id = ts.subject_id
    WHERE ts.teacher_id = $1 AND sb.status = 'pending'
  `, [teacherId]);

  // Upcoming Events count
  const upcomingRes = await pool.query(`
    SELECT COUNT(id)::int as count
    FROM events
    WHERE user_id = $1 AND start_time > CURRENT_TIMESTAMP
  `, [teacherId]);

  return {
    pendingGrades: pendingRes.rows[0]?.count || 0,
    upcomingClasses: upcomingRes.rows[0]?.count || 0
  };
};

// 12. Get pending dashboard feedback requests
export const getDashboardFeedback = async (teacherId: number) => {
  const res = await pool.query(`
    SELECT 
      sb.id,
      u.full_name as "studentName",
      a.title as "assignmentTitle",
      sb.submitted_at as "submittedAt"
    FROM assignment_submissions sb
    JOIN users u ON sb.user_id = u.id
    JOIN assignments a ON sb.assignment_id = a.id
    JOIN lessons l ON a.lesson_id = l.id
    JOIN subjects s ON l.subject_id = s.id
    JOIN teacher_subjects ts ON s.id = ts.subject_id
    WHERE ts.teacher_id = $1 AND sb.status = 'pending'
    ORDER BY sb.submitted_at DESC
    LIMIT 5
  `, [teacherId]);
  return res.rows;
};

export const getStudentProgress = async (studentId: string) => {
  return { progress: 75, grade: 'B+' }; // Mocked progress structure
};

// 13. Get all students taught by the teacher
export const getAllTeacherStudents = async (teacherId: number) => {
  const result = await pool.query(`
    WITH student_scores AS (
      SELECT 
        qs.user_id,
        s.id as subject_id,
        (qs.score::float / qs.total_questions * 100) as percentage
      FROM quiz_submissions qs
      JOIN quizzes q ON qs.quiz_id = q.id
      JOIN lessons l ON q.lesson_id = l.id
      JOIN subjects s ON l.subject_id = s.id
      JOIN teacher_subjects ts ON s.id = ts.subject_id
      WHERE ts.teacher_id = $1
      
      UNION ALL
      
      SELECT 
        asub.user_id,
        s.id as subject_id,
        asub.score::float as percentage
      FROM assignment_submissions asub
      JOIN assignments a ON asub.assignment_id = a.id
      JOIN lessons l ON a.lesson_id = l.id
      JOIN subjects s ON l.subject_id = s.id
      JOIN teacher_subjects ts ON s.id = ts.subject_id
      WHERE asub.status = 'graded' AND ts.teacher_id = $1
    ),
    student_grades AS (
      SELECT 
        user_id,
        subject_id,
        AVG(percentage) as avg_score,
        CASE 
          WHEN AVG(percentage) >= 90 THEN 'A'
          WHEN AVG(percentage) >= 80 THEN 'B'
          WHEN AVG(percentage) >= 70 THEN 'C'
          WHEN AVG(percentage) >= 60 THEN 'D'
          ELSE 'F'
        END as grade
      FROM student_scores
      GROUP BY user_id, subject_id
    )
    SELECT 
      u.id, 
      u.full_name as name, 
      u.email,
      s.name as "subjectName",
      COALESCE(
        (
          SELECT ROUND((COUNT(lc.id) * 100.0) / NULLIF(COUNT(l.id), 0))
          FROM lessons l
          LEFT JOIN lesson_completion lc ON l.id = lc.lesson_id AND lc.user_id = u.id AND lc.is_completed = true
          WHERE l.subject_id = s.id
        ), 
        0
      )::int as progress,
      COALESCE(
        (SELECT last_active FROM sessions WHERE user_id = u.id ORDER BY last_active DESC LIMIT 1),
        NULL
      ) as "lastActive",
      COALESCE(sg.grade, 'N/A') as "overallGrade"
    FROM users u
    JOIN subjects s ON s.grade = u.grade_level
    JOIN teacher_subjects ts ON s.id = ts.subject_id AND ts.teacher_id = $1
    LEFT JOIN student_grades sg ON sg.user_id = u.id AND sg.subject_id = s.id
    WHERE u.role = 'student'
  `, [teacherId]);
  return result.rows;
};
