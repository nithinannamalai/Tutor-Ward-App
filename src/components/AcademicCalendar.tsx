import React, { useState, useEffect } from 'react';
import { dbService } from '../services/db';
import type { Course } from '../services/db';
import { ArrowLeft, BookOpen, Calendar, Plus, Trash2, Pencil, X, Check } from 'lucide-react';

import addIcon from '../assets/add-icon.png';

interface AcademicCalendarProps {
  onBack: () => void;
  isAdmin?: boolean;
}

interface Milestone {
  id?: number;
  date: string;
  event: string;
  type: 'academic' | 'exam' | 'holiday';
}

export const AcademicCalendar: React.FC<AcademicCalendarProps> = ({ onBack, isAdmin = false }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [editCourseCode, setEditCourseCode] = useState<string | null>(null);
  const [editMilestoneId, setEditMilestoneId] = useState<number | null>(null);

  const [showCourseForm, setShowCourseForm] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newCredits, setNewCredits] = useState('');
  const [newSem, setNewSem] = useState('6');
  const [courseStatus, setCourseStatus] = useState('');

  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [newMDate, setNewMDate] = useState('');
  const [newMEvent, setNewMEvent] = useState('');
  const [newMType, setNewMType] = useState<'academic' | 'exam' | 'holiday'>('academic');

  useEffect(() => {
    loadCourses();
    loadMilestones();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    const list = await dbService.getCourses();
    setCourses(list);
    setLoading(false);
  };

  const loadMilestones = async () => {
    setLoading(true);
    const list = await dbService.getMilestones();
    setMilestones(list);
    setLoading(false);
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim() || !newCredits) return;
    const course: Course = {
      code: newCode.trim().toUpperCase(),
      name: newName.trim(),
      credits: parseInt(newCredits),
      semester: parseInt(newSem),
    };
    if (editCourseCode && editCourseCode !== course.code) {
      await dbService.deleteCourse(editCourseCode);
    }
    await dbService.saveCourse(course);
    setCourseStatus(editCourseCode ? 'Course updated!' : 'Course added!');
    setTimeout(() => setCourseStatus(''), 2500);
    setNewCode(''); setNewName(''); setNewCredits(''); setNewSem('6');
    setEditCourseCode(null);
    setShowCourseForm(false);
    loadCourses();
  };

  const handleDeleteCourse = async (code: string) => {
    if (!window.confirm(`Delete course "${code}"?`)) return;
    await dbService.deleteCourse(code);
    loadCourses();
  };

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMDate.trim() || !newMEvent.trim()) return;
    const m: Milestone = {
      date: newMDate.trim(),
      event: newMEvent.trim(),
      type: newMType,
    };
    if (editMilestoneId) {
      m.id = editMilestoneId;
    }
    await dbService.saveMilestone(m);
    setNewMDate(''); setNewMEvent(''); setNewMType('academic');
    setEditMilestoneId(null);
    setShowMilestoneForm(false);
    loadMilestones();
  };

  const handleDeleteMilestone = async (id: number) => {
    if (!window.confirm('Delete this milestone event?')) return;
    await dbService.deleteMilestone(id);
    loadMilestones();
  };

  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
  const typeColor = (type: string) =>
    type === 'exam' ? '#f87171' : type === 'holiday' ? 'var(--accent-gold)' : 'var(--accent-blue)';

  return (
    <div className="panel-view">
      <div className="panel-header">
        <button onClick={onBack} className="back-btn">
          <ArrowLeft size={20} />
        </button>
        <span className="panel-title">Courses & Academic Calendar</span>
        {isAdmin && (
          <button
            onClick={() => setEditMode(e => !e)}
            style={{
              marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4,
              padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer',
              border: `1.5px solid ${editMode ? '#f87171' : 'var(--accent-blue)'}`,
              background: editMode ? 'rgba(248,113,113,0.12)' : 'rgba(56,189,248,0.12)',
              color: editMode ? '#f87171' : 'var(--accent-blue)',
            }}
          >
            {editMode ? <><X size={12} /> Done</> : <><Pencil size={12} /> Edit</>}
          </button>
        )}
      </div>

      <div className="panel-body">
        {courseStatus && (
          <div style={{ padding: 8, background: 'rgba(74,222,128,0.1)', borderRadius: 8, fontSize: 11, textAlign: 'center', color: '#4ade80', fontWeight: 700, border: '1px solid rgba(74,222,128,0.2)' }}>
            <Check size={12} style={{ display: 'inline', marginRight: 4 }} />{courseStatus}
          </div>
        )}

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h4 style={{ fontSize: 13, fontWeight: '700' }}>Semester VI Curriculum</h4>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 11, background: 'rgba(56,189,248,0.15)', color: 'var(--accent-blue)', padding: '2px 8px', borderRadius: 4, fontWeight: 'bold' }}>
                Total: {totalCredits} Cr
              </span>
              {editMode && (
                <button
                  onClick={() => { setShowCourseForm(v => !v); setEditCourseCode(null); }}
                  className="btn-png-add"
                >
                  <img src={addIcon} alt="Add" style={{ width: 14, height: 14 }} /> Add Course
                </button>
              )}
            </div>
          </div>

          {editMode && showCourseForm && (
            <form onSubmit={handleAddCourse} style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 12, border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <label className="form-label">Course Code</label>
                  <input value={newCode} onChange={e => setNewCode(e.target.value)} className="form-input" placeholder="e.g. EE8700" required style={{ fontSize: 11 }} />
                </div>
                <div>
                  <label className="form-label">Credits</label>
                  <input type="number" value={newCredits} onChange={e => setNewCredits(e.target.value)} className="form-input" placeholder="3" min="1" max="6" required style={{ fontSize: 11 }} />
                </div>
              </div>
              <div>
                <label className="form-label">Course Name</label>
                <input value={newName} onChange={e => setNewName(e.target.value)} className="form-input" placeholder="e.g. Digital Signal Processing" required style={{ fontSize: 11 }} />
              </div>
              <div>
                <label className="form-label">Semester</label>
                <select value={newSem} onChange={e => setNewSem(e.target.value)} className="form-select" style={{ fontSize: 11 }}>
                  {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, fontSize: 11 }}>{editCourseCode ? 'Save Changes' : 'Save Course'}</button>
                <button type="button" onClick={() => { setShowCourseForm(false); setEditCourseCode(null); }} className="btn-secondary" style={{ fontSize: 11 }}>Cancel</button>
              </div>
            </form>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {loading ? (
              <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>Loading...</p>
            ) : courses.length === 0 ? (
              <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)' }}>No courses found. {isAdmin ? 'Add one above.' : ''}</p>
            ) : (
              courses.map(course => (
                <div key={course.code} className="document-item" style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <BookOpen size={16} style={{ color: 'var(--accent-gold)' }} />
                    </div>
                    <div className="doc-info" style={{ gap: 0 }}>
                      <span style={{ fontSize: 12, fontWeight: '700', color: 'var(--text-main)' }}>{course.name}</span>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{course.code} · Sem {course.semester}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: '800', background: 'rgba(56,189,248,0.08)', color: 'var(--accent-blue)', padding: '4px 8px', borderRadius: 6 }}>
                      {course.credits} Cr
                    </span>
                    {editMode && (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          onClick={() => {
                            setEditCourseCode(course.code);
                            setNewCode(course.code);
                            setNewName(course.name);
                            setNewCredits(course.credits.toString());
                            setNewSem(course.semester.toString());
                            setShowCourseForm(true);
                          }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-blue)', padding: 4 }}
                        >
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDeleteCourse(course.code)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', padding: 4 }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <hr style={{ border: 'none', height: 1, backgroundColor: 'var(--card-border)', margin: '12px 0' }} />

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h4 style={{ fontSize: 13, fontWeight: '700' }}>Academic Calendar 2026</h4>
            {editMode && (
              <button
                onClick={() => { setShowMilestoneForm(v => !v); setEditMilestoneId(null); }}
                className="btn-png-add"
              >
                <img src={addIcon} alt="Add" style={{ width: 14, height: 14 }} /> Add Event
              </button>
            )}
          </div>

          {editMode && showMilestoneForm && (
            <form onSubmit={handleAddMilestone} style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 12, border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
              <div>
                <label className="form-label">Date / Range</label>
                <input value={newMDate} onChange={e => setNewMDate(e.target.value)} className="form-input" placeholder="e.g. December 1, 2026" required style={{ fontSize: 11 }} />
              </div>
              <div>
                <label className="form-label">Event Description</label>
                <input value={newMEvent} onChange={e => setNewMEvent(e.target.value)} className="form-input" placeholder="e.g. Semester End Review" required style={{ fontSize: 11 }} />
              </div>
              <div>
                <label className="form-label">Type</label>
                <select value={newMType} onChange={e => setNewMType(e.target.value as any)} className="form-select" style={{ fontSize: 11 }}>
                  <option value="academic">Academic</option>
                  <option value="exam">Exam</option>
                  <option value="holiday">Holiday / Event</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, fontSize: 11 }}>{editMilestoneId ? 'Save Changes' : 'Add Event'}</button>
                <button type="button" onClick={() => { setShowMilestoneForm(false); setEditMilestoneId(null); }} className="btn-secondary" style={{ fontSize: 11 }}>Cancel</button>
              </div>
            </form>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {milestones.map((m, idx) => (
              <div
                key={m.id || idx}
                className="document-item"
                style={{ padding: '10px 12px', borderLeft: `3px solid ${typeColor(m.type)}`, borderRadius: '4px 10px 10px 4px' }}
              >
                <div className="doc-info" style={{ gap: 2 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Calendar size={12} />
                    {m.date}
                    <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: typeColor(m.type), background: `${typeColor(m.type)}22`, padding: '1px 5px', borderRadius: 4, marginLeft: 4 }}>
                      {m.type}
                    </span>
                  </span>
                  <span style={{ fontSize: 12, fontWeight: '700', color: 'var(--text-main)' }}>{m.event}</span>
                </div>
                {editMode && (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      onClick={() => {
                        setEditMilestoneId(m.id || null);
                        setNewMDate(m.date);
                        setNewMEvent(m.event);
                        setNewMType(m.type);
                        setShowMilestoneForm(true);
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-blue)', padding: 4 }}
                    >
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDeleteMilestone(m.id!)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', padding: 4, flexShrink: 0 }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
