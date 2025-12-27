import React, { useState } from 'react';
import { Calendar, Eye } from 'lucide-react';
import { mockUsers } from '../data/mock';
import ProgressDetailView from './ProgressDetails';

const ProgressReport: React.FC = () => {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  if (selectedUserId !== null) {
    return <ProgressDetailView userId={selectedUserId} onBack={() => setSelectedUserId(null)} />;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Progress Report</h1>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Age</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Weight</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Updated</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mockUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.age}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.weight}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="flex items-center text-gray-600">
                    <Calendar size={16} className="mr-2" />
                    Dec 24, 2024
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => setSelectedUserId(user.id)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    <Eye size={16} className="mr-2" />
                    View Progress
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProgressReport;