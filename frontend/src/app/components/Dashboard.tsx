
import { useState, useEffect } from 'react';
import { Sidebar } from './dashboard/Sidebar';
import { DashboardHeader } from './dashboard/DashboardHeader';
import { FeaturedMenu } from './dashboard/FeaturedMenu';
import { AllMenuSection } from './dashboard/AllMenuSection';
import { RightSidebar } from './dashboard/RightSidebar';

import { BMI_Calculator } from './dashboard/BMI_Calculator';
import { Diet_Generator } from './dashboard/Diet_Generator';
import { Health_Profile } from './dashboard/Health_Profile';
import { WorkoutPlans } from './dashboard/WorkoutPlans';
import { BMICalculation } from '../../types/health';

interface DashboardProps {
  initialProfileData?: any;
  onLogout?: () => void;
  defaultView?: string;
}

export function Dashboard({ initialProfileData, onLogout, defaultView }: DashboardProps) {
  const [activeView, setActiveView] = useState(defaultView || 'featured');
  const [bmiCalculation, setBmiCalculation] = useState<BMICalculation | null>(null);
  const [medicalConditions, setMedicalConditions] = useState('');

  // Update active view when defaultView prop changes
  useEffect(() => {
    if (defaultView) {
      setActiveView(defaultView);
    }
  }, [defaultView]);

  // Initialize with profile data if provided
  useEffect(() => {
    if (initialProfileData?.bmiCalculation) {
      setBmiCalculation(initialProfileData.bmiCalculation);
      setMedicalConditions(initialProfileData.medicalConditions || '');
      if (!defaultView) {
        setActiveView('diet-generator'); // Auto-navigate to diet generator only if no defaultView
      }
    }
  }, [initialProfileData, defaultView]);

  const handleViewChange = (view: string) => {
    setActiveView(view);
  };


  const handleBMIComplete = (calculation: BMICalculation, conditions: string) => {
    setBmiCalculation(calculation);
    setMedicalConditions(conditions);
    
    // Auto-navigate to diet generator after BMI calculation
    if (activeView === 'bmi-calculator') {
      setActiveView('diet-generator');
    }
  };


  const renderMainContent = () => {
    switch (activeView) {
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
          <Diet_Generator 
            bmiCalculation={bmiCalculation}
            medicalConditions={medicalConditions}
          />
        );
      case 'progress-tracking':
        return (
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Progress Tracking</h1>
            <div className="bg-white rounded-xl shadow-md p-8">
              <p className="text-gray-600">Progress tracking features coming soon...</p>
            </div>
          </div>
        );
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
      case 'health-insights':
        return (
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Health Insights</h1>
            <div className="bg-white rounded-xl shadow-md p-8">
              <p className="text-gray-600">Health insights and analytics coming soon...</p>
            </div>
          </div>
        );
      case 'dietitian-support':
        return (
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Dietitian Support</h1>
            <div className="bg-white rounded-xl shadow-md p-8">
              <p className="text-gray-600">Dietitian support and consultation booking coming soon...</p>
            </div>
          </div>
        );
      case 'weekly-checkins':
        return (
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Weekly Check-ins</h1>
            <div className="bg-white rounded-xl shadow-md p-8">
              <p className="text-gray-600">Weekly check-in features coming soon...</p>
            </div>
          </div>
        );
      case 'featured':
      default:
        return (
          <>
            <FeaturedMenu />
            <AllMenuSection />
          </>
        );
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar activeView={activeView} onViewChange={handleViewChange} onLogout={onLogout} />
      <div className="lg:ml-64 ">
        <DashboardHeader />
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
