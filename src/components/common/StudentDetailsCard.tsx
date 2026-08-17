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
  const isAdmin = currentUser?.role === 'teacher';

  const name = currentUser?.name || 'Nithin Annamalai';
  const rollNo = currentUser?.rollNo || '7377221EE001';
  const className = currentUser?.className || 'III EEE-A';
  const yearOfStudy = currentUser?.yearOfStudy || '3rd Year';
  const semester = currentUser?.semester || 'Sem VI';
  const department = currentUser?.department || 'Dept of EEE';

  const [dbMetrics, setDbMetrics] = useState({
    attendance: '88.5%',
    cgpa: '8.75',
    nptelCerts: '2 Exams',
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
          const latestCgpa = latestSem ? profile.cgpa[latestSem]?.gpa || 8.75 : 8.75;

          setDbMetrics(prev => ({
            ...prev,
            cgpa: String(latestCgpa),
            arrears: String(profile.arrears ?? 0),
            nptelCerts: `${profile.nptelExams?.length || 2} Exams`
          }));
        }

        const logs = await dbService.getAttendanceForStudent(studentRoll);
        if (logs && logs.length > 0 && isMounted) {
          const present = logs.filter(l => l.status === 'present').length;
          const percentage = Math.round((present / logs.length) * 100);
          setDbMetrics(prev => ({ ...prev, attendance: `${percentage}%` }));
        }
      } catch (e) {
        console.warn('Student card db sync fallback:', e);
      }
    };

    fetchDbData();
    return () => { isMounted = false; };
  }, [currentUser]);

  return (
    <div className="mobile-vip-student-card">
      {/* Top Identity Header */}
      <div className="vip-card-header">
        <div className="vip-avatar-wrap" onClick={onOpenProfile}>
          <div className="vip-avatar-circle">
            {name.charAt(0)}
          </div>
          <span className="vip-online-badge" />
        </div>

        <div className="vip-user-info">
          <div className="vip-name-row">
            <h2 className="vip-student-name">{name}</h2>
            <span className={`vip-role-tag ${isAdmin ? 'admin' : 'student'}`}>
              <ShieldCheck size={11} /> {isAdmin ? 'Faculty Admin' : 'UG Scholar'}
            </span>
          </div>
          <p className="vip-dept-text">{department} · SREC</p>
        </div>

        <button className="vip-vault-btn" onClick={onOpenProfile} aria-label="Open Document Vault">
          <span>Doc Vault</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Detail Chips Row */}
      {!isAdmin && (
        <div className="vip-chips-row">
          <div className="vip-chip">
            <Hash size={12} className="vip-chip-icon" />
            <span>{rollNo}</span>
          </div>
          <div className="vip-chip">
            <Layers size={12} className="vip-chip-icon" />
            <span>{className}</span>
          </div>
          <div className="vip-chip">
            <Calendar size={12} className="vip-chip-icon" />
            <span>{yearOfStudy} · {semester}</span>
          </div>
        </div>
      )}

      {/* 4 Academic Metrics Grid */}
      {!isAdmin && (
        <div className="vip-metrics-grid">
          <div className="vip-metric-box" onClick={() => onOpenTab('attendance')}>
            <div className="vip-metric-icon" style={{ background: 'rgba(22, 163, 74, 0.2)', color: '#4ade80' }}>
              <UserCheck size={14} />
            </div>
            <div className="vip-metric-data">
              <span className="vip-metric-val">{dbMetrics.attendance}</span>
              <span className="vip-metric-label">Attendance</span>
            </div>
          </div>

          <div className="vip-metric-box" onClick={() => onOpenTab('academics')}>
            <div className="vip-metric-icon" style={{ background: 'rgba(99, 102, 241, 0.25)', color: '#818cf8' }}>
              <GraduationCap size={14} />
            </div>
            <div className="vip-metric-data">
              <span className="vip-metric-val">{dbMetrics.cgpa}</span>
              <span className="vip-metric-label">CGPA</span>
            </div>
          </div>

          <div className="vip-metric-box" onClick={() => onOpenTab('nptel')}>
            <div className="vip-metric-icon" style={{ background: 'rgba(217, 119, 6, 0.2)', color: '#fbbf24' }}>
              <Award size={14} />
            </div>
            <div className="vip-metric-data">
              <span className="vip-metric-val">{dbMetrics.nptelCerts}</span>
              <span className="vip-metric-label">NPTEL</span>
            </div>
          </div>

          <div className="vip-metric-box" onClick={() => onOpenTab('academics')}>
            <div className="vip-metric-icon" style={{ background: 'rgba(236, 72, 153, 0.2)', color: '#f472b6' }}>
              <Sparkles size={14} />
            </div>
            <div className="vip-metric-data">
              <span className="vip-metric-val">{dbMetrics.arrears}</span>
              <span className="vip-metric-label">Arrears</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
