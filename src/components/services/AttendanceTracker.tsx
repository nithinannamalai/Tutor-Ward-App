import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/db';
import type { Student, AttendanceLog } from '../../services/db';
import {
  ArrowLeft, Check, X, ClipboardCheck, ShieldCheck,
  AlertTriangle, Calendar, Search
} from 'lucide-react';

interface AttendanceTrackerProps {
  currentStudentRollNo: string;
  currentUserName: string;
  isAdmin: boolean;
  onBack: () => void;
}

export const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({
  currentStudentRollNo,
  currentUserName,
  isAdmin,
  onBack
}) => {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [logs, setLogs] = useState<AttendanceLog[]>([]);

  // Teacher view states
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [period, setPeriod] = useState<number>(1);
  const [students, setStudents] = useState<Student[]>([]);
  const [markedStatus, setMarkedStatus] = useState<Record<string, 'present' | 'absent'>>({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, [currentStudentRollNo, isAdmin, date, period]);

  const loadData = async () => {
    setLoading(true);
    if (isAdmin) {
      const list = await dbService.fetchAllStudents();
      setStudents(list);
      const initial: Record<string, 'present' | 'absent'> = {};
      list.forEach(s => {
        initial[s.rollNo] = 'present';
      });
      setMarkedStatus(initial);
    } else {
      const studentLogs = await dbService.getAttendanceForStudent(currentStudentRollNo);
      setLogs(studentLogs);
    }
    setLoading(false);
  };

  const handleStatusChange = (rollNo: string, status: 'present' | 'absent') => {
    setMarkedStatus(prev => ({
      ...prev,
      [rollNo]: status
    }));
  };

  const handleMarkAll = (status: 'present' | 'absent') => {
    const updated: Record<string, 'present' | 'absent'> = {};
    students.forEach(s => {
      updated[s.rollNo] = status;
    });
    setMarkedStatus(updated);
  };

  const handleSaveAttendance = async () => {
    setLoading(true);
    setSuccessMsg('');

    const logsToSave = students.map(s => ({
      date,
      period,
      studentRollNo: s.rollNo,
      studentName: s.name,
      status: markedStatus[s.rollNo] || 'present',
      markedBy: currentUserName
    }));

    try {
      await dbService.saveAttendanceLogs(date, period, logsToSave);
      setSuccessMsg('✅ Period attendance recorded successfully!');
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      console.error(err);
      setSuccessMsg('❌ Error saving attendance.');
    } finally {
      setLoading(false);
    }
  };

  // Calculations
  const totalPeriods = logs.length;
  const presentPeriods = logs.filter(l => l.status === 'present').length;
  const missedPeriods = totalPeriods - presentPeriods;
  const percentage = totalPeriods > 0 ? Math.round((presentPeriods / totalPeriods) * 100) : 100;

  // Safe buffer calculation (Target 75%)
  const safeBuffer = totalPeriods > 0 ? Math.max(0, Math.floor((presentPeriods - 0.75 * totalPeriods) / 0.75)) : 0;
  const requiredToAttend = percentage < 75 ? Math.ceil((0.75 * totalPeriods - presentPeriods) / 0.25) : 0;

  const periodStats = [
    { period: 1, time: '08:30 – 09:30', name: 'Electrical Machines' },
    { period: 2, time: '09:30 – 10:30', name: 'Power Systems I' },
    { period: 3, time: '10:45 – 11:45', name: 'Control Systems' },
    { period: 4, time: '11:45 – 12:45', name: 'Power Electronics' },
    { period: 5, time: '01:45 – 02:45', name: 'Renewable Energy' },
    { period: 6, time: '02:45 – 03:45', name: 'Microcontrollers Lab' },
    { period: 7, time: '03:45 – 04:45', name: 'Tutor Ward / Library' },
  ].map(item => {
    const pLogs = logs.filter(l => l.period === item.period);
    const pTotal = pLogs.length;
    const pPresent = pLogs.filter(l => l.status === 'present').length;
    const pPct = pTotal > 0 ? Math.round((pPresent / pTotal) * 100) : 100;
    return { ...item, pct: pPct, total: pTotal, attended: pPresent };
  });

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.rollNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dedicated-page-view page-slide-enter" style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 88 }}>
      {/* Header */}
      <div className="dedicated-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="page-back-btn" onClick={onBack} title="Go Back">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="dedicated-page-title" style={{ display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
              📊 Academic Attendance Radar
            </h2>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {isAdmin ? 'Faculty Attendance Management Portal' : `Student ID: ${currentStudentRollNo || '7377221EE101'}`}
            </span>
          </div>
        </div>

        <div style={{
          padding: '6px 12px',
          borderRadius: 20,
          background: percentage >= 75 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
          color: percentage >= 75 ? '#059669' : '#dc2626',
          fontWeight: 800,
          fontSize: 11.5,
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          {percentage >= 75 ? <ShieldCheck size={14} /> : <AlertTriangle size={14} />}
          {percentage >= 75 ? 'Eligibility Safe' : 'Condonation Alert'}
        </div>
      </div>

      <div style={{ padding: '16px', maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {successMsg && (
          <div style={{ padding: 12, background: '#f0fdf4', color: '#166534', border: '1.5px solid #86efac', borderRadius: 16, fontSize: 12.5, fontWeight: 800, textAlign: 'center', boxShadow: '0 4px 12px rgba(22, 101, 52, 0.08)' }}>
            {successMsg}
          </div>
        )}

        {/* ====================================================
            FACULTY ATTENDANCE MARKING CONSOLE
           ==================================================== */}
        {isAdmin ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Faculty Control Bar */}
            <div style={{ background: '#ffffff', borderRadius: 24, padding: 18, border: '1.5px solid rgba(0,82,204,0.12)', boxShadow: '0 8px 24px rgba(0,82,204,0.04)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div>
                  <label className="form-label" style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-main)', marginBottom: 4, display: 'block' }}>Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="form-input"
                    style={{ fontSize: 12, padding: '10px 12px', borderRadius: 14 }}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-main)', marginBottom: 4, display: 'block' }}>Period Slot</label>
                  <select
                    value={period}
                    onChange={e => setPeriod(Number(e.target.value))}
                    className="modern-cert-select"
                    style={{ padding: '10px 12px', borderRadius: 14, fontSize: 12 }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map(p => (
                      <option key={p} value={p}>Period {p} ({p === 1 ? '08:30-09:30' : p === 2 ? '09:30-10:30' : p === 3 ? '10:45-11:45' : p === 4 ? '11:45-12:45' : p === 5 ? '01:45-02:45' : p === 6 ? '02:45-03:45' : '03:45-04:45'})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick Filters and Bulk Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, paddingTop: 10, borderTop: '1px solid rgba(0,82,204,0.08)' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={14} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search student or roll no..."
                    style={{ width: '100%', padding: '8px 12px 8px 34px', borderRadius: 12, border: '1.5px solid #cbd5e1', fontSize: 11.5, outline: 'none', background: '#f8fafc' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => handleMarkAll('present')}
                    style={{ padding: '8px 12px', borderRadius: 12, background: 'rgba(16, 185, 129, 0.12)', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: 800, fontSize: 11, cursor: 'pointer' }}
                  >
                    All Present
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMarkAll('absent')}
                    style={{ padding: '8px 12px', borderRadius: 12, background: 'rgba(239, 68, 68, 0.12)', color: '#dc2626', border: '1px solid rgba(239, 68, 68, 0.3)', fontWeight: 800, fontSize: 11, cursor: 'pointer' }}
                  >
                    All Absent
                  </button>
                </div>
              </div>
            </div>

            {/* Students Marking List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredStudents.map(s => {
                const isPresent = markedStatus[s.rollNo] === 'present';
                return (
                  <div
                    key={s.rollNo}
                    style={{
                      background: '#ffffff',
                      borderRadius: 18,
                      padding: '12px 16px',
                      border: '1.5px solid',
                      borderColor: isPresent ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        background: isPresent ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: 14
                      }}>
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: 13, fontWeight: 800, color: 'var(--text-main)' }}>{s.name}</h4>
                        <span style={{ fontSize: 10.5, color: 'var(--text-muted)', fontWeight: 600 }}>Roll: {s.rollNo} · Sec {(s as any).className || 'A'}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 6, background: '#f1f5f9', padding: 4, borderRadius: 14 }}>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(s.rollNo, 'present')}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 10,
                          border: 'none',
                          background: isPresent ? '#10b981' : 'transparent',
                          color: isPresent ? '#ffffff' : '#64748b',
                          fontWeight: 800,
                          fontSize: 11.5,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Present
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(s.rollNo, 'absent')}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 10,
                          border: 'none',
                          background: !isPresent ? '#ef4444' : 'transparent',
                          color: !isPresent ? '#ffffff' : '#64748b',
                          fontWeight: 800,
                          fontSize: 11.5,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Absent
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Save Attendance Submit CTA */}
            <button
              onClick={handleSaveAttendance}
              disabled={loading || students.length === 0}
              className="btn-primary"
              style={{
                padding: '14px',
                borderRadius: 18,
                fontSize: 14,
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 8px 24px rgba(0,82,204,0.35)',
                marginTop: 8
              }}
            >
              <ClipboardCheck size={18} /> {loading ? 'Submitting Records...' : 'Save & Lock Attendance'}
            </button>
          </div>
        ) : (
          /* ====================================================
              STUDENT LUXURY ATTENDANCE RADAR VIEW
             ==================================================== */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Hero Attendance Radar Card */}
            <div style={{
              background: 'linear-gradient(135deg, #0052cc 0%, #1e40af 100%)',
              borderRadius: 28,
              padding: '24px 20px',
              color: '#ffffff',
              boxShadow: '0 16px 36px rgba(0, 82, 204, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Background ambient glow circle */}
              <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)' }} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                {/* Glowing SVG Donut Gauge */}
                <div style={{ position: 'relative', width: 110, height: 110, flexShrink: 0 }}>
                  <svg width="110" height="110" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="rgba(255,255,255,0.15)"
                      strokeWidth="10"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#38bdf8"
                      strokeWidth="10"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - percentage / 100)}`}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                      style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                    />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.5 }}>{percentage}%</span>
                    <span style={{ fontSize: 9.5, opacity: 0.8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Overall</span>
                  </div>
                </div>

                {/* KPI Metrics */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.12)', padding: '8px 12px', borderRadius: 12 }}>
                    <span style={{ fontSize: 11.5, opacity: 0.85 }}>Attended Periods</span>
                    <span style={{ fontSize: 13, fontWeight: 900 }}>{presentPeriods} hrs</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.12)', padding: '8px 12px', borderRadius: 12 }}>
                    <span style={{ fontSize: 11.5, opacity: 0.85 }}>Missed / OD</span>
                    <span style={{ fontSize: 13, fontWeight: 900, color: '#fca5a5' }}>{missedPeriods} hrs</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.12)', padding: '8px 12px', borderRadius: 12 }}>
                    <span style={{ fontSize: 11.5, opacity: 0.85 }}>Total Logged</span>
                    <span style={{ fontSize: 13, fontWeight: 900 }}>{totalPeriods} hrs</span>
                  </div>
                </div>
              </div>

              {/* Status Banner */}
              <div style={{ marginTop: 16, background: 'rgba(0,0,0,0.2)', padding: '10px 14px', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>{percentage >= 75 ? '🎉' : '⚠️'}</span>
                <p style={{ margin: 0, fontSize: 11.5, fontWeight: 700, lineHeight: 1.35 }}>
                  {percentage >= 75
                    ? `Eligible for semester examinations. You have a buffer of ${safeBuffer} periods without dropping below 75%.`
                    : `Attendance shortage! You must attend ${requiredToAttend} consecutive classes to reach the 75% exam cutoff.`}
                </p>
              </div>
            </div>

            {/* Period-wise Performance Cards */}
            <div style={{ background: '#ffffff', borderRadius: 24, padding: 18, border: '1.5px solid rgba(0,82,204,0.12)', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
              <h4 style={{ fontSize: 13.5, fontWeight: 900, color: 'var(--text-main)', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                🕒 Daily Period Slot Mastery
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {periodStats.map(stat => (
                  <div
                    key={stat.period}
                    style={{
                      background: '#f8fafc',
                      borderRadius: 16,
                      padding: '10px 14px',
                      border: '1px solid rgba(0,82,204,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                        <span style={{ fontSize: 10, fontWeight: 900, background: 'rgba(0,82,204,0.1)', color: 'var(--accent-blue)', padding: '2px 6px', borderRadius: 6 }}>
                          P{stat.period}
                        </span>
                        <span style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {stat.name}
                        </span>
                      </div>
                      <span style={{ fontSize: 10.5, color: '#64748b' }}>{stat.time}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 80, height: 7, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${stat.pct}%`,
                            height: '100%',
                            background: stat.pct >= 85 ? '#10b981' : stat.pct >= 75 ? '#0052cc' : '#ef4444',
                            borderRadius: 4
                          }}
                        />
                      </div>
                      <span style={{ fontWeight: 900, fontSize: 12, color: stat.pct >= 75 ? 'var(--text-main)' : '#ef4444', width: 36, textAlign: 'right' }}>
                        {stat.pct}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Attendance History Feed */}
            <div style={{ background: '#ffffff', borderRadius: 24, padding: 18, border: '1.5px solid rgba(0,82,204,0.12)', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
              <h4 style={{ fontSize: 13.5, fontWeight: 900, color: 'var(--text-main)', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                📜 Official Attendance Logs
              </h4>

              {logs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                  <Calendar size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
                  <p style={{ fontSize: 12, margin: 0 }}>No attendance logs recorded for this semester yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[...logs].reverse().map(log => (
                    <div
                      key={log.id}
                      style={{
                        background: '#f8fafc',
                        borderRadius: 14,
                        padding: '10px 14px',
                        border: '1px solid rgba(0,82,204,0.08)',
                        borderLeft: `4px solid ${log.status === 'present' ? '#10b981' : '#ef4444'}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <span style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--text-main)', display: 'block' }}>
                          {log.date} · Period {log.period}
                        </span>
                        <span style={{ fontSize: 10.5, color: '#64748b' }}>
                          Verified by {log.markedBy}
                        </span>
                      </div>

                      <span style={{
                        padding: '4px 10px',
                        borderRadius: 12,
                        fontSize: 11,
                        fontWeight: 800,
                        background: log.status === 'present' ? '#dcfce7' : '#fee2e2',
                        color: log.status === 'present' ? '#166534' : '#991b1b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}>
                        {log.status === 'present' ? <Check size={12} /> : <X size={12} />}
                        {log.status === 'present' ? 'Present' : 'Absent'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
