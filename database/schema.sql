-- ==========================================================
-- NEXORA COLLEGE PORTAL DATABASE SCHEMA
-- Compatible with SQLite (local) and MySQL (production)
-- ==========================================================

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS departments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(10) NOT NULL UNIQUE
);

-- 2. Students Table
CREATE TABLE IF NOT EXISTS students (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  roll_number VARCHAR(50) NOT NULL UNIQUE,
  department_id INT NOT NULL,
  year INT NOT NULL,
  semester INT NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'student',
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);
CREATE INDEX idx_students_roll ON students(roll_number);
CREATE INDEX idx_students_email ON students(email);

-- 3. Faculty Table
CREATE TABLE IF NOT EXISTS faculty (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  department_id INT NOT NULL,
  designation VARCHAR(100) NOT NULL,
  office_room VARCHAR(50) NOT NULL,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);

-- 4. Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(20) NOT NULL UNIQUE,
  department_id INT NOT NULL,
  semester INT NOT NULL,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);

-- 5. Timetable Table
CREATE TABLE IF NOT EXISTS timetable (
  id INT PRIMARY KEY AUTO_INCREMENT,
  subject_id INT NOT NULL,
  faculty_id INT NOT NULL,
  day_of_week VARCHAR(20) NOT NULL,
  start_time VARCHAR(10) NOT NULL,
  end_time VARCHAR(10) NOT NULL,
  room_number VARCHAR(50) NOT NULL,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE CASCADE
);
CREATE INDEX idx_timetable_lookup ON timetable(day_of_week);

-- 6. Events Table
CREATE TABLE IF NOT EXISTS events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  type VARCHAR(50) NOT NULL,
  date VARCHAR(20) NOT NULL,
  time VARCHAR(20) NOT NULL,
  location VARCHAR(255) NOT NULL,
  department_id INT NULL,
  max_participants INT DEFAULT 100,
  image_url TEXT NULL,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);

-- 7. Registrations Table
CREATE TABLE IF NOT EXISTS registrations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  event_id INT NOT NULL,
  registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  UNIQUE(student_id, event_id)
);

-- 8. Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  department_id INT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);

-- 9. Bus Routes Table
CREATE TABLE IF NOT EXISTS bus_routes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  bus_number VARCHAR(50) NOT NULL UNIQUE,
  route VARCHAR(255) NOT NULL,
  driver_name VARCHAR(100) NOT NULL,
  driver_contact VARCHAR(20) NOT NULL
);

-- 10. Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  subject_id INT NOT NULL,
  date VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

-- 11. Marks Table
CREATE TABLE IF NOT EXISTS marks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  subject_id INT NOT NULL,
  type VARCHAR(50) NOT NULL,
  score REAL NOT NULL,
  max_score REAL NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

-- 12. Assignments Table
CREATE TABLE IF NOT EXISTS assignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  subject_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  due_date VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'Pending',
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

-- 13. Clubs Table
CREATE TABLE IF NOT EXISTS clubs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  upcoming_events_json TEXT NOT NULL,
  members_count INT DEFAULT 0,
  leader_name VARCHAR(100) NOT NULL
);

-- 14. Leaderboard Table
CREATE TABLE IF NOT EXISTS leaderboard (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  points INT DEFAULT 0,
  category VARCHAR(50) NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 15. Feedback Table
CREATE TABLE IF NOT EXISTS feedback (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NULL,
  category VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT 0,
  status VARCHAR(20) DEFAULT 'Pending',
  admin_reply TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL
);

-- 16. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 17. Chat History Table
CREATE TABLE IF NOT EXISTS chat_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  role VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);
