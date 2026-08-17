-- ====================================================
-- EEE DEPARTMENT MOBILE & WEB APP - SUPABASE SQL SCHEMA
-- ====================================================
-- Paste this script into your Supabase SQL Editor (https://supabase.com)
-- to automatically create all tables, enable RLS, and load seed data.

-- 1. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('exam', 'hackathon', 'event', 'general')),
  date DATE NOT NULL,
  poster_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. STUDENT PROFILES TABLE
CREATE TABLE IF NOT EXISTS student_profiles (
  id TEXT PRIMARY KEY, -- Maps to email
  roll_no TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  cgpa_json JSONB DEFAULT '{}'::jsonb NOT NULL,
  arrears_count INTEGER DEFAULT 0 NOT NULL,
  nptel_exams JSONB DEFAULT '[]'::jsonb NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. STUDENT DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS student_documents (
  id TEXT PRIMARY KEY,
  student_email TEXT NOT NULL,
  name TEXT NOT NULL,
  size TEXT NOT NULL,
  type TEXT NOT NULL,
  data_url TEXT NOT NULL, -- Base64 string payload
  uploaded_at TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. ATTENDANCE LOGS TABLE
CREATE TABLE IF NOT EXISTS attendance_logs (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  period INTEGER NOT NULL CHECK (period BETWEEN 1 AND 7),
  student_roll_no TEXT NOT NULL,
  student_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent')),
  marked_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. COURSES TABLE
CREATE TABLE IF NOT EXISTS courses (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  credits INTEGER NOT NULL,
  semester INTEGER NOT NULL,
  teacher_name TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 9. FACULTY TABLE
CREATE TABLE IF NOT EXISTS faculty (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL
);

-- 10. RULES TABLE
CREATE TABLE IF NOT EXISTS rules (
  id SERIAL PRIMARY KEY,
  icon TEXT NOT NULL DEFAULT '📜',
  title TEXT NOT NULL,
  desc TEXT NOT NULL
);

-- 11. TIMETABLE ENTRIES TABLE
CREATE TABLE IF NOT EXISTS timetable_entries (
  id SERIAL PRIMARY KEY,
  day TEXT NOT NULL,        -- 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
  period INTEGER NOT NULL,  -- 1-7
  subject TEXT NOT NULL,
  teacher TEXT DEFAULT '',
  semester INTEGER DEFAULT 6
);

-- 6. MILESTONES TABLE
CREATE TABLE IF NOT EXISTS milestones (
  id SERIAL PRIMARY KEY,
  date TEXT NOT NULL,
  event TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('academic', 'exam', 'holiday'))
);

-- 7. LABS TABLE
CREATE TABLE IF NOT EXISTS labs (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  block TEXT NOT NULL,
  icon TEXT NOT NULL
);

-- 8. SUGGESTIONS TABLE
CREATE TABLE IF NOT EXISTS suggestions (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);


-- ====================================================
-- HELPER FUNCTIONS & NEW TABLES
-- ====================================================

-- 1. Helper function to check if the authenticated user is a faculty member
CREATE OR REPLACE FUNCTION is_faculty()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    auth.jwt() ->> 'email' = 'teacher@eee.com'
    OR auth.jwt() ->> 'email' LIKE '%@srec.ac.in'
    OR EXISTS (
      SELECT 1 FROM faculty WHERE email = auth.jwt() ->> 'email'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Letter Requests Table
CREATE TABLE IF NOT EXISTS letter_requests (
  id TEXT PRIMARY KEY,
  student_email TEXT NOT NULL,
  student_name TEXT NOT NULL,
  roll_no TEXT NOT NULL,
  letter_type TEXT NOT NULL,
  purpose TEXT NOT NULL,
  details TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  requested_at TEXT NOT NULL,
  pdf_url TEXT,
  admin_remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. OD Requests Table
CREATE TABLE IF NOT EXISTS od_requests (
  id TEXT PRIMARY KEY,
  student_email TEXT NOT NULL,
  student_name TEXT NOT NULL,
  roll_no TEXT NOT NULL,
  od_type TEXT NOT NULL,
  od_sub_category TEXT NOT NULL,
  event_name TEXT NOT NULL,
  event_date TEXT NOT NULL,
  venue TEXT NOT NULL,
  faculty_coordinator TEXT NOT NULL,
  students JSONB DEFAULT '[]'::jsonb NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  requested_at TEXT NOT NULL,
  pdf_url TEXT,
  admin_remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================

-- Enable RLS on all tables
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE labs ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE letter_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE od_requests ENABLE ROW LEVEL SECURITY;

-- A. ANNOUNCEMENTS POLICIES
CREATE POLICY "Allow public read access to announcements" 
ON announcements FOR SELECT 
USING (true);

CREATE POLICY "Allow write access for faculty on announcements" 
ON announcements FOR ALL 
USING (is_faculty())
WITH CHECK (is_faculty());


-- B. STUDENT PROFILES POLICIES
CREATE POLICY "View student profiles policy" 
ON student_profiles FOR SELECT 
USING (
  auth.jwt() ->> 'email' = email 
  OR is_faculty()
  OR auth.role() = 'authenticated' -- Fallback allowance for dev testing
);

CREATE POLICY "Update student profiles policy" 
ON student_profiles FOR UPDATE 
USING (
  auth.jwt() ->> 'email' = email 
  OR is_faculty()
)
WITH CHECK (
  auth.jwt() ->> 'email' = email 
  OR is_faculty()
);

CREATE POLICY "Insert student profiles policy" 
ON student_profiles FOR INSERT 
WITH CHECK (true);


-- C. STUDENT DOCUMENTS POLICIES
CREATE POLICY "Access own documents select" 
ON student_documents FOR SELECT 
USING (
  auth.jwt() ->> 'email' = student_email 
  OR is_faculty()
  OR auth.role() = 'authenticated'
);

CREATE POLICY "Insert own documents" 
ON student_documents FOR INSERT 
WITH CHECK (
  auth.jwt() ->> 'email' = student_email 
  OR is_faculty()
  OR auth.role() = 'authenticated'
);

CREATE POLICY "Delete own documents" 
ON student_documents FOR DELETE 
USING (
  auth.jwt() ->> 'email' = student_email 
  OR is_faculty()
);


-- D. ATTENDANCE LOGS POLICIES
CREATE POLICY "View attendance logs" 
ON attendance_logs FOR SELECT 
USING (true);

CREATE POLICY "Mark attendance logs" 
ON attendance_logs FOR ALL 
USING (is_faculty())
WITH CHECK (is_faculty());


-- E. COURSES POLICIES
CREATE POLICY "Allow public read access to courses" 
ON courses FOR SELECT 
USING (true);

CREATE POLICY "Allow write access to courses for faculty" 
ON courses FOR ALL 
USING (is_faculty())
WITH CHECK (is_faculty());


-- F. MILESTONES POLICIES
CREATE POLICY "Allow public read access to milestones" 
ON milestones FOR SELECT 
USING (true);

CREATE POLICY "Allow write access to milestones for faculty" 
ON milestones FOR ALL 
USING (is_faculty())
WITH CHECK (is_faculty());


-- G. LABS POLICIES
CREATE POLICY "Allow public read access to labs" 
ON labs FOR SELECT 
USING (true);

CREATE POLICY "Allow write access to labs for faculty" 
ON labs FOR ALL 
USING (is_faculty())
WITH CHECK (is_faculty());


-- H. SUGGESTIONS POLICIES
CREATE POLICY "Allow public insert suggestions" 
ON suggestions FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow faculty read suggestions" 
ON suggestions FOR SELECT 
USING (is_faculty());


-- I. FACULTY POLICIES
CREATE POLICY "Allow public read access to faculty" 
ON faculty FOR SELECT 
USING (true);

CREATE POLICY "Allow write access to faculty for faculty" 
ON faculty FOR ALL 
USING (is_faculty())
WITH CHECK (is_faculty());


-- J. RULES POLICIES
CREATE POLICY "Allow public read access to rules" 
ON rules FOR SELECT 
USING (true);

CREATE POLICY "Allow write access to rules for faculty" 
ON rules FOR ALL 
USING (is_faculty())
WITH CHECK (is_faculty());


-- K. TIMETABLE POLICIES
CREATE POLICY "Allow public read access to timetable" 
ON timetable_entries FOR SELECT 
USING (true);

CREATE POLICY "Allow write access to timetable for faculty" 
ON timetable_entries FOR ALL 
USING (is_faculty())
WITH CHECK (is_faculty());


-- L. LETTER REQUESTS POLICIES
CREATE POLICY "Allow users to read their own letter requests, or faculty to read all" 
ON letter_requests FOR SELECT 
USING (
  auth.jwt() ->> 'email' = student_email 
  OR is_faculty()
);

CREATE POLICY "Allow users to insert their own letter requests" 
ON letter_requests FOR INSERT 
WITH CHECK (
  auth.jwt() ->> 'email' = student_email
);

CREATE POLICY "Allow faculty to update any letter request" 
ON letter_requests FOR UPDATE 
USING (is_faculty())
WITH CHECK (is_faculty());

CREATE POLICY "Allow faculty to delete any letter request" 
ON letter_requests FOR DELETE 
USING (is_faculty());


-- M. OD REQUESTS POLICIES
CREATE POLICY "Allow users to read their own od requests, or faculty to read all" 
ON od_requests FOR SELECT 
USING (
  auth.jwt() ->> 'email' = student_email 
  OR is_faculty()
);

CREATE POLICY "Allow users to insert their own od requests" 
ON od_requests FOR INSERT 
WITH CHECK (
  auth.jwt() ->> 'email' = student_email
);

CREATE POLICY "Allow faculty to update any od request" 
ON od_requests FOR UPDATE 
USING (is_faculty())
WITH CHECK (is_faculty());

CREATE POLICY "Allow faculty to delete any od request" 
ON od_requests FOR DELETE 
USING (is_faculty());

-- ====================================================
-- SEED INITIAL DATA
-- ====================================================

-- Seed Announcements
INSERT INTO announcements (id, title, content, type, date, poster_url) 
VALUES 
('ann-1', 'EEE End Semester Examinations Schedule', 'The end-semester examinations for all UG and PG students will commence on August 15th, 2026. The detailed timetable is uploaded in the Academic Calendar section.', 'exam', '2026-08-15', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO announcements (id, title, content, type, date, poster_url) 
VALUES 
('ann-2', 'Electrify 2026: National Hackathon', 'Register for the National Level EEE Hackathon "Electrify 2026" scheduled for Sept 5, 2026. Themes: Renewable Energy, Electric Vehicles, and IoT in Smart Grids. Cash prizes up to $5,000!', 'hackathon', '2026-09-05', 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"><rect width="100%" height="100%" fill="url(%23grad)"/><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%230f172a;stop-opacity:1" /><stop offset="100%" style="stop-color:%231e3a8a;stop-opacity:1" /></linearGradient></defs><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" fill="%23f59e0b" font-family="sans-serif" font-weight="bold" font-size="28">ELECTRIFY 2026</text><text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" fill="%23ffffff" font-family="sans-serif" font-size="14">EEE National Level Hackathon | Sept 5th</text><circle cx="50" cy="50" r="10" fill="%2338bdf8" opacity="0.3"/><circle cx="340" cy="150" r="25" fill="%23f43f5e" opacity="0.2"/><path d="M 200,85 L 210,105 L 195,105 L 205,125" stroke="%23f59e0b" stroke-width="4" fill="none"/></svg>')
ON CONFLICT (id) DO NOTHING;

INSERT INTO announcements (id, title, content, type, date, poster_url) 
VALUES 
('ann-3', 'NPTEL Registration Deadline Extension', 'The deadline for registering and paying for NPTEL exams (July-Dec 2026 semester) has been extended to July 20th. Please submit your registrations in the portal.', 'event', '2026-07-20', NULL)
ON CONFLICT (id) DO NOTHING;

-- Seed Student Profiles
INSERT INTO student_profiles (id, roll_no, name, email, cgpa_json, arrears_count, nptel_exams) 
VALUES 
('student@eee.com', 'EEE001', 'Nithin Annamalai', 'student@eee.com', '{"1": 8.5, "2": 8.3, "3": 8.6, "4": 8.7, "5": 8.4}', 0, '["Embedded Systems", "Power Electronics"]'),
('student2@eee.com', 'EEE002', 'Aravind Swamy', 'student2@eee.com', '{"1": 7.8, "2": 7.5, "3": 7.9, "4": 7.6, "5": 7.8}', 1, '["Microprocessors & Microcontrollers"]')
ON CONFLICT (id) DO NOTHING;

-- Seed Courses
INSERT INTO courses (code, name, credits, semester) 
VALUES 
('EE8601', 'Power System Operation and Control', 3, 6),
('EE8602', 'Transmission and Distribution', 4, 6),
('EE8603', 'Power Electronics', 3, 6),
('EE8691', 'Embedded Systems', 3, 6),
('EE8611', 'Power Electronics and Drives Laboratory', 2, 6),
('EE8612', 'Renewable Energy Systems Laboratory', 2, 6)
ON CONFLICT (code) DO NOTHING;
