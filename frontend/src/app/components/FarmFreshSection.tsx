import { ArrowRight } from 'lucide-react';


export function FarmFreshSection() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12 items-center">
      <div className="order-2 lg:order-1">
        <p className="text-sm mb-4 opacity-70">AI-Powered Nutrition</p>
        <h2 className="text-3xl lg:text-5xl font-bold mb-6 leading-tight">
          Personalized Health with
          <span className="text-[#FF6B4A]"> AI Coach</span>
          <br />
          <span className="text-[#FF6B4A]">Ria</span>
        </h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Get diet recommendations based on your medical conditions, body type, and goals. 
          Our AI Coach Ria provides personalized meal suggestions, calorie goals, and motivational reminders 
          to keep you on track with your health journey.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button className="bg-[#FF6B4A] text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity">
            Start Your Journey
            <ArrowRight className="w-5 h-5" />
          </button>
          <button className="bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors">
            Learn More
          </button>
        </div>
      </div>
      <div className="relative order-1 lg:order-2">
        <img
          src="/images/104e13361b3dd1b9ae5861386ceabb1886ce2692.png"
          alt="Personalized nutrition coaching"
          className="w-full h-[300px] lg:h-[400px] object-cover rounded-2xl"
        />
        <div className="absolute top-4 right-4 bg-white rounded-xl p-3 shadow-lg">
          <div className="text-sm font-semibold">AI Coach Ria</div>
          <div className="text-xs text-gray-600">Always here to help</div>
        </div>
      </div>
    </section>
  );
}
