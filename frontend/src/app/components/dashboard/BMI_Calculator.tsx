import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';

import { Activity, Calculator, Heart, Target } from 'lucide-react';
import { calculateAllHealthMetrics, getBMICategory, convertHeightToCm, convertWeightToKg } from '../../../utils/healthCalculations';
import { BMICalculation } from '../../../types/health';

interface BMI_CalculatorProps {
  onCalculationComplete?: (calculation: BMICalculation, medicalConditions: string) => void;
}

export function BMI_Calculator({ onCalculationComplete }: BMI_CalculatorProps) {
  const [height, setHeight] = useState<string>('170');
  const [weight, setWeight] = useState<string>('70');
  const [age, setAge] = useState<string>('25');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [activityLevel, setActivityLevel] = useState('moderately-active');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [medicalConditions, setMedicalConditions] = useState('');
  const [calculation, setCalculation] = useState<BMICalculation | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Calculate BMI/BMR whenever inputs change
  useEffect(() => {
    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);
    const ageNum = parseInt(age);

    if (heightNum > 0 && weightNum > 0 && ageNum > 0) {
      let finalHeight = heightNum;
      let finalWeight = weightNum;

      // Convert units if needed
      if (heightUnit === 'ft') {
        // Handle feet.inches format
        const [feet, inches = '0'] = height.split('.');
        finalHeight = convertHeightToCm(parseFloat(feet), parseFloat(inches));
      }

      if (weightUnit === 'lbs') {
        finalWeight = convertWeightToKg(weightNum);
      }

      const result = calculateAllHealthMetrics(
        finalHeight,
        finalWeight,
        ageNum,
        gender,
        activityLevel
      );

      setCalculation(result);
      
      if (onCalculationComplete) {
        onCalculationComplete(result);
      }
    }
  }, [height, weight, age, gender, activityLevel, heightUnit, weightUnit, onCalculationComplete]);


  const handleCalculate = () => {
    setShowResults(true);
    
    // Save to localStorage for persistence
    const userData = {
      height: height,
      weight: weight,
      age: age,
      gender: gender,
      activityLevel: activityLevel,
      medicalConditions: medicalConditions,
      calculation: calculation
    };
    localStorage.setItem('neutrion-health-data', JSON.stringify(userData));

    // Pass data to parent component
    if (onCalculationComplete && calculation) {
      onCalculationComplete(calculation, medicalConditions);
    }
  };

  const bmiCategory = calculation ? getBMICategory(calculation.bmi) : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-6 h-6 text-[#C5E17A]" />
            BMI & BMR Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Height Input */}
          <div className="space-y-2">
            <Label>Height</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder={heightUnit === 'cm' ? '170' : '5.8'}
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="flex-1"
              />
              <Select value={heightUnit} onValueChange={(value: 'cm' | 'ft') => setHeightUnit(value)}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cm">cm</SelectItem>
                  <SelectItem value="ft">ft</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {heightUnit === 'ft' && (
              <p className="text-xs text-gray-500">Enter as feet.inches (e.g., 5.8 = 5 feet 8 inches)</p>
            )}
          </div>

          {/* Weight Input */}
          <div className="space-y-2">
            <Label>Weight</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder={weightUnit === 'kg' ? '70' : '154'}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="flex-1"
              />
              <Select value={weightUnit} onValueChange={(value: 'kg' | 'lbs') => setWeightUnit(value)}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="lbs">lbs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Age Input */}
          <div className="space-y-2">
            <Label>Age</Label>
            <Input
              type="number"
              placeholder="25"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>

          {/* Gender Selection */}
          <div className="space-y-2">
            <Label>Gender</Label>
            <Select value={gender} onValueChange={(value: 'male' | 'female') => setGender(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Activity Level */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Activity Level
            </Label>
            <Select value={activityLevel} onValueChange={setActivityLevel}>
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

          {/* Medical Conditions */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Medical Conditions / Dietary Restrictions (Optional)
            </Label>
            <textarea
              placeholder="e.g., Diabetes, Hypertension, Food allergies, etc."
              value={medicalConditions}
              onChange={(e) => setMedicalConditions(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg resize-none h-20 focus:outline-none focus:ring-2 focus:ring-[#C5E17A]"
            />
          </div>

          <Button 
            onClick={handleCalculate} 
            className="w-full bg-[#C5E17A] text-black hover:bg-[#B5D170]"
            disabled={!height || !weight || !age}
          >
            Calculate BMI & Generate Recommendations
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {showResults && calculation && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* BMI Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-[#C5E17A]" />
                BMI Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">{calculation.bmi}</div>
                <Badge className={`${bmiCategory?.color} bg-gray-100 text-lg px-4 py-2`}>
                  {calculation.category}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ideal Weight Range:</span>
                  <span className="font-semibold">{calculation.idealWeight[0]}-{calculation.idealWeight[1]} kg</span>
                </div>
                <div className="text-sm text-gray-600">
                  {bmiCategory?.description}
                </div>
              </div>

              {/* BMI Category Recommendations */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Recommendations:</h4>
                <ul className="text-sm space-y-1">
                  {bmiCategory?.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-[#C5E17A] mt-1">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* BMR & Calories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#C5E17A]" />
                Metabolism & Calories
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm text-gray-600">Basal Metabolic Rate (BMR)</div>
                    <div className="text-xl font-bold">{calculation.bmr} calories/day</div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-[#C5E17A] bg-opacity-20 rounded-lg">
                  <div>
                    <div className="text-sm text-gray-600">Daily Calorie Needs</div>
                    <div className="text-xl font-bold text-[#5A7A0A]">{calculation.dailyCalories} calories/day</div>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded-lg">
                <strong>Note:</strong> This calculation uses the Mifflin-St Jeor equation for BMR and includes your activity level for total daily energy expenditure.
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
