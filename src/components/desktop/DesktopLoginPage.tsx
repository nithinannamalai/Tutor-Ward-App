import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, Eye, EyeOff, Sparkles, UserCheck, User, ArrowLeft, ShieldCheck, ArrowRight } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import type { UserProfile } from '../../App';
import appLogo from '../../assets/app-logo.png';
import cosmicBg from '../../assets/cosmic-planet.jpg';

interface DesktopLoginPageProps {
  onClose: () => void;
  onLoginSuccess: (userProfile: UserProfile) => void;
  demoProfiles: UserProfile[];
  initialIsSignUp?: boolean;
}

export const DesktopLoginPage: React.FC<DesktopLoginPageProps> = ({ onClose, onLoginSuccess, demoProfiles, initialIsSignUp = false }) => {
  const [isSignUp, setIsSignUp] = useState(initialIsSignUp);
  const [email, setEmail] = useState('student@eee.com');
  const [name, setName] = useState('Nithin Annamalai');
  const [rollNo, setRollNo] = useState('7377221EE001');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const quotes = [
    "“Engineering is the closest thing to magic that exists in the world.” – Elon Musk",
    "“Education is the passport to the future, for tomorrow belongs to those who prepare for it today.” – Malcolm X",
    "“Continuous learning is the minimum requirement for success in any field.” – Brian Tracy",
  ];
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % quotes.length);
    }, 4000);
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
    <div 
      className="cosmic-login-fullscreen"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(3,5,12,0.8) 0%, rgba(3,5,12,0.92) 100%), url(${cosmicBg})`,
      }}
    >
      {/* Centered Glassmorphic Dual-Split Card Frame */}
      <div className="cosmic-login-card">
        {/* Left Side: Brand & Cosmic Info */}
        <div className="cosmic-login-left">
          <button className="cosmic-back-btn" onClick={onClose}>
            <ArrowLeft size={16} /> Back to Space Landing
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '30px 0 24px' }}>
            <div className="cosmic-login-logo">
              <img src={appLogo} alt="TutorWard Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: '#ffffff', margin: 0, letterSpacing: -0.5 }}>
                TutorWard
              </h2>
              <p style={{ fontSize: 13, color: '#60a5fa', margin: 0, fontWeight: 700 }}>
                Sri Ramakrishna Eng. College · Dept of EEE
              </p>
            </div>
          </div>

          <div className="cosmic-quote-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', marginBottom: 8 }}>
              <Sparkles size={14} /> ACADEMIC INSPIRATION
            </div>
            <p style={{ fontSize: 14, color: '#e2e8f0', fontStyle: 'italic', margin: 0, lineHeight: 1.5 }}>
              {quotes[quoteIndex]}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <span className="cosmic-pill-badge">
              <ShieldCheck size={14} style={{ color: '#4ade80' }} /> NAAC A+ Grade
            </span>
            <span className="cosmic-pill-badge">
              <ShieldCheck size={14} style={{ color: '#60a5fa' }} /> NBA Accredited
            </span>
            <span className="cosmic-pill-badge">
              <ShieldCheck size={14} style={{ color: '#c084fc' }} /> Anna University
            </span>
          </div>
        </div>

        {/* Right Side: Authentication Form */}
        <div className="cosmic-login-right">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: '#ffffff', margin: 0 }}>
                {isSignUp ? 'Create Account' : 'Portal Login'}
              </h2>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0 0' }}>
                Enter credentials to access academic workspace
              </p>
            </div>
            <button onClick={onClose} className="cosmic-close-icon">
              <X size={18} />
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="cosmic-auth-toggle">
            <button className={`cosmic-toggle-btn ${!isSignUp ? 'active' : ''}`} onClick={() => setIsSignUp(false)}>
              Sign In
            </button>
            <button className={`cosmic-toggle-btn ${isSignUp ? 'active' : ''}`} onClick={() => setIsSignUp(true)}>
              Register Account
            </button>
          </div>

          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '10px 14px', borderRadius: 12, fontSize: 12, fontWeight: 700, marginBottom: 16 }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {isSignUp && (
              <>
                <div className="cosmic-field-group">
                  <label>Full Name</label>
                  <div className="cosmic-input-wrapper">
                    <User size={16} className="cosmic-input-icon" />
                    <input type="text" className="cosmic-input" placeholder="e.g. Nithin Annamalai" value={name} onChange={e => setName(e.target.value)} required />
                  </div>
                </div>
                <div className="cosmic-field-group">
                  <label>Roll Number</label>
                  <div className="cosmic-input-wrapper">
                    <UserCheck size={16} className="cosmic-input-icon" />
                    <input type="text" className="cosmic-input" placeholder="e.g. 7377221EE001" value={rollNo} onChange={e => setRollNo(e.target.value)} required />
                  </div>
                </div>
              </>
            )}

            <div className="cosmic-field-group">
              <label>College Email Address</label>
              <div className="cosmic-input-wrapper">
                <Mail size={16} className="cosmic-input-icon" />
                <input type="email" className="cosmic-input" placeholder="student@eee.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>

            <div className="cosmic-field-group">
              <label>Account Password</label>
              <div className="cosmic-input-wrapper">
                <Lock size={16} className="cosmic-input-icon" />
                <input type={showPassword ? 'text' : 'password'} className="cosmic-input" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" className="cosmic-eye-btn" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="cosmic-login-submit-btn" disabled={loading}>
              {loading ? 'Authenticating...' : isSignUp ? 'Create Account' : 'Sign In to Portal'} <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick Demo Fill Section */}
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>
              ⚡ 1-CLICK DEMO LOGIN PROFILES
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {demoProfiles.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => fillDemo(p)}
                  className="cosmic-demo-btn"
                >
                  <div style={{ fontSize: 11, fontWeight: 800, color: p.role === 'teacher' ? '#fb923c' : '#60a5fa' }}>
                    {p.role === 'teacher' ? '👨‍🏫 Faculty' : '🎓 Student'}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#ffffff' }}>{p.name}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>{p.email}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
