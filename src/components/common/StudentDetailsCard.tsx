import React, { useState, useEffect } from 'react';
import { Sparkles, Award, GraduationCap, UserCheck, ChevronRight, ShieldCheck, BookOpen, Calendar, Hash, Layers } from 'lucide-react';
import type { UserProfile } from '../../App';
import { dbService } from '../../services/db';

interface StudentDetailsCardProps {
  isAuthenticated: boolean;
  currentUser: UserProfile | null;
  onOpenProfile: () => void;
  onOpenSignIn: () => void;
  onOpenTab: (tabKey: string) => void;
}

export const StudentDetailsCard: React.FC<StudentDetailsCardProps> = ({
  currentUser,
  onOpenProfile,
  onOpenTab
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isAdmin = currentUser?.role === 'teacher';

  const name = currentUser?.name || 'Nithin Annamalai';
  const rollNo = currentUser?.rollNo || '7377221EE001';
  const className = currentUser?.className || 'III EEE-A';
  const yearOfStudy = currentUser?.yearOfStudy || '3rd Year';
  const semester = currentUser?.semester || 'Sem VI';
  const department = currentUser?.department || 'Dept of EEE';

  const [dbMetrics, setDbMetrics] = useState({
    attendance: '85%',
    cgpa: '8.9',
    nptelCerts: '2 Certs',
    arrears: '0'
  });

  useEffect(() => {
    let isMounted = true;
    const fetchDbData = async () => {
      const email = currentUser?.email || 'student@eee.com';
      const studentRoll = currentUser?.rollNo || '7377221EE001';

      try {
        const profile = await dbService.getStudentProfile(email);
        if (profile && isMounted) {
          const semKeys = Object.keys(profile.cgpa).map(Number).sort((a, b) => b - a);
          const latestSem = semKeys[0];
          const latestCgpa = latestSem ? profile.cgpa[latestSem]?.gpa || 8.9 : 8.9;

          setDbMetrics(prev => ({
            ...prev,
            cgpa: String(latestCgpa),
            arrears: String(profile.arrears ?? 0),
            nptelCerts: `${profile.nptelExams?.length || 0} Certs`
          }));
        }

        const logs = await dbService.getAttendanceForStudent(studentRoll);
        if (logs && logs.length > 0 && isMounted) {
          const present = logs.filter(l => l.status === 'present').length;
          const percentage = Math.round((present / logs.length) * 100);
          setDbMetrics(prev => ({ ...prev, attendance: `${percentage}%` }));
        }
      } catch (err) {
        console.warn('Failed to load DB metrics in StudentDetailsCard:', err);
      }
    };

    fetchDbData();
    return () => { isMounted = false; };
  }, [currentUser]);

  return (
    <div className="student-details-above-notice">
      <div className="student-card-inner">
        {/* Top Header Info Row */}
        <div className="student-info-top">
          <div className="student-profile-left">
            <div 
              className="student-avatar-badge" 
              onClick={() => setIsExpanded(prev => !prev)}
              style={{ 
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                borderColor: 'rgba(255, 255, 255, 0.7)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              title="Click to view full info"
            >
              {name.charAt(0)}
              <span className="student-online-dot" />
            </div>

            <div className="student-identity-text">
              <div className="student-name-row">
                <h3 className="student-full-name">{name}</h3>
                {isExpanded && (
                  <span className={`student-status-chip ${isAdmin ? 'admin' : 'student'}`}>
                    <ShieldCheck size={10} />
                    {isAdmin ? 'Faculty Admin' : 'UG Scholar'}
                  </span>
                )}
              </div>
              {isExpanded && (
                <p className="student-dept-tag">{department} · Sri Ramakrishna Eng. College</p>
              )}
            </div>
          </div>

          <button className="student-vault-cta" onClick={onOpenProfile} aria-label="Open Document Vault">
            <span>Doc Vault</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* 🎓 Clean Student Info Chips */}
        {!isAdmin && (
          <div className="student-details-grid">
            <div className="detail-chip">
              <Hash size={12} className="detail-icon" />
              <span className="detail-label">Roll:</span>
              <span className="detail-value">{rollNo}</span>
            </div>

            <div className="detail-chip">
              <Layers size={12} className="detail-icon" />
              <span className="detail-label">Class:</span>
              <span className="detail-value">{className}</span>
            </div>

            <div className="detail-chip">
              <Calendar size={12} className="detail-icon" />
              <span className="detail-label">Year:</span>
              <span className="detail-value">{yearOfStudy}</span>
            </div>

            {isExpanded && (
              <div className="detail-chip">
                <BookOpen size={12} className="detail-icon" />
                <span className="detail-label">Sem:</span>
                <span className="detail-value">{semester}</span>
              </div>
            )}
          </div>
        )}

        {/* 4 Stat Metrics Grid from DB */}
        {!isAdmin && isExpanded && (
          <div className="student-metrics-row" style={{ animation: 'fadeIn 0.2s ease-in-out' }}>
            <div className="student-metric-pill" onClick={() => onOpenTab('attendance')}>
              <div className="metric-icon-wrap attendance">
                <UserCheck size={14} />
              </div>
              <div className="metric-text font-wrap">
                <span className="metric-val">{dbMetrics.attendance}</span>
                <span className="metric-lbl">Attendance</span>
              </div>
            </div>

            <div className="student-metric-pill" onClick={() => onOpenTab('academics')}>
              <div className="metric-icon-wrap cgpa">
                <GraduationCap size={14} />
              </div>
              <div className="metric-text font-wrap">
                <span className="metric-val">{dbMetrics.cgpa}</span>
                <span className="metric-lbl">CGPA</span>
              </div>
            </div>

            <div className="student-metric-pill" onClick={() => onOpenTab('nptel')}>
              <div className="metric-icon-wrap nptel">
                <Award size={14} />
              </div>
              <div className="metric-text font-wrap">
                <span className="metric-val">{dbMetrics.nptelCerts}</span>
                <span className="metric-lbl">NPTEL</span>
              </div>
            </div>

            <div className="student-metric-pill" onClick={() => onOpenTab('academics')}>
              <div className="metric-icon-wrap arrears">
                <Sparkles size={14} />
              </div>
              <div className="metric-text font-wrap">
                <span className="metric-val">{dbMetrics.arrears}</span>
                <span className="metric-lbl">Arrears</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

