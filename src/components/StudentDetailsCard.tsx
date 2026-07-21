import React from 'react';
import { Sparkles, Award, GraduationCap, UserCheck, ChevronRight, ShieldCheck, BookOpen, Calendar, Hash, Layers } from 'lucide-react';
import type { UserProfile } from '../App';

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

  return (
    <div className="student-details-above-notice">
      <div className="student-card-inner">
        {/* Top Header Info Row */}
        <div className="student-info-top">
          <div className="student-profile-left">
            <div className="student-avatar-badge">
              {name.charAt(0)}
              <span className="student-online-dot" />
            </div>

            <div className="student-identity-text">
              <div className="student-name-row">
                <h3 className="student-full-name">{name}</h3>
                <span className={`student-status-chip ${isAdmin ? 'admin' : 'student'}`}>
                  <ShieldCheck size={10} />
                  {isAdmin ? 'Faculty Admin' : 'UG Scholar'}
                </span>
              </div>
              <p className="student-dept-tag">{department} · Sri Ramakrishna Eng. College</p>
            </div>
          </div>

          <button className="student-vault-cta" onClick={onOpenProfile} aria-label="Open Document Vault">
            <span>Doc Vault</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* 🎓 Clean 5-Field Student Info Chips (Name, Roll No, Class, Year of Study, Sem - Auto-adjusts to screen size) */}
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

          <div className="detail-chip">
            <BookOpen size={12} className="detail-icon" />
            <span className="detail-label">Sem:</span>
            <span className="detail-value">{semester}</span>
          </div>
        </div>

        {/* 4 Stat Metrics Grid */}
        <div className="student-metrics-row">
          <div className="student-metric-pill" onClick={() => onOpenTab('attendance')}>
            <div className="metric-icon-wrap attendance">
              <UserCheck size={14} />
            </div>
            <div className="metric-text font-wrap">
              <span className="metric-val">85%</span>
              <span className="metric-lbl">Attendance</span>
            </div>
          </div>

          <div className="student-metric-pill" onClick={() => onOpenTab('academics')}>
            <div className="metric-icon-wrap cgpa">
              <GraduationCap size={14} />
            </div>
            <div className="metric-text font-wrap">
              <span className="metric-val">8.9</span>
              <span className="metric-lbl">CGPA</span>
            </div>
          </div>

          <div className="student-metric-pill" onClick={() => onOpenTab('nptel')}>
            <div className="metric-icon-wrap nptel">
              <Award size={14} />
            </div>
            <div className="metric-text font-wrap">
              <span className="metric-val">2 Certs</span>
              <span className="metric-lbl">NPTEL</span>
            </div>
          </div>

          <div className="student-metric-pill" onClick={() => onOpenTab('academics')}>
            <div className="metric-icon-wrap arrears">
              <Sparkles size={14} />
            </div>
            <div className="metric-text font-wrap">
              <span className="metric-val">0</span>
              <span className="metric-lbl">Arrears</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
