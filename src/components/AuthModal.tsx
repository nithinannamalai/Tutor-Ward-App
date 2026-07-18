import React, { useState } from 'react';
import { X, Lock, Mail, Eye, EyeOff, User, Sparkles } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (userProfile: { email: string; name: string; rollNo: string; role: string }) => void;
  demoProfiles: Array<{ email: string; name: string; rollNo: string; role: string }>;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLoginSuccess, demoProfiles }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);

    // Simulate login verification
    setTimeout(() => {
      // Find if email matches one of the demo profiles
      const matchedProfile = demoProfiles.find(p => p.email.toLowerCase() === email.toLowerCase().trim());
      
      if (matchedProfile) {
        onLoginSuccess(matchedProfile);
      } else {
        // Allow general custom sign-in for testing purposes
        onLoginSuccess({
          email: email.trim(),
          name: email.split('@')[0].toUpperCase(),
          rollNo: 'EEE' + Math.floor(100 + Math.random() * 900),
          role: 'student'
        });
      }
      setLoading(false);
    }, 800);
  };

  const handleQuickLogin = (profile: typeof demoProfiles[0]) => {
    setLoading(true);
    setTimeout(() => {
      onLoginSuccess(profile);
      setLoading(false);
    }, 400);
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="auth-card-logo">
              <Sparkles size={16} fill="currentColor" style={{ color: 'var(--bg-primary)' }} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>EEE Scholar Hub</h3>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0 }}>Student & Faculty Portal</p>
            </div>
          </div>
          <button className="auth-close-btn" onClick={onClose} aria-label="Close Login">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="auth-card-body">
          <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Welcome Back</h4>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
            Please sign in to access your EEE dashboard, curriculum tracker, and academic files.
          </p>

          {error && (
            <div className="auth-error-banner">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Email Field */}
            <div className="form-group">
              <label className="form-label" htmlFor="email-input">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} className="auth-input-icon" />
                <input
                  id="email-input"
                  type="email"
                  placeholder="student@eee.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input auth-input"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label className="form-label" htmlFor="password-input">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} className="auth-input-icon" />
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input auth-input"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle-btn"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
              {loading ? 'Verifying Credentials...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="auth-divider">
            <span>Or Quick Login for Evaluation</span>
          </div>

          {/* Quick Login Profiles */}
          <div className="quick-login-grid">
            {demoProfiles.map((profile, index) => (
              <button
                key={index}
                className={`quick-login-btn ${profile.role}`}
                onClick={() => handleQuickLogin(profile)}
                disabled={loading}
              >
                <User size={14} style={{ marginBottom: 4 }} />
                <span className="profile-name">{profile.name.split(' ')[0]}</span>
                <span className="profile-role">
                  {profile.role === 'teacher' ? 'Faculty Admin' : 'Student'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
