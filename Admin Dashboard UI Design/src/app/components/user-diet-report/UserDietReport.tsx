import { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  RefreshCw,
  AlertCircle,
  FileText,
  User,
  Mail,
  Phone,
  Calendar,
  Award,
  Stethoscope,
  Eye,
  Download
} from 'lucide-react';
import { apiService, type UserDietReport as UserDietReportType, type UserDietReportResponse } from '../../../services/api';

export default function UserDietReport() {
  const [users, setUsers] = useState<UserDietReportType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [selectedDietFile, setSelectedDietFile] = useState<{fileName: string; userName: string; fileId: number} | null>(null);

  const fetchUserDietReport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getUserDietReport(100, 0);

      if (response.success && response.data) {
        setUsers(response.data);
        
        // Calculate stats
        const uploaded = response.data.filter(u => u.dietStatus.status === 'uploaded').length;
        const pending = response.data.filter(u => u.dietStatus.status === 'pending').length;
        
        setUploadedCount(uploaded);
        setPendingCount(pending);
        setTotalCount(response.data.length);
      } else {
        throw new Error(response.message || 'Failed to fetch user diet report');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user diet report');
      console.error('Error fetching user diet report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDietReport();
  }, []);

  const handleRefresh = () => {
    fetchUserDietReport();
  };

  const handleDownload = async (fileId: number) => {
    try {
      await apiService.downloadDietFile(fileId);
    } catch (err: any) {
      console.error('Error downloading file:', err);
      alert('Failed to download file. Please try again.');
    }
  };

  const getStatusBadge = (status: string, statusText: string) => {
    const isUploaded = status === 'uploaded';
    return (
      <div className="flex items-center gap-2">
        {isUploaded ? (
          <CheckCircle size={18} className="text-green-600" />
        ) : (
          <Clock size={18} className="text-yellow-600" />
        )}
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            isUploaded
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {statusText}
        </span>
      </div>
    );
  };

  const getSubscriptionColor = (subscription: string) => {
    switch (subscription) {
      case 'Premium':
        return 'bg-amber-100 text-amber-800';
      case 'Standard':
        return 'bg-purple-100 text-purple-800';
      case 'Basic':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading user diet report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={18} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Diet Report</h1>
          <p className="text-gray-600 mt-2">
            View users with assigned doctors and their diet upload status
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{totalCount}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <User className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Diet Uploaded</p>
              <p className="text-3xl font-bold text-green-600">{uploadedCount}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Upload Rate</p>
              <p className="text-3xl font-bold text-blue-600">
                {totalCount > 0 ? Math.round((uploadedCount / totalCount) * 100) : 0}%
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileText className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {users.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No users with assigned doctors found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Phone</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Age</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Subscription</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Doctor Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Diet Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="text-blue-600" size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">
                            Joined {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-600">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-600">{user.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-600">{user.age}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getSubscriptionColor(
                          user.subscription
                        )}`}
                      >
                        <Award size={14} className="mr-1" />
                        {user.subscription}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.assignedDoctor ? (
                        <span className="text-sm font-medium text-gray-900">
                          {user.assignedDoctor.name}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">Not assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(user.dietStatus.status, user.dietStatus.statusText)}
                    </td>
                    <td className="px-6 py-4">
                      {user.dietStatus.status === 'uploaded' && user.dietStatus.dietFileId ? (
                        <button
                          onClick={() => setSelectedDietFile({
                            fileName: user.dietStatus.dietFileName!,
                            userName: user.name,
                            fileId: user.dietStatus.dietFileId!
                          })}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-xs font-medium"
                        >
                          <Eye size={14} />
                          View Diet Chart
                        </button>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Diet Chart View Modal */}
      {selectedDietFile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Diet Chart Details</h3>
              <button
                onClick={() => setSelectedDietFile(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <FileText className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">File Name</p>
                    <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                      {selectedDietFile.fileName}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <User className="text-purple-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">User</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedDietFile.userName}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => selectedDietFile && handleDownload(selectedDietFile.fileId)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Download size={18} />
                Download
              </button>
              <button
                onClick={() => setSelectedDietFile(null)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

