import { Plus } from 'lucide-react';

export function BenefitsSection() {

  const benefits = [
    {
      title: 'Personalized Nutrition',
      description: 'AI analyzes your medical conditions, body type, and goals to create custom diet plans',
      isHighlighted: true,
    },
    {
      title: 'Real-time Progress Tracking',
      description: 'Monitor weight, nutrition intake, and fitness milestones with detailed visual reports',
      isHighlighted: false,
    },
    {
      title: 'AI Coach Support',
      description: 'Get 24/7 guidance from AI Coach Ria with meal suggestions and motivational reminders',
      isHighlighted: false,
    },
    {
      title: 'Professional Dietitian Help',
      description: 'Weekly check-ins with assigned personal dietitian for dedicated support',
      isHighlighted: false,
    },
    {
      title: 'Flexible Workout Plans',
      description: 'Goal-based fitness routines for both home and gym environments',
      isHighlighted: false,
    },
  ];


  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12 items-center">
      <div className="relative order-2 lg:order-1">
        <img
          src="/images/whyNutrition.jpg"
          alt="Personalized health benefits"
          className="w-full h-[300px] lg:h-[500px] object-cover rounded-2xl"
        />
        <div className="absolute bottom-4 left-4 bg-white rounded-xl p-3 shadow-lg">
          <div className="text-sm font-semibold">Real Results</div>
          <div className="text-xs text-gray-600">AI-Powered Insights</div>
        </div>
      </div>
      <div className="order-1 lg:order-2">
        <p className="text-sm mb-4 opacity-70">Your Health, Our Priority</p>
        <h2 className="text-3xl lg:text-5xl font-bold mb-6 lg:mb-8 leading-tight">
          Why Choose
          <br className="hidden lg:block" />
          <span className="text-[#FF6B4A]">Nutreazy</span>
        </h2>
        <div className="space-y-3 lg:space-y-4">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className={`${
                benefit.isHighlighted ? 'bg-[#C5E17A]' : 'bg-white border-2 border-gray-200'
              } rounded-xl p-4 lg:p-5 flex items-start justify-between gap-4`}
            >
              <div className="flex-1">
                <h3 className="font-bold text-base lg:text-lg mb-1">{benefit.title}</h3>
                {benefit.isHighlighted && (
                  <p className="text-sm opacity-80 leading-relaxed">{benefit.description}</p>
                )}
                {!benefit.isHighlighted && (
                  <p className="text-xs lg:text-sm text-gray-600 opacity-80">{benefit.description}</p>
                )}
              </div>
              <button className="text-xl lg:text-2xl font-bold shrink-0 text-[#FF6B4A]">
                {benefit.isHighlighted ? '✓' : '+'}
              </button>
            </div>
          ))}
        </div>
        <button className="mt-6 bg-[#FF6B4A] text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity">
          Start Your Transformation
        </button>
      </div>
    </section>
  );
}
