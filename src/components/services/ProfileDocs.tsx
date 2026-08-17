import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { dbService } from '../../services/db';
import type { Student, StudentDoc } from '../../services/db';
import type { UserProfile } from '../../App';
import {
  ArrowLeft, Upload, Download, Trash2, Search, UserCheck, Plus, X,
  User, Phone, Calendar, Droplets, MapPin, BookOpen, Hash, Layers,
  Shield, CheckCircle, Edit3, Award, FileText, Sparkles, CheckCircle2, ChevronDown
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
  const [profileSaved, setProfileSaved] = useState(false);

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
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
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
      <div className="panel-view">
        <div className="panel-header">
          <button onClick={onBack} className="back-btn"><ArrowLeft size={20} /></button>
          <span className="panel-title">My Profile</span>
        </div>

        <div className="panel-body" style={{ paddingBottom: 32 }}>
          {/* Hero Card */}
          <div style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #0052cc 55%, #2563eb 100%)',
            borderRadius: 20,
            padding: '20px 18px',
            marginBottom: 24,
            boxShadow: '0 10px 28px rgba(0,82,204,0.35)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Decorative glows */}
            <div style={{ position: 'absolute', top: -30, right: -30, width: 130, height: 130, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -20, left: -20, width: 100, height: 100, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,95,31,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />

            {/* Top row: avatar + name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
                  border: '3px solid rgba(255,255,255,0.5)',
                  boxShadow: '0 0 0 5px rgba(255,255,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 26, fontWeight: 900, color: '#fff',
                }}>
                  {initials}
                </div>
                <div style={{ position: 'absolute', bottom: 2, right: 2, width: 13, height: 13, borderRadius: '50%', background: '#22c55e', border: '2px solid #0052cc' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: 19, fontWeight: 900, color: '#fff', margin: 0, lineHeight: 1.2 }}>
                  {profileName || currentUser?.name || 'Student Name'}
                </h3>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', margin: '3px 0 0', fontWeight: 600 }}>Sri Ramakrishna Engineering College</p>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', margin: '2px 0 0', fontWeight: 500 }}>
                  {profileDept || currentUser?.department || 'Dept of EEE'} · {profileRollNo || currentUser?.rollNo}
                </p>
              </div>
            </div>

            {/* Info chips grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {[
                { label: 'Class', value: profileClass || currentUser?.className || '—' },
                { label: 'Year', value: profileYear || currentUser?.yearOfStudy || '—' },
                { label: 'Semester', value: profileSem || currentUser?.semester || '—' },
                { label: 'Dept', value: profileDept || currentUser?.department || '—' },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  background: 'rgba(255,255,255,0.12)',
                  borderRadius: 10,
                  padding: '7px 10px',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  minWidth: 0,
                }}>
                  <div style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          {profileSaved && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, marginBottom: 16, fontSize: 13, fontWeight: 700, color: '#166534' }}>
              <CheckCircle size={16} /> Profile saved successfully!
            </div>
          )}

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

            {/* ── Section: Academic Info ── */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(0,82,204,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen size={14} style={{ color: '#0052cc' }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#0052cc', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Academic Information</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, background: '#fff', borderRadius: 14, border: '1.5px solid rgba(0,82,204,0.12)', padding: 16 }}>
                <ProfileField icon={<User size={14} />} label="Full Name" type="text" value={profileName} onChange={setProfileName} placeholder="e.g. Nithin Annamalai" required />
                <ProfileField icon={<Hash size={14} />} label="Roll Number" type="text" value={profileRollNo} onChange={setProfileRollNo} placeholder="e.g. 7377221EE001" required />
                <ProfileField icon={<Layers size={14} />} label="Class & Section" type="text" value={profileClass} onChange={setProfileClass} placeholder="e.g. III EEE-A" />
                <ProfileField icon={<Calendar size={14} />} label="Year of Study" type="text" value={profileYear} onChange={setProfileYear} placeholder="e.g. 3rd Year" />
                <ProfileField icon={<BookOpen size={14} />} label="Semester" type="text" value={profileSem} onChange={setProfileSem} placeholder="e.g. Semester VI" />
                <ProfileField icon={<Shield size={14} />} label="Department" type="text" value={profileDept} onChange={setProfileDept} placeholder="e.g. Dept of EEE" />
              </div>
            </div>

            {/* ── Section: Personal Details ── */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(5,150,105,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={14} style={{ color: '#059669' }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#059669', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Personal Details</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, background: '#fff', borderRadius: 14, border: '1.5px solid rgba(5,150,105,0.15)', padding: 16 }}>
                <ProfileField icon={<Phone size={14} />} label="Phone Number" type="tel" value={profilePhone} onChange={setProfilePhone} placeholder="e.g. 98765 43210" />
                <ProfileField icon={<Calendar size={14} />} label="Date of Birth" type="date" value={profileDob} onChange={setProfileDob} placeholder="" />
                <ProfileField icon={<Droplets size={14} />} label="Blood Group" type="text" value={profileBlood} onChange={setProfileBlood} placeholder="e.g. O+, A+, B-" />
                <ProfileField icon={<MapPin size={14} />} label="Address" type="text" value={profileAddress} onChange={setProfileAddress} placeholder="e.g. 12, Anna Nagar, Coimbatore" />
              </div>
            </div>

            {/* ── Section: Contact Info ── */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(217,119,6,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Phone size={14} style={{ color: '#d97706' }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#d97706', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Parent / Guardian Contact</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, background: '#fff', borderRadius: 14, border: '1.5px solid rgba(217,119,6,0.15)', padding: 16 }}>
                <ProfileField icon={<User size={14} />} label="Parent / Guardian Name" type="text" value={profileParentName} onChange={setProfileParentName} placeholder="e.g. Annamalai R" />
                <ProfileField icon={<Phone size={14} />} label="Parent Phone Number" type="tel" value={profileParentPhone} onChange={setProfileParentPhone} placeholder="e.g. 98765 43210" />
                {/* Email is read-only */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 5 }}>Email Address (Login ID)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                    <Edit3 size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>{currentUser?.email || currentEmail}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 9, background: '#e2e8f0', color: '#64748b', padding: '2px 6px', borderRadius: 6, fontWeight: 700 }}>READ ONLY</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '14px 0', fontSize: 14, fontWeight: 800,
                background: saving ? '#94a3b8' : 'linear-gradient(135deg, #0052cc 0%, #3b82f6 100%)',
                color: '#fff', border: 'none', borderRadius: 14, cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: saving ? 'none' : '0 4px 16px rgba(0,82,204,0.35)',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}
            >
              <CheckCircle size={16} />
              {saving ? 'Saving...' : 'Save Profile Details'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────
  // ── MODE: DOCUMENTS / CERTIFICATES ──────────────────
  // ─────────────────────────────────────────────────────
  return (
    <div className="panel-view">
      <div className="panel-header">
        <button onClick={selectedStudentEmail ? () => setSelectedStudentEmail(null) : onBack} className="back-btn">
          <ArrowLeft size={20} />
        </button>
        <span className="panel-title">
          {isAdmin && !selectedStudentEmail
            ? (mode === 'certificates' ? 'Certificates Directory' : 'Student Database')
            : (mode === 'certificates' ? 'Certificates & Badges' : 'Documents Vault')}
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
