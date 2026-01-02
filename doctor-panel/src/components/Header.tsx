import React from 'react';
import { Menu, LogOut } from 'lucide-react';
import type { AdminUser } from '../types';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  user: AdminUser | null;
  onLogout: () => void;
}

function Header({ sidebarOpen, setSidebarOpen, user, onLogout }: HeaderProps) {
  // Get initials from user name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-white shadow-sm p-4 flex items-center justify-between lg:justify-between">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Menu size={24} />
      </button>

      <div className="flex items-center space-x-4">
        {/* User Info */}
        <div className="hidden sm:flex items-center space-x-3">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-800">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.category || 'Doctor'}
            </p>
          </div>
        </div>

        {/* User Avatar */}
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
          {user?.name ? getInitials(user.name) : 'U'}
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Logout"
        >
          <LogOut size={20} />
          <span className="hidden sm:inline text-sm">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;

