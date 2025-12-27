import { Users, UserCheck, DollarSign, Stethoscope } from 'lucide-react';

const stats = [
  {
    title: 'Total Users',
    value: '2,543',
    icon: Users,
    color: 'bg-blue-500',
    change: '+12.5%',
  },
  {
    title: 'Subscription Users',
    value: '1,829',
    icon: UserCheck,
    color: 'bg-green-500',
    change: '+8.2%',
  },
  {
    title: 'Total Dieticians',
    value: '48',
    icon: Stethoscope,
    color: 'bg-purple-500',
    change: '+3 new',
  },
  {
    title: 'Total Revenue',
    value: '$45,329',
    icon: DollarSign,
    color: 'bg-amber-500',
    change: '+15.3%',
  },
];

export default function Dashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's an overview of your platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
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
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[
            { user: 'John Doe', action: 'Subscribed to Premium Plan', time: '2 hours ago' },
            { user: 'Jane Smith', action: 'Requested Dietician Assignment', time: '4 hours ago' },
            { user: 'Mike Johnson', action: 'Completed Health Assessment', time: '6 hours ago' },
            { user: 'Sarah Williams', action: 'Joined the platform', time: '8 hours ago' },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-3 border-b last:border-b-0"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                <p className="text-sm text-gray-600">{activity.action}</p>
              </div>
              <span className="text-xs text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
