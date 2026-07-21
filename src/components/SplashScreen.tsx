import React, { useEffect, useState } from 'react';
import { Zap, Sparkles, ChevronRight } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => onFinish(), 300);
          return 100;
        }
        return prev + 5;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <div className="splash-screen-container">
      <div className="splash-glow-bg" />
      
      <div className="splash-content">
        <div className="splash-logo-wrapper">
          <div className="splash-logo-circle">
            <Zap size={40} className="splash-logo-icon" fill="currentColor" />
          </div>
          <div className="splash-logo-badge">
            <Sparkles size={12} fill="currentColor" />
            <span>2026 EDITION</span>
          </div>
        </div>

        <div className="splash-text-section">
          <h1 className="splash-title">EEE SREC</h1>
          <p className="splash-subtitle">Smart Mobile Hub</p>
          <p className="splash-college">Sri Ramakrishna Engineering College</p>
        </div>

        <div className="splash-progress-container">
          <div className="splash-progress-bar">
            <div className="splash-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="splash-progress-text">Loading Hub Assets... {progress}%</span>
        </div>

        <button className="splash-skip-btn" onClick={onFinish}>
          <span>Enter Hub</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};
