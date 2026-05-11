import { pool } from '../db/index';

export const getLessonWithDetails = async (slug: string, lessonId: number, userId: number) => {
  const lessonRes = await pool.query(`
    SELECT l.id as "lessonId", l.title, l.description, l.order_no, l.subject_id
    FROM lessons l
    JOIN subjects s ON l.subject_id = s.id
    WHERE s.slug = $1 AND l.id = $2
  `, [slug, lessonId]);

  if (lessonRes.rows.length === 0) return null;

  const lesson = lessonRes.rows[0];

  const videosRes = await pool.query('SELECT id, title, url as "downloadUrl", "url" as "videoUrl" FROM videos WHERE lesson_id = $1', [lessonId]);
  const pdfsRes = await pool.query('SELECT id, title, url as "downloadUrl" FROM pdfs WHERE lesson_id = $1', [lessonId]);

  const materials = [
    ...videosRes.rows.map(v => ({ ...v, type: 'video' })),
    ...pdfsRes.rows.map(p => ({ ...p, type: 'pdf' }))
  ];

  const outlineRes = await pool.query(`
    SELECT l.id, l.title, 
           CASE 
             WHEN lc.is_completed = true THEN 'completed'
             WHEN l.id = $2 THEN 'current'
             ELSE 'locked'
           END as status
    FROM lessons l
    LEFT JOIN lesson_completion lc ON l.id = lc.lesson_id AND lc.user_id = $1
    WHERE l.subject_id = $3
    ORDER BY l.order_no ASC
  `, [userId, lessonId, lesson.subject_id]);

  const prevLessonRes = await pool.query(`
    SELECT id FROM lessons WHERE subject_id = $1 AND order_no < $2 ORDER BY order_no DESC LIMIT 1
  `, [lesson.subject_id, lesson.order_no]);

  const nextLessonRes = await pool.query(`
    SELECT id FROM lessons WHERE subject_id = $1 AND order_no > $2 ORDER BY order_no ASC LIMIT 1
  `, [lesson.subject_id, lesson.order_no]);

  const completionRes = await pool.query(`
    SELECT is_completed FROM lesson_completion WHERE user_id = $1 AND lesson_id = $2
  `, [userId, lessonId]);

  return {
    lessonId: lesson.lessonId,
    title: lesson.title,
    description: lesson.description,
    videoUrl: videosRes.rows[0]?.videoUrl || '',
    materials,
    outline: outlineRes.rows,
    prevLessonId: prevLessonRes.rows[0]?.id || null,
    nextLessonId: nextLessonRes.rows[0]?.id || null,
    isCompleted: completionRes.rows[0]?.is_completed || false
  };
};

export const completeLesson = async (userId: number, lessonId: number, completed: boolean) => {
  const result = await pool.query(`
    INSERT INTO lesson_completion (user_id, lesson_id, is_completed)
    VALUES ($1, $2, $3)
    ON CONFLICT (user_id, lesson_id)
    DO UPDATE SET is_completed = $3, completed_at = CURRENT_TIMESTAMP
    RETURNING *
  `, [userId, lessonId, completed]);
  return result.rows[0];
};
