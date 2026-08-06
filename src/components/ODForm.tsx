import React, { useState } from 'react';
import { ArrowLeft, FileText, Download, Eye } from 'lucide-react';
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

// Helper: convert an image URL to a base64 data URL via canvas
const getBase64Image = (imgUrl: string): Promise<string> =>
  new Promise((resolve, reject) => {
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
        reject('Canvas context unavailable');
      }
    };
    img.onerror = reject;
    img.src = imgUrl;
  });

export const ODForm: React.FC<ODFormProps> = ({
  currentEmail,
  currentName,
  currentRollNo,
  isAdmin,
  currentUser,
  onBack
}) => {
  // Form fields
  const [odType, setOdType] = useState<'External OD' | 'Internal OD'>('Internal OD');
  const [odSubCategory, setOdSubCategory] = useState<'SAC OD' | 'Other'>('SAC OD');
  const [eventName, setEventName]           = useState('');
  const [eventDate, setEventDate]           = useState('');
  const [venue, setVenue]                   = useState('');
  const [facultyCoordinator, setFacultyCoordinator] = useState('');
  const [studentCount, setStudentCount]     = useState(1);
  const [generating, setGenerating]         = useState(false);

  // Additional fields for "Other" category
  const [deptName, setDeptName] = useState('DEPARTMENT OF ELECTRICAL AND ELECTRONICS ENGINEERING');
  const [formTitle, setFormTitle] = useState('ON DUTY REQUISITION FORM');

  /* ── Shared PDF Builder ─────────────────────────────────── */
  const buildPDF = async (doc: jsPDF) => {
    /* Header image occupying very top part: y = 5 instead of 15 */
    let imgBase64 = '';
    try { imgBase64 = await getBase64Image(headerImage); } catch (_) {}
    if (imgBase64) {
      doc.addImage(imgBase64, 'PNG', 15, 5, 180, 32);
    } else {
      doc.setFont('Helvetica', 'bold').setFontSize(14);
      doc.text('SRI RAMAKRISHNA ENGINEERING COLLEGE', 105, 15, { align: 'center' });
      doc.setFontSize(9);
      doc.text('[Educational Service : SNR Sons Charitable Trust]', 105, 20, { align: 'center' });
      doc.text('Vattamalaipalayam, N.G.G.O. Colony Post, Coimbatore – 641022.', 105, 25, { align: 'center' });
    }

    /* Title or Department + Title (shifted up due to header change) */
    if (odSubCategory === 'SAC OD') {
      doc.setFont('Helvetica', 'bold').setFontSize(13);
      doc.text('STUDENT AFFAIRS CLUB', 105, 48, { align: 'center' });
      doc.setLineWidth(0.5).line(68, 50, 142, 50);
    } else {
      doc.setFont('Helvetica', 'bold').setFontSize(11);
      doc.text(deptName.trim().toUpperCase(), 105, 42, { align: 'center' });
      doc.setFontSize(12);
      doc.text(formTitle.trim().toUpperCase(), 105, 49, { align: 'center' });
      doc.setLineWidth(0.5).line(68, 51, 142, 51);
    }

    /* Helper: draw a field line with dashed placeholder when empty */
    const field = (label: string, value: string, y: number) => {
      doc.setFont('Helvetica', 'bold').setFontSize(11);
      doc.text(label, 15, y);
      const lw = doc.getTextWidth(label);
      const startX = 15 + lw + 1;

      if (value.trim()) {
        doc.setFont('Helvetica', 'normal');
        doc.text(value.trim(), startX + 1, y);
      }

      doc.setLineWidth(0.2);
      doc.setLineDashPattern(value.trim() ? [] : [1, 1.5], 0);
      doc.line(startX, y + 1.5, 195, y + 1.5);
      doc.setLineDashPattern([], 0);
    };

    field('Name of the Event/Purpose: ', eventName,         61);
    field('Date and timing of the Event: ', eventDate,      70);
    field('Venue: ', venue,                                  80);
    field('Faculty Co-ordinator: ', facultyCoordinator,     90);

    /* Signature line */
    doc.setFont('Helvetica', 'bold').setFontSize(11);
    doc.text('Signature: ', 15, 100);
    doc.setLineWidth(0.2).setLineDashPattern([1, 1.5], 0);
    doc.line(35, 101.5, 75, 101.5);
    doc.setLineDashPattern([], 0);

    /* Student Details table header */
    doc.setFont('Helvetica', 'bold').setFontSize(11);
    doc.text('Student Details:', 15, 112);

    const tableTop   = 117;
    const rowH       = 9;
    const cols       = [15, 35, 65, 25, 40]; // widths in mm
    const colLabels  = ['S.No.', 'Roll.No', 'Name', 'Year', 'Class'];
    const tableW     = cols.reduce((a, b) => a + b, 0); // = 180

    /* Header row background & text */
    doc.setFillColor(235, 240, 245);
    doc.rect(15, tableTop, tableW, rowH, 'F');
    doc.setFont('Helvetica', 'bold').setFontSize(9.5).setTextColor(30, 30, 30);
    let cx = 15;
    for (let i = 0; i < colLabels.length; i++) {
      const tw = doc.getTextWidth(colLabels[i]);
      doc.text(colLabels[i], cx + (cols[i] - tw) / 2, tableTop + 6);
      cx += cols[i];
    }

    /* Empty data rows — exactly `studentCount` rows */
    doc.setFont('Helvetica', 'normal').setFontSize(9).setTextColor(0, 0, 0);
    const count = Math.max(1, studentCount);
    for (let r = 0; r < count; r++) {
      const ry = tableTop + rowH + r * rowH;
      const sn = (r + 1).toString();
      const sw = doc.getTextWidth(sn);
      doc.text(sn, 15 + (cols[0] - sw) / 2, ry + 6);
    }

    /* Grid borders */
    const tableBottom = tableTop + rowH + count * rowH;
    doc.setLineWidth(0.3).setDrawColor(60, 60, 60);

    // horizontal lines
    for (let y = tableTop; y <= tableBottom; y += rowH) {
      doc.line(15, y, 195, y);
    }
    doc.line(15, tableBottom, 195, tableBottom);

    // vertical lines
    let vx = 15;
    for (let i = 0; i <= cols.length; i++) {
      doc.line(vx, tableTop, vx, tableBottom);
      if (i < cols.length) vx += cols[i];
    }

    /* Total students */
    const totalY = tableBottom + 11;
    doc.setFont('Helvetica', 'bold').setFontSize(10).setTextColor(0, 0, 0);
    const totalLabel = `Total number of students: ${count}`;
    doc.text(totalLabel, 15, totalY);

    /* Date and Time at bottom left */
    const now = new Date();
    const dateTimeStr = `Generated on: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
    doc.setFont('Helvetica', 'normal').setFontSize(8).setTextColor(100, 100, 100);
    doc.text(dateTimeStr, 15, 287);

    /* Signatures — bold roles text */
    const sigY = Math.max(totalY + 30, 248);
    doc.setFont('Helvetica', 'bold').setFontSize(10).setTextColor(0, 0, 0);

    if (odSubCategory === 'SAC OD') {
      doc.text('Club Admin', 45, sigY, { align: 'center' });
      doc.text('Dr.K.Balamurugan', 45, sigY + 6, { align: 'center' });

      doc.text('Dean SAC', 160, sigY, { align: 'center' });
      doc.text('Dr.P.Perumal', 160, sigY + 6, { align: 'center' });
    } else {
      doc.text('Tutor', 35, sigY, { align: 'center' });
      doc.text('Academic Coordinator', 105, sigY, { align: 'center' });
      doc.text('HOD', 175, sigY, { align: 'center' });
    }
  };

  /* ── Download PDF Action ───────────────────────────────── */
  const handleDownloadPDF = async () => {
    setGenerating(true);
    try {
      const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      await buildPDF(doc);
      doc.save(`OD_Form_${Date.now()}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setGenerating(false);
    }
  };

  /* ── Preview PDF Action ────────────────────────────────── */
  const handlePreviewPDF = async () => {
    setGenerating(true);
    try {
      const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      await buildPDF(doc);
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      console.error('Preview error:', err);
    } finally {
      setGenerating(false);
    }
  };

  /* ── UI Styles ─────────────────────────────────────────── */
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 8,
    background: 'var(--card-bg)',
    border: '1px solid var(--card-border)',
    color: 'var(--text-primary)',
    fontSize: 12,
    outline: 'none',
    boxSizing: 'border-box'
  };

  const labelStyle: React.CSSProperties = {
    fontWeight: 700,
    fontSize: 11,
    color: 'var(--text-muted)',
    display: 'block',
    marginBottom: 5
  };

  return (
    <div style={{ padding: 16, maxWidth: 560, margin: '0 auto' }}>

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
        <button
          onClick={onBack}
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--card-border)',
            borderRadius: '50%',
            width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-primary)'
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            OD Form Request
          </h2>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
            Fill details and generate the On-Duty request PDF
          </p>
        </div>
      </div>

      {/* ── Form Card ── */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--card-border)',
        borderRadius: 16,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}>

        {/* Section label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--card-border)', paddingBottom: 10 }}>
          <FileText size={16} color="#4f46e5" />
          <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--text-primary)' }}>📄 OD Requisition Form Builder</span>
        </div>

        {/* OD Category */}
        <div>
          <label style={labelStyle}>OD Category</label>
          <select
            value={odType}
            onChange={e => {
              setOdType(e.target.value as any);
              setOdSubCategory('SAC OD');
            }}
            style={inputStyle}
          >
            <option value="Internal OD">Internal OD</option>
            <option value="External OD">External OD</option>
          </select>
        </div>

        {/* Sub-Category — SAC OD under Internal/External OD */}
        <div>
          <label style={labelStyle}>Sub-Category</label>
          <select
            value={odSubCategory}
            onChange={e => setOdSubCategory(e.target.value as any)}
            style={inputStyle}
          >
            <option value="SAC OD">SAC OD (Student Affairs Club)</option>
            <option value="Other">Other Requisition / Event</option>
          </select>
        </div>

        {/* Other OD extra options */}
        {odSubCategory === 'Other' && (
          <>
            <div>
              <label style={labelStyle}>Department Name</label>
              <input
                type="text"
                value={deptName}
                onChange={e => setDeptName(e.target.value)}
                placeholder="e.g. DEPARTMENT OF ELECTRICAL AND ELECTRONICS ENGINEERING"
                style={inputStyle}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Title of the Form</label>
              <input
                type="text"
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                placeholder="e.g. ON DUTY REQUISITION FORM"
                style={inputStyle}
                required
              />
            </div>
          </>
        )}

        {/* Divider */}
        <div style={{ borderTop: '1px dashed var(--card-border)' }} />

        {/* Event Name */}
        <div>
          <label style={labelStyle}>Name of the Event / Purpose</label>
          <input
            type="text"
            value={eventName}
            onChange={e => setEventName(e.target.value)}
            placeholder="e.g. Science Exhibition, Paper Presentation"
            style={inputStyle}
            required
          />
        </div>

        {/* Date & Timing */}
        <div>
          <label style={labelStyle}>Date and Timing of the Event</label>
          <input
            type="text"
            value={eventDate}
            onChange={e => setEventDate(e.target.value)}
            placeholder="e.g. 15th Aug 2026, 9:00 AM – 5:00 PM"
            style={inputStyle}
            required
          />
        </div>

        {/* Venue */}
        <div>
          <label style={labelStyle}>Venue</label>
          <input
            type="text"
            value={venue}
            onChange={e => setVenue(e.target.value)}
            placeholder="e.g. SREC Main Auditorium, PSG College"
            style={inputStyle}
            required
          />
        </div>

        {/* Faculty Co-ordinator */}
        <div>
          <label style={labelStyle}>Faculty Co-ordinator</label>
          <input
            type="text"
            value={facultyCoordinator}
            onChange={e => setFacultyCoordinator(e.target.value)}
            placeholder="e.g. Dr. K. Balamurugan"
            style={inputStyle}
            required
          />
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px dashed var(--card-border)' }} />

        {/* Student Count */}
        <div>
          <label style={labelStyle}>Number of Students</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Minus button */}
            <button
              type="button"
              onClick={() => setStudentCount(c => Math.max(1, c - 1))}
              style={{
                width: 36, height: 36,
                borderRadius: '50%',
                background: 'var(--bg-primary)',
                border: '1.5px solid var(--card-border)',
                color: 'var(--text-primary)',
                fontSize: 20, lineHeight: 1,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700
              }}
            >−</button>

            {/* Count input */}
            <input
              type="number"
              min={1}
              max={100}
              value={studentCount}
              onChange={e => setStudentCount(Math.max(1, parseInt(e.target.value) || 1))}
              style={{
                width: 72,
                padding: '8px 0',
                borderRadius: 8,
                background: 'var(--card-bg)',
                border: '1.5px solid var(--accent-light, #6366f1)',
                color: 'var(--text-primary)',
                fontSize: 18,
                fontWeight: 800,
                textAlign: 'center',
                outline: 'none'
              }}
            />

            {/* Plus button */}
            <button
              type="button"
              onClick={() => setStudentCount(c => Math.min(100, c + 1))}
              style={{
                width: 36, height: 36,
                borderRadius: '50%',
                background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
                border: 'none',
                color: '#fff',
                fontSize: 20,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700
              }}
            >+</button>

            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
              {studentCount} empty row{studentCount !== 1 ? 's' : ''} will be in the PDF
            </span>
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          {/* Preview PDF */}
          <button
            type="button"
            onClick={handlePreviewPDF}
            disabled={generating}
            style={{
              flex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              padding: '12px 14px',
              borderRadius: 10,
              background: 'var(--bg-primary)',
              border: '1.5px solid var(--card-border)',
              color: 'var(--text-primary)',
              fontSize: 12, fontWeight: 700,
              cursor: generating ? 'not-allowed' : 'pointer',
              opacity: generating ? 0.7 : 1
            }}
          >
            <Eye size={15} /> Preview PDF
          </button>

          {/* Download PDF */}
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={generating}
            style={{
              flex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              padding: '12px 14px',
              borderRadius: 10,
              background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
              border: 'none',
              color: '#fff',
              fontSize: 12, fontWeight: 700,
              cursor: generating ? 'not-allowed' : 'pointer',
              opacity: generating ? 0.7 : 1
            }}
          >
            <Download size={15} /> {generating ? 'Generating…' : 'Download PDF'}
          </button>

          {/* Cancel */}
          <button
            type="button"
            onClick={onBack}
            style={{
              padding: '12px 14px',
              borderRadius: 10,
              background: 'transparent',
              border: '1.5px solid var(--card-border)',
              color: 'var(--text-muted)',
              fontSize: 12, fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
