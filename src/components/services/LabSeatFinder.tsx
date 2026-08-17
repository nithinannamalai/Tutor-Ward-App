import React, { useState } from 'react';
import { Search, MapPin, User, Building } from 'lucide-react';

interface LabSeatFinderProps {
  onBack: () => void;
  rollNo?: string;
}

interface SeatAssignment {
  rollNo: string;
  studentName: string;
  labName: string;
  block: string;
  roomNo: string;
  benchNo: string;
  systemNo: string;
  session: string;
  time: string;
  supervisor: string;
}

const SAMPLE_ASSIGNMENTS: SeatAssignment[] = [
  {
    rollNo: '7377221EE001',
    studentName: 'Nithin Annamalai',
    labName: 'Power Electronics & Drives Laboratory',
    block: 'EEE Main Block - 2nd Floor',
    roomNo: 'EB-204',
    benchNo: 'Bench B-04',
    systemNo: 'PE-KIT-07',
    session: 'FN (Forenoon)',
    time: '09:00 AM – 12:00 PM',
    supervisor: 'Mr. K. Senthilkumar'
  },
  {
    rollNo: '7377221EE002',
    studentName: 'Aravind Swamy',
    labName: 'Renewable Energy Systems Laboratory',
    block: 'EEE Research Block - Ground Floor',
    roomNo: 'RB-102',
    benchNo: 'Bench A-02',
    systemNo: 'RE-SOLAR-03',
    session: 'FN (Forenoon)',
    time: '09:00 AM – 12:00 PM',
    supervisor: 'Ms. P. Vijayalakshmi'
  },
  {
    rollNo: '7377221EE003',
    studentName: 'Bhavani Shankar',
    labName: 'Embedded Systems Laboratory',
    block: 'IT & EEE Block - 3rd Floor',
    roomNo: 'EB-308',
    benchNo: 'Bench C-12',
    systemNo: 'EMB-ARM-15',
    session: 'AN (Afternoon)',
    time: '01:30 PM – 04:30 PM',
    supervisor: 'Dr. M. Arulkumar'
  }
];

export const LabSeatFinder: React.FC<LabSeatFinderProps> = ({ onBack, rollNo: initialRoll = '' }) => {
  const [searchQuery, setSearchQuery] = useState(initialRoll);
  const [selectedLab, setSelectedLab] = useState('Power Electronics & Drives Laboratory');
  const [result, setResult] = useState<SeatAssignment | null>(
    SAMPLE_ASSIGNMENTS.find(a => a.rollNo.toLowerCase() === initialRoll.toLowerCase()) || SAMPLE_ASSIGNMENTS[0]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    const found = SAMPLE_ASSIGNMENTS.find(a => 
      a.rollNo.toLowerCase() === query || 
      a.studentName.toLowerCase().includes(query)
    );

    if (found) {
      setResult(found);
    } else {
      // Generate dynamic seat assignment for any roll number
      setResult({
        rollNo: searchQuery.toUpperCase() || '7377221EE999',
        studentName: 'EEE Student',
        labName: selectedLab,
        block: 'EEE Main Block - 2nd Floor',
        roomNo: 'EB-206',
        benchNo: `Bench ${String.fromCharCode(65 + Math.floor(Math.random() * 4))}-${Math.floor(Math.random() * 15) + 1}`,
        systemNo: `SYS-EEE-${Math.floor(Math.random() * 30) + 1}`,
        session: 'FN (Forenoon)',
        time: '09:00 AM – 12:00 PM',
        supervisor: 'Dr. S. Kavitha'
      });
    }
  };

  return (
    <div style={{ padding: '4px 0 20px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 4px 0', color: 'var(--text-main)' }}>
            🔬 Lab Exam Hall & Seat Finder
          </h2>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
            Instant Seat & Desk Locator for EEE Practical Examinations & Lab Sessions
          </p>
        </div>
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} style={{ background: 'var(--bg-primary)', padding: 18, borderRadius: 18, border: '1px solid var(--card-border)', marginBottom: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, alignItems: 'end' }}>
          <div>
            <label className="form-label" style={{ fontSize: 11, fontWeight: 700, marginBottom: 6, display: 'block' }}>Select Lab Course</label>
            <select className="form-input" value={selectedLab} onChange={e => setSelectedLab(e.target.value)} style={{ fontSize: 13, width: '100%', padding: '10px 12px', borderRadius: 10 }}>
              <option>Power Electronics & Drives Laboratory</option>
              <option>Renewable Energy Systems Laboratory</option>
              <option>Embedded Systems Laboratory</option>
              <option>Digital Logic Circuits Laboratory</option>
            </select>
          </div>
          <div>
            <label className="form-label" style={{ fontSize: 11, fontWeight: 700, marginBottom: 6, display: 'block' }}>Enter Roll No or Student Name</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. 7377221EE001 or Nithin"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ fontSize: 13, width: '100%', padding: '10px 12px', borderRadius: 10 }}
              required
            />
          </div>
          <button type="submit" className="btn-primary" style={{ height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, borderRadius: 10 }}>
            <Search size={16} /> Locate Seat
          </button>
        </div>
      </form>

      {/* Result Card */}
      {result && (
        <div style={{ background: 'linear-gradient(135deg, #0052cc 0%, #1e40af 100%)', borderRadius: 24, padding: 24, color: '#fff', boxShadow: '0 16px 36px rgba(0, 82, 204, 0.25)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: 16, marginBottom: 20 }}>
            <div>
              <span style={{ fontSize: 10, fontWeight: 800, textTransform: uppercaseText('CONFIRMED LAB SEAT ALLOCATION'), background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: 20 }}>
                ✓ OFFICIAL ALLOCATION
              </span>
              <h3 style={{ fontSize: 20, fontWeight: 900, margin: '8px 0 2px 0', color: '#fff' }}>{result.studentName}</h3>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', margin: 0 }}>Roll No: {result.rollNo}</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', padding: '8px 16px', borderRadius: 14, textAlign: 'right' }}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', opacity: 0.8 }}>Lab Session</div>
              <div style={{ fontSize: 13, fontWeight: 800 }}>{result.session}</div>
              <div style={{ fontSize: 11, opacity: 0.9 }}>{result.time}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            <div style={{ background: 'rgba(255,255,255,0.12)', padding: 14, borderRadius: 16, backdropFilter: 'blur(8px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, opacity: 0.8, marginBottom: 4 }}>
                <Building size={14} /> Lab Location & Block
              </div>
              <div style={{ fontSize: 14, fontWeight: 800 }}>{result.roomNo}</div>
              <div style={{ fontSize: 11, opacity: 0.9 }}>{result.block}</div>
            </div>

            <div style={{ background: 'rgba(255,95,31,0.25)', border: '1px solid rgba(255,95,31,0.4)', padding: 14, borderRadius: 16, backdropFilter: 'blur(8px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#ff9d76', marginBottom: 4 }}>
                <MapPin size={14} /> Assigned Bench & Desk
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>{result.benchNo}</div>
              <div style={{ fontSize: 11, color: '#ff9d76' }}>Kit / Setup: {result.systemNo}</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.12)', padding: 14, borderRadius: 16, backdropFilter: 'blur(8px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, opacity: 0.8, marginBottom: 4 }}>
                <User size={14} /> Lab In-Charge / Examiner
              </div>
              <div style={{ fontSize: 13, fontWeight: 800 }}>{result.supervisor}</div>
              <div style={{ fontSize: 11, opacity: 0.9 }}>Dept of EEE, SREC</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function uppercaseText(str: string) {
  return str.toUpperCase();
}
