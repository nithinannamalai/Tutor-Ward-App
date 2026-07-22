import React, { useState, useEffect } from 'react';
import { dbService } from '../services/db';
import type { Student, StudentDoc } from '../services/db';
import { ArrowLeft, Upload, Download, Trash2, Search, UserCheck, Plus, X } from 'lucide-react';

interface ProfileDocsProps {
  currentEmail: string;
  isAdmin: boolean;
  onBack: () => void;
}

export const ProfileDocs: React.FC<ProfileDocsProps> = ({ currentEmail, isAdmin, onBack }) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [docs, setDocs] = useState<StudentDoc[]>([]);
  
  // Admin states
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentEmail, setSelectedStudentEmail] = useState<string | null>(null);
  
  // Add student modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [addName, setAddName] = useState('');
  const [addRollNo, setAddRollNo] = useState('');
  const [addEmail, setAddEmail] = useState('');
  
  // Editing state
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Load student data
  useEffect(() => {
    loadData();
  }, [currentEmail, selectedStudentEmail, isAdmin]);

  const loadData = async () => {
    if (isAdmin) {
      const list = await dbService.fetchAllStudents();
      setAllStudents(list);

      if (selectedStudentEmail) {
        const p = await dbService.getStudentProfile(selectedStudentEmail);
        if (p) {
          setStudent(p);
          setName(p.name);
          setRollNo(p.rollNo);
          const d = await dbService.getStudentDocuments(p.email);
          setDocs(d);
        }
      } else {
        setStudent(null);
        setDocs([]);
      }
    } else {
      const p = await dbService.getStudentProfile(currentEmail);
      if (p) {
        setStudent(p);
        setName(p.name);
        setRollNo(p.rollNo);
        const d = await dbService.getStudentDocuments(p.email);
        setDocs(d);
      } else {
        const fallbackStudent: Student = {
          id: currentEmail || 'student@eee.com',
          rollNo: '7377221EE001',
          name: 'Nithin Annamalai',
          email: currentEmail || 'student@eee.com',
          cgpa: { 1: 8.5, 2: 8.3, 3: 8.6, 4: 8.7, 5: 8.4, 6: 8.5 },
          arrears: 0,
          nptelExams: [],
          documents: []
        };
        setStudent(fallbackStudent);
        setName(fallbackStudent.name);
        setRollNo(fallbackStudent.rollNo);
        const d = await dbService.getStudentDocuments(fallbackStudent.email);
        setDocs(d);
      }
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    setSaving(true);
    setStatusMessage('');

    try {
      await dbService.updateStudentProfile(student.email, { name, rollNo });
      setStatusMessage('Profile updated successfully!');
      setTimeout(() => setStatusMessage(''), 3000);
      loadData();
    } catch (err) {
      console.error(err);
      setStatusMessage('Error updating profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim() || !addRollNo.trim() || !addEmail.trim()) return;
    setSaving(true);
    setStatusMessage('');

    try {
      await dbService.createStudentProfile({
        id: addEmail.trim().toLowerCase(),
        rollNo: addRollNo.trim(),
        name: addName.trim(),
        email: addEmail.trim().toLowerCase(),
        cgpa: {},
        arrears: 0,
        nptelExams: []
      });
      setStatusMessage('Student profile created successfully!');
      setTimeout(() => setStatusMessage(''), 3000);
      
      // Reset & load
      setAddName('');
      setAddRollNo('');
      setAddEmail('');
      setShowAddModal(false);
      loadData();
    } catch (err: any) {
      console.error(err);
      setStatusMessage(err.message || 'Error creating student profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !student) return;

    if (file.type !== 'application/pdf') {
      setStatusMessage('Only PDF documents are supported.');
      return;
    }

    setUploading(true);
    setStatusMessage('');

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string;
      const sizeKB = Math.round(file.size / 1024);
      
      try {
        await dbService.uploadDocument(student.email, {
          name: file.name,
          size: `${sizeKB} KB`,
          type: file.type,
          dataUrl: base64Data
        });
        setStatusMessage('Document uploaded successfully!');
        setTimeout(() => setStatusMessage(''), 3000);
        loadData();
      } catch (err) {
        console.error(err);
        setStatusMessage('Error uploading document.');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteDoc = async (id: string) => {
    if (!student) return;
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      await dbService.deleteDocument(student.email, id);
      setStatusMessage('Document deleted.');
      setTimeout(() => setStatusMessage(''), 3000);
      loadData();
    } catch (err) {
      console.error(err);
      setStatusMessage('Error deleting document.');
    }
  };

  const downloadDoc = (doc: StudentDoc) => {
    const link = document.createElement('a');
    link.href = doc.dataUrl;
    link.download = doc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter students for admin search
  const filteredStudents = allStudents.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.rollNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="panel-view">
      <div className="panel-header">
        <button onClick={selectedStudentEmail ? () => setSelectedStudentEmail(null) : onBack} className="back-btn">
          <ArrowLeft size={20} />
        </button>
        <span className="panel-title">
          {isAdmin && !selectedStudentEmail ? 'Student Database' : 'Profile & Documents'}
        </span>
      </div>

      <div className="panel-body">
        {/* --- ADMIN LIST VIEW --- */}
        {isAdmin && !selectedStudentEmail && (
          <>
            <div className="form-group" style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search by name or roll number..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '36px' }}
              />
              <Search 
                size={16} 
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p className="form-label" style={{ margin: 0 }}>Select a student to view details:</p>
                <button 
                  onClick={() => setShowAddModal(true)} 
                  className="btn-secondary" 
                  style={{ padding: '4px 10px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, background: 'var(--accent-blue)', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: 6 }}
                >
                  <Plus size={12} /> Add Student
                </button>
              </div>
              {filteredStudents.length === 0 ? (
                <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', padding: '20px 0' }}>
                  No students found.
                </p>
              ) : (
                filteredStudents.map(s => (
                  <div 
                    key={s.id} 
                    className="attendance-mark-item" 
                    onClick={() => setSelectedStudentEmail(s.email)}
                    style={{ cursor: 'pointer', transition: 'var(--transition-fast)' }}
                  >
                    <div>
                      <h4 style={{ fontSize: 13, fontWeight: '700' }}>{s.name}</h4>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Roll: {s.rollNo} | {s.email}</p>
                    </div>
                    <UserCheck size={18} style={{ color: 'var(--accent-blue)' }} />
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* --- PROFILE DETAILS & DOCS VIEW --- */}
        {(!isAdmin || selectedStudentEmail) && student && (
          <>
            {/* 📸 Student Profile Header Hero Card */}
            <div className="profile-hero-card">
              <div className="profile-avatar-wrapper">
                <div className="profile-avatar-large">
                  {student.name.charAt(0)}
                </div>
                <div className="profile-avatar-online" />
              </div>

              <div className="profile-hero-info">
                <h3 className="profile-hero-name">{student.name}</h3>
                <p className="profile-hero-roll">Roll No: {student.rollNo}</p>
                <div className="profile-hero-badges">
                  <span className="profile-badge class-badge">
                    III EEE-A
                  </span>
                  <span className="profile-badge dept-badge">
                    Dept of EEE
                  </span>
                </div>
              </div>
            </div>

            {isAdmin && (
              <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: 10, borderRadius: 10, fontSize: 11, border: '1px solid rgba(56,189,248,0.2)' }}>
                Viewing profile for: <strong>{student.name} ({student.rollNo})</strong>
              </div>
            )}

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="form-input"
                  disabled={saving}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Roll Number</label>
                <input
                  type="text"
                  value={rollNo}
                  onChange={e => setRollNo(e.target.value)}
                  className="form-input"
                  disabled={saving}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Class & Section</label>
                <input
                  type="text"
                  value="III EEE-A"
                  className="form-input"
                  disabled
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  value={student.email}
                  className="form-input"
                  disabled
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="form-group">
                  <label className="form-label">Year of Study</label>
                  <input
                    type="text"
                    value="3rd Year"
                    className="form-input"
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Semester</label>
                  <input
                    type="text"
                    value="Semester VI"
                    className="form-input"
                    disabled
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Update Profile Info'}
              </button>
            </form>

            <hr style={{ border: 'none', height: 1, backgroundColor: 'var(--card-border)', margin: '10px 0' }} />

            {/* Document Uploader */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <h4 style={{ fontSize: 13, fontWeight: '700' }}>Uploaded PDF Documents</h4>
                <label className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 11 }}>
                  <Upload size={14} />
                  Upload PDF
                  <input 
                    type="file" 
                    accept="application/pdf" 
                    onChange={handleFileUpload} 
                    style={{ display: 'none' }} 
                  />
                </label>
              </div>

              {uploading && (
                <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 8, textAlign: 'center', fontSize: 12 }}>
                  Encoding file to Base64 and uploading...
                </div>
              )}

              {statusMessage && (
                <div style={{ padding: 8, background: 'var(--bg-tertiary)', borderRadius: 6, fontSize: 11, textAlign: 'center', color: 'var(--accent-gold)' }}>
                  {statusMessage}
                </div>
              )}

              <div className="document-list">
                {docs.length === 0 ? (
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
                    No PDF documents stored.
                  </p>
                ) : (
                  docs.map(doc => (
                    <div key={doc.id} className="document-item">
                      <div className="doc-info">
                        <span className="doc-name" title={doc.name}>{doc.name}</span>
                        <span className="doc-meta">{doc.size} | {doc.uploadedAt}</span>
                      </div>
                      <div className="doc-actions">
                        <button onClick={() => downloadDoc(doc)} className="doc-action-btn" title="Download Document">
                          <Download size={16} />
                        </button>
                        <button onClick={() => handleDeleteDoc(doc.id)} className="doc-action-btn delete" title="Delete Document">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
        {/* Add Student Modal */}
        {showAddModal && (
          <div className="poster-modal" style={{ display: 'flex', zIndex: 1000 }}>
            <form className="poster-content" onSubmit={handleAddStudentSubmit} style={{ gap: 12, maxWidth: 380, width: '90%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: 14, fontWeight: '700' }}>Add New Student Profile</h3>
                <button type="button" className="close-modal-btn" style={{ position: 'static' }} onClick={() => setShowAddModal(false)}>
                  <X size={16} />
                </button>
              </div>

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  value={addName} 
                  onChange={e => setAddName(e.target.value)} 
                  className="form-input" 
                  placeholder="e.g. John Doe" 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Roll Number</label>
                <input 
                  type="text" 
                  value={addRollNo} 
                  onChange={e => setAddRollNo(e.target.value)} 
                  className="form-input" 
                  placeholder="e.g. 7377221EE100" 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  value={addEmail} 
                  onChange={e => setAddEmail(e.target.value)} 
                  className="form-input" 
                  placeholder="e.g. student3@eee.com" 
                  required 
                />
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: 8 }} disabled={saving}>
                {saving ? 'Creating...' : 'Register Student'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
