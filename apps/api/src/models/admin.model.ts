import { query, pool } from "../db";

// ============================================
// ADMIN MODEL - Phase 1 & 2: Foundation + User Management
// ============================================

export interface UserStats {
  total: number;
  students: number;
  teachers: number;
  parents: number;
  admins: number;
  newThisMonth: number;
}

export interface DashboardStats {
  users: UserStats;
  subjects: number;
  lessons: number;
  assignments: number;
  submissions: number;
  pendingGrades: number;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  grade_level?: number;
  is_active: boolean;
  created_at: Date;
  last_login?: Date;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: "student" | "teacher" | "parent" | "admin";
  grade_level?: number;
}

// ============================================
// DASHBOARD STATS
// ============================================

export async function getDashboardStats(): Promise<DashboardStats> {
  const userStats = await query(`
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE role = 'student') as students,
      COUNT(*) FILTER (WHERE role = 'teacher') as teachers,
      COUNT(*) FILTER (WHERE role = 'parent') as parents,
      COUNT(*) FILTER (WHERE role = 'admin') as admins,
      0 as new_this_month
    FROM users
  `);

  const contentStats = await query(`
    SELECT 
      (SELECT COUNT(*) FROM subjects) as subjects,
      (SELECT COUNT(*) FROM lessons) as lessons,
      (SELECT COUNT(*) FROM assignments) as assignments,
      (SELECT COUNT(*) FROM assignment_submissions) as submissions,
      (SELECT COUNT(*) FROM assignment_submissions WHERE status = 'pending') as pending_grades
  `);

  return {
    users: userStats.rows[0] as UserStats,
    ...contentStats.rows[0],
  };
}

// ============================================
// USER MANAGEMENT - Phase 2
// ============================================

export async function getAllUsers(
  filters: {
    role?: string;
    grade?: number;
    search?: string;
    isActive?: boolean;
  } = {},
  limit: number = 50,
  offset: number = 0
): Promise<{ users: AdminUser[]; total: number }> {
  const conditions: string[] = ["1=1"];
  const params: any[] = [];
  let paramIndex = 1;

  if (filters.role) {
    conditions.push(`role = $${paramIndex++}`);
    params.push(filters.role);
  }

  if (filters.grade !== undefined) {
    conditions.push(`grade_level = $${paramIndex++}`);
    params.push(filters.grade);
  }

  if (filters.search) {
    conditions.push(`(full_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`);
    params.push(`%${filters.search}%`);
    paramIndex++;
  }

  const whereClause = conditions.join(" AND ");

  const usersResult = await query(
    `
    SELECT id, full_name as name, email, role, grade_level
    FROM users
    WHERE ${whereClause}
    ORDER BY id DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `,
    [...params, limit, offset]
  );

  const countResult = await query(
    `SELECT COUNT(*) FROM users WHERE ${whereClause}`,
    params
  );

  return {
    users: usersResult.rows as AdminUser[],
    total: parseInt(countResult.rows[0].count, 10),
  };
}

export async function createUser(data: CreateUserData): Promise<AdminUser> {
  const result = await query(
    `
    INSERT INTO users (name, email, password, role, grade_level, is_active, created_at)
    VALUES ($1, $2, $3, $4, $5, true, NOW())
    RETURNING id, name, email, role, grade_level, is_active, created_at
    `,
    [data.name, data.email, data.password, data.role, data.grade_level || null]
  );

  return result.rows[0] as AdminUser;
}

export async function getUserById(userId: number): Promise<AdminUser | null> {
  const result = await query(
    `SELECT id, name, email, role, grade_level, is_active, created_at, last_login
     FROM users WHERE id = $1`,
    [userId]
  );
  return result.rows[0] as AdminUser || null;
}

export async function getTeachers(
  filters: {
    search?: string;
    isActive?: boolean;
  } = {},
  limit: number = 50,
  offset: number = 0
): Promise<{ users: AdminUser[]; total: number }> {
  return getAllUsers({ role: "teacher", ...filters }, limit, offset);
}

export async function updateUser(
  userId: number,
  data: Partial<CreateUserData> & { is_active?: boolean }
): Promise<AdminUser | null> {
  const updates: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (data.name) {
    updates.push(`name = $${paramIndex++}`);
    params.push(data.name);
  }
  if (data.email) {
    updates.push(`email = $${paramIndex++}`);
    params.push(data.email);
  }
  if (data.password) {
    updates.push(`password = $${paramIndex++}`);
    params.push(data.password);
  }
  if (data.role) {
    updates.push(`role = $${paramIndex++}`);
    params.push(data.role);
  }
  if (data.grade_level !== undefined) {
    updates.push(`grade_level = $${paramIndex++}`);
    params.push(data.grade_level);
  }
  if (data.is_active !== undefined) {
    updates.push(`is_active = $${paramIndex++}`);
    params.push(data.is_active);
  }

  if (updates.length === 0) return null;

  params.push(userId);
  const result = await query(
    `UPDATE users SET ${updates.join(", ")} WHERE id = $${paramIndex}
     RETURNING id, name, email, role, grade_level, is_active, created_at, last_login`,
    params
  );

  return result.rows[0] as AdminUser || null;
}

export async function deleteUser(userId: number): Promise<boolean> {
  const result = await query(
    "UPDATE users SET is_active = false WHERE id = $1 RETURNING id",
    [userId]
  );
  return result.rowCount > 0;
}

export async function resetUserPassword(userId: number, newPassword: string): Promise<boolean> {
  const result = await query(
    "UPDATE users SET password = $1 WHERE id = $2 RETURNING id",
    [newPassword, userId]
  );
  return result.rowCount > 0;
}

// ============================================
// SUBJECT/CONTENT MANAGEMENT
// ============================================

export async function getAllSubjects(): Promise<any[]> {
  const result = await query(`
    SELECT s.id, s.name, s.slug, s.description, s.instructor, s.grade, 
           COUNT(DISTINCT m.id) as module_count, COUNT(DISTINCT l.id) as lesson_count
    FROM subjects s
    LEFT JOIN modules m ON s.id = m.subject_id
    LEFT JOIN lessons l ON m.id = l.module_id
    GROUP BY s.id, s.name, s.slug, s.description, s.instructor, s.grade
    ORDER BY s.id DESC
  `);
  return result.rows;
}

export async function createSubject(data: {
  name: string;
  slug: string;
  description: string;
  instructor: string;
  grade: number;
}): Promise<any> {
  const result = await query(
    `INSERT INTO subjects (name, slug, description, instructor, grade)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [data.name, data.slug, data.description, data.instructor, data.grade]
  );
  return result.rows[0];
}

export async function deleteSubject(subjectId: number): Promise<boolean> {
  const result = await query("DELETE FROM subjects WHERE id = $1 RETURNING id", [subjectId]);
  return result.rowCount > 0;
}

// ============================================
// MODULE MANAGEMENT - Phase 3
// ============================================

export async function getModulesBySubject(subjectId: number): Promise<any[]> {
  const result = await query(
    `SELECT * FROM modules 
     WHERE subject_id = $1 
     ORDER BY order_no ASC`,
    [subjectId]
  );
  return result.rows;
}

export async function createModule(data: {
  subject_id: number;
  title: string;
  order_no: number;
  description?: string;
}): Promise<any> {
  const result = await query(
    `INSERT INTO modules (subject_id, title, order_no, description, created_at)
     VALUES ($1, $2, $3, $4, NOW())
     RETURNING *`,
    [data.subject_id, data.title, data.order_no, data.description || null]
  );
  return result.rows[0];
}

export async function updateModule(
  moduleId: number,
  data: { title?: string; order_no?: number; description?: string }
): Promise<any> {
  const updates: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (data.title) {
    updates.push(`title = $${paramIndex++}`);
    params.push(data.title);
  }
  if (data.order_no !== undefined) {
    updates.push(`order_no = $${paramIndex++}`);
    params.push(data.order_no);
  }
  if (data.description !== undefined) {
    updates.push(`description = $${paramIndex++}`);
    params.push(data.description);
  }

  if (updates.length === 0) return null;

  params.push(moduleId);
  const result = await query(
    `UPDATE modules SET ${updates.join(", ")} WHERE id = $${paramIndex}
     RETURNING *`,
    params
  );
  return result.rows[0];
}

export async function deleteModule(moduleId: number): Promise<boolean> {
  const result = await query("DELETE FROM modules WHERE id = $1 RETURNING id", [moduleId]);
  return result.rowCount > 0;
}

// ============================================
// LESSON MANAGEMENT - Phase 3
// ============================================

export async function getLessonsByModule(moduleId: number): Promise<any[]> {
  const result = await query(
    `SELECT l.*, 
            (SELECT COUNT(*) FROM videos WHERE lesson_id = l.id) as video_count,
            (SELECT COUNT(*) FROM pdfs WHERE lesson_id = l.id) as pdf_count
     FROM lessons l
     WHERE l.module_id = $1
     ORDER BY l.order_no ASC`,
    [moduleId]
  );
  return result.rows;
}

export async function createLesson(data: {
  module_id: number;
  subject_id: number;
  title: string;
  description?: string;
  order_no: number;
}): Promise<any> {
  const result = await query(
    `INSERT INTO lessons (module_id, subject_id, title, description, order_no, created_at)
     VALUES ($1, $2, $3, $4, $5, NOW())
     RETURNING *`,
    [data.module_id, data.subject_id, data.title, data.description || null, data.order_no]
  );
  return result.rows[0];
}

export async function updateLesson(
  lessonId: number,
  data: { title?: string; description?: string; order_no?: number }
): Promise<any> {
  const updates: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (data.title) {
    updates.push(`title = $${paramIndex++}`);
    params.push(data.title);
  }
  if (data.description !== undefined) {
    updates.push(`description = $${paramIndex++}`);
    params.push(data.description);
  }
  if (data.order_no !== undefined) {
    updates.push(`order_no = $${paramIndex++}`);
    params.push(data.order_no);
  }

  if (updates.length === 0) return null;

  params.push(lessonId);
  const result = await query(
    `UPDATE lessons SET ${updates.join(", ")} WHERE id = $${paramIndex}
     RETURNING *`,
    params
  );
  return result.rows[0];
}

export async function deleteLesson(lessonId: number): Promise<boolean> {
  const result = await query("DELETE FROM lessons WHERE id = $1 RETURNING id", [lessonId]);
  return result.rowCount > 0;
}

// ============================================
// CONTENT UPLOAD - Phase 3
// ============================================

export async function addVideoToLesson(data: {
  lesson_id: number;
  title: string;
  url: string;
}): Promise<any> {
  const result = await query(
    `INSERT INTO videos (lesson_id, title, url, created_at)
     VALUES ($1, $2, $3, NOW())
     RETURNING *`,
    [data.lesson_id, data.title, data.url]
  );
  return result.rows[0];
}

export async function addPdfToLesson(data: {
  lesson_id: number;
  title: string;
  url: string;
}): Promise<any> {
  const result = await query(
    `INSERT INTO pdfs (lesson_id, title, url, created_at)
     VALUES ($1, $2, $3, NOW())
     RETURNING *`,
    [data.lesson_id, data.title, data.url]
  );
  return result.rows[0];
}

// ============================================
// SYSTEM LOGS
// ============================================

export async function getSystemLogs(limit: number = 100, offset: number = 0): Promise<any[]> {
  const result = await query(
    `SELECT l.*, u.name as user_name, u.email as user_email
     FROM system_logs l
     LEFT JOIN users u ON l.user_id = u.id
     ORDER BY l.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return result.rows;
}

export async function createLogEntry(userId: number | null, action: string, details: any): Promise<void> {
  await query(
    `INSERT INTO system_logs (user_id, action, details, created_at)
     VALUES ($1, $2, $3, NOW())`,
    [userId, action, JSON.stringify(details)]
  );
}

// ============================================
// ANALYTICS - Phase 5
// ============================================

export async function getEnrollmentTrends(months: number = 6): Promise<any[]> {
  const result = await query(
    `SELECT 
      DATE_TRUNC('month', created_at) as month,
      COUNT(*) as count,
      COUNT(*) FILTER (WHERE role = 'student') as students,
      COUNT(*) FILTER (WHERE role = 'teacher') as teachers,
      COUNT(*) FILTER (WHERE role = 'parent') as parents
    FROM users
    WHERE created_at >= NOW() - INTERVAL '${months} months'
    GROUP BY DATE_TRUNC('month', created_at)
    ORDER BY month ASC`,
    []
  );
  return result.rows;
}

export async function getGradeDistribution(): Promise<any[]> {
  const result = await query(
    `SELECT 
      CASE 
        WHEN score >= 90 THEN 'A'
        WHEN score >= 80 THEN 'B'
        WHEN score >= 70 THEN 'C'
        WHEN score >= 60 THEN 'D'
        ELSE 'F'
      END as grade,
      COUNT(*) as count
    FROM assignment_submissions
    WHERE status = 'graded'
    GROUP BY 
      CASE 
        WHEN score >= 90 THEN 'A'
        WHEN score >= 80 THEN 'B'
        WHEN score >= 70 THEN 'C'
        WHEN score >= 60 THEN 'D'
        ELSE 'F'
      END
    ORDER BY grade`,
    []
  );
  return result.rows;
}

export async function getSubjectEnrollment(): Promise<any[]> {
  const result = await query(
    `SELECT 
      s.name,
      COUNT(DISTINCT l.id) as lesson_count,
      COUNT(DISTINCT m.id) as module_count
    FROM subjects s
    LEFT JOIN modules m ON s.id = m.subject_id
    LEFT JOIN lessons l ON m.id = l.module_id
    GROUP BY s.id, s.name
    ORDER BY s.name`,
    []
  );
  return result.rows;
}

// ============================================
// SETTINGS - Phase 5
// ============================================

export async function getAllSettings(): Promise<Record<string, string>> {
  const result = await query(`SELECT key, value FROM admin_settings`);
  const settings: Record<string, string> = {};
  result.rows.forEach((row: any) => {
    settings[row.key] = row.value;
  });
  return settings;
}

export async function getSetting(key: string): Promise<string | null> {
  const result = await query(
    `SELECT value FROM admin_settings WHERE key = $1`,
    [key]
  );
  return result.rows[0]?.value || null;
}

export async function updateSetting(key: string, value: string): Promise<void> {
  await query(
    `INSERT INTO admin_settings (key, value, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
    [key, value]
  );
}

// ============================================
// ENROLLMENTS
// ============================================

export async function getAllEnrollments(filters?: { status?: string; studentId?: number; subjectId?: number }, limit: number = 100, offset: number = 0): Promise<any[]> {
  let sql = `
    SELECT 
      e.*,
      u.full_name as student_name,
      u.email as student_email,
      s.name as subject_name,
      a.full_name as approved_by_name
    FROM enrollments e
    JOIN users u ON e.student_id = u.id
    JOIN subjects s ON e.subject_id = s.id
    LEFT JOIN users a ON e.approved_by = a.id
    WHERE 1=1
  `;
  const params: any[] = [];
  let paramIndex = 1;

  if (filters?.status) {
    sql += ` AND e.status = $${paramIndex++}`;
    params.push(filters.status);
  }
  if (filters?.studentId) {
    sql += ` AND e.student_id = $${paramIndex++}`;
    params.push(filters.studentId);
  }
  if (filters?.subjectId) {
    sql += ` AND e.subject_id = $${paramIndex++}`;
    params.push(filters.subjectId);
  }

  sql += ` ORDER BY e.enrollment_date DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  params.push(limit, offset);

  const result = await query(sql, params);
  return result.rows;
}

export async function createEnrollment(data: { student_id: number; subject_id: number; notes?: string }): Promise<any> {
  const result = await query(
    `INSERT INTO enrollments (student_id, subject_id, status, enrollment_date, notes)
     VALUES ($1, $2, 'pending', NOW(), $3)
     ON CONFLICT (student_id, subject_id) DO UPDATE SET status = 'pending', enrollment_date = NOW()
     RETURNING *`,
    [data.student_id, data.subject_id, data.notes || null]
  );
  return result.rows[0];
}

export async function updateEnrollmentStatus(
  enrollmentId: number, 
  status: 'pending' | 'approved' | 'rejected' | 'completed', 
  approvedBy?: number
): Promise<any> {
  const updates = approvedBy && status === 'approved' 
    ? 'status = $2, approved_by = $3, approved_at = NOW()' 
    : 'status = $2, approved_by = NULL, approved_at = NULL';
  
  const params = approvedBy && status === 'approved' ? [enrollmentId, status, approvedBy] : [enrollmentId, status];
  
  const result = await query(
    `UPDATE enrollments SET ${updates} WHERE id = $1 RETURNING *`,
    params
  );
  return result.rows[0];
}

export async function deleteEnrollment(enrollmentId: number): Promise<boolean> {
  const result = await query("DELETE FROM enrollments WHERE id = $1 RETURNING id", [enrollmentId]);
  return result.rowCount > 0;
}

// ============================================
// PARENT MANAGEMENT
// ============================================

export async function getAllParents(search?: string, status?: string): Promise<any[]> {
  let sql = `
    SELECT 
      p.id, p.full_name as name, p.email, p.phone, p.occupation, p.address, 
      p.status, p.avatar,
      COALESCE(json_agg(
        json_build_object(
          'id', s.id,
          'name', s.full_name,
          'grade', s.grade_level,
          'studentId', s.id
        ) ORDER BY s.full_name
      ) FILTER (WHERE s.id IS NOT NULL), '[]') as children
    FROM parents p
    LEFT JOIN parent_student_links psl ON p.id = psl.parent_id
    LEFT JOIN users s ON psl.student_id = s.id AND s.role = 'student'
    WHERE 1=1
  `;
  const params: any[] = [];
  let paramIndex = 1;

  if (search) {
    sql += ` AND (p.full_name ILIKE $${paramIndex} OR p.email ILIKE $${paramIndex} OR p.phone ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (status && status !== 'All') {
    sql += ` AND p.status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  sql += ` GROUP BY p.id, p.full_name, p.email, p.phone, p.occupation, p.address, p.status, p.avatar ORDER BY p.id DESC`;

  const result = await query(sql, params);
  return result.rows;
}

export async function createParent(data: {
  full_name: string;
  email: string;
  phone?: string;
  occupation?: string;
  address?: string;
  status?: string;
  avatar?: string;
  studentIds?: number[];
}): Promise<any> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insert parent
    const parentResult = await client.query(
      `INSERT INTO parents (full_name, email, phone, occupation, address, status, avatar)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [data.full_name, data.email, data.phone || null, data.occupation || null, data.address || null, data.status || 'Active', data.avatar || null]
    );
    const parent = parentResult.rows[0];

    // Link students if provided - fetch email first
    if (data.studentIds && data.studentIds.length > 0) {
      for (const studentId of data.studentIds) {
        // Get student email
        const studentResult = await client.query(
          `SELECT email FROM users WHERE id = $1 AND role = 'student'`,
          [studentId]
        );
        if (studentResult.rows.length > 0 && studentResult.rows[0].email) {
          const studentEmail = studentResult.rows[0].email;
          await client.query(
            `INSERT INTO parent_student_links (parent_id, student_id, student_email) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
            [parent.id, studentId, studentEmail]
          );
        }
      }
    }

    await client.query('COMMIT');
    return parent;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function updateParent(parentId: number, data: Partial<{
  full_name: string;
  email: string;
  phone: string;
  occupation: string;
  address: string;
  status: string;
  avatar: string;
  studentIds: number[];
}>): Promise<any> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.full_name !== undefined) { updates.push(`full_name = $${paramIndex++}`); values.push(data.full_name); }
    if (data.email !== undefined) { updates.push(`email = $${paramIndex++}`); values.push(data.email); }
    if (data.phone !== undefined) { updates.push(`phone = $${paramIndex++}`); values.push(data.phone); }
    if (data.occupation !== undefined) { updates.push(`occupation = $${paramIndex++}`); values.push(data.occupation); }
    if (data.address !== undefined) { updates.push(`address = $${paramIndex++}`); values.push(data.address); }
    if (data.status !== undefined) { updates.push(`status = $${paramIndex++}`); values.push(data.status); }
    if (data.avatar !== undefined) { updates.push(`avatar = $${paramIndex++}`); values.push(data.avatar); }

    let parent = null;
    if (updates.length > 0) {
      values.push(parentId);
      const result = await client.query(
        `UPDATE parents SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        values
      );
      parent = result.rows[0];
    }

    // Update student links if provided
    if (data.studentIds !== undefined) {
      await client.query('DELETE FROM parent_student_links WHERE parent_id = $1', [parentId]);
      for (const studentId of data.studentIds) {
        // Get student email
        const studentResult = await client.query(
          `SELECT email FROM users WHERE id = $1 AND role = 'student'`,
          [studentId]
        );
        if (studentResult.rows.length > 0 && studentResult.rows[0].email) {
          const studentEmail = studentResult.rows[0].email;
          await client.query(
            `INSERT INTO parent_student_links (parent_id, student_id, student_email) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
            [parentId, studentId, studentEmail]
          );
        }
      }
    }

    await client.query('COMMIT');
    return parent || { id: parentId };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteParent(parentId: number): Promise<boolean> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM parent_student_links WHERE parent_id = $1', [parentId]);
    const result = await client.query('DELETE FROM parents WHERE id = $1 RETURNING id', [parentId]);
    await client.query('COMMIT');
    return result.rowCount > 0;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// ============================================
// EXAMS
// ============================================

export async function ensureExamsTable(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS exams (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      subject VARCHAR(100) NOT NULL,
      type VARCHAR(50) NOT NULL DEFAULT 'Quiz',
      grade VARCHAR(50),
      teacher_name VARCHAR(150),
      date DATE NOT NULL,
      start_time VARCHAR(10),
      end_time VARCHAR(10),
      duration INTEGER DEFAULT 60,
      location VARCHAR(255) DEFAULT 'TBD',
      total_marks INTEGER DEFAULT 100,
      pass_marks INTEGER DEFAULT 40,
      status VARCHAR(50) DEFAULT 'Upcoming',
      enrolled INTEGER DEFAULT 0,
      instructions TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  // Add teacher_name if missing on existing tables
  await query(`ALTER TABLE exams ADD COLUMN IF NOT EXISTS teacher_name VARCHAR(150)`);
}

export async function getAllExams(filters?: { status?: string; grade?: string; search?: string }): Promise<any[]> {
  try {
    await ensureExamsTable();
    let sql = `
      SELECT e.*
      FROM exams e
      WHERE 1=1
    `;
    const params: any[] = [];
    let i = 1;
    if (filters?.status && filters.status !== 'All') { sql += ` AND e.status = $${i++}`; params.push(filters.status); }
    if (filters?.grade && filters.grade !== 'All') { sql += ` AND e.grade = $${i++}`; params.push(filters.grade); }
    if (filters?.search) { sql += ` AND (e.title ILIKE $${i} OR e.subject ILIKE $${i})`; params.push(`%${filters.search}%`); i++; }
    sql += ` ORDER BY e.date DESC`;
    const res = await query(sql, params);
    return res.rows;
  } catch (error) {
    console.error('getAllExams error:', error);
    return [];
  }
}

export async function createExam(data: any): Promise<any> {
  await ensureExamsTable();
  const res = await query(
    `INSERT INTO exams (title, subject, type, grade, teacher_name, date, start_time, end_time, duration, location, total_marks, pass_marks, status, enrolled, instructions)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
    [data.title, data.subject, data.type || 'Quiz', data.grade, data.teacher_name || null,
     data.date, data.start_time || '09:00', data.end_time || '10:00', data.duration || 60,
     data.location || 'TBD', data.total_marks || 100, data.pass_marks || 40,
     data.status || 'Upcoming', data.enrolled || 0, data.instructions || '']
  );
  return res.rows[0];
}

export async function updateExam(examId: number, data: any): Promise<any> {
  const fields = ['title','subject','type','grade','teacher_name','date','start_time','end_time','duration','location','total_marks','pass_marks','status','enrolled','instructions'];
  const updates: string[] = [];
  const values: any[] = [];
  let i = 1;
  for (const f of fields) {
    if (data[f] !== undefined) { updates.push(`${f} = $${i++}`); values.push(data[f]); }
  }
  if (!updates.length) return null;
  values.push(examId);
  const res = await query(`UPDATE exams SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`, values);
  return res.rows[0];
}

export async function deleteExam(examId: number): Promise<boolean> {
  const res = await query('DELETE FROM exams WHERE id = $1 RETURNING id', [examId]);
  return (res.rowCount ?? 0) > 0;
}

// ============================================
// ATTENDANCE
// ============================================

export async function ensureAttendanceTable(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS attendance (
      id SERIAL PRIMARY KEY,
      student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'Present',
      note TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(student_id, date)
    )
  `);
}

export async function getAttendanceStudents(filters?: { grade?: string; search?: string }): Promise<any[]> {
  try {
    await ensureAttendanceTable();
    let sql = `
      SELECT
        u.id, u.full_name AS name, u.email,
        u.grade_level,
        u.phone,
        COUNT(a.id) FILTER (WHERE a.status = 'Present') AS present_days,
        COUNT(a.id) FILTER (WHERE a.status = 'Absent')  AS absent_days,
        COUNT(a.id) FILTER (WHERE a.status = 'Late')    AS late_days,
        COUNT(a.id) FILTER (WHERE a.status = 'Excused') AS excused_days,
        COUNT(a.id) AS total_recorded,
        json_agg(json_build_object('date', a.date, 'status', a.status) ORDER BY a.date DESC) FILTER (WHERE a.id IS NOT NULL) AS history
      FROM users u
      LEFT JOIN student_profiles sp ON sp.user_id = u.id
      LEFT JOIN attendance a ON a.student_id = u.id
      WHERE u.role = 'student' AND u.is_active = true
    `;
    const params: any[] = [];
    let i = 1;
    if (filters?.grade && filters.grade !== 'All') { sql += ` AND u.grade_level = $${i++}`; params.push(parseInt(filters.grade.replace('Grade ', ''))); }
    if (filters?.search) { sql += ` AND (u.full_name ILIKE $${i} OR u.email ILIKE $${i})`; params.push(`%${filters.search}%`); i++; }
    sql += ` GROUP BY u.id, u.full_name, u.email, u.grade_level, sp.phone ORDER BY u.full_name`;
    const res = await query(sql, params);
    return res.rows;
  } catch (error) {
    console.error('getAttendanceStudents error:', error);
    return [];
  }
}

export async function upsertAttendance(studentId: number, date: string, status: string, note?: string): Promise<any> {
  await ensureAttendanceTable();
  const res = await query(
    `INSERT INTO attendance (student_id, date, status, note)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (student_id, date) DO UPDATE SET status = $3, note = $4
     RETURNING *`,
    [studentId, date, status, note || null]
  );
  return res.rows[0];
}

export async function getAttendanceSummary(): Promise<any> {
  try {
    await ensureAttendanceTable();
    const today = new Date().toISOString().slice(0, 10);
    const res = await query(`
      SELECT
        COUNT(*) FILTER (WHERE a.status = 'Present' AND a.date = $1) AS today_present,
        COUNT(*) FILTER (WHERE a.status = 'Absent'  AND a.date = $1) AS today_absent,
        COUNT(*) FILTER (WHERE a.status = 'Late'    AND a.date = $1) AS today_late,
        COUNT(DISTINCT u.id) AS total_students
      FROM users u
      LEFT JOIN attendance a ON a.student_id = u.id
      WHERE u.role = 'student' AND u.is_active = true
    `, [today]);
    return res.rows[0];
  } catch (error) {
    console.error('getAttendanceSummary error:', error);
    return { today_present: 0, today_absent: 0, today_late: 0, total_students: 0 };
  }
}

// ============================================
// ANNOUNCEMENTS
// ============================================

export async function ensureAnnouncementsTable(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS announcements (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      body TEXT NOT NULL,
      audience VARCHAR(50) DEFAULT 'All',
      status VARCHAR(50) DEFAULT 'Published',
      priority VARCHAR(50) DEFAULT 'Normal',
      pinned BOOLEAN DEFAULT false,
      author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      author_name VARCHAR(150),
      author_role VARCHAR(100) DEFAULT 'Admin',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      scheduled_at TIMESTAMPTZ
    )
  `);
  // Add any missing columns on pre-existing tables
  await query(`ALTER TABLE announcements ADD COLUMN IF NOT EXISTS pinned BOOLEAN DEFAULT false`);
  await query(`ALTER TABLE announcements ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0`);
  await query(`ALTER TABLE announcements ADD COLUMN IF NOT EXISTS priority VARCHAR(50) DEFAULT 'Normal'`);
  await query(`ALTER TABLE announcements ADD COLUMN IF NOT EXISTS audience VARCHAR(50) DEFAULT 'All'`);
  await query(`ALTER TABLE announcements ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Published'`);
  await query(`ALTER TABLE announcements ADD COLUMN IF NOT EXISTS author_name VARCHAR(150)`);
  await query(`ALTER TABLE announcements ADD COLUMN IF NOT EXISTS author_role VARCHAR(100) DEFAULT 'Admin'`);
  await query(`ALTER TABLE announcements ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ`);
}

export async function getAllAnnouncements(filters?: { audience?: string; status?: string; search?: string }): Promise<any[]> {
  try {
    await ensureAnnouncementsTable();
    let sql = `SELECT * FROM announcements WHERE 1=1`;
    const params: any[] = [];
    let i = 1;
    if (filters?.audience && filters.audience !== 'All') { sql += ` AND audience = $${i++}`; params.push(filters.audience); }
    if (filters?.status && filters.status !== 'All') { sql += ` AND status = $${i++}`; params.push(filters.status); }
    if (filters?.search) { sql += ` AND (title ILIKE $${i} OR body ILIKE $${i})`; params.push(`%${filters.search}%`); i++; }
    sql += ` ORDER BY pinned DESC, created_at DESC`;
    const res = await query(sql, params);
    return res.rows;
  } catch (error) {
    console.error('getAllAnnouncements error:', error);
    return [];
  }
}

export async function createAnnouncement(data: any): Promise<any> {
  await ensureAnnouncementsTable();
  const res = await query(
    `INSERT INTO announcements (title, body, audience, status, priority, pinned, author_id, author_name, author_role)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [data.title, data.body, data.audience || 'All', data.status || 'Published',
     data.priority || 'Normal', data.pinned || false,
     data.author_id || null, data.author_name || 'Admin', data.author_role || 'Admin']
  );
  return res.rows[0];
}

export async function updateAnnouncement(id: number, data: any): Promise<any> {
  await ensureAnnouncementsTable();
  const fields = ['title','body','audience','status','priority','pinned','views','scheduled_at','author_name','author_role'];
  const updates: string[] = [];
  const values: any[] = [];
  let i = 1;
  for (const f of fields) {
    if (data[f] !== undefined) { updates.push(`${f} = $${i++}`); values.push(data[f]); }
  }
  if (!updates.length) return null;
  const numId = typeof id === 'number' ? id : parseInt(String(id), 10);
  if (isNaN(numId)) return null;
  values.push(numId);
  const res = await query(`UPDATE announcements SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`, values);
  return res.rows[0];
}

export async function deleteAnnouncement(id: number): Promise<boolean> {
  const numId = typeof id === 'number' ? id : parseInt(String(id), 10);
  if (isNaN(numId)) return false;
  const res = await query('DELETE FROM announcements WHERE id = $1 RETURNING id', [numId]);
  return (res.rowCount ?? 0) > 0;
}

// ============================================
// CALENDAR EVENTS
// ============================================

export async function ensureCalendarTable(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS calendar_events (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      date DATE NOT NULL,
      end_date DATE,
      start_time VARCHAR(10),
      end_time VARCHAR(10),
      all_day BOOLEAN DEFAULT false,
      location VARCHAR(255),
      type VARCHAR(50) DEFAULT 'class',
      description TEXT,
      attendees VARCHAR(255),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

export async function getAllCalendarEvents(filters?: { type?: string; month?: number; year?: number }): Promise<any[]> {
  try {
    await ensureCalendarTable();
    let sql = `SELECT * FROM calendar_events WHERE 1=1`;
    const params: any[] = [];
    let i = 1;
    if (filters?.type && filters.type !== 'all') { sql += ` AND type = $${i++}`; params.push(filters.type); }
    if (filters?.year && filters.month !== undefined) {
      const start = `${filters.year}-${String(filters.month + 1).padStart(2, '0')}-01`;
      const end = new Date(filters.year, filters.month + 1, 1).toISOString().slice(0, 10);
      sql += ` AND date >= $${i++} AND date < $${i++}`;
      params.push(start, end);
    }
    sql += ` ORDER BY date ASC`;
    const res = await query(sql, params);
    return res.rows;
  } catch (error) {
    console.error('getAllCalendarEvents error:', error);
    return [];
  }
}

export async function createCalendarEvent(data: any): Promise<any> {
  await ensureCalendarTable();
  const res = await query(
    `INSERT INTO calendar_events (title, date, end_date, start_time, end_time, all_day, location, type, description, attendees)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [data.title, data.date, data.end_date || null, data.start_time || null,
     data.end_time || null, data.all_day || false, data.location || null,
     data.type || 'class', data.description || null, data.attendees || null]
  );
  return res.rows[0];
}

export async function updateCalendarEvent(id: number, data: any): Promise<any> {
  const fields = ['title','date','end_date','start_time','end_time','all_day','location','type','description','attendees'];
  const updates: string[] = [];
  const values: any[] = [];
  let i = 1;
  for (const f of fields) {
    if (data[f] !== undefined) { updates.push(`${f} = $${i++}`); values.push(data[f]); }
  }
  if (!updates.length) return null;
  values.push(id);
  const res = await query(`UPDATE calendar_events SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`, values);
  return res.rows[0];
}

export async function deleteCalendarEvent(id: number): Promise<boolean> {
  const res = await query('DELETE FROM calendar_events WHERE id = $1 RETURNING id', [id]);
  return (res.rowCount ?? 0) > 0;
}

// ============================================
// TASKS
// ============================================

export async function ensureTasksTable(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS admin_tasks (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      assignee VARCHAR(150),
      assignee_avatar VARCHAR(500),
      priority VARCHAR(50) DEFAULT 'Medium',
      due DATE,
      status VARCHAR(50) DEFAULT 'To Do',
      tag VARCHAR(100) DEFAULT 'Administrative',
      checklist JSONB DEFAULT '[]',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

export async function getAllTasks(filters?: { status?: string; priority?: string; search?: string }): Promise<any[]> {
  try {
    await ensureTasksTable();
    let sql = `SELECT * FROM admin_tasks WHERE 1=1`;
    const params: any[] = [];
    let i = 1;
    if (filters?.status && filters.status !== 'All') { sql += ` AND status = $${i++}`; params.push(filters.status); }
    if (filters?.priority && filters.priority !== 'All') { sql += ` AND priority = $${i++}`; params.push(filters.priority); }
    if (filters?.search) { sql += ` AND (title ILIKE $${i} OR description ILIKE $${i})`; params.push(`%${filters.search}%`); i++; }
    sql += ` ORDER BY CASE priority WHEN 'High' THEN 1 WHEN 'Medium' THEN 2 ELSE 3 END, due ASC NULLS LAST`;
    const res = await query(sql, params);
    return res.rows;
  } catch (error) {
    console.error('getAllTasks error:', error);
    return [];
  }
}

export async function createTask(data: any): Promise<any> {
  await ensureTasksTable();
  const res = await query(
    `INSERT INTO admin_tasks (title, description, assignee, assignee_avatar, priority, due, status, tag, checklist)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [data.title, data.description || '', data.assignee || 'Admin',
     data.assignee_avatar || '', data.priority || 'Medium',
     data.due || null, data.status || 'To Do', data.tag || 'Administrative',
     JSON.stringify(data.checklist || [])]
  );
  return res.rows[0];
}

export async function updateTask(id: number, data: any): Promise<any> {
  const fields = ['title','description','assignee','assignee_avatar','priority','due','status','tag','checklist'];
  const updates: string[] = [];
  const values: any[] = [];
  let i = 1;
  for (const f of fields) {
    if (data[f] !== undefined) {
      updates.push(`${f} = $${i++}`);
      values.push(f === 'checklist' ? JSON.stringify(data[f]) : data[f]);
    }
  }
  if (!updates.length) return null;
  values.push(id);
  const res = await query(`UPDATE admin_tasks SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`, values);
  return res.rows[0];
}

export async function deleteTask(id: number): Promise<boolean> {
  const res = await query('DELETE FROM admin_tasks WHERE id = $1 RETURNING id', [id]);
  return (res.rowCount ?? 0) > 0;
}

// ============================================
// MESSAGES
// ============================================

export async function ensureMessagesTable(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS admin_messages (
      id SERIAL PRIMARY KEY,
      sender_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      recipient_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      sender_name VARCHAR(150),
      recipient_name VARCHAR(150),
      text TEXT NOT NULL,
      direction VARCHAR(10) DEFAULT 'out',
      read BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

export async function getConversations(adminId: number): Promise<any[]> {
  try {
    await ensureMessagesTable();
    const res = await query(`
      SELECT DISTINCT ON (
        LEAST(sender_id, recipient_id), GREATEST(sender_id, recipient_id)
      )
        m.id, m.sender_id, m.recipient_id,
        m.sender_name, m.recipient_name,
        m.text AS last_message,
        m.created_at,
        m.read,
        m.direction,
        CASE WHEN m.sender_id = $1 THEN m.recipient_id ELSE m.sender_id END AS other_user_id,
        CASE WHEN m.sender_id = $1 THEN m.recipient_name ELSE m.sender_name END AS other_user_name,
        u.role AS other_user_role
      FROM admin_messages m
      LEFT JOIN users u ON u.id = (CASE WHEN m.sender_id = $1 THEN m.recipient_id ELSE m.sender_id END)
      WHERE m.sender_id = $1 OR m.recipient_id = $1
      ORDER BY LEAST(sender_id, recipient_id), GREATEST(sender_id, recipient_id), m.created_at DESC
    `, [adminId]);
    return res.rows;
  } catch (error) {
    console.error('getConversations error:', error);
    return [];
  }
}

export async function getMessages(adminId: number, otherId: number): Promise<any[]> {
  try {
    await ensureMessagesTable();
    const res = await query(`
      SELECT * FROM admin_messages
      WHERE (sender_id = $1 AND recipient_id = $2) OR (sender_id = $2 AND recipient_id = $1)
      ORDER BY created_at ASC
    `, [adminId, otherId]);
    await query(`UPDATE admin_messages SET read = true WHERE recipient_id = $1 AND sender_id = $2 AND read = false`, [adminId, otherId]);
    return res.rows;
  } catch (error) {
    console.error('getMessages error:', error);
    return [];
  }
}

export async function sendMessage(data: { sender_id: number; recipient_id: number; sender_name: string; recipient_name: string; text: string }): Promise<any> {
  await ensureMessagesTable();
  const res = await query(
    `INSERT INTO admin_messages (sender_id, recipient_id, sender_name, recipient_name, text, direction)
     VALUES ($1,$2,$3,$4,$5,'out') RETURNING *`,
    [data.sender_id, data.recipient_id, data.sender_name, data.recipient_name, data.text]
  );
  return res.rows[0];
}

export async function getUnreadCount(userId: number): Promise<number> {
  try {
    await ensureMessagesTable();
    const res = await query(`SELECT COUNT(*) FROM admin_messages WHERE recipient_id = $1 AND read = false`, [userId]);
    return parseInt(res.rows[0].count, 10);
  } catch {
    return 0;
  }
}

// ============================================
// PAGE SETTINGS
// ============================================

export async function ensurePageSettingsTable(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS admin_page_settings (
      id SERIAL PRIMARY KEY,
      route VARCHAR(255) NOT NULL UNIQUE,
      visible BOOLEAN DEFAULT true,
      visibility VARCHAR(50) DEFAULT 'Role-Based',
      description TEXT,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

export async function getAllPageSettings(): Promise<any[]> {
  await ensurePageSettingsTable();
  const res = await query(`SELECT * FROM admin_page_settings ORDER BY route`);
  return res.rows;
}

export async function upsertPageSetting(route: string, data: { visible?: boolean; visibility?: string; description?: string }): Promise<any> {
  await ensurePageSettingsTable();
  const res = await query(
    `INSERT INTO admin_page_settings (route, visible, visibility, description, updated_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (route) DO UPDATE SET
       visible = EXCLUDED.visible,
       visibility = EXCLUDED.visibility,
       description = EXCLUDED.description,
       updated_at = NOW()
     RETURNING *`,
    [route, data.visible ?? true, data.visibility ?? 'Role-Based', data.description ?? '']
  );
  return res.rows[0];
}
