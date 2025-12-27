import { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface Dietician {
  id: number;
  name: string;
  email: string;
  phone: string;
  degree: string;
  experience: number;
  age: number;
  currentWorking: string;
}

const dummyDieticians: Dietician[] = [
  {
    id: 1,
    name: 'Dr. Emily Johnson',
    email: 'emily.johnson@health.com',
    phone: '+1 234-567-8901',
    degree: 'Ph.D. in Nutrition',
    experience: 8,
    age: 35,
    currentWorking: 'City Health Center',
  },
  {
    id: 2,
    name: 'Dr. Michael Chen',
    email: 'michael.chen@health.com',
    phone: '+1 234-567-8902',
    degree: 'M.Sc. Dietetics',
    experience: 5,
    age: 32,
    currentWorking: 'Wellness Clinic',
  },
  {
    id: 3,
    name: 'Dr. Sarah Williams',
    email: 'sarah.williams@health.com',
    phone: '+1 234-567-8903',
    degree: 'B.Sc. Nutrition Science',
    experience: 3,
    age: 28,
    currentWorking: 'Community Hospital',
  },
  {
    id: 4,
    name: 'Dr. Robert Anderson',
    email: 'robert.anderson@health.com',
    phone: '+1 234-567-8904',
    degree: 'Ph.D. Clinical Nutrition',
    experience: 12,
    age: 42,
    currentWorking: 'Medical Research Institute',
  },
];

export default function AddDietician() {
  const [showModal, setShowModal] = useState(false);
  const [verified, setVerified] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', { ...formData, verified });
    setShowModal(false);
    setFormData({ name: '', email: '', password: '' });
    setVerified(true);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dieticians</h1>
          <p className="text-gray-600 mt-2">Manage your dieticians and add new ones</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Dietician
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Phone</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Degree</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Experience</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Age</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Current Working</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dummyDieticians.map((dietician) => (
                <tr key={dietician.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900">{dietician.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{dietician.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{dietician.phone}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{dietician.degree}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{dietician.experience} years</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{dietician.age}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{dietician.currentWorking}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Dietician Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Add New Dietician</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Enter name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Enter email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Enter password"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Verified</label>
                <button
                  type="button"
                  onClick={() => setVerified(!verified)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    verified ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      verified ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Dietician
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
