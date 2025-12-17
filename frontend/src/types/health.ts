export interface HealthData {
  height: number;
  weight: number;
  age: number;
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'lightly-active' | 'moderately-active' | 'very-active' | 'extremely-active';
  medicalConditions: string[];
  dietaryRestrictions: string[];
  allergies: string[];
  goals: string[];
}

export interface BMICategory {
  category: string;
  range: [number, number];
  color: string;
  description: string;
  recommendations: string[];
}

export interface BMICalculation {
  bmi: number;
  category: string;
  bmr: number;
  dailyCalories: number;
  idealWeight: [number, number];
  color: string;
}

export interface DietRecommendation {
  dailyCalories: number;
  protein: number;
  carbs: number;
  fats: number;
  meals: MealPlan[];
  foods: string[];
  restrictions: string[];
}

export interface MealPlan {
  name: string;
  calories: number;
  foods: string[];
  timing: string;
}

export interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  category: string;
  suitableFor: string[];
}
