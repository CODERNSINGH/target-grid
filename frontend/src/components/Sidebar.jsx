import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Trophy, 
  Activity, 
  Settings, 
  Target
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  
  const navItems = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/leads', icon: Users, label: 'Targeted customers' },
    { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    { to: '/events', icon: Activity, label: 'Events' },
    { to: '/scoring-rules', icon: Settings, label: 'Scoring Rules' },
  ];

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">tg</span>
          </div>
          <h1 className="text-lg font-semibold text-gray-900">TargetGrid</h1>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto">
        <div className="p-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to || 
              (item.to === '/leads' && location.pathname.startsWith('/leads'));
            
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center px-3 py-2 mt-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-4 h-4 mr-3" />
                {item.label}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;