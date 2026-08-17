import React from 'react';
import { ArrowUpRight, Menu, LayoutGrid, Briefcase } from 'lucide-react';
import appLogo from '../../assets/app-logo.png';
import cosmicBg from '../../assets/cosmic-planet.jpg';

interface DesktopLandingPageProps {
  onOpenLogin: (isSignUp?: boolean) => void;
}

export const DesktopLandingPage: React.FC<DesktopLandingPageProps> = ({ onOpenLogin }) => {
  return (
    <div className="cosmic-landing-wrapper">
      {/* ── Outer Tablet/Screen Rounded Frame (Matching Screenshot) ── */}
      <div
        className="cosmic-screen-frame"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(3,5,12,0.4) 0%, rgba(3,5,12,0.7) 100%), url(${cosmicBg})`,
        }}
      >
        {/* Top Minimalist Header */}
        <header className="cosmic-top-nav">
          <button className="cosmic-menu-btn" onClick={() => onOpenLogin(false)} title="Menu">
            <Menu size={26} strokeWidth={2.5} color="#ffffff" />
          </button>

          <div className="cosmic-center-brand">
            <span className="cosmic-brand-text">TUTORWARD</span>
          </div>

          <div className="cosmic-nav-right">
            <button className="cosmic-icon-btn" onClick={() => onOpenLogin(false)} title="Modules">
              <LayoutGrid size={18} color="#ffffff" />
            </button>
            <button className="cosmic-icon-btn" onClick={() => onOpenLogin(false)} title="Career Hub">
              <Briefcase size={18} color="#ffffff" />
            </button>
            <div className="cosmic-avatar-circle" onClick={() => onOpenLogin(false)} title="Sign In">
              <img src={appLogo} alt="TutorWard Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        </header>

        {/* Center Main Headline Section */}
        <main className="cosmic-main-hero">
          <div className="cosmic-hero-content">
            <span className="cosmic-sub-tag">Academic Dynamicron · Dept of EEE</span>
            <h1 className="cosmic-huge-title">TUTOR-WARD</h1>
          </div>

          {/* Glowing White Circular Action Button (Matching Screenshot) */}
          <button
            className="cosmic-circle-action-btn"
            onClick={() => onOpenLogin(false)}
            title="Enter Student Portal"
          >
            <ArrowUpRight size={32} strokeWidth={2.5} color="#03050c" />
          </button>
        </main>

        {/* Bottom Bar Section */}
        <footer className="cosmic-bottom-footer">
          <div className="cosmic-footer-left">
            <h3 className="cosmic-footer-heading">Academic Intelligence &amp; Autonomous Records</h3>
            <p className="cosmic-footer-desc">
              Sri Ramakrishna Engineering College · Autonomous Institution Affiliated to Anna University.
            </p>
          </div>

          <div className="cosmic-footer-right">
            <div className="cosmic-capsule-badge" onClick={() => onOpenLogin(true)}>
              <span>EEE · SREC</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
