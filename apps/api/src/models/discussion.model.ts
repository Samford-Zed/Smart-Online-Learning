import { pool } from '../db/index';

export interface DiscussionMessage {
  id: number;
  lessonId: number;
  userId: number;
  fullName?: string;
  message: string;
  createdAt: string;
}

export const createDiscussionMessage = async (lessonId: number, userId: number, message: string): Promise<DiscussionMessage> => {
  const result = await pool.query(
    `WITH inserted AS (
      INSERT INTO discussions (lesson_id, user_id, message) 
      VALUES ($1, $2, $3) 
      RETURNING *
    )
    SELECT i.*, u.full_name as "fullName" 
    FROM inserted i 
    JOIN users u ON i.user_id = u.id`,
    [lessonId, userId, message]
  );
  
  const row = result.rows[0];
  return {
    id: row.id,
    lessonId: row.lesson_id,
    userId: row.user_id,
    fullName: row.fullName,
    message: row.message,
    createdAt: row.created_at
  };
};

export const getDiscussionsByLessonId = async (lessonId: number): Promise<DiscussionMessage[]> => {
  const result = await pool.query(
    `SELECT d.id, d.lesson_id as "lessonId", d.user_id as "userId", u.full_name as "fullName", d.message, d.created_at as "createdAt"
     FROM discussions d
     JOIN users u ON d.user_id = u.id
     WHERE d.lesson_id = $1
     ORDER BY d.created_at ASC`,
    [lessonId]
  );
  return result.rows;
};
