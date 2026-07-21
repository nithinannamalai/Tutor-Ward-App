import React from 'react';
import { User, Sparkles, Award, GraduationCap, UserCheck, ChevronRight, ShieldCheck } from 'lucide-react';

interface StudentDetailsCardProps {
  isAuthenticated: boolean;
  currentUser: { email: string; name: string; rollNo: string; role: string } | null;
  onOpenProfile: () => void;
  onOpenSignIn: () => void;
  onOpenTab: (tabKey: string) => void;
}

export const StudentDetailsCard: React.FC<StudentDetailsCardProps> = ({
  isAuthenticated,
  currentUser,
  onOpenProfile,
  onOpenSignIn,
  onOpenTab
}) => {
  const isAdmin = currentUser?.role === 'teacher';

  return (
    <div className="student-details-above-notice">
      <div className="student-card-inner">
        {/* Top User Info Row */}
        <div className="student-info-top">
          <div className="student-profile-left">
            <div className="student-avatar-badge">
              {isAuthenticated && currentUser ? (
                currentUser.name.charAt(0)
              ) : (
                <User size={22} />
              )}
              <span className="student-online-dot" />
            </div>

            <div className="student-identity-text">
              <div className="student-name-row">
                <h3>{isAuthenticated && currentUser ? currentUser.name : 'Guest Scholar'}</h3>
                <span className={`student-status-chip ${isAdmin ? 'admin' : 'student'}`}>
                  <ShieldCheck size={11} />
                  {isAuthenticated ? (isAdmin ? 'Faculty Admin' : 'UG Scholar') : 'Demo Guest'}
                </span>
              </div>
              <p className="student-dept-sub">
                {isAuthenticated && currentUser
                  ? `Roll: ${currentUser.rollNo} · Dept of EEE (Sem VI)`
                  : 'Sri Ramakrishna Engineering College · EEE Dept'}
              </p>
            </div>
          </div>

          {!isAuthenticated ? (
            <button className="student-signin-cta" onClick={onOpenSignIn}>
              <span>Sign In</span>
              <ChevronRight size={14} />
            </button>
          ) : (
            <button className="student-vault-cta" onClick={onOpenProfile}>
              <span>Doc Vault</span>
              <ChevronRight size={14} />
            </button>
          )}
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
