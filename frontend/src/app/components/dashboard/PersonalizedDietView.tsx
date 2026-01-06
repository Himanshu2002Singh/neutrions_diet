import { useState, useEffect } from 'react';
import { Star, ChefHat, Clock, BarChart3, List, MoreVertical, Calendar, Check } from 'lucide-react';
import { apiService } from '../../../services/api';

// API response types matching backend
interface FoodOption {
  name: string;
  portion: string;
  imageUrl: string;
  calories: number;
  macros?: {
    protein: number;
    carbs: number;
    fats: number;
  };
  notes?: string;
}

interface MealSchedule {
  time: string;
  mealType: string;
  title: string;
  description?: string;
  options: FoodOption[];
  tips?: string;
}

interface LateNightOption {
  name: string;
  portion: string;
  imageUrl: string;
  calories: number;
  macros?: {
    protein: number;
    carbs: number;
    fats: number;
  };
}

interface PersonalizedDietPlan {
  userId: number;
  userName: string;
  profile: {
    age: number;
    weight: number;
    height: number;
    bmiCategory: string;
    target: string;
  };
  nutritionTargets: {
    calories: string;
    protein: string;
    fiber: string;
    fat: string;
    carbs: string;
  };
  dailySchedule: MealSchedule[];
  lateNightOptions: LateNightOption[];
  importantPoints?: string[];
  portionSizeReference?: Record<string, string>;
  goals?: string[];
}

export function PersonalizedDietView() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedItems, setSelectedItems] = useState<Record<string, number[]>>({});
  const [dietPlan, setDietPlan] = useState<PersonalizedDietPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [activeMeal, setActiveMeal] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'diet' | 'important'>('diet');

  // Get user ID from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('neutrion-user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setUserId(user.id || user.userId || 1);
      } catch {
        setUserId(1);
      }
    }
  }, []);

  // Fetch personalized diet plan from backend
  useEffect(() => {
    if (userId) {
      fetchDietPlan();
    }
  }, [userId]);

  const fetchDietPlan = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getPersonalizedDietPlan(userId);
      if (response.success && response.data) {
        setDietPlan(response.data);
        if (response.data.dailySchedule && response.data.dailySchedule.length > 0) {
          setActiveMeal(response.data.dailySchedule[0].mealType);
        }
      } else {
        setDietPlan(null);
      }
    } catch (error: any) {
      console.error('Failed to fetch diet plan:', error);
      setError(error.message || 'Failed to load diet plan');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch saved meal activities for the selected date
  useEffect(() => {
    if (userId) {
      fetchMealActivities();
    }
  }, [userId, selectedDate]);

  const fetchMealActivities = async () => {
    if (!userId) return;
    
    try {
      const response = await apiService.getMealActivityByDate(userId, selectedDate);
      if (response.success && response.data) {
        const activities = response.data.activities || {};
        const newSelectedItems: Record<string, number[]> = {};
        
        Object.entries(activities).forEach(([mealType, activity]: [string, any]) => {
          if (activity.selectedItems) {
            newSelectedItems[mealType] = activity.selectedItems.map(Number);
          }
        });
        
        setSelectedItems(newSelectedItems);
      }
    } catch (error) {
      console.error('Failed to fetch meal activities:', error);
      setSelectedItems({});
    }
  };

  // Generate date options (today + previous 6 days)
  const getDateOptions = () => {
    const dates: { value: string; label: string; isToday: boolean }[] = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const isToday = i === 0;
      
      dates.push({
        value: dateStr,
        label: isToday ? 'Today' : i === 1 ? 'Yesterday' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        isToday
      });
    }
    
    return dates;
  };

  // Toggle food item selection
  const toggleFoodItem = (mealType: string, foodIndex: number) => {
    setSelectedItems(prev => {
      const mealItems = prev[mealType] || [];
      const newMealItems = mealItems.includes(foodIndex)
        ? mealItems.filter(id => id !== foodIndex)
        : [...mealItems, foodIndex];
      
      return {
        ...prev,
        [mealType]: newMealItems
      };
    });
  };

  // Check if food item is selected
  const isFoodSelected = (mealType: string, foodIndex: number) => {
    return (selectedItems[mealType] || []).includes(foodIndex);
  };

  // Save meal activity
  const saveMealActivity = async (mealType: string) => {
    if (!userId) {
      setSaveMessage({ type: 'error', text: 'User not found. Please log in again.' });
      return;
    }

    const mealItems = selectedItems[mealType] || [];
    
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      await apiService.saveMealActivity(userId, {
        date: selectedDate,
        mealType: mealType.toLowerCase(),
        selectedItems: mealItems.map(String),
        notes: `Saved from ${mealType}`
      });
      
      setSaveMessage({ type: 'success', text: `${mealType} saved successfully!` });
      
      setTimeout(() => setSaveMessage(null), 3000);
      fetchMealActivities();
    } catch (error: any) {
      setSaveMessage({ type: 'error', text: error.message || 'Failed to save meal activity' });
    } finally {
      setIsSaving(false);
    }
  };

  // Get meal by type
  const getMealByType = (mealType: string) => {
    return dietPlan?.dailySchedule.find(m => m.mealType.toLowerCase() === mealType.toLowerCase());
  };

  // Calculate total calories for selected items in a meal
  const calculateMealCalories = (mealType: string) => {
    const meal = getMealByType(mealType);
    if (!meal) return 0;
    
    const selectedIndices = selectedItems[mealType] || [];
    return meal.options
      .filter((_, index) => selectedIndices.includes(index))
      .reduce((total, food) => total + food.calories, 0);
  };

  // Calculate total calories for the day
  const calculateTotalCalories = () => {
    return Object.keys(selectedItems).reduce((total, mealType) => {
      return total + calculateMealCalories(mealType);
    }, 0);
  };

  // Get meal image based on meal type
  const getMealImage = (mealType: string) => {
    const images: Record<string, string> = {
      'Wake Up': 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop',
      'Breakfast': 'https://images.unsplash.com/photo-1494390248081-4e521a5940db?w=400&h=300&fit=crop',
      'Mid-Morning': 'https://images.unsplash.com/photo-1615485500704-8e990f9900b7?w=400&h=300&fit=crop',
      'Lunch': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
      'Pre-Workout': 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop',
      'Evening Snacks': 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=400&h=300&fit=crop',
      'Dinner': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop',
      'Bed Time': 'https://images.unsplash.com/photo-1502741126161-b048400d085d?w=400&h=300&fit=crop'
    };
    return images[mealType] || 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop';
  };

  // Date options
  const dateOptions = getDateOptions();
  const meals = dietPlan?.dailySchedule || [];

  // Parse calories target to number
  const getCaloriesTarget = () => {
    if (!dietPlan?.nutritionTargets?.calories) return 2000;
    const match = dietPlan.nutritionTargets.calories.match(/(\d+)/);
    return match ? parseInt(match[1]) : 2000;
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Personalized Diet Plan</h1>
        <p className="text-gray-600">Your customized diet plan for your weight loss journey</p>
      </div>

      {/* Nutrition Targets */}
      {dietPlan && (
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Daily Nutrition Targets</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-[#C5E17A] rounded-lg">
              <p className="text-xs text-gray-700">Calories</p>
              <p className="text-lg font-bold">{getCaloriesTarget()}</p>
            </div>
            <div className="text-center p-3 bg-[#FF8A65] rounded-lg">
              <p className="text-xs text-gray-700">Protein</p>
              <p className="text-lg font-bold">{dietPlan.nutritionTargets?.protein || '75g'}</p>
            </div>
            <div className="text-center p-3 bg-[#FFC878] rounded-lg">
              <p className="text-xs text-gray-700">Carbs</p>
              <p className="text-lg font-bold">{dietPlan.nutritionTargets?.carbs || '150g'}</p>
            </div>
            <div className="text-center p-3 bg-[#FFE082] rounded-lg">
              <p className="text-xs text-gray-700">Fat</p>
              <p className="text-lg font-bold">{dietPlan.nutritionTargets?.fat || '40g'}</p>
            </div>
            <div className="text-center p-3 bg-[#81D4FA] rounded-lg">
              <p className="text-xs text-gray-700">Fiber</p>
              <p className="text-lg font-bold">{dietPlan.nutritionTargets?.fiber || '25g'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Date Selector */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Select Date</h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {dateOptions.map((dateOption) => (
              <button
                key={dateOption.value}
                onClick={() => setSelectedDate(dateOption.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedDate === dateOption.value
                    ? 'bg-[#C5E17A] text-black'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {dateOption.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Calorie Summary */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Calories Today</p>
              <p className="text-2xl font-bold text-gray-900">{calculateTotalCalories()} <span className="text-sm font-normal text-gray-500">kcal</span></p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Target</p>
              <p className="text-lg font-semibold text-green-600">~{getCaloriesTarget()} kcal</p>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  calculateTotalCalories() > 2000 ? 'bg-red-500' : 
                  calculateTotalCalories() > getCaloriesTarget() ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min((calculateTotalCalories() / getCaloriesTarget()) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`mb-4 p-4 rounded-lg ${
          saveMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {saveMessage.text}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('diet')}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === 'diet'
              ? 'bg-[#C5E17A] text-black'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Diet Plan
        </button>
      </div>

      {/* Content */}
      {activeTab === 'diet' ? (
        /* Meal Sections */
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          {/* Meal Tabs */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-4 sticky top-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Meals</h3>
              <div className="space-y-2">
                {meals.map((meal) => (
                  <button
                    key={meal.mealType}
                    onClick={() => setActiveMeal(meal.mealType)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeMeal === meal.mealType
                        ? 'bg-[#C5E17A] text-black font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div>{meal.mealType}</div>
                    <div className="text-xs text-gray-400">{meal.time}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Meal Content */}
          <div className="lg:col-span-6">
            {(() => {
              const meal = meals.find(m => m.mealType === activeMeal);
              if (!meal) return null;

              return (
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  {/* Meal Header */}
                  <div className="relative">
                    <img 
                      src={getMealImage(meal.mealType)} 
                      alt={meal.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h2 className="text-2xl font-bold text-white">{meal.title}</h2>
                      <p className="text-white/80 text-sm">{meal.time}</p>
                    </div>
                    <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full text-sm font-medium text-gray-800">
                      {calculateMealCalories(meal.mealType)} kcal
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <p className="text-gray-600 text-sm">Select the foods you want to eat for this meal</p>
                    <button
                      onClick={() => saveMealActivity(meal.mealType)}
                      disabled={isSaving}
                      className="bg-[#C5E17A] hover:bg-[#b5d16a] text-black px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {isSaving ? 'Saving...' : 'Save This Meal'}
                    </button>
                  </div>

                  {/* Food Options Grid */}
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {meal.options.map((food, index) => {
                      const isSelected = isFoodSelected(meal.mealType, index);
                      
                      return (
                        <div 
                          key={index}
                          className={`border rounded-xl overflow-hidden cursor-pointer transition-all ${
                            isSelected ? 'border-[#C5E17A] ring-2 ring-[#C5E17A]/30' : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => toggleFoodItem(meal.mealType, index)}
                        >
                          <div className="relative">
                            <img 
                              src={food.imageUrl} 
                              alt={food.name}
                              className="w-full h-32 object-cover"
                            />
                            <div className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                              isSelected ? 'bg-[#C5E17A] border-[#C5E17A]' : 'border-white bg-white/80'
                            }`}>
                              {isSelected && (
                                <Check className="w-4 h-4 text-black" />
                              )}
                            </div>
                            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                              {food.calories} kcal
                            </div>
                          </div>
                          <div className="p-3">
                            <h4 className="font-medium text-gray-900 text-sm">{food.name}</h4>
                            <p className="text-xs text-gray-500 mt-1">{food.portion}</p>
                            {food.macros && (
                              <div className="flex gap-2 mt-2 text-xs text-gray-600">
                                <span>💪 {food.macros.protein}g</span>
                                <span>🍞 {food.macros.carbs}g</span>
                                <span>🥑 {food.macros.fats}g</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Tips */}
                  {meal.tips && (
                    <div className="p-4 bg-yellow-50 border-t border-yellow-100">
                      <p className="text-sm text-yellow-800">💡 {meal.tips}</p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      ) : (
        /* Important Points Tab */
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Important Points & Guidelines</h2>
          
          {dietPlan?.importantPoints && (
            <div className="space-y-4">
              {dietPlan.importantPoints.map((point, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-[#C5E17A] text-xl">✓</span>
                  <p className="text-gray-700">{point}</p>
                </div>
              ))}
            </div>
          )}

          {dietPlan?.goals && dietPlan.goals.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Goals</h3>
              <div className="space-y-3">
                {dietPlan.goals.map((goal, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-[#C5E17A]/20 rounded-lg">
                    <span className="text-[#C5E17A] text-xl">🎯</span>
                    <p className="text-gray-700">{goal}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {dietPlan?.portionSizeReference && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Portion Size Reference</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(dietPlan.portionSizeReference).map(([key, value]) => (
                  <div key={key} className="p-3 bg-gray-50 rounded-lg text-center">
                    <p className="font-medium text-gray-900">{key}</p>
                    <p className="text-sm text-gray-600">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#C5E17A] mx-auto"></div>
            <p className="text-gray-600 mt-3">Loading your personalized diet plan...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default PersonalizedDietView;

