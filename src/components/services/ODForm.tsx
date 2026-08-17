import React, { useState } from 'react';
import { ArrowLeft, FileText, Download, Eye } from 'lucide-react';
import { jsPDF } from 'jspdf';
import headerImage from '../../assets/srec-snr-header.png';

interface ODFormProps {
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
  onBack
}) => {
  // Form fields
  const [odType, setOdType] = useState<'External OD' | 'Internal OD'>('Internal OD');
  const [odSubCategory, setOdSubCategory] = useState<'SAC OD' | 'Other'>('SAC OD');
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [venue, setVenue] = useState('');
  const [facultyCoordinator, setFacultyCoordinator] = useState('');
  const [studentCount, setStudentCount] = useState(1);
  const [generating, setGenerating] = useState(false);

  // Additional fields for "Other" category
  const [deptName, setDeptName] = useState('DEPARTMENT OF ELECTRICAL AND ELECTRONICS ENGINEERING');
  const [formTitle, setFormTitle] = useState('ON DUTY REQUISITION FORM');

  /* ── Shared PDF Builder ─────────────────────────────────── */
  const buildPDF = async (doc: jsPDF) => {
    /* Header image occupying very top part: y = 5 instead of 15 */
    let imgBase64 = '';
    try { imgBase64 = await getBase64Image(headerImage); } catch (_) { }
    if (imgBase64) {
      doc.addImage(imgBase64, 'PNG', 10, 4, 128, 23);
    } else {
      doc.setFont('Helvetica', 'bold').setFontSize(10);
      doc.text('SRI RAMAKRISHNA ENGINEERING COLLEGE', 74, 10, { align: 'center' });
      doc.setFontSize(6.5);
      doc.text('[Educational Service : SNR Sons Charitable Trust]', 74, 14, { align: 'center' });
      doc.text('Vattamalaipalayam, N.G.G.O. Colony Post, Coimbatore – 641022.', 74, 18, { align: 'center' });
    }

    /* ── Header Banner Block (Scaled to A5) ──────────────────── */
    const bannerY = 28;
    const bannerH = 11;
    doc.setFillColor(15, 76, 129); // Premium Navy Blue
    doc.rect(10, bannerY, 128, bannerH, 'F');

    // Gold bottom border line
    doc.setFillColor(220, 160, 40);
    doc.rect(10, bannerY + bannerH - 1.2, 128, 1.2, 'F');

    // Banner Text
    doc.setTextColor(255, 255, 255);
    if (odSubCategory === 'SAC OD') {
      doc.setFont('Helvetica', 'bold').setFontSize(9.5);
      doc.text('STUDENT AFFAIRS CLUB', 74, bannerY + 4.5, { align: 'center' });
      doc.setFont('Helvetica', 'normal').setFontSize(6.5);
      doc.text('STUDENT ON-DUTY REQUISITION FORM', 74, bannerY + 7.8, { align: 'center' });
    } else {
      doc.setFont('Helvetica', 'bold').setFontSize(8.5);
      doc.text(formTitle.trim().toUpperCase(), 74, bannerY + 4.5, { align: 'center' });
      doc.setFont('Helvetica', 'normal').setFontSize(6.5);
      doc.text(deptName.trim().toUpperCase(), 74, bannerY + 7.8, { align: 'center' });
    }

    // Reset styles
    doc.setTextColor(0, 0, 0);
    doc.setDrawColor(0, 0, 0);

    /* ── Section Title Helper ───────────────────────────────── */
    const sectionHeader = (title: string, y: number) => {
      doc.setFont('Helvetica', 'bold').setFontSize(8.5).setTextColor(15, 76, 129);
      doc.text(title.toUpperCase(), 10, y);
      const tw = doc.getTextWidth(title.toUpperCase());
      doc.setFillColor(15, 76, 129);
      doc.rect(10, y + 1.2, tw, 0.6, 'F');
    };

    /* ── Field Underline Helper (Darker Lines) ──────────────── */
    const field = (label: string, value: string, y: number) => {
      doc.setFont('Helvetica', 'bold').setFontSize(7.5).setTextColor(50, 50, 50);
      doc.text(label, 14, y);
      const lw = doc.getTextWidth(label);
      const startX = 14 + lw + 1;

      const val = value.trim();
      if (val) {
        doc.setFont('Helvetica', 'normal').setTextColor(0, 0, 0);
        doc.text(val, startX + 1, y);

        // Underline only under the text, ending exactly at the end of text (darkened to 0.3 linewidth and dark gray)
        const valW = doc.getTextWidth(val);
        doc.setLineWidth(0.3);
        doc.setDrawColor(40, 40, 40);
        doc.line(startX + 1, y + 1.2, startX + 1 + valW, y + 1.2);
      } else {
        // Dashed placeholder line (darkened)
        doc.setLineWidth(0.3);
        doc.setDrawColor(100, 100, 100);
        doc.setLineDashPattern([1, 1.5], 0);
        doc.line(startX + 1, y + 1.2, startX + 1 + 45, y + 1.2);
        doc.setLineDashPattern([], 0);
      }
    };

    /* ── 1. Requisition Details ────────────────────────────── */
    sectionHeader('1. Requisition Details', 44);

    // Rounded card container box
    doc.setFillColor(250, 251, 253);
    doc.setDrawColor(220, 225, 230);
    doc.setLineWidth(0.3);
    doc.roundedRect(10, 48, 128, 45, 2, 2, 'FD');

    // Helper: draw a subtle row separator inside the card
    const rowSep = (y: number) => {
      doc.setLineWidth(0.2);
      doc.setDrawColor(210, 215, 220);
      doc.line(12, y, 136, y);
    };

    // Render Fields with separators between them
    field('Name of the Event/Purpose: ', eventName, 55);
    rowSep(59);
    field('Date and timing of the Event: ', eventDate, 63);
    rowSep(67);
    field('Venue: ', venue, 71);
    rowSep(75);
    field('Faculty Co-ordinator: ', facultyCoordinator, 79);
    rowSep(83);

    // Signature line inside card
    doc.setFont('Helvetica', 'bold').setFontSize(7.5).setTextColor(50, 50, 50);
    doc.text('Signature: ', 14, 87);
    doc.setLineWidth(0.3).setDrawColor(100, 100, 100).setLineDashPattern([1, 1.5], 0);
    doc.line(28, 88.2, 58, 88.2);
    doc.setLineDashPattern([], 0);

    /* ── 2. Student Details ────────────────────────────────── */
    sectionHeader('2. Student Details', 99);

    const tableTop = 104;
    const rowH = 7.5;
    const cols = [10, 25, 45, 18, 30]; // widths in mm (sum = 128)
    const colLabels = ['S.No.', 'Roll.No', 'Name', 'Year', 'Class'];

    /* Table Header */
    doc.setFillColor(15, 76, 129);
    doc.rect(10, tableTop, 128, rowH, 'F');
    doc.setFont('Helvetica', 'bold').setFontSize(7.5).setTextColor(255, 255, 255);
    let cx = 10;
    for (let i = 0; i < colLabels.length; i++) {
      const tw = doc.getTextWidth(colLabels[i]);
      doc.text(colLabels[i], cx + (cols[i] - tw) / 2, tableTop + 5.2);
      cx += cols[i];
    }

    /* Table Body Empty Rows */
    doc.setFont('Helvetica', 'normal').setFontSize(7.5).setTextColor(0, 0, 0);
    const count = Math.max(1, studentCount);
    for (let r = 0; r < count; r++) {
      const ry = tableTop + rowH + r * rowH;
      const sn = (r + 1).toString();
      const sw = doc.getTextWidth(sn);
      doc.text(sn, 10 + (cols[0] - sw) / 2, ry + 5.2);
    }

    /* Table Grid Borders (Darkened Lines) */
    const tableBottom = tableTop + rowH + count * rowH;

    // Outer table border box
    doc.setLineWidth(0.3).setDrawColor(15, 76, 129);
    doc.rect(10, tableTop, 128, tableBottom - tableTop);

    // Divider below header
    doc.line(10, tableTop + rowH, 138, tableTop + rowH);

    // Row lines (Darker dividers)
    doc.setLineWidth(0.3).setDrawColor(40, 40, 40);
    for (let r = 0; r < count - 1; r++) {
      const ry = tableTop + rowH + (r + 1) * rowH;
      doc.line(10, ry, 138, ry);
    }

    // Vertical dividers in table body (Darker dividers)
    let vx = 10;
    for (let i = 0; i < cols.length - 1; i++) {
      vx += cols[i];
      doc.line(vx, tableTop + rowH, vx, tableBottom);
    }

    /* Total Students Badge Bar */
    const totalY = tableBottom + 3;
    doc.setFillColor(240, 244, 248);
    doc.rect(10, totalY, 128, 6.5, 'F');
    doc.setFont('Helvetica', 'bold').setFontSize(7.5).setTextColor(15, 76, 129);
    doc.text(`TOTAL NUMBER OF STUDENTS: ${count}`, 14, totalY + 4.5);

    /* Signatures at bottom of A5 */
    const sigY = 182;
    doc.setFont('Helvetica', 'bold').setFontSize(7.5).setTextColor(0, 0, 0);

    if (odSubCategory === 'SAC OD') {
      doc.text('Club Admin', 42, sigY, { align: 'center' });
      doc.text('Dr.K.Balamurugan', 42, sigY + 4.5, { align: 'center' });

      doc.text('Dean SAC', 106, sigY, { align: 'center' });
      doc.text('Dr.P.Perumal', 106, sigY + 4.5, { align: 'center' });
    } else {
      doc.text('Tutor', 31, sigY, { align: 'center' });
      doc.text('Academic Coordinator', 74, sigY, { align: 'center' });
      doc.text('HOD', 117, sigY, { align: 'center' });
    }

    /* Date and Time at bottom left */
    const now = new Date();
    const dateTimeStr = `Generated on: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
    doc.setFont('Helvetica', 'normal').setFontSize(6.5).setTextColor(120, 120, 120);
    doc.text(dateTimeStr, 10, 203);
  };

  /* ── Download PDF Action ───────────────────────────────── */
  const handleDownloadPDF = async () => {
    setGenerating(true);
    try {
      const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a5' });
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
      const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a5' });
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
