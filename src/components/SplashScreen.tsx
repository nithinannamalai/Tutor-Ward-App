import React from 'react';
import { Sparkles, LogIn, UserPlus } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
  onSelectAuth?: (isSignUp: boolean) => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish, onSelectAuth }) => {

  const handleAction = (isSignUp: boolean) => {
    if (onSelectAuth) {
      onSelectAuth(isSignUp);
    }
    onFinish();
  };

  return (
    <div className="splash-screen-container">
      <div className="splash-glow-bg" />
      
      <div className="splash-content">
        <div className="splash-logo-wrapper">
          <div className="splash-logo-circle" style={{ padding: 4, background: '#ffffff', borderRadius: 24 }}>
            <img src="/app-logo.svg" alt="EEE SREC Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div className="splash-logo-badge">
            <Sparkles size={12} fill="currentColor" />
            <span>2026 EDITION</span>
          </div>
        </div>

        <div className="splash-text-section">
          <h1 className="splash-title">EEE SREC PORTAL</h1>
          <p className="splash-subtitle">Smart Mobile Student Hub</p>
          <p className="splash-college">Sri Ramakrishna Engineering College · Dept of EEE</p>
        </div>

        {/* Sleek Minimal Glowing Line Divider */}
        <div className="splash-divider-line" />

        {/* 🔐 Sign In or Sign Up Choice Buttons */}
        <div className="splash-auth-actions">
          <button className="splash-auth-btn signin" onClick={() => handleAction(false)}>
            <LogIn size={16} />
            <span>Sign In</span>
          </button>
          <button className="splash-auth-btn signup" onClick={() => handleAction(true)}>
            <UserPlus size={16} />
            <span>Sign Up</span>
          </button>
        </div>
      </div>
    </div>
  );
};
