import dotenv from 'dotenv';
dotenv.config({ path: './apps/api/.env' });
import { initDb, pool } from './apps/api/src/db/index';
import { createTeacherResource } from './apps/api/src/models/resource.model';

async function test() {
  try {
    const user = await pool.query("SELECT id FROM users WHERE email = 'anderson@school.edu'");
    if (user.rows.length === 0) {
      console.log('User not found');
      return;
    }
    const teacherId = user.rows[0].id;
    console.log('Teacher ID:', teacherId);

    const subjects = await pool.query("SELECT s.name FROM subjects s JOIN teacher_subjects ts ON s.id = ts.subject_id WHERE ts.teacher_id = $1", [teacherId]);
    console.log('Teacher subjects:', subjects.rows);

    if (subjects.rows.length > 0) {
      const subjectName = subjects.rows[0].name;
      console.log('Testing with subject:', subjectName);
      
      const res = await createTeacherResource(teacherId, {
        title: "Test Resource",
        description: "Test description",
        type: "Video",
        subject: subjectName,
        cover: "http://cover.jpg"
      });
      console.log('Success:', res);
    }
  } catch (err: any) {
    console.error('Error:', err.message);
  } finally {
    process.exit();
  }
}

test();
