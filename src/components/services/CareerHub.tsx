import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, CheckCircle2, Circle, Sparkles
} from 'lucide-react';

interface CareerHubProps {
  onBack: () => void;
  isAdmin?: boolean;
}

type TabType = 'gate' | 'upsc' | 'placement';

interface RoadmapStep {
  title: string;
  desc: string;
  tasks?: string[];
  icon?: string;
}

interface JobEntry {
  name: string;
  skills: string;
}

interface CareerData {
  title: string;
  intro: string;
  syllabus: string[];
  preparation: string[];
  roadmap: RoadmapStep[];
  jobs: JobEntry[];
}

const DEFAULT_CONTENT: Record<TabType, CareerData> = {
  gate: {
    title: 'GATE (Graduate Aptitude Test in Engineering)',
    intro: 'Qualifying GATE opens recruitment doors to top Public Sector Undertakings (PSUs) like IOCL, NTPC, ONGC, HPCL, and admissions to M.Tech/Ph.D. programs in IITs/IISc with stipends.',
    syllabus: [
      'Engineering Mathematics: Linear Algebra, Calculus, Differential Equations, Vector Analysis, Probability & Statistics.',
      'Electric Circuits: KCL, KVL, Node/Mesh Analysis, Network Theorems, Transient response of RLC circuits, 3-phase circuits.',
      'Electromagnetic Fields: Gauss Law, Ampere Law, Maxwell Equations, Waves, Magnetostatics.',
      'Signals and Systems: Fourier, Laplace, and Z-transforms, LTI systems.',
      'Electrical Machines: Single/Three-phase transformers, DC machines, Induction and Synchronous motors.',
      'Power Systems: Generation, transmission models, load flow, power factor correction, protection relays.',
      'Control Systems: Transfer functions, Routh-Hurwitz, Nyquist and Bode plots, State space models.',
      'Electrical Measurements: Bridges, potentiometers, oscilloscopes, instrument transformers.',
      'Analog & Digital Electronics: Diode circuits, Op-Amps, Multiplexers, counters, A/D & D/A converters.',
      'Power Electronics: Rectifiers, Choppers, Inverters, Cycloconverters, SCR, MOSFET, IGBT characteristics.'
    ],
    preparation: [
      'Start 10-12 months early. Allocate first 6 months to master core concepts.',
      'Focus heavily on Electrical Machines, Power Systems, and Power Electronics (these hold ~30-35% weightage).',
      'Solve previous 20 years GATE questions (PYQs) repeatedly to get comfortable with calculation speed.',
      'Take full-length Mock Tests starting 3 months before the exam to work on time management.',
      'Recommended Books: B.L. Theraja (Machines), C.L. Wadhwa (Power Systems), P.S. Bimbhra (Power Electronics).'
    ],
    roadmap: [
      {
        title: 'Phase 1: Foundation & Math (Months 1–3)',
        desc: 'Master Engineering Math, Network Theory, and Electromagnetic Fields. Establish core calculation speed.',
        tasks: ['Complete Linear Algebra & Calculus', 'Practice 200+ Network Theorems PYQs', 'Derive Maxwell Equations & Boundary Conditions'],
        icon: '🌱'
      },
      {
        title: 'Phase 2: Heavy Core EEE Mastery (Months 4–7)',
        desc: 'Study Electrical Machines, Power Systems, Control Systems, and Power Electronics in-depth.',
        tasks: ['Master Transformers, Induction & Synchronous Machines', 'Complete Load Flow & Fault Analysis in Power Systems', 'Plot Nyquist, Bode & Root Locus in Control Systems', 'Design Buck/Boost Choppers & Inverters'],
        icon: '⚡'
      },
      {
        title: 'Phase 3: Secondary Subjects & Formula Bible (Months 8–9)',
        desc: 'Complete Analog/Digital electronics, measurements, and summarize all key formulas into short revision notes.',
        tasks: ['Build Op-Amp and Digital Logic flashcards', 'Practice Bridge measurement error calculations', 'Compile 50-page Pocket Formula Handbook'],
        icon: '🔬'
      },
      {
        title: 'Phase 4: Full-Length Mocks & PYQ Blitz (Months 10–12)',
        desc: 'Solve 20+ years past papers and complete 15+ full-length online test series. Focus on zero negative marking.',
        tasks: ['Solve 2000–2025 All Subject PYQs', 'Take 12 Full Mock Tests with Virtual Calculator', 'Analyze mistakes & optimize 3-hour exam strategy'],
        icon: '🎯'
      }
    ],
    jobs: [
      { name: 'NTPC / PowerGrid', skills: 'Power Systems, Transmission, Generation Control' },
      { name: 'IOCL / ONGC', skills: 'Electrical Maintenance, Control Engineering, Instrumentation' },
      { name: 'BARC / ISRO', skills: 'Electromagnetics, Research, Reactor Control Systems' }
    ]
  },
  upsc: {
    title: 'UPSC (ESE & Civil Services Exams)',
    intro: 'UPSC conducts the Engineering Services Examination (ESE) to recruit Class-I officers (Indian Railway Service, Central Power Engineering Service) and the Civil Services Exam (IAS/IPS) with Electrical Engineering as an optional subject.',
    syllabus: [
      'ESE Stage-I (Preliminary): General Studies & Engineering Aptitude (Paper 1), Electrical Engineering Core (Paper 2).',
      'ESE Stage-II (Mains): Descriptive Paper I (Circuits, Fields, Materials, Machines) and Paper II (Power Systems, Control, Microprocessors, Communication Systems).',
      'Civil Services (IAS Optional): Paper 1 (Circuit Theory, EM Theory, Microprocessors) & Paper 2 (Control Systems, Electrical Machines & Power Electronics, Power Systems & Protection).'
    ],
    preparation: [
      'ESE requires both high-speed objective solving (Prelims) and structured descriptive answer writing (Mains).',
      'Stay updated with General Studies (current affairs, environment, project management, ethics).',
      'Practice drawing neat, labeled circuit diagrams and derivation steps for Mains papers.',
      'Solve Engineering Services past papers of the last 25 years.'
    ],
    roadmap: [
      {
        title: 'Phase 1: Deep Technical Foundation (6 Months)',
        desc: 'Complete technical subjects to descriptive standards. Write extensive derivations and proofs.',
        tasks: ['Complete Circuit Theory & EM Fields derivations', 'Study Material Science & Electrical Machines', 'Draw neat labeled phasor diagrams for all machines'],
        icon: '🏛️'
      },
      {
        title: 'Phase 2: General Studies & Aptitude (3 Months)',
        desc: 'Study Prelims Paper 1 syllabus including aptitude, environment, standards, and engineering ethics.',
        tasks: ['Cover Project Management & Quality Control', 'Study Environmental issues & Energy resources', 'Practice 500+ Logical Reasoning & Ethics MCQs'],
        icon: '📖'
      },
      {
        title: 'Phase 3: Prelims Speed Marathon (2 Months)',
        desc: 'Solve objective questions, study formulas, and practice 3-hour speed test papers.',
        tasks: ['Take 20 Prelims Sectional Speed Tests', 'Solve 15 Years ESE Prelims Papers', 'Master elimination techniques for tricky MCQs'],
        icon: '⚡'
      },
      {
        title: 'Phase 4: Descriptive Mains Answer Mastery',
        desc: 'Immediately post-prelims, practice 3-hour descriptive question papers with neat diagrams.',
        tasks: ['Write 30 Full Length Descriptive Papers', 'Practice 20-mark derivation answer templates', 'Attend Mock Technical Personality Interviews'],
        icon: '🏆'
      }
    ],
    jobs: [
      { name: 'Indian Railway Service (IRSE)', skills: 'Locomotive power, Traction systems, Signals' },
      { name: 'Central Power Engineering', skills: 'Grid design, National energy policies' },
      { name: 'Indian Administrative Service (IAS)', skills: 'Public policy administration, optional paper proficiency' }
    ]
  },
  placement: {
    title: 'Campus Placements (Core & IT Streams)',
    intro: 'EEE students are uniquely eligible for both Core Electrical companies and IT/Software corporate recruitments.',
    syllabus: [
      'Core Placements: Circuit Design, Electrical Drives, Microcontroller coding (8051, PIC, Arduino), Power electronic converter design, PLC/SCADA basics.',
      'IT Placements: Quantitative Aptitude, Logical Reasoning, Object-Oriented Programming (OOPs), Data Structures & Algorithms (DSA), System Design, Web Development (HTML/CSS/JS/React).'
    ],
    preparation: [
      'For Core: Secure a solid internship in electric vehicles (EV), solar, or automation. Work on hardware projects.',
      'For IT: Practice coding problems on platforms like LeetCode or GeeksforGeeks. Master arrays, strings, searching, and sorting.',
      'Prepare a strong PDF resume (link in Profile & Documents portal) and practice mock HR interviews.'
    ],
    roadmap: [
      {
        title: 'Phase 1: Skill Stacking & Hardware Projects (Sem 5–6)',
        desc: 'Learn programming (C++ / Python) or embedded hardware. Complete an industry-relevant capstone project.',
        tasks: ['Master C++/Python OOPs & DSA basics', 'Build an Arduino / IoT EV telemetry project', 'Earn NPTEL / Coursera Core Certification'],
        icon: '🛠️'
      },
      {
        title: 'Phase 2: Industrial Summer Internship (Summer Break)',
        desc: 'Secure industrial training at a core factory or software development internship.',
        tasks: ['Complete 4-week In-Plant / Core Training', 'Obtain Verified Internship Certificate', 'Document project outcomes in GitHub & Vault'],
        icon: '💼'
      },
      {
        title: 'Phase 3: Aptitude & Mock Interview Drills (Sem 7)',
        desc: 'Practice aptitude test papers, participate in mock group discussions (GD) and technical HR rounds.',
        tasks: ['Solve 50+ Quantitative & Logical Aptitude Tests', 'Participate in 5 Mock GD & HR Sessions', 'Polish 1-Page ATS-Optimized Technical Resume'],
        icon: '🎯'
      },
      {
        title: 'Phase 4: On-Campus Recruitment Drives (Sem 7–8)',
        desc: 'Apply to visiting corporate firms. Attend interviews with confidence and secure dream offer.',
        tasks: ['Clear Day-1 Mass Recruiter Online Rounds', 'Crack Super-Dream Core / IT Technical Interviews', 'Sign Institutional Placement Offer Letter'],
        icon: '🚀'
      }
    ],
    jobs: [
      { name: 'Siemens / ABB / L&T (Core)', skills: 'Switchgears, Power Electronics, Substation design, PLC automation' },
      { name: 'Tesla / Ather Energy (EV Core)', skills: 'Battery management systems (BMS), motor control, embedded firmware' },
      { name: 'TCS / Zoho / Amazon (IT)', skills: 'Data Structures, Java/Python, Database management, Problem-solving' }
    ]
  }
};

export const CareerHub: React.FC<CareerHubProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<TabType>('gate');
  const [careerData, setCareerData] = useState<Record<TabType, CareerData>>(DEFAULT_CONTENT);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem('eee_career_data');
      if (stored) setCareerData(JSON.parse(stored));
      const stepsStored = localStorage.getItem('eee_completed_tree_steps');
      if (stepsStored) setCompletedSteps(JSON.parse(stepsStored));
    } catch (e) {
      console.error('Failed to load career data:', e);
    }
  }, []);

  const toggleStep = (stepKey: string) => {
    const next = { ...completedSteps, [stepKey]: !completedSteps[stepKey] };
    setCompletedSteps(next);
    localStorage.setItem('eee_completed_tree_steps', JSON.stringify(next));
  };

  const activeData = careerData[activeTab];

  // Calculate tree progress
  const totalTasks = activeData.roadmap.reduce((acc, s) => acc + (s.tasks?.length || 1), 0);
  const completedCount = activeData.roadmap.reduce((acc, s, sIdx) => {
    const tasks = s.tasks || [s.title];
    return acc + tasks.filter((_, tIdx) => completedSteps[`${activeTab}-${sIdx}-${tIdx}`]).length;
  }, 0);
  const masteryPercentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return (
    <div className="dedicated-page-view page-slide-enter" style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 88 }}>
      {/* Header with Small Back Button near Title */}
      <div className="dedicated-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="page-back-btn" onClick={onBack} title="Go Back">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="dedicated-page-title" style={{ display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
              🌳 Career Roadmaps &amp; Skill Tree
            </h2>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Interactive Branching Roadmap &amp; Syllabus Tree
            </span>
          </div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #0052cc 0%, #2563eb 100%)', color: '#fff', padding: '6px 14px', borderRadius: 20, fontWeight: 800, fontSize: 11.5, display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 12px rgba(0,82,204,0.3)' }}>
          <Sparkles size={14} /> {masteryPercentage}% Mastery
        </div>
      </div>

      <div style={{ padding: '16px', maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Navigation Selector Pill Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, background: '#ffffff', padding: 6, borderRadius: 20, border: '1.5px solid rgba(0,82,204,0.12)', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          {[
            { id: 'gate', label: 'GATE Exam', icon: '🎓' },
            { id: 'upsc', label: 'UPSC (ESE)', icon: '🏛️' },
            { id: 'placement', label: 'Placements', icon: '💼' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              style={{
                padding: '10px 6px',
                borderRadius: 14,
                border: 'none',
                background: activeTab === tab.id ? 'linear-gradient(135deg, #0052cc 0%, #2563eb 100%)' : 'transparent',
                color: activeTab === tab.id ? '#ffffff' : '#64748b',
                fontWeight: 800,
                fontSize: 12,
                cursor: 'pointer',
                transition: 'all 0.24s cubic-bezier(0.34, 1.56, 0.64, 1)',
                boxShadow: activeTab === tab.id ? '0 4px 12px rgba(0,82,204,0.35)' : 'none',
                transform: activeTab === tab.id ? 'scale(1.02)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Hero Card with Progress Meter */}
        <div style={{
          background: 'linear-gradient(135deg, #0052cc 0%, #1e40af 100%)',
          borderRadius: 24,
          padding: '20px',
          color: '#ffffff',
          boxShadow: '0 12px 30px rgba(0, 82, 204, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: 16, fontWeight: 900 }}>
            {activeData.title}
          </h3>
          <p style={{ margin: '0 0 14px 0', fontSize: 11.5, opacity: 0.9, lineHeight: 1.4 }}>
            {activeData.intro}
          </p>

          <div style={{ background: 'rgba(255,255,255,0.14)', padding: '12px 14px', borderRadius: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, fontWeight: 800, marginBottom: 6 }}>
              <span>Interactive Roadmap Progress</span>
              <span>{completedCount} of {totalTasks} Milestones ({masteryPercentage}%)</span>
            </div>
            <div style={{ width: '100%', height: 8, background: 'rgba(255,255,255,0.2)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${masteryPercentage}%`, height: '100%', background: '#38bdf8', borderRadius: 4, transition: 'width 0.5s ease', boxShadow: '0 0 10px #38bdf8' }} />
            </div>
          </div>
        </div>

        {/* 🌟 INTERACTIVE TREE ROADMAP 🌟 */}
        <div style={{ background: '#ffffff', borderRadius: 28, padding: 22, border: '1.5px solid rgba(0,82,204,0.12)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h4 style={{ margin: 0, fontSize: 14, fontWeight: 900, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
              🌱 Interactive Milestone Skill Tree
            </h4>
            <span style={{ fontSize: 10.5, color: '#64748b', fontWeight: 700 }}>Tap tasks to check off</span>
          </div>

          {/* Tree Trunk Container */}
          <div style={{ position: 'relative', paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Glowing Vertical Trunk Line */}
            <div style={{ position: 'absolute', top: 12, bottom: 20, left: 10, width: 3, background: 'linear-gradient(to bottom, #0052cc 0%, #38bdf8 50%, #10b981 100%)', borderRadius: 3 }} />

            {activeData.roadmap.map((step, sIdx) => {
              const tasks = step.tasks || [step.desc];
              const stepCompleted = tasks.every((_, tIdx) => completedSteps[`${activeTab}-${sIdx}-${tIdx}`]);

              return (
                <div key={sIdx} style={{ position: 'relative' }}>
                  {/* Glowing Node Orb on Trunk */}
                  <div style={{
                    position: 'absolute',
                    left: -24 + 1,
                    top: 12,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: stepCompleted ? '#10b981' : '#0052cc',
                    border: '3px solid #ffffff',
                    boxShadow: stepCompleted ? '0 0 10px #10b981' : '0 0 10px rgba(0,82,204,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    color: '#ffffff',
                    zIndex: 2
                  }}>
                    {stepCompleted ? '✓' : sIdx + 1}
                  </div>

                  {/* Branch Node Card */}
                  <div style={{
                    background: stepCompleted ? '#f0fdf4' : '#f8fafc',
                    borderRadius: 18,
                    padding: '14px 16px',
                    border: '1.5px solid',
                    borderColor: stepCompleted ? '#86efac' : 'rgba(0,82,204,0.12)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    transition: 'all 0.24s ease'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 18 }}>{step.icon || '📌'}</span>
                      <h5 style={{ margin: 0, fontSize: 13, fontWeight: 900, color: 'var(--text-main)' }}>
                        {step.title}
                      </h5>
                    </div>
                    <p style={{ margin: '0 0 10px 0', fontSize: 11, color: '#64748b', lineHeight: 1.35 }}>
                      {step.desc}
                    </p>

                    {/* Interactive Sub-tasks */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 8, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                      {tasks.map((task, tIdx) => {
                        const isDone = !!completedSteps[`${activeTab}-${sIdx}-${tIdx}`];
                        return (
                          <div
                            key={tIdx}
                            onClick={() => toggleStep(`${activeTab}-${sIdx}-${tIdx}`)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              cursor: 'pointer',
                              padding: '6px 10px',
                              borderRadius: 10,
                              background: isDone ? 'rgba(16, 185, 129, 0.12)' : '#ffffff',
                              border: '1px solid',
                              borderColor: isDone ? 'rgba(16, 185, 129, 0.3)' : '#e2e8f0',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {isDone ? (
                              <CheckCircle2 size={15} style={{ color: '#10b981', flexShrink: 0 }} />
                            ) : (
                              <Circle size={15} style={{ color: '#94a3b8', flexShrink: 0 }} />
                            )}
                            <span style={{
                              fontSize: 11.5,
                              fontWeight: isDone ? 700 : 500,
                              color: isDone ? '#166534' : 'var(--text-main)',
                              textDecoration: isDone ? 'line-through' : 'none'
                            }}>
                              {task}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 📚 SYLLABUS KNOWLEDGE BRANCHES */}
        <div style={{ background: '#ffffff', borderRadius: 28, padding: 22, border: '1.5px solid rgba(0,82,204,0.12)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <h4 style={{ margin: '0 0 14px 0', fontSize: 14, fontWeight: 900, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
            📚 Core Syllabus Modules &amp; Domains
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {activeData.syllabus.map((item, idx) => {
              const [subject, ...topics] = item.split(':');
              return (
                <div
                  key={idx}
                  style={{
                    background: '#f8fafc',
                    borderRadius: 16,
                    padding: '12px 14px',
                    border: '1px solid rgba(0,82,204,0.08)',
                    borderLeft: '4px solid var(--accent-blue)'
                  }}
                >
                  <span style={{ fontSize: 12.5, fontWeight: 900, color: 'var(--accent-blue)', display: 'block', marginBottom: 2 }}>
                    {subject}
                  </span>
                  <span style={{ fontSize: 11, color: '#64748b', lineHeight: 1.35 }}>
                    {topics.join(':')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 🏢 RECRUITMENT & TARGET COMPANIES */}
        <div style={{ background: '#ffffff', borderRadius: 28, padding: 22, border: '1.5px solid rgba(0,82,204,0.12)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <h4 style={{ margin: '0 0 14px 0', fontSize: 14, fontWeight: 900, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
            🏢 Target Recruiters &amp; Skill Profiles
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
            {activeData.jobs.map((job, jIdx) => (
              <div
                key={jIdx}
                style={{
                  background: '#f8fafc',
                  borderRadius: 16,
                  padding: '12px 16px',
                  border: '1px solid rgba(0,82,204,0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <h5 style={{ margin: 0, fontSize: 13, fontWeight: 900, color: 'var(--text-main)' }}>{job.name}</h5>
                  <span style={{ fontSize: 11, color: '#64748b' }}>Skills: {job.skills}</span>
                </div>
                <span style={{ padding: '4px 10px', borderRadius: 12, background: 'rgba(0,82,204,0.1)', color: 'var(--accent-blue)', fontSize: 10.5, fontWeight: 800 }}>
                  High Demand
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
