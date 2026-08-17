import React from 'react';
import { Search, Sparkles, LogIn, UserPlus, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import appLogo from '../../assets/app-logo.png';

interface DesktopLandingPageProps {
  onOpenLogin: (isSignUp?: boolean) => void;
}

export const DesktopLandingPage: React.FC<DesktopLandingPageProps> = ({ onOpenLogin }) => {
  return (
    <div className="dark-neon-landing-page">
      {/* Top Navigation Bar */}
      <header className="dark-landing-nav">
        <div className="dark-nav-brand">
          <div className="dark-brand-logo-wrap">
            <img src={appLogo} alt="EEE SREC Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 16, fontWeight: 900, color: '#ffffff', letterSpacing: 1.5, textTransform: 'uppercase' }}>
              EEE SREC
            </span>
            <span style={{ fontSize: 9, fontWeight: 800, color: '#3b82f6', letterSpacing: 1, textTransform: 'uppercase' }}>
              SMART HUB 2026
            </span>
          </div>
        </div>

        <div className="dark-nav-links">
          <a href="#about">ABOUT</a>
          <a href="#features">FEATURES</a>
          <a href="#academics">ACADEMICS</a>
          <a href="#contact">CONTACT</a>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button className="dark-signin-pill" onClick={() => onOpenLogin(false)}>
            <LogIn size={15} /> SIGN IN
          </button>
          <button className="dark-signup-outline" onClick={() => onOpenLogin(true)}>
            <UserPlus size={15} /> REGISTER
          </button>
        </div>
      </header>

      {/* Main Hero Container */}
      <main className="dark-hero-container">
        {/* Left Content Side */}
        <div className="dark-hero-left">
          <div className="dark-hero-tag">
            <Sparkles size={13} style={{ color: '#a855f7' }} />
            <span>SRI RAMAKRISHNA ENGINEERING COLLEGE · DEPT OF EEE</span>
          </div>

          <h1 className="dark-hero-welcome">Welcome.</h1>

          {/* Capsule Search Bar */}
          <div className="dark-capsule-search">
            <input 
              type="text" 
              placeholder="Search features (AI Tutor, Attendance, OD Form, CGPA)..." 
              onClick={() => onOpenLogin(false)} 
              readOnly
            />
            <button className="search-circle-btn" onClick={() => onOpenLogin(false)}>
              <Search size={18} />
            </button>
          </div>

          {/* Action Pills */}
          <div className="dark-action-pills">
            <button className="pill-primary-blue" onClick={() => onOpenLogin(false)}>
              STUDENT PORTAL
            </button>
            <button className="pill-outline-glow" onClick={() => onOpenLogin(false)}>
              SEE MORE <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Right Side Graphic with Neon Topographic Contour Waves */}
        <div className="dark-hero-right">
          <div className="dark-graphic-header">
            <div className="dark-brand-symbol">
              <Zap size={28} style={{ color: '#a855f7' }} />
            </div>
            <div>
              <h2 className="dark-hub-title">Academic Hub.</h2>
              <p className="dark-hub-subtitle">
                Department of Electrical &amp; Electronics Engineering. Autonomous Institution Affiliated to Anna University.
              </p>
            </div>
          </div>

          {/* SVG Topographic Contour Wave Animations */}
          <div className="dark-contour-waves">
            <svg viewBox="0 0 500 500" className="contour-svg">
              <defs>
                <linearGradient id="neonGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#ec4899" stopOpacity="0.9" />
                </linearGradient>
                <linearGradient id="neonGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {/* Concentric Topographic Contours */}
              <path d="M 250 50 C 350 70 420 150 430 250 C 440 350 360 430 250 440 C 140 450 60 370 50 250 C 40 130 150 30 250 50 Z" stroke="url(#neonGrad1)" strokeWidth="2.5" fill="none" className="contour-path-1" />
              <path d="M 250 80 C 330 95 390 160 400 250 C 410 330 340 400 250 410 C 160 420 90 350 80 250 C 70 150 170 65 250 80 Z" stroke="url(#neonGrad1)" strokeWidth="2.2" fill="none" className="contour-path-2" />
              <path d="M 250 110 C 310 120 360 175 370 250 C 380 310 320 370 250 380 C 180 390 110 330 100 250 C 90 170 190 100 250 110 Z" stroke="url(#neonGrad1)" strokeWidth="2.0" fill="none" className="contour-path-3" />
              <path d="M 250 140 C 290 150 330 190 340 250 C 350 290 300 340 250 350 C 200 360 130 310 120 250 C 110 190 210 130 250 140 Z" stroke="url(#neonGrad2)" strokeWidth="1.8" fill="none" className="contour-path-4" />
              <path d="M 250 170 C 275 180 300 205 310 250 C 320 280 280 310 250 320 C 220 330 150 290 140 250 C 130 210 225 160 250 170 Z" stroke="url(#neonGrad2)" strokeWidth="1.6" fill="none" className="contour-path-5" />
              <path d="M 250 200 C 260 205 275 220 280 250 C 285 270 260 285 250 290 C 240 295 180 270 170 250 C 160 230 240 195 250 200 Z" stroke="url(#neonGrad2)" strokeWidth="1.5" fill="none" className="contour-path-6" />
            </svg>
          </div>
        </div>
      </main>

      {/* Feature Highlights Section */}
      <section id="features" style={{ padding: '60px 80px', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#3b82f6', letterSpacing: 1.5, textTransform: 'uppercase' }}>SYSTEM MODULES</span>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: '#ffffff', margin: '6px 0 0 0' }}>SREC EEE Smart Platform Modules</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          <div className="dark-module-card" onClick={() => onOpenLogin(false)}>
            <div className="module-icon" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#a855f7' }}>
              <Sparkles size={26} />
            </div>
            <h3>AI Tutor Assistant</h3>
            <p>24/7 intelligent tutoring powered by AI for circuit analysis, power systems, and exam prep.</p>
          </div>

          <div className="dark-module-card" onClick={() => onOpenLogin(false)}>
            <div className="module-icon" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' }}>
              <ShieldCheck size={26} />
            </div>
            <h3>Live Attendance Tracker</h3>
            <p>Real-time subject-wise attendance logs, percentage calculations, and shortfall warnings.</p>
          </div>

          <div className="dark-module-card" onClick={() => onOpenLogin(false)}>
            <div className="module-icon" style={{ background: 'rgba(236, 72, 153, 0.2)', color: '#ec4899' }}>
              <Zap size={26} />
            </div>
            <h3>Instant OD Request Form</h3>
            <p>Submit and track On-Duty requests with automated PDF generation for tutor approvals.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', padding: '30px 80px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'rgba(255, 255, 255, 0.6)', fontSize: 12 }}>
        <div>© 2026 Sri Ramakrishna Engineering College · Dept of EEE</div>
        <div>Autonomous Institution Affiliated to Anna University</div>
      </footer>
    </div>
  );
};
