import React, { useState, useEffect } from 'react';
import { Search, Award, UserCheck, FileText, ArrowRight, Zap, Bot, Calendar, BookOpen, Clock, Compass, Layers, ShieldCheck } from 'lucide-react';
import { dbService } from '../../services/db';
import type { Student, AttendanceLog, ODRequest } from '../../services/db';
import type { UserProfile } from '../../App';

interface DesktopVisionaDashboardProps {
  currentUser: UserProfile | null;
  onOpenTab: (tabKey: string) => void;
}

export const DesktopVisionaDashboard: React.FC<DesktopVisionaDashboardProps> = ({ currentUser, onOpenTab }) => {
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
  const [odRequests, setOdRequests] = useState<ODRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadSupabaseData() {
      if (!currentUser?.email) return;
      try {
        // Fetch real Supabase data
        const [student, attendance, od] = await Promise.all([
          dbService.getStudentProfile(currentUser.email),
          dbService.getAttendanceForStudent(currentUser.rollNo || 'EEE001'),
          dbService.getODRequests(currentUser.email)
        ]);

        if (student) setStudentData(student);
        if (attendance) setAttendanceLogs(attendance);
        if (od) setOdRequests(od);
      } catch (err) {
        console.warn('Error fetching Supabase dashboard data:', err);
      }
    }

    loadSupabaseData();
  }, [currentUser]);

  // Calculate stats from Supabase data
  const totalClasses = attendanceLogs.length || 120;
  const attendedClasses = attendanceLogs.filter(l => l.status === 'present').length || 106;
  const attendancePercentage = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 88.5;

  const currentCgpa = studentData?.cgpa ? (Object.values(studentData.cgpa).slice(-1)[0]?.gpa || 8.75) : 8.75;
  const approvedODCount = odRequests.filter(r => r.status === 'Approved').length || 4;
  const nptelCount = studentData?.nptelExams?.length || 2;

  const quickModules = [
    { key: 'ai', label: 'AI Tutor', icon: <Bot size={18} />, color: '#8b5cf6', bg: '#f3e8ff' },
    { key: 'od-form', label: 'Apply OD', icon: <FileText size={18} />, color: '#2563eb', bg: '#dbeafe' },
    { key: 'request-letters', label: 'Bonafide / NOC', icon: <Layers size={18} />, color: '#059669', bg: '#d1fae5' },
    { key: 'timetable', label: 'Timetable', icon: <Clock size={18} />, color: '#d97706', bg: '#fef3c7' },
    { key: 'lab-finder', label: 'Lab Finder', icon: <Compass size={18} />, color: '#0284c7', bg: '#e0f2fe' },
    { key: 'cgpa-calc', label: 'GPA Calculator', icon: <Award size={18} />, color: '#ea580c', bg: '#ffedd5' },
    { key: 'nptel', label: 'NPTEL Vault', icon: <ShieldCheck size={18} />, color: '#7c3aed', bg: '#ede9fe' },
    { key: 'academics', label: 'Syllabus & Notes', icon: <BookOpen size={18} />, color: '#4f46e5', bg: '#e0e7ff' },
  ];

  return (
    <div className="visiona-dashboard-canvas">
      {/* ── Top Header Row ── */}
      <div className="visiona-header-row">
        <div>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#4338ca', letterSpacing: 0.5 }}>
            HI {currentUser?.name?.toUpperCase() || 'STUDENT'},
          </span>
          <h1 className="visiona-welcome-title">SREC EEE Smart Portal</h1>
        </div>

        <div className="visiona-search-bar">
          <Search size={16} style={{ color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search modules, notes, attendance..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* ── Top 4 KPI Cards (Matching Reference Screenshot) ── */}
      <div className="visiona-kpi-grid">
        {/* Card 1: CGPA Growth */}
        <div className="visiona-kpi-card gradient-blue-kpi">
          <div>
            <span style={{ fontSize: 12, fontWeight: 700, opacity: 0.9 }}>CGPA Progress</span>
            <h2 style={{ fontSize: 26, fontWeight: 900, margin: '4px 0 0 0' }}>{currentCgpa} CGPA</h2>
          </div>
          <div className="mini-sparkline">
            <svg viewBox="0 0 100 40" style={{ width: 80, height: 36 }}>
              <path d="M0,30 Q25,10 50,25 T100,8" stroke="#ffffff" strokeWidth="3" fill="none" />
            </svg>
          </div>
        </div>

        {/* Card 2: Total Credits */}
        <div className="visiona-kpi-card white-kpi">
          <div className="kpi-icon-circle" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
            <Award size={20} />
          </div>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>Completed Credits</span>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#1e293b', margin: 0 }}>112 / 160</h2>
          </div>
        </div>

        {/* Card 3: Attendance */}
        <div className="visiona-kpi-card white-kpi">
          <div className="kpi-icon-circle" style={{ background: '#dcfce7', color: '#16a34a' }}>
            <UserCheck size={20} />
          </div>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>Attendance Rate</span>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#1e293b', margin: 0 }}>{attendancePercentage}%</h2>
          </div>
        </div>

        {/* Card 4: OD Approved */}
        <div className="visiona-kpi-card white-kpi">
          <div className="kpi-icon-circle" style={{ background: '#fef3c7', color: '#d97706' }}>
            <FileText size={20} />
          </div>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>Approved ODs</span>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#1e293b', margin: 0 }}>{approvedODCount} Leaves</h2>
          </div>
        </div>
      </div>

      {/* ── Quick Module Launch Strip ── */}
      <div style={{ background: '#ffffff', borderRadius: 20, padding: '16px 24px', boxShadow: '0 8px 30px rgba(99, 102, 241, 0.06)' }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
          ⚡ Quick Module Shortcuts
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 12 }}>
          {quickModules.map((m) => (
            <button
              key={m.key}
              onClick={() => onOpenTab(m.key)}
              style={{
                background: '#f8fafc',
                border: `1.5px solid ${m.color}25`,
                borderRadius: 16,
                padding: '12px 8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
              className="quick-module-btn"
            >
              <div style={{ background: m.bg, color: m.color, padding: 8, borderRadius: 12 }}>
                {m.icon}
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#1e293b', textAlign: 'center' }}>
                {m.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Middle Row 3 Cards Grid ── */}
      <div className="visiona-middle-grid">
        {/* Card 1: Academic Progress Curve */}
        <div className="visiona-widget-card" style={{ flex: 1.2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Semester GPA Trend</span>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: 10 }}>+2.45%</span>
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: '#1e293b', margin: '0 0 16px 0' }}>{currentCgpa} GPA</h2>

          {/* Smooth Wave Chart */}
          <div style={{ width: '100%', height: 140, position: 'relative' }}>
            <svg viewBox="0 0 400 120" style={{ width: '100%', height: '100%' }}>
              <defs>
                <linearGradient id="waveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M0,80 Q50,20 100,70 T200,40 T300,80 T400,30" stroke="#4f46e5" strokeWidth="3.5" fill="none" />
              <path d="M0,80 Q50,20 100,70 T200,40 T300,80 T400,30 L400,120 L0,120 Z" fill="url(#waveGrad)" />
            </svg>
          </div>
        </div>

        {/* Card 2: Target GPA Calculator Widget */}
        <div className="visiona-widget-card" style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1e293b', margin: '0 0 16px 0' }}>Semester Target Goal</h3>
          
          <h2 style={{ fontSize: 32, fontWeight: 900, color: '#4f46e5', margin: '0 0 6px 0' }}>9.20 GPA</h2>
          <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 20px 0' }}>Required Internal Score: 88 / 100</p>

          <button className="visiona-primary-btn" onClick={() => onOpenTab('cgpa-calc')}>
            Simulate Target GPA
          </button>
        </div>

        {/* Card 3: OD & Letter Request Logs */}
        <div className="visiona-widget-card" style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#1e293b', margin: 0 }}>OD &amp; Letter Logs</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="history-row-item">
              <div className="history-avatar">OD</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#1e293b' }}>External Symposium</div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>Today, 10:30 AM</div>
              </div>
              <span className="badge-approved">+Approved</span>
            </div>

            <div className="history-row-item">
              <div className="history-avatar" style={{ background: '#fef3c7', color: '#d97706' }}>NOC</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#1e293b' }}>Internship Bonafide</div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>Yesterday, 14:15 PM</div>
              </div>
              <span className="badge-pending">Pending</span>
            </div>

            <div className="history-row-item">
              <div className="history-avatar">OD</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#1e293b' }}>IEEE Paper Contest</div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>14 Aug, 09:00 AM</div>
              </div>
              <span className="badge-approved">+Approved</span>
            </div>
          </div>

          <button className="view-all-link" onClick={() => onOpenTab('od-form')} style={{ marginTop: 16, background: 'none', border: 'none', color: '#4f46e5', fontWeight: 800, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            View All Requests <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* ── Bottom Row 2 Cards Grid ── */}
      <div className="visiona-bottom-grid">
        {/* Card 1: Attendance Analytics Chart */}
        <div className="visiona-widget-card" style={{ flex: 1.8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                Attendance Analytics <span style={{ fontSize: 11, fontWeight: 800, color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: 10 }}>● On track</span>
              </h3>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Semester VI</span>
          </div>

          <div style={{ display: 'flex', gap: 24, marginBottom: 20 }}>
            <div>
              <span style={{ fontSize: 11, color: '#64748b' }}>Total Attended</span>
              <h3 style={{ fontSize: 22, fontWeight: 900, color: '#1e293b', margin: 0 }}>{attendedClasses} / {totalClasses}</h3>
            </div>
            <div>
              <span style={{ fontSize: 11, color: '#64748b' }}>Attendance Rate</span>
              <h3 style={{ fontSize: 22, fontWeight: 900, color: '#4f46e5', margin: 0 }}>{attendancePercentage}%</h3>
            </div>
          </div>

          {/* Smooth Wave Path */}
          <div style={{ width: '100%', height: 90 }}>
            <svg viewBox="0 0 400 80" style={{ width: '100%', height: '100%' }}>
              <path d="M0,50 Q40,10 80,45 T160,20 T240,60 T320,15 T400,40" stroke="#4f46e5" strokeWidth="3" fill="none" />
            </svg>
          </div>
        </div>

        {/* Card 2: Student Profile Card */}
        <div className="visiona-widget-card" style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className="student-big-avatar">
            {currentUser?.name?.charAt(0) || 'N'}
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 900, color: '#1e293b', margin: '8px 0 2px 0' }}>
            {currentUser?.name || 'Nithin Annamalai'}
          </h3>
          <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 20px 0' }}>
            {currentUser?.rollNo || '7377221EE001'} · III EEE-A · SREC
          </p>

          <div style={{ display: 'flex', gap: 20, width: '100%', justifyContent: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
            <div>
              <span style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Courses</span>
              <h4 style={{ fontSize: 16, fontWeight: 900, color: '#1e293b', margin: 0 }}>6</h4>
            </div>
            <div style={{ width: 1, background: '#e2e8f0' }} />
            <div>
              <span style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>NPTEL</span>
              <h4 style={{ fontSize: 16, fontWeight: 900, color: '#1e293b', margin: 0 }}>{nptelCount}</h4>
            </div>
            <div style={{ width: 1, background: '#e2e8f0' }} />
            <div>
              <span style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>OD Days</span>
              <h4 style={{ fontSize: 16, fontWeight: 900, color: '#1e293b', margin: 0 }}>{approvedODCount}</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
