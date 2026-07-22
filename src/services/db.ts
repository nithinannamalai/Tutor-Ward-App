import { supabase } from './supabaseClient';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'exam' | 'hackathon' | 'event' | 'general';
  date: string;
  posterUrl?: string; // base64 or external url
}

export interface StudentDoc {
  id: string;
  name: string;
  size: string;
  type: string;
  dataUrl: string; // Base64 data
  uploadedAt: string;
}

export interface Student {
  id: string; // email as key or generated
  rollNo: string;
  name: string;
  email: string;
  cgpa: Record<number, number>; // e.g. {1: 8.5, 2: 8.3, 3: 8.6, 4: 8.7, 5: 8.4, 6: 8.5}
  arrears: number;
  nptelExams: string[];
  documents: StudentDoc[];
}

export interface AttendanceLog {
  id: string;
  date: string; // YYYY-MM-DD
  period: number; // 1-7
  studentRollNo: string;
  studentName: string;
  status: 'present' | 'absent';
  markedBy: string;
}

export interface Course {
  code: string;
  name: string;
  credits: number;
  semester: number;
}

// ----------------------------------------------------
// DEFAULT SEED DATA FOR MOCK FALLBACK
// ----------------------------------------------------
const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'EEE End Semester Examinations Schedule',
    content: 'The end-semester examinations for all UG and PG students will commence on August 15th, 2026. The detailed timetable is uploaded in the Academic Calendar section.',
    type: 'exam',
    date: '2026-08-15',
    posterUrl: ''
  },
  {
    id: 'ann-2',
    title: 'Electrify 2026: National Hackathon',
    content: 'Register for the National Level EEE Hackathon "Electrify 2026" scheduled for Sept 5, 2026. Themes: Renewable Energy, Electric Vehicles, and IoT in Smart Grids. Cash prizes up to $5,000!',
    type: 'hackathon',
    date: '2026-09-05',
    posterUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"><rect width="100%" height="100%" fill="url(%23grad)"/><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%230f172a;stop-opacity:1" /><stop offset="100%" style="stop-color:%231e3a8a;stop-opacity:1" /></linearGradient></defs><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" fill="%23f59e0b" font-family="sans-serif" font-weight="bold" font-size="28">ELECTRIFY 2026</text><text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" fill="%23ffffff" font-family="sans-serif" font-size="14">EEE National Level Hackathon | Sept 5th</text><circle cx="50" cy="50" r="10" fill="%2338bdf8" opacity="0.3"/><circle cx="340" cy="150" r="25" fill="%23f43f5e" opacity="0.2"/><path d="M 200,85 L 210,105 L 195,105 L 205,125" stroke="%23f59e0b" stroke-width="4" fill="none"/></svg>'
  },
  {
    id: 'ann-3',
    title: 'NPTEL Registration Deadline Extension',
    content: 'The deadline for registering and paying for NPTEL exams (July-Dec 2026 semester) has been extended to July 20th. Please submit your registrations in the portal.',
    type: 'event',
    date: '2026-07-20',
    posterUrl: ''
  }
];

const DEFAULT_STUDENTS: Student[] = [
  {
    id: 'student@eee.com',
    rollNo: 'EEE001',
    name: 'Nithin Annamalai',
    email: 'student@eee.com',
    cgpa: { 1: 8.5, 2: 8.3, 3: 8.6, 4: 8.7, 5: 8.4 },
    arrears: 0,
    nptelExams: ['Embedded Systems', 'Power Electronics'],
    documents: [
      {
        id: 'doc-1',
        name: 'Resume_Nithin.pdf',
        size: '120 KB',
        type: 'application/pdf',
        dataUrl: 'data:application/pdf;base64,JVBERi0xLjQKJdPr6gogMSAwIG9iagogIDw8IC9UeXBlIC9DYXRhbG9nIC9QYWdlcyAyIDAgUiA+PiBlbmRvYmo...',
        uploadedAt: '2026-07-10 14:30'
      }
    ]
  },
  {
    id: 'student2@eee.com',
    rollNo: 'EEE002',
    name: 'Aravind Swamy',
    email: 'student2@eee.com',
    cgpa: { 1: 7.8, 2: 7.5, 3: 7.9, 4: 7.6, 5: 7.8 },
    arrears: 1,
    nptelExams: ['Microprocessors & Microcontrollers'],
    documents: []
  }
];

const DEFAULT_COURSES: Course[] = [
  { code: 'EE8601', name: 'Power System Operation and Control', credits: 3, semester: 6 },
  { code: 'EE8602', name: 'Transmission and Distribution', credits: 4, semester: 6 },
  { code: 'EE8603', name: 'Power Electronics', credits: 3, semester: 6 },
  { code: 'EE8691', name: 'Embedded Systems', credits: 3, semester: 6 },
  { code: 'EE8611', name: 'Power Electronics and Drives Laboratory', credits: 2, semester: 6 },
  { code: 'EE8612', name: 'Renewable Energy Systems Laboratory', credits: 2, semester: 6 }
];

// Initialize local storage fallback
const initLocalDB = () => {
  if (!localStorage.getItem('eee_announcements')) {
    localStorage.setItem('eee_announcements', JSON.stringify(DEFAULT_ANNOUNCEMENTS));
  }
  if (!localStorage.getItem('eee_students')) {
    localStorage.setItem('eee_students', JSON.stringify(DEFAULT_STUDENTS));
  }
  if (!localStorage.getItem('eee_attendance')) {
    localStorage.setItem('eee_attendance', JSON.stringify([]));
  }
  if (!localStorage.getItem('eee_courses')) {
    localStorage.setItem('eee_courses', JSON.stringify(DEFAULT_COURSES));
  }
};
initLocalDB();

// ----------------------------------------------------
// DATABASE SERVICE METHODS (SUPABASE + LOCALSTORAGE)
// ----------------------------------------------------

export const dbService = {
  // --- Announcements ---
  async getAnnouncements(): Promise<Announcement[]> {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err: any) {
      console.warn('Supabase getAnnouncements failed, using localStorage:', err.message || err);
      const localData = localStorage.getItem('eee_announcements');
      return localData ? JSON.parse(localData) : [];
    }
  },

  async saveAnnouncement(announcement: Omit<Announcement, 'id'> & { id?: string }): Promise<Announcement> {
    const newId = announcement.id || `ann-${Date.now()}`;
    const fullAnn: Announcement = { ...announcement, id: newId };

    try {
      const { data, error } = await supabase
        .from('announcements')
        .upsert(fullAnn)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      console.warn('Supabase saveAnnouncement failed, using localStorage:', err.message || err);
      const localData = localStorage.getItem('eee_announcements');
      const list: Announcement[] = localData ? JSON.parse(localData) : [];
      
      const index = list.findIndex(a => a.id === fullAnn.id);
      if (index > -1) {
        list[index] = fullAnn;
      } else {
        list.push(fullAnn);
      }
      localStorage.setItem('eee_announcements', JSON.stringify(list));
      return fullAnn;
    }
  },

  async deleteAnnouncement(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (err: any) {
      console.warn('Supabase deleteAnnouncement failed, using localStorage:', err.message || err);
      const localData = localStorage.getItem('eee_announcements');
      const list: Announcement[] = localData ? JSON.parse(localData) : [];
      const filtered = list.filter(a => a.id !== id);
      localStorage.setItem('eee_announcements', JSON.stringify(filtered));
      return true;
    }
  },

  // --- Student Profiles ---
  async getStudentProfile(email: string): Promise<Student | null> {
    try {
      const { data, error } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        // Parse json fields
        return {
          id: data.id,
          rollNo: data.roll_no,
          name: data.name,
          email: data.email,
          cgpa: typeof data.cgpa_json === 'string' ? JSON.parse(data.cgpa_json) : data.cgpa_json,
          arrears: data.arrears_count,
          nptelExams: typeof data.nptel_exams === 'string' ? JSON.parse(data.nptel_exams) : data.nptel_exams || [],
          documents: [] // we fetch documents separately below or join
        };
      }
      throw new Error('Not found');
    } catch (err: any) {
      console.warn(`Supabase getStudentProfile for ${email} failed, using localStorage:`, err.message || err);
      const localData = localStorage.getItem('eee_students');
      const list: Student[] = localData ? JSON.parse(localData) : [];
      return list.find(s => s.email.toLowerCase() === email.toLowerCase()) || null;
    }
  },

  async updateStudentProfile(email: string, updates: Partial<Omit<Student, 'email' | 'documents'>>): Promise<Student> {
    try {
      // Map properties to snake_case for supabase
      const mappedUpdates: any = {};
      if (updates.rollNo !== undefined) mappedUpdates.roll_no = updates.rollNo;
      if (updates.name !== undefined) mappedUpdates.name = updates.name;
      if (updates.cgpa !== undefined) mappedUpdates.cgpa_json = updates.cgpa;
      if (updates.arrears !== undefined) mappedUpdates.arrears_count = updates.arrears;
      if (updates.nptelExams !== undefined) mappedUpdates.nptel_exams = updates.nptelExams;

      const { error } = await supabase
        .from('student_profiles')
        .update(mappedUpdates)
        .eq('email', email);

      if (error) throw error;

      // Fetch documents for return
      const profile = await this.getStudentProfile(email);
      return profile!;
    } catch (err: any) {
      console.warn(`Supabase updateStudentProfile failed for ${email}, using localStorage:`, err.message || err);
      const localData = localStorage.getItem('eee_students');
      const list: Student[] = localData ? JSON.parse(localData) : [];
      const index = list.findIndex(s => s.email.toLowerCase() === email.toLowerCase());
      if (index > -1) {
        list[index] = { ...list[index], ...updates };
        localStorage.setItem('eee_students', JSON.stringify(list));
        return list[index];
      }
      throw new Error('Student profile not found');
    }
  },

  async createStudentProfile(student: Omit<Student, 'documents'>): Promise<Student> {
    try {
      const { error } = await supabase
        .from('student_profiles')
        .insert({
          id: student.email,
          roll_no: student.rollNo,
          name: student.name,
          email: student.email,
          cgpa_json: student.cgpa,
          arrears_count: student.arrears,
          nptel_exams: student.nptelExams
        });

      if (error) throw error;
      return { ...student, documents: [] };
    } catch (err: any) {
      console.warn('Supabase createStudentProfile failed, using localStorage:', err.message || err);
      const localData = localStorage.getItem('eee_students');
      const list: Student[] = localData ? JSON.parse(localData) : [];
      const newStudent: Student = { ...student, id: student.email, documents: [] };
      list.push(newStudent);
      localStorage.setItem('eee_students', JSON.stringify(list));
      return newStudent;
    }
  },

  // --- Student Documents ---
  async getStudentDocuments(studentEmail: string): Promise<StudentDoc[]> {
    try {
      const { data, error } = await supabase
        .from('student_documents')
        .select('*')
        .eq('student_email', studentEmail);

      if (error) throw error;
      return (data || []).map(d => ({
        id: d.id,
        name: d.name,
        size: d.size,
        type: d.type,
        dataUrl: d.data_url,
        uploadedAt: d.uploaded_at
      }));
    } catch (err: any) {
      console.warn(`Supabase getStudentDocuments failed for ${studentEmail}, using localStorage:`, err.message || err);
      const student = await this.getStudentProfile(studentEmail);
      return student ? student.documents || [] : [];
    }
  },

  async uploadDocument(studentEmail: string, doc: Omit<StudentDoc, 'id' | 'uploadedAt'>): Promise<StudentDoc> {
    const newDoc: StudentDoc = {
      ...doc,
      id: `doc-${Date.now()}`,
      uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    try {
      const { error } = await supabase
        .from('student_documents')
        .insert({
          id: newDoc.id,
          student_email: studentEmail,
          name: newDoc.name,
          size: newDoc.size,
          type: newDoc.type,
          data_url: newDoc.dataUrl,
          uploaded_at: newDoc.uploadedAt
        });

      if (error) throw error;
      return newDoc;
    } catch (err: any) {
      console.warn(`Supabase uploadDocument failed for ${studentEmail}, using localStorage:`, err.message || err);
      const localData = localStorage.getItem('eee_students');
      const list: Student[] = localData ? JSON.parse(localData) : [];
      const index = list.findIndex(s => s.email.toLowerCase() === studentEmail.toLowerCase());
      if (index > -1) {
        if (!list[index].documents) list[index].documents = [];
        list[index].documents.push(newDoc);
        localStorage.setItem('eee_students', JSON.stringify(list));
      }
      return newDoc;
    }
  },

  async deleteDocument(studentEmail: string, docId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('student_documents')
        .delete()
        .eq('id', docId)
        .eq('student_email', studentEmail);

      if (error) throw error;
      return true;
    } catch (err: any) {
      console.warn(`Supabase deleteDocument failed, using localStorage:`, err.message || err);
      const localData = localStorage.getItem('eee_students');
      const list: Student[] = localData ? JSON.parse(localData) : [];
      const index = list.findIndex(s => s.email.toLowerCase() === studentEmail.toLowerCase());
      if (index > -1 && list[index].documents) {
        list[index].documents = list[index].documents.filter(d => d.id !== docId);
        localStorage.setItem('eee_students', JSON.stringify(list));
        return true;
      }
      return false;
    }
  },

  // --- Attendance ---
  async getAttendanceForStudent(rollNo: string): Promise<AttendanceLog[]> {
    try {
      const { data, error } = await supabase
        .from('attendance_logs')
        .select('*')
        .eq('student_roll_no', rollNo);

      if (error) throw error;
      return (data || []).map(d => ({
        id: d.id,
        date: d.date,
        period: d.period,
        studentRollNo: d.student_roll_no,
        studentName: d.student_name,
        status: d.status,
        markedBy: d.marked_by
      }));
    } catch (err: any) {
      console.warn(`Supabase getAttendanceForStudent failed, using localStorage:`, err.message || err);
      const localData = localStorage.getItem('eee_attendance');
      const list: AttendanceLog[] = localData ? JSON.parse(localData) : [];
      return list.filter(log => log.studentRollNo === rollNo);
    }
  },

  async saveAttendanceLogs(date: string, period: number, logs: Omit<AttendanceLog, 'id'>[]): Promise<boolean> {
    const logsWithIds = logs.map(l => ({
      id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      ...l
    }));

    try {
      // Map to supabase format
      const mappedLogs = logsWithIds.map(l => ({
        id: l.id,
        date: l.date,
        period: l.period,
        student_roll_no: l.studentRollNo,
        student_name: l.studentName,
        status: l.status,
        marked_by: l.markedBy
      }));

      const { error } = await supabase
        .from('attendance_logs')
        .insert(mappedLogs);

      if (error) throw error;
      return true;
    } catch (err: any) {
      console.warn('Supabase saveAttendanceLogs failed, using localStorage:', err.message || err);
      const localData = localStorage.getItem('eee_attendance');
      const list: AttendanceLog[] = localData ? JSON.parse(localData) : [];
      
      // Filter out duplicates for the same date and period, then append new logs
      const filtered = list.filter(l => !(l.date === date && l.period === period));
      filtered.push(...logsWithIds);
      
      localStorage.setItem('eee_attendance', JSON.stringify(filtered));
      return true;
    }
  },

  // --- All Students (for Admin View) ---
  async fetchAllStudents(): Promise<Student[]> {
    try {
      const { data, error } = await supabase
        .from('student_profiles')
        .select('*');

      if (error) throw error;
      if (data && data.length > 0) {
        return data.map(d => ({
          id: d.id,
          rollNo: d.roll_no,
          name: d.name,
          email: d.email,
          cgpa: typeof d.cgpa_json === 'string' ? JSON.parse(d.cgpa_json) : d.cgpa_json || {},
          arrears: d.arrears_count || 0,
          nptelExams: typeof d.nptel_exams === 'string' ? JSON.parse(d.nptel_exams) : d.nptel_exams || [],
          documents: [] // loaded reactively in profile docs UI
        }));
      }
      throw new Error('No student data in Supabase');
    } catch (err: any) {
      console.warn('Supabase fetchAllStudents failed, using localStorage:', err.message || err);
      const localData = localStorage.getItem('eee_students');
      return localData ? JSON.parse(localData) : [];
    }
  },

  // --- Courses ---
  async getCourses(): Promise<Course[]> {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*');

      if (error) throw error;
      return data || [];
    } catch (err: any) {
      console.warn('Supabase getCourses failed, using localStorage:', err.message || err);
      const localData = localStorage.getItem('eee_courses');
      return localData ? JSON.parse(localData) : [];
    }
  },

  async saveCourse(course: Course): Promise<Course> {
    try {
      const { error } = await supabase
        .from('courses')
        .upsert(course);
      if (error) throw error;
      return course;
    } catch (err: any) {
      console.warn('Supabase saveCourse failed, using localStorage:', err.message || err);
      const localData = localStorage.getItem('eee_courses');
      const list: Course[] = localData ? JSON.parse(localData) : [];
      const idx = list.findIndex(c => c.code === course.code);
      if (idx > -1) { list[idx] = course; } else { list.push(course); }
      localStorage.setItem('eee_courses', JSON.stringify(list));
      return course;
    }
  },

  async deleteCourse(code: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('code', code);
      if (error) throw error;
      return true;
    } catch (err: any) {
      console.warn('Supabase deleteCourse failed, using localStorage:', err.message || err);
      const localData = localStorage.getItem('eee_courses');
      const list: Course[] = localData ? JSON.parse(localData) : [];
      localStorage.setItem('eee_courses', JSON.stringify(list.filter(c => c.code !== code)));
      return true;
    }
  }
};
