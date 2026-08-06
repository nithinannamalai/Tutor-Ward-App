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

export interface SemesterGrades {
  internal1?: number;
  internal2?: number;
  semMarks?: number;
  gpa?: number;
}

export interface Student {
  id: string; // email as key or generated
  rollNo: string;
  name: string;
  email: string;
  cgpa: Record<number, SemesterGrades>; // updated to SemesterGrades
  arrears: number;
  nptelExams: string[];
  documents: StudentDoc[];
}

export interface Milestone {
  id?: number;
  date: string;
  event: string;
  type: 'academic' | 'exam' | 'holiday';
}

export interface Lab {
  id?: number;
  name: string;
  block: string;
  icon: string;
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
  teacherName?: string;
}

export interface Faculty {
  id?: number;
  name: string;
  role: string;
  email: string;
  phone: string;
}

export interface Rule {
  id?: number;
  icon: string;
  title: string;
  desc: string;
}

export interface TimetableEntry {
  id?: number;
  day: string;    // 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
  period: number; // 1–7
  subject: string;
  teacher?: string;
  semester: number;
}

export interface LetterRequest {
  id: string;
  studentEmail: string;
  studentName: string;
  rollNo: string;
  letterType: 'Bonafide' | 'NOC' | 'Internship Request' | 'Course Completion';
  purpose: string;
  details: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedAt: string;
  pdfUrl?: string; // base64 signed PDF uploaded by admin
  adminRemarks?: string;
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
    cgpa: {
      1: { internal1: 85, internal2: 88, semMarks: 86, gpa: 8.5 },
      2: { internal1: 82, internal2: 84, semMarks: 83, gpa: 8.3 },
      3: { internal1: 86, internal2: 87, semMarks: 86, gpa: 8.6 },
      4: { internal1: 88, internal2: 90, semMarks: 87, gpa: 8.7 },
      5: { internal1: 84, internal2: 85, semMarks: 84, gpa: 8.4 }
    },
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
    cgpa: {
      1: { internal1: 78, internal2: 80, semMarks: 78, gpa: 7.8 },
      2: { internal1: 75, internal2: 76, semMarks: 75, gpa: 7.5 },
      3: { internal1: 79, internal2: 80, semMarks: 79, gpa: 7.9 },
      4: { internal1: 76, internal2: 78, semMarks: 76, gpa: 7.6 },
      5: { internal1: 78, internal2: 79, semMarks: 78, gpa: 7.8 }
    },
    arrears: 1,
    nptelExams: ['Microprocessors & Microcontrollers'],
    documents: []
  }
];

const DEFAULT_COURSES: Course[] = [
  { code: 'EE8601', name: 'Power System Operation and Control', credits: 3, semester: 6, teacherName: 'Dr. S. Kavitha' },
  { code: 'EE8602', name: 'Transmission and Distribution', credits: 4, semester: 6, teacherName: 'Dr. R. Ramanujam' },
  { code: 'EE8603', name: 'Digital Logic Circuits', credits: 3, semester: 6, teacherName: 'Ms. R. Priyanka' },
  { code: 'EE8691', name: 'Embedded Systems', credits: 3, semester: 6, teacherName: 'Dr. M. Arulkumar' },
  { code: 'EE8611', name: 'Power Electronics and Drives Laboratory', credits: 2, semester: 6, teacherName: 'Mr. K. Senthilkumar' },
  { code: 'EE8612', name: 'Renewable Energy Systems Laboratory', credits: 2, semester: 6, teacherName: 'Ms. P. Vijayalakshmi' }
];

const DEFAULT_FACULTY: Faculty[] = [
  { id: 1, name: 'Dr. R. Ramanujam', role: 'Head of Department', email: 'hod.eee@srec.ac.in', phone: '+91-98400-00001' },
  { id: 2, name: 'Dr. S. Kavitha', role: 'Professor – Power Systems', email: 's.kavitha@srec.ac.in', phone: '+91-98400-00002' },
  { id: 3, name: 'Dr. M. Arulkumar', role: 'Professor – Machines & Drives', email: 'm.arulkumar@srec.ac.in', phone: '+91-98400-00003' },
  { id: 4, name: 'Ms. P. Vijayalakshmi', role: 'Asst. Professor – Control', email: 'p.vijaya@srec.ac.in', phone: '+91-98400-00004' },
  { id: 5, name: 'Mr. K. Senthilkumar', role: 'Asst. Professor – Power Elec.', email: 'k.senthil@srec.ac.in', phone: '+91-98400-00005' },
  { id: 6, name: 'Ms. R. Priyanka', role: 'Asst. Professor – Microprocessors', email: 'r.priyanka@srec.ac.in', phone: '+91-98400-00006' },
];

const DEFAULT_RULES: Rule[] = [
  { id: 1, icon: '👔', title: 'Dress Code', desc: 'Formal attire on working days. Lab coat mandatory during lab sessions.' },
  { id: 2, icon: '📊', title: 'Attendance', desc: 'Minimum 75% attendance per subject required to sit for semester exams.' },
  { id: 3, icon: '🥾', title: 'Lab Safety', desc: 'Safety shoes and lab coat compulsory. Mobile usage prohibited during lab.' },
  { id: 4, icon: '🤫', title: 'Discipline', desc: 'Maintain quiet in classrooms & library. Zero tolerance for ragging.' },
  { id: 5, icon: '📱', title: 'Mobile Policy', desc: 'Keep phones in silent mode inside all academic blocks.' },
  { id: 6, icon: '🏆', title: 'Integrity', desc: 'Strict anti-malpractice rules apply to all internal & end-semester exams.' },
];

const DEFAULT_TIMETABLE: TimetableEntry[] = [
  // Monday  (2+2 | lunch | 2+2, with tea break after P2 and P6)
  { id:1,  day:'Mon', period:1, subject:'Power System Operation and Control', teacher:'Dr. S. Kavitha',      semester:6 },
  { id:2,  day:'Mon', period:2, subject:'Transmission and Distribution',      teacher:'Dr. R. Ramanujam',   semester:6 },
  { id:3,  day:'Mon', period:3, subject:'Embedded Systems',                    teacher:'Dr. M. Arulkumar',   semester:6 },
  { id:4,  day:'Mon', period:4, subject:'Digital Logic Circuits',               teacher:'Ms. R. Priyanka',    semester:6 },
  { id:5,  day:'Mon', period:5, subject:'Power Electronics Lab',                teacher:'Mr. K. Senthilkumar',semester:6 },
  { id:6,  day:'Mon', period:6, subject:'Power Electronics Lab',                teacher:'Mr. K. Senthilkumar',semester:6 },
  { id:7,  day:'Mon', period:7, subject:'Renewable Energy Lab',                 teacher:'Ms. P. Vijayalakshmi',semester:6 },
  { id:8,  day:'Mon', period:8, subject:'Advisory Hour',                        teacher:'',                    semester:6 },
  // Tuesday
  { id:9,  day:'Tue', period:1, subject:'Transmission and Distribution',        teacher:'Dr. R. Ramanujam',   semester:6 },
  { id:10, day:'Tue', period:2, subject:'Digital Logic Circuits',               teacher:'Ms. R. Priyanka',    semester:6 },
  { id:11, day:'Tue', period:3, subject:'Power System Operation and Control',   teacher:'Dr. S. Kavitha',      semester:6 },
  { id:12, day:'Tue', period:4, subject:'Embedded Systems',                     teacher:'Dr. M. Arulkumar',   semester:6 },
  { id:13, day:'Tue', period:5, subject:'Renewable Energy Lab',                 teacher:'Ms. P. Vijayalakshmi',semester:6 },
  { id:14, day:'Tue', period:6, subject:'Renewable Energy Lab',                 teacher:'Ms. P. Vijayalakshmi',semester:6 },
  { id:15, day:'Tue', period:7, subject:'Power Electronics Lab',                teacher:'Mr. K. Senthilkumar',semester:6 },
  { id:16, day:'Tue', period:8, subject:'Library / Free Hour',                  teacher:'',                    semester:6 },
  // Wednesday
  { id:17, day:'Wed', period:1, subject:'Embedded Systems',                     teacher:'Dr. M. Arulkumar',   semester:6 },
  { id:18, day:'Wed', period:2, subject:'Digital Logic Circuits',               teacher:'Ms. R. Priyanka',    semester:6 },
  { id:19, day:'Wed', period:3, subject:'Transmission and Distribution',        teacher:'Dr. R. Ramanujam',   semester:6 },
  { id:20, day:'Wed', period:4, subject:'Power System Operation and Control',   teacher:'Dr. S. Kavitha',      semester:6 },
  { id:21, day:'Wed', period:5, subject:'Power System Operation and Control',   teacher:'Dr. S. Kavitha',      semester:6 },
  { id:22, day:'Wed', period:6, subject:'Embedded Systems',                     teacher:'Dr. M. Arulkumar',   semester:6 },
  { id:23, day:'Wed', period:7, subject:'Digital Logic Circuits',               teacher:'Ms. R. Priyanka',    semester:6 },
  { id:24, day:'Wed', period:8, subject:'Tutorial',                             teacher:'',                    semester:6 },
  // Thursday
  { id:25, day:'Thu', period:1, subject:'Digital Logic Circuits',               teacher:'Ms. R. Priyanka',    semester:6 },
  { id:26, day:'Thu', period:2, subject:'Power System Operation and Control',   teacher:'Dr. S. Kavitha',      semester:6 },
  { id:27, day:'Thu', period:3, subject:'Transmission and Distribution',        teacher:'Dr. R. Ramanujam',   semester:6 },
  { id:28, day:'Thu', period:4, subject:'Embedded Systems',                     teacher:'Dr. M. Arulkumar',   semester:6 },
  { id:29, day:'Thu', period:5, subject:'Transmission and Distribution',        teacher:'Dr. R. Ramanujam',   semester:6 },
  { id:30, day:'Thu', period:6, subject:'Sports / NCC / NSS',                   teacher:'',                    semester:6 },
  { id:31, day:'Thu', period:7, subject:'Sports / NCC / NSS',                   teacher:'',                    semester:6 },
  { id:32, day:'Thu', period:8, subject:'Tutorial',                             teacher:'',                    semester:6 },
  // Friday
  { id:33, day:'Fri', period:1, subject:'Transmission and Distribution',        teacher:'Dr. R. Ramanujam',   semester:6 },
  { id:34, day:'Fri', period:2, subject:'Embedded Systems',                     teacher:'Dr. M. Arulkumar',   semester:6 },
  { id:35, day:'Fri', period:3, subject:'Digital Logic Circuits',               teacher:'Ms. R. Priyanka',    semester:6 },
  { id:36, day:'Fri', period:4, subject:'Power System Operation and Control',   teacher:'Dr. S. Kavitha',      semester:6 },
  { id:37, day:'Fri', period:5, subject:'Power System Operation and Control',   teacher:'Dr. S. Kavitha',      semester:6 },
  { id:38, day:'Fri', period:6, subject:'Seminar / Guest Lecture',              teacher:'',                    semester:6 },
  { id:39, day:'Fri', period:7, subject:'Seminar / Guest Lecture',              teacher:'',                    semester:6 },
  { id:40, day:'Fri', period:8, subject:'Sports / NSS',                         teacher:'',                    semester:6 },
  // Saturday
  { id:41, day:'Sat', period:1, subject:'Digital Logic Circuits',               teacher:'Ms. R. Priyanka',    semester:6 },
  { id:42, day:'Sat', period:2, subject:'Transmission and Distribution',        teacher:'Dr. R. Ramanujam',   semester:6 },
  { id:43, day:'Sat', period:3, subject:'Embedded Systems',                     teacher:'Dr. M. Arulkumar',   semester:6 },
  { id:44, day:'Sat', period:4, subject:'Power System Operation and Control',   teacher:'Dr. S. Kavitha',      semester:6 },
  { id:45, day:'Sat', period:5, subject:'Power System Operation and Control',   teacher:'Dr. S. Kavitha',      semester:6 },
  { id:46, day:'Sat', period:6, subject:'Power Electronics Lab',                teacher:'Mr. K. Senthilkumar',semester:6 },
  { id:47, day:'Sat', period:7, subject:'Power Electronics Lab',                teacher:'Mr. K. Senthilkumar',semester:6 },
  { id:48, day:'Sat', period:8, subject:'Library / Free Hour',                  teacher:'',                    semester:6 },
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
  const localCourses = localStorage.getItem('eee_courses');
  if (!localCourses) {
    localStorage.setItem('eee_courses', JSON.stringify(DEFAULT_COURSES));
  } else {
    try {
      const parsed = JSON.parse(localCourses);
      const needsMigration = parsed.some((c: any) => !c.teacherName);
      if (needsMigration) {
        const updated = parsed.map((c: any) => {
          const defaultCourse = DEFAULT_COURSES.find(dc => dc.code === c.code);
          return { ...c, teacherName: c.teacherName || defaultCourse?.teacherName || '' };
        });
        localStorage.setItem('eee_courses', JSON.stringify(updated));
      }
    } catch (e) {
      localStorage.setItem('eee_courses', JSON.stringify(DEFAULT_COURSES));
    }
  }
  // Migrate timetable: if stored data still uses 7-period (with LUNCH), reset it to 8-period
  const ttKey = 'eee_timetable_6';
  const localTT = localStorage.getItem(ttKey);
  if (localTT) {
    try {
      const parsed: TimetableEntry[] = JSON.parse(localTT);
      const hasLunch = parsed.some(e => e.subject === 'LUNCH');
      const maxPeriod = Math.max(...parsed.map(e => e.period));
      if (hasLunch || maxPeriod < 8) {
        localStorage.removeItem(ttKey);
      }
    } catch (e) {
      localStorage.removeItem(ttKey);
    }
  }
};
initLocalDB();

export const normalizeCgpa = (cgpaJson: any): Record<number, SemesterGrades> => {
  if (!cgpaJson || typeof cgpaJson !== 'object') return {};
  const normalized: Record<number, SemesterGrades> = {};
  Object.keys(cgpaJson).forEach(key => {
    const sem = parseInt(key);
    if (!isNaN(sem)) {
      const val = cgpaJson[key];
      if (typeof val === 'number') {
        normalized[sem] = { gpa: val };
      } else if (val && typeof val === 'object') {
        normalized[sem] = {
          internal1: typeof val.internal1 === 'number' ? val.internal1 : undefined,
          internal2: typeof val.internal2 === 'number' ? val.internal2 : undefined,
          semMarks: typeof val.semMarks === 'number' ? val.semMarks : undefined,
          gpa: typeof val.gpa === 'number' ? val.gpa : undefined
        };
      }
    }
  });
  return normalized;
};

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
          cgpa: normalizeCgpa(typeof data.cgpa_json === 'string' ? JSON.parse(data.cgpa_json) : data.cgpa_json),
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
          cgpa: normalizeCgpa(typeof d.cgpa_json === 'string' ? JSON.parse(d.cgpa_json) : d.cgpa_json),
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
      return (data || []).map((d: any) => ({
        code: d.code,
        name: d.name,
        credits: d.credits,
        semester: d.semester,
        teacherName: d.teacher_name || ''
      }));
    } catch (err: any) {
      console.warn('Supabase getCourses failed, using localStorage:', err.message || err);
      const localData = localStorage.getItem('eee_courses');
      return localData ? JSON.parse(localData) : DEFAULT_COURSES;
    }
  },

  async saveCourse(course: Course): Promise<Course> {
    try {
      const payload: any = {
        code: course.code,
        name: course.name,
        credits: course.credits,
        semester: course.semester,
        teacher_name: course.teacherName || ''
      };
      const { error } = await supabase.from('courses').upsert(payload);
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
  },

  // --- Attendance Fetch by Date & Period ---
  async getAttendanceForDateAndPeriod(date: string, period: number): Promise<AttendanceLog[]> {
    try {
      const { data, error } = await supabase
        .from('attendance_logs')
        .select('*')
        .eq('date', date)
        .eq('period', period);

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
      console.warn(`Supabase getAttendanceForDateAndPeriod failed, using localStorage:`, err.message || err);
      const localData = localStorage.getItem('eee_attendance');
      const list: AttendanceLog[] = localData ? JSON.parse(localData) : [];
      return list.filter(log => log.date === date && log.period === period);
    }
  },

  // --- Milestones ---
  async getMilestones(): Promise<Milestone[]> {
    try {
      const { data, error } = await supabase
        .from('milestones')
        .select('*')
        .order('id', { ascending: true });
      if (error) throw error;
      return data || [];
    } catch (err: any) {
      console.warn('Supabase getMilestones failed, using localStorage:', err.message || err);
      const localData = localStorage.getItem('eee_milestones');
      return localData ? JSON.parse(localData) : [];
    }
  },

  async saveMilestone(milestone: Milestone): Promise<Milestone> {
    try {
      // If saving new item, id is serial so let Supabase generate it (omit if null/undefined)
      const payload = { ...milestone };
      if (!payload.id) delete payload.id;

      const { data, error } = await supabase
        .from('milestones')
        .upsert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err: any) {
      console.warn('Supabase saveMilestone failed, using localStorage:', err.message || err);
      const localData = localStorage.getItem('eee_milestones') || '[]';
      const list: Milestone[] = JSON.parse(localData);
      
      if (milestone.id) {
        const idx = list.findIndex(m => m.id === milestone.id);
        if (idx > -1) {
          list[idx] = milestone;
        } else {
          list.push(milestone);
        }
      } else {
        const newM = { ...milestone, id: Date.now() };
        list.push(newM);
        milestone.id = newM.id;
      }
      localStorage.setItem('eee_milestones', JSON.stringify(list));
      return milestone;
    }
  },

  async deleteMilestone(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('milestones')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (err: any) {
      console.warn('Supabase deleteMilestone failed, using localStorage:', err.message || err);
      const localData = localStorage.getItem('eee_milestones');
      const list: Milestone[] = localData ? JSON.parse(localData) : [];
      const filtered = list.filter(m => m.id !== id);
      localStorage.setItem('eee_milestones', JSON.stringify(filtered));
      return true;
    }
  },

  // --- Labs ---
  async getLabs(): Promise<Lab[]> {
    try {
      const { data, error } = await supabase
        .from('labs')
        .select('*')
        .order('id', { ascending: true });
      if (error) throw error;
      return (data || []).map((d: any) => ({ id: d.id, name: d.name, block: d.block, icon: d.icon }));
    } catch (err: any) {
      console.warn('Supabase getLabs failed, using localStorage:', err.message || err);
      const localData = localStorage.getItem('eee_labs');
      return localData ? JSON.parse(localData) : [];
    }
  },

  async saveLab(lab: Lab): Promise<Lab> {
    try {
      const payload: any = { name: lab.name, block: lab.block, icon: lab.icon };
      if (lab.id) payload.id = lab.id;
      const { data, error } = await supabase.from('labs').upsert(payload).select().single();
      if (error) throw error;
      return data;
    } catch (err: any) {
      console.warn('Supabase saveLab failed, using localStorage:', err.message || err);
      const localData = localStorage.getItem('eee_labs') || '[]';
      const list: Lab[] = JSON.parse(localData);
      if (lab.id) {
        const idx = list.findIndex(l => l.id === lab.id);
        if (idx > -1) { list[idx] = lab; } else { list.push(lab); }
      } else {
        const newL = { ...lab, id: Date.now() };
        list.push(newL);
        lab.id = newL.id;
      }
      localStorage.setItem('eee_labs', JSON.stringify(list));
      return lab;
    }
  },

  async deleteLab(id: number): Promise<boolean> {
    try {
      const { error } = await supabase.from('labs').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (err: any) {
      console.warn('Supabase deleteLab failed, using localStorage:', err.message || err);
      const localData = localStorage.getItem('eee_labs');
      const list: Lab[] = localData ? JSON.parse(localData) : [];
      localStorage.setItem('eee_labs', JSON.stringify(list.filter(l => l.id !== id)));
      return true;
    }
  },

  // --- Faculty ---
  async getFaculty(): Promise<Faculty[]> {
    try {
      const { data, error } = await supabase.from('faculty').select('*').order('id', { ascending: true });
      if (error) throw error;
      return (data || []).map((d: any) => ({ id: d.id, name: d.name, role: d.role, email: d.email, phone: d.phone }));
    } catch (err: any) {
      console.warn('Supabase getFaculty failed, using localStorage:', err.message || err);
      const localData = localStorage.getItem('eee_faculty');
      return localData ? JSON.parse(localData) : DEFAULT_FACULTY;
    }
  },

  async saveFaculty(faculty: Faculty): Promise<Faculty> {
    try {
      const payload: any = { name: faculty.name, role: faculty.role, email: faculty.email, phone: faculty.phone };
      if (faculty.id) payload.id = faculty.id;
      const { data, error } = await supabase.from('faculty').upsert(payload).select().single();
      if (error) throw error;
      return data;
    } catch (err: any) {
      console.warn('Supabase saveFaculty failed, using localStorage:', err.message || err);
      const localData = localStorage.getItem('eee_faculty') || JSON.stringify(DEFAULT_FACULTY);
      const list: Faculty[] = JSON.parse(localData);
      if (faculty.id) {
        const idx = list.findIndex(f => f.id === faculty.id);
        if (idx > -1) { list[idx] = faculty; } else { list.push(faculty); }
      } else {
        const newF = { ...faculty, id: Date.now() };
        list.push(newF);
        faculty.id = newF.id;
      }
      localStorage.setItem('eee_faculty', JSON.stringify(list));
      return faculty;
    }
  },

  async deleteFaculty(id: number): Promise<boolean> {
    try {
      const { error } = await supabase.from('faculty').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (err: any) {
      console.warn('Supabase deleteFaculty failed, using localStorage:', err.message || err);
      const localData = localStorage.getItem('eee_faculty');
      const list: Faculty[] = localData ? JSON.parse(localData) : [];
      localStorage.setItem('eee_faculty', JSON.stringify(list.filter(f => f.id !== id)));
      return true;
    }
  },

  // --- Rules ---
  async getRules(): Promise<Rule[]> {
    try {
      const { data, error } = await supabase.from('rules').select('*').order('id', { ascending: true });
      if (error) throw error;
      return (data || []).map((d: any) => ({ id: d.id, icon: d.icon, title: d.title, desc: d.desc }));
    } catch (err: any) {
      console.warn('Supabase getRules failed, using localStorage:', err.message || err);
      const localData = localStorage.getItem('eee_rules');
      return localData ? JSON.parse(localData) : DEFAULT_RULES;
    }
  },

  async saveRule(rule: Rule): Promise<Rule> {
    try {
      const payload: any = { icon: rule.icon, title: rule.title, desc: rule.desc };
      if (rule.id) payload.id = rule.id;
      const { data, error } = await supabase.from('rules').upsert(payload).select().single();
      if (error) throw error;
      return data;
    } catch (err: any) {
      console.warn('Supabase saveRule failed, using localStorage:', err.message || err);
      const localData = localStorage.getItem('eee_rules') || JSON.stringify(DEFAULT_RULES);
      const list: Rule[] = JSON.parse(localData);
      if (rule.id) {
        const idx = list.findIndex(r => r.id === rule.id);
        if (idx > -1) { list[idx] = rule; } else { list.push(rule); }
      } else {
        const newR = { ...rule, id: Date.now() };
        list.push(newR);
        rule.id = newR.id;
      }
      localStorage.setItem('eee_rules', JSON.stringify(list));
      return rule;
    }
  },

  async deleteRule(id: number): Promise<boolean> {
    try {
      const { error } = await supabase.from('rules').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (err: any) {
      console.warn('Supabase deleteRule failed, using localStorage:', err.message || err);
      const localData = localStorage.getItem('eee_rules');
      const list: Rule[] = localData ? JSON.parse(localData) : [];
      localStorage.setItem('eee_rules', JSON.stringify(list.filter(r => r.id !== id)));
      return true;
    }
  },

  // --- Timetable ---
  async getTimetable(semester: number = 6): Promise<TimetableEntry[]> {
    try {
      const { data, error } = await supabase
        .from('timetable_entries')
        .select('*')
        .eq('semester', semester)
        .order('id', { ascending: true });
      if (error) throw error;
      if (data && data.length > 0) {
        return data.map((d: any) => ({ id: d.id, day: d.day, period: d.period, subject: d.subject, teacher: d.teacher || '', semester: d.semester }));
      }
      throw new Error('No timetable in Supabase');
    } catch (err: any) {
      console.warn('Supabase getTimetable failed, using localStorage:', err.message || err);
      const localData = localStorage.getItem(`eee_timetable_${semester}`);
      return localData ? JSON.parse(localData) : DEFAULT_TIMETABLE.filter(e => e.semester === semester);
    }
  },

  async saveTimetableEntry(entry: TimetableEntry): Promise<TimetableEntry> {
    try {
      const payload: any = { day: entry.day, period: entry.period, subject: entry.subject, teacher: entry.teacher || '', semester: entry.semester };
      if (entry.id) payload.id = entry.id;
      const { data, error } = await supabase.from('timetable_entries').upsert(payload).select().single();
      if (error) throw error;
      return data;
    } catch (err: any) {
      console.warn('Supabase saveTimetableEntry failed, using localStorage:', err.message || err);
      const key = `eee_timetable_${entry.semester}`;
      const localData = localStorage.getItem(key) || JSON.stringify(DEFAULT_TIMETABLE.filter(e => e.semester === entry.semester));
      const list: TimetableEntry[] = JSON.parse(localData);
      const idx = list.findIndex(e => e.day === entry.day && e.period === entry.period);
      if (idx > -1) { list[idx] = { ...list[idx], ...entry }; } else { list.push(entry); }
      localStorage.setItem(key, JSON.stringify(list));
      return entry;
    }
  },

  // --- Suggestions ---
  async saveSuggestion(category: string, content: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('suggestions')
        .insert({ category, content });
      if (error) throw error;
      return true;
    } catch (err: any) {
      console.warn('Supabase saveSuggestion failed, using localStorage:', err.message || err);
      const localData = localStorage.getItem('eee_suggestions') || '[]';
      const list = JSON.parse(localData);
      list.push({ category, content, created_at: new Date().toISOString() });
      localStorage.setItem('eee_suggestions', JSON.stringify(list));
      return true;
    }
  },

  // --- Letter Requests ---
  async getLetterRequests(studentEmail?: string): Promise<LetterRequest[]> {
    try {
      const { data, error } = await supabase
        .from('letter_requests')
        .select('*');
      if (error) throw error;
      const list = (data || []).map(d => ({
        id: d.id,
        studentEmail: d.student_email,
        studentName: d.student_name,
        rollNo: d.roll_no,
        letterType: d.letter_type,
        purpose: d.purpose,
        details: d.details,
        status: d.status,
        requestedAt: d.requested_at,
        pdfUrl: d.pdf_url,
        adminRemarks: d.admin_remarks
      }));
      if (studentEmail) {
        return list.filter(r => r.studentEmail.toLowerCase() === studentEmail.toLowerCase());
      }
      return list;
    } catch (err: any) {
      console.warn('Supabase getLetterRequests failed, using localStorage:', err.message || err);
      const localData = localStorage.getItem('eee_letter_requests');
      const list: LetterRequest[] = localData ? JSON.parse(localData) : [];
      if (studentEmail) {
        return list.filter(r => r.studentEmail.toLowerCase() === studentEmail.toLowerCase());
      }
      return list;
    }
  },

  async saveLetterRequest(req: LetterRequest): Promise<LetterRequest> {
    try {
      const payload = {
        id: req.id,
        student_email: req.studentEmail,
        student_name: req.studentName,
        roll_no: req.rollNo,
        letter_type: req.letterType,
        purpose: req.purpose,
        details: req.details,
        status: req.status,
        requested_at: req.requestedAt,
        pdf_url: req.pdfUrl,
        admin_remarks: req.adminRemarks
      };
      const { error } = await supabase
        .from('letter_requests')
        .upsert(payload);
      if (error) throw error;
      return req;
    } catch (err: any) {
      console.warn('Supabase saveLetterRequest failed, using localStorage:', err.message || err);
      const localData = localStorage.getItem('eee_letter_requests') || '[]';
      const list: LetterRequest[] = JSON.parse(localData);
      const idx = list.findIndex(r => r.id === req.id);
      if (idx > -1) {
        list[idx] = req;
      } else {
        list.push(req);
      }
      localStorage.setItem('eee_letter_requests', JSON.stringify(list));
      return req;
    }
  },

  async deleteLetterRequest(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('letter_requests')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (err: any) {
      console.warn('Supabase deleteLetterRequest failed, using localStorage:', err.message || err);
      const localData = localStorage.getItem('eee_letter_requests');
      const list: LetterRequest[] = localData ? JSON.parse(localData) : [];
      localStorage.setItem('eee_letter_requests', JSON.stringify(list.filter(r => r.id !== id)));
      return true;
    }
  }
};

