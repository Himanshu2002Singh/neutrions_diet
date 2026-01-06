import { useState, useEffect } from 'react';
import { apiService } from '../../../services/api';
import { TrendingUp, TrendingDown, Minus, Calendar, Flame, ChevronLeft, ChevronRight } from 'lucide-react';

interface DayActivity {
  date: string;
  dayName: string;
  isToday: boolean;
  totalCalories: number;
  targetCalories: number;
  mealCount: number;
  meals: {
    mealType: string;
    selectedItems: string[];
    calories: number;
  }[];
}

interface WeeklyProgressProps {
  defaultTargetCalories?: number;
}

export function WeeklyProgress({ defaultTargetCalories = 2000 }: WeeklyProgressProps) {
  const [activities, setActivities] = useState<DayActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [targetCalories, setTargetCalories] = useState(defaultTargetCalories);
  const [weekOffset, setWeekOffset] = useState(0);

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

  // Fetch 7-day activities
  useEffect(() => {
    if (userId) {
      fetchWeeklyActivities();
    }
  }, [userId, weekOffset]);

  const fetchWeeklyActivities = async () => {
    if (!userId) return;

    setIsLoading(true);
    
    try {
      // Calculate date range based on weekOffset
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + (weekOffset * 7));
      
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 6);

      const response = await apiService.getMealActivities(
        userId, 
        startDate.toISOString().split('T')[0], 
        endDate.toISOString().split('T')[0]
      );

      if (response.success && response.data) {
        // Fetch diet plan to get target calories
        const dietResponse = await apiService.getPersonalizedDietPlan(userId);
        if (dietResponse.success && dietResponse.data?.nutritionTargets?.calories) {
          const match = dietResponse.data.nutritionTargets.calories.match(/(\d+)/);
          if (match) {
            setTargetCalories(parseInt(match[1]));
          }
        }

        // Transform data into DayActivity format
        const activitiesByDate = response.data.activitiesByDate || {};
        const days: DayActivity[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 7; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() + (weekOffset * 7) - i);
          const dateStr = date.toISOString().split('T')[0];
          const dayData = activitiesByDate[dateStr];

          const dayName = i === 0 ? 'Today' : i === 1 ? 'Yesterday' : date.toLocaleDateString('en-US', { weekday: 'short' });

          // Calculate calories for this day
          let totalCalories = 0;
          let mealCount = 0;
          const meals: DayActivity['meals'] = [];

          if (dayData) {
            Object.entries(dayData).forEach(([mealType, activity]: [string, any]) => {
              if (activity.selectedItems && activity.selectedItems.length > 0) {
                mealCount++;
                // Estimate calories based on selected items (simplified)
                const estimatedCalories = activity.selectedItems.length * 250; // Avg 250 kcal per item
                totalCalories += estimatedCalories;

                meals.push({
                  mealType,
                  selectedItems: activity.selectedItems,
                  calories: estimatedCalories
                });
              }
            });
          }

          days.push({
            date: dateStr,
            dayName,
            isToday: i === 0,
            totalCalories,
            targetCalories,
            mealCount,
            meals
          });
        }

        setActivities(days);
      }
    } catch (error) {
      console.error('Failed to fetch weekly activities:', error);
      // Create empty days for display
      const days: DayActivity[] = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + (weekOffset * 7) - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayName = i === 0 ? 'Today' : i === 1 ? 'Yesterday' : date.toLocaleDateString('en-US', { weekday: 'short' });

        days.push({
          date: dateStr,
          dayName,
          isToday: i === 0,
          totalCalories: 0,
          targetCalories,
          mealCount: 0,
          meals: []
        });
      }
      setActivities(days);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate stats
  const averageCalories = Math.round(activities.reduce((sum, d) => sum + d.totalCalories, 0) / activities.filter(d => d.totalCalories > 0).length || 0);
  const totalMeals = activities.reduce((sum, d) => sum + d.mealCount, 0);
  const onTargetDays = activities.filter(d => d.totalCalories > 0 && d.totalCalories <= d.targetCalories * 1.1).length;
  const overTargetDays = activities.filter(d => d.totalCalories > d.targetCalories * 1.1).length;

  // Get trend
  const getTrend = () => {
    const firstHalf = activities.slice(0, 4).reduce((sum, d) => sum + d.totalCalories, 0);
    const secondHalf = activities.slice(3, 7).reduce((sum, d) => sum + d.totalCalories, 0);
    
    if (secondHalf < firstHalf * 0.95) return { icon: TrendingDown, color: 'text-green-600', text: 'Improving' };
    if (secondHalf > firstHalf * 1.05) return { icon: TrendingUp, color: 'text-red-600', text: 'Increasing' };
    return { icon: Minus, color: 'text-yellow-600', text: 'Stable' };
  };

  const trend = getTrend();
  const TrendIcon = trend.icon;

  // Get calorie bar height percentage
  const getBarHeight = (calories: number) => {
    const percentage = Math.min((calories / targetCalories) * 100, 150);
    return `${percentage}%`;
  };

  // Get bar color based on calories vs target
  const getBarColor = (calories: number) => {
    if (calories === 0) return 'bg-gray-200';
    if (calories <= targetCalories * 0.8) return 'bg-yellow-400';
    if (calories <= targetCalories * 1.1) return 'bg-green-500';
    return 'bg-red-500';
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Navigate weeks
  const navigateWeek = (direction: number) => {
    setWeekOffset(prev => prev + direction);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Weekly Progress Analysis</h1>
          <p className="text-gray-600">Track your calorie intake and meal patterns</p>
        </div>
        
        {/* Week Navigation */}
        <div className="flex items-center gap-4 bg-white rounded-lg p-2 shadow-sm">
          <button
            onClick={() => navigateWeek(-1)}
            disabled={weekOffset >= 0}
            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="text-sm font-medium text-gray-700 min-w-[140px] text-center">
            {weekOffset === 0 ? 'Current Week' : `${Math.abs(weekOffset)} week${Math.abs(weekOffset) > 1 ? 's' : ''} ago`}
          </span>
          <button
            onClick={() => navigateWeek(1)}
            disabled={weekOffset <= -1}
            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Average Calories</p>
              <p className="text-2xl font-bold text-gray-900">{averageCalories}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Flame className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Daily average this week</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Meals</p>
              <p className="text-2xl font-bold text-gray-900">{totalMeals}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Meals tracked this week</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">On Target</p>
              <p className="text-2xl font-bold text-green-600">{onTargetDays}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Days within 10% of target</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Trend</p>
              <p className={`text-2xl font-bold ${trend.color}`}>{trend.text}</p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${trend.color.replace('text-', 'bg-').replace('600', '100')}`}>
              <TrendIcon className={`w-6 h-6 ${trend.color}`} />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">vs. previous days</p>
        </div>
      </div>

      {/* Main Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Calorie Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Daily Calorie Intake</h2>
          
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#C5E17A]"></div>
            </div>
          ) : (
            <div className="flex items-end justify-between h-64 gap-2">
              {activities.map((day, index) => (
                <div key={day.date} className="flex-1 flex flex-col items-center">
                  <div className="relative w-full flex justify-center">
                    {/* Target line indicator */}
                    <div 
                      className="absolute w-full border-t-2 border-dashed border-gray-300 z-10"
                      style={{ bottom: `${Math.min((targetCalories / (targetCalories * 1.5)) * 100, 100)}%` }}
                    ></div>
                    
                    {/* Bar */}
                    <div 
                      className={`w-8 sm:w-12 rounded-t-lg ${getBarColor(day.totalCalories)} transition-all duration-500 relative`}
                      style={{ height: getBarHeight(day.totalCalories) }}
                    >
                      {day.totalCalories > 0 && (
                        <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700">
                          {day.totalCalories}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-2 text-center">
                    <p className={`text-xs font-medium ${day.isToday ? 'text-[#C5E17A]' : 'text-gray-600'}`}>
                      {day.dayName}
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(day.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs text-gray-600">On Target (max {targetCalories})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <span className="text-xs text-gray-600">Low (Less than 80%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-xs text-gray-600">Over Target</span>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Weekly Summary</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Target per Day</span>
              <span className="font-semibold text-gray-900">{targetCalories} kcal</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Total Consumed</span>
              <span className="font-semibold text-gray-900">
                {activities.reduce((sum, d) => sum + d.totalCalories, 0)} kcal
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Weekly Total Target</span>
              <span className="font-semibold text-gray-900">
                {targetCalories * 7} kcal
              </span>
            </div>
            
            <div className={`flex items-center justify-between p-3 rounded-lg ${
              activities.reduce((sum, d) => sum + d.totalCalories, 0) <= targetCalories * 7 
                ? 'bg-green-100' 
                : 'bg-red-100'
            }`}>
              <span className={`text-sm font-medium ${
                activities.reduce((sum, d) => sum + d.totalCalories, 0) <= targetCalories * 7 
                  ? 'text-green-800' 
                  : 'text-red-800'
              }`}>
                Weekly Balance
              </span>
              <span className={`font-bold ${
                activities.reduce((sum, d) => sum + d.totalCalories, 0) <= targetCalories * 7 
                  ? 'text-green-800' 
                  : 'text-red-800'
              }`}>
                {activities.reduce((sum, d) => sum + d.totalCalories, 0) - targetCalories * 7 > 0 ? '+' : ''}
                {activities.reduce((sum, d) => sum + d.totalCalories, 0) - targetCalories * 7} kcal
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Breakdown */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Daily Breakdown</h2>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#C5E17A]"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((day) => (
              <div 
                key={day.date} 
                className={`p-4 rounded-lg border ${
                  day.isToday 
                    ? 'border-[#C5E17A] bg-[#C5E17A]/5' 
                    : 'border-gray-200 hover:border-gray-300'
                } transition-colors`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm ${
                      day.isToday 
                        ? 'bg-[#C5E17A] text-black' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {day.dayName.substring(0, 2)}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{day.dayName}</p>
                      <p className="text-xs text-gray-500">{formatDate(day.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${
                      day.totalCalories === 0 
                        ? 'text-gray-400' 
                        : day.totalCalories <= targetCalories 
                          ? 'text-green-600' 
                          : 'text-red-600'
                    }`}>
                      {day.totalCalories || 0} <span className="text-sm font-normal text-gray-500">kcal</span>
                    </p>
                    <p className="text-xs text-gray-500">{day.mealCount} meals</p>
                  </div>
                </div>

                {/* Calorie Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      day.totalCalories === 0 
                        ? 'bg-gray-300' 
                        : day.totalCalories <= targetCalories 
                          ? 'bg-green-500' 
                          : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min((day.totalCalories / targetCalories) * 100, 100)}%` }}
                  ></div>
                </div>

                {/* Meals detail */}
                {day.meals.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {day.meals.map((meal, idx) => (
                      <span 
                        key={idx}
                        className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-600"
                      >
                        {meal.mealType}: {meal.calories} kcal
                      </span>
                    ))}
                  </div>
                )}

                {day.totalCalories === 0 && (
                  <p className="text-sm text-gray-400 italic">No meals tracked yet</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-semibold text-blue-800 mb-2">💡 Tips for Better Progress</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Track your meals daily to stay accountable</li>
          <li>• Aim for consistent calorie intake throughout the week</li>
          <li>• Do not skip meals - regular eating helps maintain metabolism</li>
          <li>• Review your patterns to identify areas for improvement</li>
        </ul>
      </div>
    </div>
  );
}

export default WeeklyProgress;

