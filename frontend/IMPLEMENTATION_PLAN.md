# Neutrion Diet App - Feature Implementation Plan

## Current Status
- ✅ Basic dashboard with menu display
- ✅ Navigation sidebar with placeholder items
- ✅ Responsive layout structure
- ✅ Hero section and marketing pages

## Features to Implement

### 1. Personalized Diet Plans
**Components needed:**
- `PersonalizedDiet.tsx` - Main personalized diet page
- `HealthProfile.tsx` - Form for medical conditions, body type, goals
- `DietRecommendation.tsx` - Display personalized recommendations
- `GoalSetting.tsx` - Set and track diet goals

**Data Structure:**
```typescript
interface UserProfile {
  id: string;
  name: string;
  age: number;
  height: number;
  weight: number;
  bodyType: 'ectomorph' | 'mesomorph' | 'endomorph';
  medicalConditions: string[];
  goals: string[];
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active';
  dietaryPreferences: string[];
  dailyRoutine: string;
}
```

### 2. Progress Monitoring/Tracking
**Components needed:**
- `ProgressTracking.tsx` - Main progress dashboard
- `WeightChart.tsx` - Weight tracking visualization
- `NutritionSummary.tsx` - Daily/weekly nutrition overview
- `AchievementBadges.tsx` - Milestone celebrations

**Data Structure:**
```typescript
interface ProgressEntry {
  date: string;
  weight: number;
  bodyFat?: number;
  measurements: {
    waist: number;
    chest: number;
    arms: number;
  };
  caloriesConsumed: number;
  caloriesBurned: number;
  waterIntake: number;
  steps: number;
}

interface NutritionLog {
  date: string;
  meals: {
    breakfast: MealEntry[];
    lunch: MealEntry[];
    dinner: MealEntry[];
    snacks: MealEntry[];
  };
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
}
```

### 3. AI Coach (Ria)
**Components needed:**
- `AICoach.tsx` - Main AI coach interface
- `ChatInterface.tsx` - Chat with Ria
- `MealSuggestions.tsx` - AI-generated meal recommendations
- `ReminderSettings.tsx` - Personalized reminders
- `CalorieGoals.tsx` - Dynamic calorie target setting

**Features:**
- Conversational AI interface
- Personalized meal suggestions based on preferences
- Adaptive calorie goals
- Motivational messages and reminders
- Progress-based recommendations

### 4. Personal Diet & Workout Plans
**Components needed:**
- `WorkoutPlans.tsx` - Main workout planning page
- `ExerciseLibrary.tsx` - Available exercises
- `WorkoutScheduler.tsx` - Schedule workouts
- `HomeWorkouts.tsx` - No-equipment routines
- `GymWorkouts.tsx` - Gym-based routines

**Data Structure:**
```typescript
interface WorkoutPlan {
  id: string;
  name: string;
  type: 'home' | 'gym' | 'mixed';
  duration: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  exercises: Exercise[];
  schedule: string[]; // days of week
  goals: string[];
}

interface Exercise {
  id: string;
  name: string;
  category: string;
  equipment: string[];
  instructions: string[];
  duration?: number; // for time-based exercises
  reps?: number;
  sets?: number;
  restTime: number;
}
```

### 5. 1-on-1 Dietitian Support
**Components needed:**
- `DietitianSupport.tsx` - Main support page
- `CoachAssignment.tsx` - Assign personal coach
- `WeeklyCheckIn.tsx` - Weekly progress review
- `MessageCoach.tsx` - Communication with coach
- `SessionHistory.tsx` - Past check-ins and feedback

**Data Structure:**
```typescript
interface DietitianProfile {
  id: string;
  name: string;
  specialties: string[];
  experience: number;
  rating: number;
  availability: string[];
  languages: string[];
  photo: string;
}

interface CoachingSession {
  id: string;
  date: string;
  type: 'weekly-checkin' | 'emergency' | 'planned';
  duration: number;
  coachId: string;
  notes: string;
  actionItems: string[];
  nextSessionDate?: string;
}
```

## Implementation Steps

### Phase 1: Core Infrastructure
1. Create type definitions and interfaces
2. Set up routing for new pages
3. Update navigation sidebar with proper routing
4. Create basic page layouts

### Phase 2: Data Management
1. Create mock data for development
2. Implement local storage for persistence
3. Create data service utilities

### Phase 3: Feature Implementation
1. Personalized Diet Plans
2. Progress Tracking
3. AI Coach Interface
4. Workout Plans
5. Dietitian Support

### Phase 4: UI/UX Polish
1. Consistent styling and theming
2. Loading states and error handling
3. Responsive design improvements
4. Accessibility enhancements

## File Structure Updates
```
src/
├── components/
│   ├── dashboard/
│   │   ├── PersonalizedDiet.tsx
│   │   ├── ProgressTracking.tsx
│   │   ├── AICoach.tsx
│   │   ├── WorkoutPlans.tsx
│   │   └── DietitianSupport.tsx
│   ├── forms/
│   │   ├── HealthProfile.tsx
│   │   ├── GoalSetting.tsx
│   │   └── ReminderSettings.tsx
│   ├── charts/
│   │   ├── WeightChart.tsx
│   │   └── NutritionChart.tsx
│   └── common/
│       ├── ChatInterface.tsx
│       └── LoadingSpinner.tsx
├── types/
│   ├── user.ts
│   ├── nutrition.ts
│   └── fitness.ts
├── services/
│   ├── dataService.ts
│   ├── aiCoach.ts
│   └── progressTracker.ts
└── data/
    ├── mockUsers.ts
    ├── mockWorkouts.ts
    └── mockCoaches.ts
```

## Next Steps
1. Confirm implementation priority with user
2. Begin with Phase 1 - Core Infrastructure
3. Create and test each feature incrementally
4. Gather feedback and iterate
