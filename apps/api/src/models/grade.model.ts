import { pool } from '../db/index';

export const getStudentGrades = async (userId: number) => {
  const result = await pool.query(`
    WITH subject_scores AS (
      -- Quiz scores
      SELECT 
        s.name as subject_name,
        (qs.score::float / qs.total_questions * 100) as percentage
      FROM quiz_submissions qs
      JOIN quizzes q ON qs.quiz_id = q.id
      JOIN lessons l ON q.lesson_id = l.id
      JOIN subjects s ON l.subject_id = s.id
      WHERE qs.user_id = $1
      
      UNION ALL
      
      -- Assignment scores
      SELECT 
        s.name as subject_name,
        asub.score::float as percentage
      FROM assignment_submissions asub
      JOIN assignments a ON asub.assignment_id = a.id
      JOIN lessons l ON a.lesson_id = l.id
      JOIN subjects s ON l.subject_id = s.id
      WHERE asub.user_id = $1 AND asub.status = 'graded'
    )
    SELECT 
      subject_name as name,
      AVG(percentage) as score,
      CASE 
        WHEN AVG(percentage) >= 90 THEN 'A'
        WHEN AVG(percentage) >= 80 THEN 'B'
        WHEN AVG(percentage) >= 70 THEN 'C'
        WHEN AVG(percentage) >= 60 THEN 'D'
        ELSE 'F'
      END as grade
    FROM subject_scores
    GROUP BY subject_name
  `, [userId]);

  const subjects = result.rows.map(row => ({
    name: row.name,
    score: Math.round(row.score),
    grade: row.grade
  }));

  const gpa = subjects.length > 0 
    ? subjects.reduce((acc, curr) => {
        const gradePoints = { 'A': 4, 'B': 3, 'C': 2, 'D': 1, 'F': 0 };
        return acc + (gradePoints[curr.grade as keyof typeof gradePoints] || 0);
      }, 0) / subjects.length
    : 0;

  return {
    gpa: parseFloat(gpa.toFixed(2)),
    subjects
  };
};

export const getRecentGrades = async (userId: number, limit: number) => {
  const result = await pool.query(`
    (SELECT 
      qs.id,
      s.name as subject,
      q.title,
      qs.score,
      CASE 
        WHEN (qs.score::float / qs.total_questions * 100) >= 90 THEN 'A'
        WHEN (qs.score::float / qs.total_questions * 100) >= 80 THEN 'B'
        WHEN (qs.score::float / qs.total_questions * 100) >= 70 THEN 'C'
        WHEN (qs.score::float / qs.total_questions * 100) >= 60 THEN 'D'
        ELSE 'F'
      END as grade,
      qs.submitted_at as date
    FROM quiz_submissions qs
    JOIN quizzes q ON qs.quiz_id = q.id
    JOIN lessons l ON q.lesson_id = l.id
    JOIN subjects s ON l.subject_id = s.id
    WHERE qs.user_id = $1)
    
    UNION ALL
    
    (SELECT 
      asub.id,
      s.name as subject,
      a.title,
      asub.score,
      CASE 
        WHEN asub.score >= 90 THEN 'A'
        WHEN asub.score >= 80 THEN 'B'
        WHEN asub.score >= 70 THEN 'C'
        WHEN asub.score >= 60 THEN 'D'
        ELSE 'F'
      END as grade,
      asub.submitted_at as date
    FROM assignment_submissions asub
    JOIN assignments a ON asub.assignment_id = a.id
    JOIN lessons l ON a.lesson_id = l.id
    JOIN subjects s ON l.subject_id = s.id
    WHERE asub.user_id = $1 AND asub.status = 'graded')
    
    ORDER BY date DESC
    LIMIT $2
  `, [userId, limit]);
  return result.rows;
};
