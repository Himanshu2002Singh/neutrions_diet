import { useState, useEffect } from 'react';
import { TrendingUp, Activity, Target, Zap, Heart, AlertCircle, CheckCircle, Sun } from 'lucide-react';

interface HealthTip {
  id: number;
  type: 'diet' | 'exercise' | 'wellness' | 'warning';
  title: string;
  description: string;
  icon: string;
  priority: 'high' | 'medium' | 'low';
}

interface HealthMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'bad';
  trend: 'up' | 'down' | 'stable';
  target?: string;
}

export default function HealthInsights() {
  const [healthTips, setHealthTips] = useState<HealthTip[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHealthInsights();
  }, []);

  const fetchHealthInsights = async () => {
    setIsLoading(true);
    try {
      // Mock data - would come from API
      setHealthTips([
        {
          id: 1,
          type: 'diet',
          title: 'Increase Protein Intake',
          description: 'Adding more protein to your breakfast can help you feel fuller longer and stabilize blood sugar levels throughout the day.',
          icon: '🍳',
          priority: 'high'
        },
        {
          id: 2,
          type: 'exercise',
          title: 'Morning Walk Benefits',
          description: 'A 30-minute morning walk before breakfast can boost your metabolism and improve sleep quality.',
          icon: '🚶',
          priority: 'medium'
        },
        {
          id: 3,
          type: 'wellness',
          title: 'Stay Hydrated',
          description: 'Drink at least 8 glasses of water daily. Proper hydration supports digestion and metabolism.',
          icon: '💧',
          priority: 'medium'
        },
        {
          id: 4,
          type: 'diet',
          title: 'Reduce Sugar Intake',
          description: 'Cutting down on processed sugars can help stabilize energy levels and reduce cravings.',
          icon: '🍬',
          priority: 'high'
        },
        {
          id: 5,
          type: 'exercise',
          title: 'Strength Training',
          description: 'Include strength training 2-3 times per week to build muscle and boost metabolism.',
          icon: '💪',
          priority: 'low'
        },
        {
          id: 6,
          type: 'wellness',
          title: 'Sleep Schedule',
          description: 'Maintaining consistent sleep and wake times helps regulate your body\'s natural rhythm.',
          icon: '😴',
          priority: 'medium'
        }
      ]);

      setHealthMetrics([
        {
          name: 'Daily Calories',
          value: 1950,
          unit: 'kcal',
          status: 'good',
          trend: 'stable',
          target: '2000'
        },
        {
          name: 'Protein',
          value: 78,
          unit: 'g',
          status: 'good',
          trend: 'up',
          target: '75g'
        },
        {
          name: 'Carbs',
          value: 180,
          unit: 'g',
          status: 'warning',
          trend: 'up',
          target: '150g'
        },
        {
          name: 'Water Intake',
          value: 6,
          unit: 'glasses',
          status: 'good',
          trend: 'stable',
          target: '8'
        },
        {
          name: 'Sleep',
          value: 7,
          unit: 'hours',
          status: 'warning',
          trend: 'stable',
          target: '8'
        },
        {
          name: 'Steps',
          value: 8500,
          unit: 'steps',
          status: 'warning',
          trend: 'down',
          target: '10000'
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch health insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'bad': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4" />;
      case 'down': return <TrendingUp className="w-4 h-4 transform rotate-180" />;
      default: return <span className="w-4 h-0.5 bg-gray-400 block" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'diet': return <Target className="w-5 h-5" />;
      case 'exercise': return <Zap className="w-5 h-5" />;
      case 'wellness': return <Heart className="w-5 h-5" />;
      case 'warning': return <AlertCircle className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'diet': return 'bg-orange-100 text-orange-600';
      case 'exercise': return 'bg-blue-100 text-blue-600';
      case 'wellness': return 'bg-purple-100 text-purple-600';
      case 'warning': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C5E17A]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Health Insights</h1>
        <p className="text-gray-600">Personalized tips and recommendations for your health journey</p>
      </div>

      {/* Health Score Overview */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-[#C5E17A]" />
            <h2 className="text-xl font-bold text-gray-900">Health Score</h2>
          </div>
          <span className="text-sm text-gray-500">Last updated: Today</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-[#C5E17A]/10 rounded-xl">
            <div className="relative w-24 h-24 mx-auto mb-3">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="#E5E7EB" strokeWidth="8" fill="none" />
                <circle 
                  cx="48" 
                  cy="48" 
                  r="40" 
                  stroke="#C5E17A" 
                  strokeWidth="8" 
                  fill="none"
                  strokeDasharray="251.2"
                  strokeDashoffset="50.24"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-900">80</span>
            </div>
            <p className="font-semibold text-gray-900">Overall Score</p>
            <p className="text-sm text-green-600">Excellent!</p>
          </div>

          <div className="text-center p-4 bg-orange-100 rounded-xl">
            <div className="relative w-24 h-24 mx-auto mb-3">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="#E5E7EB" strokeWidth="8" fill="none" />
                <circle 
                  cx="48" 
                  cy="48" 
                  r="40" 
                  stroke="#F97316" 
                  strokeWidth="8" 
                  fill="none"
                  strokeDasharray="251.2"
                  strokeDashoffset="75.36"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-900">70</span>
            </div>
            <p className="font-semibold text-gray-900">Diet Quality</p>
            <p className="text-sm text-orange-600">Good</p>
          </div>

          <div className="text-center p-4 bg-blue-100 rounded-xl">
            <div className="relative w-24 h-24 mx-auto mb-3">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="#E5E7EB" strokeWidth="8" fill="none" />
                <circle 
                  cx="48" 
                  cy="48" 
                  r="40" 
                  stroke="#3B82F6" 
                  strokeWidth="8" 
                  fill="none"
                  strokeDasharray="251.2"
                  strokeDashoffset="37.68"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-900">85</span>
            </div>
            <p className="font-semibold text-gray-900">Activity Level</p>
            <p className="text-sm text-blue-600">Very Good</p>
          </div>

          <div className="text-center p-4 bg-purple-100 rounded-xl">
            <div className="relative w-24 h-24 mx-auto mb-3">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="#E5E7EB" strokeWidth="8" fill="none" />
                <circle 
                  cx="48" 
                  cy="48" 
                  r="40" 
                  stroke="#8B5CF6" 
                  strokeWidth="8" 
                  fill="none"
                  strokeDasharray="251.2"
                  strokeDashoffset="62.8"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-900">75</span>
            </div>
            <p className="font-semibold text-gray-900">Sleep Quality</p>
            <p className="text-sm text-purple-600">Good</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health Metrics */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center gap-2 mb-6">
            <Target className="w-5 h-5 text-[#C5E17A]" />
            <h2 className="text-xl font-bold text-gray-900">Daily Metrics</h2>
          </div>

          <div className="space-y-4">
            {healthMetrics.map((metric, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getStatusColor(metric.status)} bg-opacity-10`}>
                    {getTypeIcon(metric.type)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{metric.name}</p>
                    <p className="text-xs text-gray-500">Target: {metric.target}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{metric.value} {metric.unit}</p>
                  <div className={`flex items-center gap-1 ${metric.trend === 'up' ? 'text-green-500' : metric.trend === 'down' ? 'text-red-500' : 'text-gray-400'}`}>
                    {getTrendIcon(metric.trend)}
                    <span className="text-xs">{metric.trend}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Health Tips */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center gap-2 mb-6">
            <Heart className="w-5 h-5 text-[#C5E17A]" />
            <h2 className="text-xl font-bold text-gray-900">Personalized Tips</h2>
          </div>

          <div className="space-y-4">
            {healthTips.map((tip) => (
              <div 
                key={tip.id} 
                className={`p-4 rounded-xl border ${getPriorityColor(tip.priority)}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(tip.type)}`}>
                    <span className="text-lg">{tip.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        tip.priority === 'high' ? 'bg-red-200' : 
                        tip.priority === 'medium' ? 'bg-yellow-200' : 'bg-green-200'
                      }`}>
                        {tip.priority.charAt(0).toUpperCase() + tip.priority.slice(1)} Priority
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{tip.title}</h3>
                    <p className="text-sm text-gray-600">{tip.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights Summary */}
      <div className="mt-6 bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Insights Summary</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-800">Strengths</h3>
            </div>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Consistent protein intake</li>
              <li>• Regular meal timing</li>
              <li>• Good hydration habits</li>
            </ul>
          </div>

          <div className="p-4 bg-yellow-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <h3 className="font-semibold text-yellow-800">Areas to Improve</h3>
            </div>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Increase daily step count</li>
              <li>• Reduce carbohydrate intake</li>
              <li>• Improve sleep duration</li>
            </ul>
          </div>

          <div className="p-4 bg-blue-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Sun className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-800">Today&apos;s Goals</h3>
            </div>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Walk 10,000 steps</li>
              <li>• Drink 8 glasses of water</li>
              <li>• Sleep by 11 PM</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Weekly Trends */}
      <div className="mt-6 bg-white rounded-2xl shadow-md p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-[#C5E17A]" />
          <h2 className="text-xl font-bold text-gray-900">Weekly Trends</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-3xl font-bold text-[#C5E17A]">+2.5 kg</p>
            <p className="text-sm text-gray-600">Weight Loss</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-3xl font-bold text-green-500">92%</p>
            <p className="text-sm text-gray-600">Diet Compliance</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-3xl font-bold text-blue-500">6/7</p>
            <p className="text-sm text-gray-600">Workouts Completed</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-3xl font-bold text-purple-500">-15%</p>
            <p className="text-sm text-gray-600">Sugar Intake Reduced</p>
          </div>
        </div>
      </div>
    </div>
  );
}

