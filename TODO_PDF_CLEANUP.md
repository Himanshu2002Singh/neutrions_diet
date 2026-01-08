# TODO: Fix PDF File Cleanup Logic

## Objective
Ensure PDF files uploaded for diet plan parsing are properly cleaned up in ALL scenarios (success and error cases).

## Tasks

### 1. Update pdfExtractionService.js
- [x] Add helper function `cleanupFile(filePath)` with error-safe handling
- [x] Modify `parseDietPlanPDF()` to clean up PDF file after successful text extraction
- [x] Ensure cleanup failures are logged as warnings, not thrown as errors

### 2. Update HealthController.js
- [x] Remove duplicate cleanup code from `uploadAndParseDietPDF` success path (service now handles it)
- [x] Add cleanup in catch block as safety net for any service failures
- [x] Ensure cleanup uses same error-safe helper function

### 3. Test the changes
- [ ] Verify cleanup works on successful upload
- [ ] Verify cleanup works when PDF parsing fails
- [ ] Verify cleanup works when database save fails

