# TODO: Display Personalized Diet Data from PDF in Sidebar

## Task
Display personalized diet data from the PDF (uploaded by dietitian) in the sidebar for quick access.

## Implementation Steps

### Backend Changes
- [x] 1. Add `getSidebarDietSummary` endpoint in HealthController.js
- [x] 2. Add route for sidebar diet summary in health.js

### Frontend Changes  
- [x] 3. Add `getSidebarDietSummary` API method in api.ts
- [x] 4. Update Sidebar.tsx to display diet summary section

## Implementation Details

### 1. Backend Endpoint (getSidebarDietSummary)
Returns:
- hasDietPlan: boolean
- dietPlanName: string
- lastUpdated: string (formatted date)
- nutritionTargets: { calories, protein, carbs, fat, fiber }
- todayCalories: number (from meal activities)
- targetCalories: number
- nextMeal: { mealType, time } or null

### 2. Frontend Sidebar Component
Display a card in sidebar showing:
- Diet plan status (ready/awaiting)
- Today's calorie progress
- Next meal reminder
- Quick link to full diet plan

## Files Modified
- `Backend/controllers/HealthController.js`
- `Backend/routes/health.js`
- `frontend/src/services/api.ts`
- `frontend/src/app/components/dashboard/Sidebar.tsx`

## API Response Format
```
GET /api/health/sidebar-diet-summary/:userId

{
  "success": true,
  "data": {
    "date": "2025-01-20",
    "userId": 1,
    "dietPlan": {
      "hasPlan": true,
      "planName": "Weight Loss Plan",
      "goals": ["Lose 5kg", "Eat more protein"]
    },
    "nutritionTargets": {
      "calories": "1800 kcal",
      "protein": "75g",
      "carbs": "150g",
      "fats": "35-40g",
      "fiber": "25-30g"
    },
    "todaySchedule": [
      {
        "time": "07:00",
        "mealType": "breakfast",
        "title": "Oatmeal with Berries",
        "options": [...],
        "tips": "Add protein powder for extra protein"
      }
    ],
    "loggedMeals": [...],
    "calories": {
      "target": 1800,
      "consumed": 450,
      "remaining": 1350,
      "compliance": 25
    },
    "macros": {...},
    "mealsProgress": {
      "completed": 1,
      "total": 5,
      "percentage": 20
    },
    "weight": 75.5
  }
}
```

