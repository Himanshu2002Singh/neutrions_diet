import { useState } from 'react';
import { X, Eye } from 'lucide-react';

interface HealthDetails {
  medicalIssues: string;
  weight: number;
  height: number;
  allergies: string;
  medications: string;
  dietaryRestrictions: string;
}

interface Request {
  id: number;
  userName: string;
  email: string;
  phone: string;
  age: number;
  plan: string;
  amount: string;
  healthDetails: HealthDetails;
}

const dummyRequests: Request[] = [
  {
    id: 1,
    userName: 'Alice Brown',
    email: 'alice.brown@email.com',
    phone: '+1 234-567-1001',
    age: 28,
    plan: 'Premium Plan',
    amount: '$49.99/month',
    healthDetails: {
      medicalIssues: 'Diabetes Type 2, Hypertension',
      weight: 75,
      height: 165,
      allergies: 'Peanuts, Shellfish',
      medications: 'Metformin 500mg, Lisinopril 10mg',
      dietaryRestrictions: 'Low sodium, Sugar-free',
    },
  },
  {
    id: 2,
    userName: 'David Wilson',
    email: 'david.wilson@email.com',
    phone: '+1 234-567-1002',
    age: 35,
    plan: 'Basic Plan',
    amount: '$29.99/month',
    healthDetails: {
      medicalIssues: 'Obesity, Sleep Apnea',
      weight: 95,
      height: 178,
      allergies: 'None',
      medications: 'None',
      dietaryRestrictions: 'Calorie restricted diet',
    },
  },
  {
    id: 3,
    userName: 'Emma Davis',
    email: 'emma.davis@email.com',
    phone: '+1 234-567-1003',
    age: 42,
    plan: 'Premium Plan',
    amount: '$49.99/month',
    healthDetails: {
      medicalIssues: 'PCOS, Insulin Resistance',
      weight: 68,
      height: 160,
      allergies: 'Lactose intolerance',
      medications: 'Metformin ER 750mg',
      dietaryRestrictions: 'Low GI, Dairy-free',
    },
  },
  {
    id: 4,
    userName: 'James Taylor',
    email: 'james.taylor@email.com',
    phone: '+1 234-567-1004',
    age: 31,
    plan: 'Standard Plan',
    amount: '$39.99/month',
    healthDetails: {
      medicalIssues: 'IBS, Anxiety',
      weight: 72,
      height: 175,
      allergies: 'Gluten sensitivity',
      medications: 'Probiotic supplements',
      dietaryRestrictions: 'Gluten-free, Low FODMAP',
    },
  },
];

export default function AssignDietician() {
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Assign Dietician Requests</h1>
        <p className="text-gray-600 mt-2">Review and assign dieticians to user requests</p>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">User Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Phone</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Age</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Plan</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Health Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dummyRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900">{request.userName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{request.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{request.phone}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{request.age}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {request.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{request.amount}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <Eye size={18} />
                      <span className="text-sm font-medium">View Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Health Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Health Details</h2>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {/* User Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">User Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="text-sm font-medium text-gray-900">{selectedRequest.userName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Age</p>
                    <p className="text-sm font-medium text-gray-900">{selectedRequest.age} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-sm font-medium text-gray-900">{selectedRequest.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="text-sm font-medium text-gray-900">{selectedRequest.phone}</p>
                  </div>
                </div>
              </div>

              {/* Health Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medical Issues</label>
                  <p className="text-sm text-gray-900 p-3 bg-gray-50 rounded-lg">
                    {selectedRequest.healthDetails.medicalIssues}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                    <p className="text-sm text-gray-900 p-3 bg-gray-50 rounded-lg">
                      {selectedRequest.healthDetails.weight} kg
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                    <p className="text-sm text-gray-900 p-3 bg-gray-50 rounded-lg">
                      {selectedRequest.healthDetails.height} cm
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
                  <p className="text-sm text-gray-900 p-3 bg-gray-50 rounded-lg">
                    {selectedRequest.healthDetails.allergies}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Medications</label>
                  <p className="text-sm text-gray-900 p-3 bg-gray-50 rounded-lg">
                    {selectedRequest.healthDetails.medications}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dietary Restrictions</label>
                  <p className="text-sm text-gray-900 p-3 bg-gray-50 rounded-lg">
                    {selectedRequest.healthDetails.dietaryRestrictions}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 pt-6 border-t">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Assign Dietician
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
