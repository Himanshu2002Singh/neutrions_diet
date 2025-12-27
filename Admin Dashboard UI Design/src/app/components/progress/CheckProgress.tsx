import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface UserProgress {
  id: number;
  userName: string;
  dietician: string;
  startDate: string;
  currentWeight: number;
  targetWeight: number;
  weightChange: number;
  status: 'improving' | 'stable' | 'needs-attention';
}

const dummyProgress: UserProgress[] = [
  {
    id: 1,
    userName: 'Alice Brown',
    dietician: 'Dr. Emily Johnson',
    startDate: '2024-01-15',
    currentWeight: 73,
    targetWeight: 65,
    weightChange: -2,
    status: 'improving',
  },
  {
    id: 2,
    userName: 'David Wilson',
    dietician: 'Dr. Michael Chen',
    startDate: '2024-02-01',
    currentWeight: 92,
    targetWeight: 80,
    weightChange: -3,
    status: 'improving',
  },
  {
    id: 3,
    userName: 'Emma Davis',
    dietician: 'Dr. Sarah Williams',
    startDate: '2024-01-20',
    currentWeight: 68,
    targetWeight: 62,
    weightChange: 0,
    status: 'stable',
  },
  {
    id: 4,
    userName: 'James Taylor',
    dietician: 'Dr. Robert Anderson',
    startDate: '2024-02-10',
    currentWeight: 74,
    targetWeight: 70,
    weightChange: 2,
    status: 'needs-attention',
  },
];

export default function CheckProgress() {
  const getStatusColor = (status: UserProgress['status']) => {
    switch (status) {
      case 'improving':
        return 'bg-green-100 text-green-800';
      case 'stable':
        return 'bg-yellow-100 text-yellow-800';
      case 'needs-attention':
        return 'bg-red-100 text-red-800';
    }
  };

  const getStatusIcon = (status: UserProgress['status']) => {
    switch (status) {
      case 'improving':
        return <TrendingUp size={16} />;
      case 'stable':
        return <Minus size={16} />;
      case 'needs-attention':
        return <TrendingDown size={16} />;
    }
  };

  const getStatusText = (status: UserProgress['status']) => {
    switch (status) {
      case 'improving':
        return 'Improving';
      case 'stable':
        return 'Stable';
      case 'needs-attention':
        return 'Needs Attention';
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Check Progress</h1>
        <p className="text-gray-600 mt-2">Monitor user progress and track their health journey</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Programs</p>
              <p className="text-3xl font-bold text-gray-900">24</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Success Rate</p>
              <p className="text-3xl font-bold text-gray-900">78%</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Avg. Weight Lost</p>
              <p className="text-3xl font-bold text-gray-900">4.2 kg</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <TrendingDown className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Progress Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">User Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Dietician</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Start Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Current Weight</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Target Weight</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Change</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dummyProgress.map((progress) => (
                <tr key={progress.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{progress.userName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{progress.dietician}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(progress.startDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{progress.currentWeight} kg</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{progress.targetWeight} kg</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 text-sm font-medium ${
                        progress.weightChange < 0
                          ? 'text-green-600'
                          : progress.weightChange > 0
                          ? 'text-red-600'
                          : 'text-gray-600'
                      }`}
                    >
                      {progress.weightChange > 0 ? '+' : ''}
                      {progress.weightChange} kg
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        progress.status
                      )}`}
                    >
                      {getStatusIcon(progress.status)}
                      {getStatusText(progress.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
