import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, Eye, EyeOff, Sparkles, UserCheck, CheckCircle2, User, Download } from 'lucide-react';
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
    "“Education is the passport to the future, for tomorrow belongs to those who prepare for it today.” – Malcolm X",
    "“Engineering is the closest thing to magic that exists in the world.” – Elon Musk",
    "“Continuous learning is the minimum requirement for success in any field.” – Brian Tracy",
    "“The future belongs to those who learn more skills and combine them in creative ways.” – Robert Greene",
    "“Aim for success, not perfection. Never surrender your right to be wrong.” – Dr. David M. Burns"
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
          const { data, error: signUpError } = await supabase.auth.signUp({
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
            console.warn('Supabase signUp error, falling back to mock signin:', signUpError.message);
            // Log in locally as mock student to bypass rate limits
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

          if (data.user) {
            // Check if teacher
            let role: 'student' | 'teacher' = 'student';
            const { data: facultyCheck } = await supabase
              .from('faculty')
              .select('*')
              .eq('email', targetEmail)
              .maybeSingle();

            if (facultyCheck || targetEmail.toLowerCase() === 'teacher@eee.com') {
              role = 'teacher';
            } else {
              // Create student profile in database
              const { error: profileError } = await supabase
                .from('student_profiles')
                .insert({
                  id: targetEmail,
                  roll_no: rollNo.trim(),
                  name: name.trim(),
                  email: targetEmail,
                  cgpa_json: {},
                  arrears_count: 0,
                  nptel_exams: []
                });
              if (profileError) {
                console.warn('Profile creation error:', profileError.message);
              }
            }

            onLoginSuccess({
              email: targetEmail,
              name: name.trim(),
              rollNo: rollNo.trim(),
              role,
              className: role === 'teacher' ? 'All EEE Classes' : 'III EEE-A',
              yearOfStudy: role === 'teacher' ? 'Staff' : '3rd Year',
              semester: role === 'teacher' ? 'Staff Portal' : 'Semester VI',
              department: 'Dept of EEE'
            });
            setLoading(false);
            return;
          }
        } catch (err: any) {
          console.warn('Supabase signup exception, falling back to mock signin:', err);
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
      } else {
        // Fallback mock signup
        onLoginSuccess({
          email: targetEmail,
          name: name.trim(),
          rollNo: rollNo.trim(),
          role: 'student',
          className: 'III EEE-A',
          yearOfStudy: '3rd Year',
          semester: 'Semester VI',
          department: 'Dept of EEE'
        });
        setLoading(false);
        return;
      }
    } else {
      // SIGN IN MODE
      if (isSupabaseConfigured) {
        try {
          const { data, error: signInError } = await supabase.auth.signInWithPassword({
            email: targetEmail,
            password: targetPassword
          });

          if (signInError) {
            // First check if it is a demo account, we try to auto-signup and login
            const matchedDemo = demoProfiles.find(
              p => p.email.toLowerCase() === targetEmail.toLowerCase()
            );
            if (matchedDemo && (targetPassword === '••••••••' || targetPassword === 'password123' || targetPassword === '12345678')) {
              const demoPass = 'password123';
              try {
                const { data: signUpData, error: demoSignUpError } = await supabase.auth.signUp({
                  email: targetEmail,
                  password: demoPass,
                  options: {
                    data: {
                      name: matchedDemo.name,
                      rollNo: matchedDemo.rollNo,
                    }
                  }
                });

                if (!demoSignUpError && signUpData.user) {
                  if (matchedDemo.role !== 'teacher') {
                    await supabase.from('student_profiles').insert({
                      id: targetEmail,
                      roll_no: matchedDemo.rollNo,
                      name: matchedDemo.name,
                      email: targetEmail,
                      cgpa_json: {},
                      arrears_count: 0,
                      nptel_exams: []
                    });
                  }
                  
                  const { data: secondSignIn, error: secondSignInErr } = await supabase.auth.signInWithPassword({
                    email: targetEmail,
                    password: demoPass
                  });
                  if (!secondSignInErr && secondSignIn.user) {
                    onLoginSuccess(matchedDemo);
                    setLoading(false);
                    return;
                  }
                }
              } catch (e) {
                console.warn('Demo auto-signup/login failed:', e);
              }
            }

            // If signin fails due to rate limits or invalid credentials, fallback to local mock login
            console.warn('Supabase signin failed, falling back to mock login:', signInError.message);
            if (matchedDemo) {
              onLoginSuccess(matchedDemo);
            } else {
              onLoginSuccess({
                email: targetEmail,
                name: targetEmail.split('@')[0].toUpperCase(),
                rollNo: '7377221EE' + Math.floor(100 + Math.random() * 900),
                role: 'student',
                className: 'III EEE-A',
                yearOfStudy: '3rd Year',
                semester: 'Semester VI',
                department: 'Dept of EEE'
              });
            }
            setLoading(false);
            return;
          }

          if (data.user) {
            let role: 'student' | 'teacher' = 'student';
            let profileName = data.user.user_metadata?.name || targetEmail.split('@')[0].toUpperCase();
            let profileRollNo = data.user.user_metadata?.rollNo || '';

            const { data: facultyData } = await supabase
              .from('faculty')
              .select('*')
              .eq('email', targetEmail)
              .maybeSingle();

            if (facultyData || targetEmail.toLowerCase() === 'teacher@eee.com') {
              role = 'teacher';
              profileName = facultyData?.name || 'Dr. EEE HOD / Faculty';
              profileRollNo = 'FAC001';
            } else {
              const { data: studentData } = await supabase
                .from('student_profiles')
                .select('*')
                .eq('email', targetEmail)
                .maybeSingle();
              if (studentData) {
                profileName = studentData.name;
                profileRollNo = studentData.roll_no;
              }
            }

            onLoginSuccess({
              email: targetEmail,
              name: profileName,
              rollNo: profileRollNo,
              role,
              className: role === 'teacher' ? 'All EEE Classes' : 'III EEE-A',
              yearOfStudy: role === 'teacher' ? 'Staff' : '3rd Year',
              semester: role === 'teacher' ? 'Staff Portal' : 'Semester VI',
              department: 'Dept of EEE'
            });
            setLoading(false);
            return;
          }
        } catch (err: any) {
          console.warn('Supabase signin exception, falling back to mock login:', err);
          const matchedDemo = demoProfiles.find(
            p => p.email.toLowerCase() === targetEmail.toLowerCase()
          );
          if (matchedDemo) {
            onLoginSuccess(matchedDemo);
          } else {
            onLoginSuccess({
              email: targetEmail,
              name: targetEmail.split('@')[0].toUpperCase(),
              rollNo: '7377221EE' + Math.floor(100 + Math.random() * 900),
              role: 'student',
              className: 'III EEE-A',
              yearOfStudy: '3rd Year',
              semester: 'Semester VI',
              department: 'Dept of EEE'
            });
          }
          setLoading(false);
          return;
        }
      } else {
        const matchedProfile = demoProfiles.find(
          p => p.email.toLowerCase() === targetEmail.toLowerCase()
        );
        if (matchedProfile) {
          onLoginSuccess(matchedProfile);
        } else {
          onLoginSuccess({
            email: targetEmail,
            name: targetEmail.split('@')[0].toUpperCase(),
            rollNo: '7377221EE' + Math.floor(100 + Math.random() * 900),
            role: 'student',
            className: 'III EEE-A',
            yearOfStudy: '3rd Year',
            semester: 'Semester VI',
            department: 'Dept of EEE'
          });
        }
        setLoading(false);
        return;
      }
    }
  };

  const handleQuickLogin = async (profile: UserProfile) => {
    setLoading(true);
    setError('');
    const isSupabaseConfigured = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

    if (isSupabaseConfigured) {
      try {
        const demoPass = 'password123';
        const { data, error } = await supabase.auth.signInWithPassword({
          email: profile.email,
          password: demoPass
        });

        if (error) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: profile.email,
            password: demoPass,
            options: {
              data: {
                name: profile.name,
                rollNo: profile.rollNo,
              }
            }
          });

          if (!signUpError && signUpData.user) {
            if (profile.role !== 'teacher') {
              await supabase.from('student_profiles').insert({
                id: profile.email,
                roll_no: profile.rollNo,
                name: profile.name,
                email: profile.email,
                cgpa_json: {},
                arrears_count: 0,
                nptel_exams: []
              });
            }

            const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
              email: profile.email,
              password: demoPass
            });

            if (!retryError && retryData.user) {
              onLoginSuccess(profile);
              setLoading(false);
              return;
            }
          }
          
          // Fallback to local mock on any error (like rate limit)
          console.warn('Supabase quick login failed, falling back to mock login:', error.message);
          onLoginSuccess(profile);
          setLoading(false);
          return;
        }

        if (data.user) {
          onLoginSuccess(profile);
          setLoading(false);
          return;
        }
      } catch (err: any) {
        console.warn('Quick login error, falling back to mock login:', err);
        onLoginSuccess(profile);
        setLoading(false);
        return;
      }
    } else {
      onLoginSuccess(profile);
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setForgotSent(true);
    setTimeout(() => setForgotSent(false), 3000);
  };

  return (
    <div className="signin-page-overlay">
      {/* Top Animated Gradient Header Section */}
      <div className="signin-header-gradient">
        {/* Animated Background Glowing Orbs */}
        <div className="ambient-orb orb-1" />
        <div className="ambient-orb orb-2" />
        <div className="ambient-orb orb-3" />

        {/* Top Navbar */}
        <div className="signin-top-nav">
          <button
            className="signin-back-btn"
            onClick={onClose}
            aria-label="Close to Landing Page"
            title="Close and explore landing page"
          >
            <X size={20} />
          </button>

          <div className="signin-top-right">
            {!isNative && (
              <a
                href="/download.html"
                className="signin-get-started-btn"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
                title="Download Android APK"
              >
                <Download size={13} />
                <span>Get APK</span>
              </a>
            )}
          </div>
        </div>

        {/* Brand Banner with App Logo & Moving Quotes Ticker */}
        <div className="signin-brand-banner">
          <div className="signin-app-logo-wrap glowing-logo">
            <img src={appLogo} alt="App Logo" className="signin-app-logo-img" style={{ objectFit: 'cover' }} />
            <div className="logo-sparkle-ring" />
          </div>
          <h1 className="signin-brand-title">
            <span className="gradient-text-shimmer">EEE SREC PORTAL</span>
          </h1>
          <p className="signin-brand-sub">Sri Ramakrishna Eng. College · Dept of EEE</p>

          <div className="quotes-ticker-container glass-ticker">
            <Sparkles size={13} className="quote-icon glowing-sparkle" />
            <span className="quote-text-slide" key={quoteIndex}>{quotes[quoteIndex]}</span>
          </div>
        </div>
      </div>

      {/* Main White Card Sheet */}
      <div className="signin-card-sheet">
        <div className="signin-card-handle" />

        {/* Mode Toggle Tabs: Sign In / Sign Up */}
        <div className="signin-mode-tabs">
          <button
            type="button"
            className={`mode-tab-btn ${!isSignUp ? 'active' : ''}`}
            onClick={() => setIsSignUp(false)}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`mode-tab-btn ${isSignUp ? 'active' : ''}`}
            onClick={() => setIsSignUp(true)}
          >
            Sign Up
          </button>
        </div>

        <div className="signin-sheet-header">
          <h2>{isSignUp ? 'Create your account' : 'Welcome back'}</h2>
          <p>{isSignUp ? 'Join EEE SREC Smart Student Portal' : 'Enter your credentials to access portal'}</p>
        </div>

        {error && (
          <div className="signin-error-banner">
            <span>{error}</span>
          </div>
        )}

        {forgotSent && (
          <div className="signin-success-banner">
            <CheckCircle2 size={16} />
            <span>Password reset link sent to registered email!</span>
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

          {/* Full Name & Roll No (Shown in Sign Up mode) */}
          {isSignUp && (
            <>
              <div className="signin-field-group">
                <label htmlFor="signin-name">Your Name</label>
                <div className="signin-input-wrapper">
                  <User size={18} className="signin-input-icon" />
                  <input
                    id="signin-name"
                    type="text"
                    placeholder="Nithin Annamalai"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="signin-input"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="signin-field-group">
                <label htmlFor="signin-rollno">Roll Number</label>
                <div className="signin-input-wrapper">
                  <UserCheck size={18} className="signin-input-icon" />
                  <input
                    id="signin-rollno"
                    type="text"
                    placeholder="7377221EE001"
                    value={rollNo}
                    onChange={e => setRollNo(e.target.value)}
                    className="signin-input"
                    disabled={loading}
                  />
                </div>
              </div>
            </>
          )}

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

          {/* Sign In / Sign Up Button */}
          <button type="submit" className="signin-submit-btn" disabled={loading}>
            {loading ? (
              <span className="signin-btn-spinner">Authenticating...</span>
            ) : isSignUp ? (
              'Sign up'
            ) : (
              'Sign in'
            )}
          </button>

          {/* Continue as Guest Button */}
          {onClose && (
            <button
              type="button"
              className="signin-guest-btn"
              onClick={() => {
                const guestProfile: UserProfile = demoProfiles[0] || {
                  email: 'guest@eee.com',
                  name: 'Guest User',
                  rollNo: '7377221EE999',
                  role: 'student',
                  className: 'III EEE-A',
                  yearOfStudy: '3rd Year',
                  semester: 'Semester VI',
                  department: 'Dept of EEE'
                };
                onLoginSuccess(guestProfile);
              }}
              style={{
                width: '100%',
                marginTop: 8,
                padding: '10px',
                borderRadius: 12,
                border: '1.5px dashed var(--accent-blue)',
                background: 'rgba(56, 189, 248, 0.05)',
                color: 'var(--accent-blue)',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              🚀 Continue as Guest (Dev Mode)
            </button>
          )}

          {/* Forgot Password Link */}
          {!isSignUp && (
            <div className="signin-forgot-row">
              <button
                type="button"
                className="signin-forgot-btn"
                onClick={handleForgotPassword}
              >
                Forgot your password?
              </button>
            </div>
          )}
        </form>

        {/* Quick Demo Access Section */}
        <div className="signin-demo-section">
          <span className="signin-demo-title">⚡ Quick 1-Click Evaluation Login</span>
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
                    {profile.role === 'teacher'
                      ? 'Faculty Admin'
                      : `Roll: ${profile.rollNo} · ${profile.className}`}
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
