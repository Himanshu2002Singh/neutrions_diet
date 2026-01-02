// BMI Categories with color coding and recommendations
const BMI_CATEGORIES = [
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
  'light': 1.375,
  'moderate': 1.55,
  'active': 1.725,
  'very_active': 1.9
};

// Calculate BMI
function calculateBMI(height, weight) {
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
}

// Calculate BMR using Mifflin-St Jeor Equation
function calculateBMR(height, weight, age, gender) {
  if (gender === 'male') {
    return (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
    return (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }
}

// Calculate Total Daily Energy Expenditure (TDEE)
function calculateTDEE(bmr, activityLevel) {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.2;
  return bmr * multiplier;
}

// Get BMI category and recommendations
function getBMICategory(bmi) {
  return BMI_CATEGORIES.find(category => bmi >= category.range[0] && bmi < category.range[1]) || BMI_CATEGORIES[1];
}

// Calculate ideal weight range
function calculateIdealWeight(height) {
  const heightInMeters = height / 100;
  const minWeight = 18.5 * heightInMeters * heightInMeters;
  const maxWeight = 24.9 * heightInMeters * heightInMeters;
  return [Math.round(minWeight), Math.round(maxWeight)];
}

// Generate comprehensive BMI/BMR calculation
function calculateAllHealthMetrics(height, weight, age, gender, activityLevel) {
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

// Generate meal plan based on BMI category and calorie needs
function generateDietRecommendation(bmiCalculation, medicalConditions = [], dietaryRestrictions = []) {
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
  
  return {
    dailyCalories: targetCalories,
    protein,
    carbs,
    fats,
    recommendations: getBMICategory(calculateBMI(bmiCalculation.height, bmiCalculation.weight)).recommendations
  };
}

// Get recommendations based on medical conditions
function getMedicalRecommendations(conditions) {
  const recommendations = [];
  
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

module.exports = {
  calculateBMI,
  calculateBMR,
  calculateTDEE,
  getBMICategory,
  calculateIdealWeight,
  calculateAllHealthMetrics,
  generateDietRecommendation,
  getMedicalRecommendations,
  BMI_CATEGORIES,
  ACTIVITY_MULTIPLIERS
};
