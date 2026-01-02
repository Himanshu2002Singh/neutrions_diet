// ============================================
// FILE: src/components/Dashboard.tsx
// ============================================
import React from 'react';
import { Users, Activity, Calendar, AlertCircle } from 'lucide-react';
import { dashboardStats } from '../data/mock';

function Dashboard() {
  const stats = [
    { label: 'Total Patients', value: dashboardStats.totalPatients, icon: Users, color: 'bg-blue-500' },
    { label: 'Active Patients', value: dashboardStats.activePatients, icon: Activity, color: 'bg-green-500' },
    { label: 'Appointments Today', value: dashboardStats.appointments, icon: Calendar, color: 'bg-purple-500' },
    { label: 'Critical Cases', value: dashboardStats.criticalCases, icon: AlertCircle, color: 'bg-red-500' }
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activities</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 pb-4 border-b">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Activity className="text-green-600" size={20} />
              </div>
              <div className="flex-1">
                <p className="text-gray-800 font-medium">New patient assigned</p>
                <p className="text-gray-500 text-sm">Raj Kumar - 2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 pb-4 border-b">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="text-blue-600" size={20} />
              </div>
              <div className="flex-1">
                <p className="text-gray-800 font-medium">Appointment scheduled</p>
                <p className="text-gray-500 text-sm">Priya Sharma - 4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <AlertCircle className="text-purple-600" size={20} />
              </div>
              <div className="flex-1">
                <p className="text-gray-800 font-medium">Progress report updated</p>
                <p className="text-gray-500 text-sm">Amit Patel - 6 hours ago</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Upcoming Appointments</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <p className="text-gray-800 font-medium">Raj Kumar</p>
                <p className="text-gray-500 text-sm">10:00 AM - Checkup</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">Today</span>
            </div>
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <p className="text-gray-800 font-medium">Priya Sharma</p>
                <p className="text-gray-500 text-sm">2:30 PM - Follow-up</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">Today</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-800 font-medium">Amit Patel</p>
                <p className="text-gray-500 text-sm">11:00 AM - Consultation</p>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">Tomorrow</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;