import { useState, useEffect, useCallback } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Activity, Target, TrendingUp, Award, Utensils, Dumbbell, Star, AlertCircle } from 'lucide-react';
import { apiService } from '../../../services/api';
import { Link } from 'react-router-dom';

interface UserData {
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  location?: string;
  joinedDate?: string;
}

interface HealthData {
  age: number;
  weight: number;
  height: number;
  gender: string;
  activityLevel: string;
  medicalConditions: string[];
  goals: string[];
  targetWeight: number | null;
}

interface BmiData {
  bmi: number;
  category: string;
  bmr: number;
  dailyCalories: number;
}

interface AssignedDoctor {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  assignedAt: string | null;
}

interface DietPlanData {
  id: number;
  name: string;
  goals: string[];
  nutritionTargets: {
    calories: string;
    protein: string;
    fiber: string;
    fat: string;
    carbs: string;
  } | null;
  startDate: string;
  status: string;
}

interface WeeklyProgress {
  totalMealsTracked: number;
  daysWithMeals: number;
  avgMealsPerDay: string;
  byDate: Record<string, Array<{
    mealType: string;
    items: string[];
    notes: string | null;
  }>>;
}

interface DashboardData {
  user: UserData;
  health: HealthData | null;
  bmi: BmiData | null;
  assignedDoctor: AssignedDoctor | null;
  dietPlan: DietPlanData | null;
  weeklyProgress: WeeklyProgress;
}

export default function DashboardHome() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // First try to get userId from localStorage (set by googleAuth.ts on login)
      let userId = localStorage.getItem('userId');
      
      // If not found, try parsing from neutrion-user object
      if (!userId) {
        const savedUser = localStorage.getItem('neutrion-user');
        if (savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            userId = userData.id || userData.userId || null;
          } catch {
            userId = null;
          }
        }
      }
      
      if (userId) {
        const response = await apiService.getDashboardData(parseInt(userId));
        
        if (response.success && response.data) {
          setDashboardData(response.data);
        } else {
          // Fallback to mock data if API fails
          console.warn('API returned unsuccessful response, using mock data');
          const savedUser = localStorage.getItem('neutrion-user');
          if (savedUser) {
            setDashboardData(getMockData(JSON.parse(savedUser)));
          }
        }
      } else {
        // No user logged in, use empty state
        setDashboardData(null);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      // Use mock data as fallback on error
      const savedUser = localStorage.getItem('neutrion-user');
      if (savedUser) {
        try {
          setDashboardData(getMockData(JSON.parse(savedUser)));
        } catch {
          setDashboardData(null);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Generate mock data for fallback
  const getMockData = (userData: any): DashboardData => {
    return {
      user: {
        name: userData.name || 'User',
        email: userData.email || 'user@example.com',
        avatar: userData.avatar,
        phone: '+91 98765 43210',
        location: 'Mumbai, India',
        joinedDate: 'Jan 2024'
      },
      health: {
        age: 28,
        weight: 70,
        height: 170,
        gender: 'male',
        activityLevel: 'moderate',
        medicalConditions: ['None'],
        goals: ['Weight Loss', 'Eat More Protein'],
        targetWeight: 65
      },
      bmi: {
        bmi: 24.2,
        category: 'Normal',
        bmr: 1650,
        dailyCalories: 2200
      },
      assignedDoctor: {
        id: 1,
        name: 'Dr. Priya Sharma',
        email: 'priya@neutrion.com',
        phone: '+91 99887 76655',
        role: 'dietician',
        assignedAt: '2024-01-15'
      },
      dietPlan: {
        id: 1,
        name: 'Weight Loss Program - Premium',
        goals: ['Weight Loss', 'Add More Protein'],
        nutritionTargets: {
          calories: '1800-2000 kcal',
          protein: '75g',
          fiber: '25-30g',
          fat: '35-40g',
          carbs: '150g'
        },
        startDate: '2024-01-15',
        status: 'active'
      },
      weeklyProgress: {
        totalMealsTracked: 18,
        daysWithMeals: 5,
        avgMealsPerDay: '3.6',
        byDate: {
          '2024-02-15': [
            { mealType: 'breakfast', items: ['Oatmeal with Berries'], notes: null },
            { mealType: 'lunch', items: ['Grilled Chicken Salad'], notes: null },
            { mealType: 'dinner', items: ['Salmon with Vegetables'], notes: null }
          ],
          '2024-02-14': [
            { mealType: 'breakfast', items: ['Greek Yogurt Parfait'], notes: null },
            { mealType: 'lunch', items: ['Vegetable Stir Fry'], notes: null },
            { mealType: 'dinner', items: ['Quinoa Bowl'], notes: null }
          ]
        }
      }
    };
  };

  // Calculate progress percentage for the diet plan
  const calculatePlanProgress = (): number => {
    if (!dashboardData?.dietPlan) return 0;
    const startDate = new Date(dashboardData.dietPlan.startDate);
    const today = new Date();
    const totalDays = 90; // Assuming 90 day plan
    const daysPassed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.min(Math.round((daysPassed / totalDays) * 100), 100);
  };

  const getMaxCalories = () => 2500;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C5E17A]"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No data available. Please log in.</p>
        </div>
      </div>
    );
  }

  const progress = calculatePlanProgress();
  const user = dashboardData.user;
  const health = dashboardData.health;
  const bmi = dashboardData.bmi;
  const assignedDoctor = dashboardData.assignedDoctor;
  const dietPlan = dashboardData.dietPlan;
  const weeklyProgress = dashboardData.weeklyProgress;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user.name?.split(' ')[0] || 'User'}! 👋</h1>
        <p className="text-gray-600">Here's an overview of your health journey</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Profile Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-[#C5E17A] flex items-center justify-center overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-black" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-600 mb-4">{user.email}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  {user.phone || 'Not provided'}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  {user.location || 'Location not set'}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  Joined: {user.joinedDate ? new Date(user.joinedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Activity className="w-4 h-4" />
                  BMI: {bmi?.bmi?.toFixed(1) || 'N/A'} ({bmi?.category || 'Not calculated'})
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                {dietPlan ? 'Active Plan' : 'No Plan'}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{health?.weight || '--'} kg</p>
              <p className="text-sm text-gray-500">Current Weight</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[#C5E17A]">{health?.targetWeight || '--'} kg</p>
              <p className="text-sm text-gray-500">Target Weight</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-500">{bmi?.bmi?.toFixed(1) || '--'}</p>
              <p className="text-sm text-gray-500">BMI Score</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">Day {progress}</p>
              <p className="text-sm text-gray-500">Journey Day</p>
            </div>
          </div>
        </div>

        {/* Assigned Dietitian Card */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-[#C5E17A]" />
            <h3 className="font-semibold text-gray-900">Your Dietitian</h3>
          </div>
          
          {assignedDoctor ? (
            <>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
                  {assignedDoctor.avatar ? (
                    <img src={assignedDoctor.avatar} alt={assignedDoctor.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{assignedDoctor.name}</p>
                  <p className="text-sm text-gray-600 capitalize">{assignedDoctor.role}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm text-gray-600">4.8</span>
                  </div>
                </div>
              </div>
              <Link to='/dashboard/dietitian-support' >
              <button className="w-full bg-[#C5E17A] hover:bg-[#b5d16a] text-black py-2 rounded-lg font-medium transition-colors">
                Chat Now
              </button></Link>
            </>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-3">No dietitian assigned yet</p>
              <p className="text-sm text-gray-400">Contact support to get assigned</p>
            </div>
          )}
        </div>

        {/* Current Plan Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-[#C5E17A]" />
              <h3 className="font-semibold text-gray-900">Current Plan</h3>
            </div>
            <span className="text-sm text-gray-500">{dietPlan ? '90 Days' : 'N/A'}</span>
          </div>
          
          {dietPlan ? (
            <>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#C5E17A]/20 flex items-center justify-center">
                  <Utensils className="w-6 h-6 text-[#C5E17A]" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{dietPlan.name}</h4>
                  <p className="text-sm text-gray-600">
                    {dietPlan.goals?.join(', ') || 'Personalized Diet'} • 
                    Started: {new Date(dietPlan.startDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {/* Nutrition Targets */}
              {dietPlan.nutritionTargets && (
                <div className="grid grid-cols-5 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">{dietPlan.nutritionTargets.calories}</p>
                    <p className="text-xs text-gray-500">Calories</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">{dietPlan.nutritionTargets.protein}</p>
                    <p className="text-xs text-gray-500">Protein</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">{dietPlan.nutritionTargets.carbs}</p>
                    <p className="text-xs text-gray-500">Carbs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">{dietPlan.nutritionTargets.fat}</p>
                    <p className="text-xs text-gray-500">Fat</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">{dietPlan.nutritionTargets.fiber}</p>
                    <p className="text-xs text-gray-500">Fiber</p>
                  </div>
                </div>
              )}
              
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Plan Progress</span>
                  <span className="font-medium text-[#C5E17A]">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-[#C5E17A] h-3 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-900">{Math.round(progress * 0.9)}</p>
                  <p className="text-sm text-gray-500">Days Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-900">{90 - Math.round(progress * 0.9)}</p>
                  <p className="text-sm text-gray-500">Days Remaining</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-green-500">Active</p>
                  <p className="text-sm text-gray-500">Plan Status</p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-2">No active diet plan</p>
              <p className="text-sm text-gray-400">Complete your health profile to get a personalized plan</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#C5E17A]/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-[#C5E17A]" />
              </div>
              <span className="text-sm font-medium text-gray-700">Update Health Profile</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Utensils className="w-5 h-5 text-orange-500" />
              </div>
              <span className="text-sm font-medium text-gray-700">View Diet Plan</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-sm font-medium text-gray-700">Workout Plans</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-sm font-medium text-gray-700">Track Progress</span>
            </button>
          </div>
        </div>

        {/* Diet Tracking Progress */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#C5E17A]" />
              <h3 className="font-semibold text-gray-900">Weekly Diet Tracking</h3>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#C5E17A]"></span>
                Meals Tracked
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gray-300"></span>
                Goal: 21 meals
              </span>
            </div>
          </div>
          
          {/* Weekly Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-[#C5E17A]/10 rounded-xl">
              <p className="text-2xl font-bold text-[#C5E17A]">{weeklyProgress.totalMealsTracked}</p>
              <p className="text-sm text-gray-600">Meals Tracked</p>
            </div>
            <div className="text-center p-4 bg-blue-100 rounded-xl">
              <p className="text-2xl font-bold text-blue-600">{weeklyProgress.daysWithMeals}</p>
              <p className="text-sm text-gray-600">Days Active</p>
            </div>
            <div className="text-center p-4 bg-green-100 rounded-xl">
              <p className="text-2xl font-bold text-green-600">{weeklyProgress.avgMealsPerDay}</p>
              <p className="text-sm text-gray-600">Avg Meals/Day</p>
            </div>
            <div className="text-center p-4 bg-orange-100 rounded-xl">
              <p className="text-2xl font-bold text-orange-600">{Math.round((weeklyProgress.totalMealsTracked / 21) * 100)}%</p>
              <p className="text-sm text-gray-600">Weekly Goal</p>
            </div>
          </div>
          
          {/* Health Goals & Conditions */}
          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-100">
            {health && (
              <>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Health Goals</h4>
                  {health.goals && health.goals.length > 0 ? (
                    <ul className="space-y-2">
                      {health.goals.map((goal, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="w-2 h-2 bg-[#C5E17A] rounded-full"></span>
                          {goal}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-400">No goals set yet</p>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Medical Conditions</h4>
                  {health.medicalConditions && health.medicalConditions.length > 0 && health.medicalConditions[0] !== 'None' ? (
                    <ul className="space-y-2">
                      {health.medicalConditions.map((condition, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                          {condition}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-400">No medical conditions reported</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

