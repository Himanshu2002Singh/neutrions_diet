import { useState, useEffect } from 'react';
import { X, Eye, Loader2, RefreshCw, AlertCircle, UserPlus, Check, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { apiService, UserWithHealthProfile, Member } from '../../../services/api';

export default function AssignDietician() {
  const [users, setUsers] = useState<UserWithHealthProfile[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserWithHealthProfile | null>(null);
  const [selectedDietician, setSelectedDietician] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'unassigned' | 'all'>('unassigned');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [expandedUser, setExpandedUser] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const fetchUsers = async () => {
    try {
      setError(null);
      if (users.length === 0) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      let response;
      if (filterMode === 'unassigned') {
        response = await apiService.getUnassignedUsers();
      } else {
        response = await apiService.getUsersWithHealthProfiles();
      }

      if (response.success && response.data) {
        setUsers(response.data);
      } else {
        setError('Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await apiService.getMembers(100, 0, 'dietitian');
      if (response.success && response.data) {
        setMembers(response.data.filter(m => m.isActive));
      }
    } catch (err) {
      console.error('Error fetching members:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchMembers();
  }, [filterMode]);

  const handleRefresh = () => {
    fetchUsers();
  };

  const handleAssignDietician = async () => {
    if (!selectedUser || !selectedDietician) {
      setError('Please select a dietician');
      return;
    }

    try {
      setAssigning(true);
      setError(null);
      const response = await apiService.assignDieticianToUser(selectedUser.id, selectedDietician);

      if (response.success) {
        setSuccess('Dietician assigned successfully!');
        setShowAssignModal(false);
        setSelectedDietician(null);
        fetchUsers();
        setSelectedUser(null);
      } else {
        setError(response.message || 'Failed to assign dietician');
      }
    } catch (err) {
      console.error('Error assigning dietician:', err);
      setError(err instanceof Error ? err.message : 'Failed to assign dietician');
    } finally {
      setAssigning(false);
    }
  };

  const getBMIStatusColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'underweight': return 'bg-blue-100 text-blue-800';
      case 'normal': return 'bg-green-100 text-green-800';
      case 'overweight': return 'bg-yellow-100 text-yellow-800';
      case 'obese': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBMIColor = (bmi: number) => {
    if (bmi < 18.5) return 'text-blue-600';
    if (bmi < 25) return 'text-green-600';
    if (bmi < 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredUsers = users.filter(user =>
    user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading users...</span>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Assign Dietician Requests</h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">
              {filterMode === 'unassigned'
                ? 'Users who submitted forms but are not assigned to any dietician'
                : 'All users with health profiles'}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 w-full sm:w-auto"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-green-800 font-medium">Success</p>
            <p className="text-green-600 text-sm">{success}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="mb-4">
        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 w-full justify-between"
        >
          <span className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filters</span>
          </span>
          {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {/* Filter Content */}
        <div className={`${showFilters ? 'block' : 'hidden'} md:block mt-4 md:mt-0`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter Select */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <select
                value={filterMode}
                onChange={(e) => setFilterMode(e.target.value as 'unassigned' | 'all')}
                className="flex-1 sm:flex-none border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="unassigned">Unassigned Only</option>
                <option value="all">All Users</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="text-sm text-gray-600 w-full sm:w-auto text-left sm:text-right">
              {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} found
            </div>
          </div>
        </div>
      </div>

      {/* Users List - Card View for Mobile, Table for Desktop */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Desktop Table Header */}
        <div className="hidden md:table-header-group bg-gray-50 border-b">
          <div className="table-row">
            <div className="table-cell px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</div>
            <div className="table-cell px-6 py-4 text-left text-sm font-semibold text-gray-900">Phone</div>
            <div className="table-cell px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</div>
            <div className="table-cell px-6 py-4 text-left text-sm font-semibold text-gray-900">Age</div>
            <div className="table-cell px-6 py-4 text-left text-sm font-semibold text-gray-900">BMI</div>
            <div className="table-cell px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</div>
            <div className="table-cell px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</div>
          </div>
        </div>

        {/* Content */}
        <div className="divide-y divide-gray-200">
          {filteredUsers.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              {filterMode === 'unassigned'
                ? 'No unassigned users found'
                : 'No users found with health profiles'}
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div key={user.id}>
                {/* Desktop Table Row */}
                <div className="hidden md:table-row hover:bg-gray-50 transition-colors">
                  <div className="table-cell px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{user.userName}</div>
                  </div>
                  <div className="table-cell px-6 py-4 text-sm text-gray-600">{user.phone}</div>
                  <div className="table-cell px-6 py-4 text-sm text-gray-600 truncate max-w-[200px]">{user.email}</div>
                  <div className="table-cell px-6 py-4 text-sm text-gray-600">{user.age} years</div>
                  <div className="table-cell px-6 py-4">
                    {user.healthDetails.bmi > 0 ? (
                      <span className={`text-sm font-bold ${getBMIColor(user.healthDetails.bmi)}`}>
                        {user.healthDetails.bmi}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">N/A</span>
                    )}
                  </div>
                  <div className="table-cell px-6 py-4">
                    {user.assignedDieticianId ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Assigned
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        Unassigned
                      </span>
                    )}
                  </div>
                  <div className="table-cell px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <Eye size={16} />
                        <span className="text-sm font-medium">View</span>
                      </button>
                      {!user.assignedDieticianId && (
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowAssignModal(true);
                          }}
                          className="flex items-center gap-1 text-green-600 hover:text-green-700 transition-colors"
                        >
                          <UserPlus size={16} />
                          <span className="text-sm font-medium">Assign</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden">
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium text-gray-900 truncate">{user.userName}</h3>
                          {user.assignedDieticianId ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 flex-shrink-0">
                              Assigned
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 flex-shrink-0">
                              Unassigned
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 truncate">{user.email}</p>
                        <p className="text-xs text-gray-500">{user.phone}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        {user.healthDetails.bmi > 0 && (
                          <span className={`text-sm font-bold ${getBMIColor(user.healthDetails.bmi)}`}>
                            BMI: {user.healthDetails.bmi}
                          </span>
                        )}
                        {expandedUser === user.id ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Card Content */}
                  {expandedUser === user.id && (
                    <div className="px-4 pb-4 border-t pt-4 space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Age:</span>
                          <span className="ml-1 text-gray-900">{user.age} years</span>
                        </div>
                        <div>
                          <span className="text-gray-500">BMI Category:</span>
                          <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${getBMIStatusColor(user.healthDetails.bmiCategory)}`}>
                            {user.healthDetails.bmiCategory}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser(user);
                          }}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
                        >
                          <Eye size={16} />
                          View Details
                        </button>
                        {!user.assignedDieticianId && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUser(user);
                              setShowAssignModal(true);
                            }}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium"
                          >
                            <UserPlus size={16} />
                            Assign
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Health Details Modal */}
      {selectedUser && !showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-4xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto animate-slide-up sm:animate-fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b sticky top-0 bg-white z-10">
              <div className="flex-1 min-w-0 pr-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Health Profile Details</h2>
                <p className="text-sm text-gray-500 mt-0.5 truncate">{selectedUser.userName}</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* User Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">User Information</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <p className="text-xs text-gray-600">Name</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{selectedUser.userName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Phone</p>
                    <p className="text-sm font-medium text-gray-900">{selectedUser.phone}</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-xs text-gray-600">Age</p>
                    <p className="text-sm font-medium text-gray-900">{selectedUser.age} years</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-600">Email</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{selectedUser.email}</p>
                  </div>
                </div>
              </div>

              {/* BMI Summary */}
              {selectedUser.healthDetails.bmi > 0 && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">BMI Analysis</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <p className="text-xs text-gray-600">BMI</p>
                      <p className={`text-lg font-bold ${getBMIColor(selectedUser.healthDetails.bmi)}`}>
                        {selectedUser.healthDetails.bmi}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Category</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getBMIStatusColor(selectedUser.healthDetails.bmiCategory)}`}>
                        {selectedUser.healthDetails.bmiCategory}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Daily Calories</p>
                      <p className="text-lg font-bold text-gray-900">{selectedUser.healthDetails.dailyCalories}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Activity</p>
                      <p className="text-sm font-medium text-gray-900 capitalize">{selectedUser.healthDetails.activityLevel.replace('_', ' ')}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Health Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Basic Health Data */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Basic Health Data</h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Weight</p>
                      <p className="text-sm font-medium text-gray-900">{selectedUser.healthDetails.weight} kg</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Height</p>
                      <p className="text-sm font-medium text-gray-900">{selectedUser.healthDetails.height} cm</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Gender</p>
                    <p className="text-sm font-medium text-gray-900 capitalize">{selectedUser.healthDetails.gender}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Medical Conditions</p>
                    <p className="text-sm text-gray-900">{selectedUser.healthDetails.medicalConditions || 'None specified'}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Health Goals</p>
                    <p className="text-sm text-gray-900">{selectedUser.healthDetails.dietaryRestrictions || 'None specified'}</p>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Additional Info</h3>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Allergies</p>
                    <p className="text-sm text-gray-900">{selectedUser.healthDetails.allergies}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Current Medications</p>
                    <p className="text-sm text-gray-900">{selectedUser.healthDetails.medications}</p>
                  </div>

                  {selectedUser.healthDetails.dietRecommendations && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-2">Diet Recommendations</p>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <p className="text-gray-500">Protein</p>
                          <p className="font-medium text-gray-900">{selectedUser.healthDetails.dietRecommendations.protein}g</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500">Carbs</p>
                          <p className="font-medium text-gray-900">{selectedUser.healthDetails.dietRecommendations.carbs}g</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500">Fats</p>
                          <p className="font-medium text-gray-900">{selectedUser.healthDetails.dietRecommendations.fats}g</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                {!selectedUser.assignedDieticianId ? (
                  <button
                    onClick={() => setShowAssignModal(true)}
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <UserPlus size={16} />
                    Assign Dietician
                  </button>
                ) : (
                  <button
                    className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                    disabled
                  >
                    <Check size={16} />
                    Already Assigned
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Dietician Modal */}
      {showAssignModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-md max-h-[90vh] sm:max-h-[80vh] overflow-y-auto animate-slide-up sm:animate-fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b sticky top-0 bg-white">
              <div className="flex-1 min-w-0 pr-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Assign Dietician</h2>
                <p className="text-sm text-gray-500 mt-0.5 truncate">To: {selectedUser.userName}</p>
              </div>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedDietician(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Dietician
                </label>
                <select
                  value={selectedDietician || ''}
                  onChange={(e) => setSelectedDietician(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Choose a dietician...</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.firstName} {member.lastName} ({member.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedDietician(null);
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                  disabled={assigning}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignDietician}
                  disabled={!selectedDietician || assigning}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {assigning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Assigning...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} />
                      <span>Assign</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

