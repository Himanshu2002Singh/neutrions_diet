# TODO: Fix Hero Section Button to Show Login Modal

## Task Summary
The "Book a Dietitian" button in HeroSection should say "Generate Diet" and properly show the LoginModal instead of navigating to /login.

## Changes Required

### 1. Update HeroSection.tsx
- [x] Add new prop `onGenerateDietClick?: () => void`
- [x] Change button text from "Book a Dietitian" to "Generate Diet"
- [x] Update button to call `onGenerateDietClick` instead of `navigate("/login")`

### 2. Update App.tsx
- [x] Pass `onGenerateDietClick` prop to HeroSection
- [x] Implement handler that shows the login modal (using existing `setShowLoginModal(true)`)

## Status: ✅ COMPLETED

