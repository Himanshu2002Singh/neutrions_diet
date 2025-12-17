
import { User, TrendingUp, MessageCircle, Dumbbell, Users } from 'lucide-react';

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
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Progress Monitoring',
      description: 'Track your weight, nutrition intake, and fitness milestones. Monitor your health journey with detailed progress reports and achievements.',
      bgColor: 'bg-[#FFC878]',
      textColor: 'text-black',
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: 'AI Coach Ria',
      description: 'Chat with AI coach Ria for personalized meal suggestions, calorie goals, and motivational reminders tailored to your lifestyle.',
      bgColor: 'bg-[#FF8A65]',
      textColor: 'text-white',
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

function ChefHat({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
      <line x1="6" x2="18" y1="17" y2="17" />
    </svg>
  );
}
