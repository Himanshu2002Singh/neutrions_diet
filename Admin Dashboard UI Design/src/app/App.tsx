import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/dashboard/Dashboard';
import AddDietician from './components/dieticians/AddDietician';
import AssignDietician from './components/dieticians/AssignDietician';
import CheckProgress from './components/progress/CheckProgress';
import AllUsers from './components/users/AllUsers';
import ReferralManagement from './components/referrals/ReferralManagement';

export default function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 ml-0 md:ml-64">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/add-dietician" element={<AddDietician />} />
            <Route path="/assign-dietician" element={<AssignDietician />} />
            <Route path="/check-progress" element={<CheckProgress />} />
            <Route path="/all-users" element={<AllUsers />} />
            <Route path="/referrals" element={<ReferralManagement />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
