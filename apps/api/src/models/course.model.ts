import { pool } from '../db/index';

export const getAllCourses = async (userId: number) => {
  const result = await pool.query(`
    SELECT 
      s.id,
      s.slug,
      s.name as title,
      s.name as subject,
      s.instructor,
      COALESCE(
        (SELECT COUNT(*)::float / NULLIF(COUNT(*), 0) * 100 
         FROM lessons l 
         LEFT JOIN lesson_completion lc ON l.id = lc.lesson_id AND lc.user_id = $1
         WHERE l.subject_id = s.id AND lc.is_completed = true), 0
      ) as progress,
      'active' as status,
      (SELECT COUNT(DISTINCT module_id) FROM lessons WHERE subject_id = s.id) as "totalModules",
      (SELECT COUNT(DISTINCT l.module_id) 
       FROM lessons l 
       JOIN lesson_completion lc ON l.id = lc.lesson_id 
       WHERE l.subject_id = s.id AND lc.user_id = $1 AND lc.is_completed = true) as "completedModules"
    FROM subjects s
  `, [userId]);
  return result.rows;
};

export const getCourseBySlug = async (slug: string, userId: number) => {
  const courseRes = await pool.query(`
    SELECT id, slug, name as title, instructor, description
    FROM subjects
    WHERE slug = $1
  `, [slug]);

  if (courseRes.rows.length === 0) return null;

  const course = courseRes.rows[0];

  const modulesRes = await pool.query(`
    SELECT m.id, m.title, m.order_no
    FROM modules m
    WHERE m.subject_id = $1
    ORDER BY m.order_no ASC
  `, [course.id]);

  const modules = await Promise.all(modulesRes.rows.map(async (module) => {
    const lessonsRes = await pool.query(`
      SELECT l.id, l.title, l.order_no,
             COALESCE(lc.is_completed, false) as is_completed
      FROM lessons l
      LEFT JOIN lesson_completion lc ON l.id = lc.lesson_id AND lc.user_id = $2
      WHERE l.module_id = $1
      ORDER BY l.order_no ASC
    `, [module.id, userId]);
    return {
      ...module,
      lessons: lessonsRes.rows
    };
  }));

  return {
    ...course,
    modules
  };
};
