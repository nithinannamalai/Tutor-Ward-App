import { useState, useEffect } from 'react';
import { dbService } from './services/db';
import type { Announcement } from './services/db';
import { AnnouncementBanner } from './components/AnnouncementBanner';

import { ProfileDocs } from './components/ProfileDocs';
import { AttendanceTracker } from './components/AttendanceTracker';
import { NptelTracker } from './components/NptelTracker';
import { AcademicsTracker } from './components/AcademicsTracker';
import { CareerHub } from './components/CareerHub';
import { AcademicCalendar } from './components/AcademicCalendar';
import { AIChatbot } from './components/AIChatbot';
import { AuthModal } from './components/AuthModal';
import { Zap, ShieldAlert, BookOpen, GraduationCap, Calendar, UserCheck, Award, LogOut, Sparkles, ArrowRight, Map, FileText, Inbox, Shield, Phone } from 'lucide-react';
import './App.css';

// Simulation accounts for testing
const USER_PROFILES = [
  { email: 'student@eee.com', name: 'Nithin Annamalai', rollNo: 'EEE001', role: 'student' },
  { email: 'student2@eee.com', name: 'Aravind Swamy', rollNo: 'EEE002', role: 'student' },
  { email: 'teacher@eee.com', name: 'Dr. R. Ramanujam', rollNo: 'ADMIN', role: 'teacher' }
];

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<typeof USER_PROFILES[0] | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentTab, setCurrentTab] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [navHidden, setNavHidden] = useState(false);

  useEffect(() => {
    loadAnnouncements();
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);

    let lastY = 0;
    const handleScroll = () => {
      const y = window.scrollY;
      setNavHidden(y > lastY && y > 60);
      lastY = y;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Mouse-tracking spotlight: update CSS vars on the root
    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--mx', `${e.clientX}px`);
      document.documentElement.style.setProperty('--my', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
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

  const handleLoginSuccess = (userProfile: typeof USER_PROFILES[0]) => {
    setCurrentUser(userProfile);
    setIsAuthenticated(true);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setCurrentTab(null);
  };

  const isAdmin = currentUser?.role === 'teacher';

  // Card click: open auth modal if guest, open tool modal if authenticated
  const handleCardClick = (title: string) => {
    if (!isAuthenticated) { setShowAuthModal(true); return; }
    const map: Record<string, string> = {
      'Course Details': 'courses',
      'Academic Calendar': 'courses',
      'CGPA & Arrears': 'academics',
      'NPTEL Tracking': 'nptel',
      'Student Documents': 'profile',
      'Certificates': 'profile',
      'Letters': 'profile',
      'Period Attendance': 'attendance',
      'Suggestion Box': 'suggestion',
      'Career Navigation': 'career',
      'Campus Map': 'campus-map',
      'College Rules': 'college-rules',
      'Faculty Contacts': 'faculty',
    };
    setCurrentTab(map[title] ?? null);
  };

  // ====================================================
  // UNIFIED LANDING PAGE (adapts for guest vs. authenticated)
  // ====================================================
  {
    return (
      <div className="desktop-layout" style={{ animation: 'fadeInUp 0.4s ease' }}>
        {/* ── Top Brand Bar: college left | EEE centre | actions right ── */}
        <div className={`landing-brand-bar${navHidden ? ' brand-bar--hidden' : ''}`}>
          {/* LEFT: college identity */}
          <div className="bar-college">
            <div className="bar-college-logo" aria-label="SREC Logo">
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
                <circle cx="20" cy="20" r="18" fill="#0052cc" />
                <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle"
                  fill="#fff" fontSize="13" fontWeight="bold" fontFamily="sans-serif">SR</text>
              </svg>
            </div>
            <div className="bar-college-text">
              <span className="bar-college-name">Sri Ramakrishna Engineering College</span>
              <span className="bar-college-sub">Autonomous · Affiliated to Anna University</span>
            </div>
          </div>

          {/* CENTRE: department identity */}
          <div className="bar-dept">
            <div className="brand-logo">
              <Zap size={20} fill="currentColor" />
            </div>
            <div>
              <p className="bar-dept-name">EEE SREC</p>
              <p className="bar-dept-sub">Smart Academic Portal</p>
            </div>
          </div>

          {/* RIGHT: action buttons — changes based on auth */}
          <div className="bar-actions">
            {isAuthenticated && currentUser ? (
              <>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                  👤 {currentUser.name.split(' ')[0]}
                </span>
                <button className="nav-btn btn-login-outline" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <LogOut size={12} /> Exit
                </button>
              </>
            ) : (
              <>
                <button className="nav-btn btn-login-outline" onClick={() => setShowAuthModal(true)}>Demo Access</button>
                <button className="nav-btn btn-login-filled" onClick={() => setShowAuthModal(true)}>Sign In</button>
              </>
            )}
          </div>
        </div>

        {/* ── Oval Nav Bar (always sticky) ── */}
        <div className="landing-oval-nav">
          <nav className="oval-nav-inner">
            <a href="#hero" className="oval-nav-link">Home</a>
            <a href="#features" className="oval-nav-link">Features</a>
            <a href="#announcements" className="oval-nav-link">Notice Board</a>
            <a href="#about" className="oval-nav-link">About</a>
          </nav>
        </div>

        {/* ── Hero ── */}
        <section className="landing-hero" id="hero">
          {/* Animated floating particles + interactive magnetic orb */}
          <div className="hero-particles" aria-hidden="true">
            {[...Array(22)].map((_, i) => (
              <div key={i} className={`hero-particle hero-particle--${(i % 5) + 1}`} style={{ '--i': i } as React.CSSProperties} />
            ))}
            <div className="hero-orb hero-orb--1" />
            <div className="hero-orb hero-orb--2" />
            <div className="hero-orb hero-orb--3" />
            <div className="hero-circuit-line hero-circuit-line--1" />
            <div className="hero-circuit-line hero-circuit-line--2" />
            <div className="hero-circuit-line hero-circuit-line--3" />
            {/* Hex grid nodes */}
            {[...Array(8)].map((_, i) => (
              <div key={`hex-${i}`} className={`hero-hex hero-hex--${i + 1}`} />
            ))}
          </div>

          <div className="hero-text">
            <div className="hero-badge">
              <Sparkles size={14} fill="currentColor" />
              NBA Accredited Department
            </div>
            {isAuthenticated && currentUser ? (
              <>
                <p style={{ margin: '0 0 4px 0', fontSize: 14, opacity: 0.8 }}>Welcome back,</p>
                <h2 style={{ fontSize: isDesktop ? '40px' : '28px' }}>{currentUser.name}</h2>
                <p style={{ marginTop: 4 }}>
                  {isAdmin
                    ? <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><ShieldAlert size={14} /> Administrator Access · EEE Department</span>
                    : `Roll No: ${currentUser.rollNo} · UG Scholar · EEE Department`}
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
                  <button className="cta-button" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
                    Go to Dashboard <ArrowRight size={16} />
                  </button>
                  <button className="cta-button secondary" onClick={handleLogout}>
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 style={{ fontSize: isDesktop ? '40px' : '28px' }}>
                  The Smart Digital Hub<br />for Electrical Engineering
                </h2>
                <p>
                  Access personalised academic records, period-wise attendance, NPTEL course mappings,
                  GATE study schedules and placement roadmaps — all in one place.
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
                  <button className="cta-button" onClick={() => setShowAuthModal(true)}>
                    Access Dashboard <ArrowRight size={16} />
                  </button>
                  <button className="cta-button secondary" onClick={() => setShowAuthModal(true)}>
                    Try Demo Access
                  </button>
                </div>
              </>
            )}
          </div>

          {/* ── Notice Board: title above-left of white box, arrows outside ── */}
          <div className="notice-panel-wrapper" id="announcements">
            {/* Row: [prev-btn] [white-box] [next-btn]  title floats above white-box only */}
            <div className="notice-panel-row">
              <button
                className="notice-circle-btn"
                aria-label="Previous"
                onClick={() =>
                  setAnnouncements(prev => {
                    if (prev.length < 2) return prev;
                    const c = [...prev]; c.unshift(c.pop()!); return c;
                  })
                }
              >‹</button>
              <div className="notice-box-col">
                <h4 className="notice-panel-title">🔔 Notice Board &amp; Events</h4>
                <div className="notice-white-box">
                  <AnnouncementBanner
                    announcements={announcements}
                    isAdmin={isAdmin}
                    onAddAnnouncement={handleAddAnnouncement}
                  />
                </div>
              </div>
              <button
                className="notice-circle-btn"
                aria-label="Next"
                onClick={() =>
                  setAnnouncements(prev => {
                    if (prev.length < 2) return prev;
                    const c = [...prev]; c.push(c.shift()!); return c;
                  })
                }
              >›</button>
            </div>
          </div>
        </section>

        {/* ── Feature Grid ── */}
        <section className="landing-feature-section" id="features">
          {/* ACADEMIC HUB centred banner */}
          <div className="academic-hub-banner">
            <span className="academic-hub-title">🎓 ACADEMIC HUB</span>
            <span className="academic-hub-sub">All your records and requirements in one place</span>
          </div>

          {[
            {
              category: 'Academics',
              items: [
                { imgUrl: null, fallback: <BookOpen size={28} />, title: 'Course Details', desc: 'Full syllabus, credits & subject outlines.', color: '#0891b2' },
                { imgUrl: null, fallback: <Calendar size={28} />, title: 'Academic Calendar', desc: 'Exam dates, events & semester schedules.', color: '#dc2626' },
                { imgUrl: null, fallback: <GraduationCap size={28} />, title: 'CGPA & Arrears', desc: 'Live CGPA with subject-wise arrear details.', color: '#059669' },
                { imgUrl: null, fallback: <Award size={28} />, title: 'NPTEL Tracking', desc: 'Log and get credit for NPTEL certificates.', color: '#7c3aed' },
              ]
            },
            {
              category: 'Records & Documents',
              items: [
                { imgUrl: null, fallback: <BookOpen size={28} />, title: 'Student Documents', desc: 'Upload & view PDF records securely.', color: '#0052cc' },
                { imgUrl: null, fallback: <Award size={28} />, title: 'Certificates', desc: 'Download & manage your achievement certificates.', color: '#be185d' },
                { imgUrl: null, fallback: <FileText size={28} />, title: 'Letters', desc: 'Request academic, reference & conduct letters.', color: '#4f46e5' },
              ]
            },
            {
              category: 'Student Services',
              items: [
                { imgUrl: null, fallback: <UserCheck size={28} />, title: 'Period Attendance', desc: 'Period-wise (1–7) dynamic ring tracker.', color: '#ff5f1f' },
                { imgUrl: null, fallback: <Inbox size={28} />, title: 'Suggestion Box', desc: 'Submit feedback & suggestions anonymously.', color: '#ea580c' },
              ]
            },
            {
              category: 'Career & Opportunities',
              items: [
                { imgUrl: null, fallback: <Zap size={28} />, title: 'Career Navigation', desc: 'GATE, UPSC ESE & placement roadmaps.', color: '#d97706' },
              ]
            },
            {
              category: 'Campus & Administration',
              items: [
                { imgUrl: null, fallback: <Map size={28} />, title: 'Campus Map', desc: 'Interactive map of EEE blocks & campus labs.', color: '#2563eb' },
                { imgUrl: null, fallback: <Shield size={28} />, title: 'College Rules', desc: 'Code of conduct, dress codes & lab policies.', color: '#16a34a' },
                { imgUrl: null, fallback: <Phone size={28} />, title: 'Faculty Contacts', desc: 'Directory of professors & academic advisors.', color: '#db2777' },
              ]
            }
          ].map((cat, idx) => (
            <div key={idx} className="category-block">
              <h4 className="category-heading">
                <span className="category-heading-line" style={{ background: cat.items[0]?.color }} />
                {cat.category}
              </h4>
              <div className="nithra-grid">
                {cat.items.map((item, i) => (
                  <div key={i} className="nithra-card" onClick={() => handleCardClick(item.title)} style={{ '--card-theme': item.color } as React.CSSProperties}>
                    <div className="nithra-icon-wrap" style={{ background: `${item.color}1a`, color: item.color }}>
                      {item.imgUrl
                        ? <img src={item.imgUrl} alt={item.title} style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 8 }} />
                        : item.fallback
                      }
                    </div>
                    <span className="nithra-card-title">{item.title}</span>
                    <span className="nithra-card-desc">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* ── Footer ── */}
        <footer className="landing-footer" id="about">
          <div className="footer-content">
            <div className="footer-brand">
              <h4>Department of Electrical &amp; Electronics Engineering</h4>
              <p>Providing high-standard curriculums, automation tools and integrated placement structures for young scholars.</p>
            </div>
            <div className="footer-links-col">
              <h5>Resources</h5>
              <ul>
                <li><a href="#" onClick={e => { e.preventDefault(); setShowAuthModal(true); }}>Sign In</a></li>
                <li><a href="#" onClick={e => { e.preventDefault(); setShowAuthModal(true); }}>NPTEL Tracker</a></li>
                <li><a href="#" onClick={e => { e.preventDefault(); setShowAuthModal(true); }}>GPA Calculator</a></li>
              </ul>
            </div>
            <div className="footer-links-col">
              <h5>Department Desk</h5>
              <p style={{ fontSize: 11, lineHeight: 1.6, margin: 0 }}>
                Email: eee-desk@college.edu<br />
                Office: EEE Block, Room 204<br />
                HOD: Dr. R. Ramanujam
              </p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} EEE Department Portal. All rights reserved.</p>
            <p>Mobile (Android, iOS) &amp; Desktop (Windows, macOS)</p>
          </div>
        </footer>

        {showAuthModal && (
          <AuthModal
            onClose={() => setShowAuthModal(false)}
            onLoginSuccess={handleLoginSuccess}
            demoProfiles={USER_PROFILES}
          />
        )}

        {/* ── Tool Modal Overlays (slide up over the landing page) ── */}
        {currentTab && currentUser && (
          <div className="portal-modal-overlay" onClick={() => setCurrentTab(null)}>
            <div className="portal-modal-container" onClick={e => e.stopPropagation()}>
              <button className="portal-modal-close" onClick={() => setCurrentTab(null)}>✕</button>
              {currentTab === 'profile' && <ProfileDocs currentEmail={currentUser.email} isAdmin={isAdmin} onBack={() => setCurrentTab(null)} />}
              {currentTab === 'attendance' && <AttendanceTracker currentStudentRollNo={currentUser.rollNo} currentUserName={currentUser.name} isAdmin={isAdmin} onBack={() => setCurrentTab(null)} />}
              {currentTab === 'nptel' && <NptelTracker currentEmail={currentUser.email} isAdmin={isAdmin} onBack={() => setCurrentTab(null)} />}
              {currentTab === 'academics' && <AcademicsTracker currentEmail={currentUser.email} isAdmin={isAdmin} onBack={() => setCurrentTab(null)} />}
              {currentTab === 'career' && <CareerHub onBack={() => setCurrentTab(null)} />}
              {currentTab === 'courses' && <AcademicCalendar onBack={() => setCurrentTab(null)} />}
              {currentTab === 'suggestion' && (
                <SuggestionBox onClose={() => setCurrentTab(null)} userName={currentUser.name} />
              )}
              {currentTab === 'campus-map' && <CampusMapPanel onClose={() => setCurrentTab(null)} />}
              {currentTab === 'college-rules' && <CollegeRulesPanel onClose={() => setCurrentTab(null)} />}
              {currentTab === 'faculty' && <FacultyPanel onClose={() => setCurrentTab(null)} />}
            </div>
          </div>
        )}

        <AIChatbot />
      </div>
    );
  }

  return null;
}

// ── Suggestion Box ────────────────────────────────────
function SuggestionBox({ onClose, userName }: { onClose: () => void; userName: string }) {
  const [cat, setCat] = useState('Academic');
  const [msg, setMsg] = useState('');
  const [done, setDone] = useState(false);
  const submit = () => { if (msg.trim()) setDone(true); };
  return (
    <div style={{ padding: 32, maxWidth: 480, margin: '0 auto' }}>
      <h3 style={{ margin: '0 0 4px 0', fontSize: 20, fontWeight: 800 }}>💬 Suggestion Box</h3>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 24 }}>Your feedback is anonymous. Share freely.</p>
      {done ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
          <h4 style={{ color: '#059669', margin: '0 0 8px 0' }}>Suggestion Submitted!</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Thank you, {userName.split(' ')[0]}. Your feedback helps us improve.</p>
          <button className="cta-button" style={{ marginTop: 20 }} onClick={onClose}>Back to Portal</button>
        </div>
      ) : (
        <>
          <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Category</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '8px 0 20px' }}>
            {['Academic', 'Infrastructure', 'Faculty', 'Sports', 'Other'].map(c => (
              <button key={c} onClick={() => setCat(c)}
                style={{
                  padding: '6px 14px', borderRadius: 20, border: '1.5px solid', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  borderColor: cat === c ? 'var(--accent-blue)' : 'var(--card-border)',
                  background: cat === c ? 'var(--accent-blue)' : 'transparent',
                  color: cat === c ? '#fff' : 'var(--text-muted)'
                }}>{c}</button>
            ))}
          </div>
          <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Your Feedback</label>
          <textarea value={msg} onChange={e => setMsg(e.target.value)}
            placeholder="Share your thoughts, ideas or concerns..."
            style={{
              width: '100%', minHeight: 120, marginTop: 8, padding: 12, borderRadius: 12,
              border: '1.5px solid var(--card-border)', fontSize: 13, resize: 'vertical',
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
    { name: 'HOD Office', block: 'Block A, 2F – Room 204', icon: '🏫' },
    { name: 'Department Library', block: 'Block B, 1F', icon: '📚' },
  ];
  return (
    <div style={{ padding: 32 }}>
      <h3 style={{ margin: '0 0 4px 0', fontSize: 20, fontWeight: 800 }}>🗺️ EEE Campus Map</h3>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 24 }}>Sri Ramakrishna Engineering College · EEE Department Facilities</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
        {labs.map((l, i) => (
          <div key={i} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--card-border)', borderRadius: 14, padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 28 }}>{l.icon}</span>
            <span style={{ fontWeight: 700, fontSize: 13 }}>{l.name}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l.block}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── College Rules Panel ───────────────────────────────
function CollegeRulesPanel({ onClose: _onClose }: { onClose: () => void }) {
  const rules = [
    { icon: '👔', title: 'Dress Code', desc: 'Formal or semi-formal attire on all working days. Lab coat mandatory during lab sessions.' },
    { icon: '📊', title: 'Attendance', desc: 'Minimum 75% attendance per subject required. Below 65% will result in detention.' },
    { icon: '🥾', title: 'Lab Safety', desc: 'Safety shoes and lab coat are compulsory. Mobile phones prohibited inside labs.' },
    { icon: '🤫', title: 'Discipline', desc: 'Maintain silence in classrooms and library. Ragging is strictly prohibited.' },
    { icon: '📱', title: 'Mobile Policy', desc: 'Mobile phones must be in silent mode during class hours.' },
    { icon: '🏆', title: 'Academic Integrity', desc: 'Plagiarism and malpractice in exams will result in disciplinary action.' },
    { icon: '🚗', title: 'Campus Entry', desc: 'Students must carry their ID cards at all times on campus.' },
    { icon: '⏰', title: 'Punctuality', desc: 'Late entry to class after 10 minutes from start will be marked absent.' },
  ];
  return (
    <div style={{ padding: 32 }}>
      <h3 style={{ margin: '0 0 4px 0', fontSize: 20, fontWeight: 800 }}>🛡️ College Rules & Code of Conduct</h3>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 24 }}>EEE Department, SREC — Academic regulations you must follow.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {rules.map((r, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, background: 'var(--bg-secondary)', border: '1px solid var(--card-border)', borderRadius: 14, padding: '14px 16px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>{r.icon}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{r.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{r.desc}</div>
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
    { name: 'Ms. P. Vijayalakshmi', role: 'Asst. Professor – Control Systems', email: 'p.vijaya@srec.ac.in', phone: '+91-98400-00004' },
    { name: 'Mr. K. Senthilkumar', role: 'Asst. Professor – Power Electronics', email: 'k.senthil@srec.ac.in', phone: '+91-98400-00005' },
    { name: 'Ms. R. Priyanka', role: 'Asst. Professor – Microprocessors', email: 'r.priyanka@srec.ac.in', phone: '+91-98400-00006' },
  ];
  return (
    <div style={{ padding: 32 }}>
      <h3 style={{ margin: '0 0 4px 0', fontSize: 20, fontWeight: 800 }}>📞 Faculty Contacts</h3>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 24 }}>EEE Department – Sri Ramakrishna Engineering College</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
        {faculty.map((f, i) => (
          <div key={i} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--card-border)', borderRadius: 14, padding: '18px 16px' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: `hsl(${i * 60}, 60%, 85%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 10 }}>
              {f.name.charAt(0)}
            </div>
            <div style={{ fontWeight: 800, fontSize: 13 }}>{f.name}</div>
            <div style={{ fontSize: 11, color: 'var(--accent-blue)', marginBottom: 8 }}>{f.role}</div>
            <a href={`mailto:${f.email}`} style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', textDecoration: 'none', marginBottom: 2 }}>✉️ {f.email}</a>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>📱 {f.phone}</span>
          </div>
        ))}
      </div>
    </div>
  );
}


export default App;
