import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from './dashboard/Sidebar';
import { DashboardHeader } from './dashboard/DashboardHeader';
import { RightSidebar } from './dashboard/RightSidebar';

import { BMI_Calculator } from './dashboard/BMI_Calculator';
import { Diet_Generator } from './dashboard/Diet_Generator';
import { Health_Profile } from './dashboard/Health_Profile';
import { WorkoutPlans } from './dashboard/WorkoutPlans';
import { PersonalizedDietView } from './dashboard/PersonalizedDietView';
import { WeeklyProgress } from './dashboard/WeeklyProgress';
import Referrals from './dashboard/Referrals';
import { BMICalculation } from '../../types/health';
import DashboardHome from './dashboard/DashboardHome';
import HealthInsights from './dashboard/HealthInsights';
import DietitianSupport from './dashboard/DietitianSupport';

interface User {
  name: string;
  email: string;
  avatar: string;
}

interface DashboardProps {
  initialProfileData?: any;
  onLogout?: () => void;
  defaultView?: string;
  user?: User | null;
}

export function Dashboard({ initialProfileData, onLogout, defaultView, user }: DashboardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [bmiCalculation, setBmiCalculation] = useState<BMICalculation | null>(null);
  const [medicalConditions, setMedicalConditions] = useState('');
  const [dashboardUser, setDashboardUser] = useState<User | null>(user || null);
  const [headerTitle, setHeaderTitle] = useState('Dashboard');

  // Map routes to view names
  const routeToViewMap: Record<string, string> = {
    '/dashboard': 'home',
    '/dashboard/home': 'home',
    '/dashboard/referrals': 'referrals',
    '/dashboard/health-profile': 'health-profile',
    '/dashboard/personalized-diet': 'personalized-diet',
    '/dashboard/workout-plans': 'workout-plans',
    '/dashboard/progress-tracking': 'progress-tracking',
    '/dashboard/health-insights': 'health-insights',
    '/dashboard/dietitian-support': 'dietitian-support',
    '/dashboard/bmi-calculator': 'bmi-calculator',
    '/dashboard/diet-generator': 'diet-generator',
  };

  // Get active view from current route
  const getActiveViewFromRoute = () => {
    const path = location.pathname;
    return routeToViewMap[path] || 'home';
  };

  const [activeView, setActiveView] = useState(getActiveViewFromRoute);

  // Update active view when route changes
  useEffect(() => {
    const newView = getActiveViewFromRoute();
    if (newView !== activeView) {
      setActiveView(newView);
      setHeaderTitle('Dashboard');
    }
  }, [location.pathname]);

  // Update user state when prop changes or read from localStorage on mount
  useEffect(() => {
    if (user) {
      setDashboardUser(user);
    } else {
      // Try to get user from localStorage
      const savedUser = localStorage.getItem('neutrion-user');
      if (savedUser) {
        try {
          setDashboardUser(JSON.parse(savedUser));
        } catch {
          setDashboardUser(null);
        }
      }
    }
  }, [user]);

  // Initialize with profile data if provided
  useEffect(() => {
    if (initialProfileData?.bmiCalculation) {
      setBmiCalculation(initialProfileData.bmiCalculation);
      setMedicalConditions(initialProfileData.medicalConditions || '');
    }
  }, [initialProfileData]);

  const handleViewChange = (view: string) => {
    // Map view names to routes
    const viewToRouteMap: Record<string, string> = {
      'home': '/dashboard',
      'referrals': '/dashboard/referrals',
      'health-profile': '/dashboard/health-profile',
      'personalized-diet': '/dashboard/personalized-diet',
      'workout-plans': '/dashboard/workout-plans',
      'progress-tracking': '/dashboard/progress-tracking',
      'health-insights': '/dashboard/health-insights',
      'dietitian-support': '/dashboard/dietitian-support',
      'bmi-calculator': '/dashboard/bmi-calculator',
      'diet-generator': '/dashboard/diet-generator',
    };
    
    const route = viewToRouteMap[view] || '/dashboard';
    navigate(route);
  };

  const handleBMIComplete = (calculation: BMICalculation, conditions: string) => {
    setBmiCalculation(calculation);
    setMedicalConditions(conditions);
  };


  const renderMainContent = () => {
    switch (activeView) {
      case 'home':
        return <DashboardHome />;
      case 'bmi-calculator':
        return (
          <BMI_Calculator 
            onCalculationComplete={handleBMIComplete}
          />
        );
      case 'diet-generator':
        return (
          <Diet_Generator 
            bmiCalculation={bmiCalculation}
            medicalConditions={medicalConditions}
          />
        );
      case 'health-profile':
        return (
          <Health_Profile 
            onProfileUpdate={(profileData) => {
              // Update BMI calculation when profile is updated
              if (profileData.bmiCalculation) {
                setBmiCalculation(profileData.bmiCalculation);
              }
              setMedicalConditions(profileData.medicalConditions || '');
            }}
          />
        );
      case 'workout-plans':
        return (
          <WorkoutPlans />
        );
      case 'personalized-diet':
        return (
          <PersonalizedDietView />
        );
      case 'progress-tracking':
        return <WeeklyProgress />;
      case 'referrals':
        return <Referrals onHeaderChange={setHeaderTitle} />;
      case 'health-insights':
        return <HealthInsights />;
      case 'dietitian-support':
        return <DietitianSupport />;
      case 'ai-coach':
        return (
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">AI Coach Ria</h1>
            <div className="bg-white rounded-xl shadow-md p-8">
              <p className="text-gray-600">AI Coach Ria chat interface coming soon...</p>
            </div>
          </div>
        );
      case 'meal-planning':
        return (
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Meal Planning</h1>
            <div className="bg-white rounded-xl shadow-md p-8">
              <p className="text-gray-600">Meal planning features coming soon...</p>
            </div>
          </div>
        );
      case 'featured':
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar onLogout={onLogout} />
      <div className="lg:ml-64 ">
        <DashboardHeader user={dashboardUser} title={headerTitle} />
        <main className="p-4 lg:p-8">
          {renderMainContent()}
        </main>
      </div>
      {/* <div className="hidden lg:block">
        <RightSidebar />
      </div> */}
    </div>
  );
}

