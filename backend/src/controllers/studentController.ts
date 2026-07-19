import { Response } from 'express';
import { query, exec } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';

export async function getDashboard(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const studentId = req.user.id;
    const deptId = req.user.department_id;
    const sem = req.user.semester;

    // 1. Timetable
    const timetable = await query(`
      SELECT t.id, t.day_of_week, t.start_time, t.end_time, t.room_number,
             s.name as subject_name, s.code as subject_code,
             f.name as faculty_name, f.office_room as faculty_office
      FROM timetable t
      JOIN subjects s ON t.subject_id = s.id
      JOIN faculty f ON t.faculty_id = f.id
      WHERE s.department_id = ? AND s.semester = ?
      ORDER BY 
        CASE t.day_of_week
          WHEN 'Monday' THEN 1
          WHEN 'Tuesday' THEN 2
          WHEN 'Wednesday' THEN 3
          WHEN 'Thursday' THEN 4
          WHEN 'Friday' THEN 5
          ELSE 6
        END, t.start_time
    `, [deptId, sem]);

    // 2. Announcements (General + Department specific)
    const announcements = await query(`
      SELECT a.id, a.title, a.content, a.category, a.created_at, d.code as dept_code
      FROM announcements a
      LEFT JOIN departments d ON a.department_id = d.id
      WHERE a.department_id IS NULL OR a.department_id = ?
      ORDER BY a.created_at DESC
    `, [deptId]);

    // 3. Events (with Registration flag)
    const events = await query(`
      SELECT e.id, e.title, e.description, e.category, e.type, e.date, e.time, e.location, e.max_participants, e.image_url,
             (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id) as current_participants,
             EXISTS(SELECT 1 FROM registrations r WHERE r.event_id = e.id AND r.student_id = ?) as registered
      FROM events e
      ORDER BY e.date ASC
    `, [studentId]);

    // 4. Bus Routes
    const busRoutes = await query('SELECT * FROM bus_routes');

    // 5. Clubs
    const clubs = await query('SELECT * FROM clubs');
    const parsedClubs = clubs.map(club => ({
      ...club,
      upcoming_events: JSON.parse(club.upcoming_events_json || '[]')
    }));

    return res.json({
      timetable,
      announcements,
      events,
      busRoutes,
      clubs: parsedClubs
    });
  } catch (error: any) {
    console.error('Error fetching dashboard:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

export async function getAcademics(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const studentId = req.user.id;
    const deptId = req.user.department_id;
    const sem = req.user.semester;

    // 1. Marks
    const marks = await query(`
      SELECT m.id, m.type, m.score, m.max_score, s.name as subject_name, s.code as subject_code
      FROM marks m
      JOIN subjects s ON m.subject_id = s.id
      WHERE m.student_id = ?
    `, [studentId]);

    // 2. Attendance & Percentage calculation
    const attendanceRecords = await query(`
      SELECT status, count(*) as count 
      FROM attendance 
      WHERE student_id = ?
      GROUP BY status
    `, [studentId]);

    let present = 0, absent = 0, late = 0;
    attendanceRecords.forEach((record: any) => {
      if (record.status === 'Present') present = record.count;
      else if (record.status === 'Absent') absent = record.count;
      else if (record.status === 'Late') late = record.count;
    });
    const totalClasses = present + absent + late;
    const attendancePercentage = totalClasses > 0 ? Math.round(((present + late * 0.5) / totalClasses) * 100) : 100;

    // 3. Assignments
    const assignments = await query(`
      SELECT a.id, a.title, a.description, a.due_date, a.status, s.name as subject_name, s.code as subject_code
      FROM assignments a
      JOIN subjects s ON a.subject_id = s.id
      WHERE s.department_id = ? AND s.semester = ?
      ORDER BY a.due_date ASC
    `, [deptId, sem]);

    // Mock Performance trends over semesters (since database holds current, we provide historic)
    const trends = [
      { semester: 'Semester 1', GPA: 8.4 },
      { semester: 'Semester 2', GPA: 8.7 },
      { semester: 'Semester 3', GPA: 8.9 },
      { semester: 'Semester 4', GPA: 9.1 },
      { semester: 'Semester 5', GPA: 9.2 }
    ].slice(0, sem);

    return res.json({
      marks,
      attendance: {
        percentage: attendancePercentage,
        present,
        absent,
        late,
        total: totalClasses
      },
      assignments,
      cgpa: 9.2, // Hardcoded for demo/seed reference
      trends
    });
  } catch (error: any) {
    console.error('Error fetching academics:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

export async function getForYou(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const studentId = req.user.id;
    const deptId = req.user.department_id;
    const sem = req.user.semester;

    // 1. Fetch department details
    const depts = await query('SELECT name, code FROM departments WHERE id = ?', [deptId]);
    const department = depts[0] || { name: 'Unknown Department', code: 'N/A' };

    // 2. Fetch HOD details
    const hods = await query(`
      SELECT name, email, designation, office_room 
      FROM faculty 
      WHERE department_id = ? AND (designation LIKE '%HOD%' OR designation LIKE '%Head%')
    `, [deptId]);
    const hod = hods[0] || null;

    // 3. Fetch Department Faculty members
    const faculty = await query(`
      SELECT name, email, designation, office_room 
      FROM faculty 
      WHERE department_id = ?
    `, [deptId]);

    // 4. Fetch Department Specific / General events
    const events = await query(`
      SELECT e.*, 
             (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id) as current_participants,
             EXISTS(SELECT 1 FROM registrations r WHERE r.event_id = e.id AND r.student_id = ?) as registered
      FROM events e
      WHERE e.department_id = ? OR e.department_id IS NULL
      ORDER BY e.date ASC
    `, [studentId, deptId]);

    // 5. Fetch subjects in their current semester
    const subjects = await query(`
      SELECT id, name, code 
      FROM subjects 
      WHERE department_id = ? AND semester = ?
    `, [deptId, sem]);

    // 6. Fetch performance summary metrics
    const attendanceRecords = await query(`
      SELECT status, count(*) as count 
      FROM attendance 
      WHERE student_id = ?
      GROUP BY status
    `, [studentId]);
    
    let present = 0, absent = 0, late = 0;
    attendanceRecords.forEach((record: any) => {
      if (record.status === 'Present') present = record.count;
      else if (record.status === 'Absent') absent = record.count;
      else if (record.status === 'Late') late = record.count;
    });
    const totalClasses = present + absent + late;
    const attendancePercentage = totalClasses > 0 ? Math.round(((present + late * 0.5) / totalClasses) * 100) : 100;

    const pendingAssignments = await query(`
      SELECT COUNT(*) as count 
      FROM assignments a
      JOIN subjects s ON a.subject_id = s.id
      WHERE s.department_id = ? AND s.semester = ? AND a.status = 'Pending'
    `, [deptId, sem]);

    const completedAssignments = await query(`
      SELECT COUNT(*) as count 
      FROM assignments a
      JOIN subjects s ON a.subject_id = s.id
      WHERE s.department_id = ? AND s.semester = ? AND a.status = 'Completed'
    `, [deptId, sem]);

    return res.json({
      department,
      hod,
      faculty,
      events,
      subjects,
      metrics: {
        cgpa: 9.2,
        attendancePercentage,
        totalClasses,
        present,
        absent,
        late,
        pendingAssignments: pendingAssignments[0]?.count || 0,
        completedAssignments: completedAssignments[0]?.count || 0
      }
    });
  } catch (error: any) {
    console.error('Error fetching student dashboard context:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

export async function getLeaderboard(req: AuthenticatedRequest, res: Response) {
  try {
    const { category, department } = req.query;

    let sql = `
      SELECT l.points, l.category, s.name as student_name, s.roll_number, d.name as department_name, d.code as department_code
      FROM leaderboard l
      JOIN students s ON l.student_id = s.id
      JOIN departments d ON s.department_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      sql += ' AND l.category = ?';
      params.push(category);
    }
    if (department) {
      sql += ' AND d.code = ?';
      params.push(department);
    }

    sql += ' ORDER BY l.points DESC';

    const leaderboard = await query(sql, params);
    return res.json(leaderboard);
  } catch (error: any) {
    console.error('Error fetching leaderboard:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

export async function registerEvent(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const studentId = req.user.id;
    const { eventId } = req.body;

    if (!eventId) {
      return res.status(400).json({ error: 'Event ID is required.' });
    }

    // Check if event exists
    const events = await query('SELECT * FROM events WHERE id = ?', [eventId]);
    if (events.length === 0) {
      return res.status(404).json({ error: 'Event not found.' });
    }
    const event = events[0];

    // Check capacity
    const regCount = await query('SELECT COUNT(*) as count FROM registrations WHERE event_id = ?', [eventId]);
    if (regCount[0].count >= event.max_participants) {
      return res.status(400).json({ error: 'Event is fully booked.' });
    }

    // Check if already registered
    const alreadyReg = await query('SELECT id FROM registrations WHERE student_id = ? AND event_id = ?', [studentId, eventId]);
    if (alreadyReg.length > 0) {
      return res.status(409).json({ error: 'You are already registered for this event.' });
    }

    await exec('INSERT INTO registrations (student_id, event_id) VALUES (?, ?)', [studentId, eventId]);

    // Send a notification
    await exec(`
      INSERT INTO notifications (student_id, title, message, is_read)
      VALUES (?, 'Event Registration Confirmed', 'You have successfully registered for ${event.title}. See you on ${event.date} at ${event.location}.', 0)
    `, [studentId]);

    return res.status(201).json({ message: 'Registered successfully!' });
  } catch (error: any) {
    console.error('Error registering event:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

export async function toggleAssignment(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const { assignmentId, status } = req.body;

    if (!assignmentId || !status) {
      return res.status(400).json({ error: 'Assignment ID and status are required.' });
    }

    await exec('UPDATE assignments SET status = ? WHERE id = ?', [status, assignmentId]);
    return res.json({ message: 'Assignment status updated successfully.' });
  } catch (error: any) {
    console.error('Error updating assignment:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

export async function getNotifications(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const notifications = await query('SELECT * FROM notifications WHERE student_id = ? ORDER BY created_at DESC', [req.user.id]);
    return res.json(notifications);
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

export async function markNotificationRead(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;
    await exec('UPDATE notifications SET is_read = 1 WHERE id = ? AND student_id = ?', [id, req.user.id]);
    return res.json({ message: 'Notification marked as read.' });
  } catch (error: any) {
    console.error('Error marking notification read:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

export async function globalSearch(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const { q } = req.query;
    if (!q) return res.json({ faculty: [], events: [], announcements: [], subjects: [], rooms: [], clubs: [], students: [] });

    const queryStr = `%${q}%`;
    const isAdmin = req.user.role === 'admin';

    const faculty = await query(`
      SELECT f.name, f.designation, f.office_room, f.email, d.code as dept_code 
      FROM faculty f
      JOIN departments d ON f.department_id = d.id
      WHERE f.name LIKE ? OR f.designation LIKE ? OR f.office_room LIKE ?
    `, [queryStr, queryStr, queryStr]);

    const events = await query(`
      SELECT title, category, type, date, location FROM events 
      WHERE title LIKE ? OR description LIKE ? OR location LIKE ?
    `, [queryStr, queryStr, queryStr]);

    const announcements = await query(`
      SELECT title, content, category FROM announcements 
      WHERE title LIKE ? OR content LIKE ?
    `, [queryStr, queryStr]);

    const subjects = await query(`
      SELECT name, code FROM subjects 
      WHERE name LIKE ? OR code LIKE ?
    `, [queryStr, queryStr]);

    const rooms = await query(`
      SELECT DISTINCT room_number, 'Timetable Class' as type FROM timetable WHERE room_number LIKE ?
      UNION
      SELECT DISTINCT office_room as room_number, 'Faculty Office' as type FROM faculty WHERE office_room LIKE ?
      UNION
      SELECT DISTINCT location as room_number, 'Event Venue' as type FROM events WHERE location LIKE ?
    `, [queryStr, queryStr, queryStr]);

    const clubs = await query(`
      SELECT name, category, leader_name FROM clubs 
      WHERE name LIKE ? OR description LIKE ?
    `, [queryStr, queryStr]);

    let students: any[] = [];
    if (isAdmin) {
      students = await query(`
        SELECT s.name, s.roll_number, d.code as dept_code, s.year 
        FROM students s
        JOIN departments d ON s.department_id = d.id
        WHERE s.name LIKE ? OR s.roll_number LIKE ?
      `, [queryStr, queryStr]);
    }

    return res.json({
      faculty,
      events,
      announcements,
      subjects,
      rooms: rooms.filter(r => r.room_number),
      clubs,
      students
    });
  } catch (error: any) {
    console.error('Search error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

