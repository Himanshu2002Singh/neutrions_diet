
import { LayoutDashboard, Calendar, MessageSquare, Utensils, ClipboardList, BookOpen, TrendingUp, Dumbbell, Activity, Calculator, Target } from 'lucide-react';

interface SidebarProps {
  activeView?: string;
  onViewChange?: (view: string) => void;
}

export function Sidebar({ activeView = 'featured', onViewChange }: SidebarProps) {


  const menuItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Featured Menu', view: 'featured', active: activeView === 'featured' },
    { icon: <Calculator className="w-5 h-5" />, label: 'BMI Calculator', view: 'bmi-calculator', active: activeView === 'bmi-calculator' },
    { icon: <Target className="w-5 h-5" />, label: 'Diet Generator', view: 'diet-generator', active: activeView === 'diet-generator' },
    { icon: <Activity className="w-5 h-5" />, label: 'Health Profile', view: 'health-profile', active: activeView === 'health-profile' },
    { icon: <Utensils className="w-5 h-5" />, label: 'Personalized Diet', view: 'personalized-diet', active: activeView === 'personalized-diet' },
    { icon: <TrendingUp className="w-5 h-5" />, label: 'Progress Tracking', view: 'progress-tracking', active: activeView === 'progress-tracking' },
    { icon: <MessageSquare className="w-5 h-5" />, label: 'AI Coach Ria', badge: 1, view: 'ai-coach', active: activeView === 'ai-coach' },
    { icon: <Dumbbell className="w-5 h-5" />, label: 'Workout Plans', view: 'workout-plans', active: activeView === 'workout-plans' },
    { icon: <BookOpen className="w-5 h-5" />, label: 'Meal Planning', view: 'meal-planning', active: activeView === 'meal-planning' },
    { icon: <Activity className="w-5 h-5" />, label: 'Health Insights', view: 'health-insights', active: activeView === 'health-insights' },
    { icon: <Calendar className="w-5 h-5" />, label: 'Dietitian Support', view: 'dietitian-support', active: activeView === 'dietitian-support' },
    { icon: <ClipboardList className="w-5 h-5" />, label: 'Weekly Check-ins', view: 'weekly-checkins', active: activeView === 'weekly-checkins' },
  ];


  return (
    <>
      {/* Mobile menu overlay */}
      <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 hidden" id="sidebar-overlay"></div>
      
      <aside className="w-64 bg-white border-r border-gray-200 h-screen p-6 fixed left-0 top-0 z-50 transform -translate-x-full lg:translate-x-0 transition-transform duration-300 ease-in-out" id="sidebar">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#C5E17A] rounded-lg flex items-center justify-center">
              <span className="text-xl">🥗</span>
            </div>
            <h1 className="text-xl font-bold">Neutrion Diet</h1>
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
              onClick={() => onViewChange?.(item.view)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors relative text-left ${
                item.active
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
      </aside>
    </>
  );
}
