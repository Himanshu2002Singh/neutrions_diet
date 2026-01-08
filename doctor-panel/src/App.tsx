import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AssignedUsers from './components/AssignedUsers';
import ProgressReport from './components/ProgressReport';
import DoctorChat from './components/DoctorChat';
import DoctorTasks from './components/DoctorTasks';
import Login from './components/Login';
import { isAuthenticated, getCurrentUser, logout } from './services/api';
import type { AdminUser } from './types';

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Check authentication on initial load
  useEffect(() => {
    const checkAuth = () => {
      const auth = isAuthenticated();
      const user = getCurrentUser();
      if (auth && user) {
        setIsAuth(true);
        setCurrentUser(user as AdminUser);
        // Redirect to dashboard if on login page
        if (location.pathname === '/login') {
          navigate('/');
        }
      } else {
        setIsAuth(false);
      }
      setLoading(false);
    };
    checkAuth();
  }, [location.pathname, navigate]);

  const handleLoginSuccess = (user: AdminUser) => {
    setIsAuth(true);
    setCurrentUser(user);
    navigate('/');
  };

  const handleLogout = () => {
    logout();
    setIsAuth(false);
    setCurrentUser(null);
    navigate('/login');
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuth) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Get current active tab from URL
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return 'dashboard';
    if (path === '/assigned') return 'assigned';
    if (path === '/progress') return 'progress';
    if (path === '/tasks') return 'tasks';
    if (path === '/messages') return 'messages';
    return 'dashboard';
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeTab={getActiveTab()}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          user={currentUser}
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-auto p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/assigned" element={<AssignedUsers />} />
            <Route path="/progress" element={<ProgressReport />} />
            <Route path="/tasks" element={<DoctorTasks sidebarOpen={sidebarOpen} />} />
            <Route path="/messages" element={<DoctorChat />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

