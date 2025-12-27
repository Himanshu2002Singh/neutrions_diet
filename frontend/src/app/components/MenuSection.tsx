import { ArrowRight } from 'lucide-react';

export function MenuSection() {

  const dishes = [
    {
      name: 'Personalized Meal Plan',
      description: 'AI-curated meals based on your medical conditions, body type, and dietary preferences',
      price: 'From $99/month',
      image: '/images/meal_planer.jpg',
      bgColor: 'bg-[#C5E17A]',
      badge: 'AI Powered',
    },
    {
      name: 'Progress Tracking',
      description: 'Detailed weight, nutrition, and fitness milestone tracking with visual charts',
      price: 'Free with plan',
      image: '/images/progressImage.png',
      bgColor: 'bg-[#FFC878]',
      badge: 'Popular',
    },
    {
      name: '1-on-1 Dietitian Support',
      description: 'Personal dietitian coach with weekly check-ins and customized recommendations',
      price: 'Add-on $49/month',
      image: '/images/1on1.jpg',
      bgColor: 'bg-[#CE93D8]',
      badge: 'Premium',
    },
  ];

  return (
    <section className="mb-12">

      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end mb-8 gap-4">
        <div>
          <p className="text-sm mb-2 opacity-70">Complete Health Solution</p>
          <h2 className="text-3xl lg:text-5xl font-bold">
            Your Personalized <span className="text-[#FF6B4A]">Health</span>
            <br className="hidden lg:block" />
            <span className="text-[#FF6B4A]">Journey</span>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dishes.map((dish, index) => (
          <div key={index} className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden">

            <div className={`${dish.bgColor} h-64 flex items-center justify-center p-6 relative`}>
              {dish.badge && (
                <div className="absolute top-3 right-3 bg-white text-black text-xs px-2 py-1 rounded-full font-semibold">
                  {dish.badge}
                </div>
              )}
              <img
                src={dish.image}
                alt={dish.name}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div className="p-6">
              <h3 className="text-lg lg:text-xl font-bold mb-2">{dish.name}</h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">{dish.description}</p>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <span className="text-lg lg:text-xl font-bold">{dish.price}</span>
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
