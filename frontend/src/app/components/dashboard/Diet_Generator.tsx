import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { ChefHat, Clock, Flame, Utensils, Apple, AlertTriangle } from 'lucide-react';
import { generateDietRecommendation, getMedicalRecommendations } from '../../../utils/healthCalculations';
import { BMICalculation, DietRecommendation } from '../../../types/health';

interface Diet_GeneratorProps {
  bmiCalculation: BMICalculation | null;
  medicalConditions?: string;
}

export function Diet_Generator({ bmiCalculation, medicalConditions = '' }: Diet_GeneratorProps) {
  const [dietRecommendation, setDietRecommendation] = useState<DietRecommendation | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [medicalConditionsList, setMedicalConditionsList] = useState<string[]>([]);

  useEffect(() => {
    if (medicalConditions) {
      // Parse medical conditions from text
      const conditions = medicalConditions.split(',').map(c => c.trim()).filter(c => c.length > 0);
      setMedicalConditionsList(conditions);
    }
  }, [medicalConditions]);

  const generateDiet = async () => {
    if (!bmiCalculation) return;

    setIsGenerating(true);
    
    // Simulate API delay for better UX
    setTimeout(() => {
      const recommendation = generateDietRecommendation(bmiCalculation, medicalConditionsList);
      setDietRecommendation(recommendation);
      setIsGenerating(false);

      // Save diet recommendation to localStorage
      localStorage.setItem('neutrion-diet-recommendation', JSON.stringify(recommendation));
    }, 1500);
  };

  const medicalRecommendations = medicalConditionsList.length > 0 
    ? getMedicalRecommendations(medicalConditionsList) 
    : [];

  if (!bmiCalculation) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No BMI Data Available</h3>
          <p className="text-gray-500">
            Please complete the BMI Calculator first to generate personalized diet recommendations.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Generate Diet Button */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-[#C5E17A]" />
            Personalized Diet Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-semibold">Based on your BMI: {bmiCalculation.bmi}</h3>
              <p className="text-sm text-gray-600">Category: {bmiCalculation.category}</p>
            </div>
            <Badge className={`${bmiCalculation.color} bg-gray-100`}>
              {bmiCalculation.dailyCalories} cal/day
            </Badge>
          </div>

          <Button 
            onClick={generateDiet}
            disabled={isGenerating}
            className="w-full bg-[#C5E17A] text-black hover:bg-[#B5D170]"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                Generating Your Diet Plan...
              </>
            ) : (
              <>
                <ChefHat className="w-4 h-4 mr-2" />
                Generate Personalized Diet Plan
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Diet Recommendation Results */}
      {dietRecommendation && (
        <div className="space-y-6">
          {/* Daily Nutrition Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#C5E17A]" />
                Daily Nutrition Target
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{dietRecommendation.dailyCalories}</div>
                  <div className="text-sm text-gray-600">Calories</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{dietRecommendation.protein}g</div>
                  <div className="text-sm text-gray-600">Protein</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{dietRecommendation.carbs}g</div>
                  <div className="text-sm text-gray-600">Carbs</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{dietRecommendation.fats}g</div>
                  <div className="text-sm text-gray-600">Fats</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Meal Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-[#C5E17A]" />
                Daily Meal Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {dietRecommendation.meals.map((meal, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg">{meal.name}</h3>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{meal.timing}</span>
                      <Badge variant="outline">{meal.calories} cal</Badge>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    {meal.foods.map((food, foodIndex) => (
                      <div key={foodIndex} className="flex items-center gap-2">
                        <Apple className="w-4 h-4 text-[#C5E17A]" />
                        <span>{food}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recommended Foods */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Apple className="w-5 h-5 text-[#C5E17A]" />
                Recommended Foods
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {dietRecommendation.foods.slice(0, 12).map((food, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <Apple className="w-4 h-4 text-[#C5E17A]" />
                    <span className="text-sm">{food}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Medical Recommendations */}
          {medicalRecommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  Special Dietary Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {medicalRecommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
                      <span className="text-sm">{rec}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Download/Share Options */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    // Generate PDF or text version
                    const dietText = `
NUTREAZY DIET PLAN

BMI: ${bmiCalculation.bmi} (${bmiCalculation.category})
Daily Calories: ${dietRecommendation.dailyCalories}

MEALS:
${dietRecommendation.meals.map(meal => 
  `${meal.name} (${meal.calories} cal) - ${meal.timing}\n  ${meal.foods.join(', ')}`
).join('\n\n')}

Recommended Foods: ${dietRecommendation.foods.join(', ')}
                    `;
                    
                    const blob = new Blob([dietText], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'neutrion-diet-plan.txt';
                    a.click();
                  }}
                >
                  Download Diet Plan
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'My Nutreazy Diet Plan',
                        text: `Check out my personalized diet plan with ${dietRecommendation.dailyCalories} calories per day!`,
                        url: window.location.href
                      });
                    }
                  }}
                >
                  Share Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
