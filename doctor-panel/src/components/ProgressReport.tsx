import React, { useState, useEffect } from 'react';
import { Calendar, Eye, Users, Activity, AlertCircle, TrendingUp, Loader2, X, Utensils } from 'lucide-react';
import { getDoctorProgressSummary } from '../services/api';
import ProgressDetailView from './ProgressDetails';

// Define types locally to avoid import issues
interface TodayFoodItem {
  name: string;
  calories: number;
  portion?: string | null;
}

interface UserProgressSummary {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  joinedDate: string;
  assignedAt: string | null;
  weight: number | null;
  height: number | null;
  bmi: number | null;
  bmiCategory: string;
  targetCalories: number;
  todayCalories: number;
  todayFoods: TodayFoodItem[];
  weekAvgCalories: number;
  complianceRate: number;
  lastActive: string | null;
  daysActiveLastWeek: number;
}

type FilterPeriod = 'day' | 'week' | 'month';

function ProgressReport() {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{
    totalPatients: number;
    activeToday: number;
    avgCompliance: number;
    criticalCases: number;
  } | null>(null);
  const [users, setUsers] = useState<UserProgressSummary[]>([]);
  const [period, setPeriod] = useState<FilterPeriod>('week');
  const [selectedUserFoods, setSelectedUserFoods] = useState<TodayFoodItem[] | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string | null>(null);

  useEffect(() => {
    fetchProgressData();
  }, [period]);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDoctorProgressSummary();
      if (response.success) {
        setSummary(response.data.summary);
        setUsers(response.data.users);
      } else {
        setError('Failed to load progress data');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading progress data');
    } finally {
      setLoading(false);
    }
  };

  const getComplianceColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplianceBg = (rate: number) => {
    if (rate >= 80) return 'bg-green-100';
    if (rate >= 50) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (selectedUserId !== null) {
    return <ProgressDetailView userId={selectedUserId} onBack={() => setSelectedUserId(null)} />;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Progress Report</h1>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="flex space-x-2 bg-white rounded-lg p-1 shadow-sm w-fit">
          {(['day', 'week', 'month'] as FilterPeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
          <span className="ml-3 text-gray-600">Loading progress data...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Content */}
      {!loading && !error && summary && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Patients</p>
                  <p className="text-3xl font-bold text-gray-800">{summary.totalPatients}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Today</p>
                  <p className="text-3xl font-bold text-green-600">{summary.activeToday}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Avg Compliance</p>
                  <p className="text-3xl font-bold text-blue-600">{summary.avgCompliance}%</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Critical Cases</p>
                  <p className="text-3xl font-bold text-red-600">{summary.criticalCases}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Weight</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">BMI Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target Calories</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Today's Calories</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Compliance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Active</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-800">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {user.weight ? `${user.weight} kg` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.bmiCategory === 'Normal' ? 'bg-green-100 text-green-800' :
                        user.bmiCategory === 'Overweight' ? 'bg-yellow-100 text-yellow-800' :
                        user.bmiCategory === 'Obese' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.bmiCategory}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {user.targetCalories} kcal
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {user.todayCalories} kcal
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`font-medium ${getComplianceColor(user.complianceRate)}`}>
                          {user.complianceRate}%
                        </span>
                        <div className="ml-2 w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${getComplianceBg(user.complianceRate)}`}
                            style={{ width: `${Math.min(user.complianceRate, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="flex items-center text-gray-600">
                        <Calendar size={16} className="mr-2" />
                        {user.lastActive || 'Never'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedUserId(user.id)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors mr-2"
                      >
                        <Eye size={16} className="mr-2" />
                        View Progress
                      </button>
                      {user.todayFoods && user.todayFoods.length > 0 && (
                        <button
                          onClick={() => {
                            setSelectedUserFoods(user.todayFoods);
                            setSelectedUserName(user.name);
                          }}
                          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        >
                          <Utensils size={16} className="mr-2" />
                          View Foods
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No patients assigned to you yet</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Today's Foods Modal */}
      {selectedUserFoods && selectedUserName && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center">
                <Utensils className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Today's Foods - {selectedUserName}
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedUserFoods(null);
                  setSelectedUserName(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-4">
              {selectedUserFoods.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No food items recorded today</p>
              ) : (
                <div className="space-y-3">
                  {selectedUserFoods.map((food, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">{food.name}</p>
                        {food.portion && (
                          <p className="text-sm text-gray-500">Portion: {food.portion}</p>
                        )}
                      </div>
                      <span className="font-medium text-green-600">{food.calories} kcal</span>
                    </div>
                  ))}
                  <div className="mt-4 pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-800">Total Calories</span>
                      <span className="font-bold text-green-600">
                        {selectedUserFoods.reduce((sum, food) => sum + food.calories, 0)} kcal
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t bg-gray-50 rounded-b-lg">
              <button
                onClick={() => {
                  setSelectedUserFoods(null);
                  setSelectedUserName(null);
                }}
                className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProgressReport;

