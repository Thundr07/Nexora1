import sqlite3 from 'sqlite3';
import { open, Database as SqliteDB } from 'sqlite';
import mysql, { Pool as MysqlPool } from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const DB_TYPE = process.env.DB_TYPE || 'sqlite';
const SQLITE_DB_PATH = process.env.SQLITE_DB_PATH || './src/db/nexora.db';

let sqliteDb: SqliteDB | null = null;
let mysqlPool: MysqlPool | null = null;

// Initialize Database connection
export async function initDb() {
  if (DB_TYPE === 'mysql') {
    console.log('Connecting to MySQL database...');
    mysqlPool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'nexora',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    // Verify connection
    await mysqlPool.query('SELECT 1');
    console.log('MySQL connected successfully.');
    await runMigrationsAndSeed();
  } else {
    console.log('Connecting to SQLite database...');
    const dbDir = path.dirname(path.resolve(SQLITE_DB_PATH));
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    sqliteDb = await open({
      filename: path.resolve(SQLITE_DB_PATH),
      driver: sqlite3.Database,
    });
    await sqliteDb.run('PRAGMA foreign_keys = ON;');
    console.log('SQLite connected successfully at:', SQLITE_DB_PATH);
    await runMigrationsAndSeed();
  }
}

// Universal Query Executor
export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  if (DB_TYPE === 'mysql') {
    if (!mysqlPool) throw new Error('MySQL Pool not initialized.');
    const [rows] = await mysqlPool.query(sql, params);
    return rows as T[];
  } else {
    if (!sqliteDb) throw new Error('SQLite DB not initialized.');
    // Convert MYSQL parameterized queries (?) to SQLite format if needed
    // Luckily both sqlite3 and mysql2 support '?' place holders.
    const rows = await sqliteDb.all(sql, params);
    return rows as T[];
  }
}

// Universal Exec Command (for Insert/Update/Delete where ID/Changes are needed)
export async function exec(sql: string, params: any[] = []): Promise<{ insertId: number; affectedRows: number }> {
  if (DB_TYPE === 'mysql') {
    if (!mysqlPool) throw new Error('MySQL Pool not initialized.');
    const [result]: any = await mysqlPool.execute(sql, params);
    return {
      insertId: result.insertId || 0,
      affectedRows: result.affectedRows || 0,
    };
  } else {
    if (!sqliteDb) throw new Error('SQLite DB not initialized.');
    const result = await sqliteDb.run(sql, params);
    return {
      insertId: result.lastID || 0,
      affectedRows: result.changes || 0,
    };
  }
}

// Auto Migrations and Database Seeding
async function runMigrationsAndSeed() {
  const isMySQL = DB_TYPE === 'mysql';
  const autoInc = isMySQL ? 'AUTO_INCREMENT' : 'AUTOINCREMENT';
  const textType = isMySQL ? 'LONGTEXT' : 'TEXT';

  console.log('Checking database tables...');

  // 1. Create Departments
  await exec(`
    CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY ${autoInc},
      name VARCHAR(255) NOT NULL,
      code VARCHAR(10) NOT NULL UNIQUE
    )
  `);

  // 2. Create Students
  await exec(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY ${autoInc},
      name VARCHAR(255) NOT NULL,
      roll_number VARCHAR(50) NOT NULL UNIQUE,
      department_id INTEGER NOT NULL,
      year INTEGER NOT NULL,
      semester INTEGER NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'student',
      leetcode_handle VARCHAR(100),
      leetcode_solved INTEGER DEFAULT 0,
      leetcode_easy INTEGER DEFAULT 0,
      leetcode_medium INTEGER DEFAULT 0,
      leetcode_hard INTEGER DEFAULT 0,
      leetcode_rating INTEGER DEFAULT 1500,
      leetcode_ranking INTEGER DEFAULT 0,
      FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
    )
  `);

  try { await exec(`ALTER TABLE students ADD COLUMN leetcode_handle VARCHAR(100)`); } catch (err) {}
  try { await exec(`ALTER TABLE students ADD COLUMN leetcode_solved INTEGER DEFAULT 0`); } catch (err) {}
  try { await exec(`ALTER TABLE students ADD COLUMN leetcode_easy INTEGER DEFAULT 0`); } catch (err) {}
  try { await exec(`ALTER TABLE students ADD COLUMN leetcode_medium INTEGER DEFAULT 0`); } catch (err) {}
  try { await exec(`ALTER TABLE students ADD COLUMN leetcode_hard INTEGER DEFAULT 0`); } catch (err) {}
  try { await exec(`ALTER TABLE students ADD COLUMN leetcode_rating INTEGER DEFAULT 1500`); } catch (err) {}
  try { await exec(`ALTER TABLE students ADD COLUMN leetcode_ranking INTEGER DEFAULT 0`); } catch (err) {}

  // 3. Create Faculty
  await exec(`
    CREATE TABLE IF NOT EXISTS faculty (
      id INTEGER PRIMARY KEY ${autoInc},
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      department_id INTEGER NOT NULL,
      designation VARCHAR(100) NOT NULL,
      office_room VARCHAR(50) NOT NULL,
      FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
    )
  `);

  // 4. Create Subjects
  await exec(`
    CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY ${autoInc},
      name VARCHAR(255) NOT NULL,
      code VARCHAR(20) NOT NULL UNIQUE,
      department_id INTEGER NOT NULL,
      semester INTEGER NOT NULL,
      FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
    )
  `);

  // 5. Create Timetable
  await exec(`
    CREATE TABLE IF NOT EXISTS timetable (
      id INTEGER PRIMARY KEY ${autoInc},
      subject_id INTEGER NOT NULL,
      faculty_id INTEGER NOT NULL,
      day_of_week VARCHAR(20) NOT NULL,
      start_time VARCHAR(10) NOT NULL,
      end_time VARCHAR(10) NOT NULL,
      room_number VARCHAR(50) NOT NULL,
      FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
      FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE CASCADE
    )
  `);

  // 6. Create Events
  await exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY ${autoInc},
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      category VARCHAR(50) NOT NULL,
      type VARCHAR(50) NOT NULL,
      date VARCHAR(20) NOT NULL,
      time VARCHAR(20) NOT NULL,
      location VARCHAR(255) NOT NULL,
      department_id INTEGER,
      max_participants INTEGER DEFAULT 100,
      image_url TEXT,
      FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
    )
  `);

  try {
    await exec(`ALTER TABLE events ADD COLUMN image_url TEXT`);
  } catch (err) {
    // Column already exists
  }

  // 7. Create Registrations
  await exec(`
    CREATE TABLE IF NOT EXISTS registrations (
      id INTEGER PRIMARY KEY ${autoInc},
      student_id INTEGER NOT NULL,
      event_id INTEGER NOT NULL,
      registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
      UNIQUE(student_id, event_id)
    )
  `);

  // 8. Create Announcements
  await exec(`
    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY ${autoInc},
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      category VARCHAR(50) NOT NULL,
      department_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
    )
  `);

  // 9. Create Bus Routes
  await exec(`
    CREATE TABLE IF NOT EXISTS bus_routes (
      id INTEGER PRIMARY KEY ${autoInc},
      bus_number VARCHAR(50) NOT NULL UNIQUE,
      route VARCHAR(255) NOT NULL,
      driver_name VARCHAR(100) NOT NULL,
      driver_contact VARCHAR(20) NOT NULL
    )
  `);

  // 10. Create Attendance
  await exec(`
    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY ${autoInc},
      student_id INTEGER NOT NULL,
      subject_id INTEGER NOT NULL,
      date VARCHAR(20) NOT NULL,
      status VARCHAR(20) NOT NULL,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
    )
  `);

  // 11. Create Marks
  await exec(`
    CREATE TABLE IF NOT EXISTS marks (
      id INTEGER PRIMARY KEY ${autoInc},
      student_id INTEGER NOT NULL,
      subject_id INTEGER NOT NULL,
      type VARCHAR(50) NOT NULL,
      score REAL NOT NULL,
      max_score REAL NOT NULL,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
    )
  `);

  // 12. Create Assignments
  await exec(`
    CREATE TABLE IF NOT EXISTS assignments (
      id INTEGER PRIMARY KEY ${autoInc},
      subject_id INTEGER NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      due_date VARCHAR(20) NOT NULL,
      status VARCHAR(20) DEFAULT 'Pending',
      FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
    )
  `);

  // 13. Create Clubs
  await exec(`
    CREATE TABLE IF NOT EXISTS clubs (
      id INTEGER PRIMARY KEY ${autoInc},
      name VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      category VARCHAR(50) NOT NULL,
      upcoming_events_json ${textType} NOT NULL,
      members_count INTEGER DEFAULT 0,
      leader_name VARCHAR(100) NOT NULL
    )
  `);

  // 14. Create Leaderboard
  await exec(`
    CREATE TABLE IF NOT EXISTS leaderboard (
      id INTEGER PRIMARY KEY ${autoInc},
      student_id INTEGER NOT NULL,
      points INTEGER DEFAULT 0,
      category VARCHAR(50) NOT NULL,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    )
  `);

  // 15. Create Feedback
  await exec(`
    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY ${autoInc},
      student_id INTEGER,
      category VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      is_anonymous BOOLEAN DEFAULT 0,
      status VARCHAR(20) DEFAULT 'Pending',
      admin_reply TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL
    )
  `);

  // 16. Create Notifications
  await exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY ${autoInc},
      student_id INTEGER NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      is_read BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    )
  `);

  // 17. Create Chat History
  await exec(`
    CREATE TABLE IF NOT EXISTS chat_history (
      id INTEGER PRIMARY KEY ${autoInc},
      student_id INTEGER NOT NULL,
      role VARCHAR(20) NOT NULL,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    )
  `);

  console.log('Database tables verified.');

  // Check if seeding is needed by checking departments
  const deptCount = await query('SELECT COUNT(*) as count FROM departments');
  if (deptCount[0].count === 0) {
    console.log('Seeding initial data...');

    // 1. Seed Departments
    await exec(`INSERT INTO departments (name, code) VALUES ('Computer Science & Engineering', 'CS')`);
    await exec(`INSERT INTO departments (name, code) VALUES ('Electrical & Electronics Engineering', 'EE')`);
    await exec(`INSERT INTO departments (name, code) VALUES ('Mechanical Engineering', 'ME')`);

    // Get department IDs
    const depts = await query('SELECT * FROM departments');
    const csId = depts.find(d => d.code === 'CS').id;
    const eeId = depts.find(d => d.code === 'EE').id;
    const meId = depts.find(d => d.code === 'ME').id;

    // 2. Seed Students
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash('password', salt);
    const hashedAdminPass = await bcrypt.hash('admin123', salt);

    await exec(`
      INSERT INTO students (name, roll_number, department_id, year, semester, email, password_hash, role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, ['Alice Vance', 'CS2024001', csId, 3, 5, 'alice@nexora.edu', hashedPass, 'student']);

    await exec(`
      INSERT INTO students (name, roll_number, department_id, year, semester, email, password_hash, role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, ['Bob Marley', 'EE2025002', eeId, 2, 3, 'bob@nexora.edu', hashedPass, 'student']);

    await exec(`
      INSERT INTO students (name, roll_number, department_id, year, semester, email, password_hash, role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, ['Charlie Brown', 'CS2024003', csId, 3, 5, 'charlie@nexora.edu', hashedPass, 'student']);

    // Admin account
    await exec(`
      INSERT INTO students (name, roll_number, department_id, year, semester, email, password_hash, role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, ['System Administrator', 'ADMIN001', csId, 4, 8, 'admin@nexora.edu', hashedAdminPass, 'admin']);

    // Freshers (Year 1, Semester 1)
    await exec(`
      INSERT INTO students (name, roll_number, department_id, year, semester, email, password_hash, role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, ['Dave Miller', 'CS2026090', csId, 1, 1, 'dave@nexora.edu', hashedPass, 'student']);

    await exec(`
      INSERT INTO students (name, roll_number, department_id, year, semester, email, password_hash, role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, ['Emma Watson', 'EE2026095', eeId, 1, 1, 'emma@nexora.edu', hashedPass, 'student']);

    // Get Student IDs
    const students = await query('SELECT * FROM students');
    const aliceId = students.find(s => s.email === 'alice@nexora.edu').id;
    const bobId = students.find(s => s.email === 'bob@nexora.edu').id;
    const charlieId = students.find(s => s.email === 'charlie@nexora.edu').id;
    const daveId = students.find(s => s.email === 'dave@nexora.edu').id;
    const emmaId = students.find(s => s.email === 'emma@nexora.edu').id;

    // 3. Seed Faculty
    await exec(`
      INSERT INTO faculty (name, email, department_id, designation, office_room)
      VALUES (?, ?, ?, ?, ?)
    `, ['Dr. Aris Thorne', 'aris@nexora.edu', csId, 'Associate Professor', 'Block B, Lab 401']);
    await exec(`
      INSERT INTO faculty (name, email, department_id, designation, office_room)
      VALUES (?, ?, ?, ?, ?)
    `, ['Dr. John Sterling', 'john@nexora.edu', csId, 'Professor & HOD', 'Block B, Room 405']);
    await exec(`
      INSERT INTO faculty (name, email, department_id, designation, office_room)
      VALUES (?, ?, ?, ?, ?)
    `, ['Prof. Sarah Jenkins', 'sarah@nexora.edu', eeId, 'Assistant Professor', 'Block A, Room 302']);

    const faculty = await query('SELECT * FROM faculty');
    const arisId = faculty.find(f => f.email === 'aris@nexora.edu').id;
    const johnId = faculty.find(f => f.email === 'john@nexora.edu').id;
    const sarahId = faculty.find(f => f.email === 'sarah@nexora.edu').id;

    // 4. Seed Subjects
    await exec(`INSERT INTO subjects (name, code, department_id, semester) VALUES (?, ?, ?, ?)`,
      ['Database Management Systems', 'CS301', csId, 5]);
    await exec(`INSERT INTO subjects (name, code, department_id, semester) VALUES (?, ?, ?, ?)`,
      ['Artificial Intelligence', 'CS302', csId, 5]);
    await exec(`INSERT INTO subjects (name, code, department_id, semester) VALUES (?, ?, ?, ?)`,
      ['Software Engineering', 'CS303', csId, 5]);
    await exec(`INSERT INTO subjects (name, code, department_id, semester) VALUES (?, ?, ?, ?)`,
      ['Control Systems', 'EE201', eeId, 3]);
    await exec(`INSERT INTO subjects (name, code, department_id, semester) VALUES (?, ?, ?, ?)`,
      ['Network Analysis', 'EE202', eeId, 3]);
    await exec(`INSERT INTO subjects (name, code, department_id, semester) VALUES (?, ?, ?, ?)`,
      ['Introduction to Programming', 'CS101', csId, 1]);
    await exec(`INSERT INTO subjects (name, code, department_id, semester) VALUES (?, ?, ?, ?)`,
      ['Basic Electrical Circuits', 'EE101', eeId, 1]);

    const subjects = await query('SELECT * FROM subjects');
    const dbmsId = subjects.find(s => s.code === 'CS301').id;
    const aiId = subjects.find(s => s.code === 'CS302').id;
    const seId = subjects.find(s => s.code === 'CS303').id;
    const controlId = subjects.find(s => s.code === 'EE201').id;
    const introProgId = subjects.find(s => s.code === 'CS101').id;
    const basicCircuitsId = subjects.find(s => s.code === 'EE101').id;

    // 5. Seed Timetable
    await exec(`INSERT INTO timetable (subject_id, faculty_id, day_of_week, start_time, end_time, room_number) VALUES (?, ?, ?, ?, ?, ?)`,
      [dbmsId, arisId, 'Monday', '09:00', '10:30', 'Room 102']);
    await exec(`INSERT INTO timetable (subject_id, faculty_id, day_of_week, start_time, end_time, room_number) VALUES (?, ?, ?, ?, ?, ?)`,
      [aiId, johnId, 'Monday', '11:00', '12:30', 'Room 105']);
    await exec(`INSERT INTO timetable (subject_id, faculty_id, day_of_week, start_time, end_time, room_number) VALUES (?, ?, ?, ?, ?, ?)`,
      [seId, arisId, 'Tuesday', '09:00', '10:30', 'Room 204']);
    await exec(`INSERT INTO timetable (subject_id, faculty_id, day_of_week, start_time, end_time, room_number) VALUES (?, ?, ?, ?, ?, ?)`,
      [dbmsId, arisId, 'Wednesday', '09:00', '10:30', 'Room 102']);
    await exec(`INSERT INTO timetable (subject_id, faculty_id, day_of_week, start_time, end_time, room_number) VALUES (?, ?, ?, ?, ?, ?)`,
      [aiId, johnId, 'Thursday', '11:00', '12:30', 'Room 105']);
    await exec(`INSERT INTO timetable (subject_id, faculty_id, day_of_week, start_time, end_time, room_number) VALUES (?, ?, ?, ?, ?, ?)`,
      [seId, arisId, 'Friday', '13:00', '14:30', 'AI Lab']);
    
    // Timetable for Bob (EE, Year 2, Sem 3)
    await exec(`INSERT INTO timetable (subject_id, faculty_id, day_of_week, start_time, end_time, room_number) VALUES (?, ?, ?, ?, ?, ?)`,
      [controlId, sarahId, 'Monday', '09:00', '10:30', 'Room 302']);

    // 6. Seed Events
    await exec(`
      INSERT INTO events (title, description, category, type, date, time, location, department_id, max_participants)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'Nexora AI Hackathon 2026',
      'A 36-hour hackathon to build intelligent tools solving real-world education and SaaS bottlenecks.',
      'Innovation',
      'Hackathon',
      '2026-07-25',
      '09:00 AM',
      'Campus AI Innovation Lab',
      csId,
      120
    ]);
    await exec(`
      INSERT INTO events (title, description, category, type, date, time, location, department_id, max_participants)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'Advanced React & TypeScript Workshop',
      'Deep dive into patterns, state machines, and micro-animations for high-fidelity React projects.',
      'Technical',
      'Workshop',
      '2026-07-22',
      '02:00 PM',
      'Seminar Hall A',
      null,
      100
    ]);
    await exec(`
      INSERT INTO events (title, description, category, type, date, time, location, department_id, max_participants)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'Annual Cultural Fusion Night',
      'Celebrating local and international cultural arts, dances, and musical collaborations.',
      'Cultural',
      'Event',
      '2026-07-30',
      '06:30 PM',
      'Main Auditorium',
      null,
      500
    ]);
    await exec(`
      INSERT INTO events (title, description, category, type, date, time, location, department_id, max_participants)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'Intra-College Football League',
      'The annual soccer league tournament open to all departments.',
      'Sports',
      'Event',
      '2026-08-05',
      '04:00 PM',
      'Sports Arena Pitch A',
      null,
      80
    ]);

    const events = await query('SELECT * FROM events');
    const hackathonId = events.find(e => e.title.includes('AI Hackathon')).id;

    // 7. Seed Registrations
    await exec(`INSERT INTO registrations (student_id, event_id) VALUES (?, ?)`, [aliceId, hackathonId]);

    // 8. Seed Announcements
    await exec(`
      INSERT INTO announcements (title, content, category, department_id)
      VALUES ('Urgent: Course Registration Deadline Extended', 'Students can register or change elective subjects till July 22, 2026 without any late fee. Ensure portal validation is complete.', 'Urgent', null)
    `);
    await exec(`
      INSERT INTO announcements (title, content, category, department_id)
      VALUES (?, ?, ?, ?)
    `, ['Guest Lecture: Cloud and Edge Architectures', 'Dr. Thorne is hosting a guest session by Google Cloud engineers on serverless and edge computing architectures this Thursday at 10:00 AM.', 'Department', csId]);
    await exec(`
      INSERT INTO announcements (title, content, category, department_id)
      VALUES ('AI Innovation Lab Funding Approved', 'The college is proud to announce $150K in funding for upgrading our AI lab rigs with state-of-the-art Tensor Processing Units.', 'College', null)
    `);
    await exec(`
      INSERT INTO announcements (title, content, category, department_id)
      VALUES (?, ?, ?, ?)
    `, ['CSE Team Wins Smart National Hackathon', 'Congratulations to Alice Vance and team for securing 1st prize and a $5000 grant in the National Smart Campus Hackathon!', 'Achievement', csId]);

    // 9. Seed Bus Routes
    await exec(`
      INSERT INTO bus_routes (bus_number, route, driver_name, driver_contact)
      VALUES ('Route-12A', 'Downtown Hub -> City Plaza -> Central Avenue -> College Campus', 'Michael Vance', '+1 (555) 019-2831')
    `);
    await exec(`
      INSERT INTO bus_routes (bus_number, route, driver_name, driver_contact)
      VALUES ('Route-07B', 'East Suburbs -> Metro Link -> North Crossing -> College Campus', 'David Sterling', '+1 (555) 014-9844')
    `);

    // 10. Seed Attendance
    await exec(`INSERT INTO attendance (student_id, subject_id, date, status) VALUES (?, ?, ?, ?)`, [aliceId, dbmsId, '2026-07-10', 'Present']);
    await exec(`INSERT INTO attendance (student_id, subject_id, date, status) VALUES (?, ?, ?, ?)`, [aliceId, dbmsId, '2026-07-12', 'Present']);
    await exec(`INSERT INTO attendance (student_id, subject_id, date, status) VALUES (?, ?, ?, ?)`, [aliceId, dbmsId, '2026-07-14', 'Present']);
    await exec(`INSERT INTO attendance (student_id, subject_id, date, status) VALUES (?, ?, ?, ?)`, [aliceId, aiId, '2026-07-11', 'Present']);
    await exec(`INSERT INTO attendance (student_id, subject_id, date, status) VALUES (?, ?, ?, ?)`, [aliceId, aiId, '2026-07-13', 'Absent']); // Absent
    await exec(`INSERT INTO attendance (student_id, subject_id, date, status) VALUES (?, ?, ?, ?)`, [aliceId, aiId, '2026-07-15', 'Present']);

    // Seed Freshman Dave CS101 - 90% attendance (9 Present, 1 Absent)
    await exec(`INSERT INTO attendance (student_id, subject_id, date, status) VALUES (?, ?, ?, ?)`, [daveId, introProgId, '2026-07-10', 'Present']);
    await exec(`INSERT INTO attendance (student_id, subject_id, date, status) VALUES (?, ?, ?, ?)`, [daveId, introProgId, '2026-07-11', 'Present']);
    await exec(`INSERT INTO attendance (student_id, subject_id, date, status) VALUES (?, ?, ?, ?)`, [daveId, introProgId, '2026-07-12', 'Present']);
    await exec(`INSERT INTO attendance (student_id, subject_id, date, status) VALUES (?, ?, ?, ?)`, [daveId, introProgId, '2026-07-13', 'Present']);
    await exec(`INSERT INTO attendance (student_id, subject_id, date, status) VALUES (?, ?, ?, ?)`, [daveId, introProgId, '2026-07-14', 'Present']);
    await exec(`INSERT INTO attendance (student_id, subject_id, date, status) VALUES (?, ?, ?, ?)`, [daveId, introProgId, '2026-07-15', 'Absent']);
    await exec(`INSERT INTO attendance (student_id, subject_id, date, status) VALUES (?, ?, ?, ?)`, [daveId, introProgId, '2026-07-16', 'Present']);
    await exec(`INSERT INTO attendance (student_id, subject_id, date, status) VALUES (?, ?, ?, ?)`, [daveId, introProgId, '2026-07-17', 'Present']);
    await exec(`INSERT INTO attendance (student_id, subject_id, date, status) VALUES (?, ?, ?, ?)`, [daveId, introProgId, '2026-07-18', 'Present']);
    await exec(`INSERT INTO attendance (student_id, subject_id, date, status) VALUES (?, ?, ?, ?)`, [daveId, introProgId, '2026-07-19', 'Present']);

    // Seed Freshman Emma EE101 - 60% attendance (6 Present, 4 Absent)
    await exec(`INSERT INTO attendance (student_id, subject_id, date, status) VALUES (?, ?, ?, ?)`, [emmaId, basicCircuitsId, '2026-07-10', 'Present']);
    await exec(`INSERT INTO attendance (student_id, subject_id, date, status) VALUES (?, ?, ?, ?)`, [emmaId, basicCircuitsId, '2026-07-11', 'Absent']);
    await exec(`INSERT INTO attendance (student_id, subject_id, date, status) VALUES (?, ?, ?, ?)`, [emmaId, basicCircuitsId, '2026-07-12', 'Absent']);
    await exec(`INSERT INTO attendance (student_id, subject_id, date, status) VALUES (?, ?, ?, ?)`, [emmaId, basicCircuitsId, '2026-07-13', 'Present']);
    await exec(`INSERT INTO attendance (student_id, subject_id, date, status) VALUES (?, ?, ?, ?)`, [emmaId, basicCircuitsId, '2026-07-14', 'Present']);
    await exec(`INSERT INTO attendance (student_id, subject_id, date, status) VALUES (?, ?, ?, ?)`, [emmaId, basicCircuitsId, '2026-07-15', 'Absent']);
    await exec(`INSERT INTO attendance (student_id, subject_id, date, status) VALUES (?, ?, ?, ?)`, [emmaId, basicCircuitsId, '2026-07-16', 'Absent']);
    await exec(`INSERT INTO attendance (student_id, subject_id, date, status) VALUES (?, ?, ?, ?)`, [emmaId, basicCircuitsId, '2026-07-17', 'Present']);
    await exec(`INSERT INTO attendance (student_id, subject_id, date, status) VALUES (?, ?, ?, ?)`, [emmaId, basicCircuitsId, '2026-07-18', 'Present']);
    await exec(`INSERT INTO attendance (student_id, subject_id, date, status) VALUES (?, ?, ?, ?)`, [emmaId, basicCircuitsId, '2026-07-19', 'Present']);

    // 11. Seed Marks
    await exec(`INSERT INTO marks (student_id, subject_id, type, score, max_score) VALUES (?, ?, ?, ?, ?)`, [aliceId, dbmsId, 'Internal 1', 24.5, 25]);
    await exec(`INSERT INTO marks (student_id, subject_id, type, score, max_score) VALUES (?, ?, ?, ?, ?)`, [aliceId, dbmsId, 'Internal 2', 23.0, 25]);
    await exec(`INSERT INTO marks (student_id, subject_id, type, score, max_score) VALUES (?, ?, ?, ?, ?)`, [aliceId, aiId, 'Internal 1', 22.0, 25]);
    await exec(`INSERT INTO marks (student_id, subject_id, type, score, max_score) VALUES (?, ?, ?, ?, ?)`, [aliceId, aiId, 'Internal 2', 24.0, 25]);

    // Seed Freshman Dave CS101 Marks
    await exec(`INSERT INTO marks (student_id, subject_id, type, score, max_score) VALUES (?, ?, ?, ?, ?)`, [daveId, introProgId, 'Internal 1', 22.0, 25]);
    // Seed Freshman Emma EE101 Marks
    await exec(`INSERT INTO marks (student_id, subject_id, type, score, max_score) VALUES (?, ?, ?, ?, ?)`, [emmaId, basicCircuitsId, 'Internal 1', 16.0, 25]);

    // 12. Seed Assignments
    await exec(`
      INSERT INTO assignments (subject_id, title, description, due_date, status)
      VALUES (?, 'Database Optimization Writeup', 'Write a 4-page report comparing indexes, partitioning, and execution plans in MySQL vs PostgreSQL.', '2026-07-20', 'Pending')
    `, [dbmsId]);
    await exec(`
      INSERT INTO assignments (subject_id, title, description, due_date, status)
      VALUES (?, 'Neural Network from Scratch', 'Implement backpropagation in pure NumPy. Do not use PyTorch/TensorFlow.', '2026-07-28', 'Pending')
    `, [aiId]);

    // 13. Seed Clubs
    const TuringEvents = JSON.stringify([
      { title: 'AI Ethics Panel Discussion', date: '2026-07-24' },
      { title: 'Weekly Leetcode Sprint', date: '2026-07-28' }
    ]);
    const PulseEvents = JSON.stringify([
      { title: 'Open Mic Acoustic Night', date: '2026-07-29' }
    ]);
    const TitansEvents = JSON.stringify([
      { title: 'Inter-College Track Trials', date: '2026-08-01' }
    ]);

    await exec(`
      INSERT INTO clubs (name, description, category, upcoming_events_json, members_count, leader_name)
      VALUES ('Turing Coding Club', 'The elite technical society for competitive programmers, web devs, and machine learning practitioners.', 'Technical', ?, 142, 'Alice Vance')
    `, [TuringEvents]);
    await exec(`
      INSERT INTO clubs (name, description, category, upcoming_events_json, members_count, leader_name)
      VALUES ('Pulse Arts & Music', 'A vibrant cultural club for musicians, singers, visual artists, and theatrical directors.', 'Cultural', ?, 88, 'Jessica Miller')
    `, [PulseEvents]);
    await exec(`
      INSERT INTO clubs (name, description, category, upcoming_events_json, members_count, leader_name)
      VALUES ('Titans Athletic Guild', 'Sports club organising track and field events, basketball leagues, and campus soccer tournaments.', 'Sports', ?, 63, 'Thomas Reed')
    `, [TitansEvents]);

    // 14. Seed Leaderboard
    await exec(`INSERT INTO leaderboard (student_id, points, category) VALUES (?, ?, ?)`, [aliceId, 1850, 'Coding']);
    await exec(`INSERT INTO leaderboard (student_id, points, category) VALUES (?, ?, ?)`, [aliceId, 1200, 'Hackathons']);
    await exec(`INSERT INTO leaderboard (student_id, points, category) VALUES (?, ?, ?)`, [aliceId, 950, 'Innovation']);
    await exec(`INSERT INTO leaderboard (student_id, points, category) VALUES (?, ?, ?)`, [charlieId, 1600, 'Coding']);
    await exec(`INSERT INTO leaderboard (student_id, points, category) VALUES (?, ?, ?)`, [charlieId, 800, 'Hackathons']);
    await exec(`INSERT INTO leaderboard (student_id, points, category) VALUES (?, ?, ?)`, [bobId, 1100, 'Sports']);

    // 15. Seed Feedback
    await exec(`
      INSERT INTO feedback (student_id, category, title, message, is_anonymous, status, admin_reply)
      VALUES (?, 'Facilities', 'Library Air Conditioning Broken', 'The library air conditioner in the second floor study zone has been leaking and is turned off. It gets extremely hot in the afternoon.', 0, 'Resolved', 'The service contractor fixed the compressor leak on July 14. AC is now back in operation.')
    `, [aliceId]);
    await exec(`
      INSERT INTO feedback (student_id, category, title, message, is_anonymous, status, admin_reply)
      VALUES (?, 'Transport', 'Bus 12A Late Arrival', 'Bus 12A consistently arrives 15 minutes late at the City Plaza stop, causing students to miss the 9:00 AM class.', 1, 'Pending', null)
    `, [aliceId]);

    // 16. Seed Notifications
    await exec(`
      INSERT INTO notifications (student_id, title, message, is_read)
      VALUES (?, 'Assignment Deadline Approaching', 'Your DBMS Assignment 1: Database Optimization is due on July 20, 2026. Submit before midnight.', 0)
    `, [aliceId]);
    await exec(`
      INSERT INTO notifications (student_id, title, message, is_read)
      VALUES (?, 'Welcome to Nexora', 'Hi Alice! Welcome to the new premium personalized college portal. Explore your custom metrics now.', 1)
    `, [aliceId]);

    console.log('Seeding completed successfully.');
  } else {
    console.log('Database already seeded.');
  }

  // Ensure Fresher's Party 2026 is seeded in all environments (including production)
  const freshersEvent = await query("SELECT id FROM events WHERE title = ?", ["Fresher's Party 2026"]);
  if (freshersEvent.length === 0) {
    console.log("Seeding Fresher's Party 2026 into events...");
    await exec(`
      INSERT INTO events (title, description, category, type, date, time, location, department_id, max_participants, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)
    `, [
      "Fresher's Party 2026",
      "A grand welcome to the new beginning! Join us for an unforgettable night of live DJ & dance floor, music & cultural performances, fun games & activities, delicious dinner, and a chance to unite & connect. Organized by the Student Council & Cultural Committee.",
      "Cultural",
      "Event",
      "2026-10-18",
      "6:00 PM Onwards",
      "SCE Main Auditorium",
      500,
      "/uploads/freshers_party_2026.jpg"
    ]);
  }

  // Ensure all required departments are seeded in all environments
  const requiredDepts = [
    { code: 'CS', name: 'Computer Science & Engineering' },
    { code: 'EE', name: 'Electrical & Electronics Engineering' },
    { code: 'ME', name: 'Mechanical Engineering' },
    { code: 'CE', name: 'Civil Engineering' },
    { code: 'ECE', name: 'Electronics & Communication Engineering' },
    { code: 'IT', name: 'Information Technology' },
    { code: 'AIDS', name: 'Artificial Intelligence & Data Science' }
  ];
  for (const dept of requiredDepts) {
    const existing = await query("SELECT id FROM departments WHERE code = ?", [dept.code]);
    if (existing.length === 0) {
      console.log(`Auto-seeding department ${dept.code} (${dept.name})...`);
      await exec("INSERT INTO departments (name, code) VALUES (?, ?)", [dept.name, dept.code]);
    }
  }

  // Ensure computing branch students have seed LeetCode stats if missing
  try {
    const csDept = await query("SELECT id FROM departments WHERE code = 'CS'");
    const itDept = await query("SELECT id FROM departments WHERE code = 'IT'");
    const aidsDept = await query("SELECT id FROM departments WHERE code = 'AIDS'");
    const compDeptIds = [...csDept, ...itDept, ...aidsDept].map(d => d.id);

    if (compDeptIds.length > 0) {
      const placeholders = compDeptIds.map(() => '?').join(',');
      const compStudents = await query(`SELECT * FROM students WHERE department_id IN (${placeholders})`, compDeptIds);
      for (const student of compStudents) {
        if (!student.leetcode_handle || student.leetcode_solved === 0) {
          if (student.email === 'alice@nexora.edu') {
            await exec(`UPDATE students SET leetcode_handle = ?, leetcode_solved = ?, leetcode_easy = ?, leetcode_medium = ?, leetcode_hard = ?, leetcode_rating = ?, leetcode_ranking = ? WHERE id = ?`,
              ['alice_vance', 485, 180, 245, 60, 1942, 14200, student.id]);
          } else if (student.email === 'charlie@nexora.edu') {
            await exec(`UPDATE students SET leetcode_handle = ?, leetcode_solved = ?, leetcode_easy = ?, leetcode_medium = ?, leetcode_hard = ?, leetcode_rating = ?, leetcode_ranking = ? WHERE id = ?`,
              ['charlie_dev', 360, 150, 170, 40, 1785, 32500, student.id]);
          } else if (student.email === 'dave@nexora.edu') {
            await exec(`UPDATE students SET leetcode_handle = ?, leetcode_solved = ?, leetcode_easy = ?, leetcode_medium = ?, leetcode_hard = ?, leetcode_rating = ?, leetcode_ranking = ? WHERE id = ?`,
              ['dave_coder', 210, 110, 85, 15, 1620, 75000, student.id]);
          } else if (student.role !== 'admin') {
            const handle = student.name.toLowerCase().replace(/\s+/g, '_') + '_lc';
            await exec(`UPDATE students SET leetcode_handle = ?, leetcode_solved = ?, leetcode_easy = ?, leetcode_medium = ?, leetcode_hard = ?, leetcode_rating = ?, leetcode_ranking = ? WHERE id = ?`,
              [handle, 275, 120, 130, 25, 1690, 52000, student.id]);
          }
        }
      }
    }
  } catch (err) {
    console.error('Error auto-seeding LeetCode stats:', err);
  }
}
