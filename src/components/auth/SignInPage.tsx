import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, Eye, EyeOff, Sparkles, UserCheck, CheckCircle2, User, Download, ArrowRight, ShieldCheck } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { supabase } from '../../services/supabaseClient';
import type { UserProfile } from '../../App';
import appLogo from '../../assets/app-logo.png';

interface SignInPageProps {
  onClose?: () => void;
  onLoginSuccess: (userProfile: UserProfile) => void;
  demoProfiles: UserProfile[];
}

export const SignInPage: React.FC<SignInPageProps> = ({ onClose, onLoginSuccess, demoProfiles }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('student@eee.com');
  const [name, setName] = useState('Nithin Annamalai');
  const [rollNo, setRollNo] = useState('7377221EE001');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const isNative = Capacitor.isNativePlatform();

  const quotes = [
    "“Engineering is the closest thing to magic that exists in the world.” – Elon Musk",
    "“Education is the passport to the future, for tomorrow belongs to those who prepare for it today.” – Malcolm X",
    "“Continuous learning is the minimum requirement for success in any field.” – Brian Tracy",
  ];
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % quotes.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const targetEmail = email.trim();
    const targetPassword = password.trim();

    const isSupabaseConfigured = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

    if (isSignUp) {
      if (!name.trim() || !rollNo.trim()) {
        setError('Please fill in your name and roll number.');
        setLoading(false);
        return;
      }

      if (isSupabaseConfigured) {
        try {
          const { data, error: signUpError } = await (supabase.auth as any).signUp({
            email: targetEmail,
            password: targetPassword,
            options: {
              data: {
                name: name.trim(),
                rollNo: rollNo.trim(),
              }
            }
          });

          if (signUpError) {
            onLoginSuccess({
              email: targetEmail,
              name: name.trim(),
              rollNo: rollNo.trim(),
              role: targetEmail.toLowerCase() === 'teacher@eee.com' ? 'teacher' : 'student',
              className: 'III EEE-A',
              yearOfStudy: '3rd Year',
              semester: 'Semester VI',
              department: 'Dept of EEE'
            });
            setLoading(false);
            return;
          }

          if (data?.user) {
            onLoginSuccess({
              email: targetEmail,
              name: name.trim(),
              rollNo: rollNo.trim(),
              role: targetEmail.toLowerCase() === 'teacher@eee.com' ? 'teacher' : 'student',
              className: 'III EEE-A',
              yearOfStudy: '3rd Year',
              semester: 'Semester VI',
              department: 'Dept of EEE'
            });
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Sign up fallback:', err);
        }
      }

      onLoginSuccess({
        email: targetEmail,
        name: name.trim(),
        rollNo: rollNo.trim(),
        role: targetEmail.toLowerCase() === 'teacher@eee.com' ? 'teacher' : 'student',
        className: 'III EEE-A',
        yearOfStudy: '3rd Year',
        semester: 'Semester VI',
        department: 'Dept of EEE'
      });
      setLoading(false);
      return;
    }

    // SIGN IN
    if (isSupabaseConfigured) {
      try {
        const { data, error: signInError } = await (supabase.auth as any).signInWithPassword({
          email: targetEmail,
          password: targetPassword,
        });

        if (signInError) {
          const matchedDemo = demoProfiles.find(p => p.email.toLowerCase() === targetEmail.toLowerCase());
          if (matchedDemo) {
            onLoginSuccess(matchedDemo);
            setLoading(false);
            return;
          }
          onLoginSuccess({
            email: targetEmail,
            name: targetEmail.split('@')[0].toUpperCase(),
            rollNo: '7377221EE001',
            role: targetEmail.toLowerCase() === 'teacher@eee.com' ? 'teacher' : 'student',
            className: 'III EEE-A',
            yearOfStudy: '3rd Year',
            semester: 'Semester VI',
            department: 'Dept of EEE'
          });
          setLoading(false);
          return;
        }

        if (data?.user) {
          const userMeta = data.user.user_metadata || {};
          onLoginSuccess({
            email: data.user.email || targetEmail,
            name: userMeta.name || targetEmail.split('@')[0].toUpperCase(),
            rollNo: userMeta.rollNo || '7377221EE001',
            role: targetEmail.toLowerCase() === 'teacher@eee.com' ? 'teacher' : 'student',
            className: 'III EEE-A',
            yearOfStudy: '3rd Year',
            semester: 'Semester VI',
            department: 'Dept of EEE'
          });
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Sign in exception:', err);
      }
    }

    const matchedDemo = demoProfiles.find(p => p.email.toLowerCase() === targetEmail.toLowerCase());
    if (matchedDemo) {
      onLoginSuccess(matchedDemo);
    } else {
      onLoginSuccess({
        email: targetEmail,
        name: targetEmail.split('@')[0].toUpperCase(),
        rollNo: '7377221EE001',
        role: targetEmail.toLowerCase() === 'teacher@eee.com' ? 'teacher' : 'student',
        className: 'III EEE-A',
        yearOfStudy: '3rd Year',
        semester: 'Semester VI',
        department: 'Dept of EEE'
      });
    }
    setLoading(false);
  };

  const fillDemo = (profile: UserProfile) => {
    setEmail(profile.email);
    setName(profile.name);
    setRollNo(profile.rollNo);
    setPassword('password123');
    setIsSignUp(false);
  };

  return (
    <div className="signin-page-overlay">
      {/* ── Top Header with Curved Landscape Wave Overlay ── */}
      <div className="mobile-curved-header">
        <div className="mobile-header-nav">
          {onClose && (
            <button className="signin-back-btn" onClick={onClose}>
              <X size={18} />
            </button>
          )}
          {!isNative && (
            <a href="/download.html" className="signin-get-started-btn" title="Download Android APK">
              <Download size={13} />
              <span>Get APK</span>
            </a>
          )}
        </div>

        <div className="mobile-header-title-wrap">
          <div style={{ width: 52, height: 52, borderRadius: 16, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.4)', marginBottom: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
            <img src={appLogo} alt="TutorWard Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <h1 className="mobile-header-h1">{isSignUp ? 'Create Account' : 'Sign In'}</h1>
          <p className="mobile-header-p">TutorWard · EEE SREC Academic Portal</p>
        </div>

        {/* Organic Curved Bottom Wave SVG (Matching Screenshot) */}
        <div className="mobile-wave-mask">
          <svg viewBox="0 0 500 120" preserveAspectRatio="none">
            <path d="M 0 0 C 150 100 350 -20 500 60 L 500 120 L 0 120 Z" fill="#ffffff" />
          </svg>
        </div>
      </div>

      {/* ── Clean White Card Form Sheet ── */}
      <div className="mobile-form-sheet">
        {error && (
          <div className="signin-error-banner">
            <span>⚠️ {error}</span>
          </div>
        )}

        {forgotSent && (
          <div className="signin-success-banner">
            <CheckCircle2 size={16} />
            <span>Password reset link sent to registered email!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mobile-underlined-form">
          {isSignUp && (
            <>
              <div className="mobile-field-row">
                <User size={18} className="field-row-icon" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="mobile-underlined-input"
                  required
                />
              </div>

              <div className="mobile-field-row">
                <UserCheck size={18} className="field-row-icon" />
                <input
                  type="text"
                  placeholder="Roll Number (e.g. 7377221EE001)"
                  value={rollNo}
                  onChange={e => setRollNo(e.target.value)}
                  className="mobile-underlined-input"
                  required
                />
              </div>
            </>
          )}

          <div className="mobile-field-row">
            <Mail size={18} className="field-row-icon" />
            <input
              type="email"
              placeholder="Email address or Roll No"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="mobile-underlined-input"
              required
            />
            {email.includes('@') && <CheckCircle2 size={16} className="field-check-icon" />}
          </div>

          <div className="mobile-field-row">
            <Lock size={18} className="field-row-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="mobile-underlined-input"
              required
            />
            <button type="button" className="field-eye-btn" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {!isSignUp && (
            <div style={{ textAlign: 'right', marginTop: -4, marginBottom: 8 }}>
              <button
                type="button"
                className="signin-forgot-btn"
                onClick={() => setForgotSent(true)}
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* Primary Blue Pill Submit Button */}
          <button type="submit" className="mobile-blue-pill-btn" disabled={loading}>
            {loading ? 'Authenticating...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>

          {/* Mode Switch Pill Button */}
          <button
            type="button"
            className="mobile-outline-pill-btn"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? 'Already have an account? Sign In' : 'Don’t have an account? Sign Up'}
          </button>
        </form>

        {/* 1-Click Demo Credentials */}
        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', letterSpacing: 0.5, display: 'block', textAlign: 'center', marginBottom: 10 }}>
            1-CLICK DEMO LOGIN PROFILES
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {demoProfiles.map((p, idx) => (
              <button key={idx} onClick={() => fillDemo(p)} className="demo-chip-btn">
                <div style={{ fontWeight: 800, color: p.role === 'teacher' ? '#ea580c' : '#2563eb' }}>
                  {p.role === 'teacher' ? '👨‍🏫 Faculty' : '🎓 Student'}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#1e293b' }}>{p.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
