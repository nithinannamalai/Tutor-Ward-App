import { useState, useEffect, useMemo } from 'react';
import { dbService } from './services/db';
import type { Announcement } from './services/db';
import { AnnouncementBanner } from './components/AnnouncementBanner';
import appLogo from './assets/app-logo.png';

import { ProfileDocs } from './components/ProfileDocs';
import { AttendanceTracker } from './components/AttendanceTracker';
import { NptelTracker } from './components/NptelTracker';
import { AcademicsTracker } from './components/AcademicsTracker';
import { CareerHub } from './components/CareerHub';
import { AcademicCalendar } from './components/AcademicCalendar';
import { AIChatbot } from './components/AIChatbot';
import { SplashScreen } from './components/SplashScreen';
import { SignInPage } from './components/SignInPage';
import { StudentDetailsCard } from './components/StudentDetailsCard';
import {
  Zap, Menu, X, Search, Bell, User, LogOut, ChevronRight,
  BookOpen, Calendar, GraduationCap, Award, FileText, UserCheck,
  Inbox, Map, Shield, Phone, ArrowLeft, Sparkles, Home,
  CheckCircle2
} from 'lucide-react';
import './App.css';

export interface UserProfile {
  email: string;
  name: string;
  rollNo: string;
  role: 'student' | 'teacher';
  className: string;
  yearOfStudy: string;
  semester: string;
  department: string;
}

// Simulation accounts for testing
const USER_PROFILES: UserProfile[] = [
  {
    email: 'student@eee.com',
    name: 'Nithin Annamalai',
    rollNo: '7377221EE001',
    role: 'student',
    className: 'III EEE-A',
    yearOfStudy: '3rd Year',
    semester: 'Semester VI',
    department: 'Dept of EEE'
  }
];

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [showSignInPage, setShowSignInPage] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentTab, setCurrentTab] = useState<string | null>(null);
  const [isClosingModal, setIsClosingModal] = useState(false);
  const [activeBottomNav, setActiveBottomNav] = useState('home');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    const list = await dbService.getAnnouncements();
    setAnnouncements(list);
  };

  const handleAddAnnouncement = async (newAnn: Omit<Announcement, 'id'>) => {
    await dbService.saveAnnouncement(newAnn);
    loadAnnouncements();
  };

  const handleLoginSuccess = (userProfile: UserProfile) => {
    setCurrentUser(userProfile);
    setIsAuthenticated(true);
    setShowSignInPage(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setCurrentTab(null);
    setIsDrawerOpen(false);
  };

  const isAdmin = currentUser?.role === 'teacher';

  const handleCloseModal = () => {
    if (isClosingModal) return;
    setIsClosingModal(true);
    setTimeout(() => {
      setCurrentTab(null);
      setIsClosingModal(false);
    }, 240);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && currentTab) {
        handleCloseModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTab, isClosingModal]);

  const handleCardClick = (titleKey: string) => {
    if (!isAuthenticated) {
      setShowSignInPage(true);
      return;
    }
    if (titleKey === 'home') {
      setCurrentTab(null);
      setActiveBottomNav('home');
      setIsDrawerOpen(false);
      return;
    }
    setIsClosingModal(false);
    setCurrentTab(titleKey);
    setIsDrawerOpen(false);
  };

  // Mobile App Categories with Colorful App Tiles (Nithra Calendar & Airtel Thanks App Style)
  const appCategories = useMemo(() => [
    {
      title: '🎓 ACADEMIC HUB',
      items: [
        { key: 'ai', label: 'AI Tutor', icon: <Sparkles size={24} />, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)' },
        { key: 'courses', label: 'Syllabus', icon: <BookOpen size={24} />, color: '#0891b2', bg: 'rgba(8, 145, 178, 0.12)' },
        { key: 'calendar', label: 'Calendar', icon: <Calendar size={24} />, color: '#dc2626', bg: 'rgba(220, 38, 38, 0.12)' },
        { key: 'academics', label: 'CGPA', icon: <GraduationCap size={24} />, color: '#059669', bg: 'rgba(5, 150, 105, 0.12)' },
        { key: 'nptel', label: 'NPTEL', icon: <Award size={24} />, color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.12)' },
      ]
    },
    {
      title: '📂 RECORDS & DOCUMENTS',
      items: [
        { key: 'profile', label: 'Documents', icon: <BookOpen size={24} />, color: '#0052cc', bg: 'rgba(0, 82, 204, 0.12)' },
        { key: 'certificates', label: 'Certificates', icon: <Award size={24} />, color: '#be185d', bg: 'rgba(190, 24, 93, 0.12)' },
        { key: 'letters', label: 'Letters', icon: <FileText size={24} />, color: '#4f46e5', bg: 'rgba(79, 70, 229, 0.12)' },
      ]
    },
    {
      title: '⚡ STUDENT SERVICES',
      items: [
        { key: 'attendance', label: 'Attendance', icon: <UserCheck size={24} />, color: '#ff5f1f', bg: 'rgba(255, 95, 31, 0.12)' },
        { key: 'suggestion', label: 'Suggestions', icon: <Inbox size={24} />, color: '#ea580c', bg: 'rgba(234, 88, 12, 0.12)' },
      ]
    },
    {
      title: '🚀 CAREER & CAMPUS',
      items: [
        { key: 'career', label: 'Roadmaps', icon: <Zap size={24} />, color: '#d97706', bg: 'rgba(217, 119, 6, 0.12)' },
        { key: 'campus-map', label: 'Campus Map', icon: <Map size={24} />, color: '#2563eb', bg: 'rgba(37, 99, 235, 0.12)' },
        { key: 'college-rules', label: 'Rules', icon: <Shield size={24} />, color: '#16a34a', bg: 'rgba(22, 163, 74, 0.12)' },
        { key: 'faculty', label: 'Faculty', icon: <Phone size={24} />, color: '#db2777', bg: 'rgba(219, 39, 119, 0.12)' },
      ]
    }
  ], []);

  const activeTileInfo = useMemo(() => {
    if (!currentTab) return null;
    if (currentTab === 'announcements') {
      return { key: 'announcements', label: 'Notifications & Notice Board', icon: <Bell size={24} />, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' };
    }
    for (const cat of appCategories) {
      const item = cat.items.find(i => i.key === currentTab);
      if (item) return item;
    }
    return null;
  }, [currentTab, appCategories]);

  // Filter items if search is active
  const filteredCategories = searchQuery.trim()
    ? appCategories.map(cat => ({
      ...cat,
      items: cat.items.filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase()))
    })).filter(cat => cat.items.length > 0)
    : appCategories;

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // SHOW SIGN IN PAGE FIRST (Before entering dashboard)
  if (!isAuthenticated) {
    return (
      <div className="mobile-app-shell">
        <SignInPage
          onLoginSuccess={handleLoginSuccess}
          demoProfiles={USER_PROFILES}
        />
      </div>
    );
  }

  return (
    <div className="mobile-app-shell">
      {/* ── Top Header Bar ── */}
      <header className="mobile-top-bar">
        <div className="mobile-top-left">
          <button
            className="hamburger-btn"
            aria-label="Open Menu"
            onClick={() => setIsDrawerOpen(true)}
          >
            <Menu size={22} />
          </button>
          <div className="mobile-brand">
            <div className="mobile-brand-logo">
              <img src={appLogo} alt="EEE SREC Logo" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover' }} />
            </div>
            <div className="mobile-brand-text">
              <h1>EEE SREC</h1>
              <p>Smart Mobile Hub</p>
            </div>
          </div>
        </div>

        <div className="mobile-top-right">
          <button className="icon-circle-btn" onClick={() => setShowSearch(!showSearch)} aria-label="Search">
            <Search size={18} />
          </button>
          <button className="icon-circle-btn" onClick={() => handleCardClick('announcements')} aria-label="Notifications">
            <Bell size={18} />
            <span className="notification-badge" />
          </button>
          <button
            className="avatar-btn"
            onClick={() => isAuthenticated ? handleCardClick('profile') : setShowSignInPage(true)}
            aria-label="User Profile"
          >
            {isAuthenticated && currentUser ? currentUser.name.charAt(0) : <User size={18} />}
          </button>
        </div>
      </header>

      {/* Quick Search Overlay Bar */}
      {showSearch && (
        <div style={{ padding: '8px 14px', background: 'var(--bg-primary)', borderBottom: '1px solid var(--card-border)', display: 'flex', gap: 8, alignItems: 'center' }}>
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search features (e.g. attendance, cgpa, faculty)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            autoFocus
            style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 16, color: 'var(--text-main)' }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
          )}
        </div>
      )}

      {/* ── AIRTEL THANKS HAMBURGER SIDE DRAWER ── */}
      {isDrawerOpen && (
        <div className="drawer-backdrop" onClick={() => setIsDrawerOpen(false)}>
          <div className="airtel-drawer" onClick={e => e.stopPropagation()}>
            {/* Top Profile Card in Drawer */}
            <div className="drawer-profile-header">
              <button className="drawer-close-btn" onClick={() => setIsDrawerOpen(false)}>
                <X size={18} />
              </button>
              <div className="drawer-user-info">
                <div className="drawer-avatar">
                  {isAuthenticated && currentUser ? currentUser.name.charAt(0) : 'G'}
                </div>
                <div className="drawer-user-text">
                  <h3>{isAuthenticated && currentUser ? currentUser.name : 'Guest User'}</h3>
                  <p>{isAuthenticated && currentUser ? `Roll: ${currentUser.rollNo}` : 'Sri Ramakrishna Eng. College'}</p>
                  <span className="drawer-role-pill">
                    <Sparkles size={10} />
                    {isAuthenticated && currentUser ? (isAdmin ? 'Faculty Admin' : 'UG Scholar') : 'Demo Guest'}
                  </span>
                </div>
              </div>

              <div className="drawer-action-row">
                {isAuthenticated ? (
                  <button className="drawer-btn secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleLogout}>
                    <LogOut size={14} /> Sign Out
                  </button>
                ) : (
                  <button className="drawer-btn primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { setIsDrawerOpen(false); setShowSignInPage(true); }}>
                    <User size={14} /> Sign In
                  </button>
                )}
              </div>
            </div>

            {/* Navigation Menu List inside Drawer */}
            <div className="drawer-nav-body">
              <div
                className={`drawer-item ${currentTab === null ? 'active' : ''}`}
                onClick={() => { setCurrentTab(null); setIsDrawerOpen(false); }}
              >
                <div className="drawer-item-left">
                  <div className="drawer-item-icon" style={{ background: 'rgba(0, 82, 204, 0.1)', color: 'var(--accent-blue)' }}>
                    <Home size={18} />
                  </div>
                  <span>Home Dashboard</span>
                </div>
                <ChevronRight size={14} style={{ opacity: 0.5 }} />
              </div>

              <div className="drawer-group-title">ACADEMICS & EXAMS</div>
              {[
                { label: 'Syllabus & Courses', key: 'courses', icon: <BookOpen size={16} />, color: '#0891b2' },
                { label: 'Academic Calendar', key: 'calendar', icon: <Calendar size={16} />, color: '#dc2626' },
                { label: 'CGPA & Subject Arrears', key: 'academics', icon: <GraduationCap size={16} />, color: '#059669' },
                { label: 'NPTEL Course Tracker', key: 'nptel', icon: <Award size={16} />, color: '#7c3aed' },
              ].map(item => (
                <div key={item.key} className="drawer-item" onClick={() => handleCardClick(item.key)}>
                  <div className="drawer-item-left">
                    <div className="drawer-item-icon" style={{ background: `${item.color}1a`, color: item.color }}>
                      {item.icon}
                    </div>
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight size={14} style={{ opacity: 0.5 }} />
                </div>
              ))}

              <div className="drawer-group-title">RECORDS & DOCUMENTS</div>
              {[
                { label: 'Student Document Vault', key: 'profile', icon: <BookOpen size={16} />, color: '#0052cc' },
                { label: 'Certificates & Badges', key: 'certificates', icon: <Award size={16} />, color: '#be185d' },
                { label: 'Request Letters', key: 'letters', icon: <FileText size={16} />, color: '#4f46e5' },
              ].map(item => (
                <div key={item.key} className="drawer-item" onClick={() => handleCardClick(item.key)}>
                  <div className="drawer-item-left">
                    <div className="drawer-item-icon" style={{ background: `${item.color}1a`, color: item.color }}>
                      {item.icon}
                    </div>
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight size={14} style={{ opacity: 0.5 }} />
                </div>
              ))}

              <div className="drawer-group-title">STUDENT SERVICES</div>
              {[
                { label: 'Period Attendance (1–7)', key: 'attendance', icon: <UserCheck size={16} />, color: '#ff5f1f' },
                { label: 'Anonymous Suggestions', key: 'suggestion', icon: <Inbox size={16} />, color: '#ea580c' },
              ].map(item => (
                <div key={item.key} className="drawer-item" onClick={() => handleCardClick(item.key)}>
                  <div className="drawer-item-left">
                    <div className="drawer-item-icon" style={{ background: `${item.color}1a`, color: item.color }}>
                      {item.icon}
                    </div>
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight size={14} style={{ opacity: 0.5 }} />
                </div>
              ))}

              <div className="drawer-group-title">CAMPUS & CAREER</div>
              {[
                { label: 'Career Roadmaps & GATE', key: 'career', icon: <Zap size={16} />, color: '#d97706' },
                { label: 'EEE Campus & Lab Map', key: 'campus-map', icon: <Map size={16} />, color: '#2563eb' },
                { label: 'College Rules & Conduct', key: 'college-rules', icon: <Shield size={16} />, color: '#16a34a' },
                { label: 'Faculty Contacts', key: 'faculty', icon: <Phone size={16} />, color: '#db2777' },
              ].map(item => (
                <div key={item.key} className="drawer-item" onClick={() => handleCardClick(item.key)}>
                  <div className="drawer-item-left">
                    <div className="drawer-item-icon" style={{ background: `${item.color}1a`, color: item.color }}>
                      {item.icon}
                    </div>
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight size={14} style={{ opacity: 0.5 }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── PURE MOBILE APP MAIN CONTENT: HOME HUB OR DEDICATED FULL-SCREEN PAGE ── */}
      <main className="mobile-app-content">
        {currentTab === null ? (
          /* ── HOME DASHBOARD VIEW ── */
          <div className="home-dashboard-view">
            {/* 🎓 STUDENT DETAILS CARD (ALWAYS ABOVE NOTICE BOARD) */}
            <StudentDetailsCard
              isAuthenticated={isAuthenticated}
              currentUser={currentUser}
              onOpenProfile={() => handleCardClick('profile')}
              onOpenSignIn={() => setShowSignInPage(true)}
              onOpenTab={handleCardClick}
            />

            {/* 🔔 NOTICE BOARD ANNOUNCEMENT WIDGET */}
            <div id="announcements-widget">
              <div className="mobile-section-header">
                <span className="mobile-section-title">🔔 NOTICE BOARD &amp; EVENTS</span>
              </div>
              <div style={{ background: 'var(--bg-primary)', borderRadius: 16, border: '1px solid var(--card-border)', padding: 12 }}>
                <AnnouncementBanner
                  announcements={announcements}
                  isAdmin={isAdmin}
                  onAddAnnouncement={handleAddAnnouncement}
                  onOpenAnnouncements={() => handleCardClick('announcements')}
                />
              </div>
            </div>

            {/* Mobile Icon Grid Categories */}
            {filteredCategories.map((cat, idx) => (
              <div key={idx}>
                <div className="mobile-section-header">
                  <span className="mobile-section-title">{cat.title}</span>
                </div>
                <div className="mobile-grid-4col">
                  {cat.items.map((item) => (
                    <div
                      key={item.key}
                      className="mobile-app-tile"
                      onClick={() => handleCardClick(item.key)}
                    >
                      <div className="mobile-tile-icon" style={{ background: item.bg, color: item.color }}>
                        {item.icon}
                      </div>
                      <span className="mobile-tile-label">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ── DEDICATED FULL PAGE SCREEN VIEW ── */
          <div className="dedicated-page-view page-slide-enter">
            {/* Dedicated Top Navigation Header Bar */}
            <div className="dedicated-page-header">
              <button
                className="page-back-btn"
                onClick={() => { setCurrentTab(null); setActiveBottomNav('home'); }}
                aria-label="Back to Home"
              >
                <ArrowLeft size={18} />
                <span>Home</span>
              </button>

              {activeTileInfo && (
                <div className="page-header-badge" style={{ background: activeTileInfo.bg, color: activeTileInfo.color }}>
                  {activeTileInfo.icon}
                  <h2>{activeTileInfo.label}</h2>
                </div>
              )}

              <button
                className="page-close-btn"
                onClick={() => setCurrentTab(null)}
                aria-label="Close page"
              >
                <X size={18} />
              </button>
            </div>

            {/* Dedicated Page Body Content */}
            <div className="dedicated-page-body">
              {currentTab === 'ai' && <AIChatbot isFullPage={true} />}
              {currentTab === 'announcements' && (
                <div style={{ background: 'var(--bg-primary)', borderRadius: 16, border: '1px solid var(--card-border)', padding: 16 }}>
                  <AnnouncementBanner
                    announcements={announcements}
                    isAdmin={isAdmin}
                    onAddAnnouncement={handleAddAnnouncement}
                  />
                </div>
              )}
              {currentTab === 'profile' && <ProfileDocs currentEmail={currentUser?.email || 'student@eee.com'} isAdmin={isAdmin} onBack={() => setCurrentTab(null)} />}
              {currentTab === 'certificates' && <ProfileDocs currentEmail={currentUser?.email || 'student@eee.com'} isAdmin={isAdmin} onBack={() => setCurrentTab(null)} />}
              {currentTab === 'letters' && <ProfileDocs currentEmail={currentUser?.email || 'student@eee.com'} isAdmin={isAdmin} onBack={() => setCurrentTab(null)} />}
              {currentTab === 'attendance' && <AttendanceTracker currentStudentRollNo={currentUser?.rollNo || '7377221EE001'} currentUserName={currentUser?.name || 'Nithin Annamalai'} isAdmin={isAdmin} onBack={() => setCurrentTab(null)} />}
              {currentTab === 'nptel' && <NptelTracker currentEmail={currentUser?.email || 'student@eee.com'} isAdmin={isAdmin} onBack={() => setCurrentTab(null)} />}
              {currentTab === 'academics' && <AcademicsTracker currentEmail={currentUser?.email || 'student@eee.com'} isAdmin={isAdmin} onBack={() => setCurrentTab(null)} />}
              {currentTab === 'career' && <CareerHub onBack={() => setCurrentTab(null)} />}
              {currentTab === 'courses' && <AcademicCalendar onBack={() => setCurrentTab(null)} />}
              {currentTab === 'calendar' && <AcademicCalendar onBack={() => setCurrentTab(null)} />}
              {currentTab === 'suggestion' && (
                <SuggestionBox onClose={() => setCurrentTab(null)} userName={currentUser?.name || 'Guest'} />
              )}
              {currentTab === 'campus-map' && <CampusMapPanel onClose={() => setCurrentTab(null)} />}
              {currentTab === 'college-rules' && <CollegeRulesPanel onClose={() => setCurrentTab(null)} />}
              {currentTab === 'faculty' && <FacultyPanel onClose={() => setCurrentTab(null)} />}
            </div>
          </div>
        )}
      </main>

      {/* Floating AI Assistant Action Trigger (Hidden when on dedicated AI Tutor page) */}
      {currentTab !== 'ai' && <AIChatbot />}

      {/* ── Fixed Bottom Mobile Navigation Bar ── */}
      <nav className="mobile-bottom-nav">
        <button
          className={`bottom-tab-item ${activeBottomNav === 'home' && currentTab === null ? 'active' : ''}`}
          onClick={() => { setActiveBottomNav('home'); setCurrentTab(null); }}
        >
          <Home size={20} />
          <span className="bottom-tab-label">Home</span>
        </button>

        <button
          className={`bottom-tab-item ${currentTab === 'academics' || currentTab === 'courses' ? 'active' : ''}`}
          onClick={() => { setActiveBottomNav('academics'); handleCardClick('academics'); }}
        >
          <GraduationCap size={20} />
          <span className="bottom-tab-label">Academics</span>
        </button>

        <button
          className={`bottom-tab-item ${currentTab === 'attendance' ? 'active' : ''}`}
          onClick={() => { setActiveBottomNav('attendance'); handleCardClick('attendance'); }}
        >
          <UserCheck size={20} />
          <span className="bottom-tab-label">Attendance</span>
        </button>

        <button
          className={`bottom-tab-item ${currentTab === 'career' ? 'active' : ''}`}
          onClick={() => { setActiveBottomNav('career'); handleCardClick('career'); }}
        >
          <Zap size={20} />
          <span className="bottom-tab-label">Career</span>
        </button>

        <button
          className={`bottom-tab-item ${currentTab === 'profile' ? 'active' : ''}`}
          onClick={() => { setActiveBottomNav('profile'); handleCardClick('profile'); }}
        >
          <User size={20} />
          <span className="bottom-tab-label">Profile</span>
        </button>
      </nav>

      {/* ── Full-Screen Mobile Sign In Page ── */}
      {showSignInPage && (
        <SignInPage
          onClose={() => setShowSignInPage(false)}
          onLoginSuccess={handleLoginSuccess}
          demoProfiles={USER_PROFILES}
        />
      )}
    </div>
  );
}

// ── Suggestion Box Panel ──────────────────────────────
function SuggestionBox({ onClose }: { onClose: () => void; userName: string }) {
  const [cat, setCat] = useState('Academic');
  const [msg, setMsg] = useState('');
  const [done, setDone] = useState(false);
  const submit = () => { if (msg.trim()) setDone(true); };
  return (
    <div style={{ padding: 24, maxWidth: 440, margin: '0 auto' }}>
      <h3 style={{ margin: '0 0 4px 0', fontSize: 18, fontWeight: 800 }}>💬 Anonymous Suggestion Box</h3>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>Your feedback is confidential. Share freely with department administration.</p>
      {done ? (
        <div style={{ textAlign: 'center', padding: '30px 0' }}>
          <CheckCircle2 size={48} color="#059669" style={{ marginBottom: 12 }} />
          <h4 style={{ color: '#059669', margin: '0 0 8px 0' }}>Suggestion Submitted!</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Thank you. Your suggestion has been sent directly to the HOD office.</p>
          <button className="cta-button" style={{ marginTop: 16 }} onClick={onClose}>Return to Mobile Hub</button>
        </div>
      ) : (
        <>
          <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Category</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '8px 0 16px' }}>
            {['Academic', 'Infrastructure', 'Faculty', 'Lab Equipments', 'Other'].map(c => (
              <button key={c} onClick={() => setCat(c)}
                style={{
                  padding: '6px 12px', borderRadius: 20, border: '1.5px solid', cursor: 'pointer', fontSize: 11, fontWeight: 600,
                  borderColor: cat === c ? 'var(--accent-blue)' : 'var(--card-border)',
                  background: cat === c ? 'var(--accent-blue)' : 'transparent',
                  color: cat === c ? '#fff' : 'var(--text-muted)'
                }}>{c}</button>
            ))}
          </div>
          <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Your Suggestion / Feedback</label>
          <textarea value={msg} onChange={e => setMsg(e.target.value)}
            placeholder="Describe your issue or suggestion for EEE department..."
            style={{
              width: '100%', minHeight: 110, marginTop: 8, padding: 12, borderRadius: 12,
              border: '1.5px solid var(--card-border)', fontSize: 12, resize: 'vertical',
              fontFamily: 'inherit', background: 'var(--bg-secondary)', color: 'var(--text-main)', boxSizing: 'border-box'
            }} />
          <button className="cta-button" style={{ marginTop: 16, width: '100%' }} onClick={submit}>Submit Suggestion</button>
        </>
      )}
    </div>
  );
}

// ── Campus Map Panel ──────────────────────────────────
function CampusMapPanel({ onClose: _onClose }: { onClose: () => void }) {
  const labs = [
    { name: 'Electrical Machinery Lab', block: 'Block A, GF', icon: '⚡' },
    { name: 'Power Electronics Lab', block: 'Block A, 1F', icon: '🔌' },
    { name: 'Microprocessor & Control Lab', block: 'Block B, GF', icon: '🖥️' },
    { name: 'Smart Grid Research Centre', block: 'Block B, 2F', icon: '🌐' },
    { name: 'High Voltage Lab', block: 'Block C, GF', icon: '⚠️' },
    { name: 'EEE Seminar Hall', block: 'Block C, 1F', icon: '🎓' },
    { name: 'HOD Office (Dr. Ramanujam)', block: 'Block A, 2F – Room 204', icon: '🏫' },
    { name: 'Department Library', block: 'Block B, 1F', icon: '📚' },
  ];
  return (
    <div style={{ padding: 20 }}>
      <h3 style={{ margin: '0 0 4px 0', fontSize: 18, fontWeight: 800 }}>🗺️ EEE Campus & Lab Facilities</h3>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 20 }}>Sri Ramakrishna Engineering College · EEE Department</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
        {labs.map((l, i) => (
          <div key={i} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--card-border)', borderRadius: 14, padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 24 }}>{l.icon}</span>
            <span style={{ fontWeight: 700, fontSize: 12 }}>{l.name}</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{l.block}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── College Rules Panel ───────────────────────────────
function CollegeRulesPanel({ onClose: _onClose }: { onClose: () => void }) {
  const rules = [
    { icon: '👔', title: 'Dress Code', desc: 'Formal attire on working days. Lab coat mandatory during sessions.' },
    { icon: '📊', title: 'Attendance', desc: 'Minimum 75% attendance per subject required for semester exams.' },
    { icon: '🥾', title: 'Lab Safety', desc: 'Safety shoes and lab coat compulsory. Mobile usage prohibited.' },
    { icon: '🤫', title: 'Discipline', desc: 'Maintain quiet in classrooms & library. Zero tolerance for ragging.' },
    { icon: '📱', title: 'Mobile Policy', desc: 'Keep phones in silent mode inside academic blocks.' },
    { icon: '🏆', title: 'Integrity', desc: 'Strict anti-malpractice rules apply to all internal & end-sem exams.' },
  ];
  return (
    <div style={{ padding: 20 }}>
      <h3 style={{ margin: '0 0 4px 0', fontSize: 18, fontWeight: 800 }}>🛡️ Rules & Code of Conduct</h3>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 20 }}>EEE Department, SREC Academic Guidelines</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {rules.map((r, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, background: 'var(--bg-secondary)', border: '1px solid var(--card-border)', borderRadius: 12, padding: '12px 14px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>{r.icon}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 2 }}>{r.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{r.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Faculty Contacts Panel ────────────────────────────
function FacultyPanel({ onClose: _onClose }: { onClose: () => void }) {
  const faculty = [
    { name: 'Dr. R. Ramanujam', role: 'Head of Department', email: 'hod.eee@srec.ac.in', phone: '+91-98400-00001' },
    { name: 'Dr. S. Kavitha', role: 'Professor – Power Systems', email: 's.kavitha@srec.ac.in', phone: '+91-98400-00002' },
    { name: 'Dr. M. Arulkumar', role: 'Professor – Machines & Drives', email: 'm.arulkumar@srec.ac.in', phone: '+91-98400-00003' },
    { name: 'Ms. P. Vijayalakshmi', role: 'Asst. Professor – Control', email: 'p.vijaya@srec.ac.in', phone: '+91-98400-00004' },
    { name: 'Mr. K. Senthilkumar', role: 'Asst. Professor – Power Elec.', email: 'k.senthil@srec.ac.in', phone: '+91-98400-00005' },
    { name: 'Ms. R. Priyanka', role: 'Asst. Professor – Microprocessors', email: 'r.priyanka@srec.ac.in', phone: '+91-98400-00006' },
  ];
  return (
    <div style={{ padding: 20 }}>
      <h3 style={{ margin: '0 0 4px 0', fontSize: 18, fontWeight: 800 }}>📞 Faculty Directory</h3>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 20 }}>EEE Department Professors &amp; Mentors</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
        {faculty.map((f, i) => (
          <div key={i} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--card-border)', borderRadius: 12, padding: '14px 12px' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: `hsl(${i * 60}, 60%, 85%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, marginBottom: 8 }}>
              {f.name.charAt(0)}
            </div>
            <div style={{ fontWeight: 800, fontSize: 12 }}>{f.name}</div>
            <div style={{ fontSize: 10, color: 'var(--accent-blue)', marginBottom: 6 }}>{f.role}</div>
            <a href={`mailto:${f.email}`} style={{ display: 'block', fontSize: 10, color: 'var(--text-muted)', textDecoration: 'none', marginBottom: 2 }}>✉️ {f.email}</a>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>📱 {f.phone}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
