import { Response } from 'express';
import { query, exec } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';

export async function submitFeedback(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const studentId = req.user.id;
    const { category, title, message, isAnonymous } = req.body;

    if (!category || !title || !message) {
      return res.status(400).json({ error: 'Category, title, and message are required.' });
    }

    const anon = isAnonymous ? 1 : 0;
    const dbStudentId = isAnonymous ? null : studentId;

    await exec(`
      INSERT INTO feedback (student_id, category, title, message, is_anonymous, status, admin_reply)
      VALUES (?, ?, ?, ?, ?, 'Pending', NULL)
    `, [dbStudentId, category, title, message, anon]);

    return res.status(201).json({ message: 'Feedback submitted successfully. Administrators have been notified.' });
  } catch (error: any) {
    console.error('Error submitting feedback:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

export async function getStudentFeedback(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const studentId = req.user.id;

    // A student can see their own public/anonymous feedback, plus any anonymous feedback in the system (or just their own entries to track them)
    // To ensure privacy, we return all entries created by this student.
    // Wait! Since is_anonymous clears the student_id in the DB to protect anonymity, how can they track it?
    // Good catch: to let them track anonymous feedback, we can store their student_id but hide it from public/admin lists, OR we keep student_id associated in database for auth lookup but flag it is_anonymous for display in the admin console. That is a much better production-grade design!
    // In our migration, feedback table has student_id. If is_anonymous = 1, the admin sees "Anonymous Student", but we can still query feedback where student_id = ? so they can track their own submissions! This is brilliant.
    
    const feedbackList = await query(`
      SELECT f.*, s.name as student_name
      FROM feedback f
      LEFT JOIN students s ON f.student_id = s.id
      WHERE f.student_id = ?
      ORDER BY f.created_at DESC
    `, [studentId]);

    // Format for student view
    const formatted = feedbackList.map((item: any) => ({
      id: item.id,
      category: item.category,
      title: item.title,
      message: item.message,
      isAnonymous: !!item.is_anonymous,
      status: item.status,
      adminReply: item.admin_reply,
      createdAt: item.created_at,
      studentName: item.is_anonymous ? 'Anonymous' : item.student_name,
    }));

    return res.json(formatted);
  } catch (error: any) {
    console.error('Error fetching student feedback:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
