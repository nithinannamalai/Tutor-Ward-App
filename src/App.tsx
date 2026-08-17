import { useState, useEffect, useMemo } from 'react';
import { App as CapApp } from '@capacitor/app';
import { supabase } from './services/supabaseClient';
import { dbService } from './services/db';
import type { Announcement, Faculty, Rule } from './services/db';
import appLogo from './assets/app-logo.png';
import { APP_CATEGORIES } from './routes/appRoutes';

import {
  ProfileDocs,
  AttendanceTracker,
  NptelTracker,
  AcademicsTracker,
  CareerHub,
  AcademicCalendar,
  AIChatbot,
  SplashScreen,
  SignInPage,
  StudentDetailsCard,
  ODForm,
  Timetable,
  RequestLetters,
  LabSeatFinder,
  GpaCalculator,
  AnnouncementBanner,
  DesktopLandingPage,
  DesktopLoginPage,
  DesktopSidebar,
  DesktopVisionaDashboard
} from './components';

import {
  Zap, Menu, X, Search, Bell, User, LogOut, ChevronRight,
  BookOpen, Calendar, GraduationCap, Award, FileText, UserCheck,
  Inbox, Map, Shield, Phone, ArrowLeft, Sparkles, Home,
  CheckCircle2, Plus, Trash2, Pencil
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
  // Extended personal details
  phone?: string;
  dob?: string;
  bloodGroup?: string;
  address?: string;
  parentName?: string;
  parentPhone?: string;
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
  },
  {
    email: 'teacher@eee.com',
    name: 'Dr. EEE HOD / Faculty',
    rollNo: 'FAC001',
    role: 'teacher',
    className: 'All EEE Classes',
    yearOfStudy: 'Staff',
    semester: 'Staff Portal',
    department: 'Dept of EEE'
  }
];

function App() {
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 992);
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [showSignInPage, setShowSignInPage] = useState(false);
  const [dismissedSignIn, setDismissedSignIn] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 992);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentTab, setCurrentTab] = useState<string | null>(null);
  const [isClosingModal, setIsClosingModal] = useState(false);
  const [activeBottomNav, setActiveBottomNav] = useState('home');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [academicInitEdit, setAcademicInitEdit] = useState(false);

  useEffect(() => {
    loadAnnouncements();

    // Check active session on mount
    const checkSession = async () => {
      const isSupabaseConfigured = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
      if (isSupabaseConfigured) {
        try {
          const { data: { session } } = await (supabase.auth as any).getSession();
          if (session?.user) {
            const email = session.user.email || '';
            let role: 'student' | 'teacher' = 'student';
            let name = session.user.user_metadata?.name || email.split('@')[0].toUpperCase();
            let rollNo = session.user.user_metadata?.rollNo || '';

            // Check if teacher
            const { data: facultyData } = await supabase
              .from('faculty')
              .select('*')
              .eq('email', email)
              .maybeSingle();

            if (facultyData || email.toLowerCase() === 'teacher@eee.com') {
              role = 'teacher';
              name = facultyData?.name || 'Dr. EEE HOD / Faculty';
              rollNo = 'FAC001';
            } else {
              const { data: studentData } = await supabase
                .from('student_profiles')
                .select('*')
                .eq('email', email)
                .maybeSingle();

              if (studentData) {
                name = studentData.name;
                rollNo = studentData.roll_no;
              }
            }

            const userProfile: UserProfile = {
              email,
              name,
              rollNo,
              role,
              className: role === 'teacher' ? 'All EEE Classes' : 'III EEE-A',
              yearOfStudy: role === 'teacher' ? 'Staff' : '3rd Year',
              semester: role === 'teacher' ? 'Staff Portal' : 'Semester VI',
              department: 'Dept of EEE'
            };

            // Merge local extras
            try {
              const saved = localStorage.getItem('eee_profile_extra_' + email);
              if (saved) {
                const extras = JSON.parse(saved) as Partial<UserProfile>;
                setCurrentUser({ ...userProfile, ...extras, email, role });
              } else {
                setCurrentUser(userProfile);
              }
            } catch {
              setCurrentUser(userProfile);
            }
            setIsAuthenticated(true);
            setDismissedSignIn(true);
          }
        } catch (err) {
          console.warn('Failed to fetch Supabase session on mount:', err);
        }
      }
    };
    checkSession();

    // Hardware Back Button Handler
    const backListener = CapApp.addListener('backButton', () => {
      setCurrentTab(prev => {
        if (prev !== null) {
          setActiveBottomNav('home');
          return null;
        }
        CapApp.exitApp();
        return prev;
      });
    });

    return () => {
      backListener.then(l => l.remove());
    };
  }, []);

  const loadAnnouncements = async () => {
    const list = await dbService.getAnnouncements();
    setAnnouncements(list);
  };

  const handleAddAnnouncement = async (newAnn: Omit<Announcement, 'id'>) => {
    await dbService.saveAnnouncement(newAnn);
    loadAnnouncements();
  };

  const handleDeleteAnnouncement = async (id: string) => {
    await dbService.deleteAnnouncement(id);
    loadAnnouncements();
  };

  const handleLoginSuccess = (userProfile: UserProfile) => {
    // Merge any locally saved personal details (phone, dob, etc.)
    try {
      const saved = localStorage.getItem('eee_profile_extra_' + userProfile.email);
      if (saved) {
        const extras = JSON.parse(saved) as Partial<UserProfile>;
        setCurrentUser({ ...userProfile, ...extras, email: userProfile.email, role: userProfile.role });
      } else {
        setCurrentUser(userProfile);
      }
    } catch {
      setCurrentUser(userProfile);
    }
    setIsAuthenticated(true);
    setShowSignInPage(false);
  };

  const handleLogout = async () => {
    const isSupabaseConfigured = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
    if (isSupabaseConfigured) {
      try {
        await (supabase.auth as any).signOut();
      } catch (err) {
        console.warn('Failed to sign out from Supabase:', err);
      }
    }
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
    setAcademicInitEdit(false);
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


  // Mobile & Desktop App Categories (Loaded from src/routes/appRoutes.ts)
  const appCategories = useMemo(() => APP_CATEGORIES, []);

  const activeTileInfo = useMemo(() => {
    if (!currentTab) return null;
    if (currentTab === 'announcements') {
      return { key: 'announcements', label: 'Notifications & Notice Board', icon: <Bell size={24} />, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' };
    }
    if (currentTab === 'timetable') {
      return { key: 'timetable', label: 'Class Timetable', icon: <Calendar size={24} />, color: '#0f766e', bg: 'rgba(15, 118, 110, 0.12)' };
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

  // MANDATORY AUTHENTICATION: Show Landing Page or Login Portal if not authenticated
  if (!isAuthenticated) {
    if (isDesktop) {
      if (showSignInPage) {
        return (
          <DesktopLoginPage
            onClose={() => setShowSignInPage(false)}
            onLoginSuccess={(profile) => { handleLoginSuccess(profile); setShowSignInPage(false); }}
            demoProfiles={USER_PROFILES}
          />
        );
      }
      return (
        <DesktopLandingPage
          onOpenLogin={(isSignUp) => {
            setShowSignInPage(true);
          }}
        />
      );
    }
    return (
      <div className="mobile-app-shell">
        <SignInPage
          onClose={() => setShowSignInPage(false)}
          onLoginSuccess={(profile) => { handleLoginSuccess(profile); setShowSignInPage(false); }}
          demoProfiles={USER_PROFILES}
        />
      </div>
    );
  }

  return (
    <div className="mobile-app-shell" style={{ display: isDesktop ? 'flex' : 'block', flexDirection: 'row' }}>
      {/* Permanent Desktop Sidebar Navigation */}
      {isDesktop && (
        <DesktopSidebar
          currentTab={currentTab}
          activeBottomNav={activeBottomNav}
          onSelectTab={(tab) => { setCurrentTab(tab); if (!tab) setActiveBottomNav('home'); }}
          isAuthenticated={isAuthenticated}
          currentUser={currentUser}
          onOpenSignIn={() => setShowSignInPage(true)}
          onLogout={handleLogout}
        />
      )}

      {/* Main App Content Area */}
      <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
        {/* Top Header Bar (Mobile Only) */}
        {!isDesktop && (
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
                onClick={() => isAuthenticated ? handleCardClick('profile-details') : setShowSignInPage(true)}
                aria-label="User Profile"
              >
                {isAuthenticated && currentUser ? currentUser.name.charAt(0) : <User size={18} />}
              </button>
            </div>
          </header>
        )}

        {/* Desktop Header Quick Navigation Bar */}
        <div className="desktop-nav-links">
          <button 
            className={`desktop-nav-btn ${activeBottomNav === 'home' && currentTab === null ? 'active' : ''}`}
            onClick={() => { setActiveBottomNav('home'); setCurrentTab(null); }}
          >
            <Home size={15} /> <span>Home</span>
          </button>
          <button 
            className={`desktop-nav-btn ${currentTab === 'academics' || currentTab === 'courses' ? 'active' : ''}`}
            onClick={() => { setActiveBottomNav('academics'); handleCardClick('academics'); }}
          >
            <GraduationCap size={15} /> <span>Academics</span>
          </button>
          <button 
            className={`desktop-nav-btn ${currentTab === 'attendance' ? 'active' : ''}`}
            onClick={() => { setActiveBottomNav('attendance'); handleCardClick('attendance'); }}
          >
            <UserCheck size={15} /> <span>Attendance</span>
          </button>
          <button 
            className={`desktop-nav-btn ${currentTab === 'career' ? 'active' : ''}`}
            onClick={() => { setActiveBottomNav('career'); handleCardClick('career'); }}
          >
            <Zap size={15} /> <span>Career</span>
          </button>
          <button 
            className={`desktop-nav-btn ${currentTab === 'profile-details' ? 'active' : ''}`}
            onClick={() => { setActiveBottomNav('profile'); handleCardClick('profile-details'); }}
          >
            <User size={15} /> <span>Profile</span>
          </button>
        </div>

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
                { label: 'Class Timetable', key: 'timetable', icon: <Calendar size={16} />, color: '#0f766e' },
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
                { label: 'OD Form', key: 'od-form', icon: <FileText size={16} />, color: '#4f46e5' },
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
          isDesktop ? (
            <DesktopVisionaDashboard currentUser={currentUser} onOpenTab={handleCardClick} />
          ) : (
            /* ── HOME DASHBOARD VIEW ── */
            <div className="home-dashboard-view">
              {/* Primary Left Main Column */}
              <div className="desktop-primary-col" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
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
                      onDeleteAnnouncement={handleDeleteAnnouncement}
                      onOpenAnnouncements={() => handleCardClick('announcements')}
                    />
                  </div>
                </div>

                {/* Mobile & Desktop Icon Grid Categories (Separated Folder Cards) */}
                {filteredCategories.map((cat, idx) => (
                  <div key={idx} className="category-folder-card">
                    <div className="mobile-section-header">
                      <span className="mobile-section-title">{cat.title}</span>
                      <span className="category-count-badge">{cat.items.length} Modules</span>
                    </div>
                    <div className="mobile-grid-4col">
                      {cat.items.map((item) => (
                        <div
                          key={item.key}
                          className="mobile-app-tile"
                          style={{
                            position: 'relative',
                            boxShadow: `0 2px 10px rgba(0,0,0,0.04), inset 0 0 0 1.5px ${item.color}30`,
                            border: `1.5px solid ${item.color}25`,
                          }}
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

              {/* Desktop Right Analytics & Schedule Sidebar Column */}
              <div className="desktop-widgets-col">
                {/* Today's Schedule Card */}
                <div style={{ background: 'var(--bg-primary)', borderRadius: 20, padding: 20, border: '1px solid var(--card-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={16} style={{ color: 'var(--accent-blue)' }} /> TODAY'S SCHEDULE
                    </h3>
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#059669', background: 'rgba(5,150,105,0.1)', padding: '2px 8px', borderRadius: 10 }}>SEM VI</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ background: 'rgba(0,82,204,0.06)', padding: '10px 12px', borderRadius: 12, borderLeft: '3px solid var(--accent-blue)' }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--accent-blue)' }}>09:00 AM - 10:00 AM · PERIOD 1</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-main)' }}>EE8601 Power Systems</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Room EB-204 · Dr. K. Senthilkumar</div>
                    </div>
                    <div style={{ background: 'var(--bg-secondary)', padding: '10px 12px', borderRadius: 12, borderLeft: '3px solid #94a3b8' }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)' }}>10:15 AM - 11:15 AM · PERIOD 2</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-main)' }}>EE8602 Microprocessors</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Room EB-206 · Ms. P. Vijayalakshmi</div>
                    </div>
                    <div style={{ background: 'var(--bg-secondary)', padding: '10px 12px', borderRadius: 12, borderLeft: '3px solid #94a3b8' }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)' }}>01:30 PM - 04:30 PM · LAB SESSION</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-main)' }}>Power Electronics Lab</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>EEE Lab 2 · Dr. M. Arulkumar</div>
                    </div>
                  </div>
                </div>

                {/* Quick Action Tools Card */}
                <div style={{ background: 'linear-gradient(135deg, #0052cc 0%, #1e40af 100%)', borderRadius: 20, padding: 20, color: '#fff', boxShadow: '0 8px 24px rgba(0,82,204,0.2)' }}>
                  <h3 style={{ fontSize: 13, fontWeight: 800, color: '#fff', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Zap size={16} /> QUICK DESKTOP ACTIONS
                  </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <button onClick={() => handleCardClick('od-form')} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', padding: '10px', borderRadius: 12, color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', textAlign: 'center' }}>
                    📄 Apply OD
                  </button>
                  <button onClick={() => handleCardClick('request-letters')} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', padding: '10px', borderRadius: 12, color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', textAlign: 'center' }}>
                    ✉️ Bonafide / NOC
                  </button>
                  <button onClick={() => handleCardClick('lab-finder')} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', padding: '10px', borderRadius: 12, color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', textAlign: 'center' }}>
                    🔬 Lab Finder
                  </button>
                  <button onClick={() => handleCardClick('cgpa-calc')} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', padding: '10px', borderRadius: 12, color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', textAlign: 'center' }}>
                    📊 Target GPA
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
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
                    onDeleteAnnouncement={handleDeleteAnnouncement}
                  />
                </div>
              )}
              {currentTab === 'profile-details' && <ProfileDocs currentEmail={currentUser?.email || 'student@eee.com'} isAdmin={isAdmin} onBack={() => setCurrentTab(null)} mode="profile" currentUser={currentUser} onUpdateUser={(updated) => setCurrentUser(updated)} />}
              {currentTab === 'profile' && <ProfileDocs currentEmail={currentUser?.email || 'student@eee.com'} isAdmin={isAdmin} onBack={() => setCurrentTab(null)} mode="documents" />}
              {currentTab === 'certificates' && <ProfileDocs currentEmail={currentUser?.email || 'student@eee.com'} isAdmin={isAdmin} onBack={() => setCurrentTab(null)} mode="certificates" />}
              {currentTab === 'od-form' && <ODForm onBack={() => setCurrentTab(null)} />}
              {currentTab === 'request-letters' && <RequestLetters onBack={() => setCurrentTab(null)} currentEmail={currentUser?.email || 'student@eee.com'} currentName={currentUser?.name || 'Nithin Annamalai'} currentRollNo={currentUser?.rollNo || '7377221EE001'} isAdmin={isAdmin} />}
              {currentTab === 'lab-finder' && <LabSeatFinder onBack={() => setCurrentTab(null)} rollNo={currentUser?.rollNo || '7377221EE001'} />}
              {currentTab === 'cgpa-calc' && <GpaCalculator onBack={() => setCurrentTab(null)} />}
              {currentTab === 'attendance' && <AttendanceTracker currentStudentRollNo={currentUser?.rollNo || '7377221EE001'} currentUserName={currentUser?.name || 'Nithin Annamalai'} isAdmin={isAdmin} onBack={() => setCurrentTab(null)} />}
              {currentTab === 'nptel' && <NptelTracker currentEmail={currentUser?.email || 'student@eee.com'} isAdmin={isAdmin} onBack={() => setCurrentTab(null)} />}
              {currentTab === 'academics' && <AcademicsTracker currentEmail={currentUser?.email || 'student@eee.com'} isAdmin={isAdmin} onBack={() => setCurrentTab(null)} />}
              {currentTab === 'career' && <CareerHub onBack={() => setCurrentTab(null)} isAdmin={isAdmin} />}
              {currentTab === 'courses' && <AcademicCalendar onBack={() => setCurrentTab(null)} isAdmin={isAdmin} viewMode="courses" initialEditMode={academicInitEdit} />}
              {currentTab === 'calendar' && <AcademicCalendar onBack={() => setCurrentTab(null)} isAdmin={isAdmin} viewMode="calendar" initialEditMode={academicInitEdit} />}
              {currentTab === 'timetable' && <Timetable onBack={() => setCurrentTab(null)} isAdmin={isAdmin} semester={6} />}
              {currentTab === 'suggestion' && (
                <SuggestionBox onClose={() => setCurrentTab(null)} userName={currentUser?.name || 'Guest'} />
              )}
              {currentTab === 'campus-map' && <CampusMapPanel onClose={() => setCurrentTab(null)} isAdmin={isAdmin} />}
              {currentTab === 'college-rules' && <CollegeRulesPanel onClose={() => setCurrentTab(null)} isAdmin={isAdmin} />}
              {currentTab === 'faculty' && <FacultyPanel onClose={() => setCurrentTab(null)} isAdmin={isAdmin} />}
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
          className={`bottom-tab-item ${currentTab === 'profile-details' ? 'active' : ''}`}
          onClick={() => { setActiveBottomNav('profile'); handleCardClick('profile-details'); }}
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
interface Lab {
  id?: number;
  name: string;
  block: string;
  icon: string;
}

function CampusMapPanel({ onClose: _onClose, isAdmin = false }: { onClose: () => void; isAdmin?: boolean }) {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBlock, setNewBlock] = useState('');
  const [newIcon, setNewIcon] = useState('⚡');

  useEffect(() => {
    dbService.getLabs().then(setLabs);
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newBlock.trim()) return;
    const saved = await dbService.saveLab({ name: newName.trim(), block: newBlock.trim(), icon: newIcon.trim() });
    setLabs(prev => [...prev, saved]);
    setNewName('');
    setNewBlock('');
    setNewIcon('⚡');
    setShowAddForm(false);
  };

  const handleDelete = async (id?: number) => {
    if (!id || !window.confirm('Delete this facility entry?')) return;
    await dbService.deleteLab(id);
    setLabs(prev => prev.filter(l => l.id !== id));
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>🗺️ EEE Campus & Lab Facilities</h3>
        {isAdmin && (
          <button
            onClick={() => setEditMode(e => !e)}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '3px 8px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer',
              border: `1.5px solid ${editMode ? '#f87171' : 'var(--accent-blue)'}`,
              background: editMode ? 'rgba(248,113,113,0.12)' : 'rgba(56,189,248,0.12)',
              color: editMode ? '#f87171' : 'var(--accent-blue)',
            }}
          >
            {editMode ? <><X size={12} /> Done</> : <><Pencil size={12} /> Edit</>}
          </button>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>Sri Ramakrishna Engineering College · EEE Department</p>
        {editMode && (
          <button
            onClick={() => setShowAddForm(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: 'pointer', background: 'var(--accent-blue)', color: '#fff', border: 'none' }}
          >
            <Plus size={11} /> Add Facility
          </button>
        )}
      </div>

      {editMode && showAddForm && (
        <form onSubmit={handleAdd} style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 12, border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 15 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: 8 }}>
            <div>
              <label className="form-label">Icon</label>
              <input value={newIcon} onChange={e => setNewIcon(e.target.value)} className="form-input" placeholder="⚡" required style={{ fontSize: 11 }} />
            </div>
            <div>
              <label className="form-label">Facility Name</label>
              <input value={newName} onChange={e => setNewName(e.target.value)} className="form-input" placeholder="e.g. Virtual Reality Lab" required style={{ fontSize: 11 }} />
            </div>
          </div>
          <div>
            <label className="form-label">Location / Block</label>
            <input value={newBlock} onChange={e => setNewBlock(e.target.value)} className="form-input" placeholder="e.g. Block C, 2F" required style={{ fontSize: 11 }} />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button type="submit" className="btn-primary" style={{ flex: 1, fontSize: 11 }}>Save Facility</button>
            <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary" style={{ fontSize: 11 }}>Cancel</button>
          </div>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
        {labs.map((l, i) => (
          <div key={l.id ?? i} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--card-border)', borderRadius: 14, padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 4, position: 'relative' }}>
            {editMode && (
              <button
                onClick={() => handleDelete(l.id)}
                style={{ position: 'absolute', right: 8, top: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#f87171' }}
              >
                <Trash2 size={13} />
              </button>
            )}
            <span style={{ fontSize: 24 }}>{l.icon}</span>
            <span style={{ fontWeight: 700, fontSize: 12, paddingRight: editMode ? 20 : 0 }}>{l.name}</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{l.block}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── College Rules Panel ───────────────────────────────
function CollegeRulesPanel({ onClose: _onClose, isAdmin = false }: { onClose: () => void; isAdmin?: boolean }) {
  const [rules, setRules] = useState<Rule[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newIcon, setNewIcon] = useState('📜');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    dbService.getRules().then(setRules);
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;
    const saved = await dbService.saveRule({ icon: newIcon.trim(), title: newTitle.trim(), desc: newDesc.trim() });
    setRules(prev => [...prev, saved]);
    setNewIcon('📜');
    setNewTitle('');
    setNewDesc('');
    setShowAddForm(false);
  };

  const handleDelete = async (id?: number) => {
    if (!id || !window.confirm('Delete this rule?')) return;
    await dbService.deleteRule(id);
    setRules(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>🛡️ Rules & Code of Conduct</h3>
        {isAdmin && (
          <button
            onClick={() => setEditMode(e => !e)}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '3px 8px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer',
              border: `1.5px solid ${editMode ? '#f87171' : 'var(--accent-blue)'}`,
              background: editMode ? 'rgba(248,113,113,0.12)' : 'rgba(56,189,248,0.12)',
              color: editMode ? '#f87171' : 'var(--accent-blue)',
            }}
          >
            {editMode ? <><X size={12} /> Done</> : <><Pencil size={12} /> Edit</>}
          </button>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>EEE Department, SREC Academic Guidelines</p>
        {editMode && (
          <button
            onClick={() => setShowAddForm(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: 'pointer', background: 'var(--accent-blue)', color: '#fff', border: 'none' }}
          >
            <Plus size={11} /> Add Rule
          </button>
        )}
      </div>

      {editMode && showAddForm && (
        <form onSubmit={handleAdd} style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 12, border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 15 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: 8 }}>
            <div>
              <label className="form-label">Icon</label>
              <input value={newIcon} onChange={e => setNewIcon(e.target.value)} className="form-input" placeholder="📜" required style={{ fontSize: 11 }} />
            </div>
            <div>
              <label className="form-label">Rule Title</label>
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)} className="form-input" placeholder="e.g. Lab Dress code" required style={{ fontSize: 11 }} />
            </div>
          </div>
          <div>
            <label className="form-label">Rule Description</label>
            <input value={newDesc} onChange={e => setNewDesc(e.target.value)} className="form-input" placeholder="e.g. Always wear closed shoes" required style={{ fontSize: 11 }} />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button type="submit" className="btn-primary" style={{ flex: 1, fontSize: 11 }}>Save Rule</button>
            <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary" style={{ fontSize: 11 }}>Cancel</button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {rules.map((r, i) => (
          <div key={r.id ?? i} style={{ display: 'flex', gap: 12, background: 'var(--bg-secondary)', border: '1px solid var(--card-border)', borderRadius: 12, padding: '12px 14px', alignItems: 'flex-start', position: 'relative' }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>{r.icon}</span>
            <div style={{ flex: 1, paddingRight: editMode ? 24 : 0 }}>
              <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 2 }}>{r.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{r.desc}</div>
            </div>
            {editMode && (
              <button
                onClick={() => handleDelete(r.id)}
                style={{ position: 'absolute', right: 12, top: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#f87171' }}
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Faculty Contacts Panel ────────────────────────────
function FacultyPanel({ onClose: _onClose, isAdmin = false }: { onClose: () => void; isAdmin?: boolean }) {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');

  useEffect(() => {
    dbService.getFaculty().then(setFaculty);
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newRole.trim() || !newEmail.trim() || !newPhone.trim()) return;
    const saved = await dbService.saveFaculty({ name: newName.trim(), role: newRole.trim(), email: newEmail.trim(), phone: newPhone.trim() });
    setFaculty(prev => [...prev, saved]);
    setNewName('');
    setNewRole('');
    setNewEmail('');
    setNewPhone('');
    setShowAddForm(false);
  };

  const handleDelete = async (id?: number) => {
    if (!id || !window.confirm('Delete this faculty record?')) return;
    await dbService.deleteFaculty(id);
    setFaculty(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>📞 Faculty Directory</h3>
        {isAdmin && (
          <button
            onClick={() => setEditMode(e => !e)}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '3px 8px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer',
              border: `1.5px solid ${editMode ? '#f87171' : 'var(--accent-blue)'}`,
              background: editMode ? 'rgba(248,113,113,0.12)' : 'rgba(56,189,248,0.12)',
              color: editMode ? '#f87171' : 'var(--accent-blue)',
            }}
          >
            {editMode ? <><X size={12} /> Done</> : <><Pencil size={12} /> Edit</>}
          </button>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>EEE Department Professors &amp; Mentors</p>
        {editMode && (
          <button
            onClick={() => setShowAddForm(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: 'pointer', background: 'var(--accent-blue)', color: '#fff', border: 'none' }}
          >
            <Plus size={11} /> Add Faculty
          </button>
        )}
      </div>

      {editMode && showAddForm && (
        <form onSubmit={handleAdd} style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 12, border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 15 }}>
          <div>
            <label className="form-label">Full Name</label>
            <input value={newName} onChange={e => setNewName(e.target.value)} className="form-input" placeholder="e.g. Dr. A. Rajan" required style={{ fontSize: 11 }} />
          </div>
          <div>
            <label className="form-label">Designation / Specialization</label>
            <input value={newRole} onChange={e => setNewRole(e.target.value)} className="form-input" placeholder="e.g. Professor - Power Electronics" required style={{ fontSize: 11 }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <label className="form-label">Email Address</label>
              <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="form-input" placeholder="rajan@srec.ac.in" required style={{ fontSize: 11 }} />
            </div>
            <div>
              <label className="form-label">Mobile Number</label>
              <input value={newPhone} onChange={e => setNewPhone(e.target.value)} className="form-input" placeholder="+91-98400-12345" required style={{ fontSize: 11 }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button type="submit" className="btn-primary" style={{ flex: 1, fontSize: 11 }}>Save Faculty</button>
            <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary" style={{ fontSize: 11 }}>Cancel</button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {faculty.map((f, i) => (
          <div
            key={f.id ?? i}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--card-border)',
              borderRadius: 16,
              padding: '16px 14px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            {editMode && (
              <button
                onClick={() => handleDelete(f.id)}
                style={{ position: 'absolute', right: 10, top: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#f87171' }}
              >
                <Trash2 size={14} />
              </button>
            )}

            {/* LEFT: Avatar + Name */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 68, flexShrink: 0 }}>
              <div style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: `hsl(${i * 60}, 60%, 85%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                fontWeight: 900,
                color: '#111',
                boxShadow: `0 0 0 3px hsl(${i * 60}, 50%, 75%)40`,
              }}>
                {f.name.charAt(0)}
              </div>
              <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text-main)', textAlign: 'center', lineHeight: 1.3, maxWidth: 80 }}>
                {f.name}
              </div>
            </div>

            {/* Divider */}
            <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--card-border)', flexShrink: 0 }} />

            {/* RIGHT: Designation, Dept, Email, Phone */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-blue)', lineHeight: 1.3 }}>
                {f.role}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
                Dept of EEE · SREC
              </div>
              <a
                href={`mailto:${f.email}`}
                style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                ✉️ {f.email}
              </a>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)' }}>
                📱 {f.phone}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
