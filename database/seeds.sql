-- ==========================================================
-- NEXORA MOCK DATA SEEDING SCRIPT
-- ==========================================================

-- 1. Insert Departments
INSERT INTO departments (id, name, code) VALUES 
(1, 'Computer Science & Engineering', 'CS'),
(2, 'Electrical & Electronics Engineering', 'EE'),
(3, 'Mechanical Engineering', 'ME');

-- 2. Insert Students
-- Note: password_hash below is bcrypt('password')
INSERT INTO students (id, name, roll_number, department_id, year, semester, email, password_hash, role) VALUES 
(1, 'Alice Vance', 'CS2024001', 1, 3, 5, 'alice@nexora.edu', '$2a$10$Y5n2b.Uly7K.wO3a1m76AOHg3QG8/n6HqA5cZ0m4D5L6Y7z7r9t2W', 'student'),
(2, 'Bob Marley', 'EE2025002', 2, 2, 3, 'bob@nexora.edu', '$2a$10$Y5n2b.Uly7K.wO3a1m76AOHg3QG8/n6HqA5cZ0m4D5L6Y7z7r9t2W', 'student'),
(3, 'Charlie Brown', 'CS2024003', 1, 3, 5, 'charlie@nexora.edu', '$2a$10$Y5n2b.Uly7K.wO3a1m76AOHg3QG8/n6HqA5cZ0m4D5L6Y7z7r9t2W', 'student'),
(4, 'System Administrator', 'ADMIN001', 1, 4, 8, 'admin@nexora.edu', '$2a$10$MqnORlx1W3Sq81Icbh3TkeSMCJC8HzGX4376rr5jiqA59ol3r89bO', 'admin');

-- 3. Insert Faculty
INSERT INTO faculty (id, name, email, department_id, designation, office_room) VALUES 
(1, 'Dr. Aris Thorne', 'aris@nexora.edu', 1, 'Associate Professor', 'Block B, Lab 401'),
(2, 'Dr. John Sterling', 'john@nexora.edu', 1, 'Professor & HOD', 'Block B, Room 405'),
(3, 'Prof. Sarah Jenkins', 'sarah@nexora.edu', 2, 'Assistant Professor', 'Block A, Room 302');

-- 4. Insert Subjects
INSERT INTO subjects (id, name, code, department_id, semester) VALUES 
(1, 'Database Management Systems', 'CS301', 1, 5),
(2, 'Artificial Intelligence', 'CS302', 1, 5),
(3, 'Software Engineering', 'CS303', 1, 5),
(4, 'Control Systems', 'EE201', 2, 3),
(5, 'Network Analysis', 'EE202', 2, 3);

-- 5. Insert Timetable
INSERT INTO timetable (subject_id, faculty_id, day_of_week, start_time, end_time, room_number) VALUES 
(1, 1, 'Monday', '09:00', '10:30', 'Room 102'),
(2, 2, 'Monday', '11:00', '12:30', 'Room 105'),
(3, 1, 'Tuesday', '09:00', '10:30', 'Room 204'),
(1, 1, 'Wednesday', '09:00', '10:30', 'Room 102'),
(2, 2, 'Thursday', '11:00', '12:30', 'Room 105'),
(3, 1, 'Friday', '13:00', '14:30', 'AI Lab'),
(4, 3, 'Monday', '09:00', '10:30', 'Room 302');

-- 6. Insert Events
INSERT INTO events (id, title, description, category, type, date, time, location, department_id, max_participants) VALUES 
(1, 'Nexora AI Hackathon 2026', 'A 36-hour hackathon to build intelligent tools solving real-world education and SaaS bottlenecks.', 'Innovation', 'Hackathon', '2026-07-25', '09:00 AM', 'Campus AI Innovation Lab', 1, 120),
(2, 'Advanced React & TypeScript Workshop', 'Deep dive into patterns, state machines, and micro-animations for high-fidelity React projects.', 'Technical', 'Workshop', '2026-07-22', '02:00 PM', 'Seminar Hall A', NULL, 100),
(3, 'Annual Cultural Fusion Night', 'Celebrating local and international cultural arts, dances, and musical collaborations.', 'Cultural', 'Event', '2026-07-30', '06:30 PM', 'Main Auditorium', NULL, 500),
(4, 'Intra-College Football League', 'The annual soccer league tournament open to all departments.', 'Sports', 'Event', '2026-08-05', '04:00 PM', 'Sports Arena Pitch A', NULL, 80);

-- 7. Register Student Alice (id: 1) for AI Hackathon (id: 1)
INSERT INTO registrations (student_id, event_id) VALUES (1, 1);

-- 8. Insert Announcements
INSERT INTO announcements (title, content, category, department_id) VALUES 
('Urgent: Course Registration Deadline Extended', 'Students can register or change elective subjects till July 22, 2026 without any late fee. Ensure portal validation is complete.', 'Urgent', NULL),
('Guest Lecture: Cloud and Edge Architectures', 'Dr. Thorne is hosting a guest session by Google Cloud engineers on serverless and edge computing architectures this Thursday at 10:00 AM.', 'Department', 1),
('AI Innovation Lab Funding Approved', 'The college is proud to announce $150K in funding for upgrading our AI lab rigs with state-of-the-art Tensor Processing Units.', 'College', NULL),
('CSE Team Wins Smart National Hackathon', 'Congratulations to Alice Vance and team for securing 1st prize and a $5000 grant in the National Smart Campus Hackathon!', 'Achievement', 1);

-- 9. Insert Bus Routes
INSERT INTO bus_routes (bus_number, route, driver_name, driver_contact) VALUES 
('Route-12A', 'Downtown Hub -> City Plaza -> Central Avenue -> College Campus', 'Michael Vance', '+1 (555) 019-2831'),
('Route-07B', 'East Suburbs -> Metro Link -> North Crossing -> College Campus', 'David Sterling', '+1 (555) 014-9844');

-- 10. Insert Attendance
INSERT INTO attendance (student_id, subject_id, date, status) VALUES 
(1, 1, '2026-07-10', 'Present'),
(1, 1, '2026-07-12', 'Present'),
(1, 1, '2026-07-14', 'Present'),
(1, 2, '2026-07-11', 'Present'),
(1, 2, '2026-07-13', 'Absent'),
(1, 2, '2026-07-15', 'Present');

-- 11. Insert Marks
INSERT INTO marks (student_id, subject_id, type, score, max_score) VALUES 
(1, 1, 'Internal 1', 24.5, 25),
(1, 1, 'Internal 2', 23.0, 25),
(1, 2, 'Internal 1', 22.0, 25),
(1, 2, 'Internal 2', 24.0, 25);

-- 12. Insert Assignments
INSERT INTO assignments (id, subject_id, title, description, due_date, status) VALUES 
(1, 1, 'Database Optimization Writeup', 'Write a 4-page report comparing indexes, partitioning, and execution plans in MySQL vs PostgreSQL.', '2026-07-20', 'Pending'),
(2, 2, 'Neural Network from Scratch', 'Implement backpropagation in pure NumPy. Do not use PyTorch/TensorFlow.', '2026-07-28', 'Pending');

-- 13. Insert Clubs
INSERT INTO clubs (id, name, description, category, upcoming_events_json, members_count, leader_name) VALUES 
(1, 'Turing Coding Club', 'The elite technical society for competitive programmers, web devs, and machine learning practitioners.', 'Technical', '[{"title":"AI Ethics Panel Discussion","date":"2026-07-24"},{"title":"Weekly Leetcode Sprint","date":"2026-07-28"}]', 142, 'Alice Vance'),
(2, 'Pulse Arts & Music', 'A vibrant cultural club for musicians, singers, visual artists, and theatrical directors.', 'Cultural', '[{"title":"Open Mic Acoustic Night","date":"2026-07-29"}]', 88, 'Jessica Miller'),
(3, 'Titans Athletic Guild', 'Sports club organising track and field events, basketball leagues, and campus soccer tournaments.', 'Sports', '[{"title":"Inter-College Track Trials","date":"2026-08-01"}]', 63, 'Thomas Reed');

-- 14. Insert Leaderboard scores
INSERT INTO leaderboard (student_id, points, category) VALUES 
(1, 1850, 'Coding'),
(1, 1200, 'Hackathons'),
(1, 950, 'Innovation'),
(3, 1600, 'Coding'),
(3, 800, 'Hackathons'),
(2, 1100, 'Sports');

-- 15. Insert Grievance feedback items
INSERT INTO feedback (id, student_id, category, title, message, is_anonymous, status, admin_reply) VALUES 
(1, 1, 'Facilities', 'Library Air Conditioning Broken', 'The library air conditioner in the second floor study zone has been leaking and is turned off. It gets extremely hot in the afternoon.', 0, 'Resolved', 'The service contractor fixed the compressor leak on July 14. AC is now back in operation.'),
(2, 1, 'Transport', 'Bus 12A Late Arrival', 'Bus 12A consistently arrives 15 minutes late at the City Plaza stop, causing students to miss the 9:00 AM class.', 1, 'Pending', NULL);

-- 16. Insert Notifications
INSERT INTO notifications (student_id, title, message, is_read) VALUES 
(1, 'Assignment Deadline Approaching', 'Your DBMS Assignment 1: Database Optimization is due on July 20, 2026. Submit before midnight.', 0),
(1, 'Welcome to Nexora', 'Hi Alice! Welcome to the new premium personalized college portal. Explore your custom metrics now.', 1);
