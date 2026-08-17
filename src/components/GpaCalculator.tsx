import React, { useState } from 'react';
import { GraduationCap, Calculator, Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';

interface GpaCalculatorProps {
  onBack: () => void;
}

interface SubjectGrading {
  code: string;
  name: string;
  credits: number;
  gradePoint: number;
}

export const GpaCalculator: React.FC<GpaCalculatorProps> = ({ onBack }) => {
  const [subjects, setSubjects] = useState<SubjectGrading[]>([
    { code: 'EE8601', name: 'Power System Operation and Control', credits: 3, gradePoint: 9 },
    { code: 'EE8602', name: 'Transmission and Distribution', credits: 4, gradePoint: 8 },
    { code: 'EE8603', name: 'Digital Logic Circuits', credits: 3, gradePoint: 9 },
    { code: 'EE8691', name: 'Embedded Systems', credits: 3, gradePoint: 10 },
    { code: 'EE8611', name: 'Power Electronics Lab', credits: 2, gradePoint: 10 },
    { code: 'EE8612', name: 'Renewable Energy Systems Lab', credits: 2, gradePoint: 10 },
  ]);

  const [currentCgpa, setCurrentCgpa] = useState('8.6');
  const [completedSemesters, setCompletedSemesters] = useState('5');
  const [targetCgpa, setTargetCgpa] = useState('9.0');

  const totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);
  const earnedPoints = subjects.reduce((sum, s) => sum + (s.gradePoint * s.credits), 0);
  const calculatedGpa = (earnedPoints / totalCredits).toFixed(2);

  // Target required GPA calculation
  const curCgpaNum = parseFloat(currentCgpa) || 8.6;
  const compSemsNum = parseInt(completedSemesters) || 5;
  const tgtCgpaNum = parseFloat(targetCgpa) || 9.0;
  const remSems = Math.max(1, 8 - compSemsNum);

  const reqGpaForTarget = (((tgtCgpaNum * 8) - (curCgpaNum * compSemsNum)) / remSems).toFixed(2);

  const updateGrade = (index: number, newPoint: number) => {
    const copy = [...subjects];
    copy[index].gradePoint = newPoint;
    setSubjects(copy);
  };

  return (
    <div style={{ padding: '4px 0 20px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 4px 0', color: 'var(--text-main)' }}>
            📊 Target CGPA & Subject Mark Calculator
          </h2>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
            Simulate semester GPA and calculate required grades to reach target CGPA
          </p>
        </div>
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
      </div>

      {/* Top Calculator Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
        {/* Card 1: Estimated Sem 6 GPA */}
        <div style={{ background: 'linear-gradient(135deg, #0052cc 0%, #1d4ed8 100%)', borderRadius: 20, padding: 20, color: '#fff', boxShadow: '0 10px 28px rgba(0,82,204,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, opacity: 0.85, marginBottom: 6 }}>
            <GraduationCap size={16} /> SIMULATED SEMESTER VI GPA
          </div>
          <div style={{ fontSize: 36, fontWeight: 900, lineHeight: 1 }}>{calculatedGpa}</div>
          <p style={{ fontSize: 11, opacity: 0.85, margin: '6px 0 0 0' }}>
            Based on {subjects.length} subjects ({totalCredits} total credits)
          </p>
        </div>

        {/* Card 2: Target CGPA Planner */}
        <div style={{ background: 'var(--bg-primary)', borderRadius: 20, padding: 20, border: '1px solid var(--card-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 800, color: 'var(--accent-blue)', marginBottom: 10 }}>
            <Sparkles size={16} /> TARGET CGPA GOAL PLANNER
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)' }}>Cur CGPA</label>
              <input value={currentCgpa} onChange={e => setCurrentCgpa(e.target.value)} className="form-input" style={{ fontSize: 12, padding: '6px 8px', borderRadius: 8 }} />
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)' }}>Done Sems</label>
              <input value={completedSemesters} onChange={e => setCompletedSemesters(e.target.value)} className="form-input" style={{ fontSize: 12, padding: '6px 8px', borderRadius: 8 }} />
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)' }}>Goal CGPA</label>
              <input value={targetCgpa} onChange={e => setTargetCgpa(e.target.value)} className="form-input" style={{ fontSize: 12, padding: '6px 8px', borderRadius: 8 }} />
            </div>
          </div>
          <div style={{ background: 'rgba(0,82,204,0.06)', padding: '8px 12px', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-main)' }}>Req. Avg GPA / Sem:</span>
            <span style={{ fontSize: 14, fontWeight: 900, color: parseFloat(reqGpaForTarget) > 10 ? '#ef4444' : 'var(--accent-blue)' }}>
              {parseFloat(reqGpaForTarget) > 10 ? 'Requires > 10' : `${reqGpaForTarget}`}
            </span>
          </div>
        </div>
      </div>

      {/* Subject Grade Inputs List */}
      <div style={{ background: 'var(--bg-primary)', borderRadius: 20, padding: 20, border: '1px solid var(--card-border)' }}>
        <h3 style={{ fontSize: 14, fontWeight: 800, margin: '0 0 16px 0', color: 'var(--text-main)' }}>
          📚 Semester VI Subject Expected Grades
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {subjects.map((sub, idx) => (
            <div key={sub.code} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '12px 16px', borderRadius: 14, border: '1px solid var(--card-border)' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-main)' }}>{sub.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Code: {sub.code} · Credits: {sub.credits}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <select 
                  value={sub.gradePoint} 
                  onChange={e => updateGrade(idx, parseInt(e.target.value))}
                  style={{ padding: '6px 12px', borderRadius: 10, fontSize: 12, fontWeight: 800, background: 'var(--bg-primary)', border: '1px solid var(--card-border)', color: 'var(--accent-blue)' }}
                >
                  <option value={10}>O (10 Pts)</option>
                  <option value={9}>A+ (9 Pts)</option>
                  <option value={8}>A (8 Pts)</option>
                  <option value={7}>B+ (7 Pts)</option>
                  <option value={6}>B (6 Pts)</option>
                  <option value={0}>U (Arrear)</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
