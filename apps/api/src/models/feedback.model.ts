import { pool } from '../db/index';

export const getFeedbackThreadsForTeacher = async (teacherId: number) => {
  const result = await pool.query(
    `SELECT 
      f.id,
      u.full_name as "studentName",
      u.grade_level as "studentClass",
      s.name as "course",
      f.title,
      f.status,
      f.rating,
      f.updated_at as "time",
      (
        SELECT json_agg(
          json_build_object(
            'authorName', m_u.full_name,
            'authorRole', m_u.role,
            'timestamp', m.created_at,
            'body', m.body
          ) ORDER BY m.created_at ASC
        )
        FROM feedback_messages m
        JOIN users m_u ON m.sender_id = m_u.id
        WHERE m.feedback_id = f.id
      ) as thread
    FROM student_feedback f
    JOIN users u ON f.student_id = u.id
    LEFT JOIN subjects s ON f.subject_id = s.id
    WHERE f.teacher_id = $1
    ORDER BY f.updated_at DESC`,
    [teacherId]
  );
  return result.rows;
};

export const getFeedbackStatsForTeacher = async (teacherId: number) => {
  const result = await pool.query(
    `SELECT 
      COUNT(*) as "totalReceived",
      COUNT(*) FILTER (WHERE status IN ('new', 'in_progress')) as pending,
      AVG(rating) as "averageRating"
    FROM student_feedback
    WHERE teacher_id = $1`,
    [teacherId]
  );
  return result.rows[0];
};

export const addFeedbackReply = async (feedbackId: number, senderId: number, body: string) => {
  // 1. Insert message
  await pool.query(
    `INSERT INTO feedback_messages (feedback_id, sender_id, body)
     VALUES ($1, $2, $3)`,
    [feedbackId, senderId, body]
  );

  // 2. Update status and updated_at
  await pool.query(
    `UPDATE student_feedback 
     SET status = 'replied', updated_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [feedbackId]
  );
};

export const updateFeedbackStatus = async (feedbackId: number, status: string) => {
  await pool.query(
    `UPDATE student_feedback 
     SET status = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2`,
    [status, feedbackId]
  );
};
