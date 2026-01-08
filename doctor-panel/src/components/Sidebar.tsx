// ============================================
// FILE: src/components/Sidebar.tsx
// ============================================
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, TrendingUp, LayoutDashboard, X, MessageCircle, CheckSquare } from 'lucide-react';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeTab: string;
}

function Sidebar({ sidebarOpen, setSidebarOpen, activeTab }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { id: 'assigned', label: 'Assigned Users', icon: Users, path: '/assigned' },
    { id: 'progress', label: 'Progress Report', icon: TrendingUp, path: '/progress' },
    { id: 'tasks', label: 'My Tasks', icon: CheckSquare, path: '/tasks' },
    { id: 'messages', label: 'Messages', icon: MessageCircle, path: '/messages' }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setSidebarOpen(false);
  };

  // Get current path to determine active tab
  const currentPath = location.pathname;
  const getActiveTabId = () => {
    const activeItem = menuItems.find(item => item.path === currentPath);
    return activeItem?.id || 'dashboard';
  };

  return (
    <>
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-blue-600 to-blue-800 text-white transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Doctor Panel</h2>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white">
              <X size={24} />
            </button>
          </div>
          <nav className="space-y-2">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = getActiveTabId() === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition ${isActive ? 'bg-white text-blue-600' : 'hover:bg-blue-700'}`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
      
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </>
  );
};

export default Sidebar;

