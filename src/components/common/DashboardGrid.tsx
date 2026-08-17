import React from 'react';
import { 
  User, 
  ClipboardCheck, 
  Award, 
  TrendingUp, 
  Briefcase, 
  CalendarRange 
} from 'lucide-react';

interface DashboardGridProps {
  onSelectTab: (tab: string) => void;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({ onSelectTab }) => {
  const menuItems = [
    {
      id: 'profile',
      name: 'Profile & Documents',
      icon: <User size={32} />,
      colorClass: 'profile'
    },
    {
      id: 'attendance',
      name: 'Period Attendance',
      icon: <ClipboardCheck size={32} />,
      colorClass: 'attendance'
    },
    {
      id: 'nptel',
      name: 'NPTEL Tracker',
      icon: <Award size={32} />,
      colorClass: 'nptel'
    },
    {
      id: 'academics',
      name: 'CGPA & Arrears',
      icon: <TrendingUp size={32} />,
      colorClass: 'academics'
    },
    {
      id: 'career',
      name: 'Career Roadmaps',
      icon: <Briefcase size={32} />,
      colorClass: 'career'
    },
    {
      id: 'courses',
      name: 'Courses & Calender',
      icon: <CalendarRange size={32} />,
      colorClass: 'courses'
    }
  ];

  return (
    <div>
      <h3 className="dashboard-grid-title">Department Portals</h3>
      <div className="dashboard-grid">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className="square-btn"
            onClick={() => onSelectTab(item.id)}
          >
            <div className="square-btn-icon-wrapper">
              {item.icon}
            </div>
            <span className="square-btn-name">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
