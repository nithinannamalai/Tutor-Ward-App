import React, { useState, useEffect } from 'react';
import { dbService } from '../services/db';
import type { Student, AttendanceLog } from '../services/db';
import { ArrowLeft, Check, X, ClipboardCheck } from 'lucide-react';

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
  // Common states
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Student view states
  const [logs, setLogs] = useState<AttendanceLog[]>([]);

  // Teacher view states
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [period, setPeriod] = useState<number>(1);
  const [students, setStudents] = useState<Student[]>([]);
  const [markedStatus, setMarkedStatus] = useState<Record<string, 'present' | 'absent'>>({});

  useEffect(() => {
    loadData();
  }, [currentStudentRollNo, isAdmin, date, period]);

  const loadData = async () => {
    setLoading(true);
    if (isAdmin) {
      // Load all students to mark attendance
      const list = await dbService.fetchAllStudents();
      setStudents(list);
      
      // Initialize markedStatus (default to present for all)
      const initial: Record<string, 'present' | 'absent'> = {};
      list.forEach(s => {
        initial[s.rollNo] = 'present';
      });
      setMarkedStatus(initial);
    } else {
      // Load attendance logs for student
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

  const handleSaveAttendance = async () => {
    setLoading(true);
    setSuccessMsg('');
    
    // Prepare logs
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
      setSuccessMsg('Attendance marked successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setSuccessMsg('Error saving attendance.');
    } finally {
      setLoading(false);
    }
  };

  // Student attendance calculation
  const totalPeriods = logs.length;
  const presentPeriods = logs.filter(l => l.status === 'present').length;
  const percentage = totalPeriods > 0 ? Math.round((presentPeriods / totalPeriods) * 100) : 100;

  // Period-wise stats calculation
  const periodStats = [1, 2, 3, 4, 5, 6, 7].map(p => {
    const pLogs = logs.filter(l => l.period === p);
    const pTotal = pLogs.length;
    const pPresent = pLogs.filter(l => l.status === 'present').length;
    const pPct = pTotal > 0 ? Math.round((pPresent / pTotal) * 100) : 100;
    return { period: p, pct: pPct, total: pTotal };
  });

  return (
    <div className="panel-view">
      <div className="panel-header">
        <button onClick={onBack} className="back-btn">
          <ArrowLeft size={20} />
        </button>
        <span className="panel-title">Period-wise Attendance</span>
      </div>

      <div className="panel-body">
        {successMsg && (
          <div style={{ padding: 10, background: 'var(--bg-secondary)', color: 'var(--accent-gold)', borderRadius: 8, fontSize: 12, textAlign: 'center', fontWeight: 'bold' }}>
            {successMsg}
          </div>
        )}

        {/* ====================================================
            TEACHER / ADMIN ATTENDANCE MARKING VIEW
           ==================================================== */}
        {isAdmin ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 12, border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={e => setDate(e.target.value)} 
                  className="form-input" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Period</label>
                <select 
                  value={period} 
                  onChange={e => setPeriod(Number(e.target.value))} 
                  className="form-select"
                >
                  <option value={1}>Period 1 (08:30 AM - 09:30 AM)</option>
                  <option value={2}>Period 2 (09:30 AM - 10:30 AM)</option>
                  <option value={3}>Period 3 (10:45 AM - 11:45 AM)</option>
                  <option value={4}>Period 4 (11:45 AM - 12:45 PM)</option>
                  <option value={5}>Period 5 (01:45 PM - 02:45 PM)</option>
                  <option value={6}>Period 6 (02:45 PM - 03:45 PM)</option>
                  <option value={7}>Period 7 (03:45 PM - 04:45 PM)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
              <h4 style={{ fontSize: 13, fontWeight: '700' }}>Student List ({students.length})</h4>
              <div style={{ display: 'flex', gap: 6 }}>
                <button 
                  onClick={() => {
                    const allP: Record<string, 'present'> = {};
                    students.forEach(s => { allP[s.rollNo] = 'present'; });
                    setMarkedStatus(allP as any);
                  }}
                  className="btn-secondary" 
                  style={{ padding: '2px 6px', fontSize: 10 }}
                >
                  All Present
                </button>
                <button 
                  onClick={() => {
                    const allA: Record<string, 'absent'> = {};
                    students.forEach(s => { allA[s.rollNo] = 'absent'; });
                    setMarkedStatus(allA as any);
                  }}
                  className="btn-secondary" 
                  style={{ padding: '2px 6px', fontSize: 10 }}
                >
                  All Absent
                </button>
              </div>
            </div>

            <div className="attendance-mark-list">
              {students.map(s => (
                <div key={s.rollNo} className="attendance-mark-item">
                  <div className="student-info-mini">
                    <h4>{s.name}</h4>
                    <p>Roll No: {s.rollNo}</p>
                  </div>

                  <div className="attendance-switch-group">
                    <button
                      className={`attendance-switch-btn ${markedStatus[s.rollNo] === 'present' ? 'active p' : ''}`}
                      onClick={() => handleStatusChange(s.rollNo, 'present')}
                    >
                      P
                    </button>
                    <button
                      className={`attendance-switch-btn ${markedStatus[s.rollNo] === 'absent' ? 'active a' : ''}`}
                      onClick={() => handleStatusChange(s.rollNo, 'absent')}
                    >
                      A
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={handleSaveAttendance} 
              className="btn-primary" 
              style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              disabled={loading || students.length === 0}
            >
              <ClipboardCheck size={18} />
              {loading ? 'Submitting...' : 'Submit Attendance'}
            </button>
          </div>
        ) : (
          /* ====================================================
              STUDENT ATTENDANCE VIEW
             ==================================================== */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Visual Ring Summary */}
            <div className="attendance-summary">
              <div className="attendance-circle" style={{ '--percentage': percentage } as React.CSSProperties}>
                <div className="attendance-circle-inner">
                  <span className="pct">{percentage}%</span>
                  <span className="lbl">Overall</span>
                </div>
              </div>
              <div className="attendance-stats">
                <div className="stat-row">
                  <div className="indicator-dot present" />
                  <span>Attended: <strong>{presentPeriods}</strong> periods</span>
                </div>
                <div className="stat-row">
                  <div className="indicator-dot absent" />
                  <span>Missed: <strong>{totalPeriods - presentPeriods}</strong> periods</span>
                </div>
                <div className="stat-row" style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                  <span>Total logged periods: {totalPeriods}</span>
                </div>
              </div>
            </div>

            {/* Period-wise Performance */}
            <div>
              <h4 style={{ fontSize: 13, fontWeight: '700', marginBottom: 8 }}>Period-wise Breakdown</h4>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: 12, border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {periodStats.map(stat => (
                  <div key={stat.period} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                    <span>Period {stat.period}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 100, height: 6, background: 'var(--bg-tertiary)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${stat.pct}%`, height: '100%', background: stat.pct >= 75 ? 'var(--accent-blue)' : '#ef4444', borderRadius: 3 }} />
                      </div>
                      <span style={{ fontWeight: '700', width: 34, textAlign: 'right' }}>{stat.pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Log History */}
            <div>
              <h4 style={{ fontSize: 13, fontWeight: '700', marginBottom: 8 }}>Attendance History</h4>
              <div className="document-list">
                {logs.length === 0 ? (
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
                    No attendance logs found for your Roll Number.
                  </p>
                ) : (
                  [...logs].reverse().map(log => (
                    <div key={log.id} className="document-item" style={{ padding: '8px 12px' }}>
                      <div className="doc-info">
                        <span className="doc-name" style={{ fontSize: 12 }}>{log.date}</span>
                        <span className="doc-meta">Period {log.period} | Marked by {log.markedBy}</span>
                      </div>
                      <div>
                        {log.status === 'present' ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#4ade80', fontSize: 11, fontWeight: '700' }}>
                            <Check size={14} /> Present
                          </span>
                        ) : (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f87171', fontSize: 11, fontWeight: '700' }}>
                            <X size={14} /> Absent
                          </span>
                        )}
                      </div>
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
