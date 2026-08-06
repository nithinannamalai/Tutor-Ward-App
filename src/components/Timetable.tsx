import React, { useState, useEffect } from 'react';
import { dbService } from '../services/db';
import type { TimetableEntry } from '../services/db';
import { ArrowLeft, Pencil, X, Check, Clock, User } from 'lucide-react';

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

// Colour palette per subject (auto-assigned by hash)
const SUBJECT_COLORS = [
  { bg: 'rgba(0,82,204,0.12)',   text: '#0052cc', border: '#0052cc' },
  { bg: 'rgba(5,150,105,0.12)',  text: '#059669', border: '#059669' },
  { bg: 'rgba(220,38,38,0.12)',  text: '#dc2626', border: '#dc2626' },
  { bg: 'rgba(124,58,237,0.12)', text: '#7c3aed', border: '#7c3aed' },
  { bg: 'rgba(217,119,6,0.12)',  text: '#d97706', border: '#d97706' },
  { bg: 'rgba(219,39,119,0.12)', text: '#db2777', border: '#db2777' },
  { bg: 'rgba(8,145,178,0.12)',  text: '#0891b2', border: '#0891b2' },
];

function hashColor(subject: string) {
  if (!subject || subject === 'LUNCH') return { bg: 'rgba(251,191,36,0.12)', text: '#b45309', border: '#f59e0b' };
  let h = 0;
  for (let i = 0; i < subject.length; i++) h = (h * 31 + subject.charCodeAt(i)) % SUBJECT_COLORS.length;
  return SUBJECT_COLORS[h];
}

export const Timetable: React.FC<TimetableProps> = ({ onBack, isAdmin = false, semester = 6 }) => {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [activeDay, setActiveDay] = useState<string>(DAYS[new Date().getDay() === 0 || new Date().getDay() === 7 ? 0 : new Date().getDay() - 1] || 'Mon');
  const [editCell, setEditCell] = useState<{ day: string; period: number } | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editTeacher, setEditTeacher] = useState('');
  const [saving, setSaving] = useState(false);

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
    setEditSubject(e?.subject || '');
    setEditTeacher(e?.teacher || '');
  };

  const saveCell = async () => {
    if (!editCell || !editSubject.trim()) return;
    setSaving(true);
    const existing = getEntry(editCell.day, editCell.period);
    const updated: TimetableEntry = {
      id: existing?.id,
      day: editCell.day,
      period: editCell.period,
      subject: editSubject.trim(),
      teacher: editTeacher.trim(),
      semester,
    };
    await dbService.saveTimetableEntry(updated);
    setEditCell(null);
    await loadTimetable();
    setSaving(false);
  };

  const todayIndex = new Date().getDay(); // 0=Sun, 1=Mon...
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

        {/* Day Tabs */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6, marginBottom: 14 }}>
          {DAYS.map((day, idx) => {
            const isTodayDay = todayIndex - 1 === idx; // Mon=1, so idx+1
            const isActive = activeDay === day;
            return (
              <button
                key={day}
                onClick={() => { setActiveDay(day); setEditCell(null); }}
                style={{
                  flexShrink: 0,
                  padding: '6px 14px',
                  borderRadius: 20,
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: 'pointer',
                  border: isActive ? '2px solid var(--accent-blue)' : '1.5px solid var(--card-border)',
                  background: isActive ? 'var(--accent-blue)' : 'var(--bg-secondary)',
                  color: isActive ? '#fff' : isTodayDay ? 'var(--accent-blue)' : 'var(--text-muted)',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                }}
              >
                {day}
                {isTodayDay && !isActive && (
                  <span style={{ position: 'absolute', top: 3, right: 5, width: 5, height: 5, borderRadius: '50%', background: 'var(--accent-blue)' }} />
                )}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <div className="loading-spinner" style={{ margin: '0 auto 12px' }} />
            Loading timetable…
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(() => {
              const rows: React.ReactNode[] = [];

              const renderInterval = (title: string, time: string, icon: string) => (
                <div
                  key={`interval-${title}-${time}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    borderRadius: 12,
                    border: '1.5px dashed var(--card-border)',
                    background: 'rgba(251, 191, 36, 0.05)',
                    padding: '8px 14px',
                    margin: '2px 0'
                  }}
                >
                  <span style={{ fontSize: 16 }}>{icon}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 12, color: '#b45309' }}>{title}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>({time})</span>
                  </div>
                </div>
              );

              activeDayEntries.forEach(({ period, entry }) => {
                const subject = entry?.subject || '—';
                const teacher = entry?.teacher || '';
                const colors = hashColor(subject);
                const isEditing = editCell?.day === activeDay && editCell?.period === period;

                rows.push(
                  <div
                    key={period}
                    onClick={() => openEdit(activeDay, period)}
                    style={{
                      display: 'flex',
                      alignItems: 'stretch',
                      gap: 0,
                      borderRadius: 12,
                      overflow: 'hidden',
                      border: `1.5px solid ${editMode ? colors.border + '80' : 'var(--card-border)'}`,
                      background: 'var(--bg-primary)',
                      cursor: editMode ? 'pointer' : 'default',
                      transition: 'all 0.18s ease',
                      boxShadow: isEditing ? `0 0 0 2px ${colors.border}` : '0 1px 4px rgba(0,0,0,0.04)',
                    }}
                  >
                    {/* Period Number Column */}
                    <div style={{
                      width: 44,
                      flexShrink: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: colors.bg,
                      borderRight: `2px solid ${colors.border}30`,
                      padding: '10px 4px',
                    }}>
                      <span style={{ fontSize: 14, fontWeight: 900, color: colors.text }}>
                        P{period}
                      </span>
                      <span style={{ fontSize: 8, color: 'var(--text-muted)', marginTop: 2, textAlign: 'center', lineHeight: 1.2 }}>
                        {PERIOD_TIMES[period]}
                      </span>
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, padding: '10px 12px' }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }} onClick={e => e.stopPropagation()}>
                          <input
                            value={editSubject}
                            onChange={e => setEditSubject(e.target.value)}
                            placeholder="Subject name"
                            autoFocus
                            style={{
                              width: '100%', padding: '5px 8px', borderRadius: 8, border: '1.5px solid var(--accent-blue)',
                              fontSize: 12, fontWeight: 700, background: 'var(--bg-secondary)', color: 'var(--text-main)', outline: 'none'
                            }}
                          />
                          <input
                            value={editTeacher}
                            onChange={e => setEditTeacher(e.target.value)}
                            placeholder="Teacher name (optional)"
                            style={{
                              width: '100%', padding: '5px 8px', borderRadius: 8, border: '1.5px solid var(--card-border)',
                              fontSize: 11, background: 'var(--bg-secondary)', color: 'var(--text-muted)', outline: 'none'
                            }}
                          />
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              onClick={saveCell}
                              disabled={saving}
                              style={{ flex: 1, padding: '5px 0', borderRadius: 8, background: 'var(--accent-blue)', color: '#fff', border: 'none', fontWeight: 700, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                            >
                              <Check size={12} /> {saving ? 'Saving…' : 'Save'}
                            </button>
                            <button
                              onClick={e => { e.stopPropagation(); setEditCell(null); }}
                              style={{ padding: '5px 10px', borderRadius: 8, background: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1.5px solid var(--card-border)', fontSize: 11, cursor: 'pointer' }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-main)', marginBottom: teacher ? 4 : 0 }}>
                            {subject}
                          </div>
                          {teacher && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                              <User size={11} />
                              {teacher}
                            </div>
                          )}
                          {!entry && (
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                              {editMode ? 'Tap to add' : 'Free period'}
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Edit indicator */}
                    {editMode && !isEditing && (
                      <div style={{ display: 'flex', alignItems: 'center', padding: '0 10px', color: 'var(--text-muted)' }}>
                        <Pencil size={12} />
                      </div>
                    )}
                  </div>
                );

                // Insert intervals after specific periods
                if (period === 2) {
                  rows.push(renderInterval('TEA BREAK', '9:40–9:55', '☕'));
                } else if (period === 4) {
                  rows.push(renderInterval('LUNCH BREAK', '11:35–12:15', '🍱'));
                } else if (period === 6) {
                  rows.push(renderInterval('TEA BREAK', '1:55–2:10', '☕'));
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
    </div>
  );
};
