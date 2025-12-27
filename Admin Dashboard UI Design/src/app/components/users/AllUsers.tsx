import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  subscription: 'Free' | 'Basic' | 'Standard' | 'Premium';
  status: 'active' | 'inactive' | 'pending';
}

const dummyUsers: User[] = [
  {
    id: 1,
    name: 'Alice Brown',
    email: 'alice.brown@email.com',
    phone: '+1 234-567-1001',
    joinDate: '2024-01-15',
    subscription: 'Premium',
    status: 'active',
  },
  {
    id: 2,
    name: 'David Wilson',
    email: 'david.wilson@email.com',
    phone: '+1 234-567-1002',
    joinDate: '2024-02-01',
    subscription: 'Basic',
    status: 'active',
  },
  {
    id: 3,
    name: 'Emma Davis',
    email: 'emma.davis@email.com',
    phone: '+1 234-567-1003',
    joinDate: '2024-01-20',
    subscription: 'Premium',
    status: 'active',
  },
  {
    id: 4,
    name: 'James Taylor',
    email: 'james.taylor@email.com',
    phone: '+1 234-567-1004',
    joinDate: '2024-02-10',
    subscription: 'Standard',
    status: 'active',
  },
  {
    id: 5,
    name: 'Sophia Martinez',
    email: 'sophia.martinez@email.com',
    phone: '+1 234-567-1005',
    joinDate: '2024-03-05',
    subscription: 'Free',
    status: 'pending',
  },
  {
    id: 6,
    name: 'Oliver Johnson',
    email: 'oliver.johnson@email.com',
    phone: '+1 234-567-1006',
    joinDate: '2024-02-28',
    subscription: 'Basic',
    status: 'inactive',
  },
  {
    id: 7,
    name: 'Isabella Garcia',
    email: 'isabella.garcia@email.com',
    phone: '+1 234-567-1007',
    joinDate: '2024-03-12',
    subscription: 'Standard',
    status: 'active',
  },
  {
    id: 8,
    name: 'Liam Brown',
    email: 'liam.brown@email.com',
    phone: '+1 234-567-1008',
    joinDate: '2024-01-08',
    subscription: 'Premium',
    status: 'active',
  },
];

export default function AllUsers() {
  const getSubscriptionColor = (subscription: User['subscription']) => {
    switch (subscription) {
      case 'Free':
        return 'bg-gray-100 text-gray-800';
      case 'Basic':
        return 'bg-blue-100 text-blue-800';
      case 'Standard':
        return 'bg-purple-100 text-purple-800';
      case 'Premium':
        return 'bg-amber-100 text-amber-800';
    }
  };

  const getStatusIcon = (status: User['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={18} className="text-green-600" />;
      case 'inactive':
        return <XCircle size={18} className="text-red-600" />;
      case 'pending':
        return <Clock size={18} className="text-yellow-600" />;
    }
  };

  const getStatusText = (status: User['status']) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">All Users</h1>
        <p className="text-gray-600 mt-2">View and manage all registered users on the platform</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Total Users</p>
          <p className="text-3xl font-bold text-gray-900">{dummyUsers.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Active</p>
          <p className="text-3xl font-bold text-green-600">
            {dummyUsers.filter((u) => u.status === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Inactive</p>
          <p className="text-3xl font-bold text-red-600">
            {dummyUsers.filter((u) => u.status === 'inactive').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Pending</p>
          <p className="text-3xl font-bold text-yellow-600">
            {dummyUsers.filter((u) => u.status === 'pending').length}
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Phone</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Join Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Subscription</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dummyUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.phone}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(user.joinDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getSubscriptionColor(
                        user.subscription
                      )}`}
                    >
                      {user.subscription}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(user.status)}
                      <span className="text-sm text-gray-600">{getStatusText(user.status)}</span>
                    </div>
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
