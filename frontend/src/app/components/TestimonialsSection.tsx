import { ArrowRight } from 'lucide-react';

export function TestimonialsSection() {

  const testimonials = [
    {
      text: "The AI Coach Ria is incredible! It understood my diabetes condition and created the perfect meal plan. My blood sugar levels have improved significantly.",
      bgColor: 'bg-[#C5E17A]',
      name: "Sarah M.",
      role: "Diabetes Management",
    },
    {
      text: "I've lost 15 pounds in 2 months with the personalized diet plans. The weekly check-ins with my dietitian keep me motivated and on track.",
      bgColor: 'bg-[#FFC878]',
      name: "Michael R.",
      role: "Weight Loss Journey",
    },
    {
      text: "The progress tracking feature is amazing! I can see exactly how my nutrition goals are being met and my fitness milestones.",
      bgColor: 'bg-white',
      name: "Emily K.",
      role: "Fitness Enthusiast",
    },
    {
      text: "As a busy professional, the AI reminders and meal suggestions have been game-changers. I finally have a sustainable healthy routine.",
      bgColor: 'bg-[#CE93D8]',
      name: "David L.",
      role: "Busy Professional",
    },
  ];

  return (
    <section className="mb-12">

      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end mb-8 gap-4">
        <div>
          <p className="text-sm mb-2 opacity-70">Real Stories, Real Transformations</p>
          <h2 className="text-3xl lg:text-5xl font-bold">
            Success Stories from
            <br className="hidden lg:block" />
            <span className="text-[#FF6B4A]">Our Users</span>
          </h2>
        </div>
        <button className="bg-[#FF6B4A] text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity w-full lg:w-auto justify-center lg:justify-start">
          View All Reviews
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {testimonials.map((testimonial, index) => (
          <div key={index} className={`${testimonial.bgColor} border-2 border-gray-200 rounded-2xl p-6`}>
            <p className="text-sm leading-relaxed mb-4">{testimonial.text}</p>
            <div className="border-t border-gray-200 pt-4">
              <p className="font-semibold text-sm">{testimonial.name}</p>
              <p className="text-xs text-gray-600 opacity-80">{testimonial.role}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
