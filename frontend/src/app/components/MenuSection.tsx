import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import ApiService, { PricePlan } from '../../services/api';

// Color palette for alternating cards
const CARD_COLORS = [
  'bg-[#C5E17A]',
  'bg-[#FFC878]',
  'bg-[#CE93D8]',
  'bg-[#4FC3F7]',
  'bg-[#FF8A65]',
];

export function MenuSection() {
  const [plans, setPlans] = useState<PricePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const service = new ApiService();
        const response = await service.getAllPricePlans();
        if (response.success) {
          setPlans(response.data);
        } else {
          setError('Failed to load plans');
        }
      } catch (err) {
        console.error('Error fetching plans:', err);
        setError('Failed to load plans');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // Fallback plans if backend is not available
  const fallbackPlans = [
    {
      id: 0,
      name: 'Personalized Meal Plan',
      description: 'AI-curated meals based on your medical conditions, body type, and dietary preferences',
      price: 'From $99/month',
      image: '/images/meal_planer.jpg',
      badge: 'AI Powered',
      offer: null,
      color: 'bg-[#C5E17A]',
      isActive: true,
      sortOrder: 1,
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 1,
      name: 'Progress Tracking',
      description: 'Detailed weight, nutrition, and fitness milestone tracking with visual charts',
      price: 'Free with plan',
      image: '/images/progressImage.png',
      badge: 'Popular',
      offer: null,
      color: 'bg-[#FFC878]',
      isActive: true,
      sortOrder: 2,
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 2,
      name: '1-on-1 Dietitian Support',
      description: 'Personal dietitian coach with weekly check-ins and customized recommendations',
      price: 'Add-on $49/month',
      image: '/images/1on1.jpg',
      badge: 'Premium',
      offer: null,
      color: 'bg-[#CE93D8]',
      isActive: true,
      sortOrder: 3,
      createdAt: '',
      updatedAt: '',
    },
  ];

  const displayPlans = plans.length > 0 ? plans : fallbackPlans;

  if (loading) {
    return (
      <section className="mb-12">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end mb-8 gap-4">
          <div>
            <p className="text-sm mb-2 opacity-70">Complete Health Solution</p>
            <h2 className="text-3xl lg:text-5xl font-bold">
              Your Personalized <span className="text-[#FF6B4A]">Health</span>
              <br className="hidden lg:block" />
              <span className="text-[#FF6B4A]">Plans</span>
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden animate-pulse">
              <div className="h-64 bg-gray-200" />
              <div className="p-6">
                <div className="h-6 bg-gray-200 rounded mb-3" />
                <div className="h-4 bg-gray-200 rounded mb-4" />
                <div className="h-5 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end mb-8 gap-4">
        <div>
          <p className="text-sm mb-2 opacity-70">Complete Health Solution</p>
          <h2 className="text-3xl lg:text-5xl font-bold">
            Your Personalized <span className="text-[#FF6B4A]">Health</span>
            <br className="hidden lg:block" />
            <span className="text-[#FF6B4A]">Plans</span>
          </h2>
        </div>
        <div className="text-left lg:text-right">
          <p className="text-sm mb-3 opacity-70">
            AI-powered nutrition with professional support
            <br />
            Tailored to your unique needs and goals
          </p>
          <button className="bg-[#FF6B4A] text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity w-full lg:w-auto">
            Get Started Now
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error} - Showing default plans
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayPlans.map((plan, index) => (
          <div key={plan.id} className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden group hover:shadow-lg transition-shadow">
            <div className={`${plan.color || CARD_COLORS[index % CARD_COLORS.length]} h-64 flex items-center justify-center p-6 relative`}>
              {(plan.badge || (plans.length === 0 && index === 0)) && (
                <div className="absolute top-3 right-3 bg-white text-black text-xs px-2 py-1 rounded-full font-semibold">
                  {plan.badge || 'AI Powered'}
                </div>
              )}
              {plan.offer && (
                <div className="absolute top-3 left-3 bg-[#FF6B4A] text-white text-xs px-2 py-1 rounded-full font-semibold">
                  {plan.offer}
                </div>
              )}
              <img
                src={plan.image || '/images/meal_planer.jpg'}
                alt={plan.name}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div className="p-6">
              <h3 className="text-lg lg:text-xl font-bold mb-2">{plan.name}</h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">{plan.description}</p>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <span className="text-lg lg:text-xl font-bold">{plan.price}</span>
                <button className="bg-[#FF6B4A] text-white px-4 lg:px-6 py-2 rounded-lg hover:opacity-90 transition-opacity text-sm lg:text-base">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
