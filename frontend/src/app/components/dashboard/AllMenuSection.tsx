import { useState } from 'react';
import { Filter, Grid3x3, List } from 'lucide-react';

export function AllMenuSection() {
  const [activeTab, setActiveTab] = useState('All');
  const tabs = ['All', 'Breakfast', 'Lunch', 'Snack', 'Dinner'];

  const menuItems = [
    {
      name: 'Avocado Toast with Poached Egg',
      image: 'https://images.unsplash.com/photo-1585819531730-06d1aba54ce1?w=400&h=300&fit=crop',
      category: 'Breakfast',
      difficulty: 'Easy',
      calories: 320,
      carbs: 30,
      protein: 14,
      fats: 18,
      healthScore: 9,
      categoryColor: 'bg-[#C5E17A]',
    },
    {
      name: 'Greek Salad with Grilled Chicken',
      image: 'https://images.unsplash.com/photo-1604909052743-94e838986d24?w=400&h=300&fit=crop',
      category: 'Lunch',
      difficulty: 'Medium',
      calories: 380,
      carbs: 25,
      protein: 35,
      fats: 16,
      healthScore: 8,
      categoryColor: 'bg-[#FFC878]',
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">All Menu</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Sort by:</span>
            <select className="border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[#C5E17A]">
              <option>Calories</option>
              <option>Health Score</option>
              <option>Prep Time</option>
            </select>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button className="p-2 hover:bg-white rounded transition-colors">
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button className="p-2 bg-white rounded shadow-sm transition-colors">
              <List className="w-4 h-4" />
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            <span className="text-sm">Filter</span>
          </button>
        </div>
      </div>
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-full text-sm transition-colors ${
              activeTab === tab
                ? 'bg-[#C5E17A] text-black font-semibold'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        {menuItems.map((item, index) => (
          <div key={index} className="flex items-center gap-6 p-4 border border-gray-200 rounded-2xl hover:shadow-md transition-shadow">
            <img
              src={item.image}
              alt={item.name}
              className="w-32 h-32 object-cover rounded-xl"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`${item.categoryColor} text-black text-xs px-3 py-1 rounded-full`}>
                  {item.category}
                </span>
                <span className="text-xs text-gray-500">• {item.difficulty}</span>
              </div>
              <h4 className="text-lg font-bold mb-3">{item.name}</h4>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <span>🔥 {item.calories} kcal</span>
                <span>🍞 {item.carbs}g carbs</span>
                <span>💪 {item.protein}g protein</span>
                <span>🥑 {item.fats}g fats</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Health Score</p>
                <div className="flex gap-1">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-6 rounded-full ${
                        i < item.healthScore ? 'bg-[#FFC878]' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <button className="bg-[#C5E17A] text-black px-6 py-2 rounded-lg hover:opacity-90 transition-opacity font-semibold">
                Add to Meal Plan
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
