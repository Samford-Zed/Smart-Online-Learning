import { pool } from '../db/index';

export interface ParentDashboardData {
  child: {
    id: number;
    fullName: string;
    grade: string;
    avatarUrl?: string;
  };
  summary: {
    gpa: number;
    attendance: number;
    schoolName: string;
  };
  currentSubjects: Array<{
    id: number;
    name: string;
    progress: number;
    currentTopic: string;
  }>;
  recentActivity: Array<{
    id: number;
    type: 'quiz' | 'submission' | 'system';
    title: string;
    score?: number;
    timestamp: string;
    status: 'success' | 'warning' | 'info';
  }>;
}

export const getLinkedStudent = async (parentId: number) => {
  const result = await pool.query(
    `SELECT u.id, COALESCE(u.full_name, split_part(u.email, '@', 1)) as "fullName", u.grade_level as "grade"
     FROM parent_student_links psl
     JOIN users u ON psl.student_id = u.id
     WHERE psl.parent_id = $1`,
    [parentId]
  );
  return result.rows[0];
};

export const getParentName = async (parentId: number) => {
  const result = await pool.query('SELECT full_name as "fullName" FROM users WHERE id = $1', [parentId]);
  return result.rows[0]?.fullName || 'Parent';
};

export const getChildSummary = async (studentId: number) => {
  // Mocking GPA and Attendance for now as they require complex aggregation
  // In a real scenario, we'd query quiz_submissions and session logs
  const result = await pool.query(
    `SELECT 
      (SELECT school_preference->>'name' FROM student_profiles WHERE user_id = $1) as "schoolName"`,
    [studentId]
  );
  
  return {
    gpa: 3.8, // Should be calculated from quiz_submissions
    attendance: 95, // Should be calculated from attendance table
    schoolName: result.rows[0]?.schoolName || 'EduSmart Academy'
  };
};

export const getChildSubjects = async (studentId: number) => {
  const result = await pool.query(
    `SELECT s.id, s.name, 
      (SELECT COUNT(*)::float / NULLIF((SELECT COUNT(*) FROM lessons WHERE subject_id = s.id), 0) * 100 
       FROM lesson_completion lc 
       JOIN lessons l ON lc.lesson_id = l.id 
       WHERE lc.user_id = $1 AND l.subject_id = s.id) as progress,
      (SELECT title FROM lessons WHERE subject_id = s.id ORDER BY order_no DESC LIMIT 1) as "currentTopic"
     FROM subjects s
     JOIN users u ON u.grade_level = s.grade
     WHERE u.id = $1`,
    [studentId]
  );
  
  return result.rows.map(row => ({
    id: row.id,
    name: row.name,
    progress: Math.round(row.progress || 0),
    currentTopic: row.currentTopic || 'Introduction'
  }));
};

export const getRecentActivity = async (studentId: number) => {
  const result = await pool.query(
    `(SELECT qs.id, 'quiz' as type, q.title, qs.score, qs.submitted_at as timestamp, 'success' as status
      FROM quiz_submissions qs
      JOIN quizzes q ON qs.quiz_id = q.id
      WHERE qs.user_id = $1
      ORDER BY timestamp DESC
      LIMIT 5)
     UNION ALL
     (SELECT asub.id, 'submission' as type, a.title, asub.score, asub.submitted_at as timestamp, 'info' as status
      FROM assignment_submissions asub
      JOIN assignments a ON asub.assignment_id = a.id
      WHERE asub.user_id = $1
      ORDER BY timestamp DESC
      LIMIT 5)
     ORDER BY timestamp DESC
     LIMIT 5`,
    [studentId]
  );
  
  return result.rows;
};

export const getReportCard = async (studentId: number, semester: string) => {
  // Existing report card logic
  const subjects = await getChildSubjects(studentId);
  const summary = await getChildSummary(studentId);
  const childResult = await pool.query('SELECT full_name as "fullName", grade_level as "grade" FROM users WHERE id = $1', [studentId]);
  const child = childResult.rows[0];

  return {
    student: {
      id: studentId,
      fullName: child.fullName,
      grade: child.grade
    },
    school: {
      name: summary.schoolName,
      logoUrl: '/assets/logo.png',
      term: semester
    },
    advisor: {
      name: 'Dr. Jane Smith',
      signatureReady: true
    },
    generatedAt: new Date().toISOString(),
    semester: semester,
    gpa: summary.gpa,
    subjects: await Promise.all(subjects.map(async s => {
      const assessments = await pool.query(
        `SELECT q.title, qs.score, qs.total_questions as total
         FROM quiz_submissions qs
         JOIN quizzes q ON qs.quiz_id = q.id
         JOIN lessons l ON q.lesson_id = l.id
         WHERE qs.user_id = $1 AND l.subject_id = $2`,
        [studentId, s.id]
      );
      
      return {
        ...s,
        grade: 'A',
        score: s.progress,
        teacher: 'Mr. X',
        assessments: assessments.rows.map(a => ({
          name: a.title,
          score: Math.round((a.score / (a.total || 1)) * 100)
        }))
      };
    })),
    strengths: ['Mathematics', 'Science'],
    opportunities: ['History Writing']
  };
};

export const getStudentProgress = async (studentId: number, period: string) => {
  const summary = await getChildSummary(studentId);
  const subjects = await getChildSubjects(studentId);

  return {
    gpaTrend: [3.5, 3.6, 3.8, 3.7, 3.8], // Mocked for UI
    attendance: summary.attendance,
    credits: {
      earned: 18,
      total: 24
    },
    subjects: await Promise.all(subjects.map(async s => {
      const assessments = await pool.query(
        `SELECT q.title, qs.score, qs.total_questions as total
         FROM quiz_submissions qs
         JOIN quizzes q ON qs.quiz_id = q.id
         JOIN lessons l ON q.lesson_id = l.id
         WHERE qs.user_id = $1 AND l.subject_id = $2`,
        [studentId, s.id]
      );
      
      return {
        name: s.name,
        grade: 'A',
        score: s.progress,
        attendance: 98,
        teacher: 'Mr. X',
        assessments: assessments.rows.map(a => ({
          name: a.title,
          score: Math.round((a.score / (a.total || 1)) * 100)
        }))
      };
    })),
    strengths: ['Mathematics', 'Science'],
    opportunities: ['Problem Solving', 'Time Management']
  };
};
