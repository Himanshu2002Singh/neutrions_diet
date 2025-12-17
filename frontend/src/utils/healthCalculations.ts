import { HealthData, BMICalculation, BMICategory, DietRecommendation, MealPlan } from '../types/health';

// BMI Categories with color coding and recommendations
export const BMI_CATEGORIES: BMICategory[] = [
  {
    category: 'Underweight',
    range: [0, 18.5],
    color: 'text-blue-600',
    description: 'Below normal weight',
    recommendations: [
      'Increase calorie intake with healthy fats and proteins',
      'Eat frequent, nutrient-dense meals',
      'Include strength training exercises',
      'Consult a nutritionist for weight gain plan'
    ]
  },
  {
    category: 'Normal',
    range: [18.5, 24.9],
    color: 'text-green-600',
    description: 'Normal weight',
    recommendations: [
      'Maintain current weight with balanced diet',
      'Continue regular physical activity',
      'Focus on nutrient-dense whole foods',
      'Regular health checkups'
    ]
  },
  {
    category: 'Overweight',
    range: [25, 29.9],
    color: 'text-yellow-600',
    description: 'Above normal weight',
    recommendations: [
      'Create moderate calorie deficit',
      'Increase physical activity',
      'Focus on portion control',
      'Emphasize fruits, vegetables, and lean proteins'
    ]
  },
  {
    category: 'Obese',
    range: [30, Infinity],
    color: 'text-red-600',
    description: 'Significantly above normal weight',
    recommendations: [
      'Consult healthcare provider before starting diet',
      'Create structured calorie deficit plan',
      'Combine diet with regular exercise',
      'Consider professional nutrition counseling'
    ]
  }
];

// Activity level multipliers for TDEE calculation
const ACTIVITY_MULTIPLIERS = {
  'sedentary': 1.2,
  'lightly-active': 1.375,
  'moderately-active': 1.55,
  'very-active': 1.725,
  'extremely-active': 1.9
};

// Calculate BMI
export function calculateBMI(height: number, weight: number): number {
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
}

// Calculate BMR using Mifflin-St Jeor Equation
export function calculateBMR(height: number, weight: number, age: number, gender: 'male' | 'female'): number {
  if (gender === 'male') {
    return (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
    return (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }
}

// Calculate Total Daily Energy Expenditure (TDEE)
export function calculateTDEE(bmr: number, activityLevel: string): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel as keyof typeof ACTIVITY_MULTIPLIERS] || 1.2;
  return bmr * multiplier;
}

// Get BMI category and recommendations
export function getBMICategory(bmi: number): BMICategory {
  return BMI_CATEGORIES.find(category => bmi >= category.range[0] && bmi < category.range[1]) || BMI_CATEGORIES[1];
}

// Calculate ideal weight range
export function calculateIdealWeight(height: number): [number, number] {
  const heightInMeters = height / 100;
  const minWeight = 18.5 * heightInMeters * heightInMeters;
  const maxWeight = 24.9 * heightInMeters * heightInMeters;
  return [Math.round(minWeight), Math.round(maxWeight)];
}

// Convert height from feet/inches to centimeters
export function convertHeightToCm(feet: number, inches: number): number {
  return (feet * 12 + inches) * 2.54;
}

// Convert weight from pounds to kilograms
export function convertWeightToKg(pounds: number): number {
  return pounds * 0.453592;
}

// Generate comprehensive BMI/BMR calculation
export function calculateAllHealthMetrics(height: number, weight: number, age: number, gender: 'male' | 'female', activityLevel: string): BMICalculation {
  const bmi = calculateBMI(height, weight);
  const bmr = calculateBMR(height, weight, age, gender);
  const dailyCalories = calculateTDEE(bmr, activityLevel);
  const category = getBMICategory(bmi);
  const idealWeight = calculateIdealWeight(height);
  
  return {
    bmi: Math.round(bmi * 10) / 10,
    category: category.category,
    bmr: Math.round(bmr),
    dailyCalories: Math.round(dailyCalories),
    idealWeight,
    color: category.color
  };
}

// Sample food database for diet recommendations
const FOOD_DATABASE = [
  { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fats: 3.6, category: 'Protein', suitableFor: ['all'] },
  { name: 'Brown Rice', calories: 111, protein: 2.6, carbs: 23, fats: 0.9, category: 'Carbohydrate', suitableFor: ['all'] },
  { name: 'Broccoli', calories: 34, protein: 2.8, carbs: 7, fats: 0.4, category: 'Vegetable', suitableFor: ['all'] },
  { name: 'Avocado', calories: 160, protein: 2, carbs: 8.5, fats: 14.7, category: 'Healthy Fat', suitableFor: ['all'] },
  { name: 'Salmon', calories: 208, protein: 20, carbs: 0, fats: 13, category: 'Protein', suitableFor: ['all'] },
  { name: 'Quinoa', calories: 120, protein: 4.4, carbs: 22, fats: 1.9, category: 'Carbohydrate', suitableFor: ['all'] },
  { name: 'Sweet Potato', calories: 86, protein: 1.6, carbs: 20, fats: 0.1, category: 'Carbohydrate', suitableFor: ['all'] },
  { name: 'Greek Yogurt', calories: 59, protein: 10, carbs: 3.6, fats: 0.4, category: 'Protein', suitableFor: ['all'] },
  { name: 'Spinach', calories: 23, protein: 2.9, carbs: 3.6, fats: 0.4, category: 'Vegetable', suitableFor: ['all'] },
  { name: 'Almonds', calories: 164, protein: 6, carbs: 6, fats: 14, category: 'Healthy Fat', suitableFor: ['all'] }
];

// Generate meal plan based on BMI category and calorie needs
export function generateDietRecommendation(bmiCalculation: BMICalculation, medicalConditions: string[] = [], dietaryRestrictions: string[] = []): DietRecommendation {
  const { dailyCalories, category } = bmiCalculation;
  
  // Adjust calories based on BMI category
  let targetCalories = dailyCalories;
  if (category === 'Underweight') {
    targetCalories = dailyCalories + 500; // Surplus for weight gain
  } else if (category === 'Overweight') {
    targetCalories = dailyCalories - 500; // Deficit for weight loss
  } else if (category === 'Obese') {
    targetCalories = dailyCalories - 750; // Larger deficit for significant weight loss
  }
  
  // Calculate macronutrients (example distribution)
  const protein = Math.round((targetCalories * 0.25) / 4); // 25% protein
  const carbs = Math.round((targetCalories * 0.45) / 4); // 45% carbs
  const fats = Math.round((targetCalories * 0.30) / 9); // 30% fats
  
  // Generate meal plan
  const meals: MealPlan[] = [
    {
      name: 'Breakfast',
      calories: Math.round(targetCalories * 0.25),
      foods: ['Greek Yogurt with Berries', 'Almonds', 'Oatmeal'],
      timing: '7:00 AM'
    },
    {
      name: 'Lunch',
      calories: Math.round(targetCalories * 0.35),
      foods: ['Grilled Chicken', 'Brown Rice', 'Steamed Broccoli', 'Avocado'],
      timing: '12:30 PM'
    },
    {
      name: 'Dinner',
      calories: Math.round(targetCalories * 0.30),
      foods: ['Baked Salmon', 'Sweet Potato', 'Spinach Salad'],
      timing: '7:00 PM'
    },
    {
      name: 'Snack',
      calories: Math.round(targetCalories * 0.10),
      foods: ['Mixed Nuts', 'Fruit'],
      timing: '3:30 PM'
    }
  ];
  
  // Filter foods based on dietary restrictions
  const suitableFoods = FOOD_DATABASE.filter(food => 
    dietaryRestrictions.length === 0 || 
    dietaryRestrictions.some(restriction => food.suitableFor.includes(restriction))
  ).map(food => food.name);
  
  return {
    dailyCalories: targetCalories,
    protein,
    carbs,
    fats,
    meals,
    foods: suitableFoods,
    restrictions: dietaryRestrictions
  };
}

// Get recommendations based on medical conditions
export function getMedicalRecommendations(conditions: string[]): string[] {
  const recommendations: string[] = [];
  
  if (conditions.some(c => c.toLowerCase().includes('diabetes'))) {
    recommendations.push('Focus on low glycemic index foods');
    recommendations.push('Monitor carbohydrate intake');
    recommendations.push('Eat frequent, smaller meals');
  }
  
  if (conditions.some(c => c.toLowerCase().includes('hypertension') || c.toLowerCase().includes('high blood pressure'))) {
    recommendations.push('Reduce sodium intake');
    recommendations.push('Increase potassium-rich foods');
    recommendations.push('Follow DASH diet principles');
  }
  
  if (conditions.some(c => c.toLowerCase().includes('cholesterol'))) {
    recommendations.push('Increase fiber intake');
    recommendations.push('Choose lean proteins');
    recommendations.push('Include omega-3 rich foods');
  }
  
  return recommendations;
}
