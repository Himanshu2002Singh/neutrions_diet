# Doctor Panel Login Implementation - TODO

## Files Created ✅
- [x] 1. Create `doctor-panel/src/types/index.ts` - Auth types
- [x] 2. Create `doctor-panel/src/services/api.ts` - API service
- [x] 3. Create `doctor-panel/src/components/Login.tsx` - Login page
- [x] 4. Update `doctor-panel/src/App.tsx` - Add auth state and conditional rendering
- [x] 5. Update `doctor-panel/src/components/Header.tsx` - Add logout and admin name

## Implementation Details
- Login with email/password to `/api/admin/login`
- Only users with `role: 'member'` can login
- JWT token stored in localStorage
- On successful login, show dashboard
- On logout, clear token and show login page

## Backend API
- POST `/api/admin/login` - Authenticate admin/member
- Returns token and admin info with role

## To Test
1. Start the backend server on port 3001
2. Start the doctor-panel with `npm run dev`
3. Open http://localhost:5173
4. You should see the login page
5. Enter credentials for a user with `role: 'member'`
6. After login, you should see the dashboard

