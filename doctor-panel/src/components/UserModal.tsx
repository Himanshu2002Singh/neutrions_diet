// FILE: src/components/UserDetailsModal.tsx
// ============================================
import React from 'react';
import { X } from 'lucide-react';
import { User } from '../types';

interface UserDetailsModalProps {
  user: User;
  onClose: () => void;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ user, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">User Details</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Name</label>
                <p className="mt-1 text-lg text-gray-900">{user.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Age</label>
                <p className="mt-1 text-lg text-gray-900">{user.age} years</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Weight</label>
                <p className="mt-1 text-lg text-gray-900">{user.weight}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Height</label>
                <p className="mt-1 text-lg text-gray-900">{user.height}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Phone</label>
                <p className="mt-1 text-lg text-gray-900">{user.phone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Email</label>
                <p className="mt-1 text-lg text-gray-900">{user.email}</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600">Address</label>
              <p className="mt-1 text-lg text-gray-900">{user.address}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600">Medical History</label>
              <p className="mt-1 text-lg text-gray-900">{user.medicalHistory}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600">Current Medication</label>
              <p className="mt-1 text-lg text-gray-900">{user.currentMedication}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600">Diet Plan</label>
              <p className="mt-1 text-lg text-gray-900">{user.dietPlan}</p>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button onClick={onClose} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;