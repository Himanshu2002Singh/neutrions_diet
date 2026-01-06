import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Download, 
  Trash2, 
  FileText, 
  Calendar, 
  User, 
  Stethoscope,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { apiService } from '../../../services/api';

// TypeScript interfaces
interface DietFile {
  id: number;
  userId: number;
  doctorId: number;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  user?: {
    id: number;
    userName: string;
    email: string;
    phone: string;
  };
  doctor?: {
    id: number;
    name: string;
    email: string;
  };
}

interface DietFileStats {
  totalFiles: number;
  totalSize: number;
  filesThisMonth: number;
  uniqueUsers: number;
}

function DietFilesManagement() {
  const [dietFiles, setDietFiles] = useState<DietFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 10;
  
  // Stats
  const [stats, setStats] = useState<DietFileStats | null>(null);
  
  // Search
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Fetch diet files
  const fetchDietFiles = async (page = 1, search = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const offset = (page - 1) * limit;
      const response = await apiService.getAllDietFiles(limit, offset, undefined, undefined, search);
      
      if (response.success && response.data) {
        setDietFiles(response.data);
        setTotalCount(response.count || 0);
        setTotalPages(response.totalPages || 1);
      } else {
        setError(response.message || 'Failed to fetch diet files');
      }
    } catch (err: any) {
      console.error('Error fetching diet files:', err);
      setError(err.message || 'An error occurred while fetching diet files');
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await apiService.getDietFileStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Initial load
  useEffect(() => {
    fetchDietFiles(1);
    fetchStats();
  }, []);

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      setCurrentPage(1);
      fetchDietFiles(1, value);
    }, 500);
    
    setSearchTimeout(timeout);
  };

  // Handle download
  const handleDownload = async (fileId: number, fileName: string) => {
    try {
      await apiService.downloadDietFile(fileId);
      setSuccess(`Downloading ${fileName}...`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error downloading file:', err);
      setError(err.message || 'Failed to download file');
      setTimeout(() => setError(null), 5000);
    }
  };

  // Handle delete
  const handleDelete = async (fileId: number, fileName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.deleteDietFile(fileId);
      
      if (response.success) {
        setSuccess('File deleted successfully');
        fetchDietFiles(currentPage, searchTerm);
        fetchStats();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || 'Failed to delete file');
      }
    } catch (err: any) {
      console.error('Error deleting file:', err);
      setError(err.message || 'An error occurred while deleting the file');
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchDietFiles(newPage, searchTerm);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Diet Files Management</h1>
        <p className="text-gray-600">View and manage all diet PDF files uploaded by doctors</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Files</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalFiles}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-full">
                <Calendar className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">This Month</p>
                <p className="text-2xl font-bold text-gray-800">{stats.filesThisMonth}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-full">
                <User className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Unique Users</p>
                <p className="text-2xl font-bold text-gray-800">{stats.uniqueUsers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Stethoscope className="text-yellow-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Storage</p>
                <p className="text-2xl font-bold text-gray-800">{formatFileSize(stats.totalSize)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          {success}
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow mb-4 p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by file name, user name, or doctor name..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          
          <button
            onClick={() => fetchDietFiles(1, searchTerm)}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-blue-600" size={32} />
            <span className="ml-2 text-gray-600">Loading diet files...</span>
          </div>
        ) : dietFiles.length > 0 ? (
          <>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">File</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Doctor</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Size</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Uploaded</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {dietFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                          <FileText className="text-red-600" size={20} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{file.originalName}</p>
                          <p className="text-sm text-gray-500">{file.mimeType}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {file.user ? (
                        <div>
                          <p className="font-medium text-gray-800">{file.user.userName}</p>
                          <p className="text-sm text-gray-500">{file.user.email}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">Unknown User</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {file.doctor ? (
                        <div>
                          <p className="font-medium text-gray-800">{file.doctor.name}</p>
                          <p className="text-sm text-gray-500">{file.doctor.email}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">Unknown Doctor</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-gray-600">{formatFileSize(file.fileSize)}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-gray-600">{formatDate(file.createdAt)}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDownload(file.id, file.originalName)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(file.id, file.originalName)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalCount)} of {totalCount} files
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">No Diet Files Found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'No files match your search criteria' : 'No diet files have been uploaded yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DietFilesManagement;

