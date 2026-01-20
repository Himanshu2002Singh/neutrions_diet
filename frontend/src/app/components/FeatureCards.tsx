import { User, TrendingUp, MessageCircle, Dumbbell, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

function ChefHat({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
      <line x1="6" x2="18" y1="17" y2="17" />
    </svg>
  );
}

export function FeatureCards() {
  const features = [
    {
      icon: <User className="w-8 h-8" />,
      title: 'Personalized Diet Plans',
      description: 'Custom diet plans based on your medical conditions, body type, goals and daily routine. Get nutrition recommendations that work for you.',
      bgColor: 'bg-[#C5E17A]',
      textColor: 'text-black',
    },
    
    {
      icon: <Dumbbell className="w-8 h-8" />,
      title: 'Workout Plans',
      description: 'Goal-based fitness plans with both home and gym workout routines. Get personalized exercise plans to complement your diet.',
      bgColor: 'bg-[#A5D6A7]',
      textColor: 'text-black',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: '1-on-1 Dietitian Support',
      description: 'Get assigned a personal dietitian coach who tracks your diet and provides weekly check-ins for dedicated support.',
      bgColor: 'bg-[#CE93D8]',
      textColor: 'text-white',
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === features.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? features.length - 1 : prevIndex - 1
    );
  };

  if (isMobile) {
    return (
      <div className="mb-12">
        {/* Slider Container */}
        <div className="relative overflow-hidden">
          <div 
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {features.map((feature, index) => (
              <div key={index} className="w-full flex-shrink-0 px-4">
                <div className={`${feature.bgColor} ${feature.textColor} rounded-2xl p-8 h-full`}>
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-sm opacity-80 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all z-10"
            aria-label="Previous feature"
          >
            <ChevronLeft className="w-5 h-5 text-gray-800" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all z-10"
            aria-label="Next feature"
          >
            <ChevronRight className="w-5 h-5 text-gray-800" />
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center mt-6 space-x-2">
          {features.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-gray-800 w-8' 
                  : 'bg-gray-300'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    );
  }

  // Desktop View (Same as before)
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
      {features.map((feature, index) => (
        <div key={index} className={`${feature.bgColor} ${feature.textColor} rounded-2xl p-8`}>
          <div className="mb-4">{feature.icon}</div>
          <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
          <p className="text-sm opacity-80 leading-relaxed">{feature.description}</p>
        </div>
      ))}
    </div>
  );
}