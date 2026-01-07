import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  TrendingDown, 
  Activity, 
  Loader2, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Target,
  CheckCircle
} from 'lucide-react';
import { getDoctorUserDietAnalysis, getDoctorUserMealActivities } from '../services/api';

// Types
interface MealItem {
  name: string;
  calories: number;
  portion?: string;
}

interface MealActivityData {
  id: number;
  mealType: string;
  selectedItems: MealItem[];
  notes: string | null;
  totalCalories: number;
  createdAt: string;
  updatedAt: string;
}

interface ProgressDetailViewProps {
  userId: number;
  onBack: () => void;
}

type FilterPeriod = 'day' | 'week' | 'month';

// Meal type order for consistent display
const MEAL_TYPE_ORDER = [
  'Wake Up',
  'Breakfast',
  'Mid-Morning',
  'Lunch',
  'Pre-Workout',
  'Evening Snacks',
  'Dinner',
  'Bed Time'
];

// Meal type with default times
const MEAL_TIMES: { [key: string]: string } = {
  'Wake Up': '6:00 AM',
  'Breakfast': '8:00 AM',
  'Mid-Morning': '10:30 AM',
  'Lunch': '1:00 PM',
  'Pre-Workout': '4:00 PM',
  'Evening Snacks': '5:30 PM',
  'Dinner': '7:30 PM',
  'Bed Time': '10:00 PM'
};

function ProgressDetailView({ userId, onBack }: ProgressDetailViewProps) {
  const [filter, setFilter] = useState<FilterPeriod>('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dietAnalysis, setDietAnalysis] = useState<any>(null);
  const [mealActivities, setMealActivities] = useState<any>(null);
  const [expandedMeals, setExpandedMeals] = useState<{ [date: string]: boolean }>({});

  useEffect(() => {
    fetchData();
  }, [userId, filter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [analysisResponse, activitiesResponse] = await Promise.all([
        getDoctorUserDietAnalysis(userId, filter),
        getDoctorUserMealActivities(userId)
      ]);

      if (analysisResponse.success) {
        setDietAnalysis(analysisResponse.data);
      }
      
      if (activitiesResponse.success) {
        setMealActivities(activitiesResponse.data);
      }

      if (!analysisResponse.success && !activitiesResponse.success) {
        setError('Failed to load progress data');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading data');
    } finally {
      setLoading(false);
    }
  };

  const toggleMealExpansion = (date: string) => {
    setExpandedMeals(prev => ({
      ...prev,
      [date]: !prev[date]
    }));
  };

  const getComplianceColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplianceBg = (rate: number) => {
    if (rate >= 80) return 'bg-green-500';
    if (rate >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Get today's date string for highlighting
  const todayStr = new Date().toISOString().split('T')[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
        <span className="ml-3 text-gray-600">Loading progress data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="flex items-center mb-6">
          <button onClick={onBack} className="mr-4 p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Progress Details</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Progress Details</h1>
          <p className="text-gray-600 mt-1">Detailed diet tracking and compliance analysis</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm w-fit">
          {(['day', 'week', 'month'] as FilterPeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setFilter(p)}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === p
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      {dietAnalysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Current Weight</p>
                <p className="text-2xl font-bold text-gray-800">
                  {dietAnalysis.currentWeight > 0 ? `${dietAnalysis.currentWeight} kg` : 'N/A'}
                </p>
              </div>
              <TrendingDown className="text-green-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Target Calories</p>
                <p className="text-2xl font-bold text-blue-600">{dietAnalysis.targetCalories} kcal</p>
              </div>
              <Target className="text-blue-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Avg Daily Intake</p>
                <p className="text-2xl font-bold text-gray-800">{dietAnalysis.analysis.avgDailyCalories} kcal</p>
              </div>
              <Activity className="text-purple-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Compliance Rate</p>
                <p className={`text-2xl font-bold ${getComplianceColor(dietAnalysis.analysis.complianceRate)}`}>
                  {dietAnalysis.analysis.complianceRate}%
                </p>
              </div>
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-4 border-gray-200">
                  <div 
                    className={`w-full h-full rounded-full ${getComplianceBg(dietAnalysis.analysis.complianceRate)} opacity-20`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calorie Progress Bar */}
      {mealActivities && mealActivities.summary && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Calorie Progress (Last 7 Days)</h3>
          <div className="flex items-center mb-2">
            <span className="text-sm text-gray-600 w-24">Consumed</span>
            <div className="flex-1 h-6 bg-gray-200 rounded-full overflow-hidden mr-2">
              <div 
                className={`h-full ${getComplianceBg(mealActivities.summary.avgComplianceRate)}`}
                style={{ 
                  width: `${Math.min((mealActivities.summary.avgCaloriesPerDay / mealActivities.summary.targetCalories) * 100, 100)}%` 
                }}
              />
            </div>
            <span className="text-sm font-medium text-gray-700 w-24 text-right">
              {mealActivities.summary.avgCaloriesPerDay} / {mealActivities.summary.targetCalories} kcal
            </span>
          </div>
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>Daily Average: {mealActivities.summary.avgCaloriesPerDay} kcal</span>
            <span>Compliance: {mealActivities.summary.avgComplianceRate}%</span>
            <span>Days Tracked: {mealActivities.summary.daysWithMeals}/{mealActivities.summary.totalDays}</span>
          </div>
        </div>
      )}

      {/* Meal Activities by Date */}
      {mealActivities && mealActivities.activitiesByDate && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Daily Meal Activities</h3>
          </div>
          
          {Object.entries(mealActivities.activitiesByDate)
            .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
            .map(([date, meals]) => {
              const isExpanded = expandedMeals[date] || false;
              const isToday = date === todayStr;
              const mealsObj = meals as { [key: string]: MealActivityData };
              const dailyTotal = Object.values(mealsObj).reduce((sum, meal) => sum + meal.totalCalories, 0);
              const targetCalories = mealActivities.summary?.targetCalories || 2000;
              
              return (
                <div key={date} className="border-b border-gray-100 last:border-b-0">
                  {/* Date Header */}
                  <button
                    onClick={() => toggleMealExpansion(date)}
                    className={`w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                      isToday ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full mr-4 ${isToday ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <Calendar size={20} className={isToday ? 'text-blue-600' : 'text-gray-500'} />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-gray-800">
                          {new Date(date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                          {isToday && (
                            <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">Today</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {Object.keys(mealsObj).length} meals logged
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="text-right mr-4">
                        <div className="font-semibold text-gray-800">{dailyTotal} kcal</div>
                        <div className={`text-sm ${getComplianceColor(Math.round((dailyTotal / targetCalories) * 100))}`}>
                          {Math.round((dailyTotal / targetCalories) * 100)}% of target
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp size={20} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={20} className="text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* Meal Details */}
                  {isExpanded && (
                    <div className="px-6 pb-4 bg-gray-50">
                      {MEAL_TYPE_ORDER
                        .filter(mealType => mealsObj[mealType])
                        .map(mealType => {
                          const meal = mealsObj[mealType];
                          return (
                            <div key={mealType} className="mb-4 last:mb-0 bg-white rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center">
                                  <Clock size={16} className="text-gray-400 mr-2" />
                                  <span className="font-medium text-gray-700">{mealType}</span>
                                  <span className="text-sm text-gray-400 ml-2">
                                    ({MEAL_TIMES[mealType] || 'N/A'})
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <span className="font-semibold text-gray-800 mr-2">
                                    {meal.totalCalories} kcal
                                  </span>
                                  <span className="text-sm text-gray-400">
                                    / {Math.round(targetCalories / 5)} kcal
                                  </span>
                                </div>
                              </div>
                              
                              {/* Progress bar for meal */}
                              <div className="w-full h-2 bg-gray-200 rounded-full mb-3">
                                <div 
                                  className={`h-full rounded-full ${getComplianceBg(Math.round((meal.totalCalories / (targetCalories / 5)) * 100))}`}
                                  style={{ 
                                    width: `${Math.min((meal.totalCalories / (targetCalories / 5)) * 100, 100)}%` 
                                  }}
                                />
                              </div>

                              {/* Food Items */}
                              {meal.selectedItems && meal.selectedItems.length > 0 && (
                                <div className="space-y-2">
                                  {meal.selectedItems.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-sm">
                                      <div className="flex items-center">
                                        {item.portion ? (
                                          <CheckCircle size={14} className="text-green-500 mr-2" />
                                        ) : (
                                          <CheckCircle size={14} className="text-gray-400 mr-2" />
                                        )}
                                        <span className="text-gray-700">{item.name}</span>
                                      </div>
                                      <span className="text-gray-500">{item.calories} kcal</span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Notes */}
                              {meal.notes && (
                                <div className="mt-2 text-sm text-gray-500 italic">
                                  Note: {meal.notes}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              );
            })}

          {Object.keys(mealActivities.activitiesByDate).length === 0 && (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No meal activities recorded yet</p>
            </div>
          )}
        </div>
      )}

      {/* Weekly Trend Chart */}
      {dietAnalysis && dietAnalysis.analysis.daysData && dietAnalysis.analysis.daysData.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Trend</h3>
          <div className="space-y-3">
            {dietAnalysis.analysis.daysData.slice(0, 7).map((day: any, idx: number) => (
              <div key={idx} className="flex items-center">
                <div className="w-24 text-sm text-gray-600">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
                <div className="flex-1 mx-4">
                  <div className="flex items-center">
                    <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden relative">
                      <div 
                        className={`absolute left-0 top-0 h-full ${getComplianceBg(day.compliance)}`}
                        style={{ width: `${Math.min((day.actual / day.target) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="w-24 text-right">
                  <span className="text-sm font-medium text-gray-700">{day.actual}</span>
                  <span className="text-xs text-gray-400"> / {day.target}</span>
                </div>
                <div className="w-16 text-right">
                  <span className={`text-sm font-medium ${getComplianceColor(day.compliance)}`}>
                    {day.compliance}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProgressDetailView;

