import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Compass, Briefcase, GraduationCap, Trash2, Pencil, X } from 'lucide-react';

interface CareerHubProps {
  onBack: () => void;
  isAdmin?: boolean;
}

type TabType = 'gate' | 'upsc' | 'placement';

interface RoadmapStep {
  title: string;
  desc: string;
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

export const CareerHub: React.FC<CareerHubProps> = ({ onBack, isAdmin = false }) => {
  const [activeTab, setActiveTab] = useState<TabType>('gate');
  const [careerData, setCareerData] = useState<Record<TabType, CareerData>>(DEFAULT_CONTENT);
  const [editMode, setEditMode] = useState(false);

  // Forms state
  const [newSyllabusItem, setNewSyllabusItem] = useState('');
  const [newPrepItem, setNewPrepItem] = useState('');
  const [newStepTitle, setNewStepTitle] = useState('');
  const [newStepDesc, setNewStepDesc] = useState('');
  const [newJobName, setNewJobName] = useState('');
  const [newJobSkills, setNewJobSkills] = useState('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('eee_career_data');
      if (stored) {
        setCareerData(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load career data:', e);
    }
  }, []);

  const saveCareerData = (newData: Record<TabType, CareerData>) => {
    localStorage.setItem('eee_career_data', JSON.stringify(newData));
    setCareerData(newData);
  };

  const activeData = careerData[activeTab];

  // Helper to update active tab fields
  const updateActiveDataField = (field: keyof CareerData, value: any) => {
    const updated = {
      ...careerData,
      [activeTab]: {
        ...careerData[activeTab],
        [field]: value
      }
    };
    saveCareerData(updated);
  };

  const handleAddSyllabus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSyllabusItem.trim()) return;
    const updated = [...activeData.syllabus, newSyllabusItem.trim()];
    updateActiveDataField('syllabus', updated);
    setNewSyllabusItem('');
  };

  const handleDeleteSyllabus = (idx: number) => {
    const updated = activeData.syllabus.filter((_, i) => i !== idx);
    updateActiveDataField('syllabus', updated);
  };

  const handleAddPrep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrepItem.trim()) return;
    const updated = [...activeData.preparation, newPrepItem.trim()];
    updateActiveDataField('preparation', updated);
    setNewPrepItem('');
  };

  const handleDeletePrep = (idx: number) => {
    const updated = activeData.preparation.filter((_, i) => i !== idx);
    updateActiveDataField('preparation', updated);
  };

  const handleAddRoadmap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStepTitle.trim() || !newStepDesc.trim()) return;
    const updated = [...activeData.roadmap, { title: newStepTitle.trim(), desc: newStepDesc.trim() }];
    updateActiveDataField('roadmap', updated);
    setNewStepTitle('');
    setNewStepDesc('');
  };

  const handleDeleteRoadmap = (idx: number) => {
    const updated = activeData.roadmap.filter((_, i) => i !== idx);
    updateActiveDataField('roadmap', updated);
  };

  const handleAddJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobName.trim() || !newJobSkills.trim()) return;
    const updated = [...activeData.jobs, { name: newJobName.trim(), skills: newJobSkills.trim() }];
    updateActiveDataField('jobs', updated);
    setNewJobName('');
    setNewJobSkills('');
  };

  const handleDeleteJob = (idx: number) => {
    const updated = activeData.jobs.filter((_, i) => i !== idx);
    updateActiveDataField('jobs', updated);
  };

  const getIcon = (tab: TabType) => {
    switch (tab) {
      case 'gate': return <GraduationCap size={20} />;
      case 'upsc': return <Compass size={20} />;
      case 'placement': return <Briefcase size={20} />;
    }
  };

  return (
    <div className="panel-view">
      <div className="panel-header">
        <button onClick={onBack} className="back-btn">
          <ArrowLeft size={20} />
        </button>
        <span className="panel-title">Career Hub & Roadmaps</span>
        {isAdmin && (
          <button
            onClick={() => setEditMode(e => !e)}
            style={{
              marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4,
              padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer',
              border: `1.5px solid ${editMode ? '#f87171' : 'var(--accent-blue)'}`,
              background: editMode ? 'rgba(248,113,113,0.12)' : 'rgba(56,189,248,0.12)',
              color: editMode ? '#f87171' : 'var(--accent-blue)',
            }}
          >
            {editMode ? <><X size={12} /> Done</> : <><Pencil size={12} /> Edit</>}
          </button>
        )}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
          {editMode ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: 'var(--bg-secondary)', padding: 12, borderRadius: 10, border: '1px solid var(--card-border)' }}>
              <div>
                <label className="form-label">Tab Title</label>
                <input 
                  value={activeData.title} 
                  onChange={e => updateActiveDataField('title', e.target.value)} 
                  className="form-input" 
                  style={{ fontSize: 12 }}
                />
              </div>
              <div>
                <label className="form-label">Introduction Summary</label>
                <textarea 
                  value={activeData.intro} 
                  onChange={e => updateActiveDataField('intro', e.target.value)} 
                  className="form-input" 
                  style={{ fontSize: 12, minHeight: 60, resize: 'vertical' }}
                />
              </div>
            </div>
          ) : (
            <>
              <h3 style={{ fontSize: 15, fontWeight: '800', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: 8 }}>
                {getIcon(activeTab)}
                {activeData.title}
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>{activeData.intro}</p>
            </>
          )}
        </div>

        {/* Visual Roadmap */}
        <div>
          <h4 style={{ fontSize: 13, fontWeight: '700', borderBottom: '1px solid var(--card-border)', paddingBottom: 6 }}>
            Preparation Roadmap
          </h4>
          
          {editMode && (
            <form onSubmit={handleAddRoadmap} style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 12, border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: 8, margin: '8px 0' }}>
              <span style={{ fontSize: 11, fontWeight: 'bold', color: 'var(--accent-gold)' }}>Add Roadmap Phase</span>
              <div>
                <label className="form-label">Phase Title</label>
                <input value={newStepTitle} onChange={e => setNewStepTitle(e.target.value)} className="form-input" placeholder="e.g. Months 1-3: Setup" required style={{ fontSize: 11 }} />
              </div>
              <div>
                <label className="form-label">Phase Description</label>
                <input value={newStepDesc} onChange={e => setNewStepDesc(e.target.value)} className="form-input" placeholder="e.g. Complete basic electrical topics" required style={{ fontSize: 11 }} />
              </div>
              <button type="submit" className="btn-primary" style={{ fontSize: 11, padding: '6px' }}>Add Phase</button>
            </form>
          )}

          <div className="roadmap-timeline" style={{ marginTop: 8 }}>
            {activeData.roadmap.map((step, idx) => (
              <div key={idx} className="timeline-node" style={{ position: 'relative' }}>
                {editMode && (
                  <button 
                    onClick={() => handleDeleteRoadmap(idx)} 
                    style={{ position: 'absolute', right: 0, top: 0, background: 'none', border: 'none', cursor: 'pointer', color: '#f87171' }}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
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

          {editMode && (
            <form onSubmit={handleAddSyllabus} style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              <input 
                value={newSyllabusItem} 
                onChange={e => setNewSyllabusItem(e.target.value)} 
                className="form-input" 
                placeholder="Add syllabus topic..." 
                required 
                style={{ fontSize: 11, flex: 1 }}
              />
              <button type="submit" className="btn-primary" style={{ padding: '0 12px', fontSize: 11 }}>Add</button>
            </form>
          )}

          <ul style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {activeData.syllabus.map((item, idx) => (
              <li key={idx} style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <span>{item}</span>
                  {editMode && (
                    <button 
                      onClick={() => handleDeleteSyllabus(idx)} 
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', padding: 0, flexShrink: 0 }}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Preparation Guidelines */}
        <div style={{ background: 'var(--bg-secondary)', padding: 12, borderRadius: 12, border: '1px solid var(--card-border)' }}>
          <h4 style={{ fontSize: 13, fontWeight: '700', color: 'var(--accent-blue)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <BookOpen size={16} /> How to Prepare
          </h4>

          {editMode && (
            <form onSubmit={handleAddPrep} style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              <input 
                value={newPrepItem} 
                onChange={e => setNewPrepItem(e.target.value)} 
                className="form-input" 
                placeholder="Add guideline..." 
                required 
                style={{ fontSize: 11, flex: 1, background: 'var(--bg-primary)' }}
              />
              <button type="submit" className="btn-primary" style={{ padding: '0 12px', fontSize: 11 }}>Add</button>
            </form>
          )}

          <ul style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {activeData.preparation.map((item, idx) => (
              <li key={idx} style={{ fontSize: 11, color: 'var(--text-main)', lineHeight: 1.4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <span>{item}</span>
                  {editMode && (
                    <button 
                      onClick={() => handleDeletePrep(idx)} 
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', padding: 0, flexShrink: 0 }}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Expected Skills & Recruiters */}
        <div>
          <h4 style={{ fontSize: 13, fontWeight: '700', borderBottom: '1px solid var(--card-border)', paddingBottom: 6, marginBottom: 8 }}>
            Top Companies & Skills
          </h4>

          {editMode && (
            <form onSubmit={handleAddJob} style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 12, border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 'bold', color: 'var(--accent-blue)' }}>Add Company Recruiter</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <label className="form-label">Company Name</label>
                  <input value={newJobName} onChange={e => setNewJobName(e.target.value)} className="form-input" placeholder="e.g. Siemens" required style={{ fontSize: 11 }} />
                </div>
                <div>
                  <label className="form-label">Key Expectation</label>
                  <input value={newJobSkills} onChange={e => setNewJobSkills(e.target.value)} className="form-input" placeholder="e.g. PLC SCADA" required style={{ fontSize: 11 }} />
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ fontSize: 11, padding: '6px' }}>Add Company</button>
            </form>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {activeData.jobs.map((job, idx) => (
              <div key={idx} className="document-item" style={{ padding: '8px 12px', background: 'var(--bg-secondary)' }}>
                <div className="doc-info">
                  <span style={{ fontSize: 12, fontWeight: '700', color: 'var(--text-main)' }}>{job.name}</span>
                  <span style={{ fontSize: 10, color: 'var(--accent-blue)' }}>Expects: {job.skills}</span>
                </div>
                {editMode && (
                  <button onClick={() => handleDeleteJob(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', padding: 4, flexShrink: 0 }}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
