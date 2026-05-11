import { pool } from '../db/index';

export const getStudentGrade = async (userId: number): Promise<string | null> => {
  const result = await pool.query(
    `SELECT student_info->>'grade' as grade FROM student_profiles WHERE user_id = $1`,
    [userId]
  );
  return result.rows[0]?.grade || null;
};

export const getSubjectsByGrade = async (grade: string) => {
  const result = await pool.query(
    'SELECT * FROM subjects WHERE grade = $1 ORDER BY name ASC',
    [grade]
  );
  return result.rows;
};

export const getSubjectById = async (subjectId: number) => {
  const result = await pool.query(
    'SELECT * FROM subjects WHERE id = $1',
    [subjectId]
  );
  return result.rows[0];
};

export const getLessonsBySubjectId = async (subjectId: number) => {
  const result = await pool.query(
    'SELECT * FROM lessons WHERE subject_id = $1 ORDER BY order_no ASC',
    [subjectId]
  );
  return result.rows;
};

export const getLessonById = async (lessonId: number) => {
  const result = await pool.query(
    'SELECT * FROM lessons WHERE id = $1',
    [lessonId]
  );
  return result.rows[0];
};

export const getVideosByLessonId = async (lessonId: number) => {
  const result = await pool.query(
    'SELECT * FROM videos WHERE lesson_id = $1',
    [lessonId]
  );
  return result.rows;
};

export const getPdfsByLessonId = async (lessonId: number) => {
  const result = await pool.query(
    'SELECT * FROM pdfs WHERE lesson_id = $1',
    [lessonId]
  );
  return result.rows;
};
