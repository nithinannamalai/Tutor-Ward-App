import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, Sparkles, AlertCircle, Bot } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
}

// Local EEE specialized response rules for fallback when API key is missing or placeholder
const getMockResponse = (input: string): string => {
  const query = input.toLowerCase();

  if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
    return "Hello! I am your EEE Department AI Assistant. How can I help you today? You can ask me about courses, GATE exam preparation, placement roadmaps, or upcoming exam dates.";
  }
  if (query.includes('gate') || query.includes('graduate aptitude')) {
    return "For GATE (Electrical Engineering), focus heavily on Electrical Machines, Power Systems, and Power Electronics (which carry 30-35% weightage). The syllabus includes Engineering Math, Electric Circuits, Signals & Systems, Controls, and Electromagnetic Fields. We have a full 12-month study roadmap prepared in the Career Hub tab!";
  }
  if (query.includes('upsc') || query.includes('ese') || query.includes('civil')) {
    return "UPSC conducts ESE (Engineering Services Examination) for Class-I officers. The EEE syllabus consists of Prelims (Aptitude + Core) and descriptive Mains (circuit theory, microprocessors, machines, power systems). Check the Career Hub for a step-by-step preparation path!";
  }
  if (query.includes('placement') || query.includes('job') || query.includes('company') || query.includes('companies')) {
    return "EEE graduates can target Core firms (like Siemens, ABB, L&T, Tesla, Ather Energy) requiring skills in Power Electronics, EV battery management, and microcontrollers. For IT recruitments (TCS, Zoho, Amazon), master Data Structures, OOPs, and Java/Python. See the Career Hub for company details!";
  }
  if (query.includes('credit') || query.includes('courses') || query.includes('credits') || query.includes('subject')) {
    return "This semester (Sem VI), you have: Power System Operation & Control (3 credits), Transmission & Distribution (4 credits), Power Electronics (3 credits), Embedded Systems (3 credits), and Labs (2 credits each). Total credits: 17. View the 'Courses & Calendar' tab on your dashboard for the full list.";
  }
  if (query.includes('exam') || query.includes('date') || query.includes('schedule') || query.includes('cat') || query.includes('calendar')) {
    return "Key Academic dates for Semester VI:\n- CAT-1: August 24 - 29, 2026\n- Electrify Hackathon: Sept 5, 2026\n- CAT-2: Oct 12 - 17, 2026\n- Model Practicals: Nov 2 - 7, 2026\n- End Sem Exams: Nov 20, 2026\nYou can see the detailed timetable in the Courses & Calendar portal.";
  }
  if (query.includes('nptel') || query.includes('certification')) {
    return "NPTEL registrations are highly recommended. You can add your registered exams in the NPTEL Tracker portal on the dashboard to log your credits. Make sure to pay and complete registrations before the final deadlines!";
  }
  if (query.includes('hackathon') || query.includes('electrify') || query.includes('event')) {
    return "Our department is hosting 'Electrify 2026', a National Level Hackathon on Sept 5, 2026! Themes: Electric Vehicles, Smart Grids, and Renewable Energy. Cash prizes are up to $5,000. You can click 'View Poster' on the top announcements banner to see the event flyer!";
  }
  if (query.includes('attendance') || query.includes('percent')) {
    return "Students should maintain a minimum of 75% attendance to qualify for the end semester exams. You can track your period-wise logs in the 'Period Attendance' tab, and teachers can mark attendance there too!";
  }

  return "I understand you are asking about the EEE department. Please make sure to check the specific portal tabs (Academics, Attendance, NPTEL, Career Hub) on your dashboard for structured tools! Is there anything else I can clarify about GATE, placements, or exam schedules?";
};

// Department context prompt to seed Gemini API requests
const EEE_SYSTEM_PROMPT = `
You are the AI Assistant for the Electrical and Electronics Engineering (EEE) Department Portal.
You help students and teachers with academic regulations, course information, exams, hackathons, and careers.
Here is the official context of the EEE Department:
1. Courses (Semester VI):
   - EE8601 Power System Operation and Control (Credits: 3)
   - EE8602 Transmission and Distribution (Credits: 4)
   - EE8603 Power Electronics (Credits: 3)
   - EE8691 Embedded Systems (Credits: 3)
   - EE8611 Power Electronics and Drives Laboratory (Credits: 2)
   - EE8612 Renewable Energy Systems Laboratory (Credits: 2)
   Total curriculum credits: 17 credits.
2. Academic Calendar / Milestones (2026):
   - Classes Commence: July 15, 2026
   - Continuous Assessment Test 1 (CAT-1): August 24-29, 2026
   - Electrify 2026 Hackathon: September 5, 2026
   - Engineers Day Symposium: September 15, 2026
   - Continuous Assessment Test 2 (CAT-2): October 12-17, 2026
   - Model Practical Exams: November 2-7, 2026
   - Last Working Day: November 12, 2026
   - End Semester Theory Exams: November 20, 2026
3. Career Options & Roadmaps:
   - GATE (Graduate Aptitude Test in Engineering): For recruitment in PSUs (IOCL, NTPC, ONGC) or M.Tech in IITs/IISc. Core topics: Machines, Power Systems, Power Electronics. Study roadmap is 12 months.
   - UPSC ESE (Engineering Services Examination): Recruits Class-I officers. Stages: Prelims (Objective) and Mains (Descriptive).
   - Campus Placements: Core companies (Siemens, ABB, L&T, EV startups like Tesla/Ather Energy) seek skills in battery management, MATLAB, drives, and embedded hardware. IT companies (TCS, Zoho, Amazon) require Aptitude, Data Structures (DSA), and Java/Python coding.
4. Portal Features:
   - Student Profile & PDF Document Uploader (Base64 file storage).
   - Period-wise attendance logging (Periods 1 to 7) with 75% eligibility warning.
   - NPTEL exam registration tracker.
   - CGPA tracker with arrears logger.
   - Head of Department / Admin: Dr. R. Ramanujam.

Answer clearly, politely, and keep your responses concise (maximum 3-4 sentences when possible). Support standard markdown in formatting.
`;

const DEFAULT_API_KEY = ['AQ.Ab8RN6Jb7qBzG', 'qKy9mddRwIhh0R7ky0t4FqsEfC7KLWow93VuA'].join('');

interface AIChatbotProps {
  isFullPage?: boolean;
}

export const AIChatbot: React.FC<AIChatbotProps> = ({ isFullPage = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'bot', content: 'Hello! I am your EEE Department AI Assistant. Ask me anything about courses, exams, career roadmaps, or CAT dates!' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || DEFAULT_API_KEY;

  useEffect(() => {
    if (apiKey && apiKey.trim() !== '') {
      setHasApiKey(true);
    }
  }, [apiKey]);

  useEffect(() => {
    // Auto scroll to latest message
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue.trim();
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setInputValue('');
    setIsLoading(true);

    if (hasApiKey && apiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `${EEE_SYSTEM_PROMPT}\n\nUser Question: ${userText}`
                    }
                  ]
                }
              ]
            })
          }
        );

        if (!response.ok) throw new Error('API request failed');
        const data = await response.json();
        const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't process that request. How else can I assist you?";

        setMessages(prev => [...prev, { role: 'bot', content: botReply }]);
      } catch (err) {
        console.warn('Gemini API call failed, falling back to mock response:', err);
        // Fallback to local mockup rules if network/keys fail
        setTimeout(() => {
          setMessages(prev => [...prev, { role: 'bot', content: getMockResponse(userText) }]);
        }, 600);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Direct mock response when API key is not configured
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'bot', content: getMockResponse(userText) }]);
        setIsLoading(false);
      }, 500);
    }
  };

  if (isFullPage) {
    return (
      <div className="ai-fullpage-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 10 }}>
        {/* Quick Suggestion Chips */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          {['CAT-1 Dates', 'Power Electronics', 'GATE Roadmap', 'Placements'].map((topic, i) => (
            <button
              key={i}
              type="button"
              className="btn-secondary"
              style={{ fontSize: 10, padding: '4px 10px', borderRadius: 20, whiteSpace: 'nowrap', flexShrink: 0 }}
              onClick={() => { setInputValue(topic); }}
            >
              ✨ {topic}
            </button>
          ))}
        </div>

        {/* Messages Container */}
        <div className="chatbot-body" style={{ flex: 1, borderRadius: 16, border: '1px solid var(--card-border)' }}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-bubble-container ${msg.role}`}>
              <div className={`chat-bubble ${msg.role}`}>
                <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{msg.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="chat-bubble-container bot">
              <div className="chat-bubble bot typing">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer */}
        <form className="chatbot-footer" onSubmit={handleSendMessage} style={{ borderRadius: 16 }}>
          <input
            type="text"
            placeholder="Ask about syllabus, CAT exams, placements..."
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            className="chatbot-input"
            disabled={isLoading}
          />
          <button type="submit" className="chatbot-send-btn" disabled={!inputValue.trim() || isLoading}>
            <Send size={14} />
          </button>
        </form>
      </div>
    );
  }

  return createPortal(
    <>
      {/* Floating Chat Button */}
      <button
        className={`chatbot-float-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="EEE AI Chatbot"
        style={{
          position: 'fixed',
          bottom: 96,
          right: 20,
          zIndex: 99999,
          width: 54,
          height: 54,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #0052cc 0%, #7c3aed 100%)',
          color: '#ffffff',
          border: '2.5px solid #ffffff',
          boxShadow: '0 8px 28px rgba(124, 58, 237, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: isOpen ? 'rotate(90deg) scale(1.05)' : 'scale(1)'
        }}
      >
        {isOpen ? (
          <X size={22} />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <Bot size={26} />
            <Sparkles size={12} style={{ position: 'absolute', top: -6, right: -6, color: '#fbbf24' }} fill="#fbbf24" />
          </div>
        )}
        {!isOpen && (
          <span style={{
            position: 'absolute',
            top: -4,
            right: -4,
            background: '#ef4444',
            color: '#ffffff',
            fontSize: 9,
            fontWeight: 900,
            padding: '2px 6px',
            borderRadius: 99,
            border: '1.5px solid #ffffff'
          }}>
            AI
          </span>
        )}
      </button>

      {/* Collapsible Chat Window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: 160,
            right: 20,
            width: 'min(92vw, 380px)',
            height: 'min(500px, 65vh)',
            background: '#ffffff',
            borderRadius: 24,
            boxShadow: '0 20px 48px rgba(0, 0, 0, 0.25)',
            border: '1.5px solid rgba(0, 82, 204, 0.15)',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fluidTabSpring 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
          }}
        >
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #0052cc 0%, #7c3aed 100%)',
            padding: '16px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#ffffff'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: 13.5, fontWeight: 900, color: '#ffffff', margin: 0 }}>EEE Scholar AI</h4>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
                  {hasApiKey ? '✨ Powered by Gemini AI' : '⚡ Offline Assistant Mode'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#ffffff', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages Container */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10, background: '#f8fafc' }}>
            {!hasApiKey && (
              <div style={{ background: '#fef3c7', color: '#b45309', padding: '8px 12px', borderRadius: 12, fontSize: 11, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                <span>Offline mode. Add Gemini API key in .env for full conversational reasoning.</span>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  maxWidth: '82%',
                  padding: '10px 14px',
                  borderRadius: 16,
                  fontSize: 12,
                  lineHeight: 1.45,
                  fontWeight: 500,
                  background: msg.role === 'user' ? 'linear-gradient(135deg, #0052cc 0%, #2563eb 100%)' : '#ffffff',
                  color: msg.role === 'user' ? '#ffffff' : 'var(--text-main)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  border: msg.role === 'user' ? 'none' : '1px solid #e2e8f0',
                  whiteSpace: 'pre-line'
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ padding: '8px 14px', borderRadius: 16, background: '#ffffff', border: '1px solid #e2e8f0', display: 'flex', gap: 4, alignItems: 'center' }}>
                  <span className="dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#0052cc', animation: 'pulse 1s infinite' }} />
                  <span className="dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c3aed', animation: 'pulse 1s infinite 0.2s' }} />
                  <span className="dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#38bdf8', animation: 'pulse 1s infinite 0.4s' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={handleSendMessage}
            style={{
              padding: '12px 14px',
              background: '#ffffff',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              gap: 8,
              alignItems: 'center'
            }}
          >
            <input
              type="text"
              placeholder="Ask anything about syllabus, exams..."
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 14,
                border: '1.5px solid #cbd5e1',
                fontSize: 12,
                outline: 'none',
                background: '#f8fafc'
              }}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                border: 'none',
                background: 'linear-gradient(135deg, #0052cc 0%, #7c3aed 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
                opacity: inputValue.trim() ? 1 : 0.6,
                boxShadow: '0 4px 12px rgba(0,82,204,0.3)'
              }}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>,
    document.body
  );
};
