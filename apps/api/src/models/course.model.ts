import { pool } from '../db/index';

export const getAllCourses = async (userId: number) => {
  try {
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
  } catch (error) {
    console.error('Database error in getAllCourses:', error);
    return []; // Return empty array if database is unreachable
  }
};

export const getCourseBySlug = async (slug: string, userId: number) => {
  try {
    const courseRes = await pool.query(`
      SELECT 
        s.id, 
        s.slug, 
        s.name as title, 
        s.instructor, 
        s.description as tagline,
        COALESCE(
          (SELECT COUNT(*)::float / NULLIF(COUNT(*), 0) * 100 
           FROM lessons l 
           LEFT JOIN lesson_completion lc ON l.id = lc.lesson_id AND lc.user_id = $2
           WHERE l.subject_id = s.id AND lc.is_completed = true), 0
        ) as progress,
        '#2563eb' as accentColor
      FROM subjects s
      WHERE s.slug = $1
    `, [slug, userId]);

    if (courseRes.rows.length === 0) return null;

  const course = courseRes.rows[0];

  // Get modules with lessons
  const modulesRes = await pool.query(`
    SELECT m.id, m.title, m.order_no
    FROM modules m
    WHERE m.subject_id = $1
    ORDER BY m.order_no ASC
  `, [course.id]);

  const modules = await Promise.all(modulesRes.rows.map(async (module, moduleIndex) => {
    const lessonsRes = await pool.query(`
      SELECT 
        l.id, 
        l.title, 
        l.order_no,
        l.description,
        COALESCE(lc.is_completed, false) as is_completed
      FROM lessons l
      LEFT JOIN lesson_completion lc ON l.id = lc.lesson_id AND lc.user_id = $2
      WHERE l.module_id = $1
      ORDER BY l.order_no ASC
    `, [module.id, userId]);

    // Transform lessons with status
    let foundCurrent = false;
    const lessons = lessonsRes.rows.map((lesson: any, lessonIndex: number) => {
      let status: string;
      if (lesson.is_completed) {
        status = 'completed';
      } else if (!foundCurrent) {
        status = 'current';
        foundCurrent = true;
      } else {
        status = 'locked';
      }
      return {
        id: String(lesson.id),
        title: lesson.title,
        status,
        type: lesson.type || 'video',
        duration: lesson.duration || '10 min',
        description: lesson.description || ''
      };
    });

    return {
      id: String(module.id) || `module-${moduleIndex}`,
      title: module.title,
      lessons
    };
  }));

  // Mock resources and upcoming for now
  const resources = [
    { id: 'r1', title: 'Course Syllabus', icon: 'file', count: 1 },
    { id: 'r2', title: 'Workbook PDFs', icon: 'file', count: 3 },
    { id: 'r3', title: 'Practice Tests', icon: 'file', count: 2 }
  ];

  const upcoming = [
    { id: 'u1', type: 'assignment', title: 'Mid-term Assignment', deadline: '2024-11-15' },
    { id: 'u2', type: 'quiz', title: 'Chapter 5 Quiz', deadline: '2024-11-20' }
  ];

  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    tagline: course.tagline || course.description || '',
    image: course.image || '',
    accentColor: course.accentColor || '#2563eb',
    progress: Math.round(course.progress || 0),
    instructor: course.instructor,
    instructorRole: 'Teacher',
    instructorImage: '',
    modules: modules.length > 0 ? modules : [
      {
        id: 'default-module',
        title: 'Course Content',
        lessons: [
          { id: 'lesson-1', title: 'Introduction', status: 'current', type: 'video', duration: '10 min', description: 'Course introduction' }
        ]
      }
    ],
    resources,
    upcoming
  };
  } catch (error) {
    console.error('Database error in getCourseBySlug:', error);
    // Return fallback mock course when database is unreachable
    return {
      id: 'fallback-' + slug,
      slug: slug,
      title: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      tagline: 'Course content unavailable - database connection error',
      image: '',
      accentColor: '#2563eb',
      progress: 0,
      instructor: 'TBD',
      instructorRole: 'Teacher',
      instructorImage: '',
      modules: [
        {
          id: 'default-module',
          title: 'Course Content',
          lessons: [
            { id: 'lesson-1', title: 'Introduction', status: 'current', type: 'video', duration: '10 min', description: 'Course introduction' }
          ]
        }
      ],
      resources: [
        { id: 'r1', title: 'Course Syllabus', icon: 'file', count: 1 },
        { id: 'r2', title: 'Workbook PDFs', icon: 'file', count: 3 }
      ],
      upcoming: [
        { id: 'u1', type: 'assignment', title: 'Mid-term Assignment', deadline: '2024-11-15' }
      ]
    };
  }
};
