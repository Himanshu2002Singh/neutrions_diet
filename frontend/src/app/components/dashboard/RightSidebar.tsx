import { Star } from 'lucide-react';

export function RightSidebar() {
  const popularMenuItems = [
    {
      name: 'Greek Salad and Olive',
      image: 'https://images.unsplash.com/photo-1604909052743-94e838986d24?w=80&h=80&fit=crop',
      rating: 4.8,
    },
    {
      name: 'Blueberry Smoothie',
      image: 'https://images.unsplash.com/photo-1554495644-8ce87fe3e713?w=80&h=80&fit=crop',
      rating: 4.9,
    },
    {
      name: 'Grilled Salmon with Lemon',
      image: 'https://images.unsplash.com/photo-1624340209404-4f479dd59708?w=80&h=80&fit=crop',
      rating: 4.8,
    },
  ];

  const recommendedItems = [
    {
      name: 'Oatmeal and Berries',
      image: 'https://images.unsplash.com/photo-1602682822546-09bc5623461e?w=80&h=80&fit=crop',
      category: 'Breakfast',
      calories: 350,
      carbs: 45,
      categoryColor: 'bg-[#C5E17A]',
    },
    {
      name: 'Grilled Chicken with Avocado',
      image: 'https://images.unsplash.com/photo-1585819531730-06d1aba54ce1?w=80&h=80&fit=crop',
      category: 'Lunch',
      calories: 420,
      carbs: 32,
      categoryColor: 'bg-[#FFC878]',
    },
  ];

  return (
    <aside className="w-80 bg-white border-l border-gray-200 h-screen overflow-y-auto p-6 fixed right-0 top-0">
      <div className="mb-8">
        <h3 className="font-bold mb-4">Popular Menu</h3>
        <div className="space-y-4">
          {popularMenuItems.map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1">{item.name}</p>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-[#FFC878] text-[#FFC878]" />
                  <span className="text-xs font-semibold">{item.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-bold mb-4">Recommended Menu</h3>
        <div className="space-y-4">
          {recommendedItems.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="font-semibold text-sm mb-1">{item.name}</p>
                  <span className={`${item.categoryColor} text-black text-xs px-2 py-1 rounded-full`}>
                    {item.category}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>🔥 {item.calories} kcal</span>
                <span>🍞 {item.carbs}g</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
