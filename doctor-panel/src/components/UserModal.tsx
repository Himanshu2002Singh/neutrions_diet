import React, { useState, useEffect } from 'react';
import { X, User, Scale, Ruler, Activity, Target, Heart, Clock, AlertCircle, CheckCircle, Loader2, FileText, Download, Trash2 } from 'lucide-react';
import { AssignedUser, getUserDietFiles, downloadDietFile, deleteDietFile } from '../services/api';
import type { DietFile } from '../services/api';
import DietUploadModal from './DietUploadModal';

// Helper function to format numeric values safely
function formatNumericValue(value: number | string | null | undefined, decimals: number = 1): string {
  if (value === null || value === undefined) return 'N/A';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return 'N/A';
  return numValue.toFixed(decimals);
}

interface UserDetailsModalProps {
  user: AssignedUser;
  userDetails: any;
  loading: boolean;
  onClose: () => void;
  onUploadComplete?: () => void;
}

function UserDetailsModal({ user, userDetails, loading, onClose, onUploadComplete }: UserDetailsModalProps) {
  const data = userDetails || user;
  const healthProfile = data?.healthProfile || user.healthProfile;
  
  const [dietFiles, setDietFiles] = useState<DietFile[]>([]);
  const [dietFilesLoading, setDietFilesLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [deletingFile, setDeletingFile] = useState<number | null>(null);

  useEffect(() => {
    const fetchDietFiles = async () => {
      try {
        setDietFilesLoading(true);
        const response = await getUserDietFiles(user.id);
        if (response.success && response.data) {
          setDietFiles(response.data);
        }
      } catch (err) {
        console.error('Error fetching diet files:', err);
      } finally {
        setDietFilesLoading(false);
      }
    };

    fetchDietFiles();
  }, [user.id]);

  const formatGender = (gender: string) => {
    const genderMap: Record<string, string> = {
      male: 'Male',
      female: 'Female',
      other: 'Other'
    };
    return genderMap[gender] || gender;
  };

  const formatActivityLevel = (level: string) => {
    const levelMap: Record<string, string> = {
      sedentary: 'Sedentary',
      light: 'Lightly Active',
      moderate: 'Moderately Active',
      active: 'Active',
      very_active: 'Very Active'
    };
    return levelMap[level] || level;
  };

  const getBMICategoryColor = (category: string) => {
    const categoryLower = category?.toLowerCase() || '';
    if (categoryLower.includes('underweight')) return 'bg-blue-100 text-blue-800';
    if (categoryLower.includes('normal')) return 'bg-green-100 text-green-800';
    if (categoryLower.includes('overweight')) return 'bg-yellow-100 text-yellow-800';
    if (categoryLower.includes('obese')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const handleDownloadFile = async (fileId: number) => {
    try {
      await downloadDietFile(fileId);
    } catch (err: any) {
      console.error('Error downloading file:', err);
      alert('Failed to download file: ' + err.message);
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    if (!confirm('Are you sure you want to delete this diet file?')) {
      return;
    }

    try {
      setDeletingFile(fileId);
      const response = await deleteDietFile(fileId);
      if (response.success) {
        setDietFiles(prev => prev.filter(f => f.id !== fileId));
      }
    } catch (err: any) {
      console.error('Error deleting file:', err);
      alert('Failed to delete file: ' + err.message);
    } finally {
      setDeletingFile(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-bold text-lg">
                {user.userName.split(' ').map((n) => n[0]).join('').toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{user.userName}</h2>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-blue-600" size={32} />
              <span className="ml-2 text-gray-600">Loading user details...</span>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <User size={20} />
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Age:</span>
                    <span className="font-medium text-gray-900">{data.age || user.age} years</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Gender:</span>
                    <span className="font-medium text-gray-900">{formatGender(data.gender || user.gender)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Phone:</span>
                    <span className="font-medium text-gray-900">{data.phone || user.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Activity:</span>
                    <span className="font-medium text-gray-900">{formatActivityLevel(data.activityLevel || user.activityLevel)}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Scale size={20} />
                    Body Metrics
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Weight</span>
                      <span className="font-bold text-blue-600">{healthProfile?.weight || user.weight} kg</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Height</span>
                      <span className="font-bold text-blue-600">{healthProfile?.height || user.height} cm</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Ideal Weight Range</span>
                      <span className="font-bold text-blue-600">
                        {formatNumericValue(healthProfile?.idealWeightMin, 1)} - {formatNumericValue(healthProfile?.idealWeightMax, 1)} kg
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Activity size={20} />
                    BMI & Metabolism
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">BMI</span>
                      <span className="font-bold text-purple-600">{formatNumericValue(healthProfile?.bmi, 1)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Category:</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getBMICategoryColor(healthProfile?.bmiCategory)}`}>
                        {healthProfile?.bmiCategory || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">BMR</span>
                      <span className="font-bold text-purple-600">{healthProfile?.bmr || 'N/A'} kcal/day</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Daily Calories</span>
                      <span className="font-bold text-purple-600">{healthProfile?.dailyCalories || 'N/A'} kcal</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Heart size={20} />
                  Medical Conditions
                </h3>
                {healthProfile?.medicalConditions && healthProfile.medicalConditions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {healthProfile.medicalConditions.map((condition: string, index: number) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                      >
                        {condition}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 flex items-center gap-2">
                    <CheckCircle size={16} />
                    No medical conditions reported
                  </p>
                )}
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Target size={20} />
                  Goals
                </h3>
                {healthProfile?.goals && healthProfile.goals.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {healthProfile.goals.map((goal: string, index: number) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                      >
                        {goal}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No goals specified</p>
                )}
              </div>

              {healthProfile?.dietRecommendation && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Target size={20} />
                    Diet Recommendations
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{healthProfile.dietRecommendation.protein}g</div>
                      <div className="text-sm text-gray-500">Protein</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{healthProfile.dietRecommendation.carbs}g</div>
                      <div className="text-sm text-gray-500">Carbs</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{healthProfile.dietRecommendation.fats}g</div>
                      <div className="text-sm text-gray-500">Fats</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{healthProfile.dailyCalories}</div>
                      <div className="text-sm text-gray-500">Daily Calories</div>
                    </div>
                  </div>
                  
                  {healthProfile.dietRecommendation.meals && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-700 mb-2">Meal Plan:</h4>
                      <p className="text-gray-600 text-sm">{healthProfile.dietRecommendation.meals}</p>
                    </div>
                  )}
                  
                  {healthProfile.dietRecommendation.foods && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-700 mb-2">Recommended Foods:</h4>
                      <p className="text-gray-600 text-sm">{healthProfile.dietRecommendation.foods}</p>
                    </div>
                  )}
                  
                  {healthProfile.dietRecommendation.restrictions && healthProfile.dietRecommendation.restrictions.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-700 mb-2">Restrictions:</h4>
                      <div className="flex flex-wrap gap-2">
                        {healthProfile.dietRecommendation.restrictions.map((restriction: string, index: number) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm"
                          >
                            {restriction}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {healthProfile.dietRecommendation.medicalRecommendations && healthProfile.dietRecommendation.medicalRecommendations.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Medical Recommendations:</h4>
                      <div className="flex flex-wrap gap-2">
                        {healthProfile.dietRecommendation.medicalRecommendations.map((rec: string, index: number) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm flex items-center gap-1"
                          >
                            <AlertCircle size={12} />
                            {rec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <FileText size={20} />
                    Diet Files
                  </h3>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
                  >
                    <FileText size={16} />
                    Upload Diet
                  </button>
                </div>

                {dietFilesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-green-600" size={24} />
                    <span className="ml-2 text-gray-600">Loading diet files...</span>
                  </div>
                ) : dietFiles.length > 0 ? (
                  <div className="space-y-3">
                    {dietFiles.map((file) => (
                      <div 
                        key={file.id}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <FileText className="text-red-600" size={20} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{file.originalName}</p>
                            <p className="text-sm text-gray-500">
                              {formatFileSize(file.fileSize)} • Uploaded {new Date(file.createdAt).toLocaleDateString()}
                            </p>
                            {file.description && (
                              <p className="text-sm text-gray-600 mt-1">{file.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDownloadFile(file.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Download"
                          >
                            <Download size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteFile(file.id)}
                            disabled={deletingFile === file.id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            {deletingFile === file.id ? (
                              <Loader2 className="animate-spin" size={18} />
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p>No diet files uploaded yet</p>
                    <p className="text-sm mt-1">Click "Upload Diet" to add a diet plan PDF</p>
                  </div>
                )}
              </div>

              {/* Assignment Info */}
              {data.assignedAt && (
                <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-2 text-sm text-gray-500">
                  <Clock size={16} />
                  Assigned on {new Date(data.assignedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <FileText size={18} />
            Upload Diet Plan
          </button>
        </div>

      {/* Diet Upload Modal */}
      {showUploadModal && (
        <DietUploadModal
          userId={user.id}
          userName={user.userName}
          onClose={() => setShowUploadModal(false)}
          onUploadComplete={() => {
            // Refresh diet files
            getUserDietFiles(user.id).then(response => {
              if (response.success && response.data) {
                setDietFiles(response.data);
              }
            });
            // Notify parent
            onUploadComplete?.();
          }}
        />
      )}
      </div>
    </div>
  );
}

export default UserDetailsModal;
