import { pool } from '../db/index';

// Quizzes
export const getQuizById = async (quizId: number) => {
  const result = await pool.query('SELECT * FROM quizzes WHERE id = $1', [quizId]);
  return result.rows[0];
};

export const getQuestionsByQuizId = async (quizId: number) => {
  const result = await pool.query('SELECT id, text, options FROM questions WHERE quiz_id = $1', [quizId]);
  return result.rows; // we exclude correct_option to prevent cheating if sent to client directly
};

export const getQuestionWithAnswer = async (questionId: number) => {
  const result = await pool.query('SELECT * FROM questions WHERE id = $1', [questionId]);
  return result.rows[0];
};

export const getSubmissionCount = async (userId: number, quizId: number) => {
  const result = await pool.query(
    'SELECT COUNT(*) FROM quiz_submissions WHERE user_id = $1 AND quiz_id = $2',
    [userId, quizId]
  );
  return parseInt(result.rows[0].count, 10);
};

export const createQuizSubmission = async (userId: number, quizId: number, score: number, totalQuestions: number) => {
  const result = await pool.query(
    'INSERT INTO quiz_submissions (user_id, quiz_id, score, total_questions) VALUES ($1, $2, $3, $4) RETURNING id',
    [userId, quizId, score, totalQuestions]
  );
  return result.rows[0].id;
};

export const createUserAnswer = async (submissionId: number, questionId: number, selectedOption: string, isCorrect: boolean) => {
  await pool.query(
    'INSERT INTO user_answers (submission_id, question_id, selected_option, is_correct) VALUES ($1, $2, $3, $4)',
    [submissionId, questionId, selectedOption, isCorrect]
  );
};

// Assignments
export const getAssignmentsByLessonId = async (lessonId: number) => {
  const result = await pool.query('SELECT * FROM assignments WHERE lesson_id = $1', [lessonId]);
  return result.rows;
};

export const getAssignmentById = async (assignmentId: number) => {
  const result = await pool.query('SELECT * FROM assignments WHERE id = $1', [assignmentId]);
  return result.rows[0];
};

export const createAssignmentSubmission = async (userId: number, assignmentId: number, content?: string, fileUrl?: string) => {
  const result = await pool.query(
    'INSERT INTO assignment_submissions (user_id, assignment_id, content, file_url) VALUES ($1, $2, $3, $4) RETURNING *',
    [userId, assignmentId, content || null, fileUrl || null]
  );
  return result.rows[0];
};

// Video Progress
export const getVideoById = async (videoId: number) => {
  const result = await pool.query('SELECT * FROM videos WHERE id = $1', [videoId]);
  return result.rows[0];
};

export const upsertVideoProgress = async (userId: number, videoId: number, watchedDuration: number, isCompleted: boolean) => {
  const result = await pool.query(
    `INSERT INTO video_progress (user_id, video_id, watched_duration, is_completed, last_updated)
     VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
     ON CONFLICT (user_id, video_id)
     DO UPDATE SET watched_duration = EXCLUDED.watched_duration, is_completed = EXCLUDED.is_completed, last_updated = CURRENT_TIMESTAMP
     RETURNING *`,
    [userId, videoId, watchedDuration, isCompleted]
  );
  return result.rows[0];
};
