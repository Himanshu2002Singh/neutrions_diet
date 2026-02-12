import { useState, useEffect, useRef } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  const nextSlide = () => {
    setCurrentSlide((prev) => 
      prev === displayPlans.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => 
      prev === 0 ? displayPlans.length - 1 : prev - 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  if (loading) {
    return (
      <section className="mb-12" id='price-plans'>
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
        {isMobile ? (
          // Mobile loading skeleton
          <div className="relative overflow-hidden">
            <div className="flex">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-full flex-shrink-0 px-4">
                  <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden animate-pulse">
                    <div className="h-64 bg-gray-200" />
                    <div className="p-6">
                      <div className="h-6 bg-gray-200 rounded mb-3" />
                      <div className="h-4 bg-gray-200 rounded mb-4" />
                      <div className="h-5 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Desktop loading skeleton
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
        )}
      </section>
    );
  }

  // Mobile View - Slider
  if (isMobile) {
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
            <button className="bg-[#FF6B4A] text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity w-full lg:w-auto">
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
        
        {/* Mobile Slider */}
        <div className="relative">
          <div 
            ref={sliderRef}
            className="flex overflow-hidden transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {displayPlans.map((plan) => (
              <div key={plan.id} className="w-full flex-shrink-0 px-4">
                <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden group hover:shadow-lg transition-shadow h-full">
                  <div className={`${plan.color || CARD_COLORS[plan.id % CARD_COLORS.length]} h-64 flex items-center justify-center p-6 relative`}>
                    {(plan.badge || (plans.length === 0 && plan.id === 0)) && (
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
                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">{plan.description}</p>
                    <div className="flex flex-col gap-3">
                      <span className="text-xl font-bold">{plan.price}</span>
                      <button className="bg-[#FF6B4A] text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity text-base">
                        Get Started
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all z-10"
            aria-label="Previous plan"
          >
            <ChevronLeft className="w-5 h-5 text-gray-800" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all z-10"
            aria-label="Next plan"
          >
            <ChevronRight className="w-5 h-5 text-gray-800" />
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-6 space-x-2">
            {displayPlans.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide 
                    ? 'bg-[#FF6B4A] w-6' 
                    : 'bg-gray-300'
                }`}
                aria-label={`Go to plan ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Desktop View - Grid
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
        {/* <div className="text-left lg:text-right">
          <p className="text-sm mb-3 opacity-70">
            AI-powered nutrition with professional support
            <br />
            Tailored to your unique needs and goals
          </p>
          <button className="bg-[#FF6B4A] text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity w-full lg:w-auto">
            Get Started Now
            <ArrowRight className="w-5 h-5" />
          </button>
        </div> */}
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error} - Showing default plans
        </div>
      )}
      
      {/* Desktop Grid */}
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