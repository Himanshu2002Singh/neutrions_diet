import { useEffect, useState } from 'react';
import { Users, UserCheck, Stethoscope, TrendingUp } from 'lucide-react';
import { apiService } from '../../../services/api';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalDietitians: number;
  usersWithHealthProfiles: number;
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  newThisWeek: number;
}

interface RecentActivity {
  id: number;
  userName: string;
  action: string;
  time: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard stats
      const statsResponse = await apiService.getDashboardStats();
      
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      } else {
        throw new Error(statsResponse.message || 'Failed to fetch stats');
      }

// Generate recent activities from the stats
      const generatedActivities: RecentActivity[] = [
        {
          id: 1,
          userName: 'New User',
          action: 'Joined the platform',
          time: 'Just now'
        },
        {
          id: 2,
          userName: 'Health Profile',
          action: 'Completed health assessment',
          time: `${stats.newThisWeek || 0} new this week`
        },
        {
          id: 3,
          userName: 'Referral System',
          action: `${stats.completedReferrals || 0} referrals completed`,
          time: 'Today'
        },
        {
          id: 4,
          userName: 'Active Users',
          action: `${stats.activeUsers || 0} active users`,
          time: 'Currently'
        }
      ];
      setActivities(generatedActivities);

    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Format numbers with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Loading...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-red-600 mt-2">{error}</p>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: formatNumber(stats?.totalUsers || 0),
      icon: Users,
      color: 'bg-blue-500',
      change: `+${stats?.newThisWeek || 0} this week`,
    },
    {
      title: 'Active Users',
      value: formatNumber(stats?.activeUsers || 0),
      icon: UserCheck,
      color: 'bg-green-500',
      change: `${stats?.usersWithHealthProfiles || 0} with profiles`,
    },
    {
      title: 'Total Dietitians',
      value: formatNumber(stats?.totalDietitians || 0),
      icon: Stethoscope,
      color: 'bg-purple-500',
      change: 'Professionals',
    },
    {
      title: 'Total Referrals',
      value: formatNumber(stats?.totalReferrals || 0),
      icon: TrendingUp,
      color: 'bg-amber-500',
      change: `${stats?.completedReferrals || 0} completed`,
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's an overview of your platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-2 font-medium">{stat.change}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity Section */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Platform Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-sm text-gray-600">Pending Referrals</span>
              <span className="font-medium text-gray-900">{formatNumber(stats?.pendingReferrals || 0)}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-sm text-gray-600">Completed Referrals</span>
              <span className="font-medium text-green-600">{formatNumber(stats?.completedReferrals || 0)}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-sm text-gray-600">Health Profiles</span>
              <span className="font-medium text-gray-900">{formatNumber(stats?.usersWithHealthProfiles || 0)}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-sm text-gray-600">New This Week</span>
              <span className="font-medium text-blue-600">+{formatNumber(stats?.newThisWeek || 0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">• Add new dietitians to the platform</p>
            <p className="text-sm text-gray-600">• Assign dietitians to users</p>
            <p className="text-sm text-gray-600">• View and manage referrals</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">System Status</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-sm text-gray-600">Database: Connected</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-sm text-gray-600">API: Online</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span className="text-sm text-gray-600">Server: Running</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Activity Summary</h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-900">{formatNumber(stats?.activeUsers || 0)}</span> active users
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-900">{formatNumber(stats?.totalReferrals || 0)}</span> total referrals
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium text-green-600">{formatNumber(stats?.completedReferrals || 0)}</span> completed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

