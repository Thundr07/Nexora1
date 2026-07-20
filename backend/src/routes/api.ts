import { Router } from 'express';
import { login, register, getProfile } from '../controllers/authController';
import {
  getDashboard,
  getAcademics,
  getForYou,
  getLeaderboard,
  registerEvent,
  toggleAssignment,
  getNotifications,
  markNotificationRead,
  globalSearch,
  updateLeetCodeHandle
} from '../controllers/studentController';
import { submitFeedback, getStudentFeedback } from '../controllers/feedbackController';
import { chatAssistant } from '../controllers/aiController';
import {
  getAnalytics,
  createAnnouncement,
  createEvent,
  manageTransport,
  manageTimetable,
  getAdminTimetable,
  deleteTimetableEntry,
  createSubject,
  getAllFeedback,
  replyFeedback,
  getStudents,
  getFaculty,
  createFaculty,
  updateLeaderboardPoints,
  broadcastAlert
} from '../controllers/adminController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// ==========================================
// PUBLIC AUTH ROUTES
// ==========================================
router.post('/auth/login', login);
router.post('/auth/register', register);

// ==========================================
// STUDENT PROTECTED ROUTES
// ==========================================
router.get('/auth/profile', authenticateToken as any, getProfile as any);
router.get('/student/dashboard', authenticateToken as any, getDashboard as any);
router.get('/student/academics', authenticateToken as any, getAcademics as any);
router.get('/student/foryou', authenticateToken as any, getForYou as any);
router.get('/student/leaderboard', authenticateToken as any, getLeaderboard as any);
router.put('/student/leetcode-handle', authenticateToken as any, updateLeetCodeHandle as any);
router.post('/student/event-register', authenticateToken as any, registerEvent as any);
router.post('/student/toggle-assignment', authenticateToken as any, toggleAssignment as any);
router.get('/student/notifications', authenticateToken as any, getNotifications as any);
router.put('/student/notifications/:id/read', authenticateToken as any, markNotificationRead as any);
router.get('/student/search', authenticateToken as any, globalSearch as any);

// FEEDBACK ROUTES
router.post('/student/feedback', authenticateToken as any, submitFeedback as any);
router.get('/student/feedback', authenticateToken as any, getStudentFeedback as any);

// CHATBOT ROUTE
router.post('/ai/chat', authenticateToken as any, chatAssistant as any);

// ==========================================
// ADMIN PROTECTED ROUTES
// ==========================================
router.get('/admin/analytics', [authenticateToken, requireAdmin] as any, getAnalytics as any);
router.post('/admin/announcement', [authenticateToken, requireAdmin] as any, createAnnouncement as any);
router.post('/admin/event', [authenticateToken, requireAdmin] as any, createEvent as any);
router.post('/admin/transport', [authenticateToken, requireAdmin] as any, manageTransport as any);
router.post('/admin/timetable', [authenticateToken, requireAdmin] as any, manageTimetable as any);
router.get('/admin/timetable', [authenticateToken, requireAdmin] as any, getAdminTimetable as any);
router.delete('/admin/timetable/:id', [authenticateToken, requireAdmin] as any, deleteTimetableEntry as any);
router.post('/admin/subject', [authenticateToken, requireAdmin] as any, createSubject as any);
router.get('/admin/feedback', [authenticateToken, requireAdmin] as any, getAllFeedback as any);
router.post('/admin/feedback/reply', [authenticateToken, requireAdmin] as any, replyFeedback as any);
router.get('/admin/students', [authenticateToken, requireAdmin] as any, getStudents as any);
router.get('/admin/faculty', [authenticateToken, requireAdmin] as any, getFaculty as any);
router.post('/admin/faculty', [authenticateToken, requireAdmin] as any, createFaculty as any);
router.post('/admin/leaderboard', [authenticateToken, requireAdmin] as any, updateLeaderboardPoints as any);
router.post('/admin/broadcast', [authenticateToken, requireAdmin] as any, broadcastAlert as any);

export default router;
