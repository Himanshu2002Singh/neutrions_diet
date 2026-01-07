// ============================================
// FILE: src/components/Dashboard.tsx
// ============================================
import React, { useState, useEffect } from 'react';
import { Users, Activity, Calendar, AlertCircle, Loader2 } from 'lucide-react';
import { getDoctorProgressSummary } from '../services/api';

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

interface DashboardSummary {
  totalPatients: number;
  activeToday: number;
  avgCompliance: number;
  criticalCases: number;
}

interface RecentActivity {
  id: number;
  type: 'new_patient' | 'appointment' | 'progress' | 'message';
  title: string;
  description: string;
  time: string;
  userName?: string;
}

interface UpcomingAppointment {
  id: number;
  userName: string;
  time: string;
  type: string;
  date: string;
}

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [users, setUsers] = useState<UserProgressSummary[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<UpcomingAppointment[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch progress summary from backend
      const progressResponse = await getDoctorProgressSummary();
      
      if (progressResponse.success) {
        setSummary(progressResponse.data.summary);
        setUsers(progressResponse.data.users);
        
        // Generate recent activities based on real data
        generateRecentActivities(progressResponse.data.users);
        generateUpcomingAppointments(progressResponse.data.users);
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const generateRecentActivities = (users: UserProgressSummary[]) => {
    const activities: RecentActivity[] = [];
    const now = new Date();

    // Add activities for recently active users
    const activeUsers = users.filter(u => u.lastActive);
    activeUsers.slice(0, 5).forEach((user, index) => {
      const hoursAgo = Math.floor((now.getTime() - new Date(user.lastActive!).getTime()) / (1000 * 60 * 60));
      let timeAgo = '';
      
      if (hoursAgo < 1) {
        timeAgo = 'Less than an hour ago';
      } else if (hoursAgo === 1) {
        timeAgo = '1 hour ago';
      } else if (hoursAgo < 24) {
        timeAgo = `${hoursAgo} hours ago`;
      } else {
        timeAgo = `${Math.floor(hoursAgo / 24)} days ago`;
      }

      activities.push({
        id: index,
        type: 'progress',
        title: 'Progress updated',
        description: `${user.name} logged their meals - ${user.todayCalories} kcal today`,
        time: timeAgo,
        userName: user.name
      });
    });

    // Add new patient activities for recently joined users
    const sortedByJoined = [...users].sort((a, b) => 
      new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime()
    );
    
    sortedByJoined.slice(0, 2).forEach((user, index) => {
      const daysAgo = Math.floor((now.getTime() - new Date(user.joinedDate).getTime()) / (1000 * 60 * 60 * 24));
      let timeAgo = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`;
      
      // Check if this user is not already in activities
      if (!activities.find(a => a.userName === user.name)) {
        activities.push({
          id: 100 + index,
          type: 'new_patient',
          title: 'New patient assigned',
          description: `${user.name} joined the program`,
          time: timeAgo,
          userName: user.name
        });
      }
    });

    // Add critical case alerts
    const criticalUsers = users.filter(u => u.complianceRate < 50);
    criticalUsers.slice(0, 2).forEach((user, index) => {
      activities.push({
        id: 200 + index,
        type: 'progress',
        title: 'Low compliance alert',
        description: `${user.name} has only ${user.complianceRate}% compliance this week`,
        time: 'Today',
        userName: user.name
      });
    });

    setRecentActivities(activities.slice(0, 6));
  };

  const generateUpcomingAppointments = (users: UserProgressSummary[]) => {
    const appointments: UpcomingAppointment[] = [];
    const now = new Date();
    
    // Generate mock appointments for the next 3 days based on user activity
    const activeUsers = users.filter(u => u.daysActiveLastWeek > 0).slice(0, 3);
    
    activeUsers.forEach((user, index) => {
      const appointmentDate = new Date(now);
      appointmentDate.setDate(appointmentDate.getDate() + (index % 3));
      appointmentDate.setHours(9 + (index * 4), 0, 0, 0);
      
      const hour = 9 + (index * 4);
      const timeStr = hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`;
      
      appointments.push({
        id: index,
        userName: user.name,
        time: timeStr,
        type: index === 0 ? 'Checkup' : index === 1 ? 'Follow-up' : 'Consultation',
        date: appointmentDate.toISOString().split('T')[0]
      });
    });

    setUpcomingAppointments(appointments);
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'new_patient':
        return <Users className="text-green-600" size={20} />;
      case 'appointment':
        return <Calendar className="text-blue-600" size={20} />;
      case 'progress':
        return <Activity className="text-purple-600" size={20} />;
      case 'message':
        return <AlertCircle className="text-orange-600" size={20} />;
      default:
        return <Activity className="text-gray-600" size={20} />;
    }
  };

  const getActivityBg = (type: RecentActivity['type']) => {
    switch (type) {
      case 'new_patient':
        return 'bg-green-100';
      case 'appointment':
        return 'bg-blue-100';
      case 'progress':
        return 'bg-purple-100';
      case 'message':
        return 'bg-orange-100';
      default:
        return 'bg-gray-100';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
        <span className="ml-3 text-gray-600">Loading dashboard data...</span>
      </div>
    );
  }

  // Error state
  if (error && !summary) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const stats = [
    { 
      label: 'Total Patients', 
      value: summary?.totalPatients || 0, 
      icon: Users, 
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    { 
      label: 'Active Today', 
      value: summary?.activeToday || 0, 
      icon: Activity, 
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    { 
      label: 'Appointments', 
      value: upcomingAppointments.length, 
      icon: Calendar, 
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    { 
      label: 'Critical Cases', 
      value: summary?.criticalCases || 0, 
      icon: AlertCircle, 
      color: 'bg-red-500',
      textColor: 'text-red-600'
    }
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">{stat.label}</p>
                  <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activities</h2>
          {recentActivities.length > 0 ? (
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={activity.id || index} className="flex items-center space-x-4 pb-4 border-b last:border-b-0 last:pb-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActivityBg(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium">{activity.title}</p>
                    <p className="text-gray-500 text-sm">
                      {activity.userName ? `${activity.userName} - ` : ''}{activity.description}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">{activity.time}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No recent activities</p>
            </div>
          )}
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Upcoming Appointments</h2>
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment, index) => (
                <div key={appointment.id || index} className="flex items-center justify-between pb-4 border-b last:border-b-0 last:pb-0">
                  <div>
                    <p className="text-gray-800 font-medium">{appointment.userName}</p>
                    <p className="text-gray-500 text-sm">{appointment.time} - {appointment.type}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    appointment.date === new Date().toISOString().split('T')[0]
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {appointment.date === new Date().toISOString().split('T')[0] 
                      ? 'Today' 
                      : appointment.date === new Date(Date.now() + 86400000).toISOString().split('T')[0]
                      ? 'Tomorrow'
                      : new Date(appointment.date).toLocaleDateString()
                    }
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No upcoming appointments</p>
            </div>
          )}
        </div>
      </div>

      {/* Compliance Overview */}
      {users.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Patient Compliance Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-700 font-medium">Good (≥80%)</span>
                <span className="text-2xl font-bold text-green-600">
                  {users.filter(u => u.complianceRate >= 80).length}
                </span>
              </div>
              <div className="w-full bg-green-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${(users.filter(u => u.complianceRate >= 80).length / users.length) * 100}%` }}
                />
              </div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-yellow-700 font-medium">Average (50-79%)</span>
                <span className="text-2xl font-bold text-yellow-600">
                  {users.filter(u => u.complianceRate >= 50 && u.complianceRate < 80).length}
                </span>
              </div>
              <div className="w-full bg-yellow-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${(users.filter(u => u.complianceRate >= 50 && u.complianceRate < 80).length / users.length) * 100}%` }}
                />
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-red-700 font-medium">Low (&lt;50%)</span>
                <span className="text-2xl font-bold text-red-600">
                  {users.filter(u => u.complianceRate < 50).length}
                </span>
              </div>
              <div className="w-full bg-red-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ width: `${(users.filter(u => u.complianceRate < 50).length / users.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

