import React, { useState, useEffect } from 'react';
import { type Student, type SemesterGrades, dbService } from '../services/db';
import { ArrowLeft, TrendingUp, Sparkles, Search, UserCheck } from 'lucide-react';

interface AcademicsTrackerProps {
  currentEmail: string;
  isAdmin: boolean;
  onBack: () => void;
}

export const AcademicsTracker: React.FC<AcademicsTrackerProps> = ({ currentEmail, isAdmin, onBack }) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [cgpaRecords, setCgpaRecords] = useState<Record<number, SemesterGrades>>({});
  const [arrears, setArrears] = useState(0);

  // Admin states
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentEmail, setSelectedStudentEmail] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'cgpa' | 'arrears'>('name');
  const [expandedSem, setExpandedSem] = useState<number | null>(null);

  // Input states
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    loadData();
  }, [currentEmail, selectedStudentEmail, isAdmin]);

  const loadData = async () => {
    if (isAdmin) {
      const list = await dbService.fetchAllStudents();
      setAllStudents(list);

      if (selectedStudentEmail) {
        const p = await dbService.getStudentProfile(selectedStudentEmail);
        if (p) {
          setStudent(p);
          setCgpaRecords(p.cgpa || {});
          setArrears(p.arrears || 0);
        }
      } else {
        setStudent(null);
      }
    } else {
      const p = await dbService.getStudentProfile(currentEmail);
      if (p) {
        setStudent(p);
        setCgpaRecords(p.cgpa || {});
        setArrears(p.arrears || 0);
      } else {
        const fallbackStudent: Student = {
          id: currentEmail || 'student@eee.com',
          rollNo: '7377221EE001',
          name: 'Nithin Annamalai',
          email: currentEmail || 'student@eee.com',
          cgpa: {
            1: { internal1: 85, internal2: 88, semMarks: 86, gpa: 8.5 },
            2: { internal1: 82, internal2: 84, semMarks: 83, gpa: 8.3 },
            3: { internal1: 86, internal2: 87, semMarks: 86, gpa: 8.6 },
            4: { internal1: 88, internal2: 90, semMarks: 87, gpa: 8.7 },
            5: { internal1: 84, internal2: 85, semMarks: 84, gpa: 8.4 },
            6: { internal1: 85, internal2: 86, semMarks: 85, gpa: 8.5 }
          },
          arrears: 0,
          nptelExams: [],
          documents: []
        };
        setStudent(fallbackStudent);
        setCgpaRecords(fallbackStudent.cgpa);
        setArrears(fallbackStudent.arrears);
      }
    }
  };

  const handleGradeChange = (semester: number, field: keyof SemesterGrades, value: string) => {
    const val = parseFloat(value);
    setCgpaRecords(prev => ({
      ...prev,
      [semester]: {
        ...(prev[semester] || {}),
        [field]: isNaN(val) ? undefined : val
      }
    }));
  };

  const handleSaveAcademics = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    setSaving(true);
    setStatusMessage('');

    try {
      await dbService.updateStudentProfile(student.email, {
        cgpa: cgpaRecords,
        arrears: arrears
      });
      setStatusMessage('Academic details saved!');
      setTimeout(() => setStatusMessage(''), 3000);
      loadData();
    } catch (err) {
      console.error(err);
      setStatusMessage('Error saving academic data.');
    } finally {
      setSaving(false);
    }
  };

  // Helper: Extract GPA from SemesterGrades or number
  const getGpa = (grades: SemesterGrades | number | undefined): number => {
    if (!grades) return 0;
    if (typeof grades === 'number') return grades;
    return grades.gpa || 0;
  };

  // Helper: Calculate CGPA from SemesterGrades records
  const calculateCgpa = (records: Record<number, SemesterGrades>): number => {
    const gpas = Object.values(records).map(g => getGpa(g)).filter(v => v > 0);
    if (gpas.length === 0) return 0;
    return Math.round((gpas.reduce((sum, g) => sum + g, 0) / gpas.length) * 100) / 100;
  };

  const currentCgpa = calculateCgpa(cgpaRecords);

  // Sorting helper for admins
  const getSortedStudents = () => {
    const filtered = allStudents.filter(s =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortBy === 'cgpa') {
      return [...filtered].sort((a, b) => calculateCgpa(b.cgpa) - calculateCgpa(a.cgpa));
    }
    if (sortBy === 'arrears') {
      return [...filtered].sort((a, b) => b.arrears - a.arrears);
    }
    return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  };

  const sortedStudents = getSortedStudents();

  return (
    <div className="panel-view">
      <div className="panel-header">
        <button onClick={selectedStudentEmail ? () => setSelectedStudentEmail(null) : onBack} className="back-btn">
          <ArrowLeft size={20} />
        </button>
        <span className="panel-title">
          {isAdmin && !selectedStudentEmail ? 'Academic Directory' : 'CGPA & Arrears Tracker'}
        </span>
      </div>

      <div className="panel-body">
        {statusMessage && (
          <div style={{ padding: 8, background: 'var(--bg-secondary)', borderRadius: 6, fontSize: 11, textAlign: 'center', color: 'var(--accent-gold)', fontWeight: 'bold' }}>
            {statusMessage}
          </div>
        )}

        {/* --- ADMIN LIST VIEW --- */}
        {isAdmin && !selectedStudentEmail && (
          <>
            <div className="form-group" style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '36px' }}
              />
              <Search
                size={16}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
            </div>

            {/* Sorting controls */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span className="form-label" style={{ fontSize: 10 }}>Sort By:</span>
              <button
                onClick={() => setSortBy('name')}
                style={{ padding: '3px 10px', fontSize: 10, fontWeight: 700, borderRadius: 6, border: `1.5px solid ${sortBy === 'name' ? 'var(--accent-blue)' : 'var(--card-border)'}`, background: sortBy === 'name' ? 'var(--accent-blue)' : 'var(--bg-secondary)', color: sortBy === 'name' ? '#fff' : 'var(--text-main)', cursor: 'pointer' }}
              >
                Name
              </button>
              <button
                onClick={() => setSortBy('cgpa')}
                style={{ padding: '3px 10px', fontSize: 10, fontWeight: 700, borderRadius: 6, border: `1.5px solid ${sortBy === 'cgpa' ? 'var(--accent-blue)' : 'var(--card-border)'}`, background: sortBy === 'cgpa' ? 'var(--accent-blue)' : 'var(--bg-secondary)', color: sortBy === 'cgpa' ? '#fff' : 'var(--text-main)', cursor: 'pointer' }}
              >
                CGPA
              </button>
              <button
                onClick={() => setSortBy('arrears')}
                style={{ padding: '3px 10px', fontSize: 10, fontWeight: 700, borderRadius: 6, border: `1.5px solid ${sortBy === 'arrears' ? 'var(--accent-blue)' : 'var(--card-border)'}`, background: sortBy === 'arrears' ? 'var(--accent-blue)' : 'var(--bg-secondary)', color: sortBy === 'arrears' ? '#fff' : 'var(--text-main)', cursor: 'pointer' }}
              >
                Arrears
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
              {sortedStudents.length === 0 ? (
                <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', padding: '20px 0' }}>No student records.</p>
              ) : (
                sortedStudents.map(s => {
                  const studentCgpa = calculateCgpa(s.cgpa);
                  return (
                    <div
                      key={s.id}
                      className="attendance-mark-item"
                      onClick={() => setSelectedStudentEmail(s.email)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div>
                        <h4 style={{ fontSize: 13, fontWeight: '700' }}>{s.name}</h4>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Roll: {s.rollNo}</p>
                        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                          <span style={{ fontSize: 10, color: 'var(--accent-blue)' }}>CGPA: <strong>{studentCgpa || 'N/A'}</strong></span>
                          <span style={{ fontSize: 10, color: s.arrears > 0 ? '#f87171' : '#4ade80' }}>Arrears: <strong>{s.arrears}</strong></span>
                        </div>
                      </div>
                      <UserCheck size={18} style={{ color: 'var(--accent-blue)' }} />
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* --- STUDENT / INDIVIDUAL DETAILS VIEW --- */}
        {(!isAdmin || selectedStudentEmail) && student && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {isAdmin && (
              <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: 10, borderRadius: 8, fontSize: 11, border: '1px solid rgba(56,189,248,0.2)' }}>
                Viewing grades for: <strong>{student.name} ({student.rollNo})</strong>
              </div>
            )}

            {/* Scoreboard Card */}
            <div className="attendance-summary" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e293b 100%)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <TrendingUp size={32} style={{ color: 'var(--accent-gold)', marginBottom: 4 }} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Cumulative CGPA</span>
                <span style={{ fontSize: 24, fontWeight: '800', color: 'var(--text-main)' }}>{currentCgpa || '0.00'}</span>
              </div>
              <div style={{ width: 1, height: 50, background: 'var(--card-border)' }} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Sparkles size={32} style={{ color: arrears > 0 ? '#ef4444' : '#4ade80', marginBottom: 4 }} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Active Arrears</span>
                <span style={{ fontSize: 24, fontWeight: '800', color: arrears > 0 ? '#f87171' : '#4ade80' }}>{arrears}</span>
              </div>
            </div>

            {/* Semester Accordion */}
            <form onSubmit={handleSaveAcademics} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <h4 style={{ fontSize: 13, fontWeight: '700', margin: '4px 0 2px' }}>Semester-wise Breakdown</h4>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => {
                const grades = cgpaRecords[sem] || {};
                const gpa = getGpa(grades);
                const isOpen = expandedSem === sem;
                // Cumulative CGPA up to this semester
                const cumRecords: Record<number, SemesterGrades> = {};
                for (let s = 1; s <= sem; s++) { if (cgpaRecords[s]) cumRecords[s] = cgpaRecords[s]; }
                const cumCgpa = calculateCgpa(cumRecords);
                return (
                  <div key={sem}>
                    <div
                      className="sem-accordion-header"
                      onClick={() => setExpandedSem(isOpen ? null : sem)}
                    >
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-main)' }}>Semester {sem}</span>
                        {gpa > 0 && (
                          <span style={{ fontSize: 10, background: 'rgba(250,204,21,0.15)', color: '#facc15', padding: '2px 7px', borderRadius: 4, fontWeight: 700 }}>GPA: {gpa}</span>
                        )}
                        {cumCgpa > 0 && (
                          <span style={{ fontSize: 10, background: 'rgba(56,189,248,0.12)', color: 'var(--accent-blue)', padding: '2px 7px', borderRadius: 4, fontWeight: 700 }}>CGPA: {cumCgpa}</span>
                        )}
                      </div>
                      <span style={{ fontSize: 14, color: 'var(--text-muted)', transition: 'transform 0.2s', display: 'inline-block', transform: isOpen ? 'rotate(180deg)' : 'none' }}>▾</span>
                    </div>
                    {isOpen && (
                      <div className="sem-accordion-content">
                        {(['internal1', 'internal2', 'semMarks', 'gpa'] as (keyof SemesterGrades)[]).map(field => {
                          const labels: Record<string, string> = { internal1: 'Internal 1', internal2: 'Internal 2', semMarks: 'Sem Marks', gpa: 'GPA (0–10)' };
                          const val = (grades as any)[field];
                          return (
                            <div key={field} className="sem-accordion-field">
                              <label>{labels[field]}</label>
                              {isAdmin ? (
                                <input
                                  type="number"
                                  step={field === 'gpa' ? '0.01' : '1'}
                                  min="0"
                                  max={field === 'gpa' ? '10' : '100'}
                                  placeholder={field === 'gpa' ? 'e.g. 8.5' : 'e.g. 85'}
                                  value={val !== undefined ? val : ''}
                                  onChange={e => handleGradeChange(sem, field, e.target.value)}
                                  disabled={saving}
                                />
                              ) : (
                                <span>{val !== undefined ? val : '—'}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {isAdmin && (
                <>
                  <div className="form-group" style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: 10, border: '1px solid var(--card-border)', marginTop: 4 }}>
                    <label className="form-label" style={{ marginBottom: 4 }}>Arrears Count</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input
                        type="number"
                        min="0"
                        value={arrears}
                        onChange={e => setArrears(Math.max(0, parseInt(e.target.value) || 0))}
                        className="form-input"
                        disabled={saving}
                        style={{ flex: 1 }}
                      />
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button type="button" onClick={() => setArrears(prev => Math.max(0, prev - 1))} className="btn-secondary" style={{ padding: '6px 12px' }} disabled={saving}>-</button>
                        <button type="button" onClick={() => setArrears(prev => prev + 1)} className="btn-secondary" style={{ padding: '6px 12px' }} disabled={saving}>+</button>
                      </div>
                    </div>
                  </div>
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Grades & Arrears'}
                  </button>
                </>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
