import React, { useState } from 'react';
import { ArrowLeft, Lock, Mail, Eye, EyeOff, Sparkles, UserCheck, CheckCircle2 } from 'lucide-react';

interface SignInPageProps {
  onClose: () => void;
  onLoginSuccess: (userProfile: { email: string; name: string; rollNo: string; role: string }) => void;
  demoProfiles: Array<{ email: string; name: string; rollNo: string; role: string }>;
}

export const SignInPage: React.FC<SignInPageProps> = ({ onClose, onLoginSuccess, demoProfiles }) => {
  const [email, setEmail] = useState('student@eee.com');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const matchedProfile = demoProfiles.find(
        p => p.email.toLowerCase() === email.toLowerCase().trim()
      );

      if (matchedProfile) {
        onLoginSuccess(matchedProfile);
      } else {
        onLoginSuccess({
          email: email.trim(),
          name: email.split('@')[0].toUpperCase(),
          rollNo: 'EEE' + Math.floor(100 + Math.random() * 900),
          role: 'student'
        });
      }
      setLoading(false);
    }, 600);
  };

  const handleQuickLogin = (profile: typeof demoProfiles[0]) => {
    setLoading(true);
    setTimeout(() => {
      onLoginSuccess(profile);
      setLoading(false);
    }, 350);
  };

  const handleForgotPassword = () => {
    setForgotSent(true);
    setTimeout(() => setForgotSent(false), 3000);
  };

  return (
    <div className="signin-page-overlay">
      {/* Top Gradient Header Section */}
      <div className="signin-header-gradient">
        {/* Top Navbar */}
        <div className="signin-top-nav">
          <button className="signin-back-btn" onClick={onClose} aria-label="Go Back">
            <ArrowLeft size={20} />
          </button>
          
          <div className="signin-top-right">
            <span className="signin-no-account">Don't have an account?</span>
            <button
              className="signin-get-started-btn"
              onClick={() => handleQuickLogin(demoProfiles[0])}
            >
              Get Started
            </button>
          </div>
        </div>

        {/* Brand Banner */}
        <div className="signin-brand-banner">
          <div className="signin-brand-icon">
            <Sparkles size={24} fill="currentColor" />
          </div>
          <h1 className="signin-brand-title">EEE SREC</h1>
          <p className="signin-brand-sub">Smart Mobile Portal</p>
        </div>
      </div>

      {/* Main White Card Sheet */}
      <div className="signin-card-sheet">
        <div className="signin-card-handle" />

        <div className="signin-sheet-header">
          <h2>Welcome Back</h2>
          <p>Enter your details below to access your student hub</p>
        </div>

        {error && (
          <div className="signin-error-banner">
            <span>{error}</span>
          </div>
        )}

        {forgotSent && (
          <div className="signin-success-banner">
            <CheckCircle2 size={16} />
            <span>Password reset link sent to your registered email!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="signin-form">
          {/* Email Input */}
          <div className="signin-field-group">
            <label htmlFor="signin-email">Email Address</label>
            <div className="signin-input-wrapper">
              <Mail size={18} className="signin-input-icon" />
              <input
                id="signin-email"
                type="email"
                placeholder="student@eee.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="signin-input"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="signin-field-group">
            <label htmlFor="signin-password">Password</label>
            <div className="signin-input-wrapper">
              <Lock size={18} className="signin-input-icon" />
              <input
                id="signin-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="signin-input"
                disabled={loading}
              />
              <button
                type="button"
                className="signin-eye-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle Password Visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <button type="submit" className="signin-submit-btn" disabled={loading}>
            {loading ? (
              <span className="signin-btn-spinner">Verifying Credentials...</span>
            ) : (
              'Sign in'
            )}
          </button>

          {/* Forgot Password Link */}
          <div className="signin-forgot-row">
            <button
              type="button"
              className="signin-forgot-btn"
              onClick={handleForgotPassword}
            >
              Forgot your password?
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="signin-divider">
          <span>Or sign in with</span>
        </div>

        {/* Social Sign-In Buttons */}
        <div className="signin-social-grid">
          <button
            type="button"
            className="signin-social-btn google-btn"
            onClick={() => handleQuickLogin(demoProfiles[0])}
          >
            <svg className="social-icon-svg" viewBox="0 0 24 24" width="18" height="18">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Google</span>
          </button>

          <button
            type="button"
            className="signin-social-btn facebook-btn"
            onClick={() => handleQuickLogin(demoProfiles[1])}
          >
            <svg className="social-icon-svg" viewBox="0 0 24 24" width="18" height="18" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span>Facebook</span>
          </button>
        </div>

        {/* Quick Demo Access Header */}
        <div className="signin-demo-section">
          <span className="signin-demo-title">⚡ Quick 1-Click Evaluation Logins</span>
          <div className="signin-demo-grid">
            {demoProfiles.map((profile, i) => (
              <button
                key={i}
                type="button"
                className={`signin-demo-card ${profile.role}`}
                onClick={() => handleQuickLogin(profile)}
              >
                <div className="demo-avatar">
                  {profile.name.charAt(0)}
                </div>
                <div className="demo-info">
                  <span className="demo-name">{profile.name}</span>
                  <span className="demo-role">
                    {profile.role === 'teacher' ? 'Faculty Admin' : `Roll: ${profile.rollNo}`}
                  </span>
                </div>
                <UserCheck size={14} className="demo-check" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
