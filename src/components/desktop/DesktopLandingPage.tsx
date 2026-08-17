import React from 'react';
import { Sparkles, BookOpen, Calendar, GraduationCap, Award, FileText, UserCheck, Map, Shield, ArrowRight, CheckCircle2, ShieldCheck, Zap, LogIn, Users } from 'lucide-react';
import appLogo from '../../assets/app-logo.png';

interface DesktopLandingPageProps {
  onOpenLogin: () => void;
  onEnterAsGuest: () => void;
}

export const DesktopLandingPage: React.FC<DesktopLandingPageProps> = ({ onOpenLogin, onEnterAsGuest }) => {
  return (
    <div className="desktop-landing-page">
      {/* ── Desktop Top Navigation Bar ── */}
      <header className="desktop-landing-nav">
        <div className="desktop-landing-brand">
          <img src={appLogo} alt="EEE SREC Logo" style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'cover' }} />
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-main)', margin: 0, lineHeight: 1.1 }}>EEE SREC</h2>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Smart Academic Hub</span>
          </div>
        </div>

        <div className="desktop-landing-links">
          <a href="#features" className="desktop-landing-link">Features</a>
          <a href="#stats" className="desktop-landing-link">Department Stats</a>
          <a href="#portals" className="desktop-landing-link">Academic Portals</a>
          <a href="#contact" className="desktop-landing-link">Contact</a>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn-secondary" onClick={onEnterAsGuest} style={{ padding: '8px 18px', borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
            Guest Preview
          </button>
          <button className="btn-primary" onClick={onOpenLogin} style={{ padding: '9px 22px', borderRadius: 20, fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
            <LogIn size={16} /> Student Sign In
          </button>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="desktop-hero-section">
        <div className="desktop-hero-badge">
          <Sparkles size={14} style={{ color: '#f59e0b' }} />
          <span>OFFICIAL STUDENT &amp; TUTOR PORTAL 2026</span>
        </div>

        <h1 className="desktop-hero-title">
          Department of Electrical &amp; Electronics Engineering
        </h1>
        <p className="desktop-hero-subtitle">
          Sri Ramakrishna Engineering College · Autonomous Institution Affiliated to Anna University
        </p>
        <p className="desktop-hero-desc">
          Empowering EEE students with AI Tutors, Live Attendance Analytics, Instant On-Duty Requests, Bonafide Letter Generation, and Lab Exam Seat Locators in one unified web platform.
        </p>

        <div style={{ display: 'flex', gap: 16, marginTop: 24, justifyContent: 'center' }}>
          <button className="btn-primary" onClick={onOpenLogin} style={{ padding: '14px 32px', borderRadius: 30, fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 24px rgba(0, 82, 204, 0.35)' }}>
            Enter Student Portal <ArrowRight size={18} />
          </button>
          <button className="btn-secondary" onClick={onEnterAsGuest} style={{ padding: '14px 28px', borderRadius: 30, fontSize: 15, fontWeight: 700 }}>
            Explore Features as Guest
          </button>
        </div>

        {/* Live Department Stats Bar */}
        <div id="stats" className="desktop-stats-bar">
          <div className="desktop-stat-card">
            <div className="stat-value">1,200+</div>
            <div className="stat-label">Active EEE Students</div>
          </div>
          <div className="desktop-stat-card">
            <div className="stat-value">98.4%</div>
            <div className="stat-label">Placement Record</div>
          </div>
          <div className="desktop-stat-card">
            <div className="stat-value">14+</div>
            <div className="stat-label">Advanced Research Labs</div>
          </div>
          <div className="desktop-stat-card">
            <div className="stat-value">45+</div>
            <div className="stat-label">Expert Faculty Members</div>
          </div>
        </div>
      </section>

      {/* ── Feature Showcase Section ── */}
      <section id="features" className="desktop-features-section">
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: 1 }}>MODULE SHOWCASE</span>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-main)', margin: '6px 0 0 0' }}>Everything You Need for Academic Excellence</h2>
        </div>

        <div className="desktop-features-grid">
          <div className="desktop-feature-card">
            <div className="feature-icon-wrap" style={{ background: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6' }}>
              <Sparkles size={28} />
            </div>
            <h3>AI Tutor Assistant</h3>
            <p>24/7 intelligent tutoring powered by AI for EEE course doubts, circuit analysis, and exam prep.</p>
          </div>

          <div className="desktop-feature-card">
            <div className="feature-icon-wrap" style={{ background: 'rgba(0, 82, 204, 0.12)', color: '#0052cc' }}>
              <UserCheck size={28} />
            </div>
            <h3>Live Attendance Tracker</h3>
            <p>Real-time subject-wise attendance logs, percentage calculations, and shortfall warning alerts.</p>
          </div>

          <div className="desktop-feature-card">
            <div className="feature-icon-wrap" style={{ background: 'rgba(79, 70, 229, 0.12)', color: '#4f46e5' }}>
              <FileText size={28} />
            </div>
            <h3>Instant OD Request Form</h3>
            <p>Submit and track On-Duty requests with automated PDF generation for tutor and HOD approvals.</p>
          </div>

          <div className="desktop-feature-card">
            <div className="feature-icon-wrap" style={{ background: 'rgba(217, 119, 6, 0.12)', color: '#d97706' }}>
              <Map size={28} />
            </div>
            <h3>Lab Exam Seat Finder</h3>
            <p>Search roll number to locate assigned practical exam hall, room number, bench, and supervisor.</p>
          </div>

          <div className="desktop-feature-card">
            <div className="feature-icon-wrap" style={{ background: 'rgba(5, 150, 105, 0.12)', color: '#059669' }}>
              <GraduationCap size={28} />
            </div>
            <h3>Target GPA Calculator</h3>
            <p>Simulate semester GPA and calculate required internal marks to reach your target CGPA goal.</p>
          </div>

          <div className="desktop-feature-card">
            <div className="feature-icon-wrap" style={{ background: 'rgba(124, 58, 237, 0.12)', color: '#7c3aed' }}>
              <Award size={28} />
            </div>
            <h3>NPTEL Certificate Vault</h3>
            <p>Upload, store, and verify NPTEL online course completion certificates for credit transfers.</p>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="desktop-landing-footer">
        <div>
          <h4 style={{ margin: '0 0 6px 0', fontSize: 14, fontWeight: 800 }}>Sri Ramakrishna Engineering College</h4>
          <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>NGGO Colony Post, Coimbatore - 641 022, Tamil Nadu, India</p>
        </div>
        <div style={{ fontSize: 12, opacity: 0.8 }}>
          © 2026 Department of EEE · SREC Smart Tutor-Ward Platform
        </div>
      </footer>
    </div>
  );
};
