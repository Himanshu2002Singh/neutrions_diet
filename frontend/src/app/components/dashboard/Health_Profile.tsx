import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Heart, Target, Activity, Save, RotateCcw, User } from 'lucide-react';
import { calculateAllHealthMetrics } from '../../../utils/healthCalculations';
import { BMICalculation } from '../../../types/health';

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

        await fetch(`http://localhost:3002/api/health/submit/${userId}`, {
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
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-6 h-6 text-[#C5E17A]" />
            Health Profile
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
