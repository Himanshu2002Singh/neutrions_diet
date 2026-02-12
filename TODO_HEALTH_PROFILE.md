# Health Profile - Medical Documents Implementation

## Task: Add Medical Documents Upload Section Below Medical Information

### Status: COMPLETED ✓

---

## Plan

### Changes to make in `frontend/src/app/components/dashboard/Health_Profile.tsx`:

1. **Remove** the medical document upload section from inside the Status Card (currently only visible when `dietStatus.status === 'approved'`)

2. **Add** a new standalone Medical Documents card below the Medical Information section

3. **Make it visible** when `dietStatus?.profileFilled` is true (not only when diet is approved)

---

## Implementation Steps

- [x] 1. Remove medical documents section from Status Card
- [x] 2. Add new Medical Documents Card after the "Medical Information" section (after the allergies textarea)
- [x] 3. Update visibility condition to check `dietStatus?.profileFilled`
- [x] 4. Test the implementation

---

## Technical Details

### Backend Already Has:
- Route: `POST /api/health/medical-documents/upload`
- Route: `GET /api/health/medical-documents/:userId`
- Route: `GET /api/health/medical-documents/download/:fileId`
- Route: `DELETE /api/health/medical-documents/:fileId`
- Model: `MedicalDocument`
- API Service methods in `frontend/src/services/api.ts`

### Current UI State:
- Upload functionality exists but is hidden inside the Status Card
- Only visible when diet plan is "approved"

### New UI State:
- New dedicated card titled "Medical Documents"
- Located below the Medical Information form
- Visible once health profile is filled
- Upload button, document list, download/delete actions

