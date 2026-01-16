import { Search, SlidersHorizontal, Plus } from 'lucide-react';

interface User {
  name: string;
  email: string;
  avatar: string;
}

interface DashboardHeaderProps {
  user?: User | null;
  title?: string;
  onMenuClick?: () => void;
}

export function DashboardHeader({ user, title, onMenuClick }: DashboardHeaderProps) {
  // Use user data if available, otherwise show default
  const displayName = user?.name || 'Adam Vasyliev';
  const displayAvatar = user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop';
  
  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button 
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg" 
          id="menu-button"
          onClick={onMenuClick}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h2 className="text-xl lg:text-2xl font-bold">{title || 'Dashboard'}</h2>
      </div>
      
      <div className="flex items-center gap-2 lg:gap-4">
        {/* Search - Hidden on mobile */}
        <div className="relative hidden md:block">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search features"
            className="pl-10 pr-4 py-2 bg-gray-50 rounded-lg w-48 lg:w-80 focus:outline-none focus:ring-2 focus:ring-[#C5E17A]"
          />
        </div>
        
        <div className="flex items-center gap-2 lg:gap-4">
          <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors hidden sm:block">
            <SlidersHorizontal className="w-5 h-5 text-gray-600" />
          </button>
          <button className="bg-[#C5E17A] text-black px-3 lg:px-4 py-2 rounded-lg flex items-center gap-1 lg:gap-2 hover:opacity-90 transition-opacity text-sm lg:text-base">
            <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
            <span className="hidden sm:inline">Add</span>
          </button>
          
          {/* User profile - Always visible */}
          <div className="flex items-center gap-2 lg:gap-3">
            <img
              src={displayAvatar}
              alt={displayName}
              className="w-8 h-8 lg:w-10 lg:h-10 rounded-full"
            />
            <div className="hidden lg:block">
              <p className="font-semibold text-sm">{displayName}</p>
              <p className="text-xs text-gray-500">User</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
