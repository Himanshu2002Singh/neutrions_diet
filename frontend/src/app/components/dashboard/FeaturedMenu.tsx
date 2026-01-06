import { useState, useEffect } from 'react';
import { Star, Clock } from 'lucide-react';
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

interface GroupedMeal {
  mealType: string;
  time: string;
  items: {
    name: string;
    portion: string;
    imageUrl: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  }[];
}

export function FeaturedMenu() {
  const [groupedMeals, setGroupedMeals] = useState<GroupedMeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);

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

  const fetchDietPlan = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    
    try {
      const response = await apiService.getPersonalizedDietPlan(userId);
      if (response.success && response.data) {
        const groups = extractFeaturedMeals(response.data);
        setGroupedMeals(groups);
      }
    } catch (error) {
      console.error('Failed to fetch diet plan:', error);
      setGroupedMeals([]);
    } finally {
      setIsLoading(false);
    }
  };

  const extractFeaturedMeals = (plan: PersonalizedDietPlan) => {
    const groups: GroupedMeal[] = [];
    
    // Focus on main meals: Breakfast, Lunch, Dinner
    const mainMeals = ['Breakfast', 'Lunch', 'Dinner'];
    
    plan.dailySchedule.forEach((meal) => {
      if (mainMeals.includes(meal.mealType)) {
        // Take first 2 options as "featured"
        const featuredOptions = meal.options.slice(0, 2).map(food => ({
          name: food.name,
          portion: food.portion,
          imageUrl: food.imageUrl,
          calories: food.calories,
          protein: food.macros?.protein || 0,
          carbs: food.macros?.carbs || 0,
          fats: food.macros?.fats || 0
        }));
        
        if (featuredOptions.length > 0) {
          groups.push({
            mealType: meal.mealType,
            time: meal.time,
            items: featuredOptions
          });
        }
      }
    });
    
    return groups;
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900">Featured Menu</h2>
        <p className="mt-2 text-gray-600">Curated healthy options from your personalized diet plan</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C5E17A]"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedMeals.map((group, groupIndex) => (
            <div key={groupIndex}>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="bg-[#C5E17A] text-black text-xs px-2 py-1 rounded">
                  {group.time}
                </span>
                {group.mealType}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {group.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="relative h-48">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-[#C5E17A] text-black text-xs font-semibold px-3 py-1 rounded-full">
                          {group.mealType}
                        </span>
                      </div>
                      <div className="absolute bottom-2 right-2">
                        <span className="bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                          <span>🔥</span>
                          {item.calories} kcal
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">{item.portion}</p>
                      <div className="flex justify-between mt-3 text-sm">
                        <span className="text-[#C5E17A]">💪 {item.protein}g</span>
                        <span className="text-orange-500">🍞 {item.carbs}g</span>
                        <span className="text-yellow-500">🥑 {item.fats}g</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FeaturedMenu;

