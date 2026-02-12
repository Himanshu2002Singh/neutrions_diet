# Health Profile & Medical Documents Implementation

## Backend Changes ✅ COMPLETED

### 1. MedicalDocument Model ✅
- File: `Backend/models/MedicalDocument.js`
- Created with fields: id, userId, fileName, originalName, filePath, fileSize, mimeType, documentType, description, isActive

### 2. Migration Scripts ✅
- SQL: `Backend/scripts/migrations/create-medical-documents-table.sql`
- JS: `Backend/scripts/migrations/create-medical-documents-table.js`

### 3. Model Index Updated ✅
- File: `Backend/models/index.js`
- Added MedicalDocument import and associations

### 4. Controller Methods Added ✅
- File: `Backend/controllers/HealthController.js`
  - `uploadMedicalDocument` - Upload medical documents
  - `getMedicalDocuments` - Get user's documents
  - `downloadMedicalDocument` - Download document
  - `deleteMedicalDocument` - Delete document (soft delete)
  - `getDietStatus` - Get diet plan status for health profile page

### 5. Routes Added ✅
- File: `Backend/routes/health.js`
  - `POST /api/health/medical-documents/upload` - Upload document
  - `GET /api/health/medical-documents/:userId` - Get documents
  - `GET /api/health/medical-documents/download/:fileId` - Download
  - `DELETE /api/health/medical-documents/:fileId` - Delete
  - `GET /api/health/diet-status/:userId` - Get diet status

---

## Frontend Changes ✅ COMPLETED

### 1. API Service Updated ✅
- File: `frontend/src/services/api.ts`
  - `getDietStatus()` - Get diet plan status
  - `uploadMedicalDocument()` - Upload medical documents
  - `getMedicalDocuments()` - Get user's documents
  - `downloadMedicalDocument()` - Download document
  - `deleteMedicalDocument()` - Delete document

### 2. Health Profile Component Updated ✅
- File: `frontend/src/app/components/dashboard/Health_Profile.tsx`
  - **Status Card**: Shows at top when profile is filled
    - Shows profile completion status
    - Shows dietitian assignment status
    - Shows diet plan status (Pending/Approved)
    - Shows assigned dietitian info
  
  - **Conditional Display**:
    - If NOT filled → Show form + "Please fill your profile" badge
    - If filled → Show status card at top + form below
  
  - **Medical Upload Section** (only when diet is approved):
    - Upload form with document type selector
    - Document list with view/download/delete options
    - Supported types: Lab Report, Prescription, Medical Certificate, Diet History, Other

---

## Database Tables ✅

### medical_documents
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| user_id | INTEGER | User ID (FK to users) |
| file_name | VARCHAR | Stored filename |
| original_name | VARCHAR | Original filename |
| file_path | VARCHAR | File path on server |
| file_size | INTEGER | File size in bytes |
| mime_type | VARCHAR | MIME type |
| document_type | ENUM | lab_report, prescription, etc. |
| description | TEXT | Optional description |
| is_active | BOOLEAN | Soft delete flag |
| created_at | DATETIME | Creation timestamp |
| updated_at | DATETIME | Update timestamp |

---

## Status Flow ✅

1. **Profile Not Filled**: Show form + "Please fill your profile" badge
2. **Profile Filled + No Dietitian**: Status shows "Waiting for dietitian assignment" (orange)
3. **Profile Filled + Dietitian Assigned + No Diet Plan**: Status shows "Diet plan being prepared" (blue)
4. **Profile Filled + Diet Plan Approved**: Status shows "Your diet plan is ready!" (green) + Medical Document Upload section

---

## Document Types ✅
- lab_report
- prescription
- medical_certificate
- diet_history
- other

---

## Next Steps (Run after deployment)

1. **Run the migration**:
   ```bash
   cd Backend
   node scripts/migrations/create-medical-documents-table.js
   ```

2. **Restart the backend server**

3. **Test the features**:
   - Fill health profile
   - Check status card appears
   - Upload a medical document (PDF/Image)
   - Verify document appears in list
   - Test download/delete functionality

---

## API Endpoints Summary

### Diet Status
```
GET /api/health/diet-status/:userId
Response:
{
  "success": true,
  "data": {
    "userId": 1,
    "profileFilled": true,
    "assigned": true,
    "dietPlanExists": true,
    "status": "approved",
    "statusText": "Your diet plan is ready!",
    "statusColor": "green",
    "assignedDietician": { ... },
    "healthProfile": { ... }
  }
}
```

### Medical Documents
```
POST /api/health/medical-documents/upload
GET /api/health/medical-documents/:userId
GET /api/health/medical-documents/download/:fileId
DELETE /api/health/medical-documents/:fileId
```

