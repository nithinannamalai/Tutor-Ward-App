import React, { useState, useEffect } from 'react';
import { dbService } from '../services/db';
import type { Course } from '../services/db';
import { ArrowLeft, BookOpen, Calendar } from 'lucide-react';

interface AcademicCalendarProps {
  onBack: () => void;
}

export const AcademicCalendar: React.FC<AcademicCalendarProps> = ({ onBack }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    const list = await dbService.getCourses();
    setCourses(list);
    setLoading(false);
  };

  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);

  // Mock Academic Calendar Milestones
  const milestones = [
    { date: 'July 15, 2026', event: 'Commencement of Semester VI Classes', type: 'academic' },
    { date: 'August 24 - 29, 2026', event: 'Continuous Assessment Test (CAT-1) Schedule', type: 'exam' },
    { date: 'September 5, 2026', event: 'Electrify 2026 - EEE Hackathon', type: 'holiday' },
    { date: 'September 15, 2026', event: 'Engineers Day Technical Symposium', type: 'academic' },
    { date: 'October 12 - 17, 2026', event: 'Continuous Assessment Test (CAT-2) Schedule', type: 'exam' },
    { date: 'November 2 - 7, 2026', event: 'Model Practical Examinations', type: 'exam' },
    { date: 'November 12, 2026', event: 'Last Working Day / Attendance Submission', type: 'academic' },
    { date: 'November 20, 2026', event: 'End Semester Theory Exams Commencement', type: 'exam' }
  ];

  return (
    <div className="panel-view">
      <div className="panel-header">
        <button onClick={onBack} className="back-btn">
          <ArrowLeft size={20} />
        </button>
        <span className="panel-title">Courses & Academic Calender</span>
      </div>

      <div className="panel-body">
        {/* --- CURRENT SEMESTER COURSES --- */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h4 style={{ fontSize: 13, fontWeight: '700' }}>Semester VI Curriculum</h4>
            <span style={{ fontSize: 11, background: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent-blue)', padding: '2px 8px', borderRadius: 4, fontWeight: 'bold' }}>
              Total Credits: {totalCredits}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {loading ? (
              <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>Loading curriculum...</p>
            ) : courses.length === 0 ? (
              <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)' }}>No courses found.</p>
            ) : (
              courses.map(course => (
                <div key={course.code} className="document-item" style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BookOpen size={16} style={{ color: 'var(--accent-gold)' }} />
                    </div>
                    <div className="doc-info" style={{ gap: 0 }}>
                      <span style={{ fontSize: 12, fontWeight: '700', color: 'var(--text-main)' }}>{course.name}</span>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Code: {course.code}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: '800', background: 'rgba(56, 189, 248, 0.08)', color: 'var(--accent-blue)', padding: '4px 8px', borderRadius: 6 }}>
                    {course.credits} Cr
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <hr style={{ border: 'none', height: 1, backgroundColor: 'var(--card-border)', margin: '10px 0' }} />

        {/* --- ACADEMIC CALENDAR MILESTONES --- */}
        <div>
          <h4 style={{ fontSize: 13, fontWeight: '700', marginBottom: 8 }}>Academic Calendar 2026</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {milestones.map((m, idx) => (
              <div 
                key={idx} 
                className="document-item" 
                style={{ 
                  padding: '10px 12px', 
                  borderLeft: m.type === 'exam' ? '3px solid #f87171' : m.type === 'holiday' ? '3px solid var(--accent-gold)' : '3px solid var(--accent-blue)',
                  borderRadius: '4px 10px 10px 4px'
                }}
              >
                <div className="doc-info" style={{ gap: 2 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Calendar size={12} />
                    {m.date}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: '700', color: 'var(--text-main)' }}>{m.event}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
