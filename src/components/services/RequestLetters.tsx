import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/db';
import type { LetterRequest } from '../../services/db';
import { ArrowLeft, FileText, Clock, CheckCircle2, XCircle, Upload, Download, Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react';

interface RequestLettersProps {
  currentEmail: string;
  currentName: string;
  currentRollNo: string;
  isAdmin: boolean;
  onBack: () => void;
}

const LETTER_TYPES: LetterRequest['letterType'][] = [
  'Bonafide',
  'NOC',
  'Internship Request',
  'Course Completion'
];

const STATUS_CONFIG = {
  Pending:  { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: <Clock size={14} /> },
  Approved: { color: '#4ade80', bg: 'rgba(74,222,128,0.12)', icon: <CheckCircle2 size={14} /> },
  Rejected: { color: '#f87171', bg: 'rgba(248,113,113,0.12)', icon: <XCircle size={14} /> }
};

export const RequestLetters: React.FC<RequestLettersProps> = ({
  currentEmail,
  currentName,
  currentRollNo,
  isAdmin,
  onBack
}) => {
  const [requests, setRequests] = useState<LetterRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Student form state
  const [showForm, setShowForm] = useState(false);
  const [letterType, setLetterType] = useState<LetterRequest['letterType']>('Bonafide');
  const [purpose, setPurpose] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Admin state
  const [adminRemarks, setAdminRemarks] = useState<Record<string, string>>({});
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, [currentEmail, isAdmin]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const list = isAdmin
        ? await dbService.getLetterRequests()
        : await dbService.getLetterRequests(currentEmail);
      setRequests(list.sort((a, b) => b.requestedAt.localeCompare(a.requestedAt)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purpose.trim() || !details.trim()) return;
    setSubmitting(true);
    setStatusMsg('');

    const newReq: LetterRequest = {
      id: `lr-${Date.now()}`,
      studentEmail: currentEmail,
      studentName: currentName,
      rollNo: currentRollNo,
      letterType,
      purpose: purpose.trim(),
      details: details.trim(),
      status: 'Pending',
      requestedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    try {
      await dbService.saveLetterRequest(newReq);
      setStatusMsg('Request submitted successfully!');
      setTimeout(() => setStatusMsg(''), 3000);
      setPurpose('');
      setDetails('');
      setShowForm(false);
      loadRequests();
    } catch (err) {
      console.error(err);
      setStatusMsg('Error submitting request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (req: LetterRequest, status: LetterRequest['status']) => {
    const remarks = adminRemarks[req.id] || '';
    const updated: LetterRequest = { ...req, status, adminRemarks: remarks };
    try {
      await dbService.saveLetterRequest(updated);
      setStatusMsg(`Request ${status.toLowerCase()}!`);
      setTimeout(() => setStatusMsg(''), 2500);
      loadRequests();
    } catch (err) {
      console.error(err);
      setStatusMsg('Error updating status.');
    }
  };

  const handleUploadSignedLetter = (e: React.ChangeEvent<HTMLInputElement>, req: LetterRequest) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setStatusMsg('Only PDF documents are supported.');
      return;
    }
    setUploadingFor(req.id);
    setStatusMsg('');

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      const updated: LetterRequest = { ...req, status: 'Approved', pdfUrl: base64, adminRemarks: adminRemarks[req.id] || req.adminRemarks || '' };
      try {
        await dbService.saveLetterRequest(updated);
        setStatusMsg('Signed letter uploaded & request approved!');
        setTimeout(() => setStatusMsg(''), 3000);
        loadRequests();
      } catch (err) {
        console.error(err);
        setStatusMsg('Error uploading letter.');
      } finally {
        setUploadingFor(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadLetter = (req: LetterRequest) => {
    if (!req.pdfUrl) return;
    const link = document.createElement('a');
    link.href = req.pdfUrl;
    link.download = `${req.letterType.replace(/\s+/g, '_')}_Letter_${req.rollNo}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteRequest = async (id: string) => {
    if (!window.confirm('Delete this letter request?')) return;
    try {
      await dbService.deleteLetterRequest(id);
      setStatusMsg('Request deleted.');
      setTimeout(() => setStatusMsg(''), 2500);
      loadRequests();
    } catch (err) {
      console.error(err);
      setStatusMsg('Error deleting request.');
    }
  };

  const pendingCount = requests.filter(r => r.status === 'Pending').length;

  return (
    <div className="panel-view">
      <div className="panel-header">
        <button onClick={onBack} className="back-btn">
          <ArrowLeft size={20} />
        </button>
        <span className="panel-title">
          {isAdmin ? 'Letter Request Manager' : 'Request Letters'}
        </span>
      </div>

      <div className="panel-body">
        {statusMsg && (
          <div style={{ padding: 8, background: '#eff6ff', border: '1px solid rgba(0,82,204,0.2)', borderRadius: 6, fontSize: 11, textAlign: 'center', color: '#0052cc', fontWeight: 700, marginBottom: 4 }}>
            {statusMsg}
          </div>
        )}

        {/* ── STUDENT VIEW ── */}
        {!isAdmin && (
          <>
            {/* Summary Header Card */}
            <div style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: '2px solid rgba(0,82,204,0.18)', borderRadius: 14, padding: '14px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 4 }}>Letters Requested</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{requests.length}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 4 }}>Awaiting Approval</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: pendingCount > 0 ? '#d97706' : '#059669' }}>{pendingCount}</div>
              </div>
            </div>

            {/* New Request Button */}
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-primary"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 14 }}
            >
              <Plus size={16} />
              New Letter Request
            </button>

            {/* Request Form */}
            {showForm && (
              <form onSubmit={handleSubmitRequest} style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: 14, border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 14, animation: 'slideDown 0.2s ease' }}>
                <h4 style={{ fontSize: 13, fontWeight: 800, margin: 0 }}>✉️ New Letter Request</h4>

                <div className="form-group">
                  <label className="form-label">Letter Type</label>
                  <select
                    value={letterType}
                    onChange={e => setLetterType(e.target.value as LetterRequest['letterType'])}
                    className="form-select"
                    style={{ fontSize: 12 }}
                  >
                    {LETTER_TYPES.map(t => <option key={t} value={t}>{t} Letter</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Purpose</label>
                  <input
                    type="text"
                    value={purpose}
                    onChange={e => setPurpose(e.target.value)}
                    className="form-input"
                    placeholder="e.g. Bank Loan, Passport Application, Internship at Siemens"
                    required
                    style={{ fontSize: 12 }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Additional Details</label>
                  <textarea
                    value={details}
                    onChange={e => setDetails(e.target.value)}
                    className="form-input"
                    placeholder="Any specific information the HOD office should know..."
                    required
                    rows={3}
                    style={{ fontSize: 12, resize: 'vertical', fontFamily: 'inherit' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="submit" className="btn-primary" style={{ flex: 1, fontSize: 12 }} disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary" style={{ fontSize: 12 }}>
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* My Requests List */}
            <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>My Requests</h4>
            {loading ? (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>Loading...</p>
            ) : requests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
                <FileText size={36} style={{ opacity: 0.3, marginBottom: 8 }} />
                <p style={{ fontSize: 12 }}>No letter requests yet. Submit one above!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {requests.map(req => {
                  const cfg = STATUS_CONFIG[req.status];
                  const isExpanded = expandedId === req.id;
                  return (
                    <div key={req.id} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--card-border)', borderRadius: 12, overflow: 'hidden' }}>
                      <div
                        onClick={() => setExpandedId(isExpanded ? null : req.id)}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', cursor: 'pointer' }}
                      >
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                          <div style={{ background: 'rgba(79,70,229,0.12)', color: '#818cf8', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <FileText size={15} />
                          </div>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)' }}>{req.letterType} Letter</div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{req.requestedAt}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: cfg.bg, color: cfg.color, display: 'flex', alignItems: 'center', gap: 4 }}>
                            {cfg.icon}{req.status}
                          </span>
                          {isExpanded ? <ChevronUp size={14} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />}
                        </div>
                      </div>

                      {isExpanded && (
                        <div style={{ padding: '0 14px 14px', borderTop: '1px solid var(--card-border)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <div>
                            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--text-muted)', marginBottom: 2 }}>Purpose</div>
                            <div style={{ fontSize: 12, color: 'var(--text-main)' }}>{req.purpose}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--text-muted)', marginBottom: 2 }}>Details</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>{req.details}</div>
                          </div>
                          {req.adminRemarks && (
                            <div style={{ background: 'rgba(56,189,248,0.08)', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(56,189,248,0.18)' }}>
                              <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: '#38bdf8', marginBottom: 2 }}>Admin Remarks</div>
                              <div style={{ fontSize: 11, color: 'var(--text-main)' }}>{req.adminRemarks}</div>
                            </div>
                          )}
                          {req.status === 'Approved' && req.pdfUrl && (
                            <button
                              onClick={() => handleDownloadLetter(req)}
                              className="btn-primary"
                              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12, padding: '8px 12px', background: '#059669' }}
                            >
                              <Download size={14} />
                              Download Signed Letter
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── ADMIN VIEW ── */}
        {isAdmin && (
          <>
            {/* Admin Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
              {(['Pending', 'Approved', 'Rejected'] as LetterRequest['status'][]).map(s => {
                const cfg = STATUS_CONFIG[s];
                const count = requests.filter(r => r.status === s).length;
                return (
                  <div key={s} style={{ background: cfg.bg, border: `1px solid ${cfg.color}33`, borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: cfg.color }}>{count}</div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: cfg.color, textTransform: 'uppercase', letterSpacing: 0.8 }}>{s}</div>
                  </div>
                );
              })}
            </div>

            <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>All Student Requests</h4>
            {loading ? (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>Loading...</p>
            ) : requests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
                <FileText size={36} style={{ opacity: 0.3, marginBottom: 8 }} />
                <p style={{ fontSize: 12 }}>No letter requests received yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {requests.map(req => {
                  const cfg = STATUS_CONFIG[req.status];
                  const isExpanded = expandedId === req.id;
                  return (
                    <div key={req.id} style={{ background: 'var(--bg-secondary)', border: `1.5px solid ${req.status === 'Pending' ? '#f59e0b44' : 'var(--card-border)'}`, borderRadius: 14, overflow: 'hidden', transition: 'box-shadow 0.2s' }}>
                      {/* Card Header */}
                      <div
                        onClick={() => setExpandedId(isExpanded ? null : req.id)}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', cursor: 'pointer' }}
                      >
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: `hsl(${req.studentName.charCodeAt(0) * 4}, 55%, 80%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#111', flexShrink: 0 }}>
                            {req.studentName.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)' }}>{req.studentName}</div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{req.rollNo} · {req.letterType} · {req.requestedAt}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 7px', borderRadius: 5, background: cfg.bg, color: cfg.color, display: 'flex', alignItems: 'center', gap: 3 }}>
                            {cfg.icon}{req.status}
                          </span>
                          {isExpanded ? <ChevronUp size={13} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} />}
                        </div>
                      </div>

                      {/* Expanded Admin Body */}
                      {isExpanded && (
                        <div style={{ padding: '0 14px 14px', borderTop: '1px solid var(--card-border)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            <div>
                              <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 2 }}>Purpose</div>
                              <div style={{ fontSize: 12, color: 'var(--text-main)' }}>{req.purpose}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 2 }}>Student Email</div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)', wordBreak: 'break-all' }}>{req.studentEmail}</div>
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 2 }}>Student Details</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>{req.details}</div>
                          </div>

                          {/* Admin Remarks Input */}
                          <div>
                            <label style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Admin Remarks</label>
                            <textarea
                              value={adminRemarks[req.id] ?? (req.adminRemarks || '')}
                              onChange={e => setAdminRemarks(prev => ({ ...prev, [req.id]: e.target.value }))}
                              className="form-input"
                              placeholder="Add remarks for the student..."
                              rows={2}
                              style={{ fontSize: 11, resize: 'vertical', fontFamily: 'inherit' }}
                            />
                          </div>

                          {/* Upload Signed Letter */}
                          <div style={{ background: 'var(--bg-tertiary)', padding: '8px 10px', borderRadius: 8, border: '1px dashed var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            {req.pdfUrl ? (
                              <>
                                <span style={{ fontSize: 10, color: '#4ade80', fontWeight: 700 }}>✅ Signed PDF Available</span>
                                <button onClick={() => handleDownloadLetter(req)} className="doc-action-btn" style={{ padding: 4 }} title="Download">
                                  <Download size={14} />
                                </button>
                              </>
                            ) : (
                              <>
                                <span style={{ fontSize: 10, color: 'var(--text-muted)', fontStyle: 'italic' }}>No signed letter uploaded</span>
                                <label className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 10, padding: '3px 8px', borderRadius: 6 }}>
                                  {uploadingFor === req.id ? 'Uploading...' : <><Upload size={12} />Upload Signed PDF</>}
                                  <input
                                    type="file"
                                    accept="application/pdf"
                                    onChange={e => handleUploadSignedLetter(e, req)}
                                    style={{ display: 'none' }}
                                    disabled={uploadingFor !== null}
                                  />
                                </label>
                              </>
                            )}
                          </div>

                          {/* Approve / Reject Actions */}
                          <div style={{ display: 'flex', gap: 8 }}>
                            {req.status !== 'Approved' && (
                              <button
                                onClick={() => handleUpdateStatus(req, 'Approved')}
                                style={{ flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: '1.5px solid #4ade80', background: 'rgba(74,222,128,0.1)', color: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
                              >
                                <CheckCircle2 size={13} /> Approve
                              </button>
                            )}
                            {req.status !== 'Rejected' && (
                              <button
                                onClick={() => handleUpdateStatus(req, 'Rejected')}
                                style={{ flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: '1.5px solid #f87171', background: 'rgba(248,113,113,0.1)', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
                              >
                                <XCircle size={13} /> Reject
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteRequest(req.id)}
                              style={{ padding: '8px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: '1.5px solid var(--card-border)', background: 'transparent', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              title="Delete Request"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
