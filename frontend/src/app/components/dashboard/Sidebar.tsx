import { LayoutDashboard, Calendar, MessageSquare, Utensils, ClipboardList, BookOpen, TrendingUp, Dumbbell, Activity, Calculator, Target, LogOut, Gift } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  onLogout?: () => void;
}

export function Sidebar({ onLogout }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', path: '/dashboard' },
    { icon: <Gift className="w-5 h-5" />, label: 'Referrals', path: '/dashboard/referrals' },
    { icon: <Calculator className="w-5 h-5" />, label: 'BMI Calculator', path: '/dashboard/bmi-calculator' },
    { icon: <Activity className="w-5 h-5" />, label: 'Update Health Profile', path: '/dashboard/health-profile' },
    { icon: <Utensils className="w-5 h-5" />, label: 'Personalized Diet', path: '/dashboard/personalized-diet' },
    { icon: <Dumbbell className="w-5 h-5" />, label: 'Workout Plans', path: '/dashboard/workout-plans' },
    { icon: <TrendingUp className="w-5 h-5" />, label: 'Progress Tracking', path: '/dashboard/progress-tracking' },
    { icon: <MessageSquare className="w-5 h-5" />, label: 'AI Coach Ria', badge: 1, path: '/dashboard/ai-coach' },
    { icon: <BookOpen className="w-5 h-5" />, label: 'Meal Planning', path: '/dashboard/meal-planning' },
    { icon: <Activity className="w-5 h-5" />, label: 'Health Insights', path: '/dashboard/health-insights' },
    { icon: <Calendar className="w-5 h-5" />, label: 'Dietitian Support', path: '/dashboard/dietitian-support' },
    { icon: <ClipboardList className="w-5 h-5" />, label: 'Weekly Check-ins', path: '/dashboard/weekly-checkins' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile menu overlay */}
      <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 hidden" id="sidebar-overlay"></div>
      
      <aside className="w-64 bg-white border-r border-gray-200 h-screen p-6 fixed left-0 top-0 z-50 transform -translate-x-full lg:translate-x-0 transition-transform duration-300 ease-in-out" id="sidebar">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
           
            <img
  src="/images/logo.png"
  alt="NUTREAZY Logo"
  className="h-8 lg:h-10 w-auto"
/>
          </div>
          <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg" id="close-sidebar">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => handleNavigation(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors relative text-left ${
                isActive(item.path)
                  ? 'bg-[#C5E17A] text-black'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {item.icon}
              <span className="text-sm lg:text-base">{item.label}</span>
              {item.badge && (
                <span className="absolute right-4 bg-[#FF6B4A] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-6 left-6 right-6">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm lg:text-base">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
