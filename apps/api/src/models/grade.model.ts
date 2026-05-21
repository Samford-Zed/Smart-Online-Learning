import { pool } from '../db/index';

// Add a grade record from quiz or assignment
export const addGrade = async (gradeData: {
  userId: number;
  subjectId: number;
  assignmentId?: number;
  quizId?: number;
  score: number;
  maxScore: number;
  type: 'assignment' | 'quiz' | 'exam' | 'project';
  title: string;
  gradedBy?: number;
  comments?: string;
}) => {
  try {
    const gradeLetter = gradeData.score / gradeData.maxScore >= 0.9 ? 'A' :
                       gradeData.score / gradeData.maxScore >= 0.8 ? 'B' :
                       gradeData.score / gradeData.maxScore >= 0.7 ? 'C' :
                       gradeData.score / gradeData.maxScore >= 0.6 ? 'D' : 'F';
    
    const result = await pool.query(`
      INSERT INTO grades (user_id, subject_id, assignment_id, quiz_id, score, max_score, grade, type, title, graded_by, comments)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (user_id, ${gradeData.assignmentId ? 'assignment_id' : 'quiz_id'}) 
      DO UPDATE SET 
        score = EXCLUDED.score,
        max_score = EXCLUDED.max_score,
        grade = EXCLUDED.grade,
        graded_at = CURRENT_TIMESTAMP,
        graded_by = EXCLUDED.graded_by,
        comments = EXCLUDED.comments
      RETURNING *
    `, [
      gradeData.userId,
      gradeData.subjectId,
      gradeData.assignmentId || null,
      gradeData.quizId || null,
      gradeData.score,
      gradeData.maxScore,
      gradeLetter,
      gradeData.type,
      gradeData.title,
      gradeData.gradedBy || null,
      gradeData.comments || null
    ]);
    return result.rows[0];
  } catch (error) {
    console.error('Database error in addGrade:', error);
    return null;
  }
};

// Get grades from grades table
export const getGradesFromTable = async (userId: number) => {
  try {
    const result = await pool.query(`
      SELECT 
        g.id,
        g.score,
        g.max_score as maxScore,
        g.grade,
        g.type,
        g.title,
        g.graded_at as date,
        s.name as subject
      FROM grades g
      JOIN subjects s ON g.subject_id = s.id
      WHERE g.user_id = $1
      ORDER BY g.graded_at DESC
    `, [userId]);
    return result.rows;
  } catch (error) {
    console.error('Database error in getGradesFromTable:', error);
    return [];
  }
};

export const getStudentGrades = async (userId: number) => {
  try {
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
  } catch (error) {
    console.error('Database error in getStudentGrades:', error);
    return { gpa: 0, subjects: [] }; // Return empty grades if database error
  }
};

export const getRecentGrades = async (userId: number, limit: number) => {
  try {
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
  } catch (error) {
    console.error('Database error in getRecentGrades:', error);
    return []; // Return empty array if database error
  }
};
