import React from 'react';
import {
  Sparkles, BookOpen, Calendar, GraduationCap, Award, FileText,
  UserCheck, Inbox, Zap, Map, Shield, Phone
} from 'lucide-react';

export interface RouteCategoryItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
}

export interface RouteCategory {
  title: string;
  items: RouteCategoryItem[];
}

export const APP_CATEGORIES: RouteCategory[] = [
  {
    title: '🎓 ACADEMIC HUB',
    items: [
      { key: 'ai', label: 'AI Tutor', icon: React.createElement(Sparkles, { size: 24 }), color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)' },
      { key: 'courses', label: 'Syllabus', icon: React.createElement(BookOpen, { size: 24 }), color: '#0891b2', bg: 'rgba(8, 145, 178, 0.12)' },
      { key: 'calendar', label: 'Calendar', icon: React.createElement(Calendar, { size: 24 }), color: '#dc2626', bg: 'rgba(220, 38, 38, 0.12)' },
      { key: 'academics', label: 'CGPA', icon: React.createElement(GraduationCap, { size: 24 }), color: '#059669', bg: 'rgba(5, 150, 105, 0.12)' },
      { key: 'cgpa-calc', label: 'GPA Calc', icon: React.createElement(GraduationCap, { size: 24 }), color: '#0284c7', bg: 'rgba(2, 132, 199, 0.12)' },
      { key: 'nptel', label: 'NPTEL', icon: React.createElement(Award, { size: 24 }), color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.12)' },
      { key: 'timetable', label: 'Timetable', icon: React.createElement(Calendar, { size: 24 }), color: '#0f766e', bg: 'rgba(15, 118, 110, 0.12)' },
    ]
  },
  {
    title: '📂 RECORDS & DOCUMENTS',
    items: [
      { key: 'profile', label: 'Documents', icon: React.createElement(BookOpen, { size: 24 }), color: '#0052cc', bg: 'rgba(0, 82, 204, 0.12)' },
      { key: 'certificates', label: 'Certificates', icon: React.createElement(Award, { size: 24 }), color: '#be185d', bg: 'rgba(190, 24, 93, 0.12)' },
      { key: 'od-form', label: 'OD Form', icon: React.createElement(FileText, { size: 24 }), color: '#4f46e5', bg: 'rgba(79, 70, 229, 0.12)' },
      { key: 'request-letters', label: 'Bonafide / NOC', icon: React.createElement(FileText, { size: 24 }), color: '#0d9488', bg: 'rgba(13, 148, 136, 0.12)' },
    ]
  },
  {
    title: '⚡ STUDENT SERVICES & LABS',
    items: [
      { key: 'attendance', label: 'Attendance', icon: React.createElement(UserCheck, { size: 24 }), color: '#ff5f1f', bg: 'rgba(255, 95, 31, 0.12)' },
      { key: 'lab-finder', label: 'Lab Finder', icon: React.createElement(Map, { size: 24 }), color: '#d97706', bg: 'rgba(217, 119, 6, 0.12)' },
      { key: 'suggestion', label: 'Suggestions', icon: React.createElement(Inbox, { size: 24 }), color: '#ea580c', bg: 'rgba(234, 88, 12, 0.12)' },
    ]
  },
  {
    title: '🚀 CAREER & CAMPUS',
    items: [
      { key: 'career', label: 'Roadmaps', icon: React.createElement(Zap, { size: 24 }), color: '#d97706', bg: 'rgba(217, 119, 6, 0.12)' },
      { key: 'campus-map', label: 'Campus Map', icon: React.createElement(Map, { size: 24 }), color: '#2563eb', bg: 'rgba(37, 99, 235, 0.12)' },
      { key: 'college-rules', label: 'Rules', icon: React.createElement(Shield, { size: 24 }), color: '#16a34a', bg: 'rgba(22, 163, 74, 0.12)' },
      { key: 'faculty', label: 'Faculty', icon: React.createElement(Phone, { size: 24 }), color: '#db2777', bg: 'rgba(219, 39, 119, 0.12)' },
    ]
  }
];
