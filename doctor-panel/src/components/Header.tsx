// ============================================
// FILE: src/components/Header.tsx
// ============================================
import React from 'react';
import { Menu } from 'lucide-react';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
  return (
    <header className="bg-white shadow-sm p-4 flex items-center justify-between lg:justify-end">
      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-gray-600 hover:text-gray-900">
        <Menu size={24} />
      </button>
      <div className="flex items-center space-x-4">
        <span className="text-gray-700">Dr. Sharma</span>
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
          DS
        </div>
      </div>
    </header>
  );
};

export default Header;