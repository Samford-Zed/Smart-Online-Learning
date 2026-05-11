import { pool } from '../db/index';

export interface User {
  id: number;
  fullName: string;
  email: string;
  password?: string;
  role: 'student' | 'teacher' | 'parent' | 'admin';
  gradeLevel?: string;
}

export const findUserByEmail = async (email: string) => {
  const result = await pool.query('SELECT id, full_name as "fullName", email, role, password, grade_level as "gradeLevel" FROM users WHERE email = $1', [email]);
  return result.rows[0];
};

export const registerUser = async (fullName: string, email: string, passwordHash: string, role: string, gradeLevel?: string, studentEmail?: string, profileData?: any) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // 1. Insert user
    const result = await client.query(
      'INSERT INTO users (full_name, email, password, role, grade_level) VALUES ($1, $2, $3, $4, $5) RETURNING id, full_name as "fullName", email, role, grade_level as "gradeLevel"',
      [fullName, email, passwordHash, role, gradeLevel]
    );
    const user = result.rows[0];

    // 2. STUDENT REGISTRATION FLOW
    if (role === 'student') {
      // Create profile with all provided info
      const studentInfo = {
        grade: gradeLevel,
        ...(profileData || {})
      };

      await client.query(
        'INSERT INTO student_profiles (user_id, student_info) VALUES ($1, $2)',
        [user.id, JSON.stringify(studentInfo)]
      );

      // Auto-link logic: find ParentStudentLink where studentEmail === email
      const linkResult = await client.query(
        'SELECT id FROM parent_student_links WHERE student_email = $1 AND student_id IS NULL',
        [email]
      );
      
      if (linkResult.rows.length > 0) {
        await client.query(
          'UPDATE parent_student_links SET student_id = $1 WHERE student_email = $2',
          [user.id, email]
        );
      }
    }

    // 3. PARENT REGISTRATION FLOW
    if (role === 'parent' && studentEmail) {
      // Check if student already exists
      const studentResult = await client.query(
        'SELECT id FROM users WHERE email = $1 AND role = \'student\'',
        [studentEmail]
      );
      const studentId = studentResult.rows.length > 0 ? studentResult.rows[0].id : null;

      // Create linking record
      await client.query(
        'INSERT INTO parent_student_links (parent_id, student_email, student_id) VALUES ($1, $2, $3)',
        [user.id, studentEmail, studentId]
      );
    }

    await client.query('COMMIT');
    return user;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

