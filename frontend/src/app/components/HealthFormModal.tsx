import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Scale, Activity, Heart, AlertCircle } from 'lucide-react';
import { calculateAllHealthMetrics } from '../../utils/healthCalculations';
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

  const handleSubmit = () => {
    if (!validateForm()) return;

    const bmi = calculateBMIData();
    if (!bmi) return;

    onSubmit({
      weight: parseFloat(formData.weight),
      height: parseFloat(formData.height),
      age: parseInt(formData.age),
      gender: formData.gender,
      activityLevel: formData.activityLevel,
      medicalConditions: formData.medicalConditions,
      goals: formData.goals,
      bmiCalculation: bmi
    });

    // Reset form
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
    onClose();
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
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1 bg-[#C5E17A] text-black hover:bg-[#B5D170]">
              Generate My Diet Plan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
