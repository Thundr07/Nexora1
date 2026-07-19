import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, exec } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'nexora_super_secret_jwt_token_key_2026';

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const students = await query('SELECT * FROM students WHERE email = ?', [email]);
    if (students.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const student = students[0];
    const isPasswordValid = await bcrypt.compare(password, student.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const dept = await query('SELECT * FROM departments WHERE id = ?', [student.department_id]);
    const departmentName = dept.length > 0 ? dept[0].name : 'Unknown';
    const departmentCode = dept.length > 0 ? dept[0].code : 'UNK';

    const token = jwt.sign(
      {
        id: student.id,
        email: student.email,
        role: student.role,
        department_id: student.department_id,
        year: student.year,
        semester: student.semester,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: {
        id: student.id,
        name: student.name,
        rollNumber: student.roll_number,
        email: student.email,
        role: student.role,
        departmentId: student.department_id,
        departmentName,
        departmentCode,
        year: student.year,
        semester: student.semester,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

export async function register(req: Request, res: Response) {
  try {
    const { name, rollNumber, departmentCode, year, semester, email, password } = req.body;

    if (!name || !rollNumber || !departmentCode || !year || !semester || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Check if student exists
    const existing = await query('SELECT id FROM students WHERE email = ? OR roll_number = ?', [email, rollNumber]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email or Roll Number already registered.' });
    }

    // Find department
    const depts = await query('SELECT id FROM departments WHERE code = ?', [departmentCode.toUpperCase()]);
    if (depts.length === 0) {
      return res.status(404).json({ error: 'Invalid department code.' });
    }
    const departmentId = depts[0].id;

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const { insertId } = await exec(`
      INSERT INTO students (name, roll_number, department_id, year, semester, email, password_hash, role)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'student')
    `, [name, rollNumber, departmentId, parseInt(year), parseInt(semester), email, passwordHash]);

    // Send a welcome notification
    await exec(`
      INSERT INTO notifications (student_id, title, message, is_read)
      VALUES (?, 'Welcome to Nexora!', 'Your profile is active. Get started with your personalized dashboard.', 0)
    `, [insertId]);

    return res.status(201).json({ message: 'Registration successful. You can log in now.' });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

export async function getProfile(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const students = await query('SELECT id, name, roll_number, department_id, year, semester, email, role FROM students WHERE id = ?', [req.user.id]);
    if (students.length === 0) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    const student = students[0];
    const depts = await query('SELECT * FROM departments WHERE id = ?', [student.department_id]);
    const departmentName = depts.length > 0 ? depts[0].name : 'Unknown';
    const departmentCode = depts.length > 0 ? depts[0].code : 'UNK';

    return res.json({
      id: student.id,
      name: student.name,
      rollNumber: student.roll_number,
      email: student.email,
      role: student.role,
      departmentId: student.department_id,
      departmentName,
      departmentCode,
      year: student.year,
      semester: student.semester,
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
