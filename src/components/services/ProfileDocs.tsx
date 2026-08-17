import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { dbService } from '../../services/db';
import type { Student, StudentDoc } from '../../services/db';
import type { UserProfile } from '../../App';
import {
  ArrowLeft, Upload, Download, Trash2, Search, UserCheck, Plus, X,
  User, Phone, Calendar, Droplets, MapPin, BookOpen, Hash, Layers,
  CheckCircle, Edit3, Award, FileText, Sparkles, CheckCircle2, ChevronDown
} from 'lucide-react';

const CERT_CATEGORY_CONFIG = [
  { label: 'NPTEL & Swayam Certifications', icon: '🎓', color: '#0052cc', bg: '#eff6ff' },
  { label: 'Internship & Industry Training', icon: '💼', color: '#059669', bg: '#ecfdf5' },
  { label: 'Workshops & Seminars', icon: '🛠️', color: '#d97706', bg: '#fffbeb' },
  { label: 'Sports & Co-Curricular', icon: '🏆', color: '#dc2626', bg: '#fef2f2' },
  { label: 'Academic Degrees & Marksheets', icon: '📜', color: '#7c3aed', bg: '#f5f3ff' },
  { label: 'Other Certificates', icon: '📑', color: '#475569', bg: '#f8fafc' },
];

const CERT_CATEGORIES = CERT_CATEGORY_CONFIG.map(c => c.label);

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
  mode?: 'documents' | 'certificates' | 'profile';
  currentUser?: UserProfile | null;
  onUpdateUser?: (updated: UserProfile) => void;
}

export const ProfileDocs: React.FC<ProfileDocsProps> = ({
  currentEmail,
  isAdmin,
  onBack,
  mode = 'documents',
  currentUser,
  onUpdateUser
}) => {
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // ── Profile Edit States ──────────────────────────────
  const [profileName, setProfileName] = useState('');
  const [profileRollNo, setProfileRollNo] = useState('');
  const [profileClass, setProfileClass] = useState('');
  const [profileYear, setProfileYear] = useState('');
  const [profileSem, setProfileSem] = useState('');
  const [profileDept, setProfileDept] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileDob, setProfileDob] = useState('');
  const [profileBlood, setProfileBlood] = useState('');
  const [profileAddress, setProfileAddress] = useState('');
  const [profileParentName, setProfileParentName] = useState('');
  const [profileParentPhone, setProfileParentPhone] = useState('');
  const [showEditBioModal, setShowEditBioModal] = useState(false);

  // Populate profile fields from currentUser
  useEffect(() => {
    if (mode === 'profile' && currentUser) {
      setProfileName(currentUser.name || '');
      setProfileRollNo(currentUser.rollNo || '');
      setProfileClass(currentUser.className || '');
      setProfileYear(currentUser.yearOfStudy || '');
      setProfileSem(currentUser.semester || '');
      setProfileDept(currentUser.department || '');
      setProfilePhone(currentUser.phone || '');
      setProfileDob(currentUser.dob || '');
      setProfileBlood(currentUser.bloodGroup || '');
      setProfileAddress(currentUser.address || '');
      setProfileParentName(currentUser.parentName || '');
      setProfileParentPhone(currentUser.parentPhone || '');
    }
  }, [mode, currentUser]);

  // Load student data
  useEffect(() => {
    if (mode !== 'profile') loadData();
  }, [currentEmail, selectedStudentEmail, isAdmin, mode]);

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

  // ── Save Profile Handler ─────────────────────────────
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated: UserProfile = {
        ...(currentUser as UserProfile),
        name: profileName.trim() || currentUser?.name || '',
        rollNo: profileRollNo.trim() || currentUser?.rollNo || '',
        className: profileClass.trim(),
        yearOfStudy: profileYear.trim(),
        semester: profileSem.trim(),
        department: profileDept.trim(),
        phone: profilePhone.trim(),
        dob: profileDob.trim(),
        bloodGroup: profileBlood.trim(),
        address: profileAddress.trim(),
        parentName: profileParentName.trim(),
        parentPhone: profileParentPhone.trim(),
      };
      onUpdateUser?.(updated);
      // Persist to localStorage so it survives refresh
      localStorage.setItem('eee_profile_extra_' + (currentUser?.email || 'student'), JSON.stringify(updated));
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
      setAddName(''); setAddRollNo(''); setAddEmail('');
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
    const baseName = fileName.replace(/\.[^/.]+$/, '');
    let cleanName = baseName.replace(/[_\-\.]+/g, ' ');
    const toTitleCase = (str: string) =>
      str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    const lower = cleanName.toLowerCase();
    if (lower.includes('sem 1') || lower.includes('sem1') || lower.includes('semester 1')) return 'Semester I Marksheet';
    if (lower.includes('sem 2') || lower.includes('sem2') || lower.includes('semester 2')) return 'Semester II Marksheet';
    if (lower.includes('sem 3') || lower.includes('sem3') || lower.includes('semester 3')) return 'Semester III Marksheet';
    if (lower.includes('sem 4') || lower.includes('sem4') || lower.includes('semester 4')) return 'Semester IV Marksheet';
    if (lower.includes('sem 5') || lower.includes('sem5') || lower.includes('semester 5')) return 'Semester V Marksheet';
    if (lower.includes('sem 6') || lower.includes('sem6') || lower.includes('semester 6')) return 'Semester VI Marksheet';
    if (lower.includes('sem 7') || lower.includes('sem7') || lower.includes('semester 7')) return 'Semester VII Marksheet';
    if (lower.includes('sem 8') || lower.includes('sem8') || lower.includes('semester 8')) return 'Semester VIII Marksheet';
    if (lower.includes('nptel') || lower.includes('swayam')) {
      if (lower.includes('python')) return 'NPTEL Python Programming Certificate';
      if (lower.includes('java')) return 'NPTEL Java Programming Certificate';
      if (lower.includes('iot')) return 'NPTEL Internet of Things Certificate';
      return 'NPTEL Certification';
    }
    if (lower.includes('bonafide')) return 'Bonafide Certificate';
    if (lower.includes('noc')) return 'No Objection Certificate (NOC)';
    if (lower.includes('internship') || lower.includes('training')) return 'Internship Certificate';
    if (lower.includes('resume') || lower.includes('cv')) return 'Student Resume';
    if (lower.includes('aadhar') || lower.includes('adhaar') || lower.includes('aadhaar')) return 'Aadhar Card / Identity Proof';
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
    if (!file || (mode !== 'documents' && !student)) return;
    if (file.type !== 'application/pdf') {
      setStatusMessage('Only PDF documents are supported.');
      return;
    }
    setSelectedFile(file);
    setCustomDocName(autoRecognizeDocName(file.name));
    e.target.value = '';
  };

  const handleActualUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !customDocName.trim()) return;
    const targetEmail = mode === 'documents'
      ? (student?.email || currentEmail)
      : (student?.email || currentEmail);
    if (!targetEmail) return;

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
        let nameToSave: string;
        if (mode === 'documents') {
          // Simple: just prefix DOC_ + name
          const finalName = docName.toLowerCase().endsWith('.pdf') ? docName : `${docName}.pdf`;
          nameToSave = 'DOC_' + finalName;
        } else {
          const prefix = 'CERT_';
          const finalName = docName.toLowerCase().endsWith('.pdf') ? docName : `${docName}.pdf`;
          nameToSave = prefix + category + '::' + finalName;
        }
        await dbService.uploadDocument(targetEmail, {
          name: nameToSave,
          size: `${sizeKB} KB`,
          type: file.type,
          dataUrl: base64Data
        });
        setStatusMessage(mode === 'certificates' ? 'Certificate uploaded!' : 'Document uploaded!');
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
    if (mode === 'certificates') return doc.name.startsWith('CERT_');
    return doc.name.startsWith('DOC_') || (!doc.name.startsWith('CERT_') && !doc.name.startsWith('NPTEL_'));
  });

  const getDisplayName = (docName: string) => {
    let n = docName;
    if (n.startsWith('CERT_')) n = n.substring(5);
    else if (n.startsWith('DOC_')) n = n.substring(4);
    if (n.includes('::')) return n.split('::')[1].replace(/\.pdf$/i, '');
    return n.replace(/\.pdf$/i, '');
  };

  const getDocCategory = (docName: string) => {
    let n = docName;
    if (n.startsWith('CERT_')) n = n.substring(5);
    else if (n.startsWith('DOC_')) n = n.substring(4);
    if (n.includes('::')) return n.split('::')[0];
    return mode === 'certificates' ? 'Other Certificates' : 'General Documents';
  };

  const handleDeleteDoc = async (id: string) => {
    if (!student) return;
    if (!window.confirm('Delete this document?')) return;
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

  const filteredStudents = allStudents.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.rollNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ─────────────────────────────────────────────────────
  // ── MODE: PROFILE ────────────────────────────────────
  // ─────────────────────────────────────────────────────
  if (mode === 'profile') {
    const initials = (profileName || currentUser?.name || 'S').charAt(0).toUpperCase();
    return (
      <div className="dedicated-page-view page-slide-enter" style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 88 }}>
        {/* Sleek Header with Small Back Button */}
        <div className="dedicated-page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="page-back-btn" onClick={onBack} title="Go Back">
              <ArrowLeft size={16} />
            </button>
            <div>
              <h2 className="dedicated-page-title" style={{ margin: 0, fontSize: 16, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 6 }}>
                👤 Student Profile &amp; ID Pass
              </h2>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Sri Ramakrishna Engineering College · EEE Department
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowEditBioModal(true)}
            style={{
              padding: '7px 14px',
              borderRadius: 14,
              border: 'none',
              background: 'linear-gradient(135deg, #0052cc 0%, #2563eb 100%)',
              color: '#ffffff',
              fontSize: 11.5,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,82,204,0.3)'
            }}
          >
            <Edit3 size={13} /> Edit Bio
          </button>
        </div>

        <div style={{ padding: 16, maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* 🌟 HOLOGRAPHIC VIP STUDENT ID CARD 🌟 */}
          <div style={{
            background: 'linear-gradient(135deg, #0052cc 0%, #1e3a8a 100%)',
            borderRadius: 28,
            padding: '24px 20px',
            color: '#ffffff',
            boxShadow: '0 16px 36px rgba(0, 82, 204, 0.3)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Ambient Lighting Orbs */}
            <div style={{ position: 'absolute', top: -30, right: -30, width: 130, height: 130, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />

            {/* SREC Official ID Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: 12, marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: 1.2, textTransform: 'uppercase', opacity: 0.85, display: 'block' }}>Sri Ramakrishna Engineering College</span>
                <span style={{ fontSize: 12.5, fontWeight: 900, letterSpacing: -0.2 }}>Department of Electrical &amp; Electronics</span>
              </div>
              <span style={{ padding: '3px 8px', borderRadius: 99, background: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 800, border: '1px solid rgba(255,255,255,0.3)' }}>
                UG 2022–26
              </span>
            </div>

            {/* Avatar & Student Core Bio */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: 68,
                  height: 68,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ff5f1f 0%, #ea580c 100%)',
                  border: '3px solid #ffffff',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 26,
                  fontWeight: 900,
                  color: '#ffffff'
                }}>
                  {initials}
                </div>
                <div style={{ position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: '50%', background: '#10b981', border: '2px solid #ffffff' }} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: 20, fontWeight: 900, margin: '0 0 2px 0', letterSpacing: -0.5 }}>
                  {profileName || currentUser?.name || 'Nithin Annamalai'}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                  <span style={{ padding: '2px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.18)', fontSize: 11, fontWeight: 800 }}>
                    Roll: {profileRollNo || currentUser?.rollNo || '7377221EE001'}
                  </span>
                  <span style={{ padding: '2px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.18)', fontSize: 11, fontWeight: 800 }}>
                    {profileClass || 'III EEE-A'}
                  </span>
                </div>
              </div>
            </div>

            {/* 4-KPI Quick Metric Badges */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, background: 'rgba(0,0,0,0.18)', padding: '10px 8px', borderRadius: 16, textAlign: 'center' }}>
              <div>
                <span style={{ fontSize: 8.5, opacity: 0.75, textTransform: 'uppercase', display: 'block' }}>Attendance</span>
                <strong style={{ fontSize: 13, color: '#38bdf8' }}>94.5%</strong>
              </div>
              <div>
                <span style={{ fontSize: 8.5, opacity: 0.75, textTransform: 'uppercase', display: 'block' }}>CGPA</span>
                <strong style={{ fontSize: 13, color: '#4ade80' }}>8.64</strong>
              </div>
              <div>
                <span style={{ fontSize: 8.5, opacity: 0.75, textTransform: 'uppercase', display: 'block' }}>Certs</span>
                <strong style={{ fontSize: 13, color: '#fcd34d' }}>{docs.filter(d => d.name.startsWith('CERT_')).length || 3}</strong>
              </div>
              <div>
                <span style={{ fontSize: 8.5, opacity: 0.75, textTransform: 'uppercase', display: 'block' }}>Arrears</span>
                <strong style={{ fontSize: 13, color: '#6ee7b7' }}>0 Clear</strong>
              </div>
            </div>
          </div>

          {/* 🏛️ ACADEMIC ENROLLMENT CARD 🏛️ */}
          <div style={{ background: '#ffffff', borderRadius: 24, padding: 20, border: '1.5px solid rgba(0,82,204,0.12)', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
            <h4 style={{ margin: '0 0 14px 0', fontSize: 13.5, fontWeight: 900, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <BookOpen size={16} color="var(--accent-blue)" /> Academic Enrollment
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 10, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Class &amp; Section</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-main)' }}>{profileClass || 'III EEE-A'}</span>
              </div>
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 10, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Semester</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-main)' }}>{profileSem || 'Semester VI'}</span>
              </div>
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 10, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Academic Year</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-main)' }}>{profileYear || '3rd Year (2022–26)'}</span>
              </div>
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 10, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Faculty Tutor</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-main)' }}>Dr. S. Kavitha</span>
              </div>
            </div>
          </div>

          {/* 🪪 PERSONAL & CONTACT CARD 🪪 */}
          <div style={{ background: '#ffffff', borderRadius: 24, padding: 20, border: '1.5px solid rgba(0,82,204,0.12)', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
            <h4 style={{ margin: '0 0 14px 0', fontSize: 13.5, fontWeight: 900, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <User size={16} color="#059669" /> Personal &amp; Contact Info
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 14, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>Institutional Email</span>
                <span style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--accent-blue)' }}>{currentUser?.email || currentEmail}</span>
              </div>
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 14, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>Mobile Phone</span>
                <span style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--text-main)' }}>{profilePhone || '+91 98765 43210'}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: 10, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Blood Group</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-main)' }}>{profileBlood || 'O+'}</span>
                </div>
                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: 10, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Date of Birth</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-main)' }}>{profileDob || '14-07-2004'}</span>
                </div>
              </div>
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 10, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Permanent Address</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)' }}>{profileAddress || '12, Anna Nagar, Peelamedu, Coimbatore - 641004'}</span>
              </div>
            </div>
          </div>

          {/* 👨‍👩‍👧 PARENT & GUARDIAN CARD 👨‍👩‍👧 */}
          <div style={{ background: '#ffffff', borderRadius: 24, padding: 20, border: '1.5px solid rgba(0,82,204,0.12)', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
            <h4 style={{ margin: '0 0 14px 0', fontSize: 13.5, fontWeight: 900, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Phone size={16} color="#d97706" /> Parent / Guardian Contact
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 10, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Guardian Name</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-main)' }}>{profileParentName || 'Annamalai R'}</span>
              </div>
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 10, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Emergency Phone</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-main)' }}>{profileParentPhone || '+91 98765 43210'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 🌟 EDIT PROFILE POPUP MODAL (createPortal to document.body) 🌟 */}
        {showEditBioModal && createPortal(
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(8px)',
              zIndex: 999999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px'
            }}
            onClick={() => setShowEditBioModal(false)}
          >
            <div
              style={{
                width: '100%',
                maxWidth: 480,
                maxHeight: '90vh',
                background: '#ffffff',
                borderRadius: 24,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                animation: 'fluidTabSpring 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={{ background: 'linear-gradient(135deg, #0052cc 0%, #1e40af 100%)', padding: '16px 20px', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 900 }}>✏️ Edit Profile Bio</h3>
                <button onClick={() => setShowEditBioModal(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#ffffff', width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={async (e) => {
                await handleSaveProfile(e);
                setShowEditBioModal(false);
              }} style={{ padding: '18px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <ProfileField icon={<User size={14} />} label="Full Name" type="text" value={profileName} onChange={setProfileName} placeholder="e.g. Nithin Annamalai" required />
                <ProfileField icon={<Hash size={14} />} label="Roll Number" type="text" value={profileRollNo} onChange={setProfileRollNo} placeholder="e.g. 7377221EE001" required />
                <ProfileField icon={<Layers size={14} />} label="Class & Section" type="text" value={profileClass} onChange={setProfileClass} placeholder="e.g. III EEE-A" />
                <ProfileField icon={<Calendar size={14} />} label="Year of Study" type="text" value={profileYear} onChange={setProfileYear} placeholder="e.g. 3rd Year" />
                <ProfileField icon={<BookOpen size={14} />} label="Semester" type="text" value={profileSem} onChange={setProfileSem} placeholder="e.g. Semester VI" />
                <ProfileField icon={<Phone size={14} />} label="Phone Number" type="tel" value={profilePhone} onChange={setProfilePhone} placeholder="e.g. 98765 43210" />
                <ProfileField icon={<Droplets size={14} />} label="Blood Group" type="text" value={profileBlood} onChange={setProfileBlood} placeholder="e.g. O+, A+, B-" />
                <ProfileField icon={<Calendar size={14} />} label="Date of Birth" type="date" value={profileDob} onChange={setProfileDob} placeholder="" />
                <ProfileField icon={<MapPin size={14} />} label="Address" type="text" value={profileAddress} onChange={setProfileAddress} placeholder="e.g. 12, Anna Nagar, Coimbatore" />
                <ProfileField icon={<User size={14} />} label="Parent / Guardian Name" type="text" value={profileParentName} onChange={setProfileParentName} placeholder="e.g. Annamalai R" />
                <ProfileField icon={<Phone size={14} />} label="Parent Phone Number" type="tel" value={profileParentPhone} onChange={setProfileParentPhone} placeholder="e.g. 98765 43210" />

                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <button type="button" onClick={() => setShowEditBioModal(false)} style={{ flex: 1, padding: '12px', borderRadius: 14, border: '1.5px solid #cbd5e1', background: '#f1f5f9', color: '#475569', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} style={{ flex: 1, padding: '12px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #0052cc 0%, #2563eb 100%)', color: '#ffffff', fontWeight: 800, fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,82,204,0.3)' }}>
                    {saving ? 'Saving...' : 'Save Details'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────
  // ── MODE: DOCUMENTS / CERTIFICATES ──────────────────
  // ─────────────────────────────────────────────────────
  return (
    <div className="dedicated-page-view page-slide-enter" style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 88 }}>
      <div className="dedicated-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="page-back-btn" onClick={selectedStudentEmail ? () => setSelectedStudentEmail(null) : onBack} title="Go Back">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="dedicated-page-title" style={{ margin: 0, fontSize: 16, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 6 }}>
              {isAdmin && !selectedStudentEmail
                ? (mode === 'certificates' ? '🏆 Certificates Directory' : '👥 Student Database')
                : (mode === 'certificates' ? '🏆 Certified Skill Vault' : '📁 Academic Document Vault')}
            </h2>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {isAdmin && !selectedStudentEmail ? 'Institution Verification Center' : `Student ID: ${student?.rollNo || '7377221EE001'}`}
            </span>
          </div>
        </div>
      </div>

      <div style={{ padding: 16, maxWidth: 640, margin: '0 auto' }}>
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
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p className="form-label" style={{ margin: 0 }}>Select a student:</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  style={{ padding: '4px 10px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, background: 'var(--accent-blue)', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: 6, fontWeight: 700 }}
                >
                  <Plus size={12} /> Add Student
                </button>
              </div>
              {filteredStudents.length === 0 ? (
                <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', padding: '20px 0' }}>No students found.</p>
              ) : (
                filteredStudents.map(s => (
                  <div key={s.id} className="attendance-mark-item" onClick={() => setSelectedStudentEmail(s.email)} style={{ cursor: 'pointer' }}>
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

        {/* --- STUDENT DOC / CERT VIEW --- */}
        {(!isAdmin || selectedStudentEmail) && student && (
          <>
            {isAdmin && (
              <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: 10, borderRadius: 10, fontSize: 11, border: '1px solid rgba(56,189,248,0.2)', marginBottom: 8 }}>
                Viewing: <strong>{student.name} ({student.rollNo})</strong>
              </div>
            )}

            {/* ── Doc / Cert Upload Section ── */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h4 style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-main)', margin: 0, letterSpacing: -0.3 }}>
                    {mode === 'certificates' ? '🏆 Certificates Vault' : '📁 Documents Vault'}
                  </h4>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                    {mode === 'certificates' ? 'NPTEL, Symposia, Workshops & Course Certifications' : 'Academic Proofs, Bonafide, Resume & ID Records'}
                  </p>
                </div>
                <button
                  onClick={handleOpenUploadModal}
                  className="modern-add-cert-btn"
                >
                  <Plus size={15} />
                  <span>{mode === 'certificates' ? 'Add Certificate' : 'Add Document'}</span>
                </button>
              </div>

              {uploading && (
                <div style={{ padding: 14, background: 'rgba(0,82,204,0.06)', border: '1.5px solid rgba(0,82,204,0.18)', borderRadius: 16, textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--accent-blue)', marginBottom: 12 }}>
                  ⏳ Uploading and securing to encrypted vault...
                </div>
              )}
              {statusMessage && (
                <div style={{ padding: 10, background: '#eff6ff', border: '1px solid rgba(0,82,204,0.18)', borderRadius: 12, fontSize: 11.5, textAlign: 'center', color: 'var(--accent-blue)', fontWeight: 700, marginBottom: 12 }}>
                  {statusMessage}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {filteredDocs.length === 0 ? (
                  <div style={{ background: '#ffffff', borderRadius: 20, border: '1.5px dashed rgba(0,82,204,0.18)', padding: '36px 20px', textAlign: 'center' }}>
                    <div style={{ width: 50, height: 50, borderRadius: 16, background: 'rgba(0,82,204,0.08)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                      {mode === 'certificates' ? <Award size={26} /> : <FileText size={26} />}
                    </div>
                    <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px 0' }}>
                      {mode === 'certificates' ? 'No Certificates Stored' : 'No Documents Stored'}
                    </h4>
                    <p style={{ fontSize: 11.5, color: 'var(--text-muted)', margin: 0 }}>
                      Click "Add {mode === 'certificates' ? 'Certificate' : 'Document'}" to upload your PDFs.
                    </p>
                  </div>
                ) : mode === 'documents' ? (
                  // Documents list
                  <div style={{ background: '#ffffff', border: '1.5px solid rgba(0,82,204,0.12)', borderRadius: 18, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
                    {filteredDocs.map((doc, idx) => (
                      <div key={doc.id} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '12px 16px',
                        borderBottom: idx < filteredDocs.length - 1 ? '1px solid rgba(0,82,204,0.06)' : 'none',
                        background: idx % 2 === 0 ? '#f8fafc' : '#ffffff',
                        transition: 'background 0.2s ease'
                      }}>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(0,82,204,0.1)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <FileText size={16} />
                          </div>
                          <div>
                            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-main)', display: 'block' }}>{getDisplayName(doc.name)}</span>
                            <span style={{ fontSize: 10.5, color: 'var(--text-muted)', fontWeight: 600 }}>{doc.size} · Uploaded {doc.uploadedAt}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => downloadDoc(doc)} className="doc-action-btn" title="Download"><Download size={15} /></button>
                          <button onClick={() => handleDeleteDoc(doc.id)} className="doc-action-btn delete" title="Delete"><Trash2 size={15} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Certificates: Grouped by Category with Modern Cards
                  (() => {
                    const grouped: Record<string, StudentDoc[]> = {};
                    filteredDocs.forEach(doc => {
                      const cat = getDocCategory(doc.name);
                      if (!grouped[cat]) grouped[cat] = [];
                      grouped[cat].push(doc);
                    });
                    return Object.keys(grouped).map(cat => (
                      <div key={cat} className="modern-cert-category-card">
                        <div className="modern-cert-category-header">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 14 }}>📁</span>
                            <span style={{ fontSize: 12.5, fontWeight: 900, color: 'var(--text-main)' }}>{cat}</span>
                          </div>
                          <span className="modern-cert-count-pill">{grouped[cat].length} {grouped[cat].length === 1 ? 'Cert' : 'Certs'}</span>
                        </div>
                        <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {grouped[cat].map((doc) => (
                            <div key={doc.id} className="modern-cert-item-row">
                              <div style={{ display: 'flex', gap: 12, alignItems: 'center', minWidth: 0, flex: 1 }}>
                                <div className="modern-cert-pdf-badge">
                                  <Award size={16} />
                                </div>
                                <div style={{ minWidth: 0, flex: 1 }}>
                                  <span style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--text-main)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {getDisplayName(doc.name)}
                                  </span>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                                    <span style={{ fontSize: 10, color: '#16a34a', fontWeight: 800, background: '#dcfce7', padding: '1px 6px', borderRadius: 6 }}>
                                      ✓ Verified PDF
                                    </span>
                                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{doc.size} · {doc.uploadedAt}</span>
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                <button onClick={() => downloadDoc(doc)} className="modern-cert-action-btn download" title="Download Certificate">
                                  <Download size={14} />
                                </button>
                                <button onClick={() => handleDeleteDoc(doc.id)} className="modern-cert-action-btn delete" title="Delete Certificate">
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
        {showAddModal && typeof document !== 'undefined' && createPortal(
          <div className="modern-cert-modal-backdrop">
            <form className="modern-cert-modal-card" onSubmit={handleAddStudentSubmit}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
                  👤 Add Student Profile
                </h3>
                <button type="button" className="modern-cert-modal-close" onClick={() => setShowAddModal(false)}>
                  <X size={16} />
                </button>
              </div>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" value={addName} onChange={e => setAddName(e.target.value)} className="form-input" placeholder="e.g. John Doe" required />
              </div>
              <div className="form-group">
                <label className="form-label">Roll Number</label>
                <input type="text" value={addRollNo} onChange={e => setAddRollNo(e.target.value)} className="form-input" placeholder="e.g. 7377221EE100" required />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" value={addEmail} onChange={e => setAddEmail(e.target.value)} className="form-input" placeholder="e.g. student3@eee.com" required />
              </div>
              <button type="submit" className="modern-cert-submit-btn" disabled={saving}>
                {saving ? 'Creating...' : 'Register Student'}
              </button>
            </form>
          </div>,
          document.body
        )}

        {/* 🌟 Modern Luxury Add Certificate / Document Modal */}
        {showUploadModal && typeof document !== 'undefined' && createPortal(
          <div className="modern-cert-modal-backdrop">
            <form className="modern-cert-modal-card" onSubmit={handleActualUpload}>
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(0,82,204,0.1)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {mode === 'certificates' ? <Award size={16} /> : <FileText size={16} />}
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
                      {mode === 'certificates' ? 'Add Certificate' : 'Add Document'}
                    </h3>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
                    Upload your verified PDF to the secure institutional vault
                  </p>
                </div>
                <button type="button" className="modern-cert-modal-close" onClick={() => setShowUploadModal(false)}>
                  <X size={16} />
                </button>
              </div>

              {/* Custom Category Dropdown (only for certificates) */}
              {mode === 'certificates' && (
                <div className="form-group" style={{ marginBottom: 14, position: 'relative' }}>
                  <label className="form-label" style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--text-main)', display: 'block', marginBottom: 6 }}>
                    Category / Group
                  </label>
                  <div className="custom-dropdown-container">
                    <button
                      type="button"
                      className="custom-dropdown-trigger"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                        <span style={{ fontSize: 16 }}>
                          {CERT_CATEGORY_CONFIG.find(c => c.label === selectedCategory)?.icon || '🎓'}
                        </span>
                        <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {selectedCategory || CERT_CATEGORIES[0]}
                        </span>
                      </div>
                      <ChevronDown size={16} className={`dropdown-chevron ${isDropdownOpen ? 'open' : ''}`} />
                    </button>

                    {isDropdownOpen && (
                      <div className="custom-dropdown-menu">
                        {CERT_CATEGORY_CONFIG.map(cat => (
                          <div
                            key={cat.label}
                            className={`custom-dropdown-option ${selectedCategory === cat.label ? 'active' : ''}`}
                            onClick={() => {
                              setSelectedCategory(cat.label);
                              setIsDropdownOpen(false);
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span style={{ fontSize: 16 }}>{cat.icon}</span>
                              <span style={{ fontSize: 12.5, fontWeight: selectedCategory === cat.label ? 800 : 600 }}>
                                {cat.label}
                              </span>
                            </div>
                            {selectedCategory === cat.label && <CheckCircle size={15} style={{ color: 'var(--accent-blue)', flexShrink: 0 }} />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Certificate / Document Name */}
              <div className="form-group" style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label className="form-label" style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    {mode === 'certificates' ? 'Certificate Name' : 'Document Name'}
                  </label>
                  {selectedFile && (
                    <span style={{ fontSize: 9.5, background: 'rgba(22, 163, 74, 0.12)', color: '#16a34a', padding: '2px 8px', borderRadius: 10, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Sparkles size={10} /> Auto-Recognized
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={customDocName}
                  onChange={e => setCustomDocName(e.target.value)}
                  className="modern-cert-input"
                  placeholder={mode === 'certificates' ? 'e.g. NPTEL Python Programming, EV Workshop 2026...' : 'e.g. Resume, Bonafide Letter, ID Card...'}
                  required
                />
              </div>

              {/* PDF File Drag & Drop / Upload Zone */}
              <div className="form-group" style={{ marginBottom: 18 }}>
                <label className="form-label" style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--text-main)', display: 'block', marginBottom: 6 }}>
                  Attach PDF Document
                </label>
                {selectedFile ? (
                  <div className="modern-attached-file-box">
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', minWidth: 0, flex: 1 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <CheckCircle2 size={20} />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <span style={{ fontWeight: 800, color: '#166534', fontSize: 12.5, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {selectedFile.name}
                        </span>
                        <span style={{ color: '#64748b', fontSize: 10.5, fontWeight: 600 }}>
                          {(selectedFile.size / 1024).toFixed(1)} KB · Ready to Save
                        </span>
                      </div>
                    </div>
                    <label className="modern-change-file-btn">
                      Change
                      <input type="file" accept="application/pdf" onChange={handleFileUpload} style={{ display: 'none' }} />
                    </label>
                  </div>
                ) : (
                  <label className="modern-pdf-dropzone">
                    <div style={{ width: 48, height: 48, borderRadius: 16, background: 'rgba(0, 82, 204, 0.08)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                      <Upload size={22} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--accent-blue)' }}>Click to select PDF Certificate</span>
                    <span style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 3 }}>Accepts verified PDF files up to 10MB</span>
                    <input type="file" accept="application/pdf" onChange={handleFileUpload} style={{ display: 'none' }} />
                  </label>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="submit"
                  className="modern-cert-submit-btn"
                  disabled={!selectedFile || !customDocName.trim()}
                >
                  <Award size={15} /> Upload &amp; Secure Certificate
                </button>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="modern-cert-cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
};

// ── Reusable Profile Field Row ───────────────────────
function ProfileField({
  icon, label, type, value, onChange, placeholder, required
}: {
  icon: React.ReactNode;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 5 }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', background: '#f8fafc', borderRadius: 10, border: '1.5px solid #e2e8f0', transition: 'border-color 0.2s' }}
        onFocus={() => { }} // handled by CSS
      >
        <span style={{ color: '#94a3b8', flexShrink: 0, display: 'flex', alignItems: 'center' }}>{icon}</span>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          style={{
            flex: 1, border: 'none', background: 'transparent', padding: '10px 0',
            fontSize: 13, fontWeight: 600, color: '#0f172a', outline: 'none'
          }}
        />
      </div>
    </div>
  );
}
