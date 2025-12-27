import React, { useState } from 'react';
import { ArrowLeft, Calendar, TrendingDown, Activity, Footprints } from 'lucide-react';
import { mockProgressData, mockUsers } from '../data/mock';

interface ProgressDetailViewProps {
  userId: number;
  onBack: () => void;
}

const ProgressDetailView: React.FC<ProgressDetailViewProps> = ({ userId, onBack }) => {
  const [filter, setFilter] = useState<'day' | 'week' | 'month'>('week');
  
  const user = mockUsers.find(u => u.id === userId);
  
  const getFilteredData = () => {
    const today = new Date('2024-12-25');
    return mockProgressData.filter(record => {
      const recordDate = new Date(record.date);
      const diffTime = Math.abs(today.getTime() - recordDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (filter === 'day') return diffDays <= 1;
      if (filter === 'week') return diffDays <= 7;
      if (filter === 'month') return diffDays <= 30;
      return true;
    });
  };

  const filteredData = getFilteredData();

  return (
    <div>
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="mr-4 p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{user?.name}'s Progress</h1>
          <p className="text-gray-600 mt-1">Detailed progress tracking and analytics</p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('day')}
            className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'day' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          >
            Daily
          </button>
          <button
            onClick={() => setFilter('week')}
            className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'week' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          >
            Weekly
          </button>
          <button
            onClick={() => setFilter('month')}
            className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'month' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          >
            Monthly
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Current Weight</p>
              <p className="text-2xl font-bold text-gray-800">74 kg</p>
            </div>
            <TrendingDown className="text-green-500" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Blood Pressure</p>
              <p className="text-2xl font-bold text-gray-800">118/78</p>
            </div>
            <Activity className="text-blue-500" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Blood Sugar</p>
              <p className="text-2xl font-bold text-gray-800">100 mg/dL</p>
            </div>
            <Activity className="text-purple-500" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Avg Steps</p>
              <p className="text-2xl font-bold text-gray-800">10,200</p>
            </div>
            <Footprints className="text-orange-500" size={32} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">BP</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Blood Sugar</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Steps</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Calories</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredData.map((record, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="flex items-center text-gray-700">
                    <Calendar size={16} className="mr-2 text-gray-400" />
                    {record.date}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{record.weight}</td>
                <td className="px-6 py-4 whitespace-nowrap">{record.bp}</td>
                <td className="px-6 py-4 whitespace-nowrap">{record.bloodSugar} mg/dL</td>
                <td className="px-6 py-4 whitespace-nowrap">{record.steps?.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">{record.calories} kcal</td>
                <td className="px-6 py-4">{record.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProgressDetailView;