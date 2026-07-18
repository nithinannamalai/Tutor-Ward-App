import React, { useState } from 'react';
import type { Announcement } from '../services/db';
import { Megaphone, Calendar, Trophy, FileText, Plus, X } from 'lucide-react';

interface AnnouncementBannerProps {
  announcements: Announcement[];
  isAdmin: boolean;
  onAddAnnouncement: (announcement: Omit<Announcement, 'id'>) => void;
}

export const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({
  announcements,
  isAdmin,
  onAddAnnouncement
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedPoster, setSelectedPoster] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState<'exam' | 'hackathon' | 'event' | 'general'>('general');
  const [newDate, setNewDate] = useState('');
  const [newPosterUrl, setNewPosterUrl] = useState('');

  if (announcements.length === 0 && !isAdmin) {
    return (
      <div className="announcement-card" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Megaphone size={28} className="text-muted" style={{ marginBottom: 6 }} />
        <p className="ann-content">No new announcements at this time.</p>
      </div>
    );
  }

  const current = announcements[activeIndex];

  const handleNext = (index: number) => {
    setActiveIndex(index);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent || !newDate) return;
    
    onAddAnnouncement({
      title: newTitle,
      content: newContent,
      type: newType,
      date: newDate,
      posterUrl: newPosterUrl || undefined
    });

    // Reset
    setNewTitle('');
    setNewContent('');
    setNewType('general');
    setNewDate('');
    setNewPosterUrl('');
    setShowAddModal(false);
  };

  // Quick helper to draw a simple default poster via SVG if none provided for hackathon/events
  const viewPoster = (ann: Announcement) => {
    if (ann.posterUrl) {
      setSelectedPoster(ann.posterUrl);
    } else {
      // Generate a quick premium SVG gradient poster
      const svgPoster = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"><rect width="100%" height="100%" fill="url(%23g)"/><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%231e1b4b" /><stop offset="100%" style="stop-color:%23311042" /></linearGradient></defs><text x="50%" y="40%" dominant-baseline="middle" text-anchor="middle" fill="%23f59e0b" font-family="sans-serif" font-weight="bold" font-size="22">${ann.title.toUpperCase()}</text><text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" fill="%23cbd5e1" font-family="sans-serif" font-size="12">${ann.content.substring(0, 50)}...</text><text x="50%" y="85%" dominant-baseline="middle" text-anchor="middle" fill="%2338bdf8" font-family="sans-serif" font-weight="bold" font-size="11">DATE: ${ann.date}</text></svg>`;
      setSelectedPoster(svgPoster);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'exam': return <FileText size={16} />;
      case 'hackathon': return <Trophy size={16} />;
      case 'event': return <Calendar size={16} />;
      default: return <Megaphone size={16} />;
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h3 className="dashboard-grid-title" style={{ margin: 0 }}>Announcements</h3>
        {isAdmin && (
          <button 
            onClick={() => setShowAddModal(true)} 
            className="btn-secondary" 
            style={{ padding: '2px 8px', fontSize: 10, display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <Plus size={12} /> Add
          </button>
        )}
      </div>

      {announcements.length > 0 && (
        <div className="announcement-card">
          <div className="ann-header">
            <span className={`ann-badge ${current.type}`}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                {getIcon(current.type)}
                {current.type}
              </span>
            </span>
            <span className="ann-date">{current.date}</span>
          </div>

          <div>
            <h4 className="ann-title">{current.title}</h4>
            <p className="ann-content">{current.content}</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            {(current.type === 'hackathon' || current.type === 'event' || current.posterUrl) ? (
              <button 
                onClick={() => viewPoster(current)}
                className="btn-secondary" 
                style={{ padding: '3px 8px', fontSize: 10, borderColor: 'var(--accent-gold)', color: 'var(--accent-gold)' }}
              >
                View Poster
              </button>
            ) : <div />}

            <div className="ann-indicator-container" style={{ margin: 0 }}>
              {announcements.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`ann-indicator ${idx === activeIndex ? 'active' : ''}`}
                  onClick={() => handleNext(idx)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Poster Viewing Modal */}
      {selectedPoster && (
        <div className="poster-modal" onClick={() => setSelectedPoster(null)}>
          <div className="poster-content" onClick={e => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setSelectedPoster(null)}>
              <X size={16} />
            </button>
            <h3 style={{ fontSize: 14, fontWeight: '700', paddingRight: 20 }}>Event Details</h3>
            <img src={selectedPoster} alt="Announcement Poster" className="poster-image" />
            <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
              Tap anywhere outside the card to close.
            </p>
          </div>
        </div>
      )}

      {/* Add Announcement Modal */}
      {showAddModal && (
        <div className="poster-modal">
          <form className="poster-content" onSubmit={handleAddSubmit} style={{ gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 14, fontWeight: '700' }}>New Announcement</h3>
              <button type="button" className="close-modal-btn" style={{ position: 'static' }} onClick={() => setShowAddModal(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Announcement Title</label>
              <input 
                type="text" 
                value={newTitle} 
                onChange={e => setNewTitle(e.target.value)} 
                className="form-input" 
                placeholder="e.g. Hackathon Registration" 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Type</label>
              <select 
                value={newType} 
                onChange={e => setNewType(e.target.value as any)} 
                className="form-select"
              >
                <option value="general">General</option>
                <option value="exam">Exam</option>
                <option value="hackathon">Hackathon</option>
                <option value="event">Event</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Date</label>
              <input 
                type="date" 
                value={newDate} 
                onChange={e => setNewDate(e.target.value)} 
                className="form-input" 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Content</label>
              <textarea 
                value={newContent} 
                onChange={e => setNewContent(e.target.value)} 
                className="form-textarea" 
                rows={3} 
                placeholder="Details of the announcement..." 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Poster URL or SVG string (Optional)</label>
              <input 
                type="text" 
                value={newPosterUrl} 
                onChange={e => setNewPosterUrl(e.target.value)} 
                className="form-input" 
                placeholder="data:image/svg+xml;... or Web Image Link" 
              />
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: 8 }}>
              Publish Announcement
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
