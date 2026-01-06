import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
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
import { WorkoutPlans } from './components/dashboard/WorkoutPlans';
import { LoginModal } from './components/LoginModal';
import { BMICalculation } from '../types/health';
import { googleAuthService } from '../services/googleAuth';

interface User {
  name: string;
  email: string;
  avatar: string;
}

export default function App() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Check for existing user on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('neutrion-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // Check for auth token in URL (after OAuth redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const authSuccess = urlParams.get('auth');
    const token = urlParams.get('token');

    if (authSuccess === 'success' && token) {
      localStorage.setItem('neutrion-auth-token', token);
      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Fetch user data from backend
      fetchUserFromToken(token);
    }
  }, []);

  const fetchUserFromToken = async (authToken: string) => {
    try {
      const response = await fetch('http://localhost:3002/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      const data = await response.json();

      if (data.success && data.data) {
        const userData = {
          name: data.data.name,
          email: data.data.email,
          avatar: data.data.avatar,
        };
        localStorage.setItem('neutrion-user', JSON.stringify(userData));
        setUser(userData);
        // Redirect to dashboard after successful login
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  const handleLoginSuccess = (userData: User) => {
    setUser(userData);
    localStorage.setItem('neutrion-user', JSON.stringify(userData));
    setShowLoginModal(false);
    // Redirect to dashboard after successful login
    navigate('/dashboard');
  };

  const handleLogout = () => {
    googleAuthService.logout();
    setUser(null);
    navigate('/');
  };

  const handleHealthProfileClick = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    navigate('/health-profile');
  };

  const handleHeroDietGenerate = (healthData: any) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    
    // Store health data and navigate to dashboard
    setProfileData(healthData);
    navigate('/dashboard');
  };

  const handleBookDietitian = (healthData: any) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    
    // Store health data and navigate to dashboard
    setProfileData(healthData);
    navigate('/dashboard');
  };

  const handleProfileUpdate = (profileData: any) => {
    setProfileData(profileData);
    navigate('/dashboard');
  };

  // Home Page Component
  const HomePage = () => (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Header 
          onLoginClick={handleLoginClick} 
          onHealthProfileClick={handleHealthProfileClick}
          user={user}
          onLogout={handleLogout}
          onDashboardClick={() => navigate('/dashboard')}
        />
        <div className="space-y-8 lg:space-y-12 pb-8 lg:pb-12">
          <HeroSection 
            onHealthProfileComplete={handleHeroDietGenerate}
            onBookDietitian={handleBookDietitian}
          />
          <FeatureCards />
          <FarmFreshSection onStartJourneyClick={() => {
            if (!user) {
              setShowLoginModal(true);
            } else {
              navigate('/dashboard/workout-plans');
            }
          }} />
          <MenuSection />
          <BenefitsSection />
          <TestimonialsSection />
        </div>
        <Footer />
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );

  // Health Profile Page Component
  const HealthProfilePage = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Header 
          onLoginClick={handleLoginClick} 
          onHealthProfileClick={handleHealthProfileClick}
          user={user}
          onLogout={handleLogout}
          onDashboardClick={() => navigate('/dashboard')}
        />
        <Health_Profile onProfileUpdate={handleProfileUpdate} />
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );

  // Placeholder components for other routes
  const PersonalizedDietPage = () => (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Personalized Diet</h1>
      <div className="bg-white rounded-xl shadow-md p-8">
        <p className="text-gray-600">Personalized diet recommendations coming soon...</p>
      </div>
    </div>
  );

  const ProgressTrackingPage = () => (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Progress Tracking</h1>
      <div className="bg-white rounded-xl shadow-md p-8">
        <p className="text-gray-600">Progress tracking features coming soon...</p>
      </div>
    </div>
  );

  const HealthInsightsPage = () => (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Health Insights</h1>
      <div className="bg-white rounded-xl shadow-md p-8">
        <p className="text-gray-600">Health insights and analytics coming soon...</p>
      </div>
    </div>
  );

  const DietitianSupportPage = () => (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dietitian Support</h1>
      <div className="bg-white rounded-xl shadow-md p-8">
        <p className="text-gray-600">Dietitian support and consultation booking coming soon...</p>
      </div>
    </div>
  );

  const WeeklyCheckinsPage = () => (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Weekly Check-ins</h1>
      <div className="bg-white rounded-xl shadow-md p-8">
        <p className="text-gray-600">Weekly check-in features coming soon...</p>
      </div>
    </div>
  );

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/dashboard" element={<Dashboard initialProfileData={profileData} onLogout={handleLogout} user={user} />} />
      <Route path="/dashboard/home" element={<Dashboard initialProfileData={profileData} onLogout={handleLogout} user={user} />} />
      <Route path="/dashboard/referrals" element={<Dashboard initialProfileData={profileData} onLogout={handleLogout} user={user} />} />
      <Route path="/dashboard/health-profile" element={<Dashboard initialProfileData={profileData} onLogout={handleLogout} user={user} />} />
      <Route path="/dashboard/personalized-diet" element={<Dashboard initialProfileData={profileData} onLogout={handleLogout} user={user} />} />
      <Route path="/dashboard/workout-plans" element={<Dashboard initialProfileData={profileData} onLogout={handleLogout} user={user} />} />
      <Route path="/dashboard/progress-tracking" element={<Dashboard initialProfileData={profileData} onLogout={handleLogout} user={user} />} />
      <Route path="/dashboard/health-insights" element={<Dashboard initialProfileData={profileData} onLogout={handleLogout} user={user} />} />
      <Route path="/dashboard/dietitian-support" element={<Dashboard initialProfileData={profileData} onLogout={handleLogout} user={user} />} />
      <Route path="/dashboard/weekly-checkins" element={<Dashboard initialProfileData={profileData} onLogout={handleLogout} user={user} />} />
      <Route path="/health-profile" element={<HealthProfilePage />} />
    </Routes>
  );
}
