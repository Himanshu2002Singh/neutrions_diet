

import { useState } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { FeatureCards } from './components/FeatureCards';
import { FarmFreshSection } from './components/FarmFreshSection';
import { MenuSection } from './components/MenuSection';
import { BenefitsSection } from './components/BenefitsSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { Footer } from './components/Footer';
import { Dashboard } from './components/Dashboard';
import { Health_Profile } from './components/dashboard/Health_Profile';
import { BMICalculation } from './types/health';

export default function App() {
  const [showDashboard, setShowDashboard] = useState(false);
  const [showHealthProfile, setShowHealthProfile] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  const handleHealthProfileClick = () => {
    setShowHealthProfile(true);
  };

  const handleProfileUpdate = (profileData: any) => {
    setProfileData(profileData);
    setShowHealthProfile(false);
    setShowDashboard(true);
  };

  if (showDashboard) {
    return <Dashboard initialProfileData={profileData} />;
  }

  if (showHealthProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Health_Profile onProfileUpdate={handleProfileUpdate} />
          <div className="mt-6 text-center">
            <button
              onClick={() => setShowHealthProfile(false)}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <Header onLoginClick={() => setShowDashboard(true)} onHealthProfileClick={handleHealthProfileClick} />
        <div className="space-y-8 lg:space-y-12 pb-8 lg:pb-12">
          <HeroSection />
          <FeatureCards />
          <FarmFreshSection />
          <MenuSection />
          <BenefitsSection />
          <TestimonialsSection />
        </div>
        <Footer />
      </div>
    </div>
  );
}