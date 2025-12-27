import { Star, ChefHat, Clock, BarChart3, List, MoreVertical } from 'lucide-react';




const featuredImage = '/images/recipe.png';


export function FeaturedMenu() {
  return (
    <div className="bg-white rounded-2xl p-4 lg:p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg lg:text-xl font-bold">Featured Recipe</h3>
        <button className="p-2 hover:bg-gray-50 rounded-lg">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="relative">
          <img
            src={featuredImage}
            alt="Personalized AI Recipe"
            className="w-full h-[250px] lg:h-[280px] object-cover rounded-2xl"
          />
          <div className="absolute top-3 right-3 bg-[#C5E17A] text-black text-xs px-2 py-1 rounded-full font-semibold">
            AI Recommended
          </div>
        </div>
        <div>
          <h4 className="text-lg lg:text-2xl font-bold mb-3 lg:mb-4">
            AI-Powered Personalized Meal Plan
          </h4>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4 lg:mb-6">
            <span className="bg-[#FFC878] text-black text-xs px-3 py-1 rounded-full w-fit">
              Lunch
            </span>
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-4 h-4 fill-[#FFC878] text-[#FFC878]" />
              <span className="font-semibold">4.8/5</span>
              <span className="text-gray-500">(105 reviews)</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:gap-4 mb-4 lg:mb-6">
            <div className="flex items-center gap-2 lg:gap-3">
              <ChefHat className="w-4 h-4 lg:w-5 lg:h-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Difficulty</p>
                <p className="font-semibold text-sm lg:text-base">Medium</p>
              </div>
            </div>
            <div className="flex items-center gap-2 lg:gap-3">
              <BarChart3 className="w-4 h-4 lg:w-5 lg:h-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Health Score</p>
                <p className="font-semibold text-sm lg:text-base">85/100</p>
              </div>
            </div>
            <div className="flex items-center gap-2 lg:gap-3">
              <Clock className="w-4 h-4 lg:w-5 lg:h-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Prep Time</p>
                <p className="font-semibold text-sm lg:text-base">10 minutes</p>
              </div>
            </div>
            <div className="flex items-center gap-2 lg:gap-3">
              <List className="w-4 h-4 lg:w-5 lg:h-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Total Steps</p>
                <p className="font-semibold text-sm lg:text-base">4 steps</p>
              </div>
            </div>
          </div>
          <button className="w-full bg-[#C5E17A] text-black py-2 lg:py-3 rounded-xl hover:opacity-90 transition-opacity font-semibold text-sm lg:text-base">
            Add to Meal Plan
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
        <div className="bg-[#C5E17A] rounded-xl p-3 lg:p-4">
          <p className="text-xs text-gray-700 mb-1">Calories</p>
          <p className="text-lg lg:text-xl font-bold">450 kcal</p>
        </div>
        <div className="bg-[#FFA94D] rounded-xl p-3 lg:p-4">
          <p className="text-xs text-gray-700 mb-1">Carbs</p>
          <p className="text-lg lg:text-xl font-bold">40 gr</p>
        </div>
        <div className="bg-[#FF8A65] rounded-xl p-3 lg:p-4">
          <p className="text-xs text-gray-700 mb-1">Protein</p>
          <p className="text-lg lg:text-xl font-bold">35 gr</p>
        </div>
        <div className="bg-[#FFE082] rounded-xl p-3 lg:p-4">
          <p className="text-xs text-gray-700 mb-1">Fats</p>
          <p className="text-lg lg:text-xl font-bold">12 gr</p>
        </div>
      </div>
    </div>
  );
}
