
import { useState } from 'react';
import { Sidebar } from './dashboard/Sidebar';
import { DashboardHeader } from './dashboard/DashboardHeader';
import { FeaturedMenu } from './dashboard/FeaturedMenu';
import { AllMenuSection } from './dashboard/AllMenuSection';
import { RightSidebar } from './dashboard/RightSidebar';

import { BMI_Calculator } from './dashboard/BMI_Calculator';
import { Diet_Generator } from './dashboard/Diet_Generator';
import { Health_Profile } from './dashboard/Health_Profile';
import { BMICalculation } from '../../types/health';

export function Dashboard() {
  const [activeView, setActiveView] = useState('featured');
  const [bmiCalculation, setBmiCalculation] = useState<BMICalculation | null>(null);
  const [medicalConditions, setMedicalConditions] = useState('');

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
      <Sidebar activeView={activeView} onViewChange={handleViewChange} />
      <div className="lg:ml-64 lg:mr-80">
        <DashboardHeader />
        <main className="p-4 lg:p-8">
          {renderMainContent()}
        </main>
      </div>
      <div className="hidden lg:block">
        <RightSidebar />
      </div>
    </div>
  );
}
