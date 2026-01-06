# Dashboard Enhancement Plan

## Tasks to Complete:

### 1. Create New Dashboard Home Page (DashboardHome.tsx)
- User profile card with name, email, avatar
- Assigned doctor/dietitian info card
- Diet analysis chart (progress chart)
- Current plan information
- Quick stats overview

### 2. Update Sidebar
- Remove "Weekly Check-ins" from sidebar
- Keep other items as is

### 3. Update Dashboard.tsx
- Set default view to show DashboardHome
- Remove AllMenuSection and FeaturedMenu imports
- Keep referrals support

### 4. Create Health Insights Page (HealthInsights.tsx)
- Dynamic health tips
- Health scores display
- Exercise tips
- Diet recommendations

### 5. Create Dietitian Support with Chat (DietitianSupport.tsx)
- Show assigned dietitian info (name, experience)
- Chat interface for messaging only
- Message history

### 6. Update App.tsx
- Remove "Weekly Check-ins" route
- Add "Health Insights" route using Dashboard with defaultView
- Add "Dietitian Support" route using Dashboard with defaultView

## Progress:
- [ ] Create/update DashboardHome.tsx
- [ ] Update Sidebar.tsx
- [ ] Update Dashboard.tsx
- [ ] Create HealthInsights.tsx
- [ ] Create DietitianSupport.tsx with chat
- [ ] Update App.tsx
- [ ] Test the build

