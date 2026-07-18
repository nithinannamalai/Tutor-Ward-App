import React, { useState, useEffect } from 'react';
import { type Student, dbService } from '../services/db';
import { ArrowLeft, TrendingUp, Sparkles, Search, UserCheck } from 'lucide-react';

interface AcademicsTrackerProps {
  currentEmail: string;
  isAdmin: boolean;
  onBack: () => void;
}

export const AcademicsTracker: React.FC<AcademicsTrackerProps> = ({ currentEmail, isAdmin, onBack }) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [cgpaRecords, setCgpaRecords] = useState<Record<number, number>>({});
  const [arrears, setArrears] = useState(0);

  // Admin states
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentEmail, setSelectedStudentEmail] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'cgpa' | 'arrears'>('name');

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
      }
    }
  };

  const handleGpaChange = (semester: number, value: string) => {
    const val = parseFloat(value);
    setCgpaRecords(prev => ({
      ...prev,
      [semester]: isNaN(val) ? 0 : Math.min(Math.max(val, 0), 10)
    }));
  };

  const handleSaveAcademics = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    setSaving(true);
    setStatusMessage('');

    // Clean up empty GPAs
    const cleanedCgpa: Record<number, number> = {};
    Object.keys(cgpaRecords).forEach(k => {
      const sem = parseInt(k);
      const val = cgpaRecords[sem];
      if (val > 0) {
        cleanedCgpa[sem] = val;
      }
    });

    try {
      await dbService.updateStudentProfile(student.email, {
        cgpa: cleanedCgpa,
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

  // Helper: Calculate CGPA
  const calculateCgpa = (records: Record<number, number>): number => {
    const gpas = Object.values(records).filter(val => val > 0);
    if (gpas.length === 0) return 0;
    const total = gpas.reduce((sum, g) => sum + g, 0);
    return Math.round((total / gpas.length) * 100) / 100;
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
                className={`btn-secondary ${sortBy === 'name' ? 'active' : ''}`}
                style={{ padding: '2px 8px', fontSize: 10, background: sortBy === 'name' ? 'var(--accent-blue)' : 'rgba(255,255,255,0.05)', color: sortBy === 'name' ? 'var(--bg-primary)' : 'white' }}
              >
                Name
              </button>
              <button
                onClick={() => setSortBy('cgpa')}
                className={`btn-secondary ${sortBy === 'cgpa' ? 'active' : ''}`}
                style={{ padding: '2px 8px', fontSize: 10, background: sortBy === 'cgpa' ? 'var(--accent-blue)' : 'rgba(255,255,255,0.05)', color: sortBy === 'cgpa' ? 'var(--bg-primary)' : 'white' }}
              >
                CGPA
              </button>
              <button
                onClick={() => setSortBy('arrears')}
                className={`btn-secondary ${sortBy === 'arrears' ? 'active' : ''}`}
                style={{ padding: '2px 8px', fontSize: 10, background: sortBy === 'arrears' ? 'var(--accent-blue)' : 'rgba(255,255,255,0.05)', color: sortBy === 'arrears' ? 'var(--bg-primary)' : 'white' }}
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

            {/* Form to enter GPAs */}
            <form onSubmit={handleSaveAcademics} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <h4 style={{ fontSize: 13, fontWeight: '700', marginBottom: 8 }}>Semester GPA Scores</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <div key={sem} className="form-group" style={{ background: 'var(--bg-secondary)', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--card-border)' }}>
                      <label className="form-label">Semester {sem}</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        placeholder="GPA (e.g. 8.5)"
                        value={cgpaRecords[sem] !== undefined && cgpaRecords[sem] !== 0 ? cgpaRecords[sem] : ''}
                        onChange={e => handleGpaChange(sem, e.target.value)}
                        className="form-input"
                        disabled={isAdmin}
                        style={{ padding: '6px 8px', fontSize: 12 }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group" style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: 10, border: '1px solid var(--card-border)' }}>
                <label className="form-label" style={{ marginBottom: 4 }}>Arrears Count</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    type="number"
                    min="0"
                    value={arrears}
                    onChange={e => setArrears(Math.max(0, parseInt(e.target.value) || 0))}
                    className="form-input"
                    disabled={isAdmin}
                    style={{ flex: 1 }}
                  />
                  {!isAdmin && (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button type="button" onClick={() => setArrears(prev => Math.max(0, prev - 1))} className="btn-secondary" style={{ padding: '6px 12px' }}>-</button>
                      <button type="button" onClick={() => setArrears(prev => prev + 1)} className="btn-secondary" style={{ padding: '6px 12px' }}>+</button>
                    </div>
                  )}
                </div>
              </div>

              {!isAdmin && (
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Grades & Arrears'}
                </button>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
