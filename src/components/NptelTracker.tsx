import React, { useState, useEffect } from 'react';
import { dbService } from '../services/db';
import type { Student } from '../services/db';
import { ArrowLeft, Plus, Trash2, Award, Search, UserCheck } from 'lucide-react';

interface NptelTrackerProps {
  currentEmail: string;
  isAdmin: boolean;
  onBack: () => void;
}

export const NptelTracker: React.FC<NptelTrackerProps> = ({ currentEmail, isAdmin, onBack }) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [exams, setExams] = useState<string[]>([]);
  
  // Admin states
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentEmail, setSelectedStudentEmail] = useState<string | null>(null);

  // Form input state
  const [newExam, setNewExam] = useState('');
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
          setExams(p.nptelExams || []);
        }
      } else {
        setStudent(null);
        setExams([]);
      }
    } else {
      const p = await dbService.getStudentProfile(currentEmail);
      if (p) {
        setStudent(p);
        setExams(p.nptelExams || []);
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
          nptelExams: ['Embedded Systems', 'Power Electronics'],
          documents: []
        };
        setStudent(fallbackStudent);
        setExams(fallbackStudent.nptelExams);
      }
    }
  };

  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExam || !student) return;
    setSaving(true);
    setStatusMessage('');

    const updatedExams = [...exams, newExam.trim()];

    try {
      await dbService.updateStudentProfile(student.email, { nptelExams: updatedExams });
      setExams(updatedExams);
      setNewExam('');
      setStatusMessage('Exam registration added!');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setStatusMessage('Error adding exam.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExam = async (examName: string) => {
    if (!student) return;
    if (!window.confirm(`Remove NPTEL Registration for: "${examName}"?`)) return;
    setSaving(true);

    const updatedExams = exams.filter(e => e !== examName);

    try {
      await dbService.updateStudentProfile(student.email, { nptelExams: updatedExams });
      setExams(updatedExams);
      setStatusMessage('Exam registration removed.');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setStatusMessage('Error removing exam.');
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = allStudents.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.nptelExams && s.nptelExams.some(e => e.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <div className="panel-view">
      <div className="panel-header">
        <button onClick={selectedStudentEmail ? () => setSelectedStudentEmail(null) : onBack} className="back-btn">
          <ArrowLeft size={20} />
        </button>
        <span className="panel-title">
          {isAdmin && !selectedStudentEmail ? 'NPTEL Admin Portal' : 'NPTEL Certifications'}
        </span>
      </div>

      <div className="panel-body">
        {statusMessage && (
          <div style={{ padding: 8, background: 'var(--bg-secondary)', borderRadius: 6, fontSize: 11, textAlign: 'center', color: 'var(--accent-gold)' }}>
            {statusMessage}
          </div>
        )}

        {/* --- ADMIN DIRECTORY VIEW --- */}
        {isAdmin && !selectedStudentEmail && (
          <>
            <div className="form-group" style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search by student or exam name..."
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
              <p className="form-label">Registrations by Student:</p>
              {filteredStudents.length === 0 ? (
                <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', padding: '20px 0' }}>
                  No students matched query.
                </p>
              ) : (
                filteredStudents.map(s => (
                  <div 
                    key={s.id} 
                    className="attendance-mark-item" 
                    onClick={() => setSelectedStudentEmail(s.email)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div>
                      <h4 style={{ fontSize: 13, fontWeight: '700' }}>{s.name}</h4>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Roll: {s.rollNo}</p>
                      {s.nptelExams && s.nptelExams.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                          {s.nptelExams.map((ex, i) => (
                            <span key={i} style={{ fontSize: 9, background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-gold)', padding: '2px 6px', borderRadius: 4 }}>
                              {ex}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p style={{ fontSize: 10, color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 4 }}>No exams registered</p>
                      )}
                    </div>
                    <UserCheck size={18} style={{ color: 'var(--accent-blue)' }} />
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* --- STUDENT / INDIVIDUAL DETAILS VIEW --- */}
        {(!isAdmin || selectedStudentEmail) && student && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {isAdmin && (
              <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: 10, borderRadius: 8, fontSize: 11, border: '1px solid rgba(56,189,248,0.2)' }}>
                Viewing NPTEL list for: <strong>{student.name} ({student.rollNo})</strong>
              </div>
            )}

            <form onSubmit={handleAddExam} style={{ display: 'flex', flexDirection: 'column', gap: 10, background: 'var(--bg-secondary)', padding: 14, borderRadius: 12, border: '1px solid var(--card-border)' }}>
              <div className="form-group">
                <label className="form-label">{isAdmin ? "Add NPTEL Exam for Student" : "Register New NPTEL Exam"}</label>
                <input
                  type="text"
                  value={newExam}
                  onChange={e => setNewExam(e.target.value)}
                  className="form-input"
                  placeholder="e.g. Introduction to Smart Grid"
                  required
                />
              </div>
              <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }} disabled={saving}>
                <Plus size={16} />
                Add Course
              </button>
            </form>

            <div>
              <h4 style={{ fontSize: 13, fontWeight: '700', marginBottom: 8 }}>Registered NPTEL Examinations</h4>
              <div className="document-list">
                {exams.length === 0 ? (
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
                    No NPTEL courses registered yet.
                  </p>
                ) : (
                  exams.map((examName, index) => (
                    <div key={index} className="document-item" style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Award size={18} style={{ color: 'var(--accent-gold)' }} />
                        <span style={{ fontSize: 12, fontWeight: '700', color: 'var(--text-main)' }}>{examName}</span>
                      </div>
                      <button onClick={() => handleDeleteExam(examName)} className="doc-action-btn delete" style={{ background: 'none', border: 'none', cursor: 'pointer' }} disabled={saving}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
