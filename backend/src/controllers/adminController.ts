import { Response } from 'express';
import { query, exec } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';

// 1. Analytics & Overview
export async function getAnalytics(req: AuthenticatedRequest, res: Response) {
  try {
    const studentCount = await query('SELECT COUNT(*) as count FROM students WHERE role = "student"');
    const eventCount = await query('SELECT COUNT(*) as count FROM events');
    const feedbackCount = await query('SELECT COUNT(*) as count FROM feedback');
    const registrationCount = await query('SELECT COUNT(*) as count FROM registrations');
    
    const feedbackStatus = await query('SELECT status, COUNT(*) as count FROM feedback GROUP BY status');
    const eventPopularity = await query(`
      SELECT e.title, COUNT(r.id) as registrations
      FROM events e
      LEFT JOIN registrations r ON e.id = r.event_id
      GROUP BY e.id, e.title
      ORDER BY registrations DESC
      LIMIT 5
    `);

    return res.json({
      metrics: {
        totalStudents: studentCount[0].count,
        totalEvents: eventCount[0].count,
        totalFeedback: feedbackCount[0].count,
        totalRegistrations: registrationCount[0].count,
      },
      feedbackStatus,
      eventPopularity,
    });
  } catch (error: any) {
    console.error('Error fetching admin analytics:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

// 2. Add Announcement
export async function createAnnouncement(req: AuthenticatedRequest, res: Response) {
  try {
    const { title, content, category, departmentCode } = req.body;
    if (!title || !content || !category) {
      return res.status(400).json({ error: 'Title, content, and category are required.' });
    }

    let departmentId = null;
    if (departmentCode) {
      const depts = await query('SELECT id FROM departments WHERE code = ?', [departmentCode.toUpperCase()]);
      if (depts.length > 0) departmentId = depts[0].id;
    }

    const { insertId } = await exec(`
      INSERT INTO announcements (title, content, category, department_id)
      VALUES (?, ?, ?, ?)
    `, [title, content, category, departmentId]);

    // Broadcast notifications to students
    let targetStudents: any[] = [];
    if (departmentId) {
      targetStudents = await query('SELECT id FROM students WHERE department_id = ?', [departmentId]);
    } else {
      targetStudents = await query('SELECT id FROM students');
    }

    for (const student of targetStudents) {
      await exec(`
        INSERT INTO notifications (student_id, title, message, is_read)
        VALUES (?, ?, ?, 0)
      `, [student.id, `New Announcement: ${title}`, content.substring(0, 100) + '...']);
    }

    return res.status(201).json({ id: insertId, message: 'Announcement published and broadcasted!' });
  } catch (error: any) {
    console.error('Error publishing announcement:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

// 3. Create Event
export async function createEvent(req: AuthenticatedRequest, res: Response) {
  try {
    const { title, description, category, type, date, time, location, departmentCode, maxParticipants } = req.body;
    if (!title || !description || !category || !type || !date || !time || !location) {
      return res.status(400).json({ error: 'All primary event details are required.' });
    }

    let departmentId = null;
    if (departmentCode) {
      const depts = await query('SELECT id FROM departments WHERE code = ?', [departmentCode.toUpperCase()]);
      if (depts.length > 0) departmentId = depts[0].id;
    }

    const { insertId } = await exec(`
      INSERT INTO events (title, description, category, type, date, time, location, department_id, max_participants)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [title, description, category, type, date, time, location, departmentId, maxParticipants || 100]);

    return res.status(201).json({ id: insertId, message: 'Event created successfully.' });
  } catch (error: any) {
    console.error('Error creating event:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

export async function getAdminEvents(req: AuthenticatedRequest, res: Response) {
  try {
    const events = await query(`
      SELECT e.id, e.title, e.description, e.category, e.type, e.date, e.time, e.location, e.max_participants,
             d.code as department_code,
             (SELECT COUNT(*) FROM registrations WHERE event_id = e.id) as registrations_count
      FROM events e
      LEFT JOIN departments d ON e.department_id = d.id
      ORDER BY e.date DESC
    `);
    return res.json(events);
  } catch (error: any) {
    console.error('Error fetching admin events:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

export async function deleteEvent(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Event ID required.' });

    await exec('DELETE FROM registrations WHERE event_id = ?', [id]);
    await exec('DELETE FROM events WHERE id = ?', [id]);

    return res.json({ message: 'Event deleted successfully.' });
  } catch (error: any) {
    console.error('Error deleting event:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

// 4. Transport Management
export async function manageTransport(req: AuthenticatedRequest, res: Response) {
  try {
    const { busNumber, route, driverName, driverContact } = req.body;
    if (!busNumber || !route || !driverName || !driverContact) {
      return res.status(400).json({ error: 'All transport fields are required.' });
    }

    // Check if bus exists to update, else insert
    const existing = await query('SELECT id FROM bus_routes WHERE bus_number = ?', [busNumber]);
    if (existing.length > 0) {
      await exec(`
        UPDATE bus_routes 
        SET route = ?, driver_name = ?, driver_contact = ?
        WHERE bus_number = ?
      `, [route, driverName, driverContact, busNumber]);
      return res.json({ message: 'Bus route updated successfully.' });
    } else {
      await exec(`
        INSERT INTO bus_routes (bus_number, route, driver_name, driver_contact)
        VALUES (?, ?, ?, ?)
      `, [busNumber, route, driverName, driverContact]);
      return res.status(201).json({ message: 'Bus route created successfully.' });
    }
  } catch (error: any) {
    console.error('Error managing transport:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

// 5. Manage Timetable
export async function manageTimetable(req: AuthenticatedRequest, res: Response) {
  try {
    const { subjectCode, facultyEmail, dayOfWeek, startTime, endTime, roomNumber } = req.body;
    if (!subjectCode || !facultyEmail || !dayOfWeek || !startTime || !endTime || !roomNumber) {
      return res.status(400).json({ error: 'All timetable details are required.' });
    }

    const subjects = await query('SELECT id FROM subjects WHERE code = ?', [subjectCode]);
    if (subjects.length === 0) return res.status(404).json({ error: 'Subject not found.' });

    const faculty = await query('SELECT id FROM faculty WHERE email = ?', [facultyEmail]);
    if (faculty.length === 0) return res.status(404).json({ error: 'Faculty not found.' });

    await exec(`
      INSERT INTO timetable (subject_id, faculty_id, day_of_week, start_time, end_time, room_number)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [subjects[0].id, faculty[0].id, dayOfWeek, startTime, endTime, roomNumber]);

    return res.status(201).json({ message: 'Timetable entry added.' });
  } catch (error: any) {
    console.error('Error managing timetable:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

// 6. Manage Feedback (Review & Reply)
export async function getAllFeedback(req: AuthenticatedRequest, res: Response) {
  try {
    const feedbackList = await query(`
      SELECT f.*, s.name as student_name, s.roll_number, d.code as department_code
      FROM feedback f
      LEFT JOIN students s ON f.student_id = s.id
      LEFT JOIN departments d ON s.department_id = d.id
      ORDER BY f.created_at DESC
    `);

    // Obfuscate student details if anonymous
    const formatted = feedbackList.map((item: any) => ({
      id: item.id,
      category: item.category,
      title: item.title,
      message: item.message,
      isAnonymous: !!item.is_anonymous,
      status: item.status,
      adminReply: item.admin_reply,
      createdAt: item.created_at,
      studentName: item.is_anonymous ? 'Anonymous Student' : item.student_name,
      rollNumber: item.is_anonymous ? 'N/A' : item.roll_number,
      departmentCode: item.is_anonymous ? 'N/A' : item.department_code,
    }));

    return res.json(formatted);
  } catch (error: any) {
    console.error('Error fetching admin feedback:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

export async function replyFeedback(req: AuthenticatedRequest, res: Response) {
  try {
    const { feedbackId, reply, status } = req.body;
    if (!feedbackId || !reply || !status) {
      return res.status(400).json({ error: 'Feedback ID, reply message, and status are required.' });
    }

    await exec(`
      UPDATE feedback 
      SET admin_reply = ?, status = ?
      WHERE id = ?
    `, [reply, status, feedbackId]);

    // Send notification to the student (if not anonymous in db, or if student_id is set)
    const feedbackItem = await query('SELECT student_id, title FROM feedback WHERE id = ?', [feedbackId]);
    if (feedbackItem.length > 0 && feedbackItem[0].student_id) {
      await exec(`
        INSERT INTO notifications (student_id, title, message, is_read)
        VALUES (?, 'Feedback Reply Received', 'Your feedback "${feedbackItem[0].title}" has been replied: "${reply.substring(0, 50)}..."', 0)
      `, [feedbackItem[0].student_id]);
    }

    return res.json({ message: 'Feedback reply sent successfully.' });
  } catch (error: any) {
    console.error('Error replying feedback:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

// 7. Manage Students List
export async function getStudents(req: AuthenticatedRequest, res: Response) {
  try {
    const students = await query(`
      SELECT s.id, s.name, s.roll_number, s.year, s.semester, s.email, s.role, d.name as department_name, d.code as department_code,
             (SELECT COUNT(*) FROM attendance WHERE student_id = s.id AND (status = 'Present' OR status = 'Late')) as present_classes,
             (SELECT COUNT(*) FROM attendance WHERE student_id = s.id) as total_classes,
             (SELECT AVG(score / max_score) * 10 FROM marks WHERE student_id = s.id) as avg_marks_gpa
      FROM students s
      JOIN departments d ON s.department_id = d.id
      WHERE s.role != 'admin'
      ORDER BY s.roll_number
    `);

    const mapped = students.map((s: any) => {
      const attendanceRate = s.total_classes > 0 
        ? Math.round((s.present_classes / s.total_classes) * 100) 
        : 100;
      
      const academicGpa = s.avg_marks_gpa !== null && s.avg_marks_gpa !== undefined
        ? parseFloat(Number(s.avg_marks_gpa).toFixed(2)) 
        : 8.50;

      return {
        id: s.id,
        name: s.name,
        rollNumber: s.roll_number,
        year: s.year,
        semester: s.semester,
        email: s.email,
        role: s.role,
        departmentName: s.department_name,
        departmentCode: s.department_code,
        attendanceRate,
        totalClasses: s.total_classes || 0,
        cgpa: academicGpa
      };
    });

    return res.json(mapped);
  } catch (error: any) {
    console.error('Error fetching student registry:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

// 8. Manage Faculty List
export async function getFaculty(req: AuthenticatedRequest, res: Response) {
  try {
    const faculty = await query(`
      SELECT f.id, f.name, f.email, f.designation, f.office_room, d.name as department_name, d.code as department_code
      FROM faculty f
      JOIN departments d ON f.department_id = d.id
      ORDER BY f.name
    `);
    return res.json(faculty);
  } catch (error: any) {
    console.error('Error fetching faculty registry:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

export async function createFaculty(req: AuthenticatedRequest, res: Response) {
  try {
    const { name, email, departmentCode, designation, officeRoom } = req.body;
    if (!name || !email || !departmentCode || !designation || !officeRoom) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const depts = await query('SELECT id FROM departments WHERE code = ?', [departmentCode.toUpperCase()]);
    if (depts.length === 0) return res.status(404).json({ error: 'Department code not found.' });

    await exec(`
      INSERT INTO faculty (name, email, department_id, designation, office_room)
      VALUES (?, ?, ?, ?, ?)
    `, [name, email, depts[0].id, designation, officeRoom]);

    return res.status(201).json({ message: 'Faculty member added successfully.' });
  } catch (error: any) {
    console.error('Error creating faculty:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

// 9. Manage Leaderboard Points
export async function updateLeaderboardPoints(req: AuthenticatedRequest, res: Response) {
  try {
    const { studentId, points, category } = req.body;
    if (!studentId || points === undefined || !category) {
      return res.status(400).json({ error: 'Student ID, points, and category are required.' });
    }

    // Check if entry exists for this category/student, update it, else insert
    const existing = await query('SELECT id FROM leaderboard WHERE student_id = ? AND category = ?', [studentId, category]);
    if (existing.length > 0) {
      await exec('UPDATE leaderboard SET points = ? WHERE id = ?', [points, existing[0].id]);
    } else {
      await exec('INSERT INTO leaderboard (student_id, points, category) VALUES (?, ?, ?)', [studentId, points, category]);
    }

    return res.json({ message: 'Leaderboard score updated.' });
  } catch (error: any) {
    console.error('Error updating leaderboard points:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

// 10. Broadcast Alert
export async function broadcastAlert(req: AuthenticatedRequest, res: Response) {
  try {
    const { title, message } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required.' });
    }

    const students = await query('SELECT id FROM students');
    for (const student of students) {
      await exec(`
        INSERT INTO notifications (student_id, title, message, is_read)
        VALUES (?, ?, ?, 0)
      `, [student.id, title, message]);
    }

    return res.json({ message: 'System alert broadcasted to all students.' });
  } catch (error: any) {
    console.error('Error broadcasting notification:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

// 12. Fetch Timetable for a specific department and semester
export async function getAdminTimetable(req: AuthenticatedRequest, res: Response) {
  try {
    const { departmentCode, semester } = req.query;
    if (!departmentCode || !semester) {
      return res.status(400).json({ error: 'Department code and semester are required.' });
    }

    const depts = await query('SELECT id FROM departments WHERE code = ?', [String(departmentCode).toUpperCase()]);
    if (depts.length === 0) return res.status(404).json({ error: 'Department not found.' });

    const timetable = await query(`
      SELECT t.id, t.day_of_week, t.start_time, t.end_time, t.room_number,
             s.name as subject_name, s.code as subject_code,
             f.name as faculty_name, f.email as faculty_email
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
    `, [depts[0].id, parseInt(String(semester))]);

    return res.json(timetable);
  } catch (error: any) {
    console.error('Error fetching admin timetable:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

// 13. Delete a timetable slot
export async function deleteTimetableEntry(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    await exec('DELETE FROM timetable WHERE id = ?', [id]);
    return res.json({ message: 'Timetable entry deleted successfully.' });
  } catch (error: any) {
    console.error('Error deleting timetable entry:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

// 14. Create a new Subject
export async function createSubject(req: AuthenticatedRequest, res: Response) {
  try {
    const { name, code, departmentCode, semester } = req.body;
    if (!name || !code || !departmentCode || !semester) {
      return res.status(400).json({ error: 'All fields (name, code, departmentCode, semester) are required.' });
    }

    // Check if department exists
    const depts = await query('SELECT id FROM departments WHERE code = ?', [String(departmentCode).toUpperCase()]);
    if (depts.length === 0) {
      return res.status(404).json({ error: `Department '${departmentCode}' not found.` });
    }

    // Check if subject code already exists
    const existing = await query('SELECT id FROM subjects WHERE code = ?', [String(code).toUpperCase()]);
    if (existing.length > 0) {
      return res.status(400).json({ error: `Subject code '${code}' already exists.` });
    }

    await exec(`
      INSERT INTO subjects (name, code, department_id, semester)
      VALUES (?, ?, ?, ?)
    `, [name, String(code).toUpperCase(), depts[0].id, parseInt(semester)]);

    return res.json({ message: 'Subject created successfully.' });
  } catch (error: any) {
    console.error('Error creating subject:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
