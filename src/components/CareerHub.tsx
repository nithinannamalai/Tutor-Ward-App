import React, { useState } from 'react';
import { ArrowLeft, BookOpen, Compass, Briefcase, GraduationCap } from 'lucide-react';

interface CareerHubProps {
  onBack: () => void;
}

type TabType = 'gate' | 'upsc' | 'placement';

export const CareerHub: React.FC<CareerHubProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<TabType>('gate');

  const content = {
    gate: {
      title: 'GATE (Graduate Aptitude Test in Engineering)',
      icon: <GraduationCap size={20} />,
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
        { title: 'Months 1-3: Fundamentals', desc: 'Master Math, Networks, and Electromagnetic Fields. Establish core calculations.' },
        { title: 'Months 4-7: Core EEE Subjects', desc: 'Study Machines, Power Systems, Controls, and Power Electronics in-depth.' },
        { title: 'Months 8-9: Secondary Subjects & Revision', desc: 'Complete Analog/Digital electronics, measurements, and summarize all formulas into short notes.' },
        { title: 'Months 10-12: Mocks & PYQs', desc: 'Solve past papers and complete 15+ full-length online test series. Focus on reducing negative marking.' }
      ],
      jobs: [
        { name: 'NTPC / PowerGrid', skills: 'Power Systems, Transmission, Generation Control' },
        { name: 'IOCL / ONGC', skills: 'Electrical Maintenance, Control Engineering, Instrumentation' },
        { name: 'BARC / ISRO', skills: 'Electromagnetics, Research, Reactor Control Systems' }
      ]
    },
    upsc: {
      title: 'UPSC (ESE & Civil Services Exams)',
      icon: <Compass size={20} />,
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
        { title: 'Phase 1: Foundation (6 Months)', desc: 'Complete technical subjects to descriptive standards. Write extensive proofs.' },
        { title: 'Phase 2: General Studies (3 Months)', desc: 'Study Prelims Paper 1 syllabus including aptitude, environment, standards, and ethics.' },
        { title: 'Phase 3: Prelims Grind (2 Months)', desc: 'Solve objective questions, study formulas, and practice speed tests.' },
        { title: 'Phase 4: Mains Answer Practice', desc: 'Immediately post-prelims, practice 3-hour descriptive question papers with neat diagrams.' }
      ],
      jobs: [
        { name: 'Indian Railway Service', skills: 'Locomotive power, Traction systems, Signals' },
        { name: 'Central Power Engineering', skills: 'Grid design, National energy policies' },
        { name: 'Indian Administrative Service (IAS)', skills: 'Public policy administration, optional paper proficiency' }
      ]
    },
    placement: {
      title: 'Campus Placements (Core & IT Streams)',
      icon: <Briefcase size={20} />,
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
        { title: 'Year 3 (Sem 5-6): Skill Building', desc: 'Learn programming (C++ / Python) or embedded hardware. Complete a minor project.' },
        { title: 'Summer Break: Internship', desc: 'Secure industrial training at a core factory or work on software development internship.' },
        { title: 'Year 4 (Sem 7): Mock Interviews', desc: 'Practice aptitude test papers, participate in mock group discussions (GD).' },
        { title: 'Sem 7-8: On-Campus Drives', desc: 'Apply to visiting corporate firms. Keep technical resumes ready.' }
      ],
      jobs: [
        { name: 'Siemens / ABB / L&T (Core)', skills: 'Switchgears, Power Electronics, Substation design, PLC automation' },
        { name: 'Tesla / Ather Energy (EV Core)', skills: 'Battery management systems (BMS), motor control, embedded firmware' },
        { name: 'TCS / Zoho / Amazon (IT)', skills: 'Data Structures, Java/Python, Database management, Problem-solving' }
      ]
    }
  };

  const activeData = content[activeTab];

  return (
    <div className="panel-view">
      <div className="panel-header">
        <button onClick={onBack} className="back-btn">
          <ArrowLeft size={20} />
        </button>
        <span className="panel-title">Career Hub & Roadmaps</span>
      </div>

      <div className="panel-body">
        {/* Navigation Tabs */}
        <div className="career-selector">
          <div 
            className={`career-tab ${activeTab === 'gate' ? 'active' : ''}`}
            onClick={() => setActiveTab('gate')}
          >
            GATE Exam
          </div>
          <div 
            className={`career-tab ${activeTab === 'upsc' ? 'active' : ''}`}
            onClick={() => setActiveTab('upsc')}
          >
            UPSC (ESE)
          </div>
          <div 
            className={`career-tab ${activeTab === 'placement' ? 'active' : ''}`}
            onClick={() => setActiveTab('placement')}
          >
            Placements
          </div>
        </div>

        {/* Selected Career Description */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
          <h3 style={{ fontSize: 15, fontWeight: '800', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: 8 }}>
            {activeData.icon}
            {activeData.title}
          </h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>{activeData.intro}</p>
        </div>

        {/* Visual Roadmap */}
        <div>
          <h4 style={{ fontSize: 13, fontWeight: '700', borderBottom: '1px solid var(--card-border)', paddingBottom: 6 }}>
            Preparation Roadmap
          </h4>
          <div className="roadmap-timeline">
            {activeData.roadmap.map((step, idx) => (
              <div key={idx} className="timeline-node">
                <h5 className="timeline-title">{step.title}</h5>
                <p className="timeline-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Syllabus */}
        <div>
          <h4 style={{ fontSize: 13, fontWeight: '700', borderBottom: '1px solid var(--card-border)', paddingBottom: 6, marginBottom: 8 }}>
            Syllabus Topics
          </h4>
          <ul style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {activeData.syllabus.map((item, idx) => (
              <li key={idx} style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Preparation Guidelines */}
        <div style={{ background: 'var(--bg-secondary)', padding: 12, borderRadius: 12, border: '1px solid var(--card-border)' }}>
          <h4 style={{ fontSize: 13, fontWeight: '700', color: 'var(--accent-blue)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <BookOpen size={16} /> How to Prepare
          </h4>
          <ul style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {activeData.preparation.map((item, idx) => (
              <li key={idx} style={{ fontSize: 11, color: 'var(--text-main)', lineHeight: 1.4 }}>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Expected Skills & Recruiters */}
        <div>
          <h4 style={{ fontSize: 13, fontWeight: '700', borderBottom: '1px solid var(--card-border)', paddingBottom: 6, marginBottom: 8 }}>
            Top Companies & Skills
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {activeData.jobs.map((job, idx) => (
              <div key={idx} className="document-item" style={{ padding: '8px 12px', background: 'var(--bg-secondary)' }}>
                <div className="doc-info">
                  <span style={{ fontSize: 12, fontWeight: '700', color: 'var(--text-main)' }}>{job.name}</span>
                  <span style={{ fontSize: 10, color: 'var(--accent-blue)' }}>Expects: {job.skills}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
