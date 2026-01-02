// ============================================
// FILE: src/components/AssignedUsers.tsx
// ============================================
import React, { useState, useEffect } from 'react';
import { Eye, Upload, User, Activity, Scale, Ruler, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { AssignedUser, HealthProfile } from '../services/api';
import { getAssignedUsers, getUserHealthProfile } from '../services/api';
import UserDetailsModal from './UserModal';

function AssignedUsers() {
  const [users, setUsers] = useState<AssignedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AssignedUser | null>(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Load assigned users from backend
  useEffect(() => {
    loadAssignedUsers();
  }, []);

  const loadAssignedUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAssignedUsers();
      if (response.success) {
        setUsers(response.data || []);
      } else {
        setError('Failed to load assigned users');
      }
    } catch (err: any) {
      console.error('Error loading assigned users:', err);
      setError(err.message || 'Failed to load assigned users');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadDiet = (userId: number) => {
    alert(`Diet chart upload functionality for user ID: ${userId}`);
  };

  const handleViewDetails = async (user: AssignedUser) => {
    setSelectedUser(user);
    setLoadingDetails(true);
    setShowDetailsModal(true);

    try {
      const response = await getUserHealthProfile(user.id);
      if (response.success) {
        setSelectedUserDetails(response.data);
      } else {
        // Fallback to the user data we already have
        setSelectedUserDetails({
          ...user,
          healthProfile: user.healthProfile
        });
      }
    } catch (err) {
      // Fallback to the user data we already have
      setSelectedUserDetails({
        ...user,
        healthProfile: user.healthProfile
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  // Helper to format gender
  const formatGender = (gender: string) => {
    const genderMap: Record<string, string> = {
      male: 'Male',
      female: 'Female',
      other: 'Other'
    };
    return genderMap[gender] || gender;
  };

  // Helper to format activity level
  const formatActivityLevel = (level: string) => {
    const levelMap: Record<string, string> = {
      sedentary: 'Sedentary',
      light: 'Lightly Active',
      moderate: 'Moderately Active',
      active: 'Active',
      very_active: 'Very Active'
    };
    return levelMap[level] || level;
  };

  // Helper to format BMI category with color
  const getBMICategoryColor = (category: string) => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('underweight')) return 'bg-blue-100 text-blue-800';
    if (categoryLower.includes('normal')) return 'bg-green-100 text-green-800';
    if (categoryLower.includes('overweight')) return 'bg-yellow-100 text-yellow-800';
    if (categoryLower.includes('obese')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Assigned Users</h1>
        <p className="text-gray-600">View and manage users assigned to you</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-blue-600" size={32} />
          <span className="ml-2 text-gray-600">Loading assigned users...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && users.length === 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <User className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Users Assigned</h3>
          <p className="text-gray-600">You don't have any users assigned to you yet.</p>
        </div>
      )}

      {/* Users Table */}
      {!loading && !error && users.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      User
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Scale size={16} />
                      Weight
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Ruler size={16} />
                      Height
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Activity size={16} />
                      BMI
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} />
                      Status
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {user.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.userName}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="text-sm text-gray-500">{user.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Scale size={16} className="mr-2 text-gray-400" />
                        {user.weight} kg
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Age: {user.age} yrs</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Ruler size={16} className="mr-2 text-gray-400" />
                        {user.height} cm
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{formatGender(user.gender)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Activity size={16} className="mr-2 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {user.healthProfile?.bmi?.toFixed(1) || 'N/A'}
                        </span>
                      </div>
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full mt-1 ${getBMICategoryColor(user.healthProfile?.bmiCategory || 'Unknown')}`}>
                        {user.healthProfile?.bmiCategory || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle size={12} className="mr-1" />
                          Active
                        </span>
                      </div>
                      {user.assignedAt && (
                        <div className="text-xs text-gray-500 mt-1">
                          Assigned: {new Date(user.assignedAt).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(user)}
                          className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm transition-colors"
                        >
                          <Eye size={16} className="mr-1" />
                          View Details
                        </button>
                        <button
                          onClick={() => handleUploadDiet(user.id)}
                          className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-sm transition-colors"
                        >
                          <Upload size={16} className="mr-1" />
                          Upload Diet
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showDetailsModal && selectedUser && (
        <UserDetailsModal 
          user={selectedUser} 
          userDetails={selectedUserDetails}
          loading={loadingDetails}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedUser(null);
            setSelectedUserDetails(null);
          }} 
        />
      )}
    </div>
  );
};

export default AssignedUsers;

