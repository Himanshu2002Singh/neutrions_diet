# TODO - Dashboard Fixes

## Issues to Fix
1. **Dashboard refresh bug**: When clicking sidebar items, page resets to dashboard on refresh
2. **Fetch all data from backend**:
   - User info (name, email, avatar, phone, location, joined date)
   - Assigned doctor/dietitian info
   - Health profile (weight, height, BMI, medical conditions, goals, target weight)
   - Current diet plan (goals like weight loss, maintenance, etc.)
   - Diet tracking progress from backend

## Plan

### Step 1: Create Dashboard API Service
- Add new API endpoints for fetching all dashboard data in one call

### Step 2: Update Backend
- Add endpoint to get user's assignment status with doctor info
- Add endpoint to get user's current diet plan with progress

### Step 3: Fix Dashboard Component
- Fix sidebar navigation to update URL
- Fetch all data from backend on mount
- Handle no assigned doctor case
- Show medical conditions and goals from health profile

### Step 4: Update DashboardHome Component
- Replace mock data with API calls
- Show actual doctor info or "No assigned doctor"
- Show actual health profile data
- Show diet tracking progress

## Implementation Steps

- [ ] 1. Create API endpoints for dashboard data
- [ ] 2. Fix Sidebar navigation to use react-router
- [ ] 3. Update DashboardHome to fetch data from backend
- [ ] 4. Handle no assigned doctor case
- [ ] 5. Show medical conditions and goals from health profile
- [ ] 6. Show diet tracking progress from DailyMealActivity

