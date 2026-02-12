import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { 
  Heart, 
  Target, 
  Activity, 
  Save, 
  RotateCcw, 
  User,
  Upload,
  FileText,
  Trash2,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import { calculateAllHealthMetrics } from '../../../utils/healthCalculations';
import { BMICalculation } from '../../../types/health';
import { apiService } from '../../../services/api';

interface Health_ProfileProps {
  initialData?: {
    height?: string;
    weight?: string;
    age?: string;
    gender?: 'male' | 'female';
    activityLevel?: string;
    goals?: string[];
    medicalConditions?: string;
    allergies?: string;
  };
  onProfileUpdate?: (profileData: any) => void;
}

// Status type
type DietStatus = {
  profileFilled: boolean;
  assigned: boolean;
  dietPlanExists: boolean;
  status: 'not_filled' | 'pending_assignment' | 'pending_approval' | 'approved';
  statusText: string;
  statusColor: string;
  assignedDietician: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: string;
    assignedAt: string | null;
  } | null;
  healthProfile: {
    age: number;
    weight: number;
    height: number;
    gender: string;
    activityLevel: string;
  } | null;
};

// Medical Document type
interface MedicalDocument {
  id: number;
  userId: number;
  fileName: string;
  originalName: string;
  documentType: string;
  description: string | null;
  createdAt: string;
}

export function Health_Profile({ initialData = {}, onProfileUpdate }: Health_ProfileProps) {
  const [formData, setFormData] = useState({
    height: initialData.height || '170',
    weight: initialData.weight || '70',
    age: initialData.age || '25',
    gender: initialData.gender || 'male',
    activityLevel: initialData.activityLevel || 'moderately-active',
    goals: initialData.goals || ['maintain-weight'],
    medicalConditions: initialData.medicalConditions || '',
    allergies: initialData.allergies || '',
  });

  const [bmiCalculation, setBmiCalculation] = useState<BMICalculation | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Diet status
  const [dietStatus, setDietStatus] = useState<DietStatus | null>(null);
  
  // Medical documents
  const [medicalDocuments, setMedicalDocuments] = useState<MedicalDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadDocumentType, setUploadDocumentType] = useState('lab_report');
  const [uploadDescription, setUploadDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  
  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get userId from localStorage
  const getUserId = useCallback(() => {
    let userId = localStorage.getItem('userId');
    if (userId) return parseInt(userId);

    const savedUser = localStorage.getItem('neutrion-user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        return userData.id || userData.userId || null;
      } catch {
        return null;
      }
    }
    return null;
  }, []);

  // Fetch diet status
  const fetchDietStatus = useCallback(async () => {
    const userId = getUserId();
    if (!userId) return;

    try {
      const response = await apiService.getDietStatus(userId);
      if (response.success) {
        setDietStatus(response.data);
      }
    } catch (error) {
      console.error('Error fetching diet status:', error);
    }
  }, [getUserId]);

  // Fetch medical documents
  const fetchMedicalDocuments = useCallback(async () => {
    const userId = getUserId();
    if (!userId) return;

    try {
      const response = await apiService.getMedicalDocuments(userId);
      if (response.success) {
        setMedicalDocuments(response.data);
      }
    } catch (error) {
      console.error('Error fetching medical documents:', error);
    }
  }, [getUserId]);

  // Load existing data from localStorage on mount
  useEffect(() => {
    const loadExistingData = async () => {
      const userId = getUserId();
      
      // Try to load from localStorage first
      const localData = localStorage.getItem('neutrion-health-profile');
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          setFormData(prev => ({
            height: parsed.height || prev.height,
            weight: parsed.weight || prev.weight,
            age: parsed.age || prev.age,
            gender: parsed.gender || prev.gender,
            activityLevel: parsed.activityLevel || prev.activityLevel,
            goals: parsed.goals || prev.goals,
            medicalConditions: parsed.medicalConditions || prev.medicalConditions,
            allergies: parsed.allergies || prev.allergies,
          }));
          setIsLoading(false);
          return;
        } catch (e) {
          console.error('Error parsing local health profile:', e);
        }
      }

      // If user is logged in, try to fetch from backend
      if (userId) {
        try {
          const token = localStorage.getItem('neutrion_token');
          const response = await fetch(`http://localhost:3002/api/health/profile/${userId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              const profile = data.data;
              setFormData(prev => ({
                height: profile.height?.toString() || prev.height,
                weight: profile.weight?.toString() || prev.weight,
                age: profile.age?.toString() || prev.age,
                gender: profile.gender || prev.gender,
                activityLevel: profile.activityLevel || prev.activityLevel,
                goals: profile.goals || prev.goals,
                medicalConditions: profile.medicalConditions || prev.medicalConditions,
                allergies: profile.allergies || prev.allergies,
              }));
            }
          }
        } catch (error) {
          console.error('Error fetching health profile from backend:', error);
        }
      }

      setIsLoading(false);
    };

    loadExistingData();
  }, [getUserId]);

  // Fetch diet status and medical documents after loading
  useEffect(() => {
    if (!isLoading) {
      fetchDietStatus();
      fetchMedicalDocuments();
    }
  }, [isLoading, fetchDietStatus, fetchMedicalDocuments]);

  // Calculate BMI when form data changes
  useEffect(() => {
    const heightNum = parseFloat(formData.height);
    const weightNum = parseFloat(formData.weight);
    const ageNum = parseInt(formData.age);

    if (heightNum > 0 && weightNum > 0 && ageNum > 0) {
      const calculation = calculateAllHealthMetrics(
        heightNum,
        weightNum,
        ageNum,
        formData.gender,
        formData.activityLevel
      );
      setBmiCalculation(calculation);
    }
  }, [formData.height, formData.weight, formData.age, formData.gender, formData.activityLevel]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleGoalToggle = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    const profileData = {
      ...formData,
      bmiCalculation,
      timestamp: new Date().toISOString()
    };

    // Save to localStorage
    localStorage.setItem('neutrion-health-profile', JSON.stringify(profileData));

    // Also try to save to backend if user is logged in
    const userId = getUserId();
    if (userId) {
      try {
        const token = localStorage.getItem('neutrion_token');
        // Map activity level to match backend expected values
        const activityLevelMap: Record<string, string> = {
          'sedentary': 'sedentary',
          'lightly-active': 'light',
          'moderately-active': 'moderate',
          'very-active': 'active',
          'extremely-active': 'very_active'
        };

        await fetch(`https://api.nutreazy.in/api/health/submit/${userId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            weight: parseFloat(formData.weight),
            height: parseFloat(formData.height),
            age: parseInt(formData.age),
            gender: formData.gender,
            activityLevel: activityLevelMap[formData.activityLevel] || 'moderate',
            medicalConditions: formData.medicalConditions,
            allergies: formData.allergies,
            goals: JSON.stringify(formData.goals),
          }),
        });
        
        // Refresh diet status after saving
        fetchDietStatus();
      } catch (error) {
        console.error('Error saving health profile to backend:', error);
      }
    }
    
    // Notify parent component
    if (onProfileUpdate) {
      onProfileUpdate(profileData);
    }

    setIsDirty(false);
  };

  const handleReset = () => {
    setFormData({
      height: '170',
      weight: '70',
      age: '25',
      gender: 'male',
      activityLevel: 'moderately-active',
      goals: ['maintain-weight'],
      medicalConditions: '',
      allergies: '',
    });
    setIsDirty(true);
  };

  const goalOptions = [
    { value: 'lose-weight', label: 'Lose Weight', color: 'bg-red-100 text-red-700' },
    { value: 'maintain-weight', label: 'Maintain Weight', color: 'bg-blue-100 text-blue-700' },
    { value: 'gain-weight', label: 'Gain Weight', color: 'bg-green-100 text-green-700' },
    { value: 'build-muscle', label: 'Build Muscle', color: 'bg-purple-100 text-purple-700' },
    { value: 'improve-fitness', label: 'Improve Fitness', color: 'bg-orange-100 text-orange-700' },
    { value: 'better-health', label: 'Better Health', color: 'bg-[#C5E17A] text-black' },
  ];

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Handle document upload
  const handleUploadDocument = async () => {
    const userId = getUserId();
    if (!userId || !selectedFile) return;

    setIsUploading(true);
    try {
      const response = await apiService.uploadMedicalDocument(
        userId,
        selectedFile,
        uploadDocumentType,
        uploadDescription
      );
      
      if (response.success) {
        // Refresh documents list
        fetchMedicalDocuments();
        // Reset form
        setSelectedFile(null);
        setUploadDescription('');
        setShowUploadForm(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle document delete
  const handleDeleteDocument = async (documentId: number) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const response = await apiService.deleteMedicalDocument(documentId);
      if (response.success) {
        fetchMedicalDocuments();
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document. Please try again.');
    }
  };

  // Handle document download
  const handleDownloadDocument = async (documentId: number) => {
    try {
      await apiService.downloadMedicalDocument(documentId);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document. Please try again.');
    }
  };

  // Get status icon based on status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending_approval':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'pending_assignment':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'not_filled':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending_approval':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending_assignment':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'not_filled':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Document type label
  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'lab_report': 'Lab Report',
      'prescription': 'Prescription',
      'medical_certificate': 'Medical Certificate',
      'diet_history': 'Diet History',
      'other': 'Other',
    };
    return labels[type] || type;
  };

  // Show loading state while fetching existing data
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-6 h-6 text-[#C5E17A]" />
              Health Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C5E17A]"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Card - Shows when profile is filled */}
      {dietStatus?.profileFilled && (
        <Card className="border-l-4 border-l-[#C5E17A]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              {getStatusIcon(dietStatus.status)}
              Diet Plan Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className={`${getStatusBadgeColor(dietStatus.status)} text-sm px-3 py-1`}>
                {dietStatus.statusText}
              </Badge>
              
              {dietStatus.assignedDietician && (
                <span className="text-sm text-gray-600">
                  Assigned to: <strong>{dietStatus.assignedDietician.name}</strong>
                </span>
              )}
            </div>

            {/* Assigned Dietician Info */}
            {dietStatus.assignedDietician && (
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <div className="grid gap-2 md:grid-cols-2">
                  <div>
                    <span className="text-gray-500">Name:</span>
                    <span className="ml-2 font-medium">{dietStatus.assignedDietician.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Role:</span>
                    <span className="ml-2 capitalize">{dietStatus.assignedDietician.role}</span>
                  </div>
                  {dietStatus.assignedDietician.email && (
                    <div className="md:col-span-2">
                      <span className="text-gray-500">Email:</span>
                      <span className="ml-2">{dietStatus.assignedDietician.email}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Medical Document Upload Section - Only shows when diet is approved */}
            {dietStatus.status === 'approved' && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Medical Documents
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowUploadForm(!showUploadForm)}
                    className="flex items-center gap-1"
                  >
                    {showUploadForm ? (
                      <>
                        <X className="w-4 h-4" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Upload Document
                      </>
                    )}
                  </Button>
                </div>

                {/* Upload Form */}
                {showUploadForm && (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3 mb-4">
                    <div>
                      <Label className="text-sm">Document Type</Label>
                      <Select value={uploadDocumentType} onValueChange={setUploadDocumentType}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lab_report">Lab Report</SelectItem>
                          <SelectItem value="prescription">Prescription</SelectItem>
                          <SelectItem value="medical_certificate">Medical Certificate</SelectItem>
                          <SelectItem value="diet_history">Diet History</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm">Description (Optional)</Label>
                      <Input
                        value={uploadDescription}
                        onChange={(e) => setUploadDescription(e.target.value)}
                        placeholder="Brief description of the document"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-sm">File (PDF, Image)</Label>
                      <Input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={handleFileChange}
                        className="mt-1"
                      />
                      {selectedFile && (
                        <p className="text-sm text-gray-500 mt-1">
                          Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                        </p>
                      )}
                    </div>

                    <Button
                      onClick={handleUploadDocument}
                      disabled={!selectedFile || isUploading}
                      className="w-full bg-[#C5E17A] text-black hover:bg-[#B5D170]"
                    >
                      {isUploading ? 'Uploading...' : 'Upload Document'}
                    </Button>
                  </div>
                )}

                {/* Document List */}
                {medicalDocuments.length > 0 ? (
                  <div className="space-y-2">
                    {medicalDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 bg-white border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-sm">{doc.originalName}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span className="bg-gray-100 px-2 py-0.5 rounded">
                                {getDocumentTypeLabel(doc.documentType)}
                              </span>
                              <span>•</span>
                              <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadDocument(doc.id)}
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteDocument(doc.id)}
                            title="Delete"
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  showUploadForm ? null : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No medical documents uploaded yet. Upload your lab reports, prescriptions, or medical certificates.
                    </p>
                  )
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Profile Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-6 h-6 text-[#C5E17A]" />
            Health Profile
            {!dietStatus?.profileFilled && (
              <Badge variant="outline" className="ml-2 text-yellow-600 border-yellow-300 bg-yellow-50">
                Please fill your profile
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Age</Label>
              <Input
                type="number"
                placeholder="25"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Height (cm)</Label>
              <Input
                type="number"
                placeholder="170"
                value={formData.height}
                onChange={(e) => handleInputChange('height', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Weight (kg)</Label>
              <Input
                type="number"
                placeholder="70"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={formData.gender} onValueChange={(value: 'male' | 'female') => handleInputChange('gender', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Activity Level
              </Label>
              <Select value={formData.activityLevel} onValueChange={(value) => handleInputChange('activityLevel', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary (little/no exercise)</SelectItem>
                  <SelectItem value="lightly-active">Lightly Active (light exercise 1-3 days/week)</SelectItem>
                  <SelectItem value="moderately-active">Moderately Active (moderate exercise 3-5 days/week)</SelectItem>
                  <SelectItem value="very-active">Very Active (hard exercise 6-7 days/week)</SelectItem>
                  <SelectItem value="extremely-active">Extremely Active (very hard exercise, physical job)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Goals */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Health Goals (Select all that apply)
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {goalOptions.map((goal) => (
                <button
                  key={goal.value}
                  onClick={() => handleGoalToggle(goal.value)}
                  className={`p-3 rounded-lg border transition-colors text-sm ${
                    formData.goals.includes(goal.value)
                      ? `${goal.color} border-current`
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {goal.label}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Medical Information */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Medical Information
            </Label>
            
            <div className="space-y-3">
              <div>
                <Label className="text-sm text-gray-600">Medical Conditions / Health Issues</Label>
                <Textarea
                  placeholder="e.g., Diabetes, Hypertension, High cholesterol, etc."
                  value={formData.medicalConditions}
                  onChange={(e) => handleInputChange('medicalConditions', e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-sm text-gray-600">Food Allergies / Restrictions</Label>
                <Textarea
                  placeholder="e.g., Nuts, Dairy, Gluten, etc."
                  value={formData.allergies}
                  onChange={(e) => handleInputChange('allergies', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={handleSave}
              disabled={!isDirty}
              className="flex-1 bg-[#C5E17A] text-black hover:bg-[#B5D170]"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Profile
            </Button>
            <Button 
              onClick={handleReset}
              variant="outline"
              className="flex-1"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Live BMI Preview */}
      {bmiCalculation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-[#C5E17A]" />
              Health Metrics Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold">{bmiCalculation.bmi}</div>
                <div className="text-sm text-gray-600">BMI</div>
                <Badge className={`${bmiCalculation.color} bg-gray-100 mt-2`}>
                  {bmiCalculation.category}
                </Badge>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold">{bmiCalculation.bmr}</div>
                <div className="text-sm text-gray-600">BMR (cal/day)</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold">{bmiCalculation.dailyCalories}</div>
                <div className="text-sm text-gray-600">Daily Calories</div>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-500 p-3 bg-gray-50 rounded-lg">
              <strong>Ideal Weight Range:</strong> {bmiCalculation.idealWeight[0]}-{bmiCalculation.idealWeight[1]} kg
              <br />
              <strong>Note:</strong> These are calculated estimates. Consult healthcare professionals for personalized advice.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

