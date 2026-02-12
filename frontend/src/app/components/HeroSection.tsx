import { useState } from 'react';
import { Star, ArrowRight, Plus } from 'lucide-react';
import { HealthFormModal } from './HealthFormModal';


import { useNavigate } from "react-router-dom";


const heroImage = '/images/doctorImage.jpg';

interface HeroSectionProps {
  onHealthProfileComplete?: (data: {
    weight: number;
    height: number;
    age: number;
    gender: string;
    activityLevel: string;
    medicalConditions: string;
    goals: string;
    bmiCalculation: any;
  }) => void;
  onBookDietitian?: (data: {
    weight: number;
    height: number;
    age: number;
    gender: string;
    activityLevel: string;
    medicalConditions: string;
    goals: string;
    bmiCalculation: any;
  }) => void;
  onGenerateDietClick?: () => void;
}

export function HeroSection({ onHealthProfileComplete, onBookDietitian, onGenerateDietClick }: HeroSectionProps) {
  const [showHealthForm, setShowHealthForm] = useState(false);
  const [actionType, setActionType] = useState<'diet' | 'dietitian'>('diet');
    const navigate = useNavigate();


  const handleHealthFormSubmit = (data: any) => {
    setShowHealthForm(false);
    
    if (actionType === 'diet' && onHealthProfileComplete) {
      onHealthProfileComplete(data);
    } else if (actionType === 'dietitian' && onBookDietitian) {
      onBookDietitian(data);
    }
  };

  return (
    <section className="bg-[#FFF8E8] rounded-2xl p-6 lg:p-12 mb-8 relative overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">


        <div className="order-2 lg:order-1">
          <p className="text-sm mb-3 lg:mb-4 opacity-70">Neutrion Diet – Your Personal Health Partner</p>
          <h2 className="text-3xl lg:text-6xl font-bold mb-4 lg:mb-6 leading-tight">
            Personalized nutrition with{' '}
            <span className="inline-flex items-center justify-center bg-[#FF6B4A] text-white rounded-full w-8 h-8 lg:w-12 lg:h-12 mx-1 lg:mx-2">
              <Leaf className="w-4 h-4 lg:w-6 lg:h-6" />
            </span>{' '}
            Personalized Coach
          </h2>
          <p className="text-gray-600 mb-6 lg:mb-8 max-w-lg text-sm lg:text-base leading-relaxed">
            Get personalized diet plans based on your medical conditions, body type & goals. Track progress, chat with AI coach Ria, and get 1-on-1 dietitian support.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 mb-8 lg:mb-12">
         
<button
      onClick={onGenerateDietClick}
      className="bg-[#FF6B4A] text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity text-sm lg:text-base"
    >
      Generate Diet
      <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5" />
    </button>
          
          </div>
          <div className="flex items-end gap-2 lg:gap-3">
            <div className="text-3xl lg:text-5xl font-bold">4.9</div>
            <div>
              <div className="flex gap-1 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 lg:w-4 lg:h-4 fill-[#FF6B4A] text-[#FF6B4A]" />
                ))}
              </div>
              <p className="text-xs lg:text-sm text-gray-600">Customers Reviews</p>
            </div>
          </div>
        </div>

        <div className="relative order-1 lg:order-2">
          {/* <div className="absolute top-4 lg:top-8 left-4 lg:left-0 bg-white rounded-2xl p-3 lg:p-4 shadow-lg z-10 max-w-[140px] lg:max-w-[180px]">
            <div className="flex gap-2 lg:gap-3">
              <img
                src="https://images.unsplash.com/photo-1624340209404-4f479dd59708?w=80&h=80&fit=crop"
                alt="Healthy Salad"
                className="w-12 h-12 lg:w-20 lg:h-20 rounded-lg object-cover"
              />
              <div>
                <p className="font-semibold text-xs lg:text-sm mb-1">AI Meal Plan</p>
                <p className="text-xs lg:text-sm text-gray-600">Personalized</p>
                <button className="mt-1 lg:mt-2 bg-[#FF6B4A] text-white w-5 h-5 lg:w-6 lg:h-6 rounded flex items-center justify-center">
                  <Plus className="w-3 h-3 lg:w-4 lg:h-4" />
                </button>
              </div>
            </div>
          </div> */}
          <img
            src={heroImage}
            alt="AI-powered personalized nutrition"
            className="w-full h-[300px] lg:h-[500px] object-cover rounded-2xl"
          />
        </div>
      </div>

      {/* Health Form Modal */}
          <HealthFormModal
            isOpen={showHealthForm}
            onClose={() => setShowHealthForm(false)}
            onSubmit={handleHealthFormSubmit}
            purpose={actionType}
          />
    </section>
  );
}

function Leaf({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}