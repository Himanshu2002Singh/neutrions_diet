# Simmi Ji Diet Plan Backend Implementation

## Goal
Implement backend functionality to parse and serve Simmi Ji's diet plan data from the database, allowing users to mark meals they've consumed with tick marks.

## Tasks Completed

### Phase 1: Database Model ✅
- [x] 1. Created `DietPlan` model (`Backend/models/DietPlan.js`)
- [x] 2. Created migration script (`Backend/scripts/migrations/create-diet-plans-table.sql`)
- [x] 3. Updated `models/index.js` to export DietPlan model

### Phase 2: Seed Simmi Ji's Diet Data ✅
- [x] 4. Created seed script (`Backend/scripts/seed-simmi-diet.js`)
- [x] 5. Includes complete diet plan with all meals and options

### Phase 3: Backend API Updates ✅
- [x] 6. Updated HealthController to fetch diet plan from database first
- [x] 7. Added date validation (current + previous 7 days only)
- [x] 8. Added new endpoint `POST /api/diet/save-plan`

## Files Created/Modified

### New Files:
1. `Backend/models/DietPlan.js` - DietPlan model definition
2. `Backend/scripts/migrations/create-diet-plans-table.sql` - SQL migration
3. `Backend/scripts/seed-simmi-diet.js` - Seed script with complete diet plan

### Modified Files:
1. `Backend/models/index.js` - Added DietPlan associations
2. `Backend/controllers/HealthController.js` - Added database fetching and saveDietPlan
3. `Backend/routes/health.js` - Added save-plan route

## How to Run

### 1. Run Database Migration
```bash
# Run the SQL migration directly in your database
psql -d your_database -f Backend/scripts/migrations/create-diet-plans-table.sql
```

Or let Sequelize sync it when the server starts.

### 2. Seed Simmi Ji's Diet Plan
```bash
node Backend/scripts/seed-simmi-diet.js
```

This will:
- Sync database tables
- Create test user (simmi.ji@test.com) if not exists
- Insert the complete diet plan

### 3. Test the API
```bash
# Get diet plan for user 1
curl http://localhost:3000/api/diet/personalized/1

# Save a meal activity
curl -X POST http://localhost:3000/api/health/meal-activity/save \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"date":"2024-01-15","mealType":"breakfast","selectedItems":["0","2"],"notes":"Test"}'

# Get meal activities for user 1 on a specific date
curl http://localhost:3000/api/health/meal-activity/1/2024-01-15
```

## Test User Credentials
- **Email:** simmi.ji@test.com
- **Password:** password123
- **User ID:** (shown after running seed script)

## Features Implemented

### Backend:
- ✅ DietPlan model with complete JSON structure
- ✅ Date validation (only current + previous 7 days)
- ✅ Fetch diet plan from database (fallback to generated)
- ✅ Save/Update diet plan endpoint
- ✅ Meal activity tracking

### Frontend (already implemented):
- ✅ Date picker with current + 7 days
- ✅ Tick marks on selected food items
- ✅ Calorie tracking and progress
- ✅ Save meal functionality
- ✅ Fetch and display saved activities

