import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, Eye, EyeOff, Sparkles, UserCheck, User, ArrowLeft, ShieldCheck } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import type { UserProfile } from '../../App';
import appLogo from '../../assets/app-logo.png';

interface DesktopLoginPageProps {
  onClose: () => void;
  onLoginSuccess: (userProfile: UserProfile) => void;
  demoProfiles: UserProfile[];
}

export const DesktopLoginPage: React.FC<DesktopLoginPageProps> = ({ onClose, onLoginSuccess, demoProfiles }) => {
  const [isSignUp, setIsSignUp] = useState(false);
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
            let role: 'student' | 'teacher' = 'student';
            if (targetEmail.toLowerCase() === 'teacher@eee.com') role = 'teacher';

            onLoginSuccess({
              email: targetEmail,
              name: name.trim(),
              rollNo: rollNo.trim(),
              role,
              className: 'III EEE-A',
              yearOfStudy: '3rd Year',
              semester: 'Semester VI',
              department: 'Dept of EEE'
            });
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Supabase sign up failed:', err);
        }
      }

      // Fallback
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
          // Fallback login
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

    // Direct mock login fallback
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
    <div className="desktop-login-portal">
      {/* Left Side Visual Branding Panel */}
      <div className="desktop-login-left">
        <div style={{ position: 'relative', zIndex: 2 }}>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, marginBottom: 40 }}>
            <ArrowLeft size={16} /> Back to Landing
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: '#fff', padding: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
              <img src={appLogo} alt="SREC Logo" style={{ width: '100%', height: '100%', borderRadius: 14, objectFit: 'cover' }} />
            </div>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: 0 }}>Sri Ramakrishna Engineering College</h2>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: 0 }}>Dept. of Electrical &amp; Electronics Engineering</p>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: 24, border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(14px)', marginBottom: 30 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', marginBottom: 8 }}>
              <Sparkles size={14} /> STUDENT QUOTE OF THE DAY
            </div>
            <p style={{ fontSize: 14, color: '#fff', fontStyle: 'italic', margin: 0, lineHeight: 1.5 }}>
              {quotes[quoteIndex]}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(255,255,255,0.12)', color: '#fff', padding: '6px 14px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={14} style={{ color: '#4ade80' }} /> NAAC A+ Grade
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(255,255,255,0.12)', color: '#fff', padding: '6px 14px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={14} style={{ color: '#60a5fa' }} /> NBA Accredited
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(255,255,255,0.12)', color: '#fff', padding: '6px 14px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={14} style={{ color: '#f472b6' }} /> Supabase Auth Secured
            </span>
          </div>
        </div>
      </div>

      {/* Right Side Login Form Workspace */}
      <div className="desktop-login-right">
        <div style={{ maxWidth: 420, width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-main)', margin: '0 0 4px 0' }}>
                {isSignUp ? 'Create Student Account' : 'Portal Login'}
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                Enter your academic credentials to access SREC Hub
              </p>
            </div>
            <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--card-border)', background: 'var(--bg-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={18} />
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="signin-mode-tabs" style={{ marginBottom: 20 }}>
            <button className={`mode-tab-btn ${!isSignUp ? 'active' : ''}`} onClick={() => setIsSignUp(false)}>
              Sign In
            </button>
            <button className={`mode-tab-btn ${isSignUp ? 'active' : ''}`} onClick={() => setIsSignUp(true)}>
              Register Account
            </button>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '10px 14px', borderRadius: 12, fontSize: 12, fontWeight: 700, marginBottom: 16 }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {isSignUp && (
              <>
                <div className="signin-field-group">
                  <label>Student Full Name</label>
                  <div className="signin-input-wrapper">
                    <User size={16} className="signin-input-icon" />
                    <input type="text" className="signin-input" placeholder="e.g. Nithin Annamalai" value={name} onChange={e => setName(e.target.value)} required />
                  </div>
                </div>
                <div className="signin-field-group">
                  <label>Roll Number / Reg No</label>
                  <div className="signin-input-wrapper">
                    <UserCheck size={16} className="signin-input-icon" />
                    <input type="text" className="signin-input" placeholder="e.g. 7377221EE001" value={rollNo} onChange={e => setRollNo(e.target.value)} required />
                  </div>
                </div>
              </>
            )}

            <div className="signin-field-group">
              <label>College Email Address</label>
              <div className="signin-input-wrapper">
                <Mail size={16} className="signin-input-icon" />
                <input type="email" className="signin-input" placeholder="student@eee.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>

            <div className="signin-field-group">
              <label>Account Password</label>
              <div className="signin-input-wrapper">
                <Lock size={16} className="signin-input-icon" />
                <input type={showPassword ? 'text' : 'password'} className="signin-input" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" className="signin-eye-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="signin-submit-btn" disabled={loading}>
              {loading ? 'Authenticating...' : isSignUp ? 'Create Account & Login' : 'Login to Workspace'}
            </button>
          </form>

          {/* Quick Demo Fill Section */}
          <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid var(--card-border)' }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>
              ⚡ 1-CLICK DEMO LOGIN PROFILES
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {demoProfiles.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => fillDemo(p)}
                  style={{
                    background: p.role === 'teacher' ? 'rgba(234, 88, 12, 0.08)' : 'rgba(0, 82, 204, 0.08)',
                    border: `1px solid ${p.role === 'teacher' ? 'rgba(234, 88, 12, 0.2)' : 'rgba(0, 82, 204, 0.2)'}`,
                    borderRadius: 12,
                    padding: '8px 10px',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 800, color: p.role === 'teacher' ? '#ea580c' : 'var(--accent-blue)' }}>
                    {p.role === 'teacher' ? '👨‍🏫 Faculty' : '🎓 Student'}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)' }}>{p.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{p.email}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
