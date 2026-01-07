import { useState, useEffect } from 'react';
import { Filter, Grid3x3, List, Calendar, Check, X } from 'lucide-react';
import { apiService, FoodItemData } from '../../../services/api';

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

interface MenuItem {
  name: string;
  image: string;
  category: string;
  difficulty: string;
  calories: number;
  carbs: number;
  protein: number;
  fats: number;
  healthScore: number;
  categoryColor: string;
  time: string;
  portion: string;
}

export function AllMenuSection() {
  const [activeTab, setActiveTab] = useState('All');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [addingToMeal, setAddingToMeal] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const tabs = ['All', 'Breakfast', 'Lunch', 'Evening Snacks', 'Dinner', 'Late Night'];

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

  useEffect(() => {
    if (userId) {
      fetchDietPlan();
    }
  }, [userId]);

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchDietPlan = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    
    try {
      const response = await apiService.getPersonalizedDietPlan(userId);
      if (response.success && response.data) {
        const items = extractAllItems(response.data);
        setMenuItems(items);
      }
    } catch (error) {
      console.error('Failed to fetch diet plan:', error);
      setMenuItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const extractAllItems = (plan: PersonalizedDietPlan) => {
    const items: MenuItem[] = [];
    
    plan.dailySchedule.forEach((meal) => {
      meal.options.forEach((option) => {
        items.push({
          name: option.name,
          image: option.imageUrl,
          category: meal.mealType,
          difficulty: 'Easy',
          calories: option.calories,
          carbs: option.macros?.carbs || 0,
          protein: option.macros?.protein || 0,
          fats: option.macros?.fats || 0,
          healthScore: 7 + Math.floor(Math.random() * 3),
          categoryColor: getCategoryColor(meal.mealType),
          time: meal.time,
          portion: option.portion
        });
      });
    });

    plan.lateNightOptions.forEach((option) => {
      items.push({
        name: option.name,
        image: option.imageUrl,
        category: 'Late Night',
        difficulty: 'Easy',
        calories: option.calories,
        carbs: option.macros?.carbs || 0,
        protein: option.macros?.protein || 0,
        fats: option.macros?.fats || 0,
        healthScore: 7 + Math.floor(Math.random() * 3),
        categoryColor: 'bg-purple-200',
        time: '10:00 PM',
        portion: option.portion
      });
    });
    
    return items;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Wake Up': 'bg-blue-200',
      'Breakfast': 'bg-[#C5E17A]',
      'Mid-Morning': 'bg-green-200',
      'Lunch': 'bg-[#FFC878]',
      'Pre-Workout': 'bg-orange-200',
      'Evening Snacks': 'bg-yellow-200',
      'Dinner': 'bg-blue-200',
      'Bed Time': 'bg-indigo-200'
    };
    return colors[category] || 'bg-gray-200';
  };

  const getMealType = (category: string): string => {
    const mealTypes: Record<string, string> = {
      'Wake Up': 'wake-up',
      'Breakfast': 'breakfast',
      'Mid-Morning': 'mid-morning',
      'Lunch': 'lunch',
      'Pre-Workout': 'pre-workout',
      'Evening Snacks': 'evening-snacks',
      'Dinner': 'dinner',
      'Bed Time': 'bedtime',
      'Late Night': 'late-night'
    };
    return mealTypes[category] || category.toLowerCase().replace(' ', '-');
  };

  const handleAddToMealPlan = async (item: MenuItem) => {
    if (!userId || !selectedDate) {
      setNotification({ type: 'error', message: 'User not authenticated' });
      return;
    }

    setAddingToMeal(menuItems.indexOf(item));

    try {
      // Convert menu item to FoodItemData format
      const foodItem: FoodItemData = {
        name: item.name,
        portion: item.portion,
        imageUrl: item.image,
        calories: item.calories,
        macros: {
          protein: item.protein,
          carbs: item.carbs,
          fats: item.fats
        }
      };

      // Get meal type for the backend
      const mealType = getMealType(item.category);

      const response = await apiService.saveMealActivity(userId, {
        date: selectedDate,
        mealType,
        selectedItems: [foodItem]
      });

      if (response.success) {
        setNotification({ 
          type: 'success', 
          message: `${item.name} added to ${mealType} for ${selectedDate}!` 
        });
      } else {
        setNotification({ 
          type: 'error', 
          message: response.message || 'Failed to add meal' 
        });
      }
    } catch (error) {
      console.error('Failed to add meal to plan:', error);
      setNotification({ 
        type: 'error', 
        message: 'Failed to add meal. Please try again.' 
      });
    } finally {
      setAddingToMeal(null);
    }
  };

  const filteredItems = activeTab === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeTab);

  return (
    <div className="bg-white rounded-2xl p-6 relative">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white animate-fade-in`}>
          {notification.type === 'success' ? (
            <Check className="w-5 h-5" />
          ) : (
            <X className="w-5 h-5" />
          )}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">All Menu</h3>
        <div className="flex items-center gap-4">
          {/* Date Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[#C5E17A]"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Sort by:</span>
            <select className="border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[#C5E17A]">
              <option>Calories</option>
              <option>Health Score</option>
              <option>Prep Time</option>
            </select>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button className="p-2 hover:bg-white rounded transition-colors">
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button className="p-2 bg-white rounded shadow-sm transition-colors">
              <List className="w-4 h-4" />
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            <span className="text-sm">Filter</span>
          </button>
        </div>
      </div>
      
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-full text-sm transition-colors whitespace-nowrap ${
              activeTab === tab
                ? 'bg-[#C5E17A] text-black font-semibold'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C5E17A]"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item, index) => (
            <div key={index} className="flex items-center gap-6 p-4 border border-gray-200 rounded-2xl hover:shadow-md transition-shadow">
              <img
                src={item.image}
                alt={item.name}
                className="w-32 h-32 object-cover rounded-xl"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`${item.categoryColor} text-black text-xs px-3 py-1 rounded-full`}>
                    {item.category}
                  </span>
                  <span className="text-xs text-gray-500">• {item.time} • {item.difficulty}</span>
                </div>
                <h4 className="text-lg font-bold mb-2">{item.name}</h4>
                <p className="text-sm text-gray-500 mb-3">{item.portion}</p>
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <span>🔥 {item.calories} kcal</span>
                  <span>🍞 {item.carbs}g carbs</span>
                  <span>💪 {item.protein}g protein</span>
                  <span>🥑 {item.fats}g fats</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Health Score</p>
                  <div className="flex gap-1">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-6 rounded-full ${
                          i < item.healthScore ? 'bg-[#FFC878]' : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => handleAddToMealPlan(item)}
                  disabled={addingToMeal === index}
                  className={`bg-[#C5E17A] text-black px-6 py-2 rounded-lg hover:opacity-90 transition-opacity font-semibold flex items-center gap-2 ${
                    addingToMeal === index ? 'opacity-75 cursor-wait' : ''
                  }`}
                >
                  {addingToMeal === index ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add to Meal Plan'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AllMenuSection;

