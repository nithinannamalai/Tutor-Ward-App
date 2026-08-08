import React, { useState, useEffect, useRef } from 'react';
import { dbService } from '../services/db';
import type { TimetableEntry } from '../services/db';
import { ArrowLeft, Pencil, X, Check, Clock, User, ChevronLeft, ChevronRight, Calendar, Coffee, ImagePlus, FileImage, ZoomIn } from 'lucide-react';

interface TimetableProps {
  onBack: () => void;
  isAdmin?: boolean;
  semester?: number;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

const PERIOD_TIMES: Record<number, string> = {
  1: '8:00–8:50',
  2: '8:50–9:40',
  3: '9:55–10:45',
  4: '10:45–11:35',
  5: '12:15–1:05',
  6: '1:05–1:55',
  7: '2:10–3:00',
  8: '3:00–3:50',
};

const BurgerIcon: React.FC<{ size?: number; color?: string }> = ({ size = 18, color = '#10B981' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
    <path d="M2 12A10 10 0 0 1 22 12Z" fill="rgba(16, 185, 129, 0.15)" />
    <path d="M5 15h14" />
    <rect x="3" y="17" width="18" height="4" rx="1.5" fill="rgba(16, 185, 129, 0.15)" />
  </svg>
);

interface SubjectDetails {
  courseCode: string;
  batch: string;
  sec: string;
}

const parseSubject = (subjectStr: string): SubjectDetails => {
  try {
    if (subjectStr && subjectStr.trim().startsWith('{')) {
      const parsed = JSON.parse(subjectStr);
      return {
        courseCode: parsed.courseCode || '',
        batch: parsed.batch || '2025',
        sec: parsed.sec || 'B.E-EEE-A',
      };
    }
  } catch (e) {
    // Ignore error
  }
  return {
    courseCode: subjectStr || '—',
    batch: '2025',
    sec: 'B.E-EEE-A',
  };
};

const TT_STORAGE_KEY = 'eee_timetable_img';

export const Timetable: React.FC<TimetableProps> = ({ onBack, isAdmin = false, semester = 6 }) => {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date('2026-08-05')); // Default to Wednesday 05-Aug-2026 as per user screenshot
  const [editCell, setEditCell] = useState<{ day: string; period: number } | null>(null);

  // Custom states for editing
  const [editCourseCode, setEditCourseCode] = useState('');
  const [editBatch, setEditBatch] = useState('2025');
  const [editSec, setEditSec] = useState('B.E-EEE-A');
  const [editTeacher, setEditTeacher] = useState('');
  const [saving, setSaving] = useState(false);

  // Timetable image/PDF states
  const [ttFile, setTtFile] = useState<{ dataUrl: string; type: string; name: string } | null>(() => {
    const saved = localStorage.getItem(TT_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [showTtPreview, setShowTtPreview] = useState(false);

  const dateInputRef = useRef<HTMLInputElement>(null);
  const ttFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadTimetable();
  }, [semester]);

  const loadTimetable = async () => {
    setLoading(true);
    const data = await dbService.getTimetable(semester);
    setEntries(data);
    setLoading(false);
  };

  const getEntry = (day: string, period: number): TimetableEntry | undefined =>
    entries.find(e => e.day === day && e.period === period);

  const openEdit = (day: string, period: number) => {
    if (!editMode) return;
    const e = getEntry(day, period);
    setEditCell({ day, period });

    const details = parseSubject(e?.subject || '');
    setEditCourseCode(details.courseCode === '—' ? '' : details.courseCode);
    setEditBatch(details.batch);
    setEditSec(details.sec);
    setEditTeacher(e?.teacher || '');
  };

  const saveCell = async () => {
    if (!editCell) return;
    setSaving(true);
    const existing = getEntry(editCell.day, editCell.period);

    // Store fields as JSON string inside subject field
    const subjectJson = JSON.stringify({
      courseCode: editCourseCode.trim(),
      batch: editBatch.trim(),
      sec: editSec.trim()
    });

    const updated: TimetableEntry = {
      id: existing?.id,
      day: editCell.day,
      period: editCell.period,
      subject: subjectJson,
      teacher: editTeacher.trim(),
      semester,
    };

    await dbService.saveTimetableEntry(updated);
    setEditCell(null);
    await loadTimetable();
    setSaving(false);
  };

  const handleTtFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const stored = { dataUrl, type: file.type, name: file.name };
      setTtFile(stored);
      localStorage.setItem(TT_STORAGE_KEY, JSON.stringify(stored));
    };
    reader.readAsDataURL(file);
    // reset so the same file can be re-uploaded
    e.target.value = '';
  };

  const handleRemoveTtFile = () => {
    setTtFile(null);
    localStorage.removeItem(TT_STORAGE_KEY);
  };

  const handlePrevDay = () => {
    setSelectedDate(prev => {
      const nextDate = new Date(prev);
      nextDate.setDate(nextDate.getDate() - 1);
      return nextDate;
    });
  };

  const handleNextDay = () => {
    setSelectedDate(prev => {
      const nextDate = new Date(prev);
      nextDate.setDate(nextDate.getDate() + 1);
      return nextDate;
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setSelectedDate(new Date(e.target.value));
    }
  };

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayOfWeek = daysOfWeek[date.getDay()];
    return `${day}-${month}-${year} (${dayOfWeek})`;
  };

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const activeDay = daysOfWeek[selectedDate.getDay()];
  const isSunday = activeDay === 'Sun';

  const activeDayEntries = PERIODS.map(p => ({
    period: p,
    entry: getEntry(activeDay, p),
  }));

  return (
    <div className="panel-view">
      <div className="panel-header">
        <button onClick={onBack} className="back-btn">
          <ArrowLeft size={20} />
        </button>
        <span className="panel-title">📅 Class Timetable</span>
        {isAdmin && (
          <button
            onClick={() => { setEditMode(v => !v); setEditCell(null); }}
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
        {/* Semester badge */}
        <div style={{ marginBottom: 12 }}>
          <span style={{ fontSize: 11, background: 'rgba(0,82,204,0.1)', color: 'var(--accent-blue)', padding: '3px 10px', borderRadius: 20, fontWeight: 700 }}>
            Semester {semester} · EEE-A · 2026–27
          </span>
        </div>

        {/* Date Selector Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
          <button
            onClick={handlePrevDay}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1.5px solid var(--card-border)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-main)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <ChevronLeft size={16} />
          </button>

          <button
            onClick={() => dateInputRef.current?.showPicker()}
            style={{
              padding: '6px 16px',
              borderRadius: 20,
              border: '1.5px solid var(--card-border)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-main)',
              fontWeight: 700,
              fontSize: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s ease',
            }}
          >
            <Calendar size={13} style={{ color: 'var(--accent-blue)' }} />
            {formatDate(selectedDate)}
          </button>

          <input
            type="date"
            ref={dateInputRef}
            onChange={handleDateChange}
            value={selectedDate.toISOString().split('T')[0]}
            style={{ display: 'none' }}
          />

          <button
            onClick={handleNextDay}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1.5px solid var(--card-border)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-main)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <ChevronRight size={16} />
          </button>

          {/* Timetable image/PDF upload button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 4 }}>
            {ttFile ? (
              <button
                onClick={() => setShowTtPreview(true)}
                title={`View: ${ttFile.name}`}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  border: '1.5px solid rgba(0,82,204,0.3)',
                  background: 'rgba(0,82,204,0.08)',
                  color: 'var(--accent-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                }}
              >
                {ttFile.type.startsWith('image/') ? (
                  <img
                    src={ttFile.dataUrl}
                    alt="Timetable"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
                  />
                ) : (
                  <FileImage size={18} />
                )}
                {/* View overlay on hover */}
                <div style={{
                  position: 'absolute', inset: 0, background: 'rgba(0,82,204,0.55)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: 0, transition: 'opacity 0.15s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
                >
                  <ZoomIn size={14} color="#fff" />
                </div>
              </button>
            ) : null}

            <button
              onClick={() => ttFileInputRef.current?.click()}
              title="Upload timetable image or PDF"
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                border: '1.5px solid var(--card-border)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <ImagePlus size={16} />
            </button>
            <input
              ref={ttFileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleTtFileUpload}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <div className="loading-spinner" style={{ margin: '0 auto 12px' }} />
            Loading timetable…
          </div>
        ) : isSunday ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'var(--bg-secondary)',
            borderRadius: 16,
            border: '1.5px dashed var(--card-border)',
            color: 'var(--text-muted)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8
          }}>
            <span style={{ fontSize: 32 }}>🕊️</span>
            <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>Sunday - Holiday</div>
            <div style={{ fontSize: 11 }}>No academic classes scheduled for today.</div>
          </div>
        ) : (
          /* Horizontal Cards Scroll Area */
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            gap: 10,
            overflowX: 'auto',
            paddingBottom: 16,
            paddingTop: 4,
            alignItems: 'stretch',
            WebkitOverflowScrolling: 'touch',
          }}>
            {(() => {
              const rows: React.ReactNode[] = [];

              activeDayEntries.forEach(({ period, entry }) => {
                const subjectDetails = parseSubject(entry?.subject || '');
                const isAllocated = !!entry && subjectDetails.courseCode !== '' && subjectDetails.courseCode !== '—';

                rows.push(
                  <div
                    key={`hour-${period}`}
                    onClick={() => openEdit(activeDay, period)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      width: 140,
                      height: 200,
                      flexShrink: 0,
                      borderRadius: 12,
                      overflow: 'hidden',
                      border: `1.5px solid ${isAllocated ? 'rgba(217, 119, 6, 0.25)' : 'var(--card-border)'}`,
                      background: isAllocated ? 'var(--bg-primary)' : 'rgba(241, 245, 249, 0.05)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                      cursor: editMode ? 'pointer' : 'default',
                      transition: 'all 0.18s ease',
                      position: 'relative'
                    }}
                  >
                    {/* Header Band */}
                    <div style={{
                      height: 38,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: isAllocated ? '#FEF3C7' : '#F1F5F9',
                      borderBottom: `1px solid ${isAllocated ? '#FDE68A' : 'var(--card-border)'}`,
                      color: isAllocated ? '#B45309' : '#64748B',
                      padding: '4px 0',
                    }}>
                      <span style={{ fontWeight: 855, fontSize: 12 }}>Hour:{period}</span>
                      <span style={{ fontSize: 8, opacity: 0.7, fontWeight: 600 }}>{PERIOD_TIMES[period]}</span>
                    </div>

                    {/* Body Content */}
                    <div style={{
                      flex: 1,
                      padding: '12px 10px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                      gap: 4,
                      whiteSpace: 'normal',
                    }}>
                      {isAllocated ? (
                        <>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: 8, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.3 }}>Course:</span>
                            <span style={{ fontSize: 11, fontWeight: 800, color: '#1E293B', marginTop: 1 }}>{subjectDetails.courseCode}</span>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: 8, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.3 }}>Batch:</span>
                            <span style={{ fontSize: 10, fontWeight: 700, color: '#1E293B', marginTop: 1 }}>{subjectDetails.batch}</span>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: 8, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.3 }}>Deg-Br & Sec:</span>
                            <span style={{ fontSize: 10, fontWeight: 700, color: '#1E293B', marginTop: 1 }}>{subjectDetails.sec}</span>
                          </div>

                          {entry.teacher && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 8, color: 'var(--text-muted)', marginTop: 'auto', borderTop: '1px solid var(--card-border)', paddingTop: 4 }}>
                              <User size={8} />
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.teacher}</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div style={{
                          margin: 'auto 0',
                          textAlign: 'center',
                          fontSize: 10,
                          color: '#475569',
                          fontWeight: 700,
                          lineHeight: 1.4,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 4
                        }}>
                          <span>No hours</span>
                          <span>allocated</span>
                        </div>
                      )}
                    </div>

                    {/* Edit Indicator */}
                    {editMode && (
                      <div style={{
                        position: 'absolute',
                        bottom: 6,
                        right: 6,
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: 'rgba(56, 189, 248, 0.15)',
                        color: 'var(--accent-blue)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Pencil size={10} />
                      </div>
                    )}
                  </div>
                );

                // Insert intervals after specific periods
                if (period === 2) {
                  rows.push(
                    <div
                      key="break-tea-1"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 42,
                        height: 200,
                        flexShrink: 0,
                        borderRadius: 12,
                        border: '1.5px solid rgba(245, 158, 11, 0.25)',
                        background: 'rgba(251, 191, 36, 0.06)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.01)',
                      }}
                      title="Tea Break (9:40–9:55)"
                    >
                      <Coffee size={16} style={{ color: '#D97706' }} />
                    </div>
                  );
                } else if (period === 4) {
                  rows.push(
                    <div
                      key="break-lunch"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 42,
                        height: 200,
                        flexShrink: 0,
                        borderRadius: 12,
                        border: '1.5px solid rgba(16, 185, 129, 0.25)',
                        background: 'rgba(16, 185, 129, 0.06)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.01)',
                      }}
                      title="Lunch Break (11:35–12:15)"
                    >
                      <BurgerIcon size={16} color="#059669" />
                    </div>
                  );
                } else if (period === 6) {
                  rows.push(
                    <div
                      key="break-tea-2"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 42,
                        height: 200,
                        flexShrink: 0,
                        borderRadius: 12,
                        border: '1.5px solid rgba(245, 158, 11, 0.25)',
                        background: 'rgba(251, 191, 36, 0.06)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.01)',
                      }}
                      title="Tea Break (1:55–2:10)"
                    >
                      <Coffee size={16} style={{ color: '#D97706' }} />
                    </div>
                  );
                }
              });

              return rows;
            })()}
          </div>
        )}

        {/* Legend */}
        {!loading && (
          <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid var(--card-border)' }}>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <Clock size={11} /> Showing Sem {semester} timetable for III EEE-A
              {isAdmin && editMode && <span style={{ color: 'var(--accent-blue)', fontWeight: 700 }}> · Tap any cell to edit</span>}
            </p>
          </div>
        )}
      </div>

      {/* Admin Edit Modal Overlay */}
      {/* Timetable Image/PDF Preview Modal */}
      {showTtPreview && ttFile && (
        <div
          onClick={() => setShowTtPreview(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(10,15,30,0.88)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            zIndex: 2000, padding: 16,
            backdropFilter: 'blur(6px)',
          }}
        >
          <div style={{ position: 'relative', maxWidth: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Top bar */}
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              onClick={e => e.stopPropagation()}
            >
              <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ttFile.name}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                {isAdmin && (
                  <button
                    onClick={handleRemoveTtFile}
                    style={{ padding: '4px 10px', borderRadius: 8, background: 'rgba(248,113,113,0.2)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                  >
                    Remove
                  </button>
                )}
                <button
                  onClick={() => setShowTtPreview(false)}
                  style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div
              onClick={e => e.stopPropagation()}
              style={{ borderRadius: 14, overflow: 'hidden', maxHeight: 'calc(90vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {ttFile.type.startsWith('image/') ? (
                <img
                  src={ttFile.dataUrl}
                  alt="Timetable"
                  style={{ maxWidth: '100%', maxHeight: 'calc(90vh - 64px)', objectFit: 'contain', borderRadius: 12 }}
                />
              ) : (
                <iframe
                  src={ttFile.dataUrl}
                  title="Timetable PDF"
                  style={{ width: 'min(100vw - 32px, 600px)', height: 'min(80vh, 780px)', border: 'none', borderRadius: 12 }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {editCell && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16,
            backdropFilter: 'blur(3px)',
          }}
          onClick={() => setEditCell(null)}
        >
          <div
            style={{
              background: 'var(--bg-primary)',
              border: '1.5px solid var(--card-border)',
              borderRadius: 16,
              padding: 20,
              width: '100%',
              maxWidth: 360,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              boxShadow: '0 12px 30px -4px rgba(0, 0, 0, 0.12)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid var(--card-border)', paddingBottom: 10 }}>
              <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-main)' }}>
                Edit Hour {editCell.period} · {editCell.day}
              </span>
              <button onClick={() => setEditCell(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)' }}>COURSE CODE / SUBJECT NAME</label>
              <input
                value={editCourseCode}
                onChange={e => setEditCourseCode(e.target.value)}
                placeholder="e.g. 25EE2250"
                autoFocus
                style={{
                  padding: '8px 12px', borderRadius: 8, border: '1.5px solid var(--card-border)',
                  fontSize: 12, background: 'var(--bg-secondary)', color: 'var(--text-main)', outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)' }}>BATCH</label>
              <input
                value={editBatch}
                onChange={e => setEditBatch(e.target.value)}
                placeholder="e.g. 2025"
                style={{
                  padding: '8px 12px', borderRadius: 8, border: '1.5px solid var(--card-border)',
                  fontSize: 12, background: 'var(--bg-secondary)', color: 'var(--text-main)', outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)' }}>DEG-BR & SEC</label>
              <input
                value={editSec}
                onChange={e => setEditSec(e.target.value)}
                placeholder="e.g. B.E-EEE-A"
                style={{
                  padding: '8px 12px', borderRadius: 8, border: '1.5px solid var(--card-border)',
                  fontSize: 12, background: 'var(--bg-secondary)', color: 'var(--text-main)', outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)' }}>TEACHER (OPTIONAL)</label>
              <input
                value={editTeacher}
                onChange={e => setEditTeacher(e.target.value)}
                placeholder="e.g. Dr. S. Kavitha"
                style={{
                  padding: '8px 12px', borderRadius: 8, border: '1.5px solid var(--card-border)',
                  fontSize: 12, background: 'var(--bg-secondary)', color: 'var(--text-main)', outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button
                onClick={saveCell}
                disabled={saving}
                style={{ flex: 1, padding: '10px 0', borderRadius: 8, background: 'var(--accent-blue)', color: '#fff', border: 'none', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                <Check size={14} /> {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={() => setEditCell(null)}
                style={{ padding: '10px 16px', borderRadius: 8, background: 'var(--bg-secondary)', color: 'var(--text-main)', border: '1.5px solid var(--card-border)', fontSize: 12, cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

