# BMI/BMR Calculator & Diet Generation Implementation Plan

## Overview
Add comprehensive BMI/BMR calculator and personalized diet generation system to the Neutrion Diet app.

## Information Gathered
- Current app structure with React/TypeScript and Tailwind CSS
- Dashboard system with sidebar navigation already implemented
- Existing UI components (shadcn/ui) available
- App focuses on personalized diet plans and health tracking
- Current header has "Our Dishes" navigation item

## Plan

### Phase 1: Create BMI/BMR Calculator Components
1. **Create BMI_Calculator Component** (`src/app/components/dashboard/BMI_Calculator.tsx`)
   - Input fields: height (cm/ft), weight (kg/lbs), age, gender
   - Real-time BMI calculation and display
   - BMI category classification (Underweight, Normal, Overweight, Obese)
   - BMR calculation using Mifflin-St Jeor equation
   - Disease/condition text input section
   - Form validation and error handling

2. **Create Diet_Generator Component** (`src/app/components/dashboard/Diet_Generator.tsx`)
   - Takes BMI, BMR, and personal data as input
   - Generates personalized meal plans based on:
     - BMI category
     - BMR calorie needs
     - Dietary restrictions
     - Medical conditions
     - Activity level
   - Displays recommended daily calories
   - Shows suggested food categories and portions

3. **Create Health_Profile Component** (`src/app/components/dashboard/Health_Profile.tsx`)
   - Comprehensive user health data form
   - Integration of BMI calculator
   - Diet history and preferences
   - Goal setting (weight loss, gain, maintenance)

### Phase 2: Update Navigation & Dashboard
4. **Update Sidebar Navigation** (`src/app/components/dashboard/Sidebar.tsx`)
   - Add "BMI Calculator" menu item
   - Add "Diet Generator" menu item
   - Add "Health Profile" menu item
   - Update dashboard routing

5. **Update Dashboard Layout** (`src/app/components/Dashboard.tsx`)
   - Add state management for different views
   - Implement view switching between BMI Calculator, Diet Generator, and Health Profile

### Phase 3: Backend Logic & Utilities
6. **Create Utility Functions** (`src/utils/healthCalculations.ts`)
   - BMI calculation functions
   - BMR calculation functions (Mifflin-St Jeor equation)
   - Calorie needs based on activity level
   - Diet recommendations based on BMI categories
   - Food database integration

7. **Create Types** (`src/types/health.ts`)
   - Type definitions for health data
   - BMI categories and recommendations
   - Diet plan interfaces

### Phase 4: UI/UX Enhancements
8. **Update Header** (`src/app/components/Header.tsx`)
   - Ensure "Our Dishes" navigation is prominent
   - Add health metrics quick access

9. **Create Responsive Components**
   - Mobile-friendly forms
   - Interactive charts for BMI trends
   - Visual diet recommendations

### Phase 5: Integration & Testing
10. **Update Main App** (`src/app/App.tsx`)
    - Ensure dashboard navigation works correctly
    - Add health data persistence (localStorage)

## Features to Implement

### BMI Calculator Features:
- Height input (cm/ft+in conversion)
- Weight input (kg/lbs conversion)
- Age and gender selection
- Real-time BMI calculation
- BMI category display with color coding
- BMR calculation with activity level multiplier
- Save results to user profile

### Diet Generator Features:
- Personalized meal suggestions based on BMI
- Calorie recommendations
- Macro distribution (protein, carbs, fats)
- Food allergy and preference considerations
- Meal timing suggestions
- Shopping list generation

### Disease/Condition Support:
- Text input for medical conditions
- Dietary restriction options
- Medication considerations
- Special dietary needs (diabetic, hypertensive, etc.)

## Technical Implementation:
- React Hooks for state management
- TypeScript for type safety
- Tailwind CSS for styling
- Local storage for data persistence
- Form validation with proper error handling
- Responsive design for all screen sizes

## Followup Steps:
1. Install any additional dependencies if needed
2. Test BMI calculations with known values
3. Validate diet recommendations
4. Ensure mobile responsiveness
5. Add data persistence functionality
6. Test integration with existing dashboard

## Success Criteria:
- Accurate BMI and BMR calculations
- Personalized diet recommendations
- Clean, responsive UI
- Seamless integration with existing app
- Support for various health conditions and dietary needs
