import React, { useState, useEffect, useRef } from 'react';
import { dbService } from '../../services/db';
import type { Student, StudentDoc } from '../../services/db';
import {
  ArrowLeft, Plus, Trash2, Award, Search, UserCheck,
  Upload, Download, CheckCircle2, BookOpen, X, Sparkles,
  FileText, Clock, ChevronDown, ChevronUp
} from 'lucide-react';

interface NptelTrackerProps {
  currentEmail: string;
  isAdmin: boolean;
  onBack: () => void;
}

const STATUS_CONFIG = {
  registered: { label: 'Registered', color: '#0052cc', bg: 'rgba(0,82,204,0.1)', icon: Clock },
  'in-progress': { label: 'In Progress', color: '#d97706', bg: 'rgba(217,119,6,0.1)', icon: BookOpen },
  completed: { label: 'Completed', color: '#059669', bg: 'rgba(5,150,105,0.1)', icon: CheckCircle2 },
};

export const NptelTracker: React.FC<NptelTrackerProps> = ({ currentEmail, isAdmin, onBack }) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [exams, setExams] = useState<string[]>([]);
  const [docs, setDocs] = useState<StudentDoc[]>([]);
  const [uploading, setUploading] = useState<string | null>(null); // exam name being uploaded
  const [expandedExam, setExpandedExam] = useState<string | null>(null);

  // Admin states
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentEmail, setSelectedStudentEmail] = useState<string | null>(null);

  // Form state
  const [newExam, setNewExam] = useState('');
  const [newStatus, setNewStatus] = useState<'registered' | 'completed' | 'in-progress'>('registered');
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'error'>('success');
  const [newlyAdded, setNewlyAdded] = useState<string | null>(null);

  // Per-exam upload state
  const [pendingFiles, setPendingFiles] = useState<Record<string, File | null>>({});
  const [pendingNames, setPendingNames] = useState<Record<string, string>>({});

  const formRef = useRef<HTMLFormElement>(null);

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
          setExams(p.nptelExams || []);
          const d = await dbService.getStudentDocuments(p.email);
          setDocs(d);
        }
      } else {
        setStudent(null); setExams([]); setDocs([]);
      }
    } else {
      const p = await dbService.getStudentProfile(currentEmail);
      if (p) {
        setStudent(p);
        setExams(p.nptelExams || []);
        const d = await dbService.getStudentDocuments(p.email);
        setDocs(d);
      } else {
        const fallback: Student = {
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
          nptelExams: ['Embedded Systems', 'Power Electronics'],
          documents: []
        };
        setStudent(fallback);
        setExams(fallback.nptelExams);
        const d = await dbService.getStudentDocuments(fallback.email);
        setDocs(d);
      }
    }
  };

  const showStatus = (msg: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage(msg);
    setStatusType(type);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExam.trim() || !student) return;
    setSaving(true);
    const examEntry = newExam.trim();
    const updatedExams = [...exams, examEntry];
    try {
      await dbService.updateStudentProfile(student.email, { nptelExams: updatedExams });
      setExams(updatedExams);
      setNewlyAdded(examEntry);
      setExpandedExam(examEntry);
      setTimeout(() => setNewlyAdded(null), 1200);
      setNewExam('');
      setNewStatus('registered');
      showStatus('Course added successfully!');
      loadData();
    } catch (err) {
      console.error(err);
      showStatus('Error adding course.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExam = async (examName: string) => {
    if (!student) return;
    if (!window.confirm(`Remove "${examName}" from NPTEL list?`)) return;
    setSaving(true);
    const updatedExams = exams.filter(e => e !== examName);
    try {
      await dbService.updateStudentProfile(student.email, { nptelExams: updatedExams });
      setExams(updatedExams);
      showStatus('Course removed.');
      loadData();
    } catch (err) {
      showStatus('Error removing course.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Select file for a specific exam (stores in pending state)
  const handleSelectFile = (examName: string, file: File | null) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      showStatus('Only PDF files are supported.', 'error');
      return;
    }
    setPendingFiles(prev => ({ ...prev, [examName]: file }));
    // Auto-fill cert name from file
    const base = file.name.replace(/\.[^/.]+$/, '').replace(/[_\-\.]+/g, ' ');
    const autoName = base.length > 2 ? base : `${examName} Certificate`;
    setPendingNames(prev => ({ ...prev, [examName]: prev[examName] || autoName }));
  };

  // Actually upload the certificate for an exam
  const handleUploadCertificate = async (examName: string) => {
    const file = pendingFiles[examName];
    const certName = (pendingNames[examName] || examName).trim();
    if (!file || !student || !certName) return;

    setUploading(examName);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string;
      const sizeKB = Math.round(file.size / 1024);
      try {
        await dbService.uploadDocument(student.email, {
          name: `NPTEL_${examName}_${certName}.pdf`,
          size: `${sizeKB} KB`,
          type: file.type,
          dataUrl: base64Data
        });
        showStatus('Certificate uploaded successfully! 🎉');
        setPendingFiles(prev => { const n = { ...prev }; delete n[examName]; return n; });
        setPendingNames(prev => { const n = { ...prev }; delete n[examName]; return n; });
        loadData();
      } catch (err) {
        showStatus('Upload failed. Try again.', 'error');
      } finally {
        setUploading(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteDoc = async (id: string) => {
    if (!student) return;
    if (!window.confirm('Delete this certificate?')) return;
    try {
      await dbService.deleteDocument(student.email, id);
      showStatus('Certificate deleted.');
      loadData();
    } catch {
      showStatus('Error deleting certificate.', 'error');
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

  const filteredStudents = allStudents.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.nptelExams?.some(e => e.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const nptelDocs = docs.filter(d => d.name.startsWith('NPTEL_'));
  const completedCount = nptelDocs.length;
  const totalCount = exams.length;

  return (
    <div className="panel-view nptel-panel">
      <div className="panel-header">
        <button onClick={selectedStudentEmail ? () => setSelectedStudentEmail(null) : onBack} className="back-btn">
          <ArrowLeft size={20} />
        </button>
        <span className="panel-title">
          {isAdmin && !selectedStudentEmail ? 'NPTEL Admin Portal' : 'NPTEL Certifications'}
        </span>
      </div>

      <div className="panel-body">
        {/* Status Toast */}
        {statusMessage && (
          <div className={`nptel-toast ${statusType}`}>
            {statusType === 'success' ? <CheckCircle2 size={14} /> : <X size={14} />}
            {statusMessage}
          </div>
        )}

        {/* --- ADMIN DIRECTORY --- */}
        {isAdmin && !selectedStudentEmail && (
          <div className="nptel-admin-section">
            <div className="nptel-search-wrap">
              <Search size={15} className="nptel-search-icon" />
              <input
                type="text"
                placeholder="Search by student or course name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="nptel-search-input"
              />
            </div>
            <p className="nptel-section-label">Select a student to view registrations:</p>
            {filteredStudents.length === 0 ? (
              <div className="nptel-empty-state">No students matched your search.</div>
            ) : (
              filteredStudents.map(s => (
                <div key={s.id} className="nptel-student-row" onClick={() => setSelectedStudentEmail(s.email)}>
                  <div>
                    <h4 className="nptel-student-name">{s.name}</h4>
                    <p className="nptel-student-meta">Roll: {s.rollNo}</p>
                    <div className="nptel-tags">
                      {(s.nptelExams || []).slice(0, 3).map((ex, i) => (
                        <span key={i} className="nptel-tag">{ex}</span>
                      ))}
                      {(s.nptelExams?.length ?? 0) > 3 && (
                        <span className="nptel-tag-more">+{(s.nptelExams?.length ?? 0) - 3}</span>
                      )}
                    </div>
                  </div>
                  <UserCheck size={18} className="nptel-student-chevron" />
                </div>
              ))
            )}
          </div>
        )}

        {/* --- STUDENT VIEW --- */}
        {(!isAdmin || selectedStudentEmail) && student && (
          <div className="nptel-student-view">
            {isAdmin && (
              <div className="nptel-admin-badge">
                <Sparkles size={12} /> Viewing: <strong>{student.name} ({student.rollNo})</strong>
              </div>
            )}

            {/* Stats Header */}
            {!isAdmin && (
              <div className="nptel-stats-row">
                <div className="nptel-stat-card blue">
                  <span className="nptel-stat-val">{totalCount}</span>
                  <span className="nptel-stat-lbl">Registered</span>
                </div>
                <div className="nptel-stat-card green">
                  <span className="nptel-stat-val">{completedCount}</span>
                  <span className="nptel-stat-lbl">Certified</span>
                </div>
                <div className="nptel-stat-card gold">
                  <span className="nptel-stat-val">{totalCount - completedCount}</span>
                  <span className="nptel-stat-lbl">Pending</span>
                </div>
              </div>
            )}

            {/* Add Course Form */}
            <form ref={formRef} onSubmit={handleAddExam} className="nptel-add-form">
              <div className="nptel-form-header">
                <Award size={16} className="nptel-form-icon" />
                <span>Register New NPTEL Course</span>
              </div>

              <div className="nptel-field-wrap">
                <label className="nptel-field-label">Course Name</label>
                <div className="nptel-field-input-wrap">
                  <BookOpen size={14} className="nptel-field-icon" />
                  <input
                    type="text"
                    value={newExam}
                    onChange={e => setNewExam(e.target.value)}
                    className="nptel-field-input"
                    placeholder="e.g. Introduction to Smart Grid"
                    required
                  />
                </div>
              </div>

              <div className="nptel-field-wrap">
                <label className="nptel-field-label">Status</label>
                <div className="nptel-status-picker">
                  {(['registered', 'in-progress', 'completed'] as const).map(s => (
                    <button
                      key={s}
                      type="button"
                      className={`nptel-status-chip ${newStatus === s ? 'active ' + s : ''}`}
                      onClick={() => setNewStatus(s)}
                    >
                      {STATUS_CONFIG[s].label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className={`nptel-add-btn ${saving ? 'loading' : ''}`}
                disabled={saving || !newExam.trim()}
              >
                {saving ? (
                  <span className="nptel-spinner" />
                ) : (
                  <Plus size={16} />
                )}
                {saving ? 'Adding...' : 'Add Course'}
              </button>
            </form>

            {/* Course List */}
            <div className="nptel-courses-section">
              <h4 className="nptel-courses-title">
                <Award size={15} />
                Registered Courses
                <span className="nptel-count-badge">{exams.length}</span>
              </h4>

              {exams.length === 0 ? (
                <div className="nptel-empty-state">
                  <Award size={32} className="nptel-empty-icon" />
                  <p>No NPTEL courses registered yet.</p>
                  <span>Add your first course above!</span>
                </div>
              ) : (
                <div className="nptel-course-list">
                  {exams.map((examName, index) => {
                    const examDoc = docs.find(d => d.name.startsWith(`NPTEL_${examName}_`));
                    const isExpanded = expandedExam === examName;
                    const isNew = newlyAdded === examName;
                    const pendingFile = pendingFiles[examName];
                    const pendingName = pendingNames[examName] ?? '';
                    const isUploading = uploading === examName;

                    return (
                      <div
                        key={examName}
                        className={`nptel-course-card ${isNew ? 'just-added' : ''} ${examDoc ? 'certified' : ''}`}
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        {/* Card Header */}
                        <div
                          className="nptel-course-card-header"
                          onClick={() => setExpandedExam(isExpanded ? null : examName)}
                        >
                          <div className="nptel-course-left">
                            <div className={`nptel-course-num ${examDoc ? 'done' : ''}`}>
                              {examDoc ? <CheckCircle2 size={13} /> : index + 1}
                            </div>
                            <div className="nptel-course-info">
                              <span className="nptel-course-name">{examName}</span>
                              {examDoc ? (
                                <span className="nptel-cert-label">✓ Certificate Uploaded</span>
                              ) : (
                                <span className="nptel-no-cert-label">No certificate yet</span>
                              )}
                            </div>
                          </div>
                          <div className="nptel-course-actions">
                            <button
                              className="nptel-delete-btn"
                              onClick={e => { e.stopPropagation(); handleDeleteExam(examName); }}
                              title="Remove course"
                            >
                              <Trash2 size={13} />
                            </button>
                            <span className="nptel-expand-icon">
                              {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                            </span>
                          </div>
                        </div>

                        {/* Expanded Panel */}
                        {isExpanded && (
                          <div className="nptel-course-panel">
                            {examDoc ? (
                              /* ── Certificate already uploaded ── */
                              <div className="nptel-cert-uploaded">
                                <div className="nptel-cert-info">
                                  <FileText size={16} className="nptel-cert-file-icon" />
                                  <div>
                                    <p className="nptel-cert-name">
                                      {examDoc.name.replace(`NPTEL_${examName}_`, '').replace(/\.pdf$/i, '')}
                                    </p>
                                    <p className="nptel-cert-meta">{examDoc.size} · {examDoc.uploadedAt}</p>
                                  </div>
                                </div>
                                <div className="nptel-cert-btns">
                                  <button className="nptel-action-btn download" onClick={() => downloadDoc(examDoc)}>
                                    <Download size={13} /> Download
                                  </button>
                                  <button className="nptel-action-btn delete-cert" onClick={() => handleDeleteDoc(examDoc.id)}>
                                    <Trash2 size={13} /> Remove
                                  </button>
                                </div>
                              </div>
                            ) : (
                              /* ── Upload section ── */
                              <div className="nptel-upload-section">
                                {/* Certificate Name */}
                                <div className="nptel-field-wrap" style={{ marginBottom: 10 }}>
                                  <label className="nptel-field-label">Certificate Name</label>
                                  <input
                                    type="text"
                                    value={pendingName}
                                    onChange={e => setPendingNames(prev => ({ ...prev, [examName]: e.target.value }))}
                                    className="nptel-field-input"
                                    style={{ paddingLeft: 10 }}
                                    placeholder={`e.g. ${examName} NPTEL Certificate`}
                                  />
                                </div>

                                {/* File picker */}
                                {pendingFile ? (
                                  <div className="nptel-file-preview">
                                    <div className="nptel-file-preview-info">
                                      <FileText size={15} />
                                      <div>
                                        <span className="nptel-file-name">{pendingFile.name}</span>
                                        <span className="nptel-file-size">{Math.round(pendingFile.size / 1024)} KB</span>
                                      </div>
                                    </div>
                                    <label className="nptel-change-file-btn">
                                      Change
                                      <input type="file" accept="application/pdf" style={{ display: 'none' }}
                                        onChange={e => handleSelectFile(examName, e.target.files?.[0] ?? null)} />
                                    </label>
                                  </div>
                                ) : (
                                  <label className="nptel-drop-zone">
                                    <Upload size={20} className="nptel-drop-icon" />
                                    <span className="nptel-drop-title">Upload Certificate PDF</span>
                                    <span className="nptel-drop-hint">Click to select · PDF only</span>
                                    <input type="file" accept="application/pdf" style={{ display: 'none' }}
                                      onChange={e => handleSelectFile(examName, e.target.files?.[0] ?? null)} />
                                  </label>
                                )}

                                {/* Upload & Save button */}
                                <button
                                  className={`nptel-upload-save-btn ${isUploading ? 'uploading' : ''}`}
                                  onClick={() => handleUploadCertificate(examName)}
                                  disabled={!pendingFile || !pendingName.trim() || isUploading}
                                >
                                  {isUploading ? (
                                    <><span className="nptel-spinner small" /> Uploading...</>
                                  ) : (
                                    <><Upload size={14} /> Upload & Save Certificate</>
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
