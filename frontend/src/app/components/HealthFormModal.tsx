import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Scale, Activity, Heart, AlertCircle } from 'lucide-react';
import { calculateAllHealthMetrics } from '../../utils/healthCalculations';
import { apiService, type HealthFormData } from '../../services/api';
import type { BMICalculation } from '../../types/health';

interface HealthFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    weight: number;
    height: number;
    age: number;
    gender: string;
    activityLevel: string;
    medicalConditions: string;
    goals: string;
    bmiCalculation: BMICalculation;
  }) => void;
  purpose?: 'diet' | 'dietitian';
}

export function HealthFormModal({ isOpen, onClose, onSubmit, purpose = 'diet' }: HealthFormModalProps) {
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    age: '',
    gender: '',
    activityLevel: '',
    medicalConditions: '',
    goals: ''
  });

  const [bmiCalculation, setBmiCalculation] = useState<BMICalculation | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  // Get userId from localStorage on component mount
  useEffect(() => {
    const getUserData = () => {
      // Get userId from localStorage (set by googleAuth.ts after login)
      const storedUserId = localStorage.getItem('userId');
      
      if (storedUserId) {
        setUserId(parseInt(storedUserId, 10));
        console.log('✅ Found userId:', storedUserId);
      } else {
        // No userId found - user is not logged in
        console.log('❌ No userId found - user not logged in');
        setUserId(null);
      }
    };

    if (isOpen) {
      getUserData();
    }
  }, [isOpen]);

  const calculateBMIData = () => {
    const weight = parseFloat(formData.weight);
    const height = parseFloat(formData.height);
    
    if (weight && height && formData.age && formData.gender && formData.activityLevel) {
      const calculation = calculateAllHealthMetrics(
        height,
        weight,
        parseInt(formData.age),
        formData.gender as 'male' | 'female',
        formData.activityLevel
      );
      setBmiCalculation(calculation);
      return calculation;
    }
    return null;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Recalculate BMI if weight or height changes
    if (field === 'weight' || field === 'height') {
      setTimeout(calculateBMIData, 100);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.weight || parseFloat(formData.weight) <= 0) {
      newErrors.weight = 'Valid weight is required';
    }
    if (!formData.height || parseFloat(formData.height) <= 0) {
      newErrors.height = 'Valid height is required';
    }
    if (!formData.age || parseInt(formData.age) <= 0) {
      newErrors.age = 'Valid age is required';
    }
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }
    if (!formData.activityLevel) {
      newErrors.activityLevel = 'Activity level is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const bmi = calculateBMIData();
    if (!bmi) return;

    // Reset states
    setIsLoading(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      // Check if we have a valid userId
      if (!userId) {
        throw new Error('User ID not found. Please log in first.');
      }

      // Prepare form data for API
      // Note: User info (name, email, phone) comes from users table via JOIN
      // Only health-related data is submitted here
      const healthFormData: HealthFormData = {
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        age: parseInt(formData.age),
        gender: formData.gender,
        activityLevel: formData.activityLevel,
        medicalConditions: formData.medicalConditions,
        goals: formData.goals
      };

      console.log('Submitting health form to backend:', { userId, healthFormData });
      
      // Submit to backend
      const response = await apiService.submitHealthForm(userId, healthFormData);

      if (response.success) {
        console.log('Health form submitted successfully:', response);
        setSubmitSuccess(true);
        
        // Also call the original onSubmit for local processing
        onSubmit({
          ...healthFormData,
          bmiCalculation: bmi
        });

        // Reset form after successful submission
        setTimeout(() => {
          setFormData({
            weight: '',
            height: '',
            age: '',
            gender: '',
            activityLevel: '',
            medicalConditions: '',
            goals: ''
          });
          setBmiCalculation(null);
          setErrors({});
          setSubmitSuccess(false);
          onClose();
        }, 2000); // Show success for 2 seconds before closing
      }
    } catch (error) {
      console.error('Error submitting health form:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit health form');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      weight: '',
      height: '',
      age: '',
      gender: '',
      activityLevel: '',
      medicalConditions: '',
      goals: ''
    });
    setBmiCalculation(null);
    setErrors({});
    setIsLoading(false);
    setSubmitError(null);
    setSubmitSuccess(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {purpose === 'dietitian' ? 'Book Your Dietitian Consultation' : 'Tell Us About Yourself'}
          </DialogTitle>
          <p className="text-center text-gray-600">
            {purpose === 'dietitian' 
              ? 'Share your health details to connect with a personalized dietitian' 
              : "We'll create a personalized diet plan based on your health profile"
            }
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Scale className="w-5 h-5 text-[#C5E17A]" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="70"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    className={errors.weight ? 'border-red-500' : ''}
                  />
                  {errors.weight && <p className="text-red-500 text-sm mt-1">{errors.weight}</p>}
                </div>

                <div>
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="170"
                    value={formData.height}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    className={errors.height ? 'border-red-500' : ''}
                  />
                  {errors.height && <p className="text-red-500 text-sm mt-1">{errors.height}</p>}
                </div>

                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="30"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    className={errors.age ? 'border-red-500' : ''}
                  />
                  {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className={`w-full p-2 border rounded-md ${errors.gender ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                </div>

                <div>
                  <Label htmlFor="activityLevel">Activity Level</Label>
                  <select
                    id="activityLevel"
                    value={formData.activityLevel}
                    onChange={(e) => handleInputChange('activityLevel', e.target.value)}
                    className={`w-full p-2 border rounded-md ${errors.activityLevel ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Select Activity Level</option>
                    <option value="sedentary">Sedentary (little to no exercise)</option>
                    <option value="light">Light (light exercise 1-3 days/week)</option>
                    <option value="moderate">Moderate (moderate exercise 3-5 days/week)</option>
                    <option value="active">Active (hard exercise 6-7 days/week)</option>
                    <option value="very_active">Very Active (very hard exercise, physical job)</option>
                  </select>
                  {errors.activityLevel && <p className="text-red-500 text-sm mt-1">{errors.activityLevel}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* BMI Preview */}
          {bmiCalculation && (
            <Card className="border-[#C5E17A]">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#C5E17A]" />
                  Your BMI Analysis
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-800">{bmiCalculation.bmi}</div>
                    <div className="text-sm text-gray-600">BMI</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Badge className={`${bmiCalculation.color} text-white mb-2`}>
                      {bmiCalculation.category}
                    </Badge>
                    <div className="text-sm text-gray-600">Category</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-800">{bmiCalculation.dailyCalories}</div>
                    <div className="text-sm text-gray-600">Calories/Day</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Medical Information */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-[#C5E17A]" />
                Health Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="medicalConditions">Medical Conditions (Optional)</Label>
                  <Textarea
                    id="medicalConditions"
                    placeholder="e.g., diabetes, hypertension, food allergies..."
                    value={formData.medicalConditions}
                    onChange={(e) => handleInputChange('medicalConditions', e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="goals">Health Goals (Optional)</Label>
                  <Textarea
                    id="goals"
                    placeholder="e.g., lose weight, gain muscle, maintain health..."
                    value={formData.goals}
                    onChange={(e) => handleInputChange('goals', e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose} className="flex-1" disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="flex-1 bg-[#C5E17A] text-black hover:bg-[#B5D170] disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Submitting...' : 'Generate My Diet Plan'}
            </Button>
          </div>

          {/* Status Messages */}
          {submitSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Success! Your health profile has been submitted to the backend.
                  </p>
                </div>
              </div>
            </div>
          )}

          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">
                    {submitError}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
