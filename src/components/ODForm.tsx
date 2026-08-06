import React, { useState, useEffect } from 'react';
import { dbService, type ODRequest, type ODStudent } from '../services/db';
import { ArrowLeft, FileText, Clock, CheckCircle2, XCircle, Download, Trash2, Plus, X, UserPlus, FileDown } from 'lucide-react';
import { jsPDF } from 'jspdf';
import headerImage from '../assets/srec-snr-header.png';

interface ODFormProps {
  currentEmail: string;
  currentName: string;
  currentRollNo: string;
  isAdmin: boolean;
  currentUser: any;
  onBack: () => void;
}

const STATUS_CONFIG = {
  Pending:  { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: <Clock size={14} /> },
  Approved: { color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: <CheckCircle2 size={14} /> },
  Rejected: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', icon: <XCircle size={14} /> }
};

// Helper utility to convert image url to base64
const getBase64Image = (imgUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } else {
        reject('Could not get canvas context');
      }
    };
    img.onerror = (err) => reject(err);
    img.src = imgUrl;
  });
};

export const ODForm: React.FC<ODFormProps> = ({
  currentEmail,
  currentName,
  currentRollNo,
  isAdmin,
  currentUser,
  onBack
}) => {
  const [requests, setRequests] = useState<ODRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [odType, setOdType] = useState<'External OD' | 'Internal OD'>('External OD');
  const [odSubCategory, setOdSubCategory] = useState<'SAC OD' | 'Other'>('SAC OD');
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [venue, setVenue] = useState('');
  const [facultyCoordinator, setFacultyCoordinator] = useState('');
  const [students, setStudents] = useState<ODStudent[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Admin state
  const [adminRemarks, setAdminRemarks] = useState<Record<string, string>>({});

  useEffect(() => {
    loadRequests();
  }, [currentEmail, isAdmin]);

  useEffect(() => {
    if (showForm) {
      // Pre-fill student table with current student details on row 1
      if (!isAdmin && currentRollNo && currentName) {
        setStudents([
          {
            rollNo: currentRollNo,
            name: currentName,
            year: currentUser?.yearOfStudy || '3rd Year',
            className: currentUser?.className || 'III EEE-A'
          }
        ]);
      } else {
        setStudents([{ rollNo: '', name: '', year: '', className: '' }]);
      }
    }
  }, [showForm, currentRollNo, currentName, isAdmin, currentUser]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const list = isAdmin
        ? await dbService.getODRequests()
        : await dbService.getODRequests(currentEmail);
      setRequests(list.sort((a, b) => b.requestedAt.localeCompare(a.requestedAt)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = () => {
    setStudents([...students, { rollNo: '', name: '', year: '', className: '' }]);
  };

  const handleRemoveStudent = (index: number) => {
    if (students.length === 1) return;
    setStudents(students.filter((_, idx) => idx !== index));
  };

  const handleStudentChange = (index: number, field: keyof ODStudent, value: string) => {
    const updated = [...students];
    updated[index][field] = value;
    setStudents(updated);
  };

  const handleGeneratePDF = async (req: ODRequest) => {
    try {
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      // Load header image and convert to base64
      let imgBase64 = '';
      try {
        imgBase64 = await getBase64Image(headerImage);
      } catch (err) {
        console.error('Failed to load header image, trying relative fallback:', err);
        try {
          imgBase64 = await getBase64Image('/src/assets/srec-snr-header.png');
        } catch (e2) {
          console.error('All image load attempts failed:', e2);
        }
      }

      if (imgBase64) {
        // Width: 180mm, height: 32mm fits nicely on standard A4 with margins
        doc.addImage(imgBase64, 'PNG', 15, 15, 180, 32);
      } else {
        // Design static SVG fallback
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(16);
        doc.text('SRI RAMAKRISHNA ENGINEERING COLLEGE', 15, 25);
        doc.setFontSize(10);
        doc.text('[Educational Service : SNR Sons Charitable Trust]', 15, 30);
        doc.text('Vattamalaipalayam, N.G.G.O. Colony Post, Coimbatore - 641022.', 15, 35);
      }

      // Title
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('STUDENT AFFAIRS CLUB', 105, 56, { align: 'center' });
      doc.setLineWidth(0.4);
      doc.line(80, 58, 130, 58);

      // Event Details
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(11);
      
      const drawDetailLine = (label: string, value: string, yPos: number) => {
        doc.setFont('Helvetica', 'bold');
        doc.text(label, 15, yPos);
        const labelWidth = doc.getTextWidth(label);
        
        doc.setFont('Helvetica', 'normal');
        doc.text(value, 15 + labelWidth + 2, yPos);
        
        doc.setLineWidth(0.2);
        doc.line(15 + labelWidth + 1, yPos + 1.5, 195, yPos + 1.5);
      };

      drawDetailLine('Name of the Event/Purpose: ', req.eventName, 68);
      drawDetailLine('Date and timing of the Event: ', req.eventDate, 78);
      drawDetailLine('Venue: ', req.venue, 88);
      drawDetailLine('Faculty Co-ordinator: ', req.facultyCoordinator, 98);
      
      doc.setFont('Helvetica', 'bold');
      doc.text('Signature: ', 15, 108);
      doc.setLineWidth(0.2);
      doc.line(35, 109.5, 75, 109.5);

      // Student Details Label
      doc.setFont('Helvetica', 'bold');
      doc.text('Student Details:', 15, 122);

      // Table Setup
      let currentY = 127;
      const colWidths = [15, 35, 65, 25, 40];
      const colNames = ['S.No.', 'Roll.No', 'Name', 'Year', 'Class'];

      // Header background
      doc.setFillColor(242, 245, 248);
      doc.rect(15, currentY, 180, 8, 'F');

      // Header Text
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9.5);
      let headerX = 15;
      for (let i = 0; i < colNames.length; i++) {
        const text = colNames[i];
        const textWidth = doc.getTextWidth(text);
        const textX = headerX + (colWidths[i] - textWidth) / 2;
        doc.text(text, textX, currentY + 5.5);
        headerX += colWidths[i];
      }
      currentY += 8;

      // Table Rows
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      req.students.forEach((stud, index) => {
        const rowData = [
          (index + 1).toString(),
          stud.rollNo || '',
          stud.name || '',
          stud.year || '',
          stud.className || ''
        ];

        let rowX = 15;
        for (let i = 0; i < rowData.length; i++) {
          const text = rowData[i];
          const textWidth = doc.getTextWidth(text);
          const textX = rowX + (colWidths[i] - textWidth) / 2;
          doc.text(text, textX, currentY + 5.5);
          rowX += colWidths[i];
        }
        currentY += 8;
      });

      // Grid Borders (horizontal lines)
      doc.setLineWidth(0.2);
      doc.setDrawColor(80, 80, 80);
      for (let y = 127; y <= currentY; y += 8) {
        doc.line(15, y, 195, y);
      }
      // Grid Borders (vertical lines)
      let borderX = 15;
      doc.line(borderX, 127, borderX, currentY);
      for (let i = 0; i < colWidths.length; i++) {
        borderX += colWidths[i];
        doc.line(borderX, 127, borderX, currentY);
      }

      // Total students
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`Total number of students: ${req.students.length}`, 15, currentY + 12);
      
      const countWidth = doc.getTextWidth(`Total number of students: ${req.students.length}`);
      doc.setLineWidth(0.2);
      doc.line(15 + countWidth - 10, currentY + 13.5, 15 + countWidth + 5, currentY + 13.5);

      // Footer signatures
      const sigY = Math.max(currentY + 35, 245);
      
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      
      // Club Admin
      doc.text('Club Admin', 45, sigY, { align: 'center' });
      doc.setFont('Helvetica', 'bold');
      doc.text('Dr.K.Balamurugan', 45, sigY + 6, { align: 'center' });
      
      // Dean SAC
      doc.setFont('Helvetica', 'normal');
      doc.text('Dean SAC', 160, sigY, { align: 'center' });
      doc.setFont('Helvetica', 'bold');
      doc.text('Dr.P.Perumal', 160, sigY + 6, { align: 'center' });

      // Save file
      doc.save(`SAC_OD_Report_${req.id}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName.trim() || !eventDate.trim() || !venue.trim() || !facultyCoordinator.trim()) return;

    // Validate students list
    const validStudents = students.filter(s => s.rollNo.trim() && s.name.trim());
    if (validStudents.length === 0) {
      alert('Please add at least one student with Roll No and Name.');
      return;
    }

    setSubmitting(true);
    setStatusMsg('');

    const newReq: ODRequest = {
      id: `od-${Date.now()}`,
      studentEmail: currentEmail,
      studentName: currentName,
      rollNo: currentRollNo,
      odType,
      odSubCategory,
      eventName: eventName.trim(),
      eventDate: eventDate.trim(),
      venue: venue.trim(),
      facultyCoordinator: facultyCoordinator.trim(),
      students: validStudents,
      status: 'Pending',
      requestedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    try {
      await dbService.saveODRequest(newReq);
      setStatusMsg('OD Request submitted successfully!');
      setTimeout(() => setStatusMsg(''), 3500);
      
      // Clear form
      setEventName('');
      setEventDate('');
      setVenue('');
      setFacultyCoordinator('');
      setShowForm(false);
      loadRequests();
    } catch (err) {
      console.error(err);
      setStatusMsg('Error submitting OD request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: 'Approved' | 'Rejected') => {
    const remarks = adminRemarks[id] || '';
    const req = requests.find(r => r.id === id);
    if (!req) return;

    const updated: ODRequest = {
      ...req,
      status: newStatus,
      adminRemarks: remarks
    };

    try {
      await dbService.saveODRequest(updated);
      setStatusMsg(`Request marked as ${newStatus}`);
      setTimeout(() => setStatusMsg(''), 3000);
      loadRequests();
    } catch (err) {
      console.error(err);
      setStatusMsg('Failed to update status.');
    }
  };

  const handleDeleteRequest = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return;
    try {
      await dbService.deleteODRequest(id);
      loadRequests();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="panel-container" style={{ padding: 16, maxWidth: 640, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={onBack} className="btn-icon" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--card-border)', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-primary)' }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            {isAdmin ? 'OD Requests Manager' : 'On-Duty (OD) Forms'}
          </h2>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
            {isAdmin ? 'Approve and manage student SAC OD forms' : 'Apply for External / Internal College OD'}
          </p>
        </div>
      </div>

      {statusMsg && (
        <div style={{ padding: '10px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--accent-light)', borderRadius: 8, fontSize: 12, color: 'var(--accent)', fontWeight: 600, marginBottom: 16 }}>
          {statusMsg}
        </div>
      )}

      {/* Main Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {!isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700 }}
          >
            <Plus size={16} />
            {showForm ? 'Cancel Application' : 'Create New OD Form'}
          </button>
        )}

        {/* OD Application Form */}
        {showForm && !isAdmin && (
          <form onSubmit={handleSubmitRequest} style={{ background: 'var(--bg-secondary)', borderRadius: 14, padding: 18, border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: 14, animation: 'fadeIn 0.2s ease' }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, margin: 0, borderBottom: '1px solid var(--card-border)', paddingBottom: 8 }}>
              📄 SAC OD Application Form
            </h3>

            {/* OD Category */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, fontSize: 11, color: 'var(--text-muted)' }}>OD Category</label>
              <select
                value={odType}
                onChange={e => setOdType(e.target.value as any)}
                className="form-select"
                style={{ width: '100%', padding: 10, borderRadius: 8, background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }}
              >
                <option value="External OD">External OD</option>
                <option value="Internal OD">Internal OD</option>
              </select>
            </div>

            {/* Sub-Category (SAC OD) */}
            {odType === 'External OD' && (
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700, fontSize: 11, color: 'var(--text-muted)' }}>Sub-Category</label>
                <select
                  value={odSubCategory}
                  onChange={e => setOdSubCategory(e.target.value as any)}
                  className="form-select"
                  style={{ width: '100%', padding: 10, borderRadius: 8, background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }}
                >
                  <option value="SAC OD">SAC OD (Student Affairs Club)</option>
                  <option value="Other">Other External Event</option>
                </select>
              </div>
            )}

            {/* Event Name */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, fontSize: 11, color: 'var(--text-muted)' }}>Name of the Event/Purpose</label>
              <input
                type="text"
                value={eventName}
                onChange={e => setEventName(e.target.value)}
                className="form-input"
                placeholder="e.g. Science Exhibition, Inter-college Tech Fest"
                required
                style={{ width: '100%', padding: 10, borderRadius: 8, background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)', fontSize: 12 }}
              />
            </div>

            {/* Event Date & Timing */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, fontSize: 11, color: 'var(--text-muted)' }}>Date and timing of the Event</label>
              <input
                type="text"
                value={eventDate}
                onChange={e => setEventDate(e.target.value)}
                className="form-input"
                placeholder="e.g. 12th Aug 2026, 9:00 AM to 4:00 PM"
                required
                style={{ width: '100%', padding: 10, borderRadius: 8, background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)', fontSize: 12 }}
              />
            </div>

            {/* Venue */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, fontSize: 11, color: 'var(--text-muted)' }}>Venue</label>
              <input
                type="text"
                value={venue}
                onChange={e => setVenue(e.target.value)}
                className="form-input"
                placeholder="e.g. Main Auditorium, PSG Tech"
                required
                style={{ width: '100%', padding: 10, borderRadius: 8, background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)', fontSize: 12 }}
              />
            </div>

            {/* Faculty Co-ordinator */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, fontSize: 11, color: 'var(--text-muted)' }}>Faculty Co-ordinator</label>
              <input
                type="text"
                value={facultyCoordinator}
                onChange={e => setFacultyCoordinator(e.target.value)}
                className="form-input"
                placeholder="e.g. Dr. R. Ramanujam"
                required
                style={{ width: '100%', padding: 10, borderRadius: 8, background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)', fontSize: 12 }}
              />
            </div>

            {/* Student List Section */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-primary)' }}>Student Details</label>
                <button
                  type="button"
                  onClick={handleAddStudent}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 6, background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', color: '#10b981', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
                >
                  <UserPlus size={12} /> Add Student
                </button>
              </div>

              {/* Student Entry Table (Scrollable Container on Mobile) */}
              <div style={{ overflowX: 'auto', border: '1px solid var(--card-border)', borderRadius: 8 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--card-border)' }}>
                      <th style={{ padding: 8, textAlign: 'center', width: 40 }}>S.No</th>
                      <th style={{ padding: 8, textAlign: 'left' }}>Roll.No</th>
                      <th style={{ padding: 8, textAlign: 'left' }}>Name</th>
                      <th style={{ padding: 8, textAlign: 'left', width: 80 }}>Year</th>
                      <th style={{ padding: 8, textAlign: 'left', width: 90 }}>Class</th>
                      <th style={{ padding: 8, textAlign: 'center', width: 35 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((stud, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--card-border)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                        <td style={{ padding: 6, textAlign: 'center', fontWeight: 600 }}>{idx + 1}</td>
                        <td style={{ padding: 4 }}>
                          <input
                            type="text"
                            value={stud.rollNo}
                            onChange={e => handleStudentChange(idx, 'rollNo', e.target.value.toUpperCase())}
                            placeholder="7377..."
                            required
                            style={{ width: '100%', padding: '6px 8px', borderRadius: 4, background: 'var(--bg-primary)', border: '1px solid var(--card-border)', color: 'var(--text-primary)', fontSize: 11 }}
                          />
                        </td>
                        <td style={{ padding: 4 }}>
                          <input
                            type="text"
                            value={stud.name}
                            onChange={e => handleStudentChange(idx, 'name', e.target.value)}
                            placeholder="Student Name"
                            required
                            style={{ width: '100%', padding: '6px 8px', borderRadius: 4, background: 'var(--bg-primary)', border: '1px solid var(--card-border)', color: 'var(--text-primary)', fontSize: 11 }}
                          />
                        </td>
                        <td style={{ padding: 4 }}>
                          <input
                            type="text"
                            value={stud.year}
                            onChange={e => handleStudentChange(idx, 'year', e.target.value)}
                            placeholder="e.g. 3rd Year"
                            required
                            style={{ width: '100%', padding: '6px 8px', borderRadius: 4, background: 'var(--bg-primary)', border: '1px solid var(--card-border)', color: 'var(--text-primary)', fontSize: 11 }}
                          />
                        </td>
                        <td style={{ padding: 4 }}>
                          <input
                            type="text"
                            value={stud.className}
                            onChange={e => handleStudentChange(idx, 'className', e.target.value)}
                            placeholder="e.g. III EEE-A"
                            required
                            style={{ width: '100%', padding: '6px 8px', borderRadius: 4, background: 'var(--bg-primary)', border: '1px solid var(--card-border)', color: 'var(--text-primary)', fontSize: 11 }}
                          />
                        </td>
                        <td style={{ padding: 4, textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleRemoveStudent(idx)}
                            disabled={students.length === 1}
                            style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: students.length === 1 ? 0.3 : 0.8 }}
                          >
                            <X size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, textAlign: 'right', fontWeight: 600 }}>
                Total students: {students.length}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
              <button
                type="submit"
                className="btn-primary"
                style={{ flex: 1, padding: 12, borderRadius: 8, fontSize: 12, fontWeight: 700 }}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit OD Request'}
              </button>
              <button
                type="button"
                onClick={() => {
                  const mockReq: ODRequest = {
                    id: 'preview',
                    studentEmail: currentEmail,
                    studentName: currentName,
                    rollNo: currentRollNo,
                    odType,
                    odSubCategory,
                    eventName: eventName.trim() || 'Sample Event Name',
                    eventDate: eventDate.trim() || 'Sample Event Date',
                    venue: venue.trim() || 'Sample Venue',
                    facultyCoordinator: facultyCoordinator.trim() || 'Sample Coordinator',
                    students: students.filter(s => s.rollNo.trim()),
                    status: 'Pending',
                    requestedAt: ''
                  };
                  handleGeneratePDF(mockReq);
                }}
                className="btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: 12, borderRadius: 8, fontSize: 12, fontWeight: 600 }}
              >
                <FileDown size={14} /> Preview PDF
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary"
                style={{ padding: 12, borderRadius: 8, fontSize: 12 }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Requests List */}
        <div style={{ marginTop: 8 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
            {isAdmin ? 'Received Applications' : 'My OD Requests'}
          </h3>

          {loading ? (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>Loading requests...</p>
          ) : requests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', border: '1px dashed var(--card-border)', borderRadius: 14, background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
              <FileText size={40} style={{ opacity: 0.3, marginBottom: 10 }} />
              <p style={{ fontSize: 12, margin: 0 }}>No OD requests found.</p>
              {!isAdmin && <p style={{ fontSize: 11, opacity: 0.8, marginTop: 4 }}>Apply for OD by clicking the button above.</p>}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {requests.map(req => {
                const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.Pending;
                const isExpanded = expandedId === req.id;

                return (
                  <div
                    key={req.id}
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--card-border)', borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 8, transition: 'box-shadow 0.2s' }}
                  >
                    {/* Collapsed Header Summary */}
                    <div
                      onClick={() => setExpandedId(isExpanded ? null : req.id)}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{req.eventName}</span>
                          <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: cfg.bg, color: cfg.color, display: 'flex', alignItems: 'center', gap: 3 }}>
                            {cfg.icon} {req.status}
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', gap: 8 }}>
                          <span>{req.odType} · {req.odSubCategory}</span>
                          <span>•</span>
                          <span>{req.requestedAt}</span>
                        </div>
                        {isAdmin && (
                          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)' }}>
                            By: {req.studentName} ({req.rollNo})
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGeneratePDF(req);
                          }}
                          className="doc-action-btn"
                          style={{ padding: 6, borderRadius: 6, background: 'var(--bg-primary)', border: '1px solid var(--card-border)', color: 'var(--text-primary)', cursor: 'pointer' }}
                          title="Download PDF"
                        >
                          <Download size={14} />
                        </button>
                        {!isAdmin && req.status === 'Pending' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRequest(req.id);
                            }}
                            className="doc-action-btn"
                            style={{ padding: 6, borderRadius: 6, background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', color: '#ef4444', cursor: 'pointer' }}
                            title="Delete Request"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded Detail Panel */}
                    {isExpanded && (
                      <div style={{ marginTop: 10, borderTop: '1px solid var(--card-border)', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          <div>
                            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 2 }}>Date & Timing</div>
                            <div style={{ color: 'var(--text-primary)' }}>{req.eventDate}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 2 }}>Venue</div>
                            <div style={{ color: 'var(--text-primary)' }}>{req.venue}</div>
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 2 }}>Faculty Co-ordinator</div>
                          <div style={{ color: 'var(--text-primary)' }}>{req.facultyCoordinator}</div>
                        </div>

                        {/* Students List in Expanded Panel */}
                        <div>
                          <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>Students ({req.students.length})</div>
                          <div style={{ border: '1px solid var(--card-border)', borderRadius: 6, background: 'var(--bg-primary)', overflow: 'hidden' }}>
                            {req.students.map((st, i) => (
                              <div key={i} style={{ padding: '6px 10px', borderBottom: i === req.students.length - 1 ? 'none' : '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                                <span style={{ fontWeight: 600 }}>{i + 1}. {st.name} ({st.rollNo})</span>
                                <span style={{ color: 'var(--text-muted)' }}>{st.className} · {st.year}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {req.adminRemarks && (
                          <div style={{ padding: 8, background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: 6 }}>
                            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: '#0ea5e9', marginBottom: 2 }}>Admin Remarks</div>
                            <div style={{ color: 'var(--text-primary)' }}>{req.adminRemarks}</div>
                          </div>
                        )}

                        {/* Admin Action Bar */}
                        {isAdmin && req.status === 'Pending' && (
                          <div style={{ marginTop: 6, borderTop: '1px dashed var(--card-border)', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div className="form-group">
                              <label style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Admin Remarks</label>
                              <input
                                type="text"
                                value={adminRemarks[req.id] || ''}
                                onChange={e => setAdminRemarks({ ...adminRemarks, [req.id]: e.target.value })}
                                className="form-input"
                                placeholder="Add optional instructions or remarks..."
                                style={{ width: '100%', padding: '6px 8px', borderRadius: 4, background: 'var(--bg-primary)', border: '1px solid var(--card-border)', color: 'var(--text-primary)', fontSize: 11 }}
                              />
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button
                                onClick={() => handleUpdateStatus(req.id, 'Approved')}
                                className="btn-primary"
                                style={{ flex: 1, padding: 8, fontSize: 11, background: '#10b981', borderColor: '#10b981' }}
                              >
                                Approve OD Request
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(req.id, 'Rejected')}
                                className="btn-secondary"
                                style={{ flex: 1, padding: 8, fontSize: 11, color: '#ef4444', borderColor: '#ef4444' }}
                              >
                                Reject Request
                              </button>
                            </div>
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
    </div>
  );
};
