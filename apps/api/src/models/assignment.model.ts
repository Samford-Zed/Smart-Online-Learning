import { pool } from '../db/index';

export const getStudentAssignments = async (userId: number) => {
  const result = await pool.query(`
    SELECT 
      a.id,
      a.title,
      s.name as subject,
      a.due_date as due,
      COALESCE(asub.status, 'pending') as status,
      asub.score,
      CASE 
        WHEN asub.status = 'submitted' THEN 'view'
        WHEN asub.status = 'graded' THEN 'view'
        ELSE 'submit'
      END as action
    FROM assignments a
    JOIN lessons l ON a.lesson_id = l.id
    JOIN subjects s ON l.subject_id = s.id
    LEFT JOIN assignment_submissions asub ON a.id = asub.assignment_id AND asub.user_id = $1
  `, [userId]);
  return result.rows;
};

export const getAssignmentById = async (assignmentId: number, userId: number) => {
  const result = await pool.query(`
    SELECT 
      a.id,
      a.title,
      a.description,
      a.requirements,
      a.due_date as due,
      COALESCE(asub.status, 'pending') as status,
      asub.score,
      asub.feedback,
      asub.file_url as "submittedFileUrl"
    FROM assignments a
    LEFT JOIN assignment_submissions asub ON a.id = asub.assignment_id AND asub.user_id = $2
    WHERE a.id = $1
  `, [assignmentId, userId]);
  return result.rows[0];
};

export const submitAssignment = async (userId: number, assignmentId: number, fileUrl: string) => {
  // Check if submission already exists
  const existing = await pool.query(
    'SELECT id FROM assignment_submissions WHERE user_id = $1 AND assignment_id = $2',
    [userId, assignmentId]
  );

  if (existing.rows.length > 0) {
    // Update existing submission
    const result = await pool.query(`
      UPDATE assignment_submissions 
      SET file_url = $3, status = 'submitted', submitted_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND assignment_id = $2
      RETURNING *
    `, [userId, assignmentId, fileUrl]);
    return result.rows[0];
  } else {
    // Insert new submission
    const result = await pool.query(`
      INSERT INTO assignment_submissions (user_id, assignment_id, file_url, status)
      VALUES ($1, $2, $3, 'submitted')
      RETURNING *
    `, [userId, assignmentId, fileUrl]);
    return result.rows[0];
  }
};
