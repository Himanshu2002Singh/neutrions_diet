import { useState, useEffect } from 'react';
import { LayoutDashboard, Calendar, Utensils, ClipboardList, TrendingUp, Dumbbell, Activity, Target, LogOut, Gift, Flame, Clock, DollarSign } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiService from '../../../services/api';

interface SidebarProps {
  onLogout?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  onNavigate?: (path: string) => void;
}

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  badge?: number;
}

interface DietSummary {
  dietPlan: {
    hasPlan: boolean;
    planName: string | null;
    goals: string[];
  };
  calories: {
    target: number;
    consumed: number;
    remaining: number;
    compliance: number;
  };
  nextMeal: {
    mealType: string;
    time: string;
    title: string;
  } | null;
}

export function Sidebar({ onLogout, isOpen = false, onClose, onNavigate }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [dietSummary, setDietSummary] = useState<DietSummary | null>(null);
  const [loadingDiet, setLoadingDiet] = useState(true);

  const menuItems: MenuItem[] = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', path: '/dashboard' },
    { icon: <Gift className="w-5 h-5" />, label: 'Referrals', path: '/dashboard/referrals' },
   { icon: <Activity className="w-5 h-5" />, label: 'Request Dietitian', path: '/dashboard/health-profile' },
    { icon: <Utensils className="w-5 h-5" />, label: 'Personalized Diet', path: '/dashboard/personalized-diet' },
    { icon: <Dumbbell className="w-5 h-5" />, label: 'Workout Plans', path: '/dashboard/workout-plans' },
    { icon: <TrendingUp className="w-5 h-5" />, label: 'Progress Tracking', path: '/dashboard/progress-tracking' },
    { icon: <Activity className="w-5 h-5" />, label: 'Health Insights', path: '/dashboard/health-insights' },
    { icon: <Calendar className="w-5 h-5" />, label: 'Dietitian Support', path: '/dashboard/dietitian-support' },
    { icon: <ClipboardList className="w-5 h-5" />, label: 'Weekly Check-ins', path: '/dashboard/weekly-checkins' },
  ];

  // Fetch diet summary on mount
  useEffect(() => {
    const fetchDietSummary = async () => {
      try {
        const userData = localStorage.getItem('neutrion-user-data');
        if (userData) {
          const user = JSON.parse(userData);
          const response = await (apiService as any).getSidebarDietSummary(user.id);
          if (response.success && response.data) {
            // Calculate next meal from today's schedule
            const now = new Date();
            const currentHour = now.getHours();
            const today = new Date().toISOString().split('T')[0];
            
            let nextMeal: DietSummary['nextMeal'] = null;
            if (response.data.todaySchedule && response.data.todaySchedule.length > 0) {
              const sortedSchedule = [...response.data.todaySchedule].sort((a, b) => {
                const timeA = a.time.split(':').map(Number);
                const timeB = b.time.split(':').map(Number);
                return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
              });
              
              for (const meal of sortedSchedule) {
                const [hours, minutes] = meal.time.split(':').map(Number);
                const mealMinutes = hours * 60 + minutes;
                if (mealMinutes > currentHour * 60 + now.getMinutes()) {
                  nextMeal = {
                    mealType: meal.mealType,
                    time: meal.time,
                    title: meal.title
                  };
                  break;
                }
              }
              
              // If no upcoming meal today, show the first meal of tomorrow
              if (!nextMeal && sortedSchedule.length > 0) {
                nextMeal = {
                  mealType: sortedSchedule[0].mealType,
                  time: sortedSchedule[0].time,
                  title: sortedSchedule[0].title
                };
              }
            }

            setDietSummary({
              dietPlan: response.data.dietPlan,
              calories: response.data.calories,
              nextMeal
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch diet summary:', error);
      } finally {
        setLoadingDiet(false);
      }
    };

    fetchDietSummary();
  }, []);

  const handleNavigation = (path: string) => {
    // Use onNavigate callback if provided, otherwise use navigate
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <>
      {/* Mobile menu overlay */}
      <div 
        className={`lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={handleClose}
      />
      
      <aside className={`w-64 bg-white border-r border-gray-200 h-screen p-6 fixed left-0 top-0 z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`} id="sidebar">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
           
            <img
  src="/images/logo.png"
  alt="NUTREAZY Logo"
  className="h-8 lg:h-10 w-auto"
/>
          </div>
          <button 
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg" 
            id="close-sidebar"
            onClick={handleClose}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Diet Summary Card */}
        {loadingDiet ? (
          <div className="mb-6 p-4 bg-gradient-to-br from-[#C5E17A]/20 to-[#FF6B4A]/10 rounded-xl animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ) : dietSummary ? (
          <div className="mb-6 p-4 bg-gradient-to-br from-[#C5E17A]/20 to-[#FF6B4A]/10 rounded-xl">
            {/* Diet Plan Status */}
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-2 h-2 rounded-full ${dietSummary.dietPlan.hasPlan ? 'bg-green-500' : 'bg-orange-500'}`}></div>
              <span className="text-xs font-medium text-gray-600">
                {dietSummary.dietPlan.hasPlan ? 'Diet Plan Ready' : 'Awaiting Diet Plan'}
              </span>
            </div>

            {/* Calories Progress */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">Today's Calories</span>
                <span className="text-xs font-semibold text-gray-700">
                  {dietSummary.calories.consumed} / {dietSummary.calories.target} kcal
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#C5E17A] to-[#FF6B4A] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(dietSummary.calories.compliance, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-gray-400">{dietSummary.calories.compliance}% complete</span>
                <span className="text-[10px] text-gray-400">{dietSummary.calories.remaining} remaining</span>
              </div>
            </div>

            {/* Next Meal */}
            {dietSummary.nextMeal && (
              <div className="flex items-center gap-2 p-2 bg-white/60 rounded-lg">
                <Clock className="w-4 h-4 text-[#FF6B4A]" />
                <div>
                  <p className="text-[10px] text-gray-500">Next Meal</p>
                  <p className="text-xs font-medium text-gray-700 capitalize">
                    {dietSummary.nextMeal.mealType} • {formatTime(dietSummary.nextMeal.time)}
                  </p>
                </div>
              </div>
            )}

            {!dietSummary.dietPlan.hasPlan && (
              <div className="mt-2 text-[10px] text-gray-500">
                Complete your health profile to get a personalized diet plan
              </div>
            )}
          </div>
        ) : null}

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
