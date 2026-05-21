import { pool } from '../db/index';

export const getResources = async (subject?: string, type?: string, page: number = 1, limit: number = 8) => {
  const offset = (page - 1) * limit;
  let query = `
    SELECT 
      r.id, r.title, r.kind, s.name as subject, 
      r.size, TO_CHAR(r.created_at, 'MMM DD, YYYY') as date, 
      r.duration,
      CASE 
        WHEN r.kind = 'video' THEN 'watch'
        WHEN r.kind = 'pdf' THEN 'view'
        ELSE 'download'
      END as "primaryAction",
      r.download_url as "downloadUrl",
      r.view_url as "viewUrl"
    FROM resources r
    JOIN subjects s ON r.subject_id = s.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (subject) {
    params.push(subject);
    query += ` AND s.name = $${params.length}`;
  }
  if (type) {
    params.push(type);
    query += ` AND r.kind = $${params.length}`;
  }

  const countQuery = `SELECT COUNT(*) FROM (${query}) as count_table`;
  const countResult = await pool.query(countQuery, params);
  const total = parseInt(countResult.rows[0].count, 10);

  query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);

  return {
    total,
    page,
    items: result.rows
  };
};

export const getRecentResources = async (userId: string) => {
  const result = await pool.query(`
    SELECT r.id, r.title, rv.progress
    FROM resource_views rv
    JOIN resources r ON rv.resource_id = r.id
    WHERE rv.user_id = $1
    ORDER BY rv.viewed_at DESC
    LIMIT 5
  `, [userId]);
  return result.rows;
};

export const getResourceSubjects = async () => {
  const result = await pool.query('SELECT id, name FROM subjects');
  return result.rows;
};

export const requestResource = async (userId: string, title: string, subject: string, description: string) => {
  const result = await pool.query(`
    INSERT INTO resource_requests (user_id, title, subject, description)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `, [userId, title, subject, description]);
  return result.rows[0];
};

export const trackResourceView = async (userId: string, resourceId: string, progress: number) => {
  await pool.query(`
    INSERT INTO resource_views (user_id, resource_id, progress)
    VALUES ($1, $2, $3)
    ON CONFLICT (user_id, resource_id) 
    DO UPDATE SET progress = $3, viewed_at = CURRENT_TIMESTAMP
  `, [userId, resourceId, progress]);
};

export const getTeacherResources = async (teacherId: number) => {
  const result = await pool.query(
    `SELECT 
      r.id::text,
      r.title,
      r.description,
      r.kind as type,
      s.name as subject,
      s.name as "subjectShort",
      CAST(NULLIF(REGEXP_REPLACE(s.grade, '[^0-9]', '', 'g'), '') AS INTEGER) as grade,
      r.cover
    FROM resources r
    JOIN subjects s ON r.subject_id = s.id
    JOIN teacher_subjects ts ON s.id = ts.subject_id
    WHERE ts.teacher_id = $1
    ORDER BY r.created_at DESC`,
    [teacherId]
  );
  return result.rows;
};

export const createTeacherResource = async (teacherId: number, data: any) => {
  const subjectCheck = await pool.query(
    `SELECT s.id FROM subjects s
     JOIN teacher_subjects ts ON s.id = ts.subject_id
     WHERE ts.teacher_id = $1 AND s.name = $2`,
    [teacherId, data.subject]
  );

  if (subjectCheck.rows.length === 0) {
    throw new Error("Teacher does not teach this subject or subject not found");
  }

  const subjectId = subjectCheck.rows[0].id;

  const result = await pool.query(
    `INSERT INTO resources (subject_id, title, description, kind, cover)
     VALUES ($1, $2, $3, $4, $5) RETURNING id::text`,
    [subjectId, data.title, data.description, data.type, data.cover]
  );
  
  return result.rows[0];
};
