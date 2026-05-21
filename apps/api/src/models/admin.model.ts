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
