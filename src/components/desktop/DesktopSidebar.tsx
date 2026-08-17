import React from 'react';
import {
  Home, Bell, Sparkles, BookOpen, Calendar, GraduationCap, Award, FileText,
  UserCheck, Map, Inbox, Zap, Shield, Phone, User, LogOut, LogIn, ChevronRight
} from 'lucide-react';
import appLogo from '../../assets/app-logo.png';
import type { UserProfile } from '../../App';

interface DesktopSidebarProps {
  currentTab: string | null;
  activeBottomNav: string;
  onSelectTab: (tabKey: string | null) => void;
  isAuthenticated: boolean;
  currentUser: UserProfile | null;
  onOpenSignIn: () => void;
  onLogout: () => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  currentTab,
  onSelectTab,
  isAuthenticated,
  currentUser,
  onOpenSignIn,
  onLogout
}) => {
  return (
    <aside className="desktop-permanent-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand-header">
        <div style={{ width: 38, height: 38, borderRadius: 10, overflow: 'hidden', border: '1.5px solid rgba(0, 82, 204, 0.2)' }}>
          <img src={appLogo} alt="EEE SREC Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-main)', margin: 0, lineHeight: 1.1 }}>EEE SREC</h2>
          <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Smart Academic Hub</span>
        </div>
      </div>

      {/* User Mini Profile Card */}
      <div className="sidebar-user-card" onClick={() => isAuthenticated ? onSelectTab('profile-details') : onOpenSignIn()}>
        <div className="sidebar-avatar">
          {isAuthenticated && currentUser ? currentUser.name.charAt(0) : <User size={18} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {isAuthenticated && currentUser ? currentUser.name : 'Guest Student'}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            {isAuthenticated && currentUser ? `Roll: ${currentUser.rollNo}` : 'Click to Sign In'}
          </div>
        </div>
        <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
      </div>

      {/* Navigation Links Scroll Body */}
      <div className="sidebar-nav-body">
        {/* SECTION 1: CORE */}
        <div className="sidebar-group-title">MAIN WORKSPACE</div>
        <button className={`sidebar-nav-item ${currentTab === null ? 'active' : ''}`} onClick={() => onSelectTab(null)}>
          <Home size={18} /> <span>Home Dashboard</span>
        </button>
        <button className={`sidebar-nav-item ${currentTab === 'announcements' ? 'active' : ''}`} onClick={() => onSelectTab('announcements')}>
          <Bell size={18} /> <span>Notice Board &amp; Events</span>
        </button>

        {/* SECTION 2: ACADEMICS */}
        <div className="sidebar-group-title">🎓 ACADEMIC HUB</div>
        <button className={`sidebar-nav-item ${currentTab === 'ai' ? 'active' : ''}`} onClick={() => onSelectTab('ai')}>
          <Sparkles size={18} style={{ color: '#8b5cf6' }} /> <span>AI Tutor Assistant</span>
        </button>
        <button className={`sidebar-nav-item ${currentTab === 'courses' ? 'active' : ''}`} onClick={() => onSelectTab('courses')}>
          <BookOpen size={18} style={{ color: '#0891b2' }} /> <span>Syllabus &amp; Courses</span>
        </button>
        <button className={`sidebar-nav-item ${currentTab === 'calendar' ? 'active' : ''}`} onClick={() => onSelectTab('calendar')}>
          <Calendar size={18} style={{ color: '#dc2626' }} /> <span>Academic Calendar</span>
        </button>
        <button className={`sidebar-nav-item ${currentTab === 'academics' ? 'active' : ''}`} onClick={() => onSelectTab('academics')}>
          <GraduationCap size={18} style={{ color: '#059669' }} /> <span>CGPA &amp; Grade Vault</span>
        </button>
        <button className={`sidebar-nav-item ${currentTab === 'cgpa-calc' ? 'active' : ''}`} onClick={() => onSelectTab('cgpa-calc')}>
          <GraduationCap size={18} style={{ color: '#0284c7' }} /> <span>Target GPA Calculator</span>
        </button>
        <button className={`sidebar-nav-item ${currentTab === 'nptel' ? 'active' : ''}`} onClick={() => onSelectTab('nptel')}>
          <Award size={18} style={{ color: '#7c3aed' }} /> <span>NPTEL Certificates</span>
        </button>
        <button className={`sidebar-nav-item ${currentTab === 'timetable' ? 'active' : ''}`} onClick={() => onSelectTab('timetable')}>
          <Calendar size={18} style={{ color: '#0f766e' }} /> <span>Class Timetable</span>
        </button>

        {/* SECTION 3: RECORDS & SERVICES */}
        <div className="sidebar-group-title">📂 RECORDS &amp; SERVICES</div>
        <button className={`sidebar-nav-item ${currentTab === 'profile' ? 'active' : ''}`} onClick={() => onSelectTab('profile')}>
          <BookOpen size={18} style={{ color: '#0052cc' }} /> <span>My Documents</span>
        </button>
        <button className={`sidebar-nav-item ${currentTab === 'certificates' ? 'active' : ''}`} onClick={() => onSelectTab('certificates')}>
          <Award size={18} style={{ color: '#be185d' }} /> <span>Certificates Vault</span>
        </button>
        <button className={`sidebar-nav-item ${currentTab === 'od-form' ? 'active' : ''}`} onClick={() => onSelectTab('od-form')}>
          <FileText size={18} style={{ color: '#4f46e5' }} /> <span>Apply OD Form</span>
        </button>
        <button className={`sidebar-nav-item ${currentTab === 'request-letters' ? 'active' : ''}`} onClick={() => onSelectTab('request-letters')}>
          <FileText size={18} style={{ color: '#0d9488' }} /> <span>Bonafide &amp; NOC Letters</span>
        </button>
        <button className={`sidebar-nav-item ${currentTab === 'attendance' ? 'active' : ''}`} onClick={() => onSelectTab('attendance')}>
          <UserCheck size={18} style={{ color: '#ff5f1f' }} /> <span>Attendance Logs</span>
        </button>
        <button className={`sidebar-nav-item ${currentTab === 'lab-finder' ? 'active' : ''}`} onClick={() => onSelectTab('lab-finder')}>
          <Map size={18} style={{ color: '#d97706' }} /> <span>Lab Seat Finder</span>
        </button>
        <button className={`sidebar-nav-item ${currentTab === 'suggestion' ? 'active' : ''}`} onClick={() => onSelectTab('suggestion')}>
          <Inbox size={18} style={{ color: '#ea580c' }} /> <span>Anonymous Suggestions</span>
        </button>

        {/* SECTION 4: CAREER & CAMPUS */}
        <div className="sidebar-group-title">🚀 CAREER &amp; CAMPUS</div>
        <button className={`sidebar-nav-item ${currentTab === 'career' ? 'active' : ''}`} onClick={() => onSelectTab('career')}>
          <Zap size={18} style={{ color: '#d97706' }} /> <span>Career Roadmaps</span>
        </button>
        <button className={`sidebar-nav-item ${currentTab === 'campus-map' ? 'active' : ''}`} onClick={() => onSelectTab('campus-map')}>
          <Map size={18} style={{ color: '#2563eb' }} /> <span>Campus Navigator</span>
        </button>
        <button className={`sidebar-nav-item ${currentTab === 'college-rules' ? 'active' : ''}`} onClick={() => onSelectTab('college-rules')}>
          <Shield size={18} style={{ color: '#16a34a' }} /> <span>College Rules &amp; Code</span>
        </button>
        <button className={`sidebar-nav-item ${currentTab === 'faculty' ? 'active' : ''}`} onClick={() => onSelectTab('faculty')}>
          <Phone size={18} style={{ color: '#db2777' }} /> <span>Faculty Directory</span>
        </button>
      </div>

      {/* Footer Action */}
      <div className="sidebar-footer">
        {isAuthenticated ? (
          <button className="sidebar-logout-btn" onClick={onLogout}>
            <LogOut size={16} /> <span>Sign Out</span>
          </button>
        ) : (
          <button className="sidebar-login-btn" onClick={onOpenSignIn}>
            <LogIn size={16} /> <span>Student Sign In</span>
          </button>
        )}
      </div>
    </aside>
  );
};
