// ============================================
// FILE: src/components/AssignedUsers.tsx
// ============================================
import React, { useState } from 'react';
import { Eye, Upload } from 'lucide-react';
import { User } from '../types';
import { mockUsers } from '../data/mock';
import UserDetailsModal from './UserModal';

const AssignedUsers: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const handleUploadDiet = (userId: number) => {
    alert(`Diet chart upload functionality for user ID: ${userId}`);
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Assigned Users</h1>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Age</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Height</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mockUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.age}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.weight}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.height}</td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <button
                    onClick={() => handleViewDetails(user)}
                    className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    <Eye size={16} className="mr-1" />
                    View Details
                  </button>
                  <button
                    onClick={() => handleUploadDiet(user.id)}
                    className="inline-flex items-center px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    <Upload size={16} className="mr-1" />
                    Upload Diet
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showDetailsModal && selectedUser && (
        <UserDetailsModal user={selectedUser} onClose={() => setShowDetailsModal(false)} />
      )}
    </div>
  );
};

export default AssignedUsers;