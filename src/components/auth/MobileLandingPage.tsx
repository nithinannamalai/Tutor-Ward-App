import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Award, GraduationCap, Zap, UserCheck, FileText, BookOpen } from 'lucide-react';
import appLogo from '../../assets/app-logo.png';

interface MobileLandingPageProps {
  onOpenLogin: (isSignUp: boolean) => void;
}

export const MobileLandingPage: React.FC<MobileLandingPageProps> = ({ onOpenLogin }) => {
  return (
    <div className="mobile-landing-wrapper">
      {/* ── Top Hero with Scenic Nature Background & Curved Wave ── */}
      <div className="mobile-landing-hero">
        <div className="mobile-landing-brand-badge">
          <div className="mobile-landing-logo-box">
            <img src={appLogo} alt="TutorWard Logo" className="mobile-landing-logo-img" />
          </div>
          <span className="mobile-landing-tag">DEPT OF EEE · SREC</span>
        </div>

        <h1 className="mobile-landing-title">
          TutorWard
        </h1>
        <p className="mobile-landing-subtitle">
          LEARN · GROW · SUCCEED
        </p>
        <p className="mobile-landing-desc">
          Smart Academic &amp; Attendance Management Hub for Electrical &amp; Electronics Engineering Students.
        </p>

        {/* Action Buttons */}
        <div className="mobile-landing-cta-group">
          <button className="mobile-primary-pill-btn" onClick={() => onOpenLogin(false)}>
            Sign In <ArrowRight size={16} />
          </button>
          <button className="mobile-secondary-pill-btn" onClick={() => onOpenLogin(true)}>
            Create Account
          </button>
        </div>

        {/* Curved Wave Mask */}
        <div className="mobile-landing-wave">
          <svg viewBox="0 0 500 120" preserveAspectRatio="none">
            <path d="M 0 0 C 150 100 350 -20 500 60 L 500 120 L 0 120 Z" fill="#ffffff" />
          </svg>
        </div>
      </div>

      {/* ── Main Body Content ── */}
      <div className="mobile-landing-body">
        {/* Accreditation Badges */}
        <div className="mobile-accreditation-row">
          <div className="accreditation-pill"><Award size={13} /> NAAC A+ Grade</div>
          <div className="accreditation-pill"><ShieldCheck size={13} /> NBA Accredited</div>
          <div className="accreditation-pill"><GraduationCap size={13} /> Anna University</div>
        </div>

        {/* Module Features Grid */}
        <div className="mobile-landing-section-title">
          <h2>Core Academic Features</h2>
        </div>

        <div className="mobile-features-grid">
          <div className="mobile-feature-card" onClick={() => onOpenLogin(false)}>
            <div className="feature-icon-box" style={{ background: '#e0e7ff', color: '#4338ca' }}>
              <Zap size={22} />
            </div>
            <h3>AI Tutor Assistant</h3>
            <p>24/7 intelligent AI tutoring for circuit analysis, power systems, and exam prep.</p>
          </div>

          <div className="mobile-feature-card" onClick={() => onOpenLogin(false)}>
            <div className="feature-icon-box" style={{ background: '#dcfce7', color: '#16a34a' }}>
              <UserCheck size={22} />
            </div>
            <h3>Live Attendance Logs</h3>
            <p>Real-time subject-wise attendance tracking with shortfall warning alerts.</p>
          </div>

          <div className="mobile-feature-card" onClick={() => onOpenLogin(false)}>
            <div className="feature-icon-box" style={{ background: '#fef3c7', color: '#d97706' }}>
              <FileText size={22} />
            </div>
            <h3>Instant OD Request Form</h3>
            <p>Submit On-Duty requests with automated PDF generation for tutor approvals.</p>
          </div>

          <div className="mobile-feature-card" onClick={() => onOpenLogin(false)}>
            <div className="feature-icon-box" style={{ background: '#fae8ff', color: '#c084fc' }}>
              <BookOpen size={22} />
            </div>
            <h3>CGPA &amp; Grade Vault</h3>
            <p>Calculate current semester GPAs and simulate target internal marks.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mobile-landing-footer">
          <p>© 2026 TutorWard · Sri Ramakrishna Engineering College</p>
        </div>
      </div>
    </div>
  );
};
