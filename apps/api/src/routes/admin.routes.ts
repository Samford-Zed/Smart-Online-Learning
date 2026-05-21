import { Router } from "express";
import bcrypt from "bcrypt";
import { authenticateJWT } from "../middlewares/authenticateJWT";
import * as adminModel from "../models/admin.model";
import { query } from "../db";

const router = Router();

// ============================================
// MIDDLEWARE - Require Admin Role
// ============================================
function requireAdmin(req: any, res: any, next: any) {
  if (!req.auth || req.auth.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

// Apply auth and admin middleware to all routes
router.use(authenticateJWT, requireAdmin);

// ============================================
// DASHBOARD STATS
// ============================================

router.get("/dashboard", async (req, res) => {
  try {
    const stats = await adminModel.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.status(500).json({ success: false, message: "Failed to load dashboard stats" });
  }
});

// ============================================
// USER MANAGEMENT
// ============================================

// Get all users with filters
router.get("/users", async (req, res) => {
  try {
    const { role, grade, search, isActive, limit = "50", offset = "0" } = req.query;
    
    const result = await adminModel.getAllUsers(
      {
        role: role as string,
        grade: grade ? parseInt(grade as string, 10) : undefined,
        search: search as string,
        isActive: isActive !== undefined ? isActive === "true" : undefined,
      },
      parseInt(limit as string, 10),
      parseInt(offset as string, 10)
    );

    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ success: false, message: "Failed to load users" });
  }
});

// Get user by ID
router.get("/users/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const user = await adminModel.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    res.json({ success: true, data: user });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ success: false, message: "Failed to load user" });
  }
});

// Create new user
router.post("/users", async (req, res) => {
  try {
    const { name, email, password, role, grade_level } = req.body;
    
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await adminModel.createUser({
      name,
      email,
      password: hashedPassword,
      role,
      grade_level,
    });

    // Log the action
    await adminModel.createLogEntry(req.auth?.userId, "user_created", { userId: user.id, email });

    res.status(201).json({ success: true, data: user });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ success: false, message: "Failed to create user" });
  }
});

// Update user
router.put("/users/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const updates = req.body;
    
    // If password is being updated, hash it
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }
    
    const user = await adminModel.updateUser(userId, updates);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await adminModel.createLogEntry(req.auth?.userId, "user_updated", { userId, updates });

    res.json({ success: true, data: user });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ success: false, message: "Failed to update user" });
  }
});

// Deactivate/Delete user
router.delete("/users/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const success = await adminModel.deleteUser(userId);
    
    if (!success) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await adminModel.createLogEntry(req.auth?.userId, "user_deactivated", { userId });

    res.json({ success: true, message: "User deactivated successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ success: false, message: "Failed to deactivate user" });
  }
});

// Reset user password
router.post("/users/:id/reset-password", async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { newPassword } = req.body;
    
    if (!newPassword) {
      return res.status(400).json({ success: false, message: "New password required" });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const success = await adminModel.resetUserPassword(userId, hashedPassword);
    
    if (!success) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await adminModel.createLogEntry(req.auth?.userId, "password_reset", { userId });

    res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ success: false, message: "Failed to reset password" });
  }
});

// ============================================
// SUBJECT/CURRICULUM MANAGEMENT
// ============================================

router.get("/subjects", async (req, res) => {
  try {
    const subjects = await adminModel.getAllSubjects();
    res.json({ success: true, data: subjects });
  } catch (error) {
    console.error("Get subjects error:", error);
    res.status(500).json({ success: false, message: "Failed to load subjects" });
  }
});

router.post("/subjects", async (req, res) => {
  try {
    const { name, slug, description, instructor, grade } = req.body;
    
    if (!name || !slug) {
      return res.status(400).json({ success: false, message: "Name and slug required" });
    }
    
    const subject = await adminModel.createSubject({ name, slug, description, instructor, grade });
    res.status(201).json({ success: true, data: subject });
  } catch (error) {
    console.error("Create subject error:", error);
    res.status(500).json({ success: false, message: "Failed to create subject" });
  }
});

router.delete("/subjects/:id", async (req, res) => {
  try {
    const subjectId = parseInt(req.params.id, 10);
    const success = await adminModel.deleteSubject(subjectId);
    
    if (!success) {
      return res.status(404).json({ success: false, message: "Subject not found" });
    }
    
    res.json({ success: true, message: "Subject deleted successfully" });
  } catch (error) {
    console.error("Delete subject error:", error);
    res.status(500).json({ success: false, message: "Failed to delete subject" });
  }
});

// ============================================
// MODULE MANAGEMENT - Phase 3
// ============================================

router.get("/subjects/:id/modules", async (req, res) => {
  try {
    const subjectId = parseInt(req.params.id, 10);
    const modules = await adminModel.getModulesBySubject(subjectId);
    res.json({ success: true, data: modules });
  } catch (error) {
    console.error("Get modules error:", error);
    res.status(500).json({ success: false, message: "Failed to load modules" });
  }
});

router.post("/modules", async (req, res) => {
  try {
    const { subject_id, title, order_no, description } = req.body;
    
    if (!subject_id || !title || order_no === undefined) {
      return res.status(400).json({ success: false, message: "subject_id, title, and order_no required" });
    }
    
    const module = await adminModel.createModule({ subject_id, title, order_no, description });
    res.status(201).json({ success: true, data: module });
  } catch (error) {
    console.error("Create module error:", error);
    res.status(500).json({ success: false, message: "Failed to create module" });
  }
});

router.put("/modules/:id", async (req, res) => {
  try {
    const moduleId = parseInt(req.params.id, 10);
    const updates = req.body;
    
    const module = await adminModel.updateModule(moduleId, updates);
    
    if (!module) {
      return res.status(404).json({ success: false, message: "Module not found" });
    }
    
    res.json({ success: true, data: module });
  } catch (error) {
    console.error("Update module error:", error);
    res.status(500).json({ success: false, message: "Failed to update module" });
  }
});

router.delete("/modules/:id", async (req, res) => {
  try {
    const moduleId = parseInt(req.params.id, 10);
    const success = await adminModel.deleteModule(moduleId);
    
    if (!success) {
      return res.status(404).json({ success: false, message: "Module not found" });
    }
    
    res.json({ success: true, message: "Module deleted successfully" });
  } catch (error) {
    console.error("Delete module error:", error);
    res.status(500).json({ success: false, message: "Failed to delete module" });
  }
});

// ============================================
// LESSON MANAGEMENT - Phase 3
// ============================================

router.get("/modules/:id/lessons", async (req, res) => {
  try {
    const moduleId = parseInt(req.params.id, 10);
    const lessons = await adminModel.getLessonsByModule(moduleId);
    res.json({ success: true, data: lessons });
  } catch (error) {
    console.error("Get lessons error:", error);
    res.status(500).json({ success: false, message: "Failed to load lessons" });
  }
});

router.post("/lessons", async (req, res) => {
  try {
    const { module_id, subject_id, title, description, order_no } = req.body;
    
    if (!module_id || !subject_id || !title || order_no === undefined) {
      return res.status(400).json({ success: false, message: "module_id, subject_id, title, and order_no required" });
    }
    
    const lesson = await adminModel.createLesson({ module_id, subject_id, title, description, order_no });
    res.status(201).json({ success: true, data: lesson });
  } catch (error) {
    console.error("Create lesson error:", error);
    res.status(500).json({ success: false, message: "Failed to create lesson" });
  }
});

router.put("/lessons/:id", async (req, res) => {
  try {
    const lessonId = parseInt(req.params.id, 10);
    const updates = req.body;
    
    const lesson = await adminModel.updateLesson(lessonId, updates);
    
    if (!lesson) {
      return res.status(404).json({ success: false, message: "Lesson not found" });
    }
    
    res.json({ success: true, data: lesson });
  } catch (error) {
    console.error("Update lesson error:", error);
    res.status(500).json({ success: false, message: "Failed to update lesson" });
  }
});

router.delete("/lessons/:id", async (req, res) => {
  try {
    const lessonId = parseInt(req.params.id, 10);
    const success = await adminModel.deleteLesson(lessonId);
    
    if (!success) {
      return res.status(404).json({ success: false, message: "Lesson not found" });
    }
    
    res.json({ success: true, message: "Lesson deleted successfully" });
  } catch (error) {
    console.error("Delete lesson error:", error);
    res.status(500).json({ success: false, message: "Failed to delete lesson" });
  }
});

// ============================================
// CONTENT UPLOAD - Phase 3
// ============================================

router.post("/lessons/:id/videos", async (req, res) => {
  try {
    const lessonId = parseInt(req.params.id, 10);
    const { title, url } = req.body;
    
    if (!title || !url) {
      return res.status(400).json({ success: false, message: "title and url required" });
    }
    
    const video = await adminModel.addVideoToLesson({ lesson_id: lessonId, title, url });
    res.status(201).json({ success: true, data: video });
  } catch (error) {
    console.error("Add video error:", error);
    res.status(500).json({ success: false, message: "Failed to add video" });
  }
});

router.post("/lessons/:id/pdfs", async (req, res) => {
  try {
    const lessonId = parseInt(req.params.id, 10);
    const { title, url } = req.body;
    
    if (!title || !url) {
      return res.status(400).json({ success: false, message: "title and url required" });
    }
    
    const pdf = await adminModel.addPdfToLesson({ lesson_id: lessonId, title, url });
    res.status(201).json({ success: true, data: pdf });
  } catch (error) {
    console.error("Add PDF error:", error);
    res.status(500).json({ success: false, message: "Failed to add PDF" });
  }
});

// ============================================
// SYSTEM LOGS
// ============================================

router.get("/logs", async (req, res) => {
  try {
    const { limit = "100", offset = "0" } = req.query;
    const logs = await adminModel.getSystemLogs(
      parseInt(limit as string, 10),
      parseInt(offset as string, 10)
    );
    res.json({ success: true, data: logs });
  } catch (error) {
    console.error("Get logs error:", error);
    res.status(500).json({ success: false, message: "Failed to load logs" });
  }
});

// ============================================
// STUDENTS (for enrollment wizard)
// ============================================

router.get("/students/search", async (req, res) => {
  try {
    const { q, limit = "20" } = req.query;
    
    let sql = `
      SELECT id, full_name as name, email, grade_level, is_active
      FROM users
      WHERE role = 'student'
    `;
    const params: any[] = [];
    
    if (q) {
      sql += ` AND (full_name ILIKE $1 OR email ILIKE $1)`;
      params.push(`%${q}%`);
    }
    
    sql += ` ORDER BY full_name LIMIT $${params.length + 1}`;
    params.push(parseInt(limit as string, 10));
    
    const result = await query(sql, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Search students error:", error);
    res.status(500).json({ success: false, message: "Failed to search students" });
  }
});

// ============================================
// ENROLLMENTS
// ============================================

router.get("/enrollments", async (req, res) => {
  try {
    const { status, studentId, subjectId, limit = "100", offset = "0" } = req.query;
    
    const enrollments = await adminModel.getAllEnrollments(
      {
        status: status as string,
        studentId: studentId ? parseInt(studentId as string, 10) : undefined,
        subjectId: subjectId ? parseInt(subjectId as string, 10) : undefined,
      },
      parseInt(limit as string, 10),
      parseInt(offset as string, 10)
    );
    
    res.json({ success: true, data: enrollments });
  } catch (error) {
    console.error("Get enrollments error:", error);
    res.status(500).json({ success: false, message: "Failed to load enrollments" });
  }
});

router.post("/enrollments", async (req, res) => {
  try {
    const { student_id, subject_id, notes } = req.body;
    
    if (!student_id || !subject_id) {
      return res.status(400).json({ success: false, message: "student_id and subject_id required" });
    }
    
    const enrollment = await adminModel.createEnrollment({ student_id, subject_id, notes });
    res.status(201).json({ success: true, data: enrollment });
  } catch (error) {
    console.error("Create enrollment error:", error);
    res.status(500).json({ success: false, message: "Failed to create enrollment" });
  }
});

router.put("/enrollments/:id/status", async (req, res) => {
  try {
    const enrollmentId = parseInt(req.params.id, 10);
    const { status } = req.body;
    const adminId = (req as any).auth?.userId; // From auth middleware
    
    if (!status || !['pending', 'approved', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }
    
    const enrollment = await adminModel.updateEnrollmentStatus(
      enrollmentId, 
      status, 
      status === 'approved' ? adminId : undefined
    );
    
    if (!enrollment) {
      return res.status(404).json({ success: false, message: "Enrollment not found" });
    }
    
    res.json({ success: true, data: enrollment });
  } catch (error) {
    console.error("Update enrollment status error:", error);
    res.status(500).json({ success: false, message: "Failed to update enrollment" });
  }
});

router.delete("/enrollments/:id", async (req, res) => {
  try {
    const enrollmentId = parseInt(req.params.id, 10);
    const success = await adminModel.deleteEnrollment(enrollmentId);
    
    if (!success) {
      return res.status(404).json({ success: false, message: "Enrollment not found" });
    }
    
    res.json({ success: true, message: "Enrollment deleted" });
  } catch (error) {
    console.error("Delete enrollment error:", error);
  }
});

// ============================================
// ANALYTICS - Phase 5
// ============================================

router.get("/analytics/enrollment-trends", async (req, res) => {
  try {
    const { months = "6" } = req.query;
    const data = await adminModel.getEnrollmentTrends(parseInt(months as string, 10));
    res.json({ success: true, data });
  } catch (error) {
    console.error("Get enrollment trends error:", error);
    res.status(500).json({ success: false, message: "Failed to load enrollment trends" });
  }
});

router.get("/analytics/grade-distribution", async (req, res) => {
  try {
    const data = await adminModel.getGradeDistribution();
    res.json({ success: true, data });
  } catch (error) {
    console.error("Get grade distribution error:", error);
    res.status(500).json({ success: false, message: "Failed to load grade distribution" });
  }
});

router.get("/analytics/subject-enrollment", async (req, res) => {
  try {
    const data = await adminModel.getSubjectEnrollment();
    res.json({ success: true, data });
  } catch (error) {
    console.error("Get subject enrollment error:", error);
    res.status(500).json({ success: false, message: "Failed to load subject enrollment" });
  }
});

// ============================================
// SETTINGS - Phase 5
// ============================================

router.get("/settings", async (req, res) => {
  try {
    const settings = await adminModel.getAllSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    console.error("Get settings error:", error);
    res.status(500).json({ success: false, message: "Failed to load settings" });
  }
});

router.put("/settings/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    await adminModel.updateSetting(key, value);
    res.json({ success: true, message: "Setting updated" });
  } catch (error) {
    console.error("Update setting error:", error);
    res.status(500).json({ success: false, message: "Failed to update setting" });
  }
});

// ============================================
// PARENT MANAGEMENT
// ============================================

router.get("/parents", async (req, res) => {
  try {
    const { search, status } = req.query;
    const parents = await adminModel.getAllParents(
      search as string,
      status as string
    );
    res.json({ success: true, data: parents });
  } catch (error) {
    console.error("Get parents error:", error);
    res.status(500).json({ success: false, message: "Failed to load parents" });
  }
});

router.post("/parents", async (req, res) => {
  try {
    const { full_name, email, phone, occupation, address, status, avatar, studentIds } = req.body;
    
    if (!full_name || !email) {
      return res.status(400).json({ success: false, message: "Name and email required" });
    }
    
    const parent = await adminModel.createParent({
      full_name,
      email,
      phone,
      occupation,
      address,
      status,
      avatar,
      studentIds
    });
    
    res.status(201).json({ success: true, data: parent });
  } catch (error: any) {
    console.error("Create parent error:", error);
    if (error?.code === '23505' || error?.message?.includes('duplicate key')) {
      return res.status(409).json({ success: false, message: "A parent with this email already exists" });
    }
    res.status(500).json({ success: false, message: "Failed to create parent" });
  }
});

router.put("/parents/:id", async (req, res) => {
  try {
    const parentId = parseInt(req.params.id, 10);
    const updates = req.body;
    
    const parent = await adminModel.updateParent(parentId, updates);
    
    if (!parent) {
      return res.status(404).json({ success: false, message: "Parent not found" });
    }
    
    res.json({ success: true, data: parent });
  } catch (error) {
    console.error("Update parent error:", error);
    res.status(500).json({ success: false, message: "Failed to update parent" });
  }
});

router.delete("/parents/:id", async (req, res) => {
  try {
    const parentId = parseInt(req.params.id, 10);
    const success = await adminModel.deleteParent(parentId);
    
    if (!success) {
      return res.status(404).json({ success: false, message: "Parent not found" });
    }
    
    res.json({ success: true, message: "Parent deleted successfully" });
  } catch (error) {
    console.error("Delete parent error:", error);
    res.status(500).json({ success: false, message: "Failed to delete parent" });
  }
});

export default router;
