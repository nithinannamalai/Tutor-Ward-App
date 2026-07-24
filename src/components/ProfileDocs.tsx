import React, { useState, useEffect } from 'react';
import { dbService } from '../services/db';
import type { Student, StudentDoc } from '../services/db';
import { ArrowLeft, Upload, Download, Trash2, Search, UserCheck, Plus, X } from 'lucide-react';

const CERT_CATEGORIES = [
  'NPTEL & Swayam Certifications',
  'Internship & Industry Training',
  'Workshops & Seminars',
  'Sports & Co-Curricular',
  'Academic Degrees & Marksheets',
  'Other Certificates'
];

const DOC_CATEGORIES = [
  'Academic Marksheets',
  'Identity Proofs (Aadhar, ID, etc.)',
  'Resumes & CVs',
  'Recommendation & Permission Letters',
  'General Documents'
];

interface ProfileDocsProps {
  currentEmail: string;
  isAdmin: boolean;
  onBack: () => void;
  mode?: 'documents' | 'certificates';
}

export const ProfileDocs: React.FC<ProfileDocsProps> = ({ currentEmail, isAdmin, onBack, mode = 'documents' }) => {
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
  
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customDocName, setCustomDocName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

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
        const d = await dbService.getStudentDocuments(p.email);
        setDocs(d);
      } else {
        const fallbackStudent: Student = {
          id: currentEmail || 'student@eee.com',
          rollNo: '7377221EE001',
          name: 'Nithin Annamalai',
          email: currentEmail || 'student@eee.com',
          cgpa: {
            1: { internal1: 85, internal2: 88, semMarks: 86, gpa: 8.5 },
            2: { internal1: 82, internal2: 84, semMarks: 83, gpa: 8.3 },
            3: { internal1: 86, internal2: 87, semMarks: 86, gpa: 8.6 },
            4: { internal1: 88, internal2: 90, semMarks: 87, gpa: 8.7 },
            5: { internal1: 84, internal2: 85, semMarks: 84, gpa: 8.4 },
            6: { internal1: 85, internal2: 86, semMarks: 85, gpa: 8.5 }
          },
          arrears: 0,
          nptelExams: [],
          documents: []
        };
        setStudent(fallbackStudent);
        const d = await dbService.getStudentDocuments(fallbackStudent.email);
        setDocs(d);
      }
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

  const autoRecognizeDocName = (fileName: string): string => {
    // Strip extension
    const baseName = fileName.replace(/\.[^/.]+$/, "");
    // Replace underscores, dashes, dots with spaces
    let cleanName = baseName.replace(/[_\-\.]+/g, ' ');
    
    // Title case helper
    const toTitleCase = (str: string) => str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    
    // Custom keyword mappings
    const lower = cleanName.toLowerCase();
    if (lower.includes('sem 1') || lower.includes('sem1') || lower.includes('semester 1') || lower.includes('semester1')) {
      return 'Semester I Marksheet';
    }
    if (lower.includes('sem 2') || lower.includes('sem2') || lower.includes('semester 2') || lower.includes('semester2')) {
      return 'Semester II Marksheet';
    }
    if (lower.includes('sem 3') || lower.includes('sem3') || lower.includes('semester 3') || lower.includes('semester3')) {
      return 'Semester III Marksheet';
    }
    if (lower.includes('sem 4') || lower.includes('sem4') || lower.includes('semester 4') || lower.includes('semester4')) {
      return 'Semester IV Marksheet';
    }
    if (lower.includes('sem 5') || lower.includes('sem5') || lower.includes('semester 5') || lower.includes('semester5')) {
      return 'Semester V Marksheet';
    }
    if (lower.includes('sem 6') || lower.includes('sem6') || lower.includes('semester 6') || lower.includes('semester6')) {
      return 'Semester VI Marksheet';
    }
    if (lower.includes('sem 7') || lower.includes('sem7') || lower.includes('semester 7') || lower.includes('semester7')) {
      return 'Semester VII Marksheet';
    }
    if (lower.includes('sem 8') || lower.includes('sem8') || lower.includes('semester 8') || lower.includes('semester8')) {
      return 'Semester VIII Marksheet';
    }
    if (lower.includes('nptel') || lower.includes('swayam')) {
      if (lower.includes('iot') || lower.includes('internet of things')) return 'NPTEL Internet of Things Certificate';
      if (lower.includes('python')) return 'NPTEL Python Programming Certificate';
      if (lower.includes('java')) return 'NPTEL Java Programming Certificate';
      if (lower.includes('ev') || lower.includes('electric vehicle')) return 'NPTEL Electric Vehicles Certificate';
      return 'NPTEL Certification';
    }
    if (lower.includes('bonafide')) {
      return 'Bonafide Certificate';
    }
    if (lower.includes('noc')) {
      return 'No Objection Certificate (NOC)';
    }
    if (lower.includes('internship') || lower.includes('siemens') || lower.includes('training')) {
      return 'Internship Certificate';
    }
    if (lower.includes('resume') || lower.includes('cv')) {
      return 'Student Resume';
    }
    if (lower.includes('adhaar') || lower.includes('aadhar') || lower.includes('id')) {
      return 'Aadhar Card / Identity Proof';
    }
    
    return toTitleCase(cleanName);
  };

  const handleOpenUploadModal = () => {
    setCustomDocName('');
    setSelectedFile(null);
    setSelectedCategory(mode === 'certificates' ? CERT_CATEGORIES[0] : DOC_CATEGORIES[0]);
    setShowUploadModal(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !student) return;

    if (file.type !== 'application/pdf') {
      setStatusMessage('Only PDF documents are supported.');
      return;
    }

    setSelectedFile(file);
    setCustomDocName(autoRecognizeDocName(file.name));
    
    // Clear input so selecting same file triggers onChange again
    e.target.value = '';
  };

  const handleActualUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !student || !customDocName.trim()) return;

    setUploading(true);
    setStatusMessage('');
    const file = selectedFile;
    const docName = customDocName.trim();
    const category = selectedCategory;
    setSelectedFile(null);
    setShowUploadModal(false);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string;
      const sizeKB = Math.round(file.size / 1024);
      
      try {
        const prefix = mode === 'certificates' ? 'CERT_' : 'DOC_';
        // Add .pdf extension if user didn't write it
        const finalName = docName.toLowerCase().endsWith('.pdf') ? docName : `${docName}.pdf`;
        const nameToSave = prefix + category + "::" + finalName;

        await dbService.uploadDocument(student.email, {
          name: nameToSave,
          size: `${sizeKB} KB`,
          type: file.type,
          dataUrl: base64Data
        });
        setStatusMessage(mode === 'certificates' ? 'Certificate uploaded successfully!' : 'Document uploaded successfully!');
        setTimeout(() => setStatusMessage(''), 3000);
        loadData();
      } catch (err) {
        console.error(err);
        setStatusMessage('Error uploading file.');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const filteredDocs = docs.filter(doc => {
    if (mode === 'certificates') {
      return doc.name.startsWith('CERT_');
    } else {
      return !doc.name.startsWith('CERT_') && !doc.name.startsWith('NPTEL_');
    }
  });

  const getDisplayName = (docName: string) => {
    let nameWithoutPrefix = docName;
    if (docName.startsWith('CERT_')) nameWithoutPrefix = docName.substring(5);
    else if (docName.startsWith('DOC_')) nameWithoutPrefix = docName.substring(4);
    
    if (nameWithoutPrefix.includes('::')) {
      return nameWithoutPrefix.split('::')[1];
    }
    return nameWithoutPrefix;
  };

  const getDocCategory = (docName: string) => {
    let nameWithoutPrefix = docName;
    if (docName.startsWith('CERT_')) nameWithoutPrefix = docName.substring(5);
    else if (docName.startsWith('DOC_')) nameWithoutPrefix = docName.substring(4);
    
    if (nameWithoutPrefix.includes('::')) {
      return nameWithoutPrefix.split('::')[0];
    }
    return mode === 'certificates' ? 'Other Certificates' : 'General Documents';
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
          {isAdmin && !selectedStudentEmail ? (mode === 'certificates' ? 'Certificates Directory' : 'Student Database') : (mode === 'certificates' ? 'Certificates & Badges' : 'Profile & Documents')}
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

            {/* Document Uploader */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h4 style={{ fontSize: 13, fontWeight: '800', color: 'var(--text-main)' }}>
                  {mode === 'certificates' ? 'Certificates Vault' : 'Documents Vault'}
                </h4>
                <button
                  onClick={handleOpenUploadModal}
                  className="btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 11, background: 'var(--accent-blue)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, fontWeight: 700 }}
                >
                  <Plus size={14} />
                  {mode === 'certificates' ? 'Add Certificate' : 'Add Document'}
                </button>
              </div>

              {uploading && (
                <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 8, textAlign: 'center', fontSize: 12, marginBottom: 10 }}>
                  Encoding file to Base64 and uploading...
                </div>
              )}

              {statusMessage && (
                <div style={{ padding: 8, background: '#eff6ff', border: '1px solid rgba(0,82,204,0.18)', borderRadius: 6, fontSize: 11, textAlign: 'center', color: 'var(--accent-blue)', fontWeight: 700, marginBottom: 10 }}>
                  {statusMessage}
                </div>
              )}

              <div className="document-list" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {filteredDocs.length === 0 ? (
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>
                    {mode === 'certificates' ? 'No PDF certificates stored.' : 'No PDF documents stored.'}
                  </p>
                ) : (
                  (() => {
                    const groupedDocs: Record<string, StudentDoc[]> = {};
                    filteredDocs.forEach(doc => {
                      const category = getDocCategory(doc.name);
                      if (!groupedDocs[category]) {
                        groupedDocs[category] = [];
                      }
                      groupedDocs[category].push(doc);
                    });

                    return Object.keys(groupedDocs).map(category => (
                      <div key={category} style={{ background: '#ffffff', border: '1.5px solid rgba(0,82,204,0.12)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,82,204,0.03)' }}>
                        <div style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,82,204,0.1)' }}>
                          <span style={{ fontSize: 11, fontWeight: 800, color: '#0052cc' }}>📁 {category}</span>
                          <span style={{ fontSize: 9, background: '#0052cc', color: '#fff', padding: '2px 6px', borderRadius: 10, fontWeight: 700 }}>
                            {groupedDocs[category].length}
                          </span>
                        </div>
                        <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {groupedDocs[category].map((doc, idx) => (
                            <div key={doc.id} className="document-item" style={{ borderLeft: '3.5px solid var(--accent-blue)', padding: '8px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderRadius: 8, border: '1px solid rgba(0,82,204,0.06)', borderLeftColor: 'var(--accent-blue)', borderLeftWidth: 3.5 }}>
                              <div className="doc-info" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                <span className="doc-number" style={{ fontSize: 10, fontWeight: 800, color: '#475569', background: '#e2e8f0', width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  {idx + 1}
                                </span>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span className="doc-name" title={getDisplayName(doc.name)} style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)' }}>
                                    {getDisplayName(doc.name)}
                                  </span>
                                  <span className="doc-meta" style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{doc.size} | {doc.uploadedAt}</span>
                                </div>
                              </div>
                              <div className="doc-actions" style={{ display: 'flex', gap: 6 }}>
                                <button onClick={() => downloadDoc(doc)} className="doc-action-btn" style={{ padding: 4 }} title="Download">
                                  <Download size={14} />
                                </button>
                                <button onClick={() => handleDeleteDoc(doc.id)} className="doc-action-btn delete" style={{ padding: 4 }} title="Delete">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ));
                  })()
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

        {/* Document Upload Name Entry, Category & Auto Recognise Modal */}
        {showUploadModal && (
          <div className="poster-modal" style={{ display: 'flex', zIndex: 1000 }}>
            <form className="poster-content" onSubmit={handleActualUpload} style={{ gap: 14, maxWidth: 380, width: '95%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: 14, fontWeight: '800', color: 'var(--text-main)' }}>
                  {mode === 'certificates' ? 'Add New Certificate' : 'Add New Document'}
                </h3>
                <button type="button" className="close-modal-btn" style={{ position: 'static' }} onClick={() => setShowUploadModal(false)}>
                  <X size={16} />
                </button>
              </div>

              {/* 1. Category / Group */}
              <div className="form-group">
                <label className="form-label">Category / Group</label>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="form-select"
                  style={{ fontSize: 12 }}
                >
                  {(mode === 'certificates' ? CERT_CATEGORIES : DOC_CATEGORIES).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* 2. File Selector */}
              <div className="form-group">
                <label className="form-label">Attach PDF File</label>
                {selectedFile ? (
                  <div style={{ background: '#f0fdf4', padding: '10px 12px', borderRadius: 8, border: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
                    <div>
                      <span style={{ fontWeight: 700, color: '#166534', display: 'block' }}>✓ File Attached</span>
                      <span style={{ color: '#475569', wordBreak: 'break-all', display: 'block', marginTop: 2 }}>{selectedFile.name}</span>
                      <span style={{ color: '#64748b', fontSize: 10, display: 'block', marginTop: 1 }}>Size: {Math.round(selectedFile.size / 1024)} KB</span>
                    </div>
                    <label style={{ fontSize: 10, color: 'var(--accent-blue)', cursor: 'pointer', fontWeight: 700, border: '1px solid var(--accent-blue)', padding: '3px 8px', borderRadius: 6, background: '#fff' }}>
                      Change
                      <input 
                        type="file" 
                        accept="application/pdf" 
                        onChange={handleFileUpload} 
                        style={{ display: 'none' }} 
                      />
                    </label>
                  </div>
                ) : (
                  <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 10px', background: '#f8fafc', border: '1.5px dashed rgba(0, 82, 204, 0.25)', borderRadius: 10, cursor: 'pointer', textAlign: 'center', transition: 'background 0.2s' }}>
                    <Upload size={24} style={{ color: 'var(--accent-blue)', marginBottom: 6 }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-blue)' }}>Click to select PDF Certificate</span>
                    <span style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>Only PDF documents are supported</span>
                    <input 
                      type="file" 
                      accept="application/pdf" 
                      onChange={handleFileUpload} 
                      style={{ display: 'none' }} 
                    />
                  </label>
                )}
              </div>

              {/* 3. Certificate / Document Name */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                  <label className="form-label">
                    {mode === 'certificates' ? 'Certificate Display Name' : 'Document Display Name'}
                  </label>
                  {selectedFile && (
                    <span style={{ fontSize: 9, background: 'rgba(5, 150, 105, 0.12)', color: '#059669', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>
                      ✨ Auto-recognized
                    </span>
                  )}
                </div>
                <input 
                  type="text" 
                  value={customDocName} 
                  onChange={e => setCustomDocName(e.target.value)} 
                  className="form-input" 
                  placeholder={mode === 'certificates' ? "e.g. NPTEL Python, Workshop Certificate..." : "e.g. Resume, Sem 1 Marksheet..."} 
                  required 
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '10px 0', fontSize: 12, fontWeight: 700 }} disabled={!selectedFile || !customDocName.trim()}>
                  Upload & Save
                </button>
                <button type="button" onClick={() => setShowUploadModal(false)} className="btn-secondary" style={{ flex: 1, padding: '10px 0', fontSize: 12, fontWeight: 700 }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
